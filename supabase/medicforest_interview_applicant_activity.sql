-- Run after medicforest_interview_dashboard.sql and medicforest_interview_question_progress.sql.
begin;
alter table public.interview_preparation_profiles
  add column if not exists applicant jsonb not null default '{}' check (jsonb_typeof(applicant) = 'object');

create table if not exists public.interview_daily_questions (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  practice_date date not null,
  primary key(user_id, question_id, practice_date)
);
alter table public.interview_daily_questions enable row level security;
revoke all on public.interview_daily_questions from public, anon, authenticated;
grant select on public.interview_daily_questions to authenticated;
grant all on public.interview_daily_questions to service_role;
drop policy if exists interview_daily_questions_owner on public.interview_daily_questions;
create policy interview_daily_questions_owner on public.interview_daily_questions
  for select to authenticated using(user_id = auth.uid());

-- Preserve daily history when a question is practised again on another day.
create or replace function public.capture_interview_daily_question()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.status = 'completed' and new.completed_at is not null then
    insert into public.interview_daily_questions(user_id, question_id, practice_date)
      values(new.user_id, new.question_id, (new.completed_at at time zone 'Europe/London')::date)
      on conflict do nothing;
  end if;
  return new;
end; $$;
revoke all on function public.capture_interview_daily_question() from public, anon, authenticated;
drop trigger if exists interview_daily_question_capture on public.interview_question_progress;
create trigger interview_daily_question_capture after insert or update on public.interview_question_progress
  for each row execute function public.capture_interview_daily_question();
insert into public.interview_daily_questions(user_id, question_id, practice_date)
  select user_id, question_id, (completed_at at time zone 'Europe/London')::date
  from public.interview_question_progress where status='completed' and completed_at is not null
  on conflict do nothing;

create or replace function public.interview_daily_activity()
returns table(practice_date date, questions bigint) language sql stable security invoker set search_path=public as $$
  select practice_date, count(*) from public.interview_daily_questions
  where user_id=auth.uid() and practice_date between
    (now() at time zone 'Europe/London')::date - 27 and (now() at time zone 'Europe/London')::date
  group by practice_date order by practice_date;
$$;
revoke all on function public.interview_daily_activity() from public, anon;
grant execute on function public.interview_daily_activity() to authenticated;
commit;
