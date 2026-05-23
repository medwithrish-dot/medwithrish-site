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
