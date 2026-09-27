-- Apply to an existing interview installation after medicforest_interview_platform.sql.
-- Updates only the grading claim; unrelated platform functions stay intact.
begin;
create or replace function public.claim_interview_grading(p_user uuid,p_attempt uuid,p_token uuid)
returns public.interview_attempts language plpgsql security definer set search_path=public as $$
declare v_row public.interview_attempts;
begin
  select * into v_row from public.interview_attempts where id=p_attempt and user_id=p_user for update;
  if not found then raise exception 'Interview not found'; end if;
  if v_row.status='completed' then return v_row; end if;
  if v_row.last_error='abandoned' then raise exception 'This interview was ended. Start a new station.'; end if;
  if v_row.completed_at is null or v_row.status not in ('failed','grading') or
    (v_row.status='failed' and coalesce(v_row.last_error,'') not in ('awaiting_feedback','feedback_unavailable')) then
    raise exception 'Finish the station before requesting feedback.';
  end if;
  if (select count(*) from regexp_split_to_table(btrim((select string_agg(a->>'answer',' ') from jsonb_array_elements(v_row.answers) a)), '\s+') word where word <> '') < 20 then
    raise exception 'Save at least 20 words before requesting feedback.';
  end if;
  if v_row.status='grading' and v_row.grading_started_at > now()-interval '90 seconds' then raise exception 'Feedback is already being generated. Please wait.'; end if;
  if v_row.grading_tries >= 3 then raise exception 'Feedback retry limit reached for this station. Your answers are saved.'; end if;
  update public.interview_attempts set status='grading',grading_token=p_token,grading_started_at=now(),grading_tries=grading_tries+1,last_error=null where id=p_attempt returning * into v_row;
  return v_row;
end; $$;
revoke all on function public.claim_interview_grading(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.claim_interview_grading(uuid,uuid,uuid) to service_role;
commit;
