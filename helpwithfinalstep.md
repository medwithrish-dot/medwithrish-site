# helpwithfinalstep

Launch handover - 5 October 2026. UCAT internals were excluded from this review.

## What is ready, and what still needs attention

- Guests can browse interview sections. Starting question practice, using groups or saving a plan asks them to sign up free/log in. Starting a paid interview asks Free users to upgrade. Popups appear on actions, not page arrival. Direct question links show an inline signup action.
- **One scored free Why Medicine attempt per account. Starting consumes it, including abandoning it.** Refresh/resume and retrying the same reservation reuse that attempt. Free users can still generate/retry failed feedback on the saved trial without spending another trial. Premium retries create paid `station` attempts; they do not alter the free leaderboard. Browser room previews do not save a score or consume the trial.
- Retrying saved interviews, reviewing ordered circuit stations and continuing unfinished circuits already exist. Retain the regression tests in `scripts/test-saved-interview-review.mjs`, `test-saved-interviews.mjs` and `test-interview-room.mjs`. Questions advance forward during timed stations; arbitrary backwards editing is deliberately unavailable in scored practice. Consider a separate untimed replay mode if that is wanted.
- UCAT is unavailable on both plans and routes to a WIP page. Its diagnostic AI API is also paused. Do not sell UCAT access until ready.
- **Leaderboard issue found:** the configured Supabase project rejects guest access with `42501: permission denied for function interview_leaderboard`, so the guest board currently returns HTTP 503. The same RPC succeeds with the server role and currently has zero entries. Apply `supabase/medicforest_interview_public_leaderboard.sql` to repair guest access; no private attempt-table access is needed.
- **Before launch:** run the trial and leaderboard migrations below; test real email verification/password reset, Stripe purchase/cancellation/webhook replay, and one real scored trial on a dedicated test account. Confirm Supabase email redirect allowlists include the production account URL. The account page supports returning to the chosen interview feature after login.
- **Still to implement:** paid OpenAI feedback and transcription; durable job queue and global spend controls for high usage; self-service account deletion (currently email support); a clear account password-reset flow; real multi-account/load testing. Confirm study-group practice rooms promised by pricing are reachable in the UI; the current Groups screen primarily exposes membership, invites and group scores while room APIs exist.
- **Feedback calibration:** the displayed 96% reference is a challenge benchmark, not proof of a validated model score. Regrade a consented reference answer under the same rubric/model before promoting it as a measured comparison. Model changes need a new rubric/version cohort; do not silently mix their scores on one board.

## Supabase SQL

Existing working installation: paste **`supabase/medicforest_interview_free_trial.sql`** and then **`supabase/medicforest_interview_public_leaderboard.sql`** into SQL Editor and run them before deploying. This keeps old records and adds the transactional one-trial guard. The API also checks previous trials; the SQL lock is the final protection against races. The migration and both bundled setup scripts are updated and safe to rerun.

Fresh project: run `supabase/RUN_ALL_MEDICFOREST_SETUP.sql`, then `medicforest_interview_free_trial.sql`. Existing project missing interview tables: use `RUN_ALL_INTERVIEW_SETUP.sql` first. If billing has not been set up, also run `medicforest_stripe_setup.sql`. See the individual dashboard, applicant-activity and name-moderation migrations for any older installation missing those additions. Back up before applying SQL; never reset production tables to fix a frontend error.

The existing leaderboard repair contains this narrow grant (apply only after the interview setup creates its opted-in public RPC):

```sql
begin;
grant execute on function public.interview_leaderboard() to anon;
commit;
```

Useful SQL checks (run as the project administrator; these expose no transcripts):

```sql
-- Profiles, plans and scores must stay protected by RLS.
select tablename, rowsecurity from pg_tables
where schemaname='public' and tablename in
  ('profiles','interview_attempts','interview_preferences');

-- Expected: false, false, true. Clients must not grant themselves Premium
-- or reserve paid/scored attempts directly.
select has_column_privilege('authenticated','public.profiles','current_plan','UPDATE')
  as client_can_change_plan,
  has_function_privilege('authenticated',
    'public.reserve_interview_attempt(uuid,jsonb,integer,integer)','EXECUTE')
  as client_can_reserve,
  has_function_privilege('anon','public.interview_leaderboard()','EXECUTE')
  as guests_can_view_board;

-- Trial count includes historical attempts; do not delete them to reset access.
select user_id, count(*) as trials from public.interview_attempts
where mode='free' group by user_id having count(*) > 1;

-- Check the narrow public leaderboard, not the private attempt table.
select * from public.interview_leaderboard();

-- Diagnose delayed grading; do not mass-update these rows during active jobs.
select status, count(*), min(grading_started_at) as oldest_claim
from public.interview_attempts group by status;
```

Legacy accounts with multiple free attempts keep their historical best score but receive no further free trials. The leaderboard returns opted-in nicknames, capped scores, dates and ranks; anonymous users cannot read answers. SQL tests check owner-only reads, immutable client scores, opt-out, best-score selection, retries and group isolation. These tests use embedded PostgreSQL, not the deployed project; inspect the live board after migration.

## Security and handling lots of users

Added: request-origin checks across mutation APIs (signed Stripe webhooks exempt), bounded streamed request bodies with timeouts, safe login return URLs, bounded API rate-limit storage, baseline CSP against framing/plugins/base-URL changes, and generic provider errors. Existing server-only secret modules, ownership checks, RLS, transactional attempt quotas, grading tokens and Stripe signature verification remain in use. Never put OpenAI, Gemini, Stripe secret or Supabase service-role keys into a `NEXT_PUBLIC_*` variable. Supabase's public key is intentionally public and relies on RLS.

The installed Next.js release was flagged by [GHSA-vcvr-r3jv-pc5j](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j); update to the patched 16.3.8 dependency and keep `npm audit --omit=dev` in release checks. There is no identified attacker-controlled `next/og` path in this app, but patching removes that vulnerable dependency. The production audit now reports zero vulnerabilities. The full audit still reports six high-severity development-tool findings in the ESLint glob/braces dependency chain; follow compatible upstream tooling fixes rather than forcing a Next.js/ESLint downgrade.

1. Configure the hosting firewall: start with logged API rules, then rate-limit abusive mutations and bots; exclude legitimate signed Stripe deliveries from browser challenges. Application limits are **per server instance**, so they cannot stop a distributed attack or enforce a global budget. Use a hosting WAF plus a shared limiter (Redis or a transactional SQL limiter) before large paid-AI traffic. Set signup email verification, Auth rate limits and CAPTCHA to slow repeated trial-account creation. [Vercel rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting)
2. Keep audio/images on the CDN, paginate histories and cache only anonymous public data briefly. Never share-cache account responses. Current group polling pauses in hidden tabs and backs off; monitor its aggregate database usage.
3. Queue feedback/transcription jobs with durable IDs, bounded worker concurrency, at most one active job per attempt, and exponential backoff with jitter for provider 429/503. Keep saving transcripts available while AI is busy. Existing provider admission/cooldown is instance-local; a queue must coordinate all instances.
4. Watch p95 latency, 5xx/429 rates, DB CPU/connections, queue depth, provider quota and actual cost. Start with 10, then 25, 50 and 100 separate staging accounts using `scripts/load-interviews.mjs`; target p95 under 2 seconds for normal reads and under 1% unexpected errors. Use a separate, budget-capped test for AI jobs. Passing unit tests is not a capacity guarantee.
5. Set database/provider/hosting usage alerts and an application daily spend ceiling. Size Supabase compute from measured queries. The current Supabase client uses HTTP; if introducing direct Postgres workers, use transaction pooling instead of opening a pool per request. [Supabase connection guidance](https://supabase.com/docs/guides/database/connecting-to-postgres)
6. Maintain backups and practise a restore to a separate project. Free plans need off-site exports; available managed backup/PITR depends on your plan. [Supabase backups](https://supabase.com/docs/guides/platform/backups)

## If load crashes the site

1. Check `/api/health`, hosting error logs and Supabase/provider dashboards. That endpoint checks liveness only, not configuration, the database or providers; a 200 does not prove feedback is working.
2. If traffic is abusive, enable the WAF rate/challenge rule. If AI is overloaded, pause new AI jobs; for the current Gemini adapter unset `INTERVIEW_GEMINI_FREE_TIER_CONFIRMED` and redeploy. Keep browse/save/review available. Do not raise concurrency while the database/provider is already saturated.
3. Roll back the deployment if errors started with a code release. For DB saturation, find slow queries/locks and scale compute after identifying the bottleneck; avoid indiscriminately killing connections.
4. Submitted answers survive independently of grading. Let existing claims finish or become stale and use the saved review's feedback retry. Never release a fresh grading claim or blindly regrade completed attempts; that creates duplicate costs and inconsistent scores.
5. Once stable, run a single test-account journey, replay any failed Stripe events, then gradually re-enable AI admission. Restore backups only for confirmed data loss, into a separate project first. Record the incident and add a regression for its actual cause.

## Paid OpenAI feedback and AI transcription

**Recommended starting point (our recommendation, subject to calibration):** one text model, `gpt-6.1-sol`, for feedback and follow-ups; `gpt-4o-mini-transcribe` for speech-to-text. You do not need several feedback AIs voting on each answer. A stronger second assessment is optional for evaluation or flagged edge cases. Benchmark `gpt-6-luna` as a cheaper alternative only if it meets the same acceptance criteria. Both text models support structured output. [Sol model](https://developers.openai.com/api/docs/models/gpt-6.1-sol), [Luna model](https://developers.openai.com/api/docs/models/gpt-6-luna)

Implementation work still required:

1. Create an API project with billing and a scoped server key. Add `OPENAI_API_KEY`, `INTERVIEW_OPENAI_MODEL=gpt-6.1-sol` and `INTERVIEW_TRANSCRIPTION_MODEL=gpt-4o-mini-transcribe` as server deployment variables. Install the official `openai` SDK. Use API billing rather than expecting a ChatGPT subscription to pay for site requests. [Developer quickstart](https://developers.openai.com/api/docs/quickstart)
2. Extract the prompt, rubric and validation from `utils/interviews/gemini.ts` into a provider-neutral assessor. Replace the provider generation call with `client.responses.create`, trusted instructions plus the saved transcript, `store: false`, an output-token cap and a timeout. Convert Google's uppercase schema types into JSON Schema, require every field and set `additionalProperties: false` on each object. Parse only a completed response, handle refusals/incomplete output and pass it through `validateFeedback`. Keep the server's score calculation; never accept an AI-supplied final percentage. [Structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
3. Preserve `feedback-service.ts` ownership checks, durable grading claims, retry limits and saved-transcript workflow. Update follow-up generation and `interviewAiConfigured()` too; merely adding an OpenAI key does not activate it. Log model/rubric versions, request IDs, token use and cost, without private transcript text. Add server-side spend reservation before requests and reconcile actual usage afterwards.
4. Add an authenticated `/api/interviews/transcription` route tied to the caller's active attempt. Reserve per-user audio minutes before accepting uploads; validate real MIME/container, byte count, audio duration and ownership. Upload short compressed chunks, assign sequence numbers, deduplicate retries, and keep interviewer playback out of candidate audio. The current generic API body cap is 45 KB: add a route-specific audio allowance and streamed size checks without relaxing other endpoints. File transcription supports uploads up to 25 MB; choose a smaller application cap. [Speech-to-text](https://developers.openai.com/api/docs/guides/speech-to-text)
5. Replace browser-only recognition in `useInterviewSpeech.ts` with this adapter, keeping typed answers available and persisting final transcript segments before grading. A live transcript requires the documented Realtime transcription workflow; a file request after recording provides delayed transcription. Measure accents/noise/medical vocabulary before selecting live versus chunked recording. Tell users which audio/transcripts leave the browser, set retention, and review processor terms before launch.

Estimated **USD**, standard API rates checked 5 October 2026: Sol input $2/output $10 per million tokens; Luna $0.10/$0.50. Mini transcription is estimated at $0.003/minute. [Official pricing](https://developers.openai.com/api/docs/pricing)

Planning assumption: 4,000 input + 1,200 output tokens per station, 8 recorded minutes, one feedback call; no caching discount. These are calculations, not guaranteed bills:

| Pipeline | Feedback | Transcription | Total/station | 1,000 stations | 10,000 stations |
|---|---:|---:|---:|---:|---:|
| Sol + Mini transcription | $0.020 | $0.024 | $0.044 | $44 | $440 |
| Luna + Mini transcription | $0.001 | $0.024 | $0.025 | $25 | $250 |

Formula: `input_tokens × input_rate / 1,000,000 + output_tokens × output_rate / 1,000,000 + audio_minutes × minute_rate`. Add follow-ups, retries, any billable reasoning, hosting, DB/storage, payment fees, taxes and currency conversion. Five stations per 1,000 users means 5,000 stations: roughly $220 on the Sol assumption. Record actual token/audio usage and budget with headroom; pricing or account model availability can change.

## Calibrating feedback

Build a consented, anonymised set of 100–200 answers across stations, skill levels, typed/spoken input and speech/transcription conditions. Have two trained human assessors score the existing five criteria independently, then resolve disagreement. Hold out part of the set. Compare model criterion scores, explanations, human error and repeated-run stability; test blank answers, invented experiences and prompt-injection text. [OpenAI evaluation workflow](https://developers.openai.com/api/docs/guides/evals)

Our proposed launch thresholds: mean absolute score error within 5 percentage points, repeated grades within 3 points, and no unsupported claims about the answer or discriminatory scoring in the checked sample. These are product targets, not measured results. Calibrate rubric anchors and examples rather than inflating a percentage to match 96%. Evaluate clean transcripts and actual transcription outputs separately; let candidates correct transcription errors before submission. Keep voice/typed scoring equivalent and exclude accent, filler words and unsupported body-language inference. Freeze prompt/model/rubric versions per leaderboard cohort and re-evaluate before changing them.
