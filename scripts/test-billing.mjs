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
    unit_amount: 1490,
    currency: "gbp",
    recurring: { interval: "month" },
  };
  const stripe = { prices: { retrieve: async () => price } };

  await withEnv({ STRIPE_PREMIUM_PRICE_ID: price.id, STRIPE_PREMIUM_PRODUCT_ID: price.product }, async () => {
    assert.equal(await resolvePremiumPriceId(stripe), price.id);
    for (const mismatch of [
      { unit_amount: 1499 },
      { currency: "usd" },
      { recurring: { interval: "year" } },
    ]) {
      stripe.prices.retrieve = async () => ({ ...price, ...mismatch });
      await assert.rejects(resolvePremiumPriceId(stripe), /does not match the advertised Premium monthly price/);
    }
  });
});

test("interview checkout returns to pricing for confirmation and UCAT checkout keeps its dashboard", async () => {
  const { createPremiumCheckoutSession } = load("utils/billing/stripe-checkout.ts");
  const { getBillingReturnPath } = load("utils/billing/return-destination.ts");
  const created = [];
  const stripe = { checkout: { sessions: { create: async (params) => {
    created.push(params);
    return { url: "https://checkout.stripe.com/pay/cs_123" };
  } } } };
  const base = { customerId: "cus_123", userId: "user-1", priceId: "price_123", siteUrl: "https://medicforest.com" };

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
