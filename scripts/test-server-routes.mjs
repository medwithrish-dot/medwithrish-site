import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

// Execute the real handlers with isolated provider adapters; no network or keys.
function load(file, mocks = {}, cache = new Map()) {
  const path = resolve(root, file);
  if (cache.has(path)) return cache.get(path);
  const fileDir = dirname(path);
  const compiledModule = { exports: {} };
  cache.set(path, compiledModule.exports);
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
    if (name.startsWith("@/")) return load(`${name.slice(2)}.ts`, mocks, cache);
    if (name.startsWith("./") || name.startsWith("../")) {
      const targetPath = resolve(fileDir, name);
      const relPath = targetPath.slice(root.length + 1).replace(/\\/g, "/");
      const normalizedPath = relPath.endsWith(".ts") ? relPath : `${relPath}.ts`;
      return load(normalizedPath, mocks, cache);
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

const jsonRequest = (body) => new Request("https://example.test/api", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});
const auth = { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: "user-1" } } }) } }) };
const noStripe = { createStripeClient() { throw new Error("Stripe must not be called for invalid input"); } };

test("checkout synchronization rejects non-string session IDs before contacting Stripe", async () => {
  const { POST } = load("app/api/stripe/sync-checkout-session/route.ts", {
    "@/utils/supabase/server": auth, "@/utils/stripe": noStripe,
    "@/utils/stripe-subscriptions": { syncStripeSubscription: () => assert.fail("must not sync") },
  });
  for (const body of [null, {}, { sessionId: 123 }, { sessionId: {} }, { sessionId: "unrelated" }]) {
    assert.equal((await POST(jsonRequest(body))).status, 400);
  }
});

test("checkout accepts only named return destinations", async () => {
  const calls = [];
  const { POST } = load("app/api/stripe/create-checkout-session/route.ts", {
    "@/utils/supabase/server": auth,
    "@/utils/site-url": { getRequiredSiteUrl: () => "https://medicforest.com" },
    "@/utils/billing/billing-service": { preparePremiumCheckout: async (args) => {
      calls.push(args.returnArea);
      return { kind: "checkout", url: "https://checkout.stripe.com/pay/cs_123" };
    } },
  });

  assert.equal((await POST(jsonRequest({ returnTo: "https://attacker.example" }))).status, 400);
  assert.equal((await POST(jsonRequest({ returnTo: "interviews" }))).status, 200);
  assert.equal((await POST(new Request("https://example.test/api/stripe/create-checkout-session", { method: "POST" }))).status, 200);
  assert.deepEqual(calls, ["interviews", "ucat"]);
});

test("tutoring checkout maps every package price and attaches email to the Stripe customer", async () => {
  const sessions = [];
  class Stripe {
    checkout = {
      sessions: {
        create: async (params) => {
          sessions.push(params);
          return { url: "https://checkout.stripe.com/pay/cs_tutoring_123" };
        },
      },
    };
  }

  await withEnv({
    STRIPE_SECRET_KEY: "sk_test_only",
    STRIPE_PRICE_TUTORING_UCAT_RISH: "price_ucat_rish",
    STRIPE_PRICE_TUTORING_UCAT_SPECIALIST: "price_ucat_specialist",
    STRIPE_PRICE_TUTORING_COMPLETE_BUNDLE: "price_complete_bundle",
    STRIPE_PRICE_TUTORING_INTERVIEW_RISH: "price_interview_rish",
    STRIPE_PRICE_TUTORING_INTERVIEW_SPECIALIST: "price_interview_specialist",
  }, async () => {
    const { POST } = load("app/api/stripe/create-tutoring-checkout/route.ts", {
      stripe: Stripe,
      "@/utils/site-url": { getRequiredSiteUrl: () => "https://medicforest.com" },
    });

    for (const body of [
      { packageId: "ucat-rish" },
      { packageId: "ucat-rish", email: "not-an-email" },
      { packageId: "not-a-package", email: "student@example.test" },
    ]) {
      assert.equal((await POST(jsonRequest(body))).status, 400);
    }
    assert.equal(sessions.length, 0);

    const expectedPrices = {
      "ucat-rish": "price_ucat_rish",
      "ucat-specialist": "price_ucat_specialist",
      "complete-bundle": "price_complete_bundle",
      "interview-rish": "price_interview_rish",
      "interview-specialist": "price_interview_specialist",
    };

    for (const [packageId, priceId] of Object.entries(expectedPrices)) {
      const response = await POST(jsonRequest({
        packageId,
        email: "  student@example.test  ",
      }));
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), {
        configured: true,
        url: "https://checkout.stripe.com/pay/cs_tutoring_123",
      });

      const session = sessions.at(-1);
      assert.equal(session.customer_email, "student@example.test");
      assert.equal(session.customer_creation, "always");
      assert.equal(session.line_items[0].price, priceId);
      assert.equal(session.metadata.packageId, packageId);
    }

    assert.equal(sessions.length, Object.keys(expectedPrices).length);
  });
});

test("site URLs are validated and production checkout cannot use a caller's localhost Origin", async () => {
  const { getRequiredSiteUrl, getPublicSiteUrl, getProductSiteUrl } = load("utils/site-url.ts");
  const request = new Request("https://example.test", { headers: { Origin: "http://localhost:9999" } });
  await withEnv({ NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: undefined, NEXT_PUBLIC_PRODUCT_SITE_URL: undefined }, async () => {
    assert.throws(() => getRequiredSiteUrl(request), /Missing/);
    assert.equal(getPublicSiteUrl(), "https://www.medwithrish.com");
    assert.equal(getProductSiteUrl(), "https://medicforest.com");
  });
  for (const url of ["httpwhatever", "javascript:alert(1)", "https://user:pass@example.test", "https://example.test/path", "https://example.test/?foo=bar"]) {
    await withEnv({ NEXT_PUBLIC_SITE_URL: url }, async () => assert.throws(() => getRequiredSiteUrl(request)));
  }
  await withEnv({ NEXT_PUBLIC_SITE_URL: " https://example.test/ " }, async () => {
    assert.equal(getRequiredSiteUrl(request), "https://example.test");
  });
  await withEnv({ NEXT_PUBLIC_SITE_URL: "https://www.medwithrish.com", NEXT_PUBLIC_PRODUCT_SITE_URL: "https://medicforest.com" }, async () => {
    assert.equal(getRequiredSiteUrl(new Request("https://medicforest.com/api/stripe/create-checkout-session")), "https://medicforest.com");
  });
  await withEnv({ NEXT_PUBLIC_PRODUCT_SITE_URL: "https://medicforest.com/path" }, async () => {
    assert.throws(() => getProductSiteUrl(), /NEXT_PUBLIC_PRODUCT_SITE_URL/);
  });
});

test("feedback submissions are validated before email delivery", async () => {
  let providerCalls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { providerCalls++; return Response.json({ id: "email-1" }); };
  try {
    await withEnv({ RESEND_API_KEY: "test-only" }, async () => {
      const { POST } = load("app/api/feedback/route.ts");
      assert.equal((await POST(jsonRequest({ message: "" }))).status, 400);
      assert.equal((await POST(jsonRequest({ message: "Useful feedback", category: "Invalid" }))).status, 400);
      assert.equal((await POST(jsonRequest({ message: "Useful feedback", email: "not-an-email" }))).status, 400);
      assert.equal((await POST(new Request("https://example.test/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: "https://attacker.test" },
        body: JSON.stringify({ message: "Useful feedback" }),
      }))).status, 403);
      assert.equal(providerCalls, 0);
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("feedback submissions are emailed to the MedWithRish inbox", async () => {
  let providerRequest;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    providerRequest = { url, init, body: JSON.parse(init.body) };
    return Response.json({ id: "email-1" });
  };
  try {
    await withEnv({
      RESEND_API_KEY: "test-only",
      FEEDBACK_TO_EMAIL: undefined,
      FEEDBACK_FROM_EMAIL: undefined,
    }, async () => {
      const { POST } = load("app/api/feedback/route.ts");
      const response = await POST(jsonRequest({
        category: "Feature request",
        message: "Please add this useful feature.",
        email: "student@example.test",
        website: "",
      }));
      assert.equal(response.status, 200);
      assert.equal(providerRequest.url, "https://api.resend.com/emails");
      assert.equal(providerRequest.init.headers.Authorization, "Bearer test-only");
      assert.deepEqual(providerRequest.body.to, ["medwithrish@gmail.com"]);
      assert.equal(providerRequest.body.reply_to, "student@example.test");
      assert.match(providerRequest.body.subject, /Feature request/);
      assert.match(providerRequest.body.text, /Please add this useful feature/);
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("subscription checkout webhooks retrieve subscription and sync", async () => {
  let synced = false;
  const currentSub = { id: "sub_paid", status: "active" };
  const event = {
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_sub_1",
        mode: "subscription",
        subscription: "sub_paid",
      },
    },
  };
  const { POST } = load("app/api/stripe/webhook/route.ts", {
    "@/utils/stripe": {
      createStripeClient: () => ({
        webhooks: { constructEvent: () => event },
        subscriptions: { retrieve: async (id) => { assert.equal(id, "sub_paid"); return currentSub; } },
      }),
    },
    "@/utils/stripe-subscriptions": {
      syncStripeSubscription: async (sub) => {
        assert.equal(sub.id, "sub_paid");
        synced = true;
      },
    },
  });
  const request = () => new Request("https://example.test", {
    method: "POST",
    headers: { "stripe-signature": "test" },
    body: "{}",
  });
  await withEnv({ STRIPE_WEBHOOK_SECRET: "test-only" }, async () => {
    const res = await POST(request());
    assert.equal(res.status, 200);
    assert.equal(synced, true);
  });
});

test("subscription webhooks reconcile current provider state instead of stale event snapshots", async () => {
  const current = { id: "sub_1", status: "canceled" };
  const { POST } = load("app/api/stripe/webhook/route.ts", {
    "@/utils/stripe": { createStripeClient: () => ({
      webhooks: { constructEvent: () => ({ type: "customer.subscription.updated", data: { object: { id: "sub_1", status: "active" } } }) },
      subscriptions: { retrieve: async (id) => { assert.equal(id, "sub_1"); return current; } },
    }) },
    "@/utils/stripe-subscriptions": { syncStripeSubscription: async (value) => assert.equal(value, current) },
  });
  await withEnv({ STRIPE_WEBHOOK_SECRET: "test-only" }, async () => {
    assert.equal((await POST(new Request("https://example.test", { method: "POST", headers: { "stripe-signature": "test" }, body: "{}" }))).status, 200);
  });
});

test("subscription sync persists billing periods from the current Stripe item schema", async () => {
  let savedSubscription;
  const query = (table) => {
    const builder = {
      select() { return this; }, eq() { return this; }, in() { return this; }, order() { return this; }, limit() { return this; },
      upsert(value) { if (table === "subscriptions") savedSubscription = value; return this; },
      maybeSingle: async () => ({ data: null, error: null }),
      then(resolve) { return Promise.resolve({ error: null }).then(resolve); },
    };
    return builder;
  };
  const { syncStripeSubscription } = load("utils/stripe-subscriptions.ts", { "@/utils/supabase/admin": { createAdminClient: () => ({ from: query }) } });
  await syncStripeSubscription({
    id: "sub_1", customer: "cus_1", metadata: { supabase_user_id: "user-1" }, status: "canceled", cancel_at_period_end: false,
    items: { data: [{ current_period_end: 1788692400, price: { id: "price_1" } }] },
  });
  assert.equal(savedSubscription.current_period_end, new Date(1788692400000).toISOString());
});

test("failed AI requests do not overwrite a newer credit reservation", async () => {
  const profile = { current_plan: "free", diagnostic_credits: 1, ai_diagnostic_last_used_at: null };
  const attempt = { id: "attempt-1", user_id: "user-1", accuracy: 60, metadata: { summary: { section: "qr", accuracy: 60 } } };
  let refundUpdates = 0;
  const query = (table) => {
    const filters = []; let update;
    const execute = () => {
      if (table === "diagnostic_attempts") return { data: [attempt], error: null };
      if (update && filters.every(([key, value]) => key === "id" || profile[key] === value)) {
        if (update.diagnostic_credits === 1) refundUpdates++;
        Object.assign(profile, update);
        return { data: { ...profile }, error: null };
      }
      return { data: update ? null : { ...profile }, error: null };
    };
    return {
      select() { return this; }, in() { return this; },
      eq(key, value) { filters.push([key, value]); return this; },
      is(key, value) { filters.push([key, value]); return this; },
      update(value) { update = value; return this; },
      maybeSingle: async () => execute(), then(resolve) { return Promise.resolve(execute()).then(resolve); },
    };
  };
  const { POST } = load("app/api/ai/diagnostic-feedback/route.ts", {
    "@/utils/supabase/server": auth,
    "@/utils/supabase/admin": { createAdminClient: () => ({ from: query }) },
    "@anthropic-ai/sdk": class { messages = { create: async () => {
      profile.ai_diagnostic_last_used_at = "2026-09-07T00:00:00Z";
      throw new Error("provider timeout");
    } }; },
  });
  assert.equal((await POST(jsonRequest(null))).status, 400);
  await withEnv({ ANTHROPIC_API_KEY: "test-only" }, async () => {
    assert.equal((await POST(jsonRequest({ attemptId: "attempt-1" }))).status, 502);
    assert.equal(profile.diagnostic_credits, 0);
    assert.equal(profile.ai_diagnostic_last_used_at, "2026-09-07T00:00:00Z");
    assert.equal(refundUpdates, 0);
  });
});

test("diagnostic AI uses saved results instead of caller-supplied scores and issues", async () => {
  const attempt = {
    id: "attempt-1", user_id: "user-1", ai_feedback: null, ai_feedback_requested_at: null,
    metadata: {
      summary: { section: "qr", accuracy: 60, scorePoints: 3, maxScore: 5, totalQuestions: 5 },
      insights: { issues: [{ label: "Saved timing issue" }], strengths: [] },
    },
  };
  const profile = { current_plan: "free", diagnostic_credits: 1, ai_diagnostic_last_used_at: null };
  let prompt;
  const query = (table) => {
    let update;
    return {
      select() { return this; }, eq() { return this; }, in() { return this; }, is() { return this; },
      update(value) { update = value; return this; },
      async maybeSingle() {
        if (table !== "profiles") throw new Error("Unexpected single-row query");
        if (update) Object.assign(profile, update);
        return { data: { ...profile }, error: null };
      },
      then(resolve) {
        if (table === "diagnostic_attempts") {
          if (update) Object.assign(attempt, update);
          return Promise.resolve({ data: [attempt], error: null }).then(resolve);
        }
        return Promise.resolve({ data: { ...profile }, error: null }).then(resolve);
      },
    };
  };
  const { POST } = load("app/api/ai/diagnostic-feedback/route.ts", {
    "@/utils/supabase/server": auth,
    "@/utils/supabase/admin": { createAdminClient: () => ({ from: query }) },
    "@anthropic-ai/sdk": class { messages = { create: async ({ messages }) => {
      prompt = messages[0].content;
      return { content: [{ type: "text", text: "Use saved QR timing data." }] };
    } }; },
  });
  await withEnv({ ANTHROPIC_API_KEY: "test-only" }, async () => {
    const response = await POST(jsonRequest({
      attemptId: attempt.id, section: "VR", accuracy: 100, scorePoints: 99,
      issues: [{ label: "Forged issue" }],
    }));
    assert.equal(response.status, 200);
  });
  assert.match(prompt, /QR diagnostic/);
  assert.match(prompt, /Score: 3\/5/);
  assert.match(prompt, /Saved timing issue/);
  assert.doesNotMatch(prompt, /Forged issue|99\/|VR diagnostic/);
});

test("full mock AI rejects duplicate sections before using a credit", async () => {
  const attempts = ["attempt-1", "attempt-2"].map((id) => ({
    id, user_id: "user-1", accuracy: 60,
    metadata: { mockId: "mock-1", mockScope: "full-mock", summary: { section: "qr", accuracy: 60 } },
  }));
  const { POST } = load("app/api/ai/diagnostic-feedback/route.ts", {
    "@/utils/supabase/server": auth,
    "@/utils/supabase/admin": { createAdminClient: () => ({
      from(table) {
        assert.equal(table, "diagnostic_attempts");
        return { select() { return this; }, eq() { return this; }, in: async () => ({ data: attempts, error: null }) };
      },
    }) },
  });
  const response = await POST(jsonRequest({ attemptId: "attempt-1", attemptIds: ["attempt-1", "attempt-2"] }));
  assert.equal(response.status, 400);
});

test("proxy only refreshes authentication for account pages and authenticated APIs", () => {
  const { config } = load("proxy.ts");
  // The installed Next 16 test package still exports the legacy helper name.
  const { unstable_doesMiddlewareMatch: doesProxyMatch } = require("next/experimental/testing/server");
  for (const url of ["/", "/terms-and-conditions", "/fonts/site.woff2", "/api/stripe/webhook", "/api/medicforest/preview-access"]) {
    assert.equal(doesProxyMatch({ config, nextConfig: {}, url }), false, url);
  }
  for (const url of ["/medicforest/ucat/dashboard", "/medicforest/access", "/api/interviews/feedback", "/api/ai/diagnostic-feedback", "/api/stripe/create-checkout-session"]) {
    assert.equal(doesProxyMatch({ config, nextConfig: {}, url }), true, url);
  }
});

test("preview proxy gates clean product Med interview paths while keeping public paths open", async () => {
  const { NextRequest } = require("next/server");
  const { proxy } = load("proxy.ts", {
    "@supabase/ssr": { createServerClient: () => assert.fail("public or denied requests must not refresh auth") },
    "@/utils/medicforest/preview-access": {
      MEDICFOREST_PREVIEW_COOKIE: "medicforest_preview_access",
      isValidMedicForestPreviewToken: async () => false,
    },
  });

  await withEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://supabase.example.test", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-key", NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined }, async () => {
    const denied = await proxy(new NextRequest("https://medicforest.com/interviews/dashboard"));
    assert.equal(denied.status, 307);
    assert.equal(new URL(denied.headers.get("location")).pathname, "/");
    assert.equal(new URL(denied.headers.get("location")).searchParams.get("preview"), "interview");

    const prefixed = await proxy(new NextRequest("https://medwithrish.com/medicforest/interview/dashboard"));
    assert.equal(prefixed.status, 307);
    assert.equal(new URL(prefixed.headers.get("location")).pathname, "/medicforest");

    const publicPage = await proxy(new NextRequest("https://medicforest.com/interviews/leaderboard"));
    assert.equal(publicPage.status, 200);
    assert.equal(publicPage.headers.get("location"), null);
  });
});

test("valid preview access still refreshes auth on protected Med interview pages", async () => {
  const { NextRequest } = require("next/server");
  let claimReads = 0;
  const { proxy } = load("proxy.ts", {
    "@supabase/ssr": { createServerClient: () => ({
      auth: { getClaims: async () => { claimReads += 1; return { data: { claims: null } }; } },
    }) },
    "@/utils/medicforest/preview-access": {
      MEDICFOREST_PREVIEW_COOKIE: "medicforest_preview_access",
      isValidMedicForestPreviewToken: async () => true,
    },
  });

  await withEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://supabase.example.test", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-key" }, async () => {
    const response = await proxy(new NextRequest("https://medicforest.com/interviews/dashboard"));
    assert.equal(response.status, 200);
    assert.equal(claimReads, 1);
  });
});

test("brand and product crawler files advertise only their own domains", async () => {
  await withEnv({ NEXT_PUBLIC_SITE_URL: undefined, NEXT_PUBLIC_PRODUCT_SITE_URL: undefined }, async () => {
    const brandSitemap = load("app/sitemap.ts").default();
    const productSitemap = load("app/medicforest/sitemap.ts").default();
    const brandRobots = load("app/robots.ts").default();
    const productRobots = await load("app/medicforest/robots-file/route.ts").GET().text();

    assert.ok(brandSitemap.every((entry) => entry.url.startsWith("https://www.medwithrish.com/")));
    assert.ok(productSitemap.every((entry) => entry.url.startsWith("https://medicforest.com/")));
    assert.ok(!brandSitemap.some((entry) => entry.url.includes("/medicforest/")));
    assert.ok(brandRobots.rules.disallow.includes("/medicforest/"));
    assert.match(productRobots, /Sitemap: https:\/\/medicforest\.com\/sitemap\.xml/);
  });
});

test("preview access rejects wrong passwords and redirect targets, and tokens rotate with the secret", async () => {
  await withEnv({
    MEDICFOREST_PREVIEW_PASSWORD: "preview-password",
    MEDICFOREST_PREVIEW_TOKEN_SECRET: "first-secret",
  }, async () => {
    const { POST } = load("app/api/medicforest/preview-access/route.ts");
    const {
      createMedicForestPreviewToken,
      isValidMedicForestPreviewToken,
      MEDICFOREST_PREVIEW_COOKIE_MAX_AGE,
    } = load("utils/medicforest/preview-access.ts");
    const submit = (password, next) => POST(new Request("https://example.test/api/medicforest/preview-access", {
      method: "POST",
      body: new URLSearchParams({ password, next }),
    }));

    const denied = await submit("wrong", "/medicforest/interview/dashboard");
    assert.equal(denied.status, 303);
    assert.match(denied.headers.get("location"), /error=invalid/);
    assert.equal(denied.headers.get("set-cookie"), null);

    const granted = await submit("preview-password", "https://attacker.example/");
    assert.equal(granted.status, 303);
    assert.equal(granted.headers.get("location"), "https://example.test/medicforest");
    assert.match(granted.headers.get("set-cookie"), /medicforest_preview_access=.*HttpOnly/i);
    const issuedCookie = granted.headers.get("set-cookie").match(/medicforest_preview_access=([^;]+)/)?.[1];
    assert.equal(await isValidMedicForestPreviewToken(issuedCookie), true);

    const token = await createMedicForestPreviewToken();
    assert.match(token, /^v2\.\d+\.[0-9a-f]{64}$/);
    assert.equal(await isValidMedicForestPreviewToken(token), true);
    const [version, issuedAtText, signature] = token.split(".");
    const issuedAt = Number(issuedAtText);
    assert.equal(await isValidMedicForestPreviewToken(`${version}.${issuedAtText}.${signature[0] === "0" ? "1" : "0"}${signature.slice(1)}`), false);
    assert.equal(await isValidMedicForestPreviewToken(`${version}.${issuedAt + 1}.${signature}`), false);
    assert.equal(await isValidMedicForestPreviewToken("a".repeat(64)), false);
    assert.equal(await isValidMedicForestPreviewToken(token, (issuedAt + MEDICFOREST_PREVIEW_COOKIE_MAX_AGE + 1) * 1000), false);
    assert.equal(await isValidMedicForestPreviewToken(token, (issuedAt - 61) * 1000), false);
    process.env.MEDICFOREST_PREVIEW_TOKEN_SECRET = "second-secret";
    assert.equal(await isValidMedicForestPreviewToken(token), false);
  });
});

test("leaderboard handlers reject offensive names before writing and mask legacy names on read", async () => {
  let signedIn = true;
  const writes = [];
  const query = (table) => ({
    select() { return this; }, eq() { return this; }, not() { return this; }, order() { return this; }, limit() { return this; },
    maybeSingle: async () => ({ error: null, data: table === "profiles" ? { current_plan: "free" }
      : table === "interview_preferences" ? { display_name: "f.u.c.k", leaderboard_opt_in: true } : { score: 88.5 } }),
    upsert: async (value) => { writes.push(value); return { error: null }; },
  });
  const { PATCH, GET } = load("app/api/interviews/leaderboard/route.ts", {
    "server-only": {},
    "@/utils/supabase/admin": { createAdminClient: () => ({ from: query }) },
    "@/utils/supabase/server": { createClient: async () => ({
      auth: { getUser: async () => ({ data: { user: signedIn ? { id: "account-123" } : null } }) },
      rpc: async () => ({ data: [
        { rank: 1, display_name: "shit", score: 88.5, is_you: true },
        { rank: 2, display_name: "Hassan", score: 80, is_you: false },
      ], error: null }),
      from: query,
    }) },
  });
  for (const displayName of ["fuck", "sh1t", "f.u.c.k", "fuсk", "a55hole", "fuuuck", "A".repeat(33)]) {
    assert.equal((await PATCH(jsonRequest({ displayName, optIn: true }))).status, 400, displayName);
  }
  assert.equal(writes.length, 0);
  assert.equal((await PATCH(jsonRequest({ displayName: "  Shital Shah  ", optIn: true, userId: "someone-else" }))).status, 200);
  assert.equal(writes[0].user_id, "account-123");
  assert.equal(writes[0].display_name, "Shital Shah");
  const board = await (await GET()).json();
  assert.equal(board.entries[0].display_name, "Candidate");
  assert.equal(board.entries[0].score, 88.5);
  assert.equal(board.entries[1].display_name, "Hassan");
  assert.equal(board.preference.display_name, "Candidate accoun");
  signedIn = false;
  assert.equal((await PATCH(jsonRequest({ displayName: "Hassan", optIn: true }))).status, 401);
  assert.equal(writes.length, 1);
});

test("an auth-refresh outage allows route-level recovery without bypassing the preview gate", async () => {
  const { NextRequest } = require("next/server");
  let refreshes = 0;
  const mocks = {
    "@supabase/ssr": { createServerClient: () => ({ auth: { getClaims: async () => { refreshes++; throw new Error("offline"); } } }) },
    "@/utils/medicforest/preview-access": { MEDICFOREST_PREVIEW_COOKIE: "medicforest_preview_access", isValidMedicForestPreviewToken: async () => true },
  };
  const previousLog = console.error;
  const logs = [];
  console.error = (...args) => logs.push(args);
  try {
    await withEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://supabase.example.test", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-key" }, async () => {
      const { proxy } = load("proxy.ts", mocks);
      const response = await proxy(new NextRequest("https://medicforest.com/interviews/dashboard"));
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("x-middleware-next"), "1");
      assert.equal(refreshes, 1);
      const denied = load("proxy.ts", { ...mocks, "@/utils/medicforest/preview-access": { ...mocks["@/utils/medicforest/preview-access"], isValidMedicForestPreviewToken: async () => false } });
      assert.equal((await denied.proxy(new NextRequest("https://medicforest.com/interviews/dashboard"))).status, 307);
      assert.equal(refreshes, 1);
    });
    assert.deepEqual(logs, [["auth_refresh_unavailable"]]);
  } finally { console.error = previousLog; }
});
