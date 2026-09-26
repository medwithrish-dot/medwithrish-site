# Stripe and frontend refactor plan

This plan improves maintainability without changing product behaviour. Complete
the Stripe work first because billing mistakes have a larger impact than excess
frontend code. Refactor in small, independently testable changes rather than one
large rewrite.

## Working rules

- Preserve existing checkout, portal, subscription and personal statement review
  behaviour unless a change is explicitly agreed.
- Add regression tests before moving business logic.
- Keep route handlers responsible for HTTP concerns only: parsing, authentication,
  calling one use case and formatting the response.
- Keep Stripe, Supabase and email SDK calls behind small adapter functions.
- Prefer domain-specific names over generic names such as `handle`, `process`,
  `execute`, `data` or `result`.
- Do not add an abstraction unless it creates a clear ownership boundary or removes
  meaningful duplication.
- Run lint, type checking and the relevant tests after every stage.

## Phase 1: document current billing behaviour

- [ ] Record the expected behaviour of premium checkout, duplicate-subscription
  prevention, billing portal access and checkout-session synchronisation.
- [ ] Record how active, trialling, past-due, cancelled and deleted subscriptions
  affect premium access.
- [ ] Record how manually granted premium access must be preserved.
- [ ] List every Stripe webhook event currently consumed and the side effects of
  each event.
- [ ] Document the personal statement payment lifecycle separately from recurring
  subscriptions.
- [ ] Identify which operations must be idempotent when Stripe retries a webhook.

Exit condition: a developer can describe every billing transition without reading
the route implementations.

## Phase 2: establish billing regression tests

- [ ] Introduce a TypeScript-focused test runner such as Vitest while retaining
  existing Node tests during migration.
- [ ] Add unit tests for subscription status and premium-entitlement decisions.
- [ ] Test that manual premium access cannot be removed by Stripe synchronisation.
- [ ] Test checkout eligibility and prevention of duplicate subscriptions.
- [ ] Test customer lookup, missing-customer recovery and Stripe API failures.
- [ ] Test checkout-session ownership before subscription synchronisation.
- [ ] Add webhook fixtures for supported subscription and checkout events.
- [ ] Test duplicate webhook delivery and events arriving out of order.
- [ ] Add database-backed tests for subscription upserts and profile entitlement
  updates using the project's existing embedded PostgreSQL approach.

Avoid tests that merely assert that an SDK wrapper called the same SDK method.
Focus on business decisions, persisted state and externally visible responses.

Exit condition: the current billing behaviour can be refactored with failures
detected automatically.

## Phase 3: separate billing configuration and provider access

- [ ] Keep Stripe client construction in one server-only module.
- [ ] Centralise required billing environment variables and validate them once.
- [ ] Introduce narrow adapters for Stripe customer, price, checkout, portal and
  subscription operations.
- [ ] Introduce narrow database functions for billing profiles and subscriptions.
- [ ] Define typed billing errors for unauthenticated users, invalid configuration,
  ineligible checkout, missing customers and temporary provider failures.
- [ ] Ensure logs include useful identifiers without exposing secrets or personal
  payment details.

Suggested module ownership:

```text
utils/billing/
  stripe-client.ts
  billing-config.ts
  billing-errors.ts
  stripe-customers.ts
  stripe-checkout.ts
  stripe-subscriptions.ts
  billing-repository.ts
```

Exit condition: business services do not construct SDK clients or issue arbitrary
database queries directly.

## Phase 4: extract billing use cases

- [ ] Extract `findOrCreateStripeCustomer` from checkout route logic.
- [ ] Extract `findManageableSubscription` for duplicate-subscription and portal
  decisions.
- [ ] Extract `createPremiumCheckoutSession`.
- [ ] Extract `createCustomerPortalSession`.
- [ ] Extract `synchroniseCheckoutSession` with its ownership check.
- [ ] Keep subscription entitlement reconciliation in one clearly named service.
- [ ] Return typed outcomes from services instead of constructing HTTP responses
  inside them.

Target request flow:

```text
route -> request validation -> authentication -> billing use case
      -> Stripe/database adapters -> typed outcome -> HTTP response
```

Exit condition: each Stripe route is a short controller whose behaviour is clear
from its top-level calls.

## Phase 5: split webhook responsibilities

- [ ] Keep signature verification and event dispatch in the webhook route.
- [ ] Move subscription event handling into a subscription webhook module.
- [ ] Move personal statement payment handling into its own feature module.
- [ ] Move confirmation email rendering and delivery out of the webhook route.
- [ ] Store fulfilment state or processed event IDs so repeated events do not
  duplicate irreversible work.
- [ ] Make retriable failures fail the request so Stripe can retry them.
- [ ] Treat unsupported events as successful no-ops and log them at an appropriate
  level.

Suggested feature ownership:

```text
utils/billing/webhooks/
  dispatch-stripe-event.ts
  process-subscription-event.ts

features/ps-review/
  create-review-payment.ts
  fulfil-review-purchase.ts
  send-review-confirmation.ts
```

Exit condition: subscription reconciliation and personal statement fulfilment can
be understood and tested independently.

## Phase 6: integration and browser coverage

- [ ] Test each billing route through its HTTP boundary with controlled Stripe and
  database adapters.
- [ ] Test webhook signature rejection and valid event dispatch.
- [ ] Test database state after subscription creation, updates and deletion.
- [ ] Add a small Playwright suite for checkout redirect, successful return and
  billing portal access.
- [ ] Keep live Stripe test-mode verification as a separate manual or scheduled
  check; do not require live Stripe for every local test run.
- [ ] Verify `npm test`, `npm run lint`, `npm run typecheck` and `npm run build`.

Exit condition: both business rules and module interactions have coverage, while
provider outages do not make the normal test suite unreliable.

## Phase 7: reduce frontend complexity

Do not replace Next.js or React. Reduce responsibility inside the largest client
components and add libraries only where they remove recurring complexity.

- [ ] Rank client components by size, number of state variables, effects and API
  calls; refactor the highest-risk workflow first.
- [ ] Move data fetching to Server Components or Server Actions when browser state
  is not required.
- [ ] Extract API access into typed feature-level modules.
- [ ] Extract cohesive browser capabilities such as recording, speech recognition,
  timers and persistence into focused hooks.
- [ ] Group related local state with `useReducer` when transitions matter.
- [ ] Consider XState only for workflows with explicit states and transitions,
  such as interview setup, recording, pausing, submission and review.
- [ ] Consider TanStack Query when several components need client-side caching,
  retries, invalidation or request deduplication.
- [ ] Use React Hook Form and Zod for complex forms with repeated validation; keep
  simple forms on native React and server features.
- [ ] Split rendering into small domain components after state ownership is clear.
- [ ] Add component or browser tests around behaviour before each large split.

Do not introduce a global state library merely to reduce prop passing. Server
state, URL state, persistent domain state and temporary UI state should remain
distinct.

Exit condition: large components orchestrate a small number of focused hooks and
rendering components instead of owning every state transition and side effect.

## Recommended delivery order

1. Billing behaviour notes and regression tests.
2. Billing configuration and provider adapters.
3. Checkout and portal use cases.
4. Subscription synchronisation.
5. Webhook dispatch and personal statement separation.
6. Billing integration and browser tests.
7. Frontend refactors, one workflow at a time.

Each pull request should preserve behaviour, have a narrow purpose and include the
tests needed to demonstrate that its boundary still works.

## Definition of done

- Stripe route handlers contain no substantial business rules.
- Subscription and personal statement payment workflows are separate.
- Replayed webhooks cannot duplicate fulfilment or remove valid access.
- Function names describe domain intent and ambiguous generic names are removed.
- Unit tests cover pure billing decisions.
- Integration tests cover routes, provider adapters and database state changes.
- A small browser suite covers critical customer billing flows.
- Large frontend workflows have explicit state ownership and focused modules.
- Lint, type checking, tests and production build all pass.
