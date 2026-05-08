-- PhloemAI practice telemetry setup
-- Paste this into the Supabase SQL Editor after phloemai_setup.sql.

create extension if not exists "pgcrypto";

alter table public.profiles
  add column if not exists diagnostic_credits integer not null default 1
    check (diagnostic_credits >= 0);

update public.profiles
set diagnostic_credits = 1
where current_plan = 'free';

create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  section text not null check (section in ('vr', 'dm', 'qr', 'sjt')),
  source text not null default 'question_bank',
  total_questions integer not null default 0 check (total_questions >= 0),
  answered_questions integer not null default 0 check (answered_questions >= 0),
  correct_questions integer not null default 0 check (correct_questions >= 0),
  accuracy numeric(5,2) check (accuracy >= 0 and accuracy <= 100),
  total_seconds integer not null default 0 check (total_seconds >= 0),
  avg_seconds_per_question integer not null default 0 check (avg_seconds_per_question >= 0),
  tracking_mode text not null default 'none' check (tracking_mode in ('none', 'mouse', 'eye')),
  summary jsonb not null default '{}'::jsonb,
  raw_events jsonb not null default '[]'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.practice_question_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.practice_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  question_index integer not null check (question_index >= 0),
  section text not null check (section in ('vr', 'dm', 'qr', 'sjt')),
  subtype text not null,
  answered boolean not null default false,
  correct boolean not null default false,
  flagged boolean not null default false,
  selected_answer jsonb,
  correct_answer jsonb,
  total_seconds integer not null default 0 check (total_seconds >= 0),
  visits integer not null default 0 check (visits >= 0),
  answered_at_ms bigint,
  answer_switches integer not null default 0 check (answer_switches >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists practice_sessions_user_completed_idx
  on public.practice_sessions(user_id, completed_at desc);

create index if not exists practice_sessions_user_section_idx
  on public.practice_sessions(user_id, section, completed_at desc);

create index if not exists practice_question_attempts_user_session_idx
  on public.practice_question_attempts(user_id, session_id);

create index if not exists practice_question_attempts_user_question_idx
  on public.practice_question_attempts(user_id, question_id, created_at desc);

create index if not exists practice_question_attempts_user_subtype_idx
  on public.practice_question_attempts(user_id, subtype, created_at desc);

alter table public.practice_sessions enable row level security;
alter table public.practice_question_attempts enable row level security;

drop policy if exists "Practice sessions are owned by user" on public.practice_sessions;
create policy "Practice sessions are owned by user"
on public.practice_sessions for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Practice question attempts are owned by user" on public.practice_question_attempts;
create policy "Practice question attempts are owned by user"
on public.practice_question_attempts for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant select, insert, update, delete on
  public.practice_sessions,
  public.practice_question_attempts
to authenticated;
