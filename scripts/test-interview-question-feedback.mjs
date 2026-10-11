import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
function load(file, mocks, cache = new Map()) {
  const filename = resolve(root, file);
  if (cache.has(filename)) return cache.get(filename);
  const compiled = { exports: {} }; cache.set(filename, compiled.exports);
  const code = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  new Function("require", "module", "exports", code)(name => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name === "server-only") return {};
    if (name.startsWith("@/")) return load(`${name.slice(2)}.ts`, mocks, cache);
    if (name.startsWith(".")) return load(resolve(dirname(filename), `${name}.ts`), mocks, cache);
    return require(name);
  }, compiled, compiled.exports);
  cache.set(filename, compiled.exports); return compiled.exports;
}
const answer = "I would listen carefully to understand the person's priorities, clarify what happened, and consider a fair practical next step while reflecting on my own responsibilities.";
const question = "iq-01-001-motivation-for-medicine";
const anotherQuestion = "iq-01-002-motivation-for-medicine";

function harness({ premium = false, configured = true, fail = false } = {}) {
  const state = { userId: randomUUID(), premium, configured, fail, rows: [], providerCalls: 0, assessed: [] };
  class Query {
    constructor(table) { this.table = table; this.filters = []; }
    select() { return this; } eq(key, value) { this.filters.push(row => row[key] === value); return this; }
    contains(key, values) { this.filters.push(row => values.every(value => row[key]?.includes(value))); return this; }
    order() { this.sorted = true; return this; } limit(value) { this.max = value; return this; }
    insert(value) { this.inserted = value; return this; } update(value) { this.updated = value; return this; }
    async maybeSingle() {
      if (this.table === "profiles") return { data: { current_plan: state.premium ? "premium" : "free" }, error: null };
      assert.equal(this.table, "interview_attempts");
      if (this.inserted) {
        if (state.rows.some(row => row.user_id === this.inserted.user_id && row.circuit_id === this.inserted.circuit_id && row.station_index === this.inserted.station_index)) return { data: null, error: { code: "23505", message: "duplicate slot" } };
        const row = { id: randomUUID(), ...this.inserted, feedback: null, grading_tries: 0 };
        state.rows.push(row); return { data: structuredClone(row), error: null };
      }
      let rows = state.rows.filter(row => this.filters.every(filter => filter(row)));
      if (this.sorted) rows = rows.toSorted((a, b) => b.started_at.localeCompare(a.started_at));
      if (this.max) rows = rows.slice(0, this.max);
      if (this.updated) rows.forEach(row => Object.assign(row, this.updated));
      return { data: rows[0] ? structuredClone(rows[0]) : null, error: null };
    }
    then(resolve, reject) { return this.maybeSingle().then(resolve, reject); }
  }
  const admin = { from: table => new Query(table), async rpc(name, args) {
    if (name === "consume_interview_ai_usage") return { data: true, error: null };
    assert.equal(name, "claim_interview_grading");
    const row = state.rows.find(row => row.id === args.p_attempt && row.user_id === args.p_user);
    if (row.status === "grading") return { data: null, error: { code: "P0001", message: "Feedback is already being generated. Please wait." } };
    if (row.status !== "completed") Object.assign(row, { status: "grading", grading_token: args.p_token, grading_tries: row.grading_tries + 1 });
    return { data: structuredClone(row), error: null };
  } };
  const mocks = {
    "@/utils/supabase/server": { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: state.userId } } }) } }) },
    "@/utils/supabase/admin": { createAdminClient: () => admin },
    "@/utils/security/human-check": { requireHumanRequest: async () => {} },
    "@/utils/interviews/openai": {
      interviewAiConfigured: () => state.configured,
      assessInterview: async (title, answers, questions) => {
        state.providerCalls++; state.assessed.push({ title, answers, questions });
        if (state.fail) throw new Error("provider unavailable");
        return { score: 70, summary: "Use a specific example.", strengths: ["Clear reasoning"], improvements: ["Reflect on what changed"], rubric: [] };
      },
    },
  };
  mocks["./openai"] = mocks["@/utils/interviews/openai"];
  const cache = new Map();
  return { state, generateSavedFeedback: load("utils/interviews/feedback-service.ts", mocks, cache).generateInterviewFeedback, ...load("utils/interviews/question-feedback-service.ts", mocks, cache), route: load("app/api/interviews/question-feedback/route.ts", mocks, cache) };
}

test("free question-bank feedback reserves one durable account slot and reopens the saved report", async () => {
  const h = harness();
  const first = await h.generateQuestionFeedback(question, answer);
  assert.equal(first.attempt.feedback.score, 70);
  assert.equal(first.freeUsed, true);
  assert.equal(h.state.rows.length, 1);
  assert.equal(h.state.rows[0].circuit_id, h.state.userId);
  assert.equal(h.state.rows[0].mode, "reference", "Question feedback must not consume the Why Medicine trial");
  assert.equal((await h.readQuestionFeedbackAccess(question)).freeUsed, true);
  assert.equal((await h.generateQuestionFeedback(question, answer)).attempt.id, first.attempt.id);
  assert.equal(h.state.providerCalls, 1);
  await assert.rejects(h.generateQuestionFeedback(anotherQuestion, answer), h.QuestionFeedbackUpgradeRequired);
  await assert.rejects(h.generateQuestionFeedback(question, answer + " I would seek advice."), h.QuestionFeedbackUpgradeRequired);
  const newUser = randomUUID(); h.state.userId = newUser;
  assert.equal((await h.readQuestionFeedbackAccess(question)).freeUsed, false);
  await h.generateQuestionFeedback(question, answer);
  assert.equal(h.state.providerCalls, 2);
  assert.equal(h.state.assessed[0].questions[0].id, question, "The provider must receive the server-owned marking ID");
});

test("simultaneous free requests for different answers cannot both generate feedback", async () => {
  const h = harness();
  const results = await Promise.allSettled([h.generateQuestionFeedback(question, answer), h.generateQuestionFeedback(anotherQuestion, answer)]);
  assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
  assert.ok(results.find(result => result.status === "rejected").reason instanceof h.QuestionFeedbackUpgradeRequired);
  assert.equal(h.state.providerCalls, 1); assert.equal(h.state.rows.length, 1);
});

test("a failed provider request can retry the same reserved answer without another allowance", async () => {
  const h = harness({ fail: true });
  await assert.rejects(h.generateQuestionFeedback(question, answer), /could not be generated/);
  assert.equal(h.state.rows[0].last_error, "feedback_unavailable");
  h.state.fail = false;
  await h.generateQuestionFeedback(question, answer);
  assert.equal(h.state.rows.length, 1); assert.equal(h.state.providerCalls, 2);
});

test("Premium generation leaves the lifetime free slot intact through upgrades and downgrades", async () => {
  const h = harness(); await h.generateQuestionFeedback(question, answer);
  h.state.premium = true;
  await h.generateQuestionFeedback(anotherQuestion, answer);
  await h.generateQuestionFeedback(question, answer + " I would seek advice.");
  assert.equal(h.state.providerCalls, 3);
  h.state.premium = false;
  assert.equal((await h.readQuestionFeedbackAccess(question)).freeUsed, true);
  await assert.rejects(h.generateQuestionFeedback(anotherQuestion, answer), h.QuestionFeedbackUpgradeRequired);
});

test("invalid or short answers and unavailable AI do not reserve the free slot", async () => {
  const h = harness({ configured: false });
  await assert.rejects(h.generateQuestionFeedback(question, answer), /currently unavailable/);
  await assert.rejects(h.generateQuestionFeedback(question, "Too short"), /at least 20 words/);
  await assert.rejects(h.generateQuestionFeedback("unknown", answer), /question not found/);
  assert.equal(h.state.rows.length, 0); assert.equal(h.state.providerCalls, 0);
});

test("repeat requests return an explicit upgrade response for the client popup", async () => {
  const h = harness(); await h.generateQuestionFeedback(question, answer);
  const response = await h.route.POST(new Request("https://medicforest.example/api/interviews/question-feedback", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: anotherQuestion, answer }),
  }));
  assert.equal(response.status, 403);
  assert.equal((await response.json()).upgradeRequired, true);
  assert.equal(h.state.providerCalls, 1);
});


test("paid pending question feedback cannot bypass the upgrade gate after a downgrade", async () => {
  const h = harness({ premium: true, fail: true });
  await assert.rejects(h.generateQuestionFeedback(question, answer));
  h.state.premium = false; h.state.fail = false;
  const paid = h.state.rows[0];
  await assert.rejects(h.generateSavedFeedback(paid.id), error => error.status === 403);
  assert.equal(h.state.providerCalls, 1);
  const response = await h.route.GET(new Request(`https://medicforest.example/api/interviews/question-feedback?question=${question}`));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).freeUsed, false);
  // Generating this question as a free user reserves their one free report.
  await h.generateQuestionFeedback(question, answer);
  assert.equal(h.state.rows.length, 2);
  assert.equal(h.state.rows.find(row => row.circuit_id === h.state.userId).metrics.freeQuestionBankFeedback, 1);
  assert.equal(paid.status, "failed");
});


async function feedbackPanel({ used = false, denied = false } = {}) {
  const state = { requests: [], prompts: [] };
  const cells = []; let cursor = 0; let effects = []; let tree;
  const memo = (factory, dependencies) => {
    const index = cursor++; const old = cells[index];
    if (!old || dependencies.some((item, i) => !Object.is(item, old.dependencies[i]))) cells[index] = { value: factory(), dependencies };
    return cells[index].value;
  };
  const react = {
    useState(initial) {
      const index = cursor++; if (!(index in cells)) cells[index] = initial;
      return [cells[index], value => { cells[index] = typeof value === "function" ? value(cells[index]) : value; }];
    },
    useRef: current => memo(() => ({ current }), []),
    useEffect: (callback, dependencies) => memo(() => { effects.push(callback); }, dependencies),
  };
  const source = readFileSync(resolve(root, "app/medicforest/interview/_components/QuestionFeedbackPanel.tsx"), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const compiled = { exports: {} };
  new Function("require", "module", "exports", "fetch", "window", code)(name => {
    if (name === "react") return react;
    if (name === "react/jsx-runtime") return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
    if (name === "@/utils/medicforest/feature-access") return { requestFeatureAccess: (...args) => state.prompts.push(args) };
    if (name === "../_lib/question-feedback") return { FREE_QUESTION_FEEDBACK_USED: "You've used your free AI feedback report. Upgrade to Premium for more personalised feedback." };
    if (name === "../_lib/speech-delivery") return { stripSpeechPauseMarkers: value => value };
    if (name === "../_lib/question-bank-storage") return { getWordCount: value => value.trim().split(/\s+/).length };
    return {};
  }, compiled, compiled.exports, async (path, options) => {
    state.requests.push({ path, method: options?.method ?? "GET" });
    if (options?.method !== "POST") return Response.json({ isPremium: false, freeUsed: used, attempt: null });
    if (denied) return Response.json({ upgradeRequired: true }, { status: 403 });
    return Response.json({ isPremium: false, freeUsed: true, attempt: { status: "completed", answers: [{ answer }], feedback: { score: 70, summary: "Useful reasoning", strengths: ["Clear"], improvements: ["Be specific"] } } });
  }, { addEventListener() {}, removeEventListener() {} });
  const render = () => {
    cursor = 0; effects = [];
    tree = compiled.exports.QuestionFeedbackPanel({ questionId: question, answer });
    effects.forEach(effect => effect());
  };
  const flush = async () => { for (let index = 0; index < 3; index++) { await new Promise(resolve => setImmediate(resolve)); render(); } };
  const nodes = (node, predicate) => {
    if (Array.isArray(node)) return node.flatMap(item => nodes(item, predicate));
    if (!node || typeof node !== "object") return [];
    return [...(predicate(node) ? [node] : []), ...nodes(node.props?.children, predicate)];
  };
  const text = node => Array.isArray(node) ? node.map(text).join(" ") : node && typeof node === "object" ? text(node.props?.children) : typeof node === "string" ? node : "";
  render(); await flush();
  return { state, flush, buttons: () => nodes(tree, node => node.type === "button"), text: () => text(tree) };
}

test("an exhausted account can click Generate AI feedback and receives the Premium popup", async () => {
  const page = await feedbackPanel({ used: true });
  assert.equal(page.buttons()[0].props.disabled, false);
  page.buttons()[0].props.onClick(); await page.flush();
  assert.deepEqual(page.state.prompts[0], ["premium", "More personalised AI feedback", true]);
  assert.equal(page.state.requests.filter(request => request.method === "POST").length, 0);
  assert.match(page.text(), /used your free AI feedback report/);
});

test("the first report immediately shows upgrade wording and can be viewed without generating again", async () => {
  const page = await feedbackPanel();
  page.buttons()[0].props.onClick(); await page.flush();
  assert.match(page.text(), /used your free AI feedback report/);
  assert.match(page.text(), /View AI feedback/);
  page.buttons()[0].props.onClick(); await page.flush();
  assert.equal(page.state.requests.filter(request => request.method === "POST").length, 1);
  page.buttons()[1].props.onClick();
  assert.equal(page.state.prompts[0][0], "premium");
});

test("a server-side exhaustion response opens the popup even when the browser allowance is stale", async () => {
  const page = await feedbackPanel({ denied: true });
  page.buttons()[0].props.onClick(); await page.flush();
  assert.equal(page.state.prompts[0][0], "premium");
  assert.match(page.text(), /used your free AI feedback report/);
});
