-- Apply to an existing interview installation for guest leaderboard viewing.
-- The RPC returns only opted-in nicknames, scores, ranks and completion dates.
begin;
grant execute on function public.interview_leaderboard() to anon;
commit;
