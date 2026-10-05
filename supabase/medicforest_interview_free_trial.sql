-- Existing installations: apply after the interview platform setup. Safe to rerun.
-- Starting a scored trial consumes it, including abandoned attempts. Resume and
-- idempotent replay reuse the saved attempt. Premium retries use paid station mode.
begin;
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
  if p_payload->>'mode' = 'free' and exists (
    select 1 from public.interview_attempts where user_id=p_user and mode='free'
  ) then
    raise exception 'Your free Why Medicine? attempt has already been used. Upgrade to Premium to practise again.';
  end if;
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

create index if not exists interview_attempts_free_trial_user
  on public.interview_attempts(user_id) where mode='free';
commit;
