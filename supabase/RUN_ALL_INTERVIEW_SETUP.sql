-- COMPLETE MED INTERVIEW SETUP: paste this entire file into Supabase SQL Editor and Run.
-- For your EXISTING PhloemAI project (public.profiles must already exist).
-- This combines all five interview setup files in dependency order.
-- Safe to rerun. Existing interview answers, groups and profiles are preserved.
-- One transaction: if any statement fails, no partial changes are committed.

begin;

do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'Missing base account setup. Run phloemai_setup.sql first, then run this file again.';
  end if;
end;
$$;

-- ============================================================
-- STEP 1 OF 5: phloemai_security_patch.sql
-- ============================================================

-- PhloemAI security hardening patch
-- Run this in Supabase SQL Editor after the existing setup files.

-- Profile rows should be created by public.handle_new_user(), not by clients.
-- This prevents a missing-profile edge case where a signed-in user could insert
-- their own row with server-controlled fields such as current_plan.
drop policy if exists "Profiles can be inserted by owner" on public.profiles;

revoke insert, update, delete on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update(full_name) on public.profiles to authenticated;

-- Keep the owner update policy in place for harmless profile edits. The column
-- grant above limits authenticated users to full_name only.
drop policy if exists "Profiles can be updated by owner" on public.profiles;
create policy "Profiles can be updated by owner"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Optional sanity check after running this patch:
-- select user_id, count(*)
-- from public.subscriptions
-- where status in ('active', 'trialing')
-- group by user_id
-- having count(*) > 1;


-- ============================================================
-- STEP 2 OF 5: phloemai_interview_question_progress.sql
-- ============================================================

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


-- ============================================================
-- STEP 3 OF 5: phloemai_interview_platform.sql
-- ============================================================

-- Run after phloemai_setup.sql and phloemai_security_patch.sql.
-- All paid AI mutations go through authenticated server routes and service-only RPCs.

create table if not exists public.interview_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('free','university','station','reference')),
  university_slug text,
  station_slug text not null,
  title text not null,
  status text not null default 'in_progress' check (status in ('in_progress','grading','completed','failed')),
  circuit_id uuid not null,
  station_index integer not null default 0 check (station_index >= 0),
  station_count integer not null default 1 check (station_count between 1 and 20),
  preparation_seconds integer not null check (preparation_seconds between 0 and 600),
  station_seconds integer not null check (station_seconds between 60 and 7200),
  break_seconds integer not null check (break_seconds between 0 and 1800),
  questions jsonb not null,
  answers jsonb not null default '[]',
  metrics jsonb not null default '{}',
  feedback jsonb,
  score numeric(4,1) check (score between 0 and 99),
  rubric_version text not null default 'why-medicine-v1',
  grading_tries integer not null default 0,
  grading_token uuid,
  grading_started_at timestamptz,
  last_error text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(user_id,circuit_id,station_index)
);
create index if not exists interview_attempts_user_time on public.interview_attempts(user_id,started_at desc);
create index if not exists interview_attempts_leaderboard on public.interview_attempts(score desc,completed_at) where mode='free' and status='completed';
alter table public.interview_attempts enable row level security;
revoke all on public.interview_attempts from anon,authenticated;
grant select on public.interview_attempts to authenticated;
grant all on public.interview_attempts to service_role;
drop policy if exists interview_attempts_owner_read on public.interview_attempts;
create policy interview_attempts_owner_read on public.interview_attempts for select to authenticated using(user_id=auth.uid());

create table if not exists public.interview_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 32),
  leaderboard_opt_in boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.interview_preferences enable row level security;
revoke all on public.interview_preferences from anon,authenticated;
grant select on public.interview_preferences to authenticated;
grant all on public.interview_preferences to service_role;
drop policy if exists interview_preferences_owner_read on public.interview_preferences;
create policy interview_preferences_owner_read on public.interview_preferences for select to authenticated using(user_id=auth.uid());

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

create or replace function public.claim_interview_grading(p_user uuid,p_attempt uuid,p_token uuid)
returns public.interview_attempts language plpgsql security definer set search_path=public as $$
declare v_row public.interview_attempts;
begin
  select * into v_row from public.interview_attempts where id=p_attempt and user_id=p_user for update;
  if not found then raise exception 'Interview not found'; end if;
  if v_row.status='completed' then return v_row; end if;
  if (select count(*) from regexp_split_to_table(btrim((select string_agg(a->>'answer',' ') from jsonb_array_elements(v_row.answers) a)), '\s+') word where word <> '') < 20 then
    raise exception 'Save at least 20 words before requesting feedback.';
  end if;
  if v_row.last_error='abandoned' then raise exception 'This interview was ended. Start a new station.'; end if;
  if v_row.status='grading' and v_row.grading_started_at > now()-interval '90 seconds' then raise exception 'Feedback is already being generated. Please wait.'; end if;
  if v_row.grading_tries >= 3 then raise exception 'Feedback retry limit reached for this station. Your answers are saved.'; end if;
  update public.interview_attempts set status='grading',grading_token=p_token,grading_started_at=now(),grading_tries=grading_tries+1,last_error=null where id=p_attempt returning * into v_row;
  return v_row;
end; $$;
revoke all on function public.claim_interview_grading(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.claim_interview_grading(uuid,uuid,uuid) to service_role;

create or replace function public.interview_leaderboard()
returns table(rank bigint,display_name text,score numeric,completed_at timestamptz,is_you boolean)
language sql stable security definer set search_path=public as $$
  with best as (
    select distinct on(a.user_id) a.user_id,p.display_name,a.score,a.completed_at
    from public.interview_attempts a join public.interview_preferences p on p.user_id=a.user_id
    where p.leaderboard_opt_in and a.mode='free' and a.station_slug='why-medicine' and a.status='completed'
      and a.rubric_version='why-medicine-v1' and a.score is not null
    order by a.user_id,a.score desc,a.completed_at asc
  ) select row_number() over(order by best.score desc,best.completed_at asc),best.display_name,best.score,best.completed_at,best.user_id=auth.uid()
    from best order by best.score desc,best.completed_at asc limit 100;
$$;
revoke all on function public.interview_leaderboard() from public,anon;
grant execute on function public.interview_leaderboard() to authenticated,service_role;


-- ============================================================
-- STEP 4 OF 5: phloemai_interview_groups.sql
-- ============================================================

-- Run in the Supabase SQL editor after phloemai_interview_platform.sql.
-- All access uses the authenticated interview_groups_action RPC. Tables have no
-- browser read/write grants, and the RPC checks auth.uid() on every operation.



create table if not exists public.interview_study_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  owner_id uuid not null references auth.users(id) on delete cascade,
  invite_hash text not null,
  invite_expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create unique index if not exists interview_study_groups_invite_idx
  on public.interview_study_groups(invite_hash);

create table if not exists public.interview_study_group_members (
  group_id uuid not null references public.interview_study_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  joined_at timestamptz not null default now(),
  primary key(group_id, user_id)
);
create index if not exists interview_study_group_members_user_idx
  on public.interview_study_group_members(user_id);

create table if not exists public.interview_study_group_rooms (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.interview_study_groups(id) on delete cascade,
  station_id text not null check (station_id in ('motivation', 'work-experience', 'ethics-access', 'ethics-edi', 'hot-topic')),
  title text not null,
  questions jsonb not null,
  status text not null default 'lobby' check (status in ('lobby', 'active', 'completed')),
  duration_seconds integer not null default 480 check (duration_seconds = 480),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  ends_at timestamptz
);
create index if not exists interview_study_group_rooms_group_idx
  on public.interview_study_group_rooms(group_id, created_at desc);

create table if not exists public.interview_study_group_answers (
  room_id uuid not null references public.interview_study_group_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  answer text not null check (char_length(answer) between 1 and 6000),
  updated_at timestamptz not null default now(),
  primary key(room_id, user_id)
);

create table if not exists public.interview_study_group_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.interview_study_group_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  message text not null check (char_length(message) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists interview_study_group_messages_room_idx
  on public.interview_study_group_messages(room_id, created_at desc);

alter table public.interview_study_groups enable row level security;
alter table public.interview_study_group_members enable row level security;
alter table public.interview_study_group_rooms enable row level security;
alter table public.interview_study_group_answers enable row level security;
alter table public.interview_study_group_messages enable row level security;
revoke all on public.interview_study_groups, public.interview_study_group_members,
  public.interview_study_group_rooms, public.interview_study_group_answers,
  public.interview_study_group_messages from public, anon, authenticated;

create or replace function public.interview_groups_action(
  p_action text,
  p_group_id uuid default null,
  p_payload jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor uuid := auth.uid();
  v_group public.interview_study_groups%rowtype;
  v_room public.interview_study_group_rooms%rowtype;
  v_name text;
  v_code text;
  v_text text;
  v_station text;
  v_title text;
  v_questions jsonb;
  v_count integer;
  v_result jsonb;
  v_members jsonb;
  v_rooms jsonb;
  v_answers jsonb := '[]'::jsonb;
  v_messages jsonb := '[]'::jsonb;
  v_room_json jsonb := null;
  v_target uuid;
begin
  if v_actor is null then
    raise exception 'Sign in to use study groups.' using errcode = '42501';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' or octet_length(p_payload::text) > 32768 then
    raise exception 'Invalid group request.';
  end if;
  if p_action is null or p_action not in (
    'list', 'details', 'create', 'join', 'invite', 'remove', 'leave', 'delete',
    'create_room', 'start_room', 'end_room', 'answer', 'message'
  ) then
    raise exception 'Unknown group action.';
  end if;

  if p_action = 'list' then
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', g.id, 'name', g.name, 'ownerId', g.owner_id, 'createdAt', g.created_at,
      'memberCount', (select count(*) from public.interview_study_group_members n where n.group_id = g.id)
    ) order by g.created_at desc), '[]'::jsonb) into v_result
    from public.interview_study_groups g
    join public.interview_study_group_members m on m.group_id = g.id and m.user_id = v_actor;
    return jsonb_build_object('userId', v_actor, 'groups', v_result, 'serverTime', now());
  end if;

  -- Serialize each actor's writes, including membership limits across groups.
  if p_action <> 'details' then
    perform pg_advisory_xact_lock(hashtextextended('interview-group:' || v_actor::text, 0));
  end if;

  if p_action in ('create', 'join') then
    select left(coalesce(
      nullif(btrim(u.raw_user_meta_data->>'full_name'), ''),
      nullif(btrim(u.raw_user_meta_data->>'name'), ''), 'Study partner'
    ), 80) into v_name from auth.users u where u.id = v_actor;
    if v_name is null then raise exception 'Sign in again to continue.' using errcode = '42501'; end if;
  end if;

  if p_action = 'create' then
    v_text := btrim(p_payload->>'name');
    if v_text is null or char_length(v_text) not between 2 and 60 then
      raise exception 'Use a group name between 2 and 60 characters.';
    end if;
    select count(*) into v_count from public.interview_study_group_members where user_id = v_actor;
    if v_count >= 10 then raise exception 'You can belong to up to 10 study groups. Leave one to create another.'; end if;
    v_code := replace(gen_random_uuid()::text, '-', '');
    insert into public.interview_study_groups(name, owner_id, invite_hash, invite_expires_at)
      values(v_text, v_actor, encode(sha256(convert_to(v_code, 'UTF8')), 'hex'), now() + interval '7 days')
      returning * into v_group;
    insert into public.interview_study_group_members(group_id, user_id, display_name)
      values(v_group.id, v_actor, v_name);
    return jsonb_build_object('groupId', v_group.id, 'inviteCode', v_code, 'expiresAt', v_group.invite_expires_at);
  end if;

  if p_action = 'join' then
    v_code := lower(btrim(p_payload->>'code'));
    if v_code is null or v_code !~ '^[0-9a-f]{32}$' then raise exception 'This invite is invalid or expired.'; end if;
    select * into v_group from public.interview_study_groups
      where invite_hash = encode(sha256(convert_to(v_code, 'UTF8')), 'hex') and invite_expires_at > now()
      for update;
    if not found then raise exception 'This invite is invalid or expired.'; end if;
    if exists(select 1 from public.interview_study_group_members where group_id = v_group.id and user_id = v_actor) then
      return jsonb_build_object('groupId', v_group.id);
    end if;
    select count(*) into v_count from public.interview_study_group_members where group_id = v_group.id;
    if v_count >= 12 then raise exception 'This group already has 12 members.'; end if;
    select count(*) into v_count from public.interview_study_group_members where user_id = v_actor;
    if v_count >= 10 then raise exception 'You can belong to up to 10 study groups. Leave one to join another.'; end if;
    insert into public.interview_study_group_members(group_id, user_id, display_name)
      values(v_group.id, v_actor, v_name);
    return jsonb_build_object('groupId', v_group.id);
  end if;

  if p_action = 'details' then
    select * into v_group from public.interview_study_groups where id = p_group_id;
  else
    -- This also serializes host controls, invitations, membership and answer
    -- writes, so removing a member cannot race a later room write.
    select * into v_group from public.interview_study_groups where id = p_group_id for update;
  end if;
  if v_group.id is null or not exists(
    select 1 from public.interview_study_group_members where group_id = v_group.id and user_id = v_actor
  ) then
    raise exception 'This group is unavailable or you are no longer a member.' using errcode = '42501';
  end if;

  if p_action in ('invite', 'remove', 'delete', 'create_room', 'start_room', 'end_room') and v_group.owner_id <> v_actor then
    raise exception 'Only the group owner can do that.' using errcode = '42501';
  end if;

  if p_action = 'details' then
    select coalesce(jsonb_agg(jsonb_build_object(
      'userId', m.user_id, 'name', m.display_name, 'joinedAt', m.joined_at,
      'groupScore', null,
      -- Joining a private group explicitly shares this score with its members.
      -- No attempt IDs, answers, feedback, or other account data are exposed.
      'whyMedicineScore', (select max(a.score) from public.interview_attempts a
        where a.user_id = m.user_id and a.mode = 'free' and a.station_slug = 'why-medicine'
        and a.status = 'completed' and a.rubric_version = 'why-medicine-v1')
    ) order by m.joined_at), '[]'::jsonb) into v_members
      from public.interview_study_group_members m where m.group_id = v_group.id;
    -- A completed timer stays completed even if nobody has the page open.
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', r.id, 'stationId', r.station_id, 'title', r.title, 'questions', r.questions,
      'status', case when r.status = 'active' and r.ends_at <= now() then 'completed' else r.status end,
      'durationSeconds', r.duration_seconds, 'createdAt', r.created_at, 'startedAt', r.started_at, 'endsAt', r.ends_at
    ) order by r.created_at desc), '[]'::jsonb) into v_rooms
      from (select * from public.interview_study_group_rooms where group_id = v_group.id order by created_at desc limit 10) r;
    if p_payload->>'roomId' is not null then
      select * into v_room from public.interview_study_group_rooms where id = (p_payload->>'roomId')::uuid and group_id = v_group.id;
      if not found then raise exception 'This station room is unavailable.'; end if;
    else
      select * into v_room from public.interview_study_group_rooms where group_id = v_group.id order by created_at desc limit 1;
    end if;
    if v_room.id is not null then
      v_room_json := jsonb_build_object(
        'id', v_room.id, 'stationId', v_room.station_id, 'title', v_room.title, 'questions', v_room.questions,
        'status', case when v_room.status = 'active' and v_room.ends_at <= now() then 'completed' else v_room.status end,
        'durationSeconds', v_room.duration_seconds, 'createdAt', v_room.created_at, 'startedAt', v_room.started_at, 'endsAt', v_room.ends_at
      );
      select coalesce(jsonb_agg(jsonb_build_object(
        'userId', user_id, 'name', display_name, 'text', answer, 'updatedAt', updated_at
      ) order by updated_at), '[]'::jsonb) into v_answers
        from public.interview_study_group_answers where room_id = v_room.id;
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', n.id, 'userId', n.user_id, 'name', n.display_name, 'text', n.message, 'createdAt', n.created_at
      ) order by n.created_at), '[]'::jsonb) into v_messages
        from (select * from public.interview_study_group_messages where room_id = v_room.id order by created_at desc limit 100) n;
    end if;
    return jsonb_build_object(
      'userId', v_actor, 'serverTime', now(),
      'group', jsonb_build_object('id', v_group.id, 'name', v_group.name, 'ownerId', v_group.owner_id,
        'createdAt', v_group.created_at, 'memberCount', jsonb_array_length(v_members)),
      'members', v_members, 'rooms', v_rooms, 'room', v_room_json, 'answers', v_answers, 'messages', v_messages
    );
  end if;

  if p_action = 'invite' then
    v_code := replace(gen_random_uuid()::text, '-', '');
    update public.interview_study_groups set
      invite_hash = encode(sha256(convert_to(v_code, 'UTF8')), 'hex'), invite_expires_at = now() + interval '7 days'
      where id = v_group.id;
    return jsonb_build_object('groupId', v_group.id, 'inviteCode', v_code, 'expiresAt', now() + interval '7 days');
  end if;

  if p_action = 'delete' then
    delete from public.interview_study_groups where id = v_group.id;
    return jsonb_build_object('ok', true);
  end if;

  if p_action in ('leave', 'remove') then
    v_target := case when p_action = 'leave' then v_actor else (p_payload->>'userId')::uuid end;
    if v_target is null then raise exception 'Choose a member to remove.'; end if;
    if v_target = v_group.owner_id then raise exception 'The owner must delete the group to leave it.'; end if;
    delete from public.interview_study_group_members where group_id = v_group.id and user_id = v_target;
    if not found then raise exception 'That account is no longer in this group.'; end if;
    -- Removing a member also invalidates outstanding invites, so they cannot
    -- immediately rejoin using the same invite. The host can generate a new one.
    if p_action = 'remove' then
      update public.interview_study_groups set invite_expires_at = now() where id = v_group.id;
    end if;
    return jsonb_build_object('ok', true);
  end if;

  if p_action = 'create_room' then
    if exists(select 1 from public.interview_study_group_rooms where group_id = v_group.id
      and (status = 'lobby' or (status = 'active' and ends_at > now()))) then
      raise exception 'Finish the current station before opening another one.';
    end if;
    select count(*) into v_count from public.interview_study_group_rooms where group_id = v_group.id and created_at > now() - interval '1 day';
    if v_count >= 20 then raise exception 'This group has reached its daily limit of 20 stations. Try again tomorrow.'; end if;
    v_station := p_payload->>'stationId';
    case v_station
      when 'motivation' then
        v_title := 'Why medicine?';
        v_questions := '["Why do you want to study medicine?", "What experience helped you understand what being a doctor involves?", "What challenges do you expect, and how would you manage them?"]'::jsonb;
      when 'work-experience' then
        v_title := 'Work experience';
        v_questions := '["Tell us about an experience that changed your understanding of healthcare.", "What did you learn about teamwork and communication?", "How will you apply that learning as a medical student?"]'::jsonb;
      when 'ethics-access' then
        v_title := 'Disability and access to medicine';
        v_questions := '["How should medical schools support disabled applicants and students while maintaining safe professional standards?", "How would you approach reasonable adjustments, fairness and patient safety?", "What assumptions should an admissions team avoid?"]'::jsonb;
      when 'ethics-edi' then
        v_title := 'Equality, diversity and inclusion';
        v_questions := '["What do equality, diversity and inclusion mean in healthcare?", "Describe how a doctor could respond to discrimination within a team.", "How can fair access and individual patient needs be considered together?"]'::jsonb;
      when 'hot-topic' then
        v_title := 'Ozempic and weight-management medicines';
        v_questions := '["What ethical issues arise when discussing Ozempic and other medicines used for weight management?", "How would you weigh equitable access, individual circumstances and limited resources?", "How would you discuss a public health headline while recognising the limits of your knowledge?"]'::jsonb;
      else raise exception 'Choose an available group station.';
    end case;
    update public.interview_study_group_rooms set status = 'completed'
      where group_id = v_group.id and status = 'active' and ends_at <= now();
    insert into public.interview_study_group_rooms(group_id, station_id, title, questions)
      values(v_group.id, v_station, v_title, v_questions) returning * into v_room;
    return jsonb_build_object('roomId', v_room.id);
  end if;

  select * into v_room from public.interview_study_group_rooms
    where id = (p_payload->>'roomId')::uuid and group_id = v_group.id for update;
  if not found then raise exception 'This station room is unavailable.'; end if;

  if p_action = 'start_room' then
    if v_room.status <> 'lobby' then raise exception 'This station has already started.'; end if;
    update public.interview_study_group_rooms set status = 'active', started_at = now(),
      ends_at = now() + make_interval(secs => duration_seconds) where id = v_room.id;
    return jsonb_build_object('ok', true);
  end if;

  if p_action = 'end_room' then
    update public.interview_study_group_rooms set status = 'completed',
      ends_at = least(coalesce(ends_at, now()), now()) where id = v_room.id;
    return jsonb_build_object('ok', true);
  end if;

  select display_name into v_name from public.interview_study_group_members
    where group_id = v_group.id and user_id = v_actor;
  v_text := btrim(p_payload->>'text');
  if p_action = 'answer' then
    if v_room.status <> 'active' or v_room.ends_at <= now() then raise exception 'Answers can only be saved while the station timer is running.'; end if;
    if v_text is null or char_length(v_text) not between 1 and 6000 then raise exception 'Write an answer between 1 and 6,000 characters.'; end if;
    if exists(select 1 from public.interview_study_group_answers where room_id = v_room.id and user_id = v_actor and updated_at > now() - interval '2 seconds') then
      raise exception 'Please wait a moment before saving again.';
    end if;
    insert into public.interview_study_group_answers(room_id, user_id, display_name, answer)
      values(v_room.id, v_actor, v_name, v_text)
      on conflict(room_id, user_id) do update set answer = excluded.answer, updated_at = now();
    return jsonb_build_object('ok', true);
  end if;

  if p_action = 'message' then
    if v_text is null or char_length(v_text) not between 1 and 1000 then raise exception 'Write a message between 1 and 1,000 characters.'; end if;
    if exists(select 1 from public.interview_study_group_messages where room_id = v_room.id and user_id = v_actor and created_at > now() - interval '2 seconds') then
      raise exception 'Please wait a moment before sending another message.';
    end if;
    select count(*) into v_count from public.interview_study_group_messages where room_id = v_room.id;
    if v_count >= 1000 then raise exception 'This station has reached its message limit. Start a new station to continue.'; end if;
    insert into public.interview_study_group_messages(room_id, user_id, display_name, message)
      values(v_room.id, v_actor, v_name, v_text);
    return jsonb_build_object('ok', true);
  end if;
  raise exception 'Unknown group action.';
end;
$$;

revoke all on function public.interview_groups_action(text, uuid, jsonb) from public, anon;
grant execute on function public.interview_groups_action(text, uuid, jsonb) to authenticated;

comment on function public.interview_groups_action(text, uuid, jsonb) is
  'Authenticated group operations. Membership and host checks run inside serialized mutations. Group scores deliberately await an owner-defined rubric.';


-- ============================================================
-- STEP 5 OF 5: phloemai_interview_dashboard.sql
-- ============================================================

-- Run after phloemai_interview_platform.sql (and the existing security patch).
-- Additive and rerunnable. No previous interview, group or leaderboard data is removed.


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

-- Successful completion means all interview database features are installed.
