-- Apply after the existing interview migrations, before deploying dentistry routes.
-- No medicine content, attempts or progress is deleted or rewritten.
begin;
alter table public.interview_attempts add column if not exists platform text not null default 'medicine' check (platform in ('medicine','dentistry'));
create index if not exists interview_attempts_platform_history on public.interview_attempts(user_id,platform,started_at desc,id desc);
-- Preserve medicine's primary key and legacy ON CONFLICT(user_id) callers.
-- Reuse its validated profile shape with separate storage for dentistry plans.
create table if not exists public.interview_dentistry_preparation_profiles (
  like public.interview_preparation_profiles including defaults including constraints,
  primary key(user_id),
  foreign key(user_id) references auth.users(id) on delete cascade
);
alter table public.interview_dentistry_preparation_profiles enable row level security;
revoke all on public.interview_dentistry_preparation_profiles from public,anon,authenticated;
grant select on public.interview_dentistry_preparation_profiles to authenticated;
grant all on public.interview_dentistry_preparation_profiles to service_role;
drop policy if exists dentistry_preparation_owner_read on public.interview_dentistry_preparation_profiles;
create policy dentistry_preparation_owner_read on public.interview_dentistry_preparation_profiles
  for select to authenticated using(user_id=auth.uid());
-- IDs already separate question progress and daily activity; expose a derived, immutable scope.
alter table public.interview_question_progress add column if not exists platform text generated always as (case when question_id like 'dq-%' then 'dentistry' else 'medicine' end) stored;
alter table public.interview_daily_questions add column if not exists platform text generated always as (case when question_id like 'dq-%' then 'dentistry' else 'medicine' end) stored;
create or replace function public.reserve_interview_attempt(p_user uuid,p_payload jsonb,p_daily integer,p_monthly integer)
returns public.interview_attempts language plpgsql security definer set search_path=public as $$
declare v_row public.interview_attempts; v_count integer; v_platform text := coalesce(p_payload->>'platform','medicine');
begin
  if v_platform not in ('medicine','dentistry') then raise exception 'Invalid interview platform'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user::text,731));
  select * into v_row from public.interview_attempts where user_id=p_user and platform=v_platform and status='in_progress'
    and started_at > now()-interval '3 hours' order by started_at desc limit 1;
  if found then return v_row; end if;
  select * into v_row from public.interview_attempts where user_id=p_user and platform=v_platform and circuit_id=(p_payload->>'circuit_id')::uuid and station_index=(p_payload->>'station_index')::integer;
  if found then return v_row; end if;
  if p_payload->>'mode' = 'free' and exists (
    select 1 from public.interview_attempts where user_id=p_user and platform=v_platform and mode='free'
  ) then
    raise exception 'Your free Why Medicine? attempt has already been used. Upgrade to Premium to practise again.';
  end if;
  select count(*) into v_count from public.interview_attempts where user_id=p_user and started_at >= now()-interval '24 hours';
  if v_count >= p_daily then raise exception 'Daily interview limit reached. Try again tomorrow.'; end if;
  select count(*) into v_count from public.interview_attempts where user_id=p_user and started_at >= now()-interval '30 days';
  if v_count >= p_monthly then raise exception 'Monthly interview limit reached. Please try again later.'; end if;
  insert into public.interview_attempts(user_id,platform,mode,university_slug,station_slug,title,circuit_id,station_index,station_count,preparation_seconds,station_seconds,break_seconds,questions)
  values(p_user,v_platform,p_payload->>'mode',p_payload->>'university_slug',p_payload->>'station_slug',p_payload->>'title',(p_payload->>'circuit_id')::uuid,(p_payload->>'station_index')::integer,(p_payload->>'station_count')::integer,(p_payload->>'preparation_seconds')::integer,(p_payload->>'station_seconds')::integer,(p_payload->>'break_seconds')::integer,p_payload->'questions') returning * into v_row;
  return v_row;
end; $$;
revoke all on function public.reserve_interview_attempt(uuid,jsonb,integer,integer) from public,anon,authenticated;
grant execute on function public.reserve_interview_attempt(uuid,jsonb,integer,integer) to service_role;

create or replace function public.interview_dashboard_totals()
returns jsonb language sql stable security invoker set search_path=public as $$
  select jsonb_build_object(
    'attemptCount',count(*),
    'completedCount',count(*) filter(where status='completed'),
    'scoredCount',count(*) filter(where status='completed' and score is not null),
    'averageScore',round(avg(score) filter(where status='completed'),1),
    'bestFreeScore',max(score) filter(where status='completed' and mode='free' and station_slug='why-medicine' and rubric_version='why-medicine-v2'),
    'practiceSeconds',coalesce(round(sum(least(station_seconds,greatest(0,
      extract(epoch from (coalesce(answer_submitted_at,completed_at)-started_at))-preparation_seconds
    ))) filter(where status='completed' and completed_at is not null)),0),
    'practiceTimeEstimated',coalesce(bool_or(answer_submitted_at is null) filter(where status='completed'),false)
  ) from public.interview_attempts where user_id=auth.uid() and platform='medicine';
$$;
revoke all on function public.interview_dashboard_totals() from public,anon;
grant execute on function public.interview_dashboard_totals() to authenticated;
create or replace function public.interview_platform_dashboard_totals(p_platform text)
returns jsonb language sql stable security invoker set search_path=public as $$
  select jsonb_build_object(
    'attemptCount',count(*),
    'completedCount',count(*) filter(where status='completed'),
    'scoredCount',count(*) filter(where status='completed' and score is not null),
    'averageScore',round(avg(score) filter(where status='completed'),1),
    'bestFreeScore',max(score) filter(where status='completed' and mode='free' and station_slug='why-medicine' and rubric_version='why-medicine-v2'),
    'practiceSeconds',coalesce(round(sum(least(station_seconds,greatest(0,
      extract(epoch from (coalesce(answer_submitted_at,completed_at)-started_at))-preparation_seconds
    ))) filter(where status='completed' and completed_at is not null)),0),
    'practiceTimeEstimated',coalesce(bool_or(answer_submitted_at is null) filter(where status='completed'),false)
  ) from public.interview_attempts where user_id=auth.uid() and platform=p_platform;
$$;
revoke all on function public.interview_platform_dashboard_totals(text) from public,anon;
grant execute on function public.interview_platform_dashboard_totals(text) to authenticated;
commit;
