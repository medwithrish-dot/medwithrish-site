import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID, webcrypto } from "node:crypto";
import { AsyncLocalStorage } from "node:async_hooks";
import { test, before, after } from "node:test";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const { PGlite } = require("@electric-sql/pglite");
globalThis.AsyncLocalStorage ??= AsyncLocalStorage;
globalThis.crypto ??= webcrypto;
const db = new PGlite();
const sql = readFileSync(resolve(root, "supabase/medicforest_public_api_security.sql"), "utf8");
const env = { ...process.env };
before(async () => {
  await db.exec("create role anon; create role authenticated; create role service_role bypassrls;");
  await db.exec(sql);
  await db.exec(sql); // Rerunning must preserve stored quotas and receipts.
  process.env.VERCEL = "1";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only-fingerprint-key";
  process.env.RESEND_API_KEY = "test-only-resend";
  process.env.STRIPE_SECRET_KEY = "sk_test_only";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_only";
  process.env.STRIPE_PRICE_TUTORING_UCAT_RISH = "price_ucat_rish";
});
after(async () => {
  for (const key of Object.keys(process.env)) if (!(key in env)) delete process.env[key];
  Object.assign(process.env, env);
  await db.close();
});

function load(file, mocks = {}, cache = new Map()) {
  const path = resolve(root, file);
  if (cache.has(path)) return cache.get(path);
  const compiled = { exports: {} };
  cache.set(path, compiled.exports);
  const javascript = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const localRequire = name => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name === "server-only") return {};
    if (name.startsWith("@/")) return load(`${name.slice(2)}.ts`, mocks, cache);
    if (name.startsWith(".")) return load(`${resolve(dirname(path), name)}.ts`, mocks, cache);
    return require(name);
  };
  new Function("require", "module", "exports", javascript)(localRequire, compiled, compiled.exports);
  return compiled.exports;
}

const admin = {
  rpc(name, args) {
    let query;
    if (name === "consume_public_api_quota") query = db.query("select public.consume_public_api_quota($1,$2) as result", [args.p_scope, args.p_key]);
    else if (name === "claim_stripe_webhook") query = db.query("select public.claim_stripe_webhook($1,$2) as result", [args.p_event, args.p_token]);
    else if (name === "finish_stripe_webhook") query = db.query("select public.finish_stripe_webhook($1,$2,$3) as result", [args.p_event, args.p_token, args.p_success]);
    else throw new Error(`Unexpected RPC ${name}`);
    return { abortSignal: () => query.then(value => ({ data: value.rows[0].result, error: null })) };
  },
};
const dbMocks = { "@/utils/supabase/admin": { createAdminClient: () => admin } };
const request = (path, body, ip = "203.0.113.10", id = randomUUID()) => new Request(`https://example.test${path}`, {
  method: "POST", headers: { "content-type": "application/json", "x-vercel-forwarded-for": ip, "idempotency-key": id }, body: JSON.stringify(body),
});

test("feedback quota is durable across route instances, isolates IPs, and expires", async () => {
  let sends = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { sends++; return Response.json({ id: "email_test" }); };
  try {
    const path = "/api/feedback";
    for (let i = 0; i < 3; i++) {
      const { POST } = load("app/api/feedback/route.ts", dbMocks);
      assert.equal((await POST(request(path, { message: "Hello" }))).status, 200);
    }
    const { POST } = load("app/api/feedback/route.ts", dbMocks);
    const limited = await POST(request(path, { message: "Hello" }));
    assert.equal(limited.status, 429);
    assert.ok(Number(limited.headers.get("retry-after")) > 3500);
    assert.equal(sends, 3);
    assert.equal((await POST(request(path, { message: "Hello" }, "203.0.113.11"))).status, 200);
    await db.exec("update public.public_api_quotas set resets_at = now() - interval '1 second' where scope = 'feedback'");
    assert.equal((await POST(request(path, { message: "Hello" }))).status, 200);
  } finally { globalThis.fetch = originalFetch; }
});

test("validation and honeypots do not spend feedback quota or call Resend", async () => {
  const { POST } = load("app/api/feedback/route.ts", dbMocks);
  const count = async () => (await db.query("select sum(used)::int as n from public.public_api_quotas")).rows[0].n;
  const prior = await count();
  assert.equal((await POST(request("/api/feedback", { message: "" }))).status, 400);
  assert.equal((await POST(request("/api/feedback", { website: "bot", message: "Hi" }))).status, 200);
  assert.equal(await count(), prior);
});

test("checkout stays available to guests, validates destinations, deduplicates retries, and limits abuse", async () => {
  let creates = 0;
  const sessions = new Map();
  const keys = [];
  class Stripe {
    constructor(_key, options) { assert.equal(options.maxNetworkRetries, 0); assert.equal(options.timeout, 10000); }
    checkout = { sessions: { create: async (params, options) => {
      keys.push(options.idempotencyKey);
      assert.equal(params.line_items[0].price, "price_ucat_rish");
      assert.equal(params.customer_creation, "always");
      if (!sessions.has(options.idempotencyKey)) sessions.set(options.idempotencyKey, { url: `https://checkout.stripe.com/${++creates}` });
      return sessions.get(options.idempotencyKey);
    } } };
  }
  const mocks = { ...dbMocks, stripe: Stripe, "@/utils/site-url": { getRequiredSiteUrl: () => "https://example.test" } };
  const { POST } = load("app/api/stripe/create-tutoring-checkout/route.ts", mocks);
  const body = { packageId: "ucat-rish", email: "guest@example.test", returnTo: "tutoring" };
  const send = (value = body, id = randomUUID()) => POST(request("/api/stripe/create-tutoring-checkout", value, "203.0.113.20", id));
  assert.equal((await send({ ...body, packageId: "__proto__" })).status, 400);
  assert.equal((await send({ ...body, returnTo: "https://attacker.test" })).status, 400);
  assert.equal((await send(body, "invalid-key")).status, 400);
  const id = randomUUID();
  const first = await send(body, id);
  const second = await send(body, id);
  assert.deepEqual(await first.json(), await second.json());
  assert.equal(creates, 1);
  assert.equal(keys[0], keys[1]);
  for (let i = 0; i < 18; i++) assert.equal((await send()).status, 200);
  const limited = await send();
  assert.equal(limited.status, 429);
  assert.ok(Number(limited.headers.get("retry-after")) > 0);
  assert.equal(creates, 19);
});

test("quota storage failures fail closed and production headers cannot be spoofed", async () => {
  const { enforcePublicRateLimit, trustedClientIp } = load("utils/security/durable-rate-limit.ts", {
    "@/utils/supabase/admin": { createAdminClient: () => ({ rpc: () => ({ abortSignal: async () => ({ error: { message: "private database detail", status: 503 } }) }) }) },
  });
  assert.equal((await enforcePublicRateLimit(request("/api/feedback", {}), "feedback")).status, 503);
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  try {
    assert.equal(trustedClientIp(new Request("https://example.test", { headers: { "x-forwarded-for": "203.0.113.1" } })), null);
    assert.equal((await enforcePublicRateLimit(new Request("https://example.test"), "feedback")).status, 503);
    assert.equal(trustedClientIp(new Request("https://example.test", { headers: { "x-vercel-forwarded-for": "2001:0db8::1" } })), "[2001:db8::1]");
  } finally { if (prev === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = prev; }
});

test("browser checkout reuses the key after an uncertain failure and allows a later purchase", async () => {
  const storage = new Map();
  const priorStorage = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: {
    getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key),
  } });
  const originalFetch = globalThis.fetch;
  const ids = [];
  globalThis.fetch = async (_url, init) => {
    ids.push(init.headers.get("idempotency-key"));
    if (ids.length === 1) throw new Error("Lost response");
    return Response.json({ configured: true, url: "https://checkout.stripe.com/test" });
  };
  try {
    const args = ["/api/stripe/create-tutoring-checkout", { method: "POST", body: JSON.stringify({ email: "guest@example.test" }) }];
    await assert.rejects(load("utils/billing/tutoring-checkout-fetch.ts").tutoringCheckoutFetch(...args));
    await load("utils/billing/tutoring-checkout-fetch.ts").tutoringCheckoutFetch(...args); // Reloaded module uses session storage.
    await load("utils/billing/tutoring-checkout-fetch.ts").tutoringCheckoutFetch(...args);
    assert.equal(ids[0], ids[1]);
    assert.notEqual(ids[1], ids[2]);
  } finally {
    globalThis.fetch = originalFetch;
    if (priorStorage) Object.defineProperty(globalThis, "sessionStorage", priorStorage); else delete globalThis.sessionStorage;
  }
});

test("simultaneous browser submissions share one checkout request", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls++; return Response.json({ configured: true, url: "https://checkout.stripe.com/test" }); };
  try {
    const { tutoringCheckoutFetch } = load("utils/billing/tutoring-checkout-fetch.ts");
    const results = await Promise.all(Array.from({ length: 10 }, () => tutoringCheckoutFetch("/api/stripe/create-tutoring-checkout", { method: "POST", body: "{}" })));
    assert.equal(calls, 1);
    for (const response of results) assert.equal((await response.json()).configured, true);
  } finally { globalThis.fetch = originalFetch; }
});

test("quota bursts admit only the configured number and migration reruns retain usage", async () => {
  const args = { p_scope: "feedback", p_key: "b".repeat(64) };
  const outcomes = await Promise.all(Array.from({ length: 15 }, () => admin.rpc("consume_public_api_quota", args).abortSignal()));
  assert.equal(outcomes.filter(result => result.data.allowed).length, 3);
  await db.exec(sql);
  assert.equal((await admin.rpc("consume_public_api_quota", args).abortSignal()).data.allowed, false);
});

test("real Stripe signatures are checked before durable webhook deduplication", async () => {
  const Stripe = require("stripe");
  const stripe = new Stripe("sk_test_only");
  let work = 0;
  const event = { id: "evt_signature_test", type: "customer.subscription.updated", data: { object: { id: "sub_test" } } };
  const payload = JSON.stringify(event);
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: "whsec_test_only" });
  const { POST } = load("app/api/stripe/webhook/route.ts", { ...dbMocks,
    "@/utils/billing/stripe-client": { createStripeClient: () => stripe },
    "@/utils/billing/webhooks/dispatch-stripe-event": { dispatchStripeWebhookEvent: async () => { work++; } },
  });
  const send = sig => POST(new Request("https://example.test/api/stripe/webhook", { method: "POST", headers: { "stripe-signature": sig }, body: payload }));
  assert.equal((await send("invalid")).status, 400);
  assert.equal(work, 0);
  assert.equal((await send(signature)).status, 200);
  assert.equal((await send(signature)).status, 200);
  assert.equal(work, 1);
});

test("concurrent webhooks cannot both run; failed processing stays retryable", async () => {
  const { processStripeEventOnce } = load("utils/billing/webhooks/webhook-receipts.ts", dbMocks);
  let release;
  let started;
  const ready = new Promise(resolve => { started = resolve; });
  const gate = new Promise(resolve => { release = resolve; });
  const first = processStripeEventOnce("evt_concurrent", async () => { started(); await gate; });
  await ready;
  await assert.rejects(processStripeEventOnce("evt_concurrent", () => assert.fail("duplicate work")));
  release();
  await first;
  assert.equal((await processStripeEventOnce("evt_concurrent", () => assert.fail("completed duplicate"))).duplicate, true);
  await assert.rejects(processStripeEventOnce("evt_retry", async () => { throw new Error("provider down"); }));
  let retried = 0;
  await processStripeEventOnce("evt_retry", async () => { retried++; });
  assert.equal(retried, 1);
});

test("crashed claims recover after expiry and stale workers cannot finish a new claim", async () => {
  const token = randomUUID();
  assert.equal((await admin.rpc("claim_stripe_webhook", { p_event: "evt_crash", p_token: token }).abortSignal()).data, "claimed");
  await db.exec("update public.stripe_webhook_receipts set lease_until = now() - interval '1 second' where event_id = 'evt_crash'");
  const nextToken = randomUUID();
  assert.equal((await admin.rpc("claim_stripe_webhook", { p_event: "evt_crash", p_token: nextToken }).abortSignal()).data, "claimed");
  assert.equal((await admin.rpc("finish_stripe_webhook", { p_event: "evt_crash", p_token: token, p_success: true }).abortSignal()).data, false);
  assert.equal((await admin.rpc("finish_stripe_webhook", { p_event: "evt_crash", p_token: nextToken, p_success: true }).abortSignal()).data, true);
});

test("anonymous/authenticated database roles cannot consume quotas, forge receipts or read fingerprints", async () => {
  for (const role of ["anon", "authenticated"]) {
    await db.exec(`set role ${role}`);
    try {
      await assert.rejects(db.query("select public.consume_public_api_quota('feedback',$1)", ["a".repeat(64)]), /permission denied/);
      await assert.rejects(db.query("select public.claim_stripe_webhook('evt_forged',$1)", [randomUUID()]), /permission denied/);
      await assert.rejects(db.query("select * from public.public_api_quotas"), /permission denied/);
      await assert.rejects(db.query("select * from public.stripe_webhook_receipts"), /permission denied/);
    } finally { await db.exec("reset role"); }
  }
});

test("provider 429/5xx responses stay generic; Resend and Stripe operations are never retried automatically", async () => {
  const { POST } = load("app/api/feedback/route.ts", dbMocks);
  const originalFetch = globalThis.fetch;
  try {
    for (const [index, status] of [429, 500, 503].entries()) {
      let calls = 0;
      globalThis.fetch = async () => { calls++; return new Response("private provider details", { status }); };
      const response = await POST(request("/api/feedback", { message: "Hi" }, `203.0.113.${50 + index}`));
      assert.equal(response.status, 503);
      assert.equal(response.headers.get("retry-after"), "30");
      assert.doesNotMatch(await response.text(), /private provider details/);
      assert.equal(calls, 1);
    }
    for (const status of [429, 500, 503]) {
      let calls = 0;
      class Stripe { checkout = { sessions: { create: async () => { calls++; throw { statusCode: status, message: "private stripe detail" }; } } }; }
      const route = load("app/api/stripe/create-tutoring-checkout/route.ts", { ...dbMocks, stripe: Stripe,
        "@/utils/site-url": { getRequiredSiteUrl: () => "https://example.test" } });
      const response = await route.POST(request("/api/stripe/create-tutoring-checkout", { packageId: "ucat-rish", email: "guest@example.test" }, "203.0.113.80"));
      assert.equal(response.status, 503);
      assert.doesNotMatch(await response.text(), /private stripe detail/);
      assert.equal(calls, 1);
    }
  } finally { globalThis.fetch = originalFetch; }
});

test("Supabase deadlines preserve caller cancellation and log only safe metadata", async () => {
  const originalFetch = globalThis.fetch;
  const originalLog = console.error;
  const logs = [];
  console.error = (...args) => logs.push(args);
  let signal;
  globalThis.fetch = async (_input, init) => { signal = init.signal; return new Response("secret database text", { status: 503 }); };
  try {
    const { serverSupabaseFetch } = load("utils/supabase/server-fetch.ts");
    const abort = new AbortController();
    await serverSupabaseFetch("https://database.test", { signal: abort.signal });
    assert.notEqual(signal, abort.signal);
    abort.abort();
    assert.equal(signal.aborted, true);
    assert.deepEqual(logs, [["provider_request_failed", { provider: "supabase", operation: "request", status: 503 }]]);
  } finally { globalThis.fetch = originalFetch; console.error = originalLog; }
});

test("authentication outages return temporary errors rather than telling signed-in users to log in again", async () => {
  for (const status of [429, 500, 503]) {
    const auth = { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: null }, error: { status, message: "private auth error" } }) } }) };
    for (const file of ["create-checkout-session", "create-portal-session", "sync-checkout-session"]) {
      const { POST } = load(`app/api/stripe/${file}/route.ts`, { "@/utils/supabase/server": auth });
      const response = await POST(request(`/api/stripe/${file}`, {}));
      assert.equal(response.status, 503);
      assert.doesNotMatch(await response.text(), /private auth error/);
    }
    const { interviewContext } = load("utils/interviews/server.ts", { "@/utils/supabase/server": auth });
    await assert.rejects(interviewContext(), error => error.status === 503);
    const { POST } = load("app/api/ai/diagnostic-feedback/route.ts", { "@/utils/supabase/server": auth });
    assert.equal((await POST(request("/api/ai/diagnostic-feedback", { attemptId: "attempt-test" }))).status, 503);
  }
});

test("webhook receipt storage outages never acknowledge events or run unprotected work", async () => {
  let work = 0;
  const { POST } = load("app/api/stripe/webhook/route.ts", {
    "@/utils/supabase/admin": { createAdminClient: () => ({ rpc: () => ({ abortSignal: async () => ({ error: { status: 503 } }) }) }) },
    "@/utils/billing/stripe-client": { createStripeClient: () => ({ webhooks: { constructEvent: () => ({ id: "evt_storage_down" }) } }) },
    "@/utils/billing/webhooks/dispatch-stripe-event": { dispatchStripeWebhookEvent: async () => { work++; } },
  });
  const response = await POST(new Request("https://example.test/api/stripe/webhook", { method: "POST", headers: { "stripe-signature": "verified-by-test-adapter" }, body: "{}" }));
  assert.equal(response.status, 503);
  assert.equal(work, 0);
});

test("OpenAI throttles and outages produce safe errors with one provider call", async () => {
  const priorKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "test-only-openai";
  try {
    for (const status of [429, 500, 503]) {
      let calls = 0;
      const failures = [];
      class APIError extends Error { constructor() { super("private AI details"); this.status = status; this.headers = new Headers({ "retry-after": "30" }); } }
      class OpenAI {
        static APIError = APIError;
        static APIConnectionTimeoutError = class extends Error {};
        constructor(options) { assert.equal(options.maxRetries, 0); assert.ok(options.timeout > 0); }
        responses = { create: async () => { calls++; throw new APIError(); } };
      }
      const { generateInterviewFollowUp } = load("utils/interviews/openai.ts", {
        openai: OpenAI,
        "./provider-capacity": { withInterviewProviderCapacity: work => work(), recordInterviewProviderFailure: async (...args) => failures.push(args) },
      });
      await assert.rejects(generateInterviewFollowUp({ title: "Practice", theme: "Care", question: "Why?", answer: "Because", previousAnswers: [], existingQuestions: [] }), error => {
        assert.doesNotMatch(error.message, /private AI details/);
        assert.match(error.message, /saved/);
        return true;
      });
      assert.equal(calls, 1);
      assert.deepEqual(failures, [[status, "30"]]);
    }
  } finally { if (priorKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = priorKey; }
});

test("Anthropic throttles and outages return safe failures and refund reserved credits", async () => {
  const priorKey = process.env.ANTHROPIC_API_KEY;
  process.env.ANTHROPIC_API_KEY = "test-only-anthropic";
  try {
    for (const status of [429, 500, 503]) {
      const profile = { current_plan: "free", diagnostic_credits: 1, ai_diagnostic_last_used_at: null };
      const attempt = { id: "attempt-1", user_id: "user-1", accuracy: 60, metadata: { summary: { section: "qr", accuracy: 60 } } };
      let calls = 0;
      const query = table => {
        let update;
        const execute = () => {
          if (table === "diagnostic_attempts") return { data: [attempt], error: null };
          if (update) Object.assign(profile, update);
          return { data: { ...profile }, error: null };
        };
        return {
          select() { return this; }, eq() { return this; }, is() { return this; }, in() { return this; },
          update(value) { update = value; return this; }, maybeSingle: async () => execute(),
          then(resolve) { return Promise.resolve(execute()).then(resolve); },
        };
      };
      class Anthropic {
        constructor(options) { assert.equal(options.maxRetries, 0); assert.equal(options.timeout, 25000); }
        messages = { create: async () => { calls++; throw { status, message: "private AI diagnostic details" }; } };
      }
      const { POST } = load("app/api/ai/diagnostic-feedback/route.ts", {
        "@/utils/supabase/server": { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: "user-1" } } }) } }) },
        "@/utils/supabase/admin": { createAdminClient: () => ({ from: query }) },
        "@anthropic-ai/sdk": Anthropic,
      });
      const response = await POST(request("/api/ai/diagnostic-feedback", { attemptId: "attempt-1" }));
      assert.equal(response.status, 503);
      assert.doesNotMatch(await response.text(), /private AI diagnostic details/);
      assert.equal(calls, 1);
      assert.equal(profile.diagnostic_credits, 1);
      assert.equal(profile.ai_diagnostic_last_used_at, null);
    }
  } finally { if (priorKey === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = priorKey; }
});
