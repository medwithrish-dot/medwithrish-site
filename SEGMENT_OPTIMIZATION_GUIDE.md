# Segment Optimization Guide & AI Verification Log

This document serves as the master record of all codebase segment optimizations on the MedWithRish / MedicForest platform (`medwithrish-site`). It details what was done, why it was done, the architectural design decisions, and step-by-step instructions for any reviewer or AI agent to verify what was done and confirm system integrity.

---

## Global Verification Commands

Any AI or engineer reviewing these changes can verify repository health using these commands in project root:

```bash
# 1. Typecheck the entire project
npx tsc --noEmit

# 2. Run the full unit test suite (191+ tests)
npm run test:unit

# 3. Run the billing test suite
node scripts/test-billing.mjs

# 4. Run Next.js production build (184+ pages)
npm run build
```

---

## Segment Overview & Progress Roadmap

| Segment | Domain | Status | Key Deliverables / Notes |
|---|---|---|---|
| **Segment 1** | Stripe Billing & Webhook Service | ✅ Completed | Fully modularized into `utils/billing/`, centralized environment config, dedicated repository layer, thin HTTP controllers in `app/api/stripe/`, 7 unit tests in `scripts/test-billing.mjs`. |
| **Segment 2** | PS Review Submission Service | 🗑️ Scrapped | Completely removed per owner directive (scrapped from website). All legacy PS submission endpoints, forms, and tests purged. |
| **Segment 3** | AI Interview Platform — Call & Speech Engine | 🔄 In Progress | Fragility protections; fixed follow-up bitmask validation overflow, enabled leaving active sessions, removed Group Interview Station panel, preparation seconds alignment. |
| **Segment 4** | AI Interview Platform — Question Bank & Markschemes | 📋 Pending | Question bank caching, markscheme rendering, visual data question stability. |
| **Segment 5** | AI Interview Platform — Scoring & Feedback | 📋 Pending | Monotonic scoring invariants, rubric evidence bounds, server feedback fallback. |
| **Segment 6** | MedicForest UCAT Platform Engine | 📋 Pending | Deconstruct massive monoliths (e.g. `MedicForestClient.tsx`), improve state management & render performance. |
| **Segment 7** | UCAT Diagnostics & Mock Exams | 📋 Pending | Mock exam timer accuracy, section navigation, score conversions. |
| **Segment 8** | Supabase Database & Security Policies | 📋 Pending | RLS policy audit, client vs server access controls, rate limiting. |
| **Segment 9** | MedWithRish Marketing & Tutoring Pages | 📋 Pending | Admissions journey forms, tutoring booking flows, mobile responsiveness, asset optimization. |
| **Segment 10** | Infrastructure, Proxy & Performance | 📋 Pending | Next.js middleware / proxy auth refresh optimization, caching headers, Core Web Vitals. |

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
4. Run `npm run test:unit` and verify all 191 tests pass without regression.

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

---

### Segment 3: AI Interview Platform — Call & Speech Engine (Next In Progress)

#### 1. Scope & Critical Constraints
- **CRITICAL**: The AI interview engine is fragile. Do not alter speech recognition pauses, timing constants, or monotonic rubric score calculation.
- Identified issues to resolve:
  1. Follow-up claim mask overflow in `utils/interviews/follow-up.ts` (regex `[0-7]` crashes on questions $\ge 4$).
  2. Regex match in `app/api/interviews/speech/route.ts` must allow 8-bit masks up to 255.
  3. Active interview exit button in `AIInterviewCall.tsx` was restricted to preview mode only; logged-in users must be able to leave/abandon sessions cleanly.
  4. University preparation seconds in `app/api/interviews/session/route.ts` hardcoded to `0` instead of reading configured university preparation duration.
