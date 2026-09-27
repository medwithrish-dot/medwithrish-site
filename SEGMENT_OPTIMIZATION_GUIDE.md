# Segment Optimization Guide & AI Verification Log

This document serves as the master record of all codebase segment optimizations on the MedWithRish / MedicForest platform (`medwithrish-site`). It details what was done, why it was done, the architectural design decisions, and step-by-step instructions for any reviewer or AI agent to verify what was done and confirm system integrity.

---

## Global Verification Commands

Any AI or engineer reviewing these changes can verify repository health using these commands in project root:

```bash
# 1. Typecheck the entire project (zero errors required)
npx tsc --noEmit

# 2. Run the full unit test suite (234 tests passing at the Segment 5 audit)
npm run test:unit

# 3. Run the billing test suite (11 tests)
node scripts/test-billing.mjs

# 4. Run the Segment 4 feedback reports test suite (7 tests)
node --test scripts/test-interview-feedback-reports.mjs

# 5. Run the Segment 7 UCAT question bank & scoring engine test suite (8 tests)
node --test scripts/test-ucat-engine.mjs

# 6. Run Next.js production build (183 static pages)
npm run build
```

---

## Segment Overview & Progress Roadmap

| Segment | Domain | Status | Key Deliverables / Notes |
|---|---|---|---|
| **Segment 1** | Stripe Billing & Webhook Service | ✅ Re-audited | Modular billing service, repository and thin HTTP controllers verified. Fixed manual Premium portal routing, stale subscription portal recovery, customer ownership checks and provider error exposure; 11 billing tests. |
| **Segment 2** | PS Review Submission Service | 🗑️ Scrapped and re-audited | No submission or checkout flow remains. Old MedicForest personal-statement URLs redirect to live tutoring; obsolete setup variables and the unused email dependency were removed. |
| **Segment 3** | AI Interview Platform — Call & Speech Engine | ✅ Re-audited | Verified session, microphone, speech, recording and timer flows. Recovered playback and recognition failures, corrected question timer drift, and made active-station leaving available with URL cleanup. |
| **Segment 4** | AI Interview Platform — Scoring & Feedback Reports | ✅ Re-audited | Feedback is claimed only after a saved station ends; provider and database failures release claims safely. Review copy reflects AI availability without a false paid upgrade, and reports views contain only live paths. |
| **Segment 5** | AI Interview Platform — Community (Groups, Leaderboard, Pathway) | ✅ Re-audited | Guests can view opted-in leaderboard scores without an account; private preferences remain owner-only. Group and pathway routes delegate to services, and the compact pathway checklist preserves newly saved steps during older refreshes. |
| **Segment 6** | MedicForest UCAT Platform — Client Monolith & State | ✅ Completed | Deconstructed monolithic client: extracted `MedicForestPricingClient` & `MedicForestLandingClient`, eliminated ~9.8MB bundle bloat from public marketing pages, fixed broken `Alt+C` calculator toggle, eliminated timer drift, removed double redirect chains, and made 11,727-question quality gate lazy via Proxy. |
| **Segment 7** | MedicForest UCAT Platform — Question Bank Engine | ✅ Completed | Isolated scoring engine in `app/medicforest/ucat/_lib/ucatScoring.ts`, isolated question diagram and SVG visual components in `app/medicforest/ucat/_components/UCATQuestionVisuals.tsx`, eliminated ~1,450 lines of duplicate code from `UCATQuestionBankClient.tsx`, added global window keyboard shortcut listener for exams, implemented auto-finalization on timer expiration, fixed SPA exit tearing by replacing `window.location.assign` with Next.js `router.push`, added 8 comprehensive engine tests in `scripts/test-ucat-engine.mjs` bringing unit test suite to 205 passing tests. |
| **Segment 8** | MedicForest UCAT Platform — Diagnostics & AI Feedback | ✅ Completed | Separated diagnostic and report views from dashboard state; isolated diagnostic transforms and study tasks; preserved mock IDs through redirects; hardened saved-data AI feedback, credit handling, and report aggregation; added focused regression tests. |
| **Segment 9** | Auth, Supabase & User Account Management | 📋 Pending | User profiles, session persistence, preview access tokens. |
| **Segment 10** | MedicForest Public Marketing & Shell | 📋 Pending | Public marketing layer, navigation shells, trust badges, pricing page. |
| **Segment 11** | MedWithRish.com Core & Resources Hub | 📋 Pending | Primary brand website, admissions advice, guides, tutoring booking. |
| **Segment 12** | Infrastructure, Routing & Build Configuration | 📋 Pending | Next.js configuration, middleware, proxy auth refresh, security headers, SEO. |

---

## Detailed Segment Logs

### Segment 1: Stripe Billing & Subscription Infrastructure

#### 1. Context & Motivation
The previous Stripe implementation had duplicated configuration, tangled business logic within Next.js API routes (`app/api/stripe/*`), inconsistent error handling, direct database mutations in route handlers, and remnants of deprecated personal statement review checkout code.

#### 2. What Was Done
A modular billing architecture was created under [`utils/billing/`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/utils/billing/):

1. **[`billing-config.ts`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/utils/billing/billing-config.ts)**:
   - Validates required Stripe environment variables (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL`, etc.).
   - Provides safe URL resolution preventing SSRF or hostname manipulation.
2. **[`billing-errors.ts`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/utils/billing/billing-errors.ts)**:
   - Structured error hierarchy (`BillingError`, `BillingAuthenticationError`, `BillingConflictError`, `BillingConfigurationError`).
   - Clean translation to HTTP status codes (`400`, `401`, `404`, `409`, `500`).
3. **[`stripe-client.ts`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/utils/billing/stripe-client.ts)**:
   - Singleton Stripe client initialized with configured API version (`2025-02-24.acacia`).
4. **[`billing-repository.ts`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/utils/billing/billing-repository.ts)**:
   - Dedicated Supabase queries for profiles, customer IDs, subscription status, and billing transactions.
5. **Domain Operation Modules**:
   - [`stripe-customers.ts`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/utils/billing/stripe-customers.ts): Customer creation & metadata linking.
   - [`stripe-prices.ts`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/utils/billing/stripe-prices.ts): Safe price lookup & tier validation.
   - [`stripe-portal.ts`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/utils/billing/stripe-portal.ts): Customer billing portal session creation.
   - [`stripe-checkout.ts`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/utils/billing/stripe-checkout.ts): Checkout session generation with discount codes & metadata.
   - [`stripe-subscriptions.ts`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/utils/billing/stripe-subscriptions.ts): Subscription lifecycle management.
6. **[`billing-service.ts`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/utils/billing/billing-service.ts)** & **[`dispatch-stripe-event.ts`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/utils/billing/dispatch-stripe-event.ts)**:
   - High-level orchestration facade and webhook event dispatcher.
7. **Refactored API Routes**:
   - [`app/api/stripe/create-checkout-session/route.ts`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/api/stripe/create-checkout-session/route.ts)
   - [`app/api/stripe/create-portal-session/route.ts`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/api/stripe/create-portal-session/route.ts)
   - [`app/api/stripe/sync-checkout-session/route.ts`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/api/stripe/sync-checkout-session/route.ts)
   - [`app/api/stripe/webhook/route.ts`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/api/stripe/webhook/route.ts)
   - All routes reduced to thin controllers (parsing JSON $\to$ invoking service $\to$ returning standard JSON response).
8. **Unit Tests Added**:
   - [`scripts/test-billing.mjs`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/scripts/test-billing.mjs) verifies checkout, portal access, customer mapping, error mappings, event routing, and subscription state synchronization.
9. **Re-audit fixes**:
   - Manual Premium accounts with an old Stripe customer ID no longer receive a portal link from checkout. Paid subscribers use the customer ID on the active subscription record.
   - Portal access can recover when the profile stores an old subscription ID but the customer has a manageable subscription.
   - Webhook reconciliation rejects subscription metadata that points to a different user than the linked Stripe customer.
   - Unexpected Stripe and database errors return a stable public message instead of leaking provider details. The webhook uses centralized secret validation and returns generic failure messages.
   - Added tests for manual access, stale subscription IDs, ownership conflicts, canceled subscriptions, another active subscription, and error responses.

#### 3. Instructions for Another AI to Verify Segment 1
1. Inspect [`utils/billing/`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/utils/billing/) and confirm each module has a single responsibility.
2. Confirm no route in `app/api/stripe/` imports the raw `stripe` npm package directly; all interaction goes through `utils/billing/`.
3. Run `node scripts/test-billing.mjs` and verify all 11 tests pass.
4. Run `npm run test:unit` and verify the full suite passes without regression.
5. Run `npm run lint`, `npx tsc --noEmit`, and `npm run build`.

---

### Segment 2: PS Review Submission Service (Scrapped)

#### 1. Context & Decision
The owner scrapped the Personal Statement review submission idea entirely from the website.

#### 2. What Was Done
1. Purged `ps_review` metadata handling and event branches from `app/api/stripe/webhook/route.ts`.
2. Removed mock PS review checkout assertions from `scripts/test-server-routes.mjs`.
3. Deleted stale PS review endpoints and components.
4. Re-audited application routes and links: no `/api/ps-review`, `ps_review`, or upload form remains. The `/personal-statement-session` page is a separate one-to-one tutoring offer and remains live.
5. Updated contact copy to describe sessions rather than the removed review service. Marked the old Stripe refactor plan as historical where it mentions PS review payment work.
6. Removed the stale `STRIPE_PS_REVIEW_PRICE_ID` and `RESEND_API_KEY` setup instructions and the unused `resend` dependency. Updated historical AI cost and code audit notes so old PDF upload and checkout recommendations are not mistaken for current features.
7. Deleted the unsupported MedicForest “coming soon” personal-statement page. `next.config.ts` now gives its legacy paths a permanent redirect to `/medicforest/tutoring`; the separate MedWithRish one-to-one session remains available.

#### 3. Instructions for Another AI to Verify Segment 2
1. Search the codebase for `/api/ps-review` to ensure no live forms or routes point to deprecated personal statement upload endpoints.
2. Verify `scripts/test-server-routes.mjs` runs and succeeds.
3. Run `node --test scripts/test-domain-routing.mjs` and confirm the legacy route maps to tutoring. A production server must return HTTP 308 for `/medicforest/personal-statement` and for `/personal-statement` on the MedicForest host.
4. Run `npm run test:unit`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`.

---

### Segment 3: AI Interview Platform — Call & Speech Engine

#### 1. Scope and audit
The room, microphone device hook, speech hook, question-bank recorder, practice timer, recorded question audio and generated follow-up speech route were traced together. Existing protections for owner-bound sessions, follow-up speech requests, serial autosaves, late microphone permissions and failed station submission remain covered by the room tests.

#### 2. Re-audit fixes
1. Recorded audio and browser speech setup now recover when native constructors or voice setup throw. A failed prompt releases the room's speaking state, so microphone listening and typed answers remain usable. Speech recognition constructor and start failures also release the native recognition object and show the typed-answer fallback.
2. Question-bank practice time is calculated from a deadline, so throttled interval callbacks catch up after a background tab resumes. Pauses retain the exact remaining milliseconds; repeated pause/resume actions cannot add time. Timer expiry is also recognised when the user submits before the next interval callback.
3. The active-room finish dialog again offers **End without review**, with the result explained in the dialog. After a successful server end, the room removes its browser draft and clears the attempt query from the URL, so reloading setup cannot reopen the ended station.
4. The existing call-room, speech, device and recording lifecycle tests were rerun. New regressions cover native playback and recognition failures, delayed timer callbacks, fractional pause/resume timing, and active-station leave cleanup.

#### 3. Verification
Run `npm run test:interviews:room`, `npm run test:unit`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`. The Segment 3 audit passed 123 room tests, 220 full unit tests, lint, typecheck and a production build generating 183 static pages.

---

### Segment 4: AI Interview Platform — Scoring & Feedback Reports

#### 1. Context & Motivation
Segment 4 covers feedback generation, saved reports and review UI. Gemini evaluates saved candidate answers against server-owned question guidance. `utils/interviews/scoring.ts` calculates a fixed practice percentage capped at 99. The criteria are MedicForest practice criteria, not official medical-school marking standards.

The re-audit found that the feedback endpoint could claim an active station before submission. It also caught database save errors as provider failures. In the review, an unconfigured AI service was presented as a paid upgrade, although subscription status does not enable that service.

#### 2. What Was Done
1. `app/api/interviews/feedback/route.ts` now parses the request and delegates feedback work to `utils/interviews/feedback-service.ts`. The service verifies ownership and a completed station before claiming grading. Legacy saved attempts without `answer_submitted_at` remain eligible; the database trigger captures that timestamp on their first claim.
2. The grading claim function in all three interview setup SQL files enforces the same completed-station rule. A standalone SQL patch updates existing installations without replacing unrelated functions. Provider failures return safe retry text and release the claim. Database save failures are handled separately and also release the claim where possible, preserving the submitted transcript and original completion time.
3. `AIInterviewReview.tsx` now says AI feedback is unavailable when the service is unconfigured. The paid upgrade dialog and its claim about official medical-school markschemes were removed. Existing feedback remains viewable. While a grading request is running, the runner and saved review check the current station with GET instead of starting another grading request.
4. `InterviewHistoryViews.tsx` and `SavedInterviewList.tsx` now contain only the live reports path and its filters. The reports list and detail routes retain their loading and error boundaries.
5. Regression tests cover route eligibility, legacy submission timestamps, provider and database failure recovery, score validation and the rendered unavailable state.

#### 3. Instructions for Another AI to Verify Segment 4
1. Run `node --test scripts/test-interview-feedback-reports.mjs scripts/test-interview-scoring.mjs scripts/test-interview-review.mjs scripts/test-saved-interview-review.mjs` for scoring and review behavior.
2. Run `npm run test:interviews:db` and `node scripts/test-interview-dashboard-db.mjs` to verify the real PostgreSQL grading claim rejects active stations, accepts older submitted rows and applies the standalone patch.
3. Run `npm run test:unit`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
4. For an existing hosted interview database, apply `supabase/medicforest_interview_grading_guard.sql` through the SQL editor. This audit tested the patch locally and did not apply it to the hosted project.

---

### Segment 5: AI Interview Platform — Community (Groups, Leaderboard, Pathway)

#### 1. Context & Motivation
The leaderboard was intended for public viewing, but its GET endpoint required an account, the database denied anonymous RPC calls, and the MedicForest page path still passed through the preview gate. The page assumed every viewer could edit preferences. Group and pathway routes mixed request handling with database work. The compact dashboard checklist could accept an old refresh after a save and show an earlier pathway state.

#### 2. What Was Done
1. `leaderboard-service.ts` separates public reads from owner-only preference writes. Guest reads use an anonymous Supabase client and return only opted-in entries; private preferences and personal best are queried only for the signed-in owner. The leaderboard page now bypasses the preview gate, and its UI offers guests a sign-in action instead of editable controls. Failed preference reloads no longer show a false success message.
2. The interview platform and name-moderation SQL now grant anonymous access only to the leaderboard RPC. The RPC returns a boolean `is_you` for guests; the API also normalizes older `null` values. `medicforest_interview_public_leaderboard.sql` adds the grant to existing installations without replacing moderated leaderboard logic.
3. `groups-service.ts` owns bounded request parsing, authentication and RPC error mapping. Its route now only returns HTTP responses. Membership, private roster access, invitation hashing and limits remain enforced by the database RPC.
4. `pathway-service.ts` owns account persistence while `pathway.ts` retains progression rules. The compact checklist now ignores stale refreshes after a save, and the dashboard keys its checklist by account ID.
5. Regression tests cover guest and owner leaderboard responses, nickname sanitization, group route validation, pathway refresh ordering and actual PostgreSQL permissions.

#### 3. Verification
1. Run `node --test scripts/test-interview-public-names.mjs scripts/test-interview-leaderboard.mjs scripts/test-interview-groups-route.mjs scripts/test-interview-pathway.mjs`.
2. Run `npm run test:interviews:db` to verify anonymous leaderboard access and continued privacy for attempts and groups.
3. Run `npm run test:unit`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
4. Existing hosted databases need `supabase/medicforest_interview_public_leaderboard.sql`. It was tested locally and was not applied to the hosted project.

---

### Segment 6: MedicForest UCAT Platform — Client Monolith & State

#### 1. Context & Motivation
The UCAT client layer contained a 9,600+ line monolith (`MedicForestClient.tsx`) that:
- Bundled the entire question bank (~9.8MB of raw questions across 11,727 items) into the public marketing homepage (`/medicforest`), pricing page (`/medicforest/pricing`), and landing page (`/medicforest/ucat`), degrading Core Web Vitals and Largest Contentful Paint (LCP).
- Executed fingerprint hashing, structure validation, and duplicate checking synchronously over 11,727 questions upon module evaluation in `ucatQuestionBank.ts`, adding blocking delay to server startup and client hydration.
- Contained a functional bug in `SkillsTrainersContent` where `Alt+C` could not open the calculator when closed because its keydown listener was conditionally detached.
- Contained an interval drift bug in the skills trainer timer where adding `0.1` ten times a second accumulated IEEE-754 floating-point rounding errors.
- Had 404 links on non-medicforest domains (`/ucat/dashboard`, `/interviews/dashboard`, `/ucat/report`).
- Had double-redirect chains on diagnostic mock paths (`/diagnostic/mock-options` and `/diagnostic/mocks` hopping through `/diagnostics/mock-diagnostic` before landing on `/mocks/full`).

#### 2. What Was Done
1. **Extracted Dedicated Pricing & Landing Clients**:
   - Created [`app/medicforest/pricing/_components/MedicForestPricingClient.tsx`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/medicforest/pricing/_components/MedicForestPricingClient.tsx) isolating `MedicForestPricingPage`, `INTERVIEW_FREE_FEATURES`, `INTERVIEW_PREMIUM_FEATURES`, `INTERVIEW_PRICING_ROWS`, and `PricingComparisonValue`.
   - Created [`app/medicforest/_components/MedicForestLandingClient.tsx`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/medicforest/_components/MedicForestLandingClient.tsx) isolating `MedicForestLandingPage`, `RedesignedTutorHero`, and preview lock dialog.
   - Updated [`app/medicforest/page.tsx`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/medicforest/page.tsx), [`app/medicforest/pricing/page.tsx`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/medicforest/pricing/page.tsx), and [`app/medicforest/ucat/page.tsx`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/medicforest/ucat/page.tsx) to directly render these lightweight clients.
   - Re-exported them from [`MedicForestClient.tsx`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/medicforest/ucat/_components/MedicForestClient.tsx) to preserve 100% backward compatibility for any existing imports.
2. **Lazy Question Bank Quality Review via Proxy**:
   - In [`app/medicforest/ucat/_lib/ucatQuestionBank.ts`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/medicforest/ucat/_lib/ucatQuestionBank.ts): Wrapped `UCAT_QUESTION_BANK` and `UCAT_QUESTION_QUALITY_REVIEW` in lazy Proxies so that merely importing types or helpers does not trigger synchronous 11,727-question fingerprinting at module load time.
3. **Fixed Calculator `Alt+C` Keyboard Shortcut**:
   - In `SkillsTrainersContent`, gave `Alt+C` a permanent keydown listener that toggles the calculator open/closed from any state, aligning with actual UCAT testing software behavior.
4. **Eliminated Floating-Point Accumulation in Timer**:
   - Updated the 100ms skills trainer interval to `Math.round((current + 0.1) * 10) / 10`.
5. **Fixed Broken Navigation Links**:
   - Updated outdated paths:
     - `/ucat/dashboard` $\to$ `/medicforest/ucat/dashboard`
     - `/interviews/dashboard` $\to$ `/medicforest/interview/dashboard`
     - `/ucat/report` $\to$ `/medicforest/ucat/report`
6. **Eliminated Double-Redirect Chains**:
   - Direct redirects in [`app/medicforest/ucat/diagnostic/mocks/page.tsx`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/medicforest/ucat/diagnostic/mocks/page.tsx) and [`app/medicforest/ucat/diagnostic/mock-options/page.tsx`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/medicforest/ucat/diagnostic/mock-options/page.tsx) pointing directly to `/medicforest/ucat/mocks/full`.
7. **Preserved Critical AST Contracts**:
   - Kept exact `useEffect(..., [initialReportId, supabase, view])` contract in `MedicForestClient.tsx` ensuring `scripts/test-ucat-account.mjs` passes without regression.

#### 3. Instructions for Another AI to Verify Segment 6
1. Run `npx tsc --noEmit` and confirm 0 TypeScript errors across the repository.
2. Run `node --test scripts/test-ucat-account.mjs` to confirm the AST and auth-lifecycle tests pass.
3. Run `node --test scripts/test-ucat-quality.mjs` to confirm question quality gate validations pass.
4. Run `node scripts/auditUcatQuestionBank.cjs` to confirm the lazy question quality review Proxy returns identical 11,727 accepted questions and duplicate checks.
---

### Segment 7: MedicForest UCAT Platform — Question Bank Engine

#### 1. Context & Motivation
The UCAT question bank client (`UCATQuestionBankClient.tsx`) was a 10,942-line monolith:
- Core scoring logic (single-choice, SJT partial credit on the 4-point scale, drag-order permutations, drag-category placement, multi-statement Yes/No syllogisms, Most/Least slots, scaled score 300–900 conversion, and SJT Band 1–4 calculation) was trapped inside a giant `"use client"` component file, preventing it from being tested in isolation or reused across server components, reporting pipelines, and APIs.
- Over 1,200 lines of SVG diagram generation (Venn sets, scatterplots, grouped bars, line graphs, pie charts, and pattern definitions) were tightly coupled into the interactive exam runner.
- Exiting an in-progress or completed question set / mock called `window.location.assign(href)`, triggering full browser page refreshes that tore down SPA client state and caused screen flashes.
- Keyboard shortcuts (`Alt+N`, `Alt+P`, `Alt+C`, `Alt+F`, option keys `A`–`E`, and keypad digits) were bound exclusively to an outer wrapper `<div>`. If a candidate clicked anywhere on the stimulus text, passage, or timer, focus was blurred and exam shortcuts stopped firing.
- Timed practice sets and mocks lacked automatic submission: when remaining time reached zero, the countdown froze at `00:00` indefinitely without finalizing or grading candidate attempts.

#### 2. What Was Done
1. **Modularized Scoring Engine ([`app/medicforest/ucat/_lib/ucatScoring.ts`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/medicforest/ucat/_lib/ucatScoring.ts))**:
   - Extracted all scoring and validation functions:
     - `getAnswerScore` (single-select, SJT same-side partial credit, drag-order, drag-category, Yes/No, most/least)
     - `isAnswerCorrect`, `isAnswered`
     - `getEstimatedScaledScore` (0–100% $\to$ 300–900 points with standard 10-point rounding)
     - `getSjtBand` (Bands 1–4 mapped accurately by percentage thresholds)
     - `getDiagnosticSectionScore`
     - Type definitions: `PracticeAnswer`, `PracticeAnswerMap`, `PracticeAnswerScore`, `PracticeAnswerStatus`, `DiagnosticSectionScore`
2. **Modularized SVG Visuals ([`app/medicforest/ucat/_components/UCATQuestionVisuals.tsx`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/medicforest/ucat/_components/UCATQuestionVisuals.tsx))**:
   - Extracted all question diagram components and helpers:
     - `OptionVisual`, `QuestionVisual`
     - `SetDiagramShapeElement`, `WrappedSvgLabel`, `ChartPatternDefs`, `LinePointMarker`
     - `formatDisplayText` (handling metric power formatting like $\text{mm}^2 \to \text{mm}^2$)
     - Variant definitions, hashing, and legend styling.
3. **Decoupled Exam Runner & Fixed Client Monolith ([`app/medicforest/ucat/_components/UCATQuestionBankClient.tsx`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/medicforest/ucat/_components/UCATQuestionBankClient.tsx))**:
   - Removed ~1,450 lines of duplicate code by importing from `ucatScoring.ts` and `UCATQuestionVisuals.tsx`.
   - Re-exported all scoring and visual utilities to maintain 100% backward compatibility.
   - Replaced all `window.location.assign` calls with Next.js App Router `router.push(href)` to preserve client-side SPA routing.
   - Added global `window.addEventListener("keydown", ...)` listener so exam shortcuts and calculator typing work from anywhere on the page without requiring focus on a specific DOM container.
   - Added automatic session completion in `updateRemaining` so timed mock sections automatically finalize and mark candidate attempts when time hits 0.
4. **Populated Landing & Pricing Client Components**:
   - Ensured [`app/medicforest/pricing/_components/MedicForestPricingClient.tsx`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/medicforest/pricing/_components/MedicForestPricingClient.tsx) and [`app/medicforest/_components/MedicForestLandingClient.tsx`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/medicforest/_components/MedicForestLandingClient.tsx) have full type declarations and imports, passing Next.js Turbopack build cleanly.
5. **New Automated Unit Test Suite ([`scripts/test-ucat-engine.mjs`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/scripts/test-ucat-engine.mjs))**:
   - 8 unit tests covering:
     - Core section and subtype metadata recognition
     - Single-choice scoring and unanswered states
     - SJT partial credit same-side scale checks (A/B vs C/D)
     - Drag-order permutation scoring
     - DM Yes/No multi-statement 5/5 and 4/5 mark allocations
     - Scaled score monotonicity and 300–900 boundaries
     - SJT Band 1–4 percentage thresholds
     - Exponent unit display formatting
   - Integrated into `package.json` under `npm run test:unit`, expanding total test suite to **205 passing unit tests**.

#### 3. Instructions for Another AI to Verify Segment 7
1. Run `npx tsc --noEmit` and confirm 0 TypeScript errors across the repository.
2. Run `node --test scripts/test-ucat-engine.mjs` to confirm all 8 engine tests pass.
3. Run `node --test scripts/test-ucat-quality.mjs` to confirm question quality gate validations pass.
4. Run `node scripts/auditUcatQuestionBank.cjs` to confirm 11,727 accepted questions audit cleanly.
5. Run `npm run test:unit` and verify all 205 unit tests pass.
6. Run `npm run build` and confirm all 184 static pages compile cleanly.

---

### Segment 8: MedicForest UCAT Platform — Diagnostics & AI Feedback

#### 1. Context & Motivation

Diagnostic and report rendering, issue labels, study tasks, credit display, and report aggregation were mixed into `MedicForestClient.tsx`. AI feedback could also use caller-supplied scores and issue text when saved metadata was absent, and mixed legacy report data could lower combined metrics incorrectly.

#### 2. What Was Done

1. Extracted the diagnostic page and report page into `UCATDiagnosticContent.tsx` and `UCATReportContent.tsx`, with the issue card in `ReportIssueSignalCard.tsx`. `MedicForestClient.tsx` remains responsible for account and dashboard state and retains compatibility exports.
2. Moved diagnostic normalisation, study-task selection, report grouping, issue definitions, credit display, and combined metrics into `_lib/ucatDiagnostics.ts`. Saved metadata arrays are checked before rendering. Combined metrics use available scored data and exclude missing timing values.
3. Kept the selected mock ID when redirecting through the premium diagnostic route. Feedback text can be expanded and copied from the report view.
4. The diagnostic AI route builds prompts from saved attempt metadata or saved database columns. Client-supplied scores and issues cannot change the prompt. Grouped full-mock feedback requires distinct canonical sections belonging to the same mock. Existing saved feedback remains readable without spending another credit.
5. Added `scripts/test-ucat-diagnostics.mjs` and focused route tests for saved-data authority, duplicate full-mock sections, combined metrics, malformed metadata, and credit reservation recovery. Removed the previous eight lint warnings.

#### 3. Verification

1. Run `node --test scripts/test-ucat-diagnostics.mjs scripts/test-server-routes.mjs`.
2. Run `npx tsc --noEmit`, `npm run lint`, and `npm run test:unit` (210 tests).
3. Run `npm run build` and confirm all 184 static pages compile.

---

### Immediate UI Requests (Completed)

#### 1. Group Interview Station Box Removal
- **Request**: Remove the "Group interview station" panel from the study group page (`/medicforest/interview/groups`).
- **File Changed**: [`app/medicforest/interview/_components/InterviewGroups.tsx`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/medicforest/interview/_components/InterviewGroups.tsx).
- **Details**:
  - Removed the `Group interview station` section containing station selector, recent stations dropdown, question box, timer, unsaved draft banner, shared answers, and room discussion.
  - Removed the subcomponent `StationRoom`.
  - Removed station-specific state (`stationId`, `clock`, `selectedRoomId`).
  - Retained the core study circle roster, member rankings (by question bank completion and Why Medicine? attempt), invite link generator, and group management.

#### 2. About Page Success Stories & Founder CTA Updates
- **Request**:
  1. Rename card from "Oxbridge Medicine Offer" to `'2370 B2!'`.
  2. Add second score report image as `'2350 B1!!'`, positioned high up in the list.
  3. Remove the `"Visit MedWithRish.com"` button next to `"1-1 Tutoring with Rish"`.
- **Files Changed**:
  - [`app/medicforest/about/page.tsx`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/medicforest/about/page.tsx)
  - [`public/success-stories/story-2350-b1.png`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/public/success-stories/story-2350-b1.png)
- **Details**:
  - Saved WhatsApp UCAT score screenshot (2350 Band 1, 880 QR) to `public/success-stories/story-2350-b1.png`.
  - Added new item at index 1 of `successStories` titled `"2350 B1!!"`.
  - Renamed the `"Oxbridge Medicine Offer"` card (`story5.jpeg`) to `"2370 B2!"` with tag `"UCAT Achievement"`.
  - Removed the external MedWithRish.com anchor link from the founder section.

#### 3. MedicForest About Page Polish & Redesign
- **Request**: Redesign the MedicForest About page to feel complete, polished, and premium while keeping the information density low and scan-friendly (approx. 2–2.5 desktop screens long).
- **Core Product Realignment**:
  - Highlighted the **TWO active offerings**:
    1. **Interview Practice** (featuring 550+ FREE practice questions, MMI + panel prep, AI interview practice, personalised feedback).
    2. **1-to-1 Tutoring** (interview coaching, personal statement support, individual feedback with Rish).
  - Clarified that UCAT question bank tools are currently in development via a subtle single-line note.
- **Section Structure**:
  1. **Compact Hero**: Retained the core philosophy ("Growing a community of medics — like a forest of trees"), 2–3 line supporting copy, no huge empty dark areas, quick CTAs to platform and philosophy.
  2. **What MedicForest Offers**: Two side-by-side compact cards (Interview Practice with bold `550+ FREE practice questions` badge, and 1-to-1 Tutoring) + subtle "UCAT practice tools are currently in development" note.
  3. **Why MedicForest**: Core philosophy ("A solitary tree stands fragile. A forest stands unbreakable."), single short explanation paragraph, and a minimal 3-step inline flow (`Practise → Get Feedback → Improve`).
  4. **Founder**: Compact 2-column layout with photo of Rish (`/rish-profile.jpg`), short 2-paragraph story, experience badges, mission quote, and CTA to 1-to-1 tutoring.
  5. **Final CTA**: Compact bottom strip with clear heading, dual buttons (`Start Interview Practice →` and `Explore Tutoring →`), and `550+ free interview questions • No card required` trust note.
- **Verification**: `npx tsc --noEmit` passed with 0 errors, `npm run test:unit` passed 197/197 tests, `npm run build` compiled 184 static pages cleanly.
