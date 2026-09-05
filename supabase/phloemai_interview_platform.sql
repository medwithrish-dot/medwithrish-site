-- Run after phloemai_setup.sql and phloemai_security_patch.sql.
-- All paid AI mutations go through authenticated server routes and service-only RPCs.
begin;
create table if not exists public.interview_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('free','university','station','reference')),
  university_slug text,
  station_slug text not null,
  title text not null,
  status text not null default 'in_progress' check (status in ('in_progress','grading','completed','failed')),
  circuit_id uuid not null,
  station_index integer not null default 0 check (station_index >= 0),
  station_count integer not null default 1 check (station_count between 1 and 20),
  preparation_seconds integer not null check (preparation_seconds between 0 and 600),
  station_seconds integer not null check (station_seconds between 60 and 7200),
  break_seconds integer not null check (break_seconds between 0 and 1800),
  questions jsonb not null,
  answers jsonb not null default '[]',
  metrics jsonb not null default '{}',
  feedback jsonb,
  score numeric(4,1) check (score between 0 and 99),
  rubric_version text not null default 'why-medicine-v1',
  grading_tries integer not null default 0,
  grading_token uuid,
  grading_started_at timestamptz,
  last_error text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(user_id,circuit_id,station_index)
);
create index if not exists interview_attempts_user_time on public.interview_attempts(user_id,started_at desc);
create index if not exists interview_attempts_leaderboard on public.interview_attempts(score desc,completed_at) where mode='free' and status='completed';
alter table public.interview_attempts enable row level security;
revoke all on public.interview_attempts from anon,authenticated;
grant select on public.interview_attempts to authenticated;
grant all on public.interview_attempts to service_role;
drop policy if exists interview_attempts_owner_read on public.interview_attempts;
create policy interview_attempts_owner_read on public.interview_attempts for select to authenticated using(user_id=auth.uid());

create table if not exists public.interview_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 32),
  leaderboard_opt_in boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.interview_preferences enable row level security;
revoke all on public.interview_preferences from anon,authenticated;
grant select on public.interview_preferences to authenticated;
grant all on public.interview_preferences to service_role;
drop policy if exists interview_preferences_owner_read on public.interview_preferences;
create policy interview_preferences_owner_read on public.interview_preferences for select to authenticated using(user_id=auth.uid());

create or replace function public.reserve_interview_attempt(p_user uuid,p_payload jsonb,p_daily integer,p_monthly integer)
returns public.interview_attempts language plpgsql security definer set search_path=public as $$
declare v_row public.interview_attempts; v_count integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user::text,731));
  select * into v_row from public.interview_attempts where user_id=p_user and status='in_progress'
    and started_at > now()-interval '3 hours' order by started_at desc limit 1;
  if found then return v_row; end if;
  select * into v_row from public.interview_attempts where user_id=p_user and circuit_id=(p_payload->>'circuit_id')::uuid and station_index=(p_payload->>'station_index')::integer;
  if found then return v_row; end if;
  select count(*) into v_count from public.interview_attempts where user_id=p_user and started_at >= now()-interval '24 hours';
  if v_count >= p_daily then raise exception 'Daily interview limit reached. Try again tomorrow.'; end if;
  select count(*) into v_count from public.interview_attempts where user_id=p_user and started_at >= now()-interval '30 days';
  if v_count >= p_monthly then raise exception 'Monthly interview limit reached. Please try again later.'; end if;
  insert into public.interview_attempts(user_id,mode,university_slug,station_slug,title,circuit_id,station_index,station_count,preparation_seconds,station_seconds,break_seconds,questions)
  values(p_user,p_payload->>'mode',p_payload->>'university_slug',p_payload->>'station_slug',p_payload->>'title',(p_payload->>'circuit_id')::uuid,(p_payload->>'station_index')::integer,(p_payload->>'station_count')::integer,(p_payload->>'preparation_seconds')::integer,(p_payload->>'station_seconds')::integer,(p_payload->>'break_seconds')::integer,p_payload->'questions') returning * into v_row;
  return v_row;
end; $$;
revoke all on function public.reserve_interview_attempt(uuid,jsonb,integer,integer) from public,anon,authenticated;
grant execute on function public.reserve_interview_attempt(uuid,jsonb,integer,integer) to service_role;

create or replace function public.claim_interview_grading(p_user uuid,p_attempt uuid,p_token uuid)
returns public.interview_attempts language plpgsql security definer set search_path=public as $$
declare v_row public.interview_attempts;
begin
  select * into v_row from public.interview_attempts where id=p_attempt and user_id=p_user for update;
  if not found then raise exception 'Interview not found'; end if;
  if v_row.status='completed' then return v_row; end if;
  if (select count(*) from regexp_split_to_table(btrim((select string_agg(a->>'answer',' ') from jsonb_array_elements(v_row.answers) a)), '\s+') word where word <> '') < 20 then
    raise exception 'Save at least 20 words before requesting feedback.';
  end if;
  if v_row.last_error='abandoned' then raise exception 'This interview was ended. Start a new station.'; end if;
  if v_row.status='grading' and v_row.grading_started_at > now()-interval '90 seconds' then raise exception 'Feedback is already being generated. Please wait.'; end if;
  if v_row.grading_tries >= 3 then raise exception 'Feedback retry limit reached for this station. Your answers are saved.'; end if;
  update public.interview_attempts set status='grading',grading_token=p_token,grading_started_at=now(),grading_tries=grading_tries+1,last_error=null where id=p_attempt returning * into v_row;
  return v_row;
end; $$;
revoke all on function public.claim_interview_grading(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.claim_interview_grading(uuid,uuid,uuid) to service_role;

create or replace function public.interview_leaderboard()
returns table(rank bigint,display_name text,score numeric,completed_at timestamptz,is_you boolean)
language sql stable security definer set search_path=public as $$
  with best as (
    select distinct on(a.user_id) a.user_id,p.display_name,a.score,a.completed_at
    from public.interview_attempts a join public.interview_preferences p on p.user_id=a.user_id
    where p.leaderboard_opt_in and a.mode='free' and a.station_slug='why-medicine' and a.status='completed'
      and a.rubric_version='why-medicine-v1' and a.score is not null
    order by a.user_id,a.score desc,a.completed_at asc
  ) select row_number() over(order by best.score desc,best.completed_at asc),best.display_name,best.score,best.completed_at,best.user_id=auth.uid()
    from best order by best.score desc,best.completed_at asc limit 100;
$$;
revoke all on function public.interview_leaderboard() from public,anon;
grant execute on function public.interview_leaderboard() to authenticated,service_role;
commit;
