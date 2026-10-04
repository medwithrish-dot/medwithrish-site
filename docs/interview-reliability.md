# Interview reliability review and recovery

Reviewed 4 October 2026. UCAT implementation is outside this review. The twelve areas below cover the interview journey plus its shared account page; university formats have their own route even though they are reached through AI Interviews. Notifications were checked alongside the dashboard.

## Twelve areas, in journey order

| Area | Review and resulting behaviour | Remaining operational check |
| --- | --- | --- |
| 1. Dashboard and notifications | Parallel, private queries; request-scoped React caching; exact lifetime SQL totals and bounded recent history. Timings use London dates. Existing analytics and database tests retained. | Check the real project's dashboard migrations and two signed-in accounts. |
| 2. AI Interviews | Server-owned timing, quotas, saved drafts, serialised autosaves, explicit feedback and database grading locks retained. New provider admission/cooldown protects an instance from overload. The interactive runner loads separately; its landing/history stays on the server. | Hosted Gemini quota and 50 signed-in station users. |
| 3. Question Bank | Split the large file into dashboard, practice view, shared model helpers and storage. Practice loads when opened. Local edits are persisted before network saving; failed saves retry on reconnect, visibility and a 30-second timer. Versioned acknowledgements preserve newer edits; offline resets stay pending until acknowledged. Legacy imports use batches of 100 and do not overwrite remote rows. | Offline/online browser pass, including disabled storage and a shared-device account switch. Local storage is best effort, not a backup service. |
| 4. Guides | Separate browser bundle; local filtering creates no AI requests. Existing catalogue, search and links tests retained. | Editorial review of changing admissions/healthcare content is still required. |
| 5. University formats | Existing catalogue and source notes retained; standard circuits reject academic formats and preserve university timings. | Official admissions guidance can change; curated notes do not update themselves. |
| 6. 1-1 Tutoring | The tutoring page and checkout remain separate from the interview runner. Viewing the page sends no automatic email. The latest tutoring redesign is preserved; no tutoring copy or booking flow change is included here. | Check contact destinations as part of launch QA. |
| 7. Groups | Authenticated transactional RPCs check membership; invitations are hashed and expire. Existing polling has one in-flight request, pauses in hidden tabs and backs off on failures. | Fifty users across active groups can cause roughly 3.3 detail reads/second at a 15-second interval. A group is already limited to 12 members; measure DB latency. |
| 8. Leaderboard | Opt-in public scores and safe nicknames retained. No transcripts are public. Its interactive page loads separately. Existing moderation, privacy and tie-ranking tests retained. | Check the nickname moderation migration is installed. |
| 9. Progress | Uses bounded private dashboard records and exact lifetime totals; no extra AI grading. Existing sample-size, score and date tests retained. | Recent theme detail is bounded to 500 attempts, as disclosed in the UI. |
| 10. Plan | Deterministic tasks and server-validated preparation/pathway updates retained. Daily resets use London dates. | Test dates and task persistence on two hosted accounts. |
| 11. Reports | List loads without transcripts; a selected report checks account ownership and loads its transcript. Existing report-specific recovery retained; a new parent boundary covers the rest of the interview area. Grading locks become retryable after 90 seconds; three grading tries remain the existing ceiling. | History list currently shows the latest 300 attempts. A known older report URL still works; full pagination is a future improvement. |
| 12. Account/access | Profile loading now rejects stale results after an account change or unmount; previous profile data clears during auth changes. Database calls are deferred outside the auth callback. Failed initial auth loading is handled. The proxy lets route-level fallbacks render during refresh exceptions, while preserving the preview gate and route authentication. | Check both domain redirect allowlists and account recovery emails in Supabase. |

## Fifty people: what has and has not been verified

The local production HTTP probe used **50 concurrent workers for 30 seconds**, each making approximately one request per second. It made **1,500 requests**, with **zero failed requests**:

| Route | Requests | p95 latency |
| --- | ---: | ---: |
| `/api/health` | 500 | 209 ms |
| `/medicforest/interviews` | 500 | 416 ms |
| `/medicforest/interview/question-bank` | 500 | 511 ms |

These are local, unsigned HTTP requests, not 50 real browsers or authenticated interviews. They do not measure client rendering, hosted Supabase, Gemini, microphone permissions or billing. The regression suite separately simulates 50 owners saving private question progress, and 50 simultaneous requests to the provider admission controller. Those are isolated code tests, not a hosted capacity certification.

For 50 actively typing interview users, the existing dirty-only 15-second autosave implies at most about **200 periodic save requests/minute** (3.3/second), plus transitions/submission. Fifty stations ending together can create 50 assessment requests in a short burst, plus follow-ups. Google's quota applies per project, not per API key: inspect the actual requests/minute, tokens/minute and daily quota in [AI Studio / Gemini rate limits](https://ai.google.dev/gemini-api/docs/rate-limits). Staying on Free Tier does not guarantee a 50-user assessment burst.

`INTERVIEW_AI_MAX_CONCURRENT` defaults to **20** provider calls per server instance and accepts integers 1–100. Excess requests fail promptly; answers remain saved and follow-ups retain their existing local fallback. Gemini 429/503 responses pause admission for 15–60 seconds using its Retry-After header. Capacity releases in a finally block, and there is no automatic provider retry. A known cooldown is checked before requesting a grading claim. This is instance-local protection: different instances/route processes can each have their own controller. It does **not** enforce a global project-wide rate limit or queue jobs durably. Before a larger paid launch, use the measured quota to decide whether a shared database/Redis limiter and durable feedback queue are needed. Increasing this setting does not increase Google's quota. Existing free-only billing confirmation is unchanged.

Generated speech now has a 10-second provider timeout with SDK retries disabled and a 20-second route ceiling. Recorded questions still use the existing static MP3 files. Sidebar link prefetch is disabled to reduce incidental loading of unused interview sections. No premium entitlement is cached globally or trusted from browser state.

## Run the HTTP probe

Use a production build, not `next dev`. In PowerShell:

```powershell
npm run build
npm run start -- -p 3105
```

In a second terminal:

```powershell
$env:INTERVIEW_LOAD_ORIGIN = 'http://localhost:3105'
$env:INTERVIEW_LOAD_PATHS = '["/api/health","/medicforest/interviews","/medicforest/interview/question-bank"]'
npm run load:interviews
```

The script performs GET requests only, does not follow redirects, prints aggregate timings/statuses, and exits nonzero if errors exceed 1% or p95 exceeds two seconds. A preview redirect, sign-in failure or missing route fails the probe instead of being counted as a successful interview page. It never starts stations or calls AI itself. Defaults are 50 workers and 30 seconds; use `INTERVIEW_LOAD_USERS` and `INTERVIEW_LOAD_SECONDS` to adjust.

For a hosted signed-in read test, set the origin to a staging deployment. Set `INTERVIEW_LOAD_COOKIES_FILE` to the ignored `.interview-load-cookies.json` file containing **50 cookie header strings, one per test account**, including preview access where needed. Never commit this file or share its contents. Add protected dashboard/report paths and `/api/interviews/session`, `/api/interviews/preparation`, `/api/interviews/groups`, `/api/interviews/leaderboard` to `INTERVIEW_LOAD_PATHS`. On medicforest.com use its clean `/interviews/...` paths. For a local host rewrite test, `INTERVIEW_LOAD_HOST=medicforest.com` selects the product routing. This script does not create accounts or refresh expired test-session cookies.

A real browser/staging rehearsal remains necessary: 50 distinct accounts start stations, type/speak, refresh, submit and request feedback while watching database and provider metrics. Use disposable accounts and a controlled provider budget. Do not infer AI capacity from the GET probe. No live writes or paid provider requests were made during this review.

## Why both domains can share this codebase

`next.config.ts` already uses host-based rewrites: medicforest.com shows product routes under clean URLs, while medwithrish.com has the marketing site and prefixed product paths. That is a reasonable setup for this scale. A directory inside the project does not add a networking hop or make the product run inside another browser page. Domain-routing regressions check both forms, redirects, preview access, legal paths and crawler routes.

The domains **share deployment resources, releases and the Supabase project** when configured that way. A bad release or database outage can affect both. Browser cookies and local drafts are scoped to origins, so signing in on one domain does not automatically sign in on the other; accounts and premium plans can still be shared through the database. Configure both Supabase redirect origins and the existing explicit Stripe return destinations. A separate hosting project is useful if independent deployments and failure isolation become necessary; it is not required just because the product lives in this repository. Keep one source of truth for account plans either way.

## Automatic maintenance and owner responsibilities

Included GitHub Actions runs install, lint, typecheck, the regression/database suite and a production build on pushes to main and pull requests. No live credentials are needed for the isolated tests. In GitHub branch protection, require the `verify` job before merging; that repository setting has not been changed by this code. Node 22 is used for CI because the existing tests import TypeScript files directly. The workflow does not deploy, change billing or apply SQL.

Configure an external uptime check for `/api/health` on **both** domains every minute and send failures to an owner-monitored channel. This endpoint checks that the web application responds; it deliberately does not claim that auth, the database or AI is healthy. Monitor signed-in request success and Supabase/Gemini separately. Review 429/503 rates, p95 API latency, database CPU/query latency and function errors after launches. New generic interview errors log only status and error kind, never answer text, credentials or request bodies.

Use a hosting plan sized from the authenticated rehearsal and a database plan with the backups you need. Verify backup retention in your account. Supabase recommends off-site exports for Free Tier projects; see [database backups](https://supabase.com/docs/guides/platform/backups) and [CLI backup/restore](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore). Test restoring to a separate project before relying on a backup. Source code in GitHub is not a backup of students' database records. No backup subscription, uptime service, alert recipient or hosting plan was provisioned by this change.

## If the site crashes or becomes overloaded

1. **Identify the failing layer.** Check `/api/health` on both domains, the host's runtime logs, Supabase status/dashboard, and Gemini's request/quota dashboard. A healthy liveness endpoint with failed saving points to account/database services; failed feedback with successful saving points to Gemini. Record the deployment ID and failure time.
2. **Stop amplifying the problem.** Do not tell students to repeatedly submit or reload. Keep the same browser and its saved data. The question-bank retry queue and interview drafts help recover interrupted work. Provider cooldown and existing group backoff recover automatically when temporary failures clear.
3. **If only AI is down or out of quota,** keep saved practice running. Requests show a retryable error and follow-ups can use the existing local prompt. If necessary, set `INTERVIEW_GEMINI_FREE_TIER_CONFIRMED=false` in hosting and redeploy to disable AI generation without deleting answers. Re-enable only after resolving the provider problem. Changing this flag does not require a database reset.
4. **If a release broke pages,** restore the last known working deployment. On Vercel use Deployments → the previous working deployment → Instant Rollback, according to [Vercel rollback guidance](https://vercel.com/docs/deployments/rollback-production-deployment). Confirm both domains and signed-in saving afterwards. Deployment rollback does not undo database changes; this reliability change requires no SQL migration. On a self-hosted server restart the supervised production process, then roll back the build if it keeps failing; avoid running an unmanaged dev server in production.
5. **If database/hosting capacity is exhausted,** confirm the actual limit, inspect slow queries and temporarily reduce incoming traffic/AI use. Increase the affected capacity only after measurement. More web instances do not increase Gemini quotas or repair a slow database. Do not delete interview rows or restore an older database merely because traffic is high.
6. **Recover interrupted feedback.** Reopen the saved review. Existing locks allow another claim after 90 seconds; avoid submitting again while a claim is active. Completed feedback is returned without a new assessment. The existing three-try ceiling still applies; repeated worker failures can require support or a new practice attempt rather than an endless retry loop. Answers can remain available even if grading cannot be retried.
7. **Restore a database backup only for confirmed data loss/corruption.** First preserve the current state and identify the recovery point; prefer checking a restore in a separate project. An in-place restore can remove newer work. Follow Supabase's backup/restore procedure, not a destructive reset of the setup scripts.
8. **Verify recovery:** sign in with a test account, save and reopen an answer, view a private report, request one controlled feedback result, and check the other account cannot read it. Review errors for the next 15–30 minutes. Record the cause and corrective change.

No service can promise to maintain itself indefinitely. The automatic recovery here handles ordinary transient failures; alerts, tested backups, quota review and occasional dependency/content updates still need an owner.
