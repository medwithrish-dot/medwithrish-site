# Interview personalisation and review

## Storage

Apply `supabase/phloemai_interview_applicant_activity.sql` after the dashboard and question-progress migrations. Both combined setup files include it. This additive migration stores applicant confirmations and distinct completed questions per London calendar day. It does not alter saved transcripts or interview dates. No hosted migration was applied during implementation.

Applicant confirmations are explicit, self-reported Yes/No values; missing values are unknown. Graduate entry never implies a completed degree. Session selection, safe fallback selection and generated follow-ups enforce the profile. Existing saved interview questions remain intact. New spoken transitions and confirmation prompts are retained in the existing answers JSON, including their position in the answer; older unrecorded speech is not reconstructed.

Saved history groups by `circuit_id`. Each station still owns its transcript and feedback. The report page queries only the authenticated owner's circuit and provides station links and previous/next navigation. Retrying creates a separate interview. Ending the final review returns to the dashboard.

The daily chart counts distinct bank questions completed that day, including main interview questions linked to the bank. Repeating the same question on another day adds that day without erasing prior activity. Repeated saves on the same day do not inflate counts. Initial backfill can recover only the latest completion in existing question-progress records, not older overwritten completions or unlinked generated follow-ups.

## University Topic Defaults

Checked 16 September 2026. Topic mappings are practice interpretations of published assessment areas, not claims to know confidential interview stations or reproduce a complete circuit. Only currently supported practice topics are selected. Calculation, role-play and group tasks are not fully replicated by a solo interview.

- [Manchester](https://www.bmh.manchester.ac.uk/study/medicine/apply/interviews/): motivation, reflection on caring, current medical issues and ethics.
- [Birmingham](https://www.birmingham.ac.uk/schools/medical-school/faq-briefing-medicine-candidates): commitment, insight, professionalism, ethical challenges and data interpretation.
- [Imperial](https://www.imperial.ac.uk/medicine/study/undergraduate/medicine-mbbs-programmes/mmi/): motivation, reflection, teamwork and ethical values.
- [King's](https://www.kcl.ac.uk/study/undergraduate/courses/medicine-mbbs/requirements): suitability, social issues and ethics.
- [Anglia Ruskin](https://www.aru.ac.uk/study/admissions/interviews-auditions-and-portfolios/medicine-interview-process): preparation, motivation, interpersonal skills and judgement.
- [Dundee](https://www.dundee.ac.uk/undergraduate/medicine/interview): group communication, personal values and professionalism.
- [Southampton](https://www.southampton.ac.uk/medicine/undergraduate/apply.page): motivation, reflection on experience and group discussion.
- [Hull York](https://www.hyms.ac.uk/medicine/interviews): career insight, current medical issues, ethics, NHS values and teamwork.
- [Cardiff](https://www.cardiff.ac.uk/documents/2734195-admissions-information-for-studying-medicine-at-cardiff): motivation, ethics, NHS knowledge and teamwork.

Universities without a verified topic mapping have no automatic selection. Students can select a custom set. Existing timing notes are retained separately and may contain practice approximations. Oxford and Cambridge remain available as saved university/date choices and in legacy reports, but are excluded from the standard interview catalogue, setup picker and new-circuit API. Their separate academic interview mode is not implemented here.

## Verification

Tests cover profile validation, personal-history exclusion across random seeds, generated follow-up rejection, interviewer speech preservation, circuit grouping, immediate continuation, migration reruns, London day boundaries, deduplication and account isolation. Browser checks cover setup selection, dashboard editing, activity controls, transcript rendering, the end link and grouped history at desktop and narrow mobile sizes using isolated fixtures. No paid AI requests or hosted account changes are needed.
