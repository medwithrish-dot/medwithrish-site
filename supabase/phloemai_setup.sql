-- PhloemAI / UCAT Tutor Supabase setup
-- Paste this into the Supabase SQL Editor and run it once.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  current_plan text not null default 'free'
    check (current_plan in ('free', 'premium')),
  diagnostic_credits integer not null default 1
    check (diagnostic_credits >= 0),
  ai_diagnostic_last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.diagnostic_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null default 'ucat_dashboard',
  total_questions integer not null default 0 check (total_questions >= 0),
  accuracy numeric(5,2) check (accuracy >= 0 and accuracy <= 100),
  avg_seconds_per_question integer check (avg_seconds_per_question >= 0),
  ai_feedback text,
  ai_feedback_requested_at timestamptz,
  ai_feedback_status text not null default 'not_requested',
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.diagnostic_sections (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.diagnostic_attempts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  section text not null check (section in ('VR', 'DM', 'QR', 'AR', 'SJT')),
  score integer check (score >= 0 and score <= 900),
  accuracy numeric(5,2) check (accuracy >= 0 and accuracy <= 100),
  avg_seconds_per_question integer check (avg_seconds_per_question >= 0),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.fix_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_attempt_id uuid references public.diagnostic_attempts(id) on delete set null,
  title text not null,
  description text,
  section text check (section in ('VR', 'DM', 'QR', 'AR', 'SJT')),
  task_type text not null default 'practice',
  target_minutes integer check (target_minutes > 0),
  total_questions integer check (total_questions > 0),
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'completed', 'skipped')),
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  title text not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists diagnostic_attempts_user_started_idx
  on public.diagnostic_attempts(user_id, started_at desc);
create index if not exists diagnostic_sections_user_attempt_idx
  on public.diagnostic_sections(user_id, attempt_id);
create index if not exists fix_tasks_user_status_idx
  on public.fix_tasks(user_id, status, created_at desc);
create index if not exists activity_events_user_occurred_idx
  on public.activity_events(user_id, occurred_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_fix_tasks_updated_at on public.fix_tasks;
create trigger set_fix_tasks_updated_at
before update on public.fix_tasks
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.diagnostic_attempts enable row level security;
alter table public.diagnostic_sections enable row level security;
alter table public.fix_tasks enable row level security;
alter table public.activity_events enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "Profiles can be inserted by owner" on public.profiles;

drop policy if exists "Profiles can be updated by owner" on public.profiles;
create policy "Profiles can be updated by owner"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Diagnostic attempts are owned by user" on public.diagnostic_attempts;
create policy "Diagnostic attempts are owned by user"
on public.diagnostic_attempts for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Diagnostic sections are owned by user" on public.diagnostic_sections;
create policy "Diagnostic sections are owned by user"
on public.diagnostic_sections for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Fix tasks are owned by user" on public.fix_tasks;
create policy "Fix tasks are owned by user"
on public.fix_tasks for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Activity events are owned by user" on public.activity_events;
create policy "Activity events are owned by user"
on public.activity_events for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant usage on schema public to authenticated;
-- Profiles are created by the auth trigger; plan and credit fields are server-only.
revoke insert, update, delete on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update(full_name) on public.profiles to authenticated;
grant select, insert, update, delete on
  public.diagnostic_attempts,
  public.diagnostic_sections,
  public.fix_tasks,
  public.activity_events
to authenticated;
