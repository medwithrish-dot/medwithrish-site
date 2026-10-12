-- Optional accelerated reader. The application uses an equivalent server-side
-- fallback until this additive migration is installed.
begin;
create or replace function public.interview_leaderboard_v3()
returns table(rank bigint,display_name text,score numeric,completed_at timestamptz,is_you boolean)
language sql stable security definer set search_path=public as $$
  with best as (
    select distinct on(a.user_id) a.user_id,p.display_name,a.score,a.completed_at,a.id
    from public.interview_attempts a join public.interview_preferences p on p.user_id=a.user_id
    where p.leaderboard_opt_in and a.station_slug='why-medicine'
      and (a.mode='free' or (a.mode='station' and a.station_seconds=180))
      and a.status='completed' and a.rubric_version='why-medicine-v2' and a.score is not null
    order by a.user_id,a.score desc,a.completed_at asc,a.id asc
  ) select row_number() over(order by best.score desc,best.completed_at asc,best.id asc),
    best.display_name,best.score,best.completed_at,coalesce(best.user_id=auth.uid(),false)
    from best order by best.score desc,best.completed_at asc,best.id asc limit 100;
$$;
revoke all on function public.interview_leaderboard_v3() from public,anon,authenticated;
grant execute on function public.interview_leaderboard_v3() to anon,authenticated,service_role;
commit;
