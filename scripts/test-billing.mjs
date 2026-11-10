import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

function load(file, mocks = {}) {
  const path = resolve(root, file);
  const fileDir = dirname(path);
  const compiledModule = { exports: {} };
  const javascript = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const localRequire = (name) => {
    if (name === "server-only") return {};
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name === "@/utils/billing/stripe-client" && Object.hasOwn(mocks, "@/utils/stripe")) return mocks["@/utils/stripe"];
    if (name === "@/utils/stripe" && Object.hasOwn(mocks, "@/utils/billing/stripe-client")) return mocks["@/utils/billing/stripe-client"];
    if (name === "@/utils/billing/stripe-subscriptions" && Object.hasOwn(mocks, "@/utils/stripe-subscriptions")) return mocks["@/utils/stripe-subscriptions"];
    if (name === "@/utils/stripe-subscriptions" && Object.hasOwn(mocks, "@/utils/billing/stripe-subscriptions")) return mocks["@/utils/billing/stripe-subscriptions"];
    if (name.startsWith("@/")) return load(`${name.slice(2)}.ts`, mocks);
    if (name.startsWith("./") || name.startsWith("../")) {
      const targetPath = resolve(fileDir, name);
      const relPath = targetPath.slice(root.length + 1).replace(/\\/g, "/");
      const normalizedPath = relPath.endsWith(".ts") ? relPath : `${relPath}.ts`;
      return load(normalizedPath, mocks);
    }
    return require(name);
  };
  new Function("require", "module", "exports", javascript)(localRequire, compiledModule, compiledModule.exports);
  return compiledModule.exports;
}

// Model Stripe's durable idempotency cache, independently of application instances.
function checkoutHarness({ sessions = [], subscriptions = [] } = {}) {
  const state = { sessions: [...sessions], subscriptions, creations: [], keys: new Map(), synced: [], reads: [], failRead: false };
  const stripe = {
    checkout: { sessions: {
      list: () => {
        const snapshot = structuredClone(state.sessions);
        state.reads.push("sessions");
        return (async function* () {
          if (state.failRead) throw new Error("Stripe unavailable");
          yield* snapshot;
        })();
      },
      create: async (params, options) => {
        assert.ok(options.idempotencyKey);
        if (state.keys.has(options.idempotencyKey)) return state.keys.get(options.idempotencyKey);
        const session = { id: `cs_${state.creations.length + 1}`, mode: "subscription", status: "open",
          client_reference_id: params.client_reference_id, url: `https://checkout.stripe.com/session_${state.creations.length + 1}` };
        state.creations.push({ params, options });
        state.keys.set(options.idempotencyKey, session);
        state.sessions.unshift(session);
        return session;
      },
    } },
    subscriptions: { list: () => {
      state.reads.push("subscriptions");
      return (async function* () { yield* state.subscriptions; })();
    } },
  };
  const mocks = {
    "@/utils/billing/billing-repository": {
      ensureBillingProfile: async () => ({ current_plan: "free", stripe_customer_id: "cus_shared", full_name: "Student" }),
      findManageableSubscription: async () => null,
    },
    "@/utils/billing/stripe-customers": { findOrCreateStripeCustomer: async () => "cus_shared" },
    "@/utils/billing/stripe-prices": { resolvePremiumPriceId: async () => "price_premium" },
    "@/utils/billing/stripe-subscriptions": {
      billingActionStatuses: ["active", "trialing", "past_due", "unpaid", "incomplete", "paused"],
      paidSubscriptionStatuses: ["active", "trialing"],
      syncStripeSubscription: async subscription => { state.synced.push(subscription); },
    },
    "@/utils/billing/stripe-portal": { createCustomerPortalSession: async () => "https://billing.stripe.com/portal" },
  };
  // Two separately loaded services represent distinct server instances, with no shared app lock.
  const services = [load("utils/billing/billing-service.ts", mocks), load("utils/billing/billing-service.ts", mocks)];
  const run = (index = 0, returnArea = "interviews") => services[index].preparePremiumCheckout({
    user: { id: "user-shared" }, siteUrl: "https://medicforest.com", returnArea, stripe, admin: {},
  });
  return { state, stripe, run };
}

test("simultaneous checkout requests across instances create one payable session", async () => {
  const { state, run } = checkoutHarness();
  const outcomes = await Promise.all([run(0), run(1)]);
  assert.equal(state.creations.length, 1);
  assert.equal(outcomes[0].url, outcomes[1].url);
  const fromAnotherArea = await run(1, "ucat");
  assert.equal(fromAnotherArea.url, outcomes[0].url);
  assert.equal(state.creations.length, 1);
  assert.deepEqual(state.reads.slice(0, 4), ["sessions", "sessions", "subscriptions", "subscriptions"]);
});

test("expired checkout rotates the key and permits a new purchase after cancellation", async () => {
  const { state, run } = checkoutHarness({ subscriptions: [{ id: "sub_old", status: "canceled" }] });
  const first = await run();
  state.sessions[0].status = "expired";
  const second = await run();
  assert.notEqual(first.url, second.url);
  assert.notEqual(state.creations[0].options.idempotencyKey, state.creations[1].options.idempotencyKey);
  assert.equal((await run()).url, second.url);
  assert.equal(state.creations.length, 2);
});

test("live subscriptions block another checkout while webhook data is delayed", async () => {
  for (const status of ["active", "trialing", "past_due", "unpaid", "incomplete", "paused"]) {
    const subscription = { id: "sub_existing", status };
    const { state, run } = checkoutHarness({ subscriptions: [subscription] });
    assert.deepEqual(await run(), { kind: "portal", url: "https://billing.stripe.com/portal" });
    assert.deepEqual(state.synced, [subscription]);
    assert.equal(state.creations.length, 0);
  }
});

test("an older owned open subscription checkout is reused among unrelated payments", async () => {
  const unrelated = Array.from({ length: 101 }, (_, i) => ({ id: `cs_payment_${i}`, mode: "payment", status: "open" }));
  const { state, run } = checkoutHarness({ sessions: [
    ...unrelated,
    { id: "cs_other", mode: "subscription", status: "open", client_reference_id: "another-user", url: "https://checkout.stripe.com/wrong" },
    { id: "cs_owned", mode: "subscription", status: "open", metadata: { supabase_user_id: "user-shared" }, url: "https://checkout.stripe.com/owned" },
  ] });
  assert.equal((await run()).url, "https://checkout.stripe.com/owned");
  assert.equal(state.creations.length, 0);
});

test("checkout fails closed when Stripe session history is unavailable", async () => {
  const { state, run } = checkoutHarness();
  state.failRead = true;
  await assert.rejects(run(), /Stripe unavailable/);
  assert.equal(state.creations.length, 0);
});

test("first-time parallel requests share a Stripe customer and replacement uses a different key", async () => {
  const saved = [];
  const keys = new Map();
  const { findOrCreateStripeCustomer } = load("utils/billing/stripe-customers.ts", {
    "@/utils/billing/billing-repository": { updateProfileCustomerId: async (_admin, _user, id) => saved.push(id) },
  });
  const stripe = { customers: {
    retrieve: async () => ({ deleted: true }),
    create: async (_params, { idempotencyKey }) => {
      if (!keys.has(idempotencyKey)) keys.set(idempotencyKey, { id: `cus_${keys.size + 1}` });
      return keys.get(idempotencyKey);
    },
  } };
  const create = existingCustomerId => findOrCreateStripeCustomer(stripe, {}, { userId: "user-new", email: "test@example.test", existingCustomerId });
  const [a, b] = await Promise.all([create(), create()]);
  assert.equal(a, b);
  assert.equal(keys.size, 1);
  assert.notEqual(await create(a), a);
  assert.equal(keys.size, 2);
  assert.deepEqual(saved.slice(0, 2), [a, a]);
});

async function withEnv(values, callback) {
  const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
  try { await callback(); } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
}

test("billing config validates environment variables", async () => {
  const { getStripeSecretKey, getStripeWebhookSecret, getPremiumPriceConfig } = load("utils/billing/billing-config.ts");

  await withEnv({ STRIPE_SECRET_KEY: undefined }, async () => {
    assert.throws(() => getStripeSecretKey(), /Missing STRIPE_SECRET_KEY/);
  });
  await withEnv({ STRIPE_SECRET_KEY: "sk_test_123" }, async () => {
    assert.equal(getStripeSecretKey(), "sk_test_123");
  });

  await withEnv({ STRIPE_WEBHOOK_SECRET: undefined }, async () => {
    assert.throws(() => getStripeWebhookSecret(), /Missing STRIPE_WEBHOOK_SECRET/);
  });
  await withEnv({ STRIPE_WEBHOOK_SECRET: "whsec_123" }, async () => {
    assert.equal(getStripeWebhookSecret(), "whsec_123");
  });

  await withEnv({ STRIPE_PREMIUM_PRICE_ID: undefined }, async () => {
    assert.throws(() => getPremiumPriceConfig(), /Missing STRIPE_PREMIUM_PRICE_ID/);
  });
  await withEnv({ STRIPE_PREMIUM_PRICE_ID: "price_123", STRIPE_PREMIUM_PRODUCT_ID: "prod_123" }, async () => {
    const config = getPremiumPriceConfig();
    assert.equal(config.priceId, "price_123");
    assert.equal(config.productId, "prod_123");
  });
});

test("checkout price matches the Premium amount, currency and monthly interval shown publicly", async () => {
  const { resolvePremiumPriceId } = load("utils/billing/stripe-prices.ts");
  const price = {
    id: "price_123",
    active: true,
    product: "prod_123",
    unit_amount: 1499,
    currency: "gbp",
    billing_scheme: "per_unit",
    recurring: { interval: "month", interval_count: 1, usage_type: "licensed" },
  };
  const stripe = { prices: { retrieve: async () => price } };

  await withEnv({ STRIPE_PREMIUM_PRICE_ID: price.id, STRIPE_PREMIUM_PRODUCT_ID: price.product }, async () => {
    assert.equal(await resolvePremiumPriceId(stripe), price.id);
    for (const mismatch of [
      { unit_amount: 1490 },
      { currency: "usd" },
      { recurring: { interval: "year", interval_count: 1, usage_type: "licensed" } },
      { recurring: { interval: "month", interval_count: 3, usage_type: "licensed" } },
      { billing_scheme: "tiered" },
      { recurring: { interval: "month", interval_count: 1, usage_type: "metered" } },
    ]) {
      stripe.prices.retrieve = async () => ({ ...price, ...mismatch });
      await assert.rejects(resolvePremiumPriceId(stripe), /does not match the advertised Premium monthly price/);
    }
  });
});

test("Med interview checkout returns to pricing for confirmation and UCAT checkout keeps its dashboard", async () => {
  const { createPremiumCheckoutSession } = load("utils/billing/stripe-checkout.ts");
  const { getBillingReturnPath } = load("utils/billing/return-destination.ts");
  const created = [];
  const stripe = { checkout: { sessions: { create: async (params) => {
    created.push(params);
    return { url: "https://checkout.stripe.com/pay/cs_123" };
  } } } };
  const base = { customerId: "cus_123", userId: "user-1", priceId: "price_123", siteUrl: "https://medicforest.com", previousSessionId: "first" };

  await createPremiumCheckoutSession(stripe, { ...base, returnArea: "interviews" });
  assert.equal(created[0].success_url, "https://medicforest.com/pricing?checkout=success&session_id={CHECKOUT_SESSION_ID}");
  assert.equal(created[0].cancel_url, "https://medicforest.com/pricing?checkout=cancelled");

  await createPremiumCheckoutSession(stripe, { ...base, siteUrl: "https://www.medwithrish.com", returnArea: "interviews" });
  assert.match(created[1].success_url, /^https:\/\/www\.medwithrish\.com\/medicforest\/pricing\?/);

  await createPremiumCheckoutSession(stripe, base);
  assert.match(created[2].success_url, /^https:\/\/medicforest\.com\/medicforest\/ucat\/dashboard\?/);
  assert.equal(getBillingReturnPath(base.siteUrl, "interviews", "portal"), "/pricing");
  assert.equal(getBillingReturnPath(base.siteUrl, "ucat", "portal"), "/medicforest/account");
});

test("checkout redirects to portal when user already has active Stripe subscription", async () => {
  const { preparePremiumCheckout } = load("utils/billing/billing-service.ts", {
    "@/utils/billing/billing-repository": {
      ensureBillingProfile: async () => ({
        id: "user-1",
        current_plan: "premium",
        stripe_customer_id: "cus_stale",
        full_name: "Test User",
      }),
      findManageableSubscription: async () => ({ status: "active", stripe_customer_id: "cus_existing" }),
    },
    "@/utils/billing/stripe-portal": {
      createCustomerPortalSession: async (_stripe, customerId, returnUrl) => {
        assert.equal(customerId, "cus_existing");
        assert.ok(returnUrl.includes("/medicforest/account"));
        return "https://billing.stripe.com/portal/test";
      },
    },
    "@/utils/billing/stripe-client": {
      createStripeClient: () => ({}),
    },
  });

  const outcome = await preparePremiumCheckout({
    user: { id: "user-1", email: "user@example.test" },
    siteUrl: "https://medicforest.com",
    stripe: {},
    admin: {},
  });

  assert.equal(outcome.kind, "portal");
  assert.equal(outcome.url, "https://billing.stripe.com/portal/test");
});

test("checkout prevents double subscription for manual premium accounts", async () => {
  const { preparePremiumCheckout } = load("utils/billing/billing-service.ts", {
    "@/utils/billing/billing-repository": {
      ensureBillingProfile: async () => ({
        id: "user-manual",
        current_plan: "premium",
        stripe_customer_id: "cus_previous",
        subscription_status: "manual",
        full_name: "Manual User",
      }),
      findManageableSubscription: async () => null,
    },
    "@/utils/billing/stripe-client": {
      createStripeClient: () => ({}),
    },
    "@/utils/billing/stripe-portal": {
      createCustomerPortalSession: async () => assert.fail("Manual Premium must not open a Stripe portal"),
    },
  });

  await assert.rejects(
    preparePremiumCheckout({
      user: { id: "user-manual" },
      siteUrl: "https://medicforest.com",
      stripe: {},
      admin: {},
    }),
    /Manual Premium accounts do not have Stripe billing to manage/
  );
});

test("checkout creates customer and session for eligible free users", async () => {
  let createdCustomer = false;
  let createdSession = false;

  const { preparePremiumCheckout } = load("utils/billing/billing-service.ts", {
    "@/utils/billing/billing-repository": {
      ensureBillingProfile: async () => ({
        id: "user-new",
        current_plan: "free",
        stripe_customer_id: null,
        full_name: "New Student",
      }),
      findManageableSubscription: async () => null,
      updateProfileCustomerId: async () => {},
    },
    "@/utils/billing/stripe-customers": {
      findOrCreateStripeCustomer: async () => {
        createdCustomer = true;
        return "cus_new_123";
      },
      customerExists: async () => true,
    },
    "@/utils/billing/stripe-prices": {
      resolvePremiumPriceId: async () => "price_premium_123",
    },
    "@/utils/billing/stripe-checkout": {
      inspectPremiumCheckout: async () => ({ previousSessionId: "first", openSessionUrl: null, subscription: null }),
      createPremiumCheckoutSession: async (_stripe, params) => {
        assert.equal(params.customerId, "cus_new_123");
        assert.equal(params.userId, "user-new");
        assert.equal(params.priceId, "price_premium_123");
        assert.equal(params.returnArea, "interviews");
        createdSession = true;
        return "https://checkout.stripe.com/pay/cs_123";
      },
    },
    "@/utils/billing/stripe-client": {
      createStripeClient: () => ({}),
    },
  });

  const outcome = await preparePremiumCheckout({
    user: { id: "user-new", email: "student@example.test" },
    siteUrl: "https://medicforest.com",
    returnArea: "interviews",
    stripe: {},
    admin: {},
  });

  assert.equal(outcome.kind, "checkout");
  assert.equal(outcome.url, "https://checkout.stripe.com/pay/cs_123");
  assert.equal(createdCustomer, true);
  assert.equal(createdSession, true);
});

test("portal rejects users with manual premium or missing Stripe customer", async () => {
  const { openCustomerPortal } = load("utils/billing/billing-service.ts", {
    "@/utils/billing/billing-repository": {
      findBillingProfile: async () => ({
        id: "user-no-cus",
        stripe_customer_id: null,
      }),
    },
    "@/utils/billing/stripe-client": { createStripeClient: () => ({}) },
  });

  await assert.rejects(
    openCustomerPortal({
      user: { id: "user-no-cus" },
      siteUrl: "https://medicforest.com",
      stripe: {},
      admin: {},
    }),
    /No Stripe customer found/
  );

  const { openCustomerPortal: openPortalManual } = load("utils/billing/billing-service.ts", {
    "@/utils/billing/billing-repository": {
      findBillingProfile: async () => ({
        id: "user-manual",
        stripe_customer_id: "cus_123",
        stripe_subscription_id: null,
        subscription_status: "manual",
      }),
    },
    "@/utils/billing/stripe-client": { createStripeClient: () => ({}) },
  });

  await assert.rejects(
    openPortalManual({
      user: { id: "user-manual" },
      siteUrl: "https://medicforest.com",
      stripe: {},
      admin: {},
    }),
    /manual Premium access/
  );
});

test("portal can recover when the profile has a stale subscription ID", async () => {
  const { openCustomerPortal } = load("utils/billing/billing-service.ts", {
    "@/utils/billing/billing-repository": {
      findBillingProfile: async () => ({
        id: "user-paid", stripe_customer_id: "cus_paid",
        stripe_subscription_id: "sub_old", subscription_status: "active",
      }),
      findManageableSubscription: async (_admin, _userId, _statuses, filters) => {
        assert.deepEqual(filters, { customerId: "cus_paid" });
        return { status: "active", stripe_customer_id: "cus_paid" };
      },
    },
    "@/utils/billing/stripe-customers": { customerExists: async () => true },
    "@/utils/billing/stripe-portal": {
      createCustomerPortalSession: async () => "https://billing.stripe.com/portal/recovered",
    },
  });

  const outcome = await openCustomerPortal({
    user: { id: "user-paid" }, siteUrl: "https://medicforest.com", stripe: {}, admin: {},
  });
  assert.equal(outcome.url, "https://billing.stripe.com/portal/recovered");
});

test("checkout session sync enforces user ownership and rejects mismatched callers", async () => {
  const { synchronizeCheckoutSession } = load("utils/billing/billing-service.ts", {
    "@/utils/billing/stripe-client": {
      createStripeClient: () => ({
        checkout: {
          sessions: {
            retrieve: async () => ({
              id: "cs_123",
              client_reference_id: "user-different",
              metadata: { supabase_user_id: "user-different" },
              mode: "subscription",
              subscription: "sub_123",
            }),
          },
        },
      }),
    },
  });

  await assert.rejects(
    synchronizeCheckoutSession({
      user: { id: "user-caller" },
      sessionId: "cs_1234567890",
      stripe: undefined,
      admin: {},
    }),
    /does not belong to this user/
  );
});

test("webhook dispatcher processes subscription lifecycle events and ignores unsupported events", async () => {
  let syncedSubscriptionId = "";
  const { dispatchStripeWebhookEvent } = load("utils/billing/webhooks/dispatch-stripe-event.ts", {
    "@/utils/billing/stripe-subscriptions": {
      syncStripeSubscription: async (sub) => {
        syncedSubscriptionId = sub.id;
      },
    },
  });

  const mockStripe = {
    subscriptions: {
      retrieve: async (id) => ({ id, status: "canceled" }),
    },
  };

  const res1 = await dispatchStripeWebhookEvent({
    event: { type: "customer.subscription.deleted", data: { object: { id: "sub_deleted" } } },
    stripe: mockStripe,
  });
  assert.equal(res1.received, true);
  assert.equal(syncedSubscriptionId, "sub_deleted");

  // Ignored event
  const res2 = await dispatchStripeWebhookEvent({
    event: { type: "payment_intent.created", data: { object: {} } },
    stripe: mockStripe,
  });
  assert.equal(res2.received, true);
});

test("subscription metadata cannot move another customer's Premium access", async () => {
  const { findUserIdForSubscription } = load("utils/billing/stripe-subscriptions.ts", {
    "@/utils/billing/billing-repository": {
      findUserIdByCustomerId: async (_admin, customerId) => {
        assert.equal(customerId, "cus_owned");
        return "actual-owner";
      },
    },
  });

  await assert.rejects(
    findUserIdForSubscription({
      customer: "cus_owned",
      metadata: { supabase_user_id: "different-user" },
    }, {}),
    /different users/
  );
});

test("billing responses hide unexpected provider errors", async () => {
  const { toBillingResponse, BillingConflictError } = load("utils/billing/billing-errors.ts");
  const publicError = await toBillingResponse(new BillingConflictError("Already subscribed.")).json();
  assert.equal(publicError.error, "Already subscribed.");

  const providerResponse = toBillingResponse(
    { name: "StripeInvalidRequestError", statusCode: 402, message: "secret provider details" },
    "Could not start checkout."
  );
  assert.equal(providerResponse.status, 500);
  assert.deepEqual(await providerResponse.json(), { error: "Could not start checkout." });
});

test("subscription reconciliation preserves manual Premium and downgrades canceled paid access", async () => {
  let existingProfile;
  let activeSubscription = null;
  let savedProfile;
  const { syncStripeSubscription } = load("utils/billing/stripe-subscriptions.ts", {
    "@/utils/billing/billing-repository": {
      findUserIdByCustomerId: async () => "user-1",
      upsertSubscriptionRecord: async () => {},
      findLatestActiveSubscription: async () => activeSubscription,
      findBillingProfile: async () => existingProfile,
      updateProfileEntitlements: async (_admin, profile) => { savedProfile = profile; },
    },
  });
  const canceledSubscription = {
    id: "sub_paid", customer: "cus_paid", metadata: { supabase_user_id: "user-1" },
    status: "canceled", cancel_at_period_end: false, items: { data: [] },
  };

  existingProfile = {
    current_plan: "premium", stripe_customer_id: "cus_paid", stripe_subscription_id: null,
    subscription_status: "manual", premium_since: "2025-01-01T00:00:00.000Z",
  };
  await syncStripeSubscription(canceledSubscription, "user-1", {});
  assert.equal(savedProfile.current_plan, "premium");
  assert.equal(savedProfile.subscription_status, "manual");
  assert.equal(savedProfile.premium_since, existingProfile.premium_since);

  existingProfile = { ...existingProfile, stripe_subscription_id: "sub_paid", subscription_status: "active" };
  await syncStripeSubscription(canceledSubscription, "user-1", {});
  assert.equal(savedProfile.current_plan, "free");
  assert.equal(savedProfile.subscription_status, "canceled");
  assert.equal(savedProfile.premium_since, null);

  activeSubscription = { stripe_customer_id: "cus_paid", stripe_subscription_id: "sub_other", status: "active" };
  await syncStripeSubscription(canceledSubscription, "user-1", {});
  assert.equal(savedProfile.current_plan, "premium");
  assert.equal(savedProfile.stripe_subscription_id, "sub_other");
});
