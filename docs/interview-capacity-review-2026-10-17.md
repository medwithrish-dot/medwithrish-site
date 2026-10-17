# Interview capacity review — 17 October 2026

## Changes

- Feedback reserves capacity before claiming a grading try. Previously, simultaneous requests could pass the availability check, claim grading, then be rejected by the actual limiter. That could exhaust grading tries without an AI call. Nested provider calls now reuse the reservation through request-local async context.
- Optional shared PostgreSQL admission limits feedback and probes across all participating instances: concurrent requests, rolling-minute starts and provider 429/503 cooldowns. Retry-After values up to five minutes are respected. The local gate still prevents a process burst from overwhelming the database.
- Leases expire after 90 seconds if a worker dies. Normal completion releases capacity in a finally block; release failures cannot hide a successfully saved report. Released starts still count toward the minute limit. Old leases are cleaned during admission, without a cron job.
- Shared storage errors fail closed. Capacity RPCs have three-second deadlines. Feedback routes allow 60 seconds and browsers 70 seconds for admission, the existing 35-second AI deadline and saving.
- History loads only feedback scores; dashboards load scores and improvement tips. Full reports and rewrites load when a report is opened. Pagination and bounded dashboard reads remain intact.

Admission control fits the current interactive flow: probes have a local fallback, and feedback answers are saved before generation and can be retried manually. No background queue, polling loop or automatic paid retry was added. A durable job queue would be useful if feedback must finish after the user closes the page; that requires a worker and a separate queued-job lifecycle.

The configuration-row lock covers only the short database transaction, never AI generation. See PostgreSQL's [row locking documentation](https://www.postgresql.org/docs/17/explicit-locking.html) and PostgREST's [JSON field projections](https://docs.postgrest.org/en/v12/references/api/tables_views.html).

## Required hosted rollout

The hosted database and environment were not changed. Git push does not apply SQL or transfer environment variables. Local fixes and lighter queries work immediately; shared protection requires:

1. Run `supabase/medicforest_interview_ai_capacity.sql` in Supabase SQL Editor. It is additive and rerunnable. Both combined setup scripts include it.
2. Tune `interview_ai_capacity_config` to the actual provider/project quota and hosting capacity. Defaults are **20 concurrent reservations** and **60 starts per rolling minute**. These are application settings, not a measured capacity guarantee. For example:

   ```sql
   update public.interview_ai_capacity_config
   set max_concurrent = 10, requests_per_minute = 30
   where id = true;
   ```

3. Set `INTERVIEW_AI_SHARED_LIMITS=true` on **every deployment** sharing the provider quota/database, then redeploy. Keep `INTERVIEW_AI_MAX_CONCURRENT` at or below the shared cap; it controls each process only. The new flag defaults off so deploying code cannot disable AI on an unmigrated database. Older instances remain unprotected until drained.
4. Check signed-in feedback, saved-report reuse and probes. Monitor 503s, provider 429s, latency and metadata-only `interview_capacity_*` logs. Privileged operators can inspect configuration and leases; browser roles cannot access them or execute the capacity functions.

The minute budget counts reservations, including ones later rejected by account/grading checks, deliberately erring toward fewer provider calls. It does not enforce token-per-minute or monetary budgets: tune starts/concurrency for transcript sizes and retain provider project spending/quota controls. Other applications sharing provider quota must participate or have separate budgets. Google speech uses a separate provider and retains its existing account quota, short deadline and process cache.

Rollback: disable the flag and redeploy to return to local admission. No report/table deletion is needed. This removes global protection.

## Verification and limits

The new test executes the actual migration in embedded PostgreSQL with ten independent application-module instances. A burst of **200 requests** admits exactly **7** with a configured cap of 7. Tests cover rolling-minute enforcement after release, nested reuse, shared cooldowns, expired-lease cleanup, duplicate tokens, role permissions, fail-closed admission and successful-result preservation on release failure. A route regression proves a rejected overlapping request consumes no additional grading try. History regression verifies scores survive the narrower projection.

Embedded PostgreSQL serializes transport: this checks application invariants and SQL behavior, not multi-connection performance. It is not a hosted load test or evidence that 200 simultaneous live interviews are supported. Before a high-traffic launch, rehearse distinct signed-in accounts against staging and measure database/provider latency and quotas. The existing `npm run load:interviews` measures read-only HTTP traffic, not AI capacity. No paid provider requests or production writes were used for this review.

Final checks passed: 363 unit tests, 34 platform PostgreSQL checks, 14 dashboard PostgreSQL checks, and the profile-security test; TypeScript and production build passed. ESLint passed with 23 existing warnings in unrelated files and no errors. A zero-row hosted read confirmed the feedback JSON projections are accepted; a read-only schema check confirmed the new capacity table is not yet installed.
