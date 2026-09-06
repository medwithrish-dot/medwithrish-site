# Interview platform setup and operating notes

## Run the SQL

**Single-paste option for the existing project:** open `supabase/RUN_ALL_INTERVIEW_SETUP.sql`, copy its complete contents into a new Supabase SQL Editor query, and run it once. It includes the security patch, question-bank progress, interview platform, groups and dashboard scripts in dependency order, inside one transaction. You do not also need to run the individual files below. The base `public.profiles` account table must already exist; for a new database follow the initial setup instructions below first.

For the existing PhloemAI Supabase project, open **SQL Editor**, run each complete file separately, and wait for success before the next file:

1. `supabase/phloemai_security_patch.sql` — protects the existing account plan from browser edits. Safe to rerun.
2. `supabase/phloemai_interview_platform.sql` — private attempts, scores, opt-in leaderboard, durable usage limits and grading locks.
3. `supabase/phloemai_interview_groups.sql` — study groups, membership, invitations and shared station rooms.
4. `supabase/phloemai_interview_dashboard.sql` — university choices/dates, preparation goals, task completion and precise practice-time tracking. If steps 1–3 are already installed, only this new file is needed for dashboard personalisation.

If the question bank's existing account progress has never been set up, also run `supabase/phloemai_interview_question_progress.sql`. The interview scripts do not replace that feature.

For a completely new database, first run `supabase/phloemai_setup.sql`, `supabase/phloemai_practice_setup.sql`, `supabase/phloemai_stripe_setup.sql`, and `supabase/phloemai_interview_question_progress.sql`, then the numbered steps above. Use the SQL Editor's normal privileged database role. The new tables and functions are additive and rerunnable; they do not overwrite accounts or existing practice history.

The new migrations have been tested locally, but are deliberately **not applied to the hosted database**. Until you run them, affected screens show a setup message rather than pretend to save data. No Supabase Realtime publication, storage bucket, cron job or video service is required.

## Server environment

Keep the existing Supabase URL, publishable/anonymous key and `SUPABASE_SERVICE_ROLE_KEY`. Server grading and score writes require the service role; never put it in a `NEXT_PUBLIC_` variable. These interview routes use **only `GEMINI_API_KEY`** for AI. There is no Anthropic import, request or fallback anywhere in the new interview flow.

| Variable | Default / use |
| --- | --- |
| `GEMINI_API_KEY` | Required for feedback; already present locally. Ensure it is also present in the hosting environment. |
| `INTERVIEW_GEMINI_MODEL` | `gemini-3.5-flash-lite` |
| `INTERVIEW_FREE_DAILY_LIMIT` | `2` station starts per rolling 24 hours |
| `INTERVIEW_FREE_MONTHLY_LIMIT` | `30` station starts per rolling 30 days |
| `INTERVIEW_PREMIUM_DAILY_LIMIT` | `20` station starts per rolling 24 hours |
| `INTERVIEW_PREMIUM_MONTHLY_LIMIT` | `300` station starts per rolling 30 days |

These are adjustable initial cost controls, not a promised unlimited plan. All station starts count, including ended attempts. Premium limits cover free and premium stations together. A university circuit uses one allowance per station. Set provider billing limits/alerts appropriate to your launch size. Keep the model stable within a leaderboard rubric version; changing assessment behaviour should get a new version and deliberate leaderboard reset/migration.

The existing preview-access gate remains active. For local preview use the existing `/phloemai/access` screen with `PHLOEMAI_PREVIEW_PASSWORD` configured for the local server. The platform is not made publicly accessible by this change. Existing Stripe billing is retained; **this work does not change the Stripe price to £15**. Configure that product/price when you choose to launch the £15 subscription.

## How the interview works

- Free **Why medicine?** appears first. It uses one minute of preparation, eight minutes of answering, and three original prompts/follow-ups. Voice and typed answers use identical questions and scoring.
- All 42 requested university/awarding entries can launch a practice circuit. Formats, source links and uncertainties are in `docs/interview-university-sources.md`. A practice preset is not a claim that a university uses our questions or exact schedule. Panel/group assessments are clearly marked as adaptations.
- The explicit five-station reference circuit is motivation, work experience, disability/access, equality/diversity/inclusion, and Ozempic. Each station is eight minutes with two-minute gaps. Manchester's sourced preset matches that overall timing.
- The interviewer reads structured prompts with browser speech synthesis. Optional browser speech recognition transcribes the candidate's answer; the candidate can use the text box if their browser lacks it. The browser's speech service may process microphone audio outside the device, which the consent text explains. The platform sends saved text to Gemini only when feedback is requested. No audio/video is uploaded to this application's server.
- Questions are curated; the AI assesses the complete station once, rather than opening an expensive always-on voice connection or calling an LLM on every sentence. The user advances through the follow-ups within the station clock.
- No webcam, gaze, fidgeting, face tracking or MediaPipe is used by the interview runner. Optional filler/repeated-word hints are computed from text. These are not reliable stutter detection and never reduce the candidate's score. No disability, accent or speech difference is scored.
- Timer timestamps come from the server. Dirty transcripts save at most every 15 seconds plus transitions/submission. A local draft helps recover interrupted work. A 30-second transport grace accepts the final in-flight save; the interface still stops answers at the actual deadline.
- A database claim prevents concurrent feedback calls. Calls time out after 25 seconds, output is schema-validated, and a station allows at most three feedback tries. Completed results are returned without generating another charge. Invalid/provider-failed output never receives a placeholder score.

## Groups and leaderboard

Create a group and share its invitation yourself. No email or message is sent by the application. Invite codes are random, stored only as hashes, expire after seven days, and can be rotated. Invitation URLs put the code in a fragment so it is not sent in a server request URL. Joining a group shares your display name and best completed free Why medicine? score with that group's members; it does not expose your private AI transcript.

The group owner creates and starts a shared eight-minute station. Members contribute their own responses and a text discussion. The room timer is shared and authoritative; polling slows when idle and pauses when hidden. There are no video calls or continuous AI charges. **Group assessment scores remain “Awaiting scoring rules”**, ready for the owner's future scoring design. The displayed Why medicine? personal best is labelled separately.

The overall leaderboard includes only opted-in, completed free Why medicine? attempts under rubric `why-medicine-v1`. It shows a nickname, score and rank, never email, user IDs or transcripts. One best attempt per person is ranked; equal scores use earliest completion. Members can withdraw their score or change their nickname.

## Personal dashboard

The optional setup saves up to ten universities, dates (or “not confirmed”), preparation experience, up to three focus themes, and a weekly goal of 1–14 stations. Students can change or remove these details from the dashboard or plan page. These preferences do not unlock paid content or alter grades. Only the account owner can read them. New or signed-out students see useful empty states, never example dates or results.

- **Practice statistics:** lifetime completed count, scored count, average and answering time come from a private SQL aggregate. No transcripts are sent to the dashboard. New attempts record the first submission timestamp, so preparation and grading/retry delays are excluded. Older durations are explicitly labelled estimates and capped to station duration.
- **Recent score:** the ring averages the latest five scored attempts and shows its sample size. It is labelled a practice score, not a prediction of admission or a manufactured readiness measure.
- **Your interviews:** schools come from the student's shortlist. Countdowns use Europe/London calendar days, including daylight-saving transitions. Unknown and past dates have distinct labels. Each school's average uses only its latest five scored university-specific attempts; generic practice is never copied across schools.
- **Next action and today's plan:** completed history, stated focus, preparation experience, approaching dates, account access and weekly goal inform suggestions. Plans use results from before the current UK day, so completing a station checks it off instead of replacing it. Reading/reflection tasks have explicit saved completion controls. Station completion always comes from a completed attempt, never a client checkbox. Daily tasks reset with the UK date.
- **Strengths and weaknesses:** each theme uses up to five recent scored samples. Comparisons need at least two themes with two or more samples each; tied themes are not labelled a strength or weakness. Single attempts stay visible without a strong inference.
- **Weekly insight:** compares the current seven UK calendar days with the preceding seven, requiring at least two scores in each. Changes are percentage points; different station mixes are disclosed. Weekly goal progress counts completed stations, not guide checkboxes.
- **Bounded queries:** activity and theme detail uses the latest 500 lightweight attempt records. A note appears when history exceeds this; lifetime totals still include every saved attempt. Personalisation is deterministic and makes no additional AI requests.

After the dashboard SQL, check two accounts: save/remove schools, clear a known date to unknown, refresh and verify persistence; record a real interview and check today's task, recent score and totals; mark/unmark a reading task and verify that it is private to the current account. Dates are personal planning information and do not schedule emails or change any university's actual interview arrangements.

Five equally weighted rubric dimensions are assessed from 0 to 100. The server, not the browser or model's claimed percentage, converts their average `r` to:

```text
score = min(99, round_to_1_decimal(99 × ln(1 + 9 × clamp(r / 100, 0, 1)) / ln(10)))
```

This fixed logarithmic scale requires increasing rubric evidence for each extra percentage point. It is an initial practice rubric, not a validated predictor of admissions decisions. There is no completion/streak bonus. Prompts and submitted text are untrusted input to the assessor; the model is instructed to ignore embedded scoring instructions, and numeric/schema validation is enforced before saving.

## Cost illustration

Google's [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing) lists 3.5 Flash-Lite standard input at $0.30 and output at $2.50 per million tokens, checked 6 September 2026. At an illustrative 6,000 input tokens plus the configured 1,800 output-token ceiling, one assessment is about **$0.0063**, or **$1.89 for 300 assessments**. This is a model-only estimate, not a guaranteed bill; actual tokenisation, retries, hosting, Supabase, payment fees and taxes add costs. Browser speech avoids this application's per-minute transcription/TTS API costs. The design leaves room within a £15 monthly price, subject to real usage and infrastructure measurements. A live check returned valid structured feedback from the configured Gemini key. The older 2.5 Flash-Lite model rejected generation for new users of that model, so the supported replacement is the default.

## Verification and launch check

Run `npm run lint`, `npx tsc --noEmit`, `npm run build`, `node --experimental-strip-types scripts/test-interview-scoring.mjs`, and `npm run test:interviews:db`.
For dashboard date calculations, recommendations, validation and database access tests, also run `npm run test:interviews:dashboard`.

After applying SQL, use two separate signed-in test accounts: create/join a group, compare a saved Why medicine? personal best, start a shared room, contribute answers, and confirm non-members cannot open it. Complete a free interview, view its private report, opt into the leaderboard, and opt out again. Verify a free account cannot start paid circuits. A local PostgreSQL test suite covers permissions, quota/retry logic and group flows; a real hosted two-account pass is still needed after the migration.
