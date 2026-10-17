-- Apply before enabling INTERVIEW_AI_SHARED_LIMITS=true on every deployment.
-- Shared by feedback and probes. Contains no user IDs, transcripts or credentials.
begin;
create table if not exists public.interview_ai_capacity_config (
  id boolean primary key default true check (id),
  max_concurrent integer not null default 20 check (max_concurrent between 1 and 100),
  requests_per_minute integer not null default 60 check (requests_per_minute between 1 and 10000),
  paused_until timestamptz not null default '-infinity'
);
insert into public.interview_ai_capacity_config(id) values (true) on conflict do nothing;

create table if not exists public.interview_ai_capacity_leases (
  token uuid primary key,
  started_at timestamptz not null,
  expires_at timestamptz not null,
  released boolean not null default false
);
create index if not exists interview_ai_capacity_started_idx on public.interview_ai_capacity_leases(started_at);
alter table public.interview_ai_capacity_config enable row level security;
alter table public.interview_ai_capacity_leases enable row level security;
revoke all on public.interview_ai_capacity_config, public.interview_ai_capacity_leases from public, anon, authenticated;
grant select, update on public.interview_ai_capacity_config to service_role;
grant select on public.interview_ai_capacity_leases to service_role;

create or replace function public.acquire_interview_ai_capacity(p_token uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  v_config public.interview_ai_capacity_config;
  v_now timestamptz;
  v_active integer;
  v_recent integer;
begin
  if p_token is null then raise exception 'Capacity token required'; end if;
  -- Serialize only this small transaction, never the external AI request.
  select * into strict v_config from public.interview_ai_capacity_config where id=true for update;
  v_now := clock_timestamp();
  delete from public.interview_ai_capacity_leases where started_at <= v_now-interval '2 minutes' and expires_at <= v_now;
  if v_config.paused_until > v_now then
    return jsonb_build_object('admitted',false,'retry_after',greatest(1,ceil(extract(epoch from v_config.paused_until-v_now))));
  end if;
  -- Reusing an expired/released token is forbidden. Tokens are one-shot permits.
  if exists(select 1 from public.interview_ai_capacity_leases where token=p_token) then
    return jsonb_build_object('admitted',false,'retry_after',15);
  end if;
  select count(*) filter(where not released and expires_at > v_now),
    count(*) filter(where started_at > v_now-interval '60 seconds')
    into v_active,v_recent from public.interview_ai_capacity_leases;
  if v_active >= v_config.max_concurrent or v_recent >= v_config.requests_per_minute then
    return jsonb_build_object('admitted',false,'retry_after',15);
  end if;
  insert into public.interview_ai_capacity_leases(token,started_at,expires_at)
    values(p_token,v_now,v_now+interval '90 seconds');
  return jsonb_build_object('admitted',true);
end; $$;

create or replace function public.release_interview_ai_capacity(p_token uuid)
returns void language sql security definer set search_path=public as $$
  -- Keep recent starts after release so fast requests cannot bypass the RPM cap.
  update public.interview_ai_capacity_leases set released=true where token=p_token;
$$;

create or replace function public.pause_interview_ai_capacity(p_seconds integer)
returns void language sql security definer set search_path=public as $$
  update public.interview_ai_capacity_config
    set paused_until=greatest(paused_until,clock_timestamp()+make_interval(secs=>greatest(15,least(300,coalesce(p_seconds,15)))))
    where id=true;
$$;
revoke all on function public.acquire_interview_ai_capacity(uuid), public.release_interview_ai_capacity(uuid), public.pause_interview_ai_capacity(integer) from public, anon, authenticated;
grant execute on function public.acquire_interview_ai_capacity(uuid), public.release_interview_ai_capacity(uuid), public.pause_interview_ai_capacity(integer) to service_role;
commit;
