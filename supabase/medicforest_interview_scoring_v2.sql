-- Run before deploying scoring v2. Keep historical reports and their scores intact.
-- Update installed readers without removing moderation, policies or permissions.
begin;
do $$
declare reader record;
begin
  for reader in
    select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname in
      ('interview_leaderboard','interview_dashboard_totals','interview_groups_action')
  loop
    execute replace(pg_get_functiondef(reader.oid), 'why-medicine-v1', 'why-medicine-v2');
  end loop;
end; $$;
alter table public.interview_attempts alter column rubric_version set default 'why-medicine-v2';
-- Versioned API: older installations fail closed until the scoring migration is applied.
create or replace function public.interview_leaderboard_v2()
returns table(rank bigint,display_name text,score numeric,completed_at timestamptz,is_you boolean)
language sql stable security invoker set search_path=public as $$
  select * from public.interview_leaderboard();
$$;
revoke all on function public.interview_leaderboard_v2() from public,anon,authenticated;
grant execute on function public.interview_leaderboard_v2() to anon,authenticated,service_role;
commit;
