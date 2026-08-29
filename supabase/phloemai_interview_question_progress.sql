-- PhloemAI interview question-bank progress setup
-- Paste this into the Supabase SQL Editor after phloemai_setup.sql.

create extension if not exists "pgcrypto";

create table if not exists public.interview_question_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  status text not null default 'not-attempted'
    check (status in ('not-attempted', 'review', 'completed')),
  answer text,
  completed_at timestamptz,
  elapsed_seconds integer not null default 0 check (elapsed_seconds >= 0),
  suggested_seconds integer not null default 0 check (suggested_seconds >= 0),
  mode text check (mode in ('text', 'voice')),
  completion_reason text check (completion_reason in ('manual', 'timer')),
  word_count integer not null default 0 check (word_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, question_id)
);

create index if not exists interview_question_progress_user_status_idx
  on public.interview_question_progress(user_id, status, updated_at desc);

create index if not exists interview_question_progress_user_question_idx
  on public.interview_question_progress(user_id, question_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_interview_question_progress_updated_at
  on public.interview_question_progress;
create trigger set_interview_question_progress_updated_at
before update on public.interview_question_progress
for each row execute function public.set_updated_at();

alter table public.interview_question_progress enable row level security;

drop policy if exists "Interview question progress is owned by user"
  on public.interview_question_progress;
create policy "Interview question progress is owned by user"
on public.interview_question_progress for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant select, insert, update, delete on
  public.interview_question_progress
to authenticated;
