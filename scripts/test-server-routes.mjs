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
function load(file, mocks = {}) {
  const path = resolve(root, file);
  const compiledModule = { exports: {} };
  const javascript = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const localRequire = (name) => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name.startsWith("@/")) return load(`${name.slice(2)}.ts`, mocks);
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

test("checkout rejects malformed bodies, invalid email addresses and arbitrary storage paths before Stripe", async () => {
  const { POST } = load("app/api/ps-review/checkout/route.ts", { "@/utils/stripe": noStripe });
  const valid = { email: "student@example.test", reviewType: "medicine", filePath: "cfca31be-7212-47d5-b00c-f1502baf307e.pdf" };
  for (const body of [null, [], 5, {}, { ...valid, email: {} }, { ...valid, email: "<b>@example.test" }, { ...valid, reviewType: [] }, { ...valid, filePath: "../private.pdf" }]) {
    assert.equal((await POST(jsonRequest(body))).status, 400);
  }
  assert.equal((await POST(new Request("https://example.test", { method: "POST", body: "{" }))).status, 400);
});

test("PDF upload validates actual file contents and handles bad forms and storage outages", async () => {
  let uploads = 0;
  let storageFails = false;
  const { POST } = load("app/api/ps-review/upload/route.ts", {
    "@/utils/supabase/admin": { createAdminClient: () => ({ storage: { from: () => ({ upload: async () => {
      uploads += 1; return { error: storageFails ? { message: "private provider details" } : null };
    } }) } }) },
  });
  async function upload(value) {
    const form = new FormData(); form.set("file", value);
    return POST(new Request("https://example.test", { method: "POST", body: form }));
  }
  assert.equal((await POST(new Request("https://example.test", { method: "POST", body: "broken" }))).status, 400);
  assert.equal((await upload("not a File" )).status, 400);
  assert.equal((await upload(new File(["<script>bad</script>"], "fake.pdf", { type: "application/pdf" }))).status, 400);
  assert.equal(uploads, 0);
  const response = await upload(new File(["%PDF-1.7\ncontent"], "valid.pdf", { type: "application/pdf" }));
  assert.equal(response.status, 200);
  assert.match((await response.json()).filePath, /^[0-9a-f-]+\.pdf$/);
  storageFails = true;
  const failed = await upload(new File(["%PDF-1.7"], "valid.pdf", { type: "application/pdf" }));
  assert.equal(failed.status, 500);
  assert.doesNotMatch(JSON.stringify(await failed.json()), /private provider/);
});

test("PS checkout only accepts files that exist in the upload bucket", async () => {
  let exists = false;
  const { POST } = load("app/api/ps-review/checkout/route.ts", {
    "@/utils/supabase/admin": { createAdminClient: () => ({ storage: { from: () => ({ exists: async () => ({ data: exists, error: null }) }) } }) },
    "@/utils/stripe": { createStripeClient: () => ({ checkout: { sessions: { create: async () => ({ url: "https://checkout.stripe.test/session" }) } } }) },
  });
  await withEnv({ STRIPE_PS_REVIEW_PRICE_ID: "price_test", NEXT_PUBLIC_SITE_URL: "https://example.test" }, async () => {
    const body = { email: "student@example.test", reviewType: "medicine", filePath: "cfca31be-7212-47d5-b00c-f1502baf307e.pdf" };
    assert.equal((await POST(jsonRequest(body))).status, 400);
    exists = true;
    const response = await POST(jsonRequest(body));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).url, "https://checkout.stripe.test/session");
  });
});

test("checkout synchronization rejects non-string session IDs before contacting Stripe", async () => {
  const { POST } = load("app/api/stripe/sync-checkout-session/route.ts", {
    "@/utils/supabase/server": auth, "@/utils/stripe": noStripe,
    "@/utils/stripe-subscriptions": { syncStripeSubscription: () => assert.fail("must not sync") },
  });
  for (const body of [null, {}, { sessionId: 123 }, { sessionId: {} }, { sessionId: "unrelated" }]) {
    assert.equal((await POST(jsonRequest(body))).status, 400);
  }
});

test("site URLs are validated and production checkout cannot use a caller's localhost Origin", async () => {
  const { getRequiredSiteUrl, getPublicSiteUrl } = load("utils/site-url.ts");
  const request = new Request("https://example.test", { headers: { Origin: "http://localhost:9999" } });
  await withEnv({ NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: undefined }, async () => {
    assert.throws(() => getRequiredSiteUrl(request), /Missing/);
    assert.equal(getPublicSiteUrl(), "https://www.medwithrish.com");
  });
  for (const url of ["httpwhatever", "javascript:alert(1)", "https://user:pass@example.test", "https://example.test/path", "https://example.test/?foo=bar"]) {
    await withEnv({ NEXT_PUBLIC_SITE_URL: url }, async () => assert.throws(() => getRequiredSiteUrl(request)));
  }
  await withEnv({ NEXT_PUBLIC_SITE_URL: " https://example.test/ " }, async () => {
    assert.equal(getRequiredSiteUrl(request), "https://example.test");
  });
});

test("PS webhooks wait for payment and propagate delivery failures for Stripe retries", async () => {
  let inserts = 0; let sends = 0; let failure = "";
  let event = { type: "checkout.session.completed", data: { object: {
    id: "cs_test_1", mode: "payment", created: 1788692400, payment_status: "unpaid",
    metadata: { submission_type: "ps_review", student_email: "student@example.test", file_path: "file.pdf", review_type: "medicine" },
  } } };
  const { POST } = load("app/api/stripe/webhook/route.ts", {
    "@/utils/stripe": { createStripeClient: () => ({ webhooks: { constructEvent: () => event } }) },
    "@/utils/stripe-subscriptions": { syncStripeSubscription: () => assert.fail("not a subscription") },
    "@/utils/supabase/admin": { createAdminClient: () => ({
      from: () => ({ insert: async () => { inserts++; return { error: failure === "db" ? { code: "XX000" } : null }; } }),
      storage: { from: () => ({ createSignedUrl: async () => ({ data: { signedUrl: "https://storage.test/file" }, error: failure === "storage" ? new Error("unavailable") : null }) }) },
    }) },
    resend: { Resend: class { emails = { send: async () => { sends++; return { error: failure === "email" ? { message: "unavailable" } : null }; } }; } },
  });
  const request = () => new Request("https://example.test", { method: "POST", headers: { "stripe-signature": "test" }, body: "{}" });
  await withEnv({ STRIPE_WEBHOOK_SECRET: "test-only" }, async () => {
    assert.equal((await POST(request())).status, 200);
    assert.equal(inserts, 0); assert.equal(sends, 0);
    event = { ...event, type: "checkout.session.async_payment_succeeded", data: { object: { ...event.data.object, payment_status: "paid" } } };
    assert.equal((await POST(request())).status, 200);
    assert.equal(inserts, 1); assert.equal(sends, 1);
    for (failure of ["db", "storage", "email"]) assert.equal((await POST(request())).status, 500);
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
  const attempt = { id: "attempt-1", user_id: "user-1", metadata: {} };
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

test("proxy only refreshes authentication for account pages and authenticated APIs", () => {
  const { config } = load("proxy.ts");
  // The installed Next 16 test package still exports the legacy helper name.
  const { unstable_doesMiddlewareMatch: doesProxyMatch } = require("next/experimental/testing/server");
  for (const url of ["/", "/terms-and-conditions", "/fonts/site.woff2", "/api/stripe/webhook", "/api/ps-review/upload", "/api/rishbot/question"]) {
    assert.equal(doesProxyMatch({ config, nextConfig: {}, url }), false, url);
  }
  for (const url of ["/phloemai/dashboard", "/phloemai/access", "/api/interviews/feedback", "/api/ai/diagnostic-feedback", "/api/stripe/create-checkout-session"]) {
    assert.equal(doesProxyMatch({ config, nextConfig: {}, url }), true, url);
  }
});
