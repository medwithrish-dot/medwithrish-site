import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import { featureAccessDecision, safeInterviewReturnPath, requestFeatureAccess, FEATURE_ACCESS_EVENT } from "../utils/medicforest/feature-access.ts";
import { createApiRateLimiter, guardApiRequest } from "../utils/security/api-guard.ts";

const require = createRequire(import.meta.url);
const compiled = { exports: {} };
const source = ts.transpileModule(readFileSync(new URL("../utils/security/request-body.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
new Function("require", "module", "exports", source)(require, compiled, compiled.exports);
const { readLimitedText, RequestBodyError } = compiled.exports;

test("guests browse freely but feature actions distinguish signup, trial and Premium", () => {
  for (const [user, premium, tier, used, result] of [
    [null, false, "free", false, "signup"], [null, false, "trial", false, "signup"],
    [null, false, "premium", false, "premium"], ["member", false, "free", true, "allowed"],
    ["member", false, "trial", false, "allowed"], ["member", false, "trial", true, "premium"],
    ["member", false, "premium", false, "premium"], ["member", true, "trial", true, "allowed"],
    ["member", true, "premium", true, "allowed"],
  ]) assert.equal(featureAccessDecision(user, premium, tier, used), result);
});

test("a denied click cancels the feature action without navigating or opening on arrival", () => {
  const target = new EventTarget();
  const previous = globalThis.window;
  globalThis.window = target;
  let prompts = 0;
  target.addEventListener(FEATURE_ACCESS_EVENT, event => {
    if (featureAccessDecision(null, false, event.detail.tier) !== "allowed") { prompts++; event.preventDefault(); }
  });
  try {
    assert.equal(prompts, 0);
    assert.equal(requestFeatureAccess("free", "Question practice"), false);
    assert.equal(prompts, 1);
  } finally { globalThis.window = previous; }
});

test("login return paths cannot redirect to another host or escape the interview area", () => {
  for (const path of ["https://attacker.test", "//attacker.test", "/interviews\\attacker", "/interviews/../../account", "/medicforest/interview/%2e%2e/account", [], "/api/interviews/session"]) {
    assert.equal(safeInterviewReturnPath(path), null);
  }
  assert.equal(safeInterviewReturnPath("/interviews/question-bank?question=q1"), "/interviews/question-bank?question=q1");
  assert.equal(safeInterviewReturnPath("/medicforest/interview/ai-interviews?station=why-medicine"), "/medicforest/interview/ai-interviews?station=why-medicine");
});

test("API guard rejects cross-site mutations and oversized input but accepts signed webhook transport", () => {
  const request = (path, headers = {}, method = "POST") => new Request(`https://medicforest.com${path}`, { method, headers });
  assert.equal(guardApiRequest(request("/api/interviews/session", { origin: "https://attacker.test" })).status, 403);
  assert.equal(guardApiRequest(request("/api/stripe/create-tutoring-checkout", { "sec-fetch-site": "cross-site" })).status, 403);
  assert.equal(guardApiRequest(request("/api/feedback", { "content-length": "50000" })).status, 413);
  assert.equal(guardApiRequest(request("/api/stripe/webhook", { "content-length": "256001" })).status, 413);
  assert.equal(guardApiRequest(request("/api/stripe/webhook", { origin: "https://stripe.com" })), null);
  assert.equal(guardApiRequest(request("/api/ai/diagnostic-feedback")).status, 503);
  assert.equal(guardApiRequest(request("/medicforest/interview/dashboard", {}, "GET")), null);
});

test("rate limits expire, isolate identities and cannot be reset by filling the map", () => {
  let now = 0;
  const allow = createApiRateLimiter(() => now, 2);
  assert.equal(allow("a", 2), true); assert.equal(allow("a", 2), true); assert.equal(allow("a", 2), false);
  assert.equal(allow("b", 2), true); assert.equal(allow("c", 2), false); assert.equal(allow("a", 2), false);
  now = 60_000;
  assert.equal(allow("c", 2), true); assert.equal(allow("a", 2), true);
});

test("streamed requests are capped even when Content-Length is missing or dishonest", async () => {
  const stream = () => new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode("12345")); controller.enqueue(new TextEncoder().encode("67890")); controller.close(); } });
  for (const headers of [{}, { "content-length": "1" }]) {
    const request = new Request("https://example.test/api", { method: "POST", body: stream(), duplex: "half", headers });
    await assert.rejects(readLimitedText(request, 8), error => error instanceof RequestBodyError && error.status === 413);
  }
  assert.equal(await readLimitedText(new Request("https://example.test/api", { method: "POST", body: "hello" }), 8), "hello");
});
