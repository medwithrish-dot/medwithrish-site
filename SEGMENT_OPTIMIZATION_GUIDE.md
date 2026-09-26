# Segment Optimization Guide & AI Verification Log

This document serves as the master record of all codebase segment optimizations on the MedWithRish / MedicForest platform (`medwithrish-site`). It details what was done, why it was done, the architectural design decisions, and step-by-step instructions for any reviewer or AI agent to verify what was done and confirm system integrity.

---

## Global Verification Commands

Any AI or engineer reviewing these changes can verify repository health using these commands in project root:

```bash
# 1. Typecheck the entire project (zero errors required)
npx tsc --noEmit

# 2. Run the full unit test suite (197+ tests passing)
npm run test:unit

# 3. Run the billing test suite (7 tests)
node scripts/test-billing.mjs

# 4. Run the Segment 4 feedback reports test suite (6 tests)
node --test scripts/test-interview-feedback-reports.mjs

# 5. Run Next.js production build (184+ static pages)
npm run build
```

---

## Segment Overview & Progress Roadmap

| Segment | Domain | Status | Key Deliverables / Notes |
|---|---|---|---|
| **Segment 1** | Stripe Billing & Webhook Service | ✅ Completed | Fully modularized into `utils/billing/`, centralized environment config, dedicated repository layer, thin HTTP controllers in `app/api/stripe/`, 7 unit tests in `scripts/test-billing.mjs`. |
| **Segment 2** | PS Review Submission Service | 🗑️ Scrapped | Completely removed per owner directive (scrapped from website). All legacy PS submission endpoints, forms, and tests purged. |
| **Segment 3** | AI Interview Platform — Call & Speech Engine | 🔄 In Progress | Fragility protections; fixed follow-up bitmask validation overflow, enabled leaving active sessions, removed Group Interview Station panel, preparation seconds alignment. |
| **Segment 4** | AI Interview Platform — Scoring & Feedback Reports | ✅ Completed | Polished review flow, eliminated placeholder upgrade modal with MedicForest Pro dialog, tightened timeout/abort error handling in feedback route, streamlined `InterviewHistoryViews`, added `loading.tsx` and `error.tsx` states, added 6 dedicated unit tests (`test-interview-feedback-reports.mjs`). |
| **Segment 5** | AI Interview Platform — Community (Groups, Leaderboard, Pathway) | 📋 Pending | Collaborative study circles, public leaderboard guest access (401 fix), prep pathway task progression. |
| **Segment 6** | MedicForest UCAT Platform — Client Monolith & State | 📋 Pending | Deconstruct massive monoliths (e.g. `MedicForestClient.tsx`), improve state management & render performance. |
| **Segment 7** | MedicForest UCAT Platform — Question Bank Engine | 📋 Pending | Question bank loader, question rendering, mock test player. |
| **Segment 8** | MedicForest UCAT Platform — Diagnostics & AI Feedback | 📋 Pending | Diagnostic test scoring, mock conversion, diagnostic AI feedback. |
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
   - [`scripts/test-billing.mjs`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/scripts/test-billing.mjs) added to verify customer mapping, error mappings, event routing, and subscription state synchronization.

#### 3. Instructions for Another AI to Verify Segment 1
1. Inspect [`utils/billing/`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/utils/billing/) and confirm each module has a single responsibility.
2. Confirm no route in `app/api/stripe/` imports the raw `stripe` npm package directly; all interaction goes through `utils/billing/`.
3. Run `node scripts/test-billing.mjs` and verify all 7 tests pass.
4. Run `npm run test:unit` and verify tests pass without regression.

---

### Segment 2: PS Review Submission Service (Scrapped)

#### 1. Context & Decision
The owner scrapped the Personal Statement review submission idea entirely from the website.

#### 2. What Was Done
1. Purged `ps_review` metadata handling and event branches from `app/api/stripe/webhook/route.ts`.
2. Removed mock PS review checkout assertions from `scripts/test-server-routes.mjs`.
3. Deleted stale PS review endpoints and components.

#### 3. Instructions for Another AI to Verify Segment 2
1. Search the codebase for `/api/ps-review` to ensure no live forms or routes point to deprecated personal statement upload endpoints.
2. Verify `scripts/test-server-routes.mjs` runs and succeeds.

---

### Segment 4: AI Interview Platform — Scoring & Feedback Reports

#### 1. Context & Motivation
Segment 4 covers the feedback evaluation pipeline and review UI:
- Candidate answers are evaluated against authored MMI question markschemes using Gemini Flash-Lite.
- Scoring is computed via calibrated log-curve formula in `utils/interviews/scoring.ts` ensuring bounds between 0% and 99% (calibrated cap, monotonic).
- The review interface previously contained placeholder modal dialogs (`CREDITS PLACEHOLDER`) and confusing "credits" copy when free tier was active or unconfigured.
- `InterviewHistoryViews.tsx` contained dead, unreachable view branches (`plan`, `progress`, `notifications`) that cluttered reports rendering.
- `reports/` and `reports/[report]/` routes lacked Next.js App Router error boundaries and loading states.

#### 2. What Was Done
1. **Production Upgrade Modal in [`AIInterviewReview.tsx`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/medicforest/interview/_components/AIInterviewReview.tsx)**:
   - Replaced placeholder modal with a high-converting **MedicForest Pro** dialog detailing GMC MMI rubric criteria, targeted weaknesses, and actionable coaching fixes.
   - Updated button copy from misleading *"Not available - Upgrade for more credits"* to *"Pro feature — Upgrade to unlock"*.
2. **Robust Timeout & Abort Handling in [`app/api/interviews/feedback/route.ts`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/api/interviews/feedback/route.ts)**:
   - Now cleanly checks both `TimeoutError` and `AbortError` so timed-out AI provider calls consistently return user-friendly retry guidance (*"Feedback timed out. Your answers are saved; please retry."*) with HTTP 503 instead of raw internal messages.
3. **Streamlined [`InterviewHistoryViews.tsx`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/medicforest/interview/_components/InterviewHistoryViews.tsx)**:
   - Purged dead `view === "plan"` and `view === "progress"` branches and unneeded Lucide icon imports.
   - Focused component exclusively on saved interview reports listing and filtering.
4. **Added App Router Loading & Error Boundaries**:
   - [`app/medicforest/interview/reports/loading.tsx`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/medicforest/interview/reports/loading.tsx): Animated skeleton state for the reports list.
   - [`app/medicforest/interview/reports/error.tsx`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/medicforest/interview/reports/error.tsx): Client-safe error boundary with retry and dashboard fallback.
   - [`app/medicforest/interview/reports/[report]/loading.tsx`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/medicforest/interview/reports/%5Breport%5D/loading.tsx): Detail view skeleton.
   - [`app/medicforest/interview/reports/[report]/error.tsx`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/app/medicforest/interview/reports/%5Breport%5D/error.tsx): Detail view error boundary.
5. **New Automated Test Suite [`scripts/test-interview-feedback-reports.mjs`](file:///c:/Users/usedf/OneDrive/Desktop/MEDWITHRISH/medwithrish-site/scripts/test-interview-feedback-reports.mjs)**:
   - 6 automated tests verifying GMC rubric domains, structured feedback parsing with distinct weaknesses/fixes, legacy improvements compatibility, score boundaries (0–99%), and strict monotonicity.
   - Registered in `package.json` under `npm run test:unit`, bringing total unit tests to 197.

#### 3. Instructions for Another AI to Verify Segment 4
1. Run `node --test scripts/test-interview-feedback-reports.mjs` and verify all 6 tests pass.
2. Run `node --test scripts/test-interview-scoring.mjs` and verify all 5 scoring tests pass.
3. Run `node --test scripts/test-interview-review.mjs` and verify review lifecycles pass.
4. Run `npm run test:unit` to verify the full 197-test suite passes.
5. Run `npx tsc --noEmit` to verify type safety.
6. Run `npm run build` to confirm static page generation and webpack bundling succeed.

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
