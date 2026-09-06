import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const text = readFileSync(new URL("../app/phloemai/_components/PhloemAIClient.tsx", import.meta.url), "utf8");
const source = ts.createSourceFile("client.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let accountEffect;
function visit(node) {
  if (ts.isCallExpression(node) && node.expression.getText(source) === "useEffect" &&
    node.arguments[1]?.getText(source) === "[initialReportId, supabase, view]") {
    accountEffect = node.arguments[0].getText(source);
  }
  ts.forEachChild(node, visit);
}
visit(source);
assert.ok(accountEffect, "the account-loading effect must exist");
const compiled = ts.transpileModule(`const effect = ${accountEffect};`, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText;
const flush = () => new Promise(resolve => setImmediate(resolve));

function accountHarness() {
  const requests = [];
  const state = {};
  let authListener;
  const context = {
    initialReportId: null, view: "dashboard",
    window: { location: { search: "" } },
    createEmptyPracticeStats: () => ({}),
    buildPracticeStats: rows => rows,
    normaliseRecentPracticeSet: row => row,
    normaliseDashboardDiagnostic: row => row,
    supabase: {
      auth: {
        getSession: async () => ({ data: { session: { user: { id: "first-user" } } } }),
        onAuthStateChange(callback) { authListener = callback; return { data: { subscription: { unsubscribe() {} } } }; },
      },
      from(table) {
        const request = { table };
        const result = new Promise(resolve => { request.resolve = resolve; });
        requests.push(request);
        const query = {
          select() { return this; }, eq(key, value) { if (key === "user_id" || key === "id") request.userId = value; return this; },
          order() { return this; }, limit() { return result; }, maybeSingle() { return result; },
        };
        return query;
      },
    },
  };
  for (const key of ["Profile", "PracticeStats", "RecentPracticeSets", "LatestDiagnostic", "DiagnosticHistory", "CheckoutError", "AuthError", "AuthMessage", "Session", "User", "Loading"]) {
    context[`set${key}`] = value => { state[key] = value; };
  }
  const effect = new Function(...Object.keys(context), `${compiled}\nreturn effect;`)(...Object.values(context));
  const cleanup = effect();
  return {
    requests, state, cleanup,
    emit(event, userId) { authListener(event, userId ? { user: { id: userId } } : null); },
    resolveUser(userId) {
      requests.filter(request => request.userId === userId).forEach(request => {
        request.resolve({ data: request.table === "profiles" ? { id: userId } : [], error: null });
      });
    },
  };
}

test("account queries start together and initial/token auth events do not duplicate reads", async () => {
  const harness = accountHarness();
  harness.emit("INITIAL_SESSION", "first-user");
  await flush();
  assert.equal(harness.requests.length, 4);
  harness.emit("SIGNED_IN", "first-user");
  harness.emit("TOKEN_REFRESHED", "first-user");
  assert.equal(harness.requests.length, 4);
  harness.resolveUser("first-user");
  await flush();
  assert.deepEqual(harness.state.Profile, { id: "first-user" });
  assert.equal(harness.state.Loading, false);
  harness.cleanup();
});

test("late account queries cannot restore a profile after logout", async () => {
  const harness = accountHarness();
  await flush();
  harness.emit("SIGNED_OUT", null);
  harness.resolveUser("first-user");
  await flush();
  assert.equal(harness.state.Profile, null);
  assert.equal(harness.state.User, null);
  assert.equal(harness.state.Loading, false);
  harness.cleanup();
});

test("switching accounts ignores the previous account's later response", async () => {
  const harness = accountHarness();
  await flush();
  harness.emit("SIGNED_IN", "second-user");
  harness.resolveUser("second-user");
  await flush();
  harness.resolveUser("first-user");
  await flush();
  assert.deepEqual(harness.state.Profile, { id: "second-user" });
  assert.equal(harness.state.User.id, "second-user");
  harness.cleanup();
});
