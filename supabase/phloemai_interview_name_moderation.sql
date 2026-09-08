-- Run after phloemai_interview_platform.sql. Safe to rerun.
-- Keep normalization and patterns aligned with utils/interviews/public-name.ts.
begin;

create or replace function public.interview_name_has_profanity(p_name text)
returns boolean language plpgsql immutable parallel safe set search_path=public as $$
declare
  v_name text;
  v_word text;
  v_compact text := '';
  v_word_pattern text := '^(ass|arse|dick|cock|piss|fag|paki|kike|chink|spic|porn|tits|cum|semen|penis|vagina)(s|ing|er)?$';
begin
  if p_name is null then return true; end if;
  v_name := regexp_replace(normalize(lower(p_name), NFKD), U&'[\0300-\036f]', '', 'g');
  v_name := translate(v_name, '01345789@$!|аɑαеεёіιıоοрρсϲуυхχѕτтνκкς', 'oieastbgasiiaaaeeeiiiooppccyuxxsttvkkc');
  foreach v_word in array regexp_split_to_array(v_name, '[^a-z]+') loop
    if v_word = any(array['scunthorpe','shital','shitara','slutsky','slutskaya']) then continue; end if;
    if v_word ~ v_word_pattern then return true; end if;
    v_compact := v_compact || v_word;
  end loop;
  return v_compact ~ v_word_pattern or v_compact ~ 'f+u+c+k+|s+h+i+t+|b+i+t+c+h+|c+u+n+t+|w+a+n+k+|t+w+a+t+|b+o+l+l+o+c+k+|b+a+s+t+a+r+d+|a+s+s+h+o+l+e+|a+r+s+e+h+o+l+e+|d+i+c+k+h+e+a+d+|c+o+c+k+s+u+c+k+|s+l+u+t+|w+h+o+r+e+|n+i+g+g+(e+r+|a+)|f+a+g+g+o+t+|r+e+t+a+r+d+';
end;
$$;
revoke all on function public.interview_name_has_profanity(text) from public,anon,authenticated;
grant execute on function public.interview_name_has_profanity(text) to service_role;

-- Replace unsafe legacy nicknames without changing attempts, scores or consent.
update public.interview_preferences
set display_name='Candidate ' || left(user_id::text,6), updated_at=now()
where public.interview_name_has_profanity(display_name);

alter table public.interview_preferences drop constraint if exists interview_preferences_name_moderated;
alter table public.interview_preferences add constraint interview_preferences_name_moderated
  check (not public.interview_name_has_profanity(display_name));

-- Preserve service-only writes even on databases with an older permission setup.
revoke insert,update,delete on public.interview_preferences from anon,authenticated;

-- Also protect direct RPC readers, including if moderation rules change later.
create or replace function public.interview_leaderboard()
returns table(rank bigint,display_name text,score numeric,completed_at timestamptz,is_you boolean)
language sql stable security definer set search_path=public as $$
  with best as (
    select distinct on(a.user_id) a.user_id,
      case when public.interview_name_has_profanity(p.display_name) then 'Candidate' else p.display_name end as display_name,
      a.score,a.completed_at
    from public.interview_attempts a join public.interview_preferences p on p.user_id=a.user_id
    where p.leaderboard_opt_in and a.mode='free' and a.station_slug='why-medicine' and a.status='completed'
      and a.rubric_version='why-medicine-v1' and a.score is not null
    order by a.user_id,a.score desc,a.completed_at asc
  ) select row_number() over(order by best.score desc,best.completed_at asc),best.display_name,best.score,best.completed_at,best.user_id=auth.uid()
    from best order by best.score desc,best.completed_at asc limit 100;
$$;
revoke all on function public.interview_leaderboard() from public,anon;
grant execute on function public.interview_leaderboard() to authenticated,service_role;

commit;
