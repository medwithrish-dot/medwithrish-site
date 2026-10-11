-- Run once before deploying the AI usage guard. Safe to rerun.
-- Only server-side service_role may consume quota. No bot labels or account bans.
begin;

create table if not exists public.interview_ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('generation', 'speech')),
  minute_started_at timestamptz not null default now(),
  minute_count integer not null default 0,
  day_started_at timestamptz not null default now(),
  day_count integer not null default 0,
  primary key (user_id, kind)
);
alter table public.interview_ai_usage enable row level security;
revoke all on public.interview_ai_usage from public, anon, authenticated;
grant all on public.interview_ai_usage to service_role;

create or replace function public.consume_interview_ai_usage(p_user uuid, p_kind text)
returns boolean language plpgsql security definer set search_path=public as $$
declare
  v_row public.interview_ai_usage;
  v_now timestamptz := clock_timestamp();
  v_minute_limit integer := case when p_kind='speech' then 30 else 12 end;
  v_day_limit integer := case when p_kind='speech' then 720 else 240 end;
begin
  if p_user is null or p_kind is null or p_kind not in ('generation','speech') then
    raise exception 'Invalid AI usage request';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user::text || ':' || p_kind, 941));
  insert into public.interview_ai_usage(user_id,kind,minute_started_at,day_started_at)
    values(p_user,p_kind,v_now,v_now) on conflict do nothing;
  select * into v_row from public.interview_ai_usage where user_id=p_user and kind=p_kind for update;
  if v_row.minute_started_at <= v_now-interval '1 minute' then
    v_row.minute_started_at := v_now; v_row.minute_count := 0;
  end if;
  if v_row.day_started_at <= v_now-interval '24 hours' then
    v_row.day_started_at := v_now; v_row.day_count := 0;
  end if;
  if v_row.minute_count >= v_minute_limit or v_row.day_count >= v_day_limit then return false; end if;
  update public.interview_ai_usage set
    minute_started_at=v_row.minute_started_at, minute_count=v_row.minute_count+1,
    day_started_at=v_row.day_started_at, day_count=v_row.day_count+1
    where user_id=p_user and kind=p_kind;
  return true;
end;
$$;
revoke all on function public.consume_interview_ai_usage(uuid,text) from public, anon, authenticated;
grant execute on function public.consume_interview_ai_usage(uuid,text) to service_role;

commit;
