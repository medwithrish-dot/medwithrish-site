-- Run after phloemai_interview_platform.sql (and the existing security patch).
-- Additive and rerunnable. No previous interview, group or leaderboard data is removed.
begin;

create table if not exists public.interview_preparation_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  experience text not null check (experience in ('starting','practising','polishing')),
  focus_themes text[] not null default '{}' check (
    cardinality(focus_themes) <= 3 and
    focus_themes <@ array['motivation','reflection','ethics','teamwork','nhs','hot-topics','analysis']::text[]
  ),
  weekly_target integer not null default 3 check (weekly_target between 1 and 14),
  targets jsonb not null default '[]' check (jsonb_typeof(targets)='array' and jsonb_array_length(targets)<=10),
  updated_at timestamptz not null default now()
);
alter table public.interview_preparation_profiles enable row level security;
revoke all on public.interview_preparation_profiles from public,anon,authenticated;
grant select on public.interview_preparation_profiles to authenticated;
grant all on public.interview_preparation_profiles to service_role;
drop policy if exists interview_preparation_owner_read on public.interview_preparation_profiles;
create policy interview_preparation_owner_read on public.interview_preparation_profiles
  for select to authenticated using(user_id=auth.uid());

create table if not exists public.interview_dashboard_tasks (
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id text not null check(char_length(task_id) between 1 and 160),
  date date not null,
  completed_at timestamptz not null default now(),
  primary key(user_id,task_id)
);
create index if not exists interview_dashboard_tasks_owner_date on public.interview_dashboard_tasks(user_id,date);
alter table public.interview_dashboard_tasks enable row level security;
revoke all on public.interview_dashboard_tasks from public,anon,authenticated;
grant select on public.interview_dashboard_tasks to authenticated;
grant all on public.interview_dashboard_tasks to service_role;
drop policy if exists interview_dashboard_tasks_owner_read on public.interview_dashboard_tasks;
create policy interview_dashboard_tasks_owner_read on public.interview_dashboard_tasks
  for select to authenticated using(user_id=auth.uid());

-- Capture the first submission time so future duration stats exclude grading/retries.
-- Existing rows deliberately remain NULL; the UI labels legacy duration estimates.
alter table public.interview_attempts add column if not exists answer_submitted_at timestamptz;
create or replace function public.capture_interview_submission()
returns trigger language plpgsql set search_path=public as $$
begin
  if new.status='grading' and old.answer_submitted_at is null then
    new.answer_submitted_at := now();
  elsif old.answer_submitted_at is not null then
    new.answer_submitted_at := old.answer_submitted_at;
  end if;
  return new;
end; $$;
drop trigger if exists interview_submission_time on public.interview_attempts;
create trigger interview_submission_time before update on public.interview_attempts
  for each row execute function public.capture_interview_submission();
revoke all on function public.capture_interview_submission() from public,anon,authenticated;

-- Exact lifetime totals without transferring private transcripts or unbounded history.
create or replace function public.interview_dashboard_totals()
returns jsonb language sql stable security invoker set search_path=public as $$
  select jsonb_build_object(
    'attemptCount',count(*),
    'completedCount',count(*) filter(where status='completed'),
    'scoredCount',count(*) filter(where status='completed' and score is not null),
    'averageScore',round(avg(score) filter(where status='completed'),1),
    'bestFreeScore',max(score) filter(where status='completed' and mode='free' and station_slug='why-medicine' and rubric_version='why-medicine-v1'),
    'practiceSeconds',coalesce(round(sum(least(station_seconds,greatest(0,
      extract(epoch from (coalesce(answer_submitted_at,completed_at)-started_at))-preparation_seconds
    ))) filter(where status='completed' and completed_at is not null)),0),
    'practiceTimeEstimated',coalesce(bool_or(answer_submitted_at is null) filter(where status='completed'),false)
  ) from public.interview_attempts where user_id=auth.uid();
$$;
revoke all on function public.interview_dashboard_totals() from public,anon;
grant execute on function public.interview_dashboard_totals() to authenticated;
commit;
