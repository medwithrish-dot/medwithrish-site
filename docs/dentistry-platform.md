# Dentistry interviews

Dentistry is available at `/dentistry/interviews/dashboard` on MedicForest, or `/medicforest/dentistry/interviews/dashboard` in the local checkout. The area switcher and mobile navigation link to both platforms. Existing medicine routes and questions remain in place.

## Shared implementation

Both platforms use the existing dashboard, question bank, question practice, AI room, speech hook, timers, question selection, optional follow-ups, assessment, saved reviews and history. `utils/interviews/catalogue.ts` supplies the relevant content. Client context scopes links; interview API requests use `platform=dentistry`. Requests without a platform retain medicine behaviour. Ownership checks apply alongside platform filtering.

Dentistry has 110 original questions and individual markschemes across 11 topics, six guides and six sourced dental-school preparation pages. Questions use everyday language and assess applicants' reasoning rather than specialist clinical knowledge. Physical dexterity, live role play and group interactions need practical preparation outside the app; guides explain this limit. Dexterity interview questions assess reflection on learning a skill, not the quality of a physical task. University circuits are labelled rehearsals, not reproductions of confidential stations or promised timings. Recheck each official source when updating admissions guidance.

Dentistry AI interviews use the existing Premium entitlement. The question bank and guides use the existing free access rules. The existing lifetime free AI feedback credit and daily/monthly AI limits remain account-wide. Medicine's free Why Medicine challenge remains unchanged. Medicine-specific leaderboard, study groups and tutoring are not presented as dentistry features.

## Database rollout

Apply `supabase/medicforest_dentistry_platform.sql` after existing interview, dashboard, question-progress and applicant-activity migrations, before deploying this application version. Both `RUN_ALL_INTERVIEW_SETUP.sql` and `RUN_ALL_MEDICFOREST_SETUP.sql` include it last. No hosted migration has been applied as part of this work.

Attempts gain a platform field defaulting to medicine. Existing question IDs remain unchanged; new dentistry IDs begin `dq-`. Question progress and daily activity derive their platform from these IDs. Saved history, grading, follow-ups and dashboard totals filter the correct platform. The reservation function preserves account-wide quota locks while allowing separate active medicine and dentistry sessions.

Medicine preparation profiles keep their existing primary key and support older `ON CONFLICT(user_id)` saves. Dentistry preparation profiles use a separate table with the same validated columns and owner-read policy, selected through the shared preparation service. Browser clients cannot write directly to either table. Existing medicine data is preserved.

The application requires the new schema for platform-filtered attempts and progress. A code-only deployment is insufficient. If rolling application code back after dentistry has been used, keep the schema and data; older unfiltered application readers need platform filtering before they can safely display mixed-platform attempt tables.

## Question audio

All 110 fixed dentistry questions have female and male Google Chirp 3 HD recordings, using the same Aoede and Charon UK voices as medicine. Stable question IDs map to `public/audio/{female,male}/dq-*.mp3`; existing medicine recording numbers are unchanged. The room and its voice-test button use these recordings. Newly generated follow-ups retain the existing speech endpoint and browser fallback.

Run `node scripts/generate-dentistry-audio.mjs` to generate missing files using local ADC or the configured server service-account credential. It skips existing recordings. Scan with `python scripts/audit-interview-audio.py --output <report.json>`, then regenerate flagged dentistry files with `node scripts/generate-dentistry-audio.mjs --audit <report.json>` and scan again.

On 10 November 2026, all 1,568 recordings passed decoding, clipping, silence and volume-spike checks, including all 220 new dentistry recordings. None required regeneration. [Dentistry measurements and file hashes](dentistry-audio-audit.json) record the results. These are automated waveform checks, not a pronunciation or listening verdict.

## iPhone speech

The shared speech hook uses single-utterance recognition on iPhone/iPad and restarts after a normal recognition end while retaining the transcript. It avoids starting a second microphone capture for volume monitoring. Question-bank voice practice also avoids simultaneous audio recording on these devices and explains that audio replay is unavailable; desktop recording remains available. This addresses the WebKit capture conflict described in [WebKit issue 220133](https://bugs.webkit.org/show_bug.cgi?id=220133).

Automated checks exercise iPhone and iPad detection, recognition restarts, transcript retention, pauses and desktop behaviour. Local browser fixtures simulate recognition events; they cannot verify Apple's speech service, device permissions or a physical iPhone microphone. Before release, test a real iPhone over HTTPS: allow microphone access, speak two sentences separated by a pause, check the transcript, advance to the next question, finish and reopen the saved review. Repeat in question-bank voice mode.

## Local checks

- `npm test`: existing SEO, security, unit and database regressions.
- `npm run test:dentistry`: content, selection, platform separation, markschemes and actual PostgreSQL migration/permission checks.
- `npm run typecheck` and `npm run build`.
- With the local server on port 3100, `node scripts/test-dentistry-browser.mjs` and `node scripts/test-interview-review-browser.mjs`: fixture-based dentistry and medicine browser checks. Neither script writes account data or calls an AI provider.

The migration test runs the migration twice, preserves older medicine rows, verifies legacy preparation saves, isolates active sessions and scores, and checks ownership and shared usage limits.
