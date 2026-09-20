import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../app/phloemai/interview/_components/SavedInterviewReview.tsx", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const question = "Why medicine?";
const words = "Listening to residents at a care home taught me to understand each person's concerns and how healthcare teams work together to support their needs.";

function find(node, predicate) {
  if (Array.isArray(node)) return node.map(item => find(item, predicate)).find(Boolean);
  if (!node || typeof node !== "object") return undefined;
  return predicate(node) ? node : find(node.props?.children, predicate);
}

async function savedReview({ overrides = {}, serverNow = new Date().toISOString(), onRequest } = {}) {
  const state = { attempt: {
    id: randomUUID(), circuitId: randomUUID(), mode: "university", universitySlug: "aberdeen", stationSlug: "why-medicine", title: question,
    status: "submitted", startedAt: new Date(Date.now() - 600_000).toISOString(), completedAt: new Date().toISOString(), answerSubmittedAt: new Date().toISOString(),
    preparationSeconds: 60, stationSeconds: 480, breakSeconds: 120, stationIndex: 1, stationCount: 3,
    questions: [question], answers: [{ question, answer: words }], feedback: null, metrics: { wordCount: 26 }, nextAvailableAt: null, ...overrides,
  }, requests: [], routes: [], intervals: [] };
  const initial = structuredClone(state.attempt);
  const cells = [];
  let cursor = 0;
  let effects = [];
  let tree;
  const memo = (factory, dependencies) => {
    const index = cursor++;
    const old = cells[index];
    if (!old || dependencies.some((item, i) => !Object.is(item, old.dependencies[i]))) cells[index] = { value: factory(), dependencies };
    return cells[index].value;
  };
  const react = {
    useState(value) {
      const index = cursor++;
      if (!(index in cells)) cells[index] = typeof value === "function" ? value() : value;
      return [cells[index], value => { cells[index] = typeof value === "function" ? value(cells[index]) : value; }];
    },
    useRef: current => memo(() => ({ current }), []),
    useCallback: (callback, dependencies) => memo(() => callback, dependencies),
    useEffect: (callback, dependencies) => memo(() => { effects.push(callback); }, dependencies),
  };
  const router = { push: route => state.routes.push(route) };
  const loaded = { exports: {} };
  runInNewContext(compiled, {
    module: loaded, exports: loaded.exports, AbortController, Date, crypto: { randomUUID },
    require(name) {
      if (name === "react") return react;
      if (name === "next/navigation") return { useRouter: () => router };
      if (name === "next/link") return { default: "link" };
      if (name === "./AIInterviewReview") return { AIInterviewReview: "review" };
      if (name === "react/jsx-runtime") return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
      return {};
    },
    window: { setTimeout: () => 1, clearTimeout() {}, setInterval: callback => { state.intervals.push(callback); return 1; }, clearInterval() {} },
    async fetch(path, options) {
      const request = { path, method: options.method, body: options.body ? JSON.parse(options.body) : undefined };
      state.requests.push(request);
      const custom = await onRequest?.(request, state);
      if (custom) return custom;
      if (request.path.includes("feedback")) state.attempt = { ...state.attempt, status: "completed", feedback: { score: 80, summary: "Useful reflection", strengths: [], improvements: [], rubric: [] } };
      if (request.method === "PATCH") state.attempt = { ...state.attempt, status: "submitted", completedAt: new Date().toISOString(), answerSubmittedAt: new Date().toISOString() };
      if (request.method === "POST" && request.path.endsWith("session")) return Response.json({ attempt: { ...state.attempt, id: "new-attempt", circuitId: request.body.circuitId, status: "in_progress" } });
      return Response.json({ attempt: state.attempt, configured: true, serverNow });
    },
  });
  const render = () => {
    cursor = 0; effects = [];
    tree = loaded.exports.SavedInterviewReview({ initialAttempt: initial, configured: true, serverNow });
    effects.forEach(effect => effect());
  };
  const flush = async () => { for (let index = 0; index < 4; index += 1) { await new Promise(resolve => setImmediate(resolve)); render(); } };
  render();
  await flush();
  return { state, flush, render, review: () => find(tree, node => node.type === "review")?.props, tree: () => tree };
}

test("opening a saved review never grades automatically and repeated feedback clicks produce one request", async () => {
  const page = await savedReview();
  assert.equal(page.state.requests.length, 0);
  page.review().onGenerate();
  page.review().onGenerate();
  await page.flush();
  assert.equal(page.state.requests.filter(item => item.path.includes("feedback")).length, 1);
  assert.equal(page.review().attempt.feedback.score, 80);
});

test("failed feedback reconciles once while retaining the transcript", async () => {
  const page = await savedReview({ onRequest: request => request.path.includes("feedback") ? Response.json({ error: "AI unavailable" }, { status: 503 }) : undefined });
  page.review().onGenerate();
  await page.flush();
  assert.deepEqual(page.state.requests.map(item => item.method), ["POST", "GET"]);
  assert.equal(page.review().attempt.answers[0].answer, words);
  assert.equal(page.review().attempt.feedback, null);
  assert.ok(find(page.tree(), node => node.props?.role === "alert"));
});

test("retry preserves university settings, reserves a fresh circuit and keeps the displayed previous attempt", async () => {
  const page = await savedReview();
  const original = page.review().attempt;
  page.review().onRetry();
  await page.flush();
  const request = page.state.requests[0];
  assert.equal(request.method, "POST");
  assert.equal(request.body.mode, "university");
  assert.equal(request.body.universitySlug, "aberdeen");
  assert.equal(request.body.stationSlug, original.stationSlug);
  assert.equal(request.body.stationCount, 1);
  assert.equal(request.body.stationIndex, 0);
  assert.notEqual(request.body.circuitId, original.circuitId);
  assert.equal(page.review().attempt.id, original.id);
  assert.equal(page.state.routes[0], "/phloemai/interview/ai-interviews?attempt=new-attempt");
});

test("retry after a timeout reuses its reservation ID without modifying the old transcript", async () => {
  let failures = 1;
  const page = await savedReview({ onRequest: request => {
    if (request.method === "POST" && failures-- > 0) { const failure = new Error("Timed out"); failure.name = "AbortError"; throw failure; }
  } });
  page.review().onRetry(); await page.flush();
  page.review().onRetry(); await page.flush();
  assert.equal(page.state.requests[0].body.circuitId, page.state.requests[1].body.circuitId);
  assert.equal(page.review().attempt.answers[0].answer, words);
  assert.equal(page.state.routes.length, 1);
});

test("an expired legacy attempt finalizes the current account snapshot without grading", async () => {
  const page = await savedReview({ overrides: { status: "in_progress", completedAt: null }, onRequest: (request, state) => {
    if (request.method === "GET") state.attempt.answers[0].answer = "A newer account answer";
  } });
  assert.deepEqual(page.state.requests.map(item => item.method), ["GET", "PATCH"]);
  assert.equal(page.state.requests[1].body.finish, true);
  assert.deepEqual(page.state.requests[1].body.answers, []);
  assert.equal(page.review().attempt.answers[0].answer, "A newer account answer");
  assert.equal(page.review().attempt.status, "submitted");
});

test("an active saved station offers Resume and uses the server clock despite local clock skew", async () => {
  const serverTime = new Date(Date.now() - 3_600_000).toISOString();
  const page = await savedReview({ serverNow: serverTime, overrides: { status: "in_progress", startedAt: serverTime, completedAt: null } });
  page.state.intervals[0]();
  await page.flush();
  assert.equal(page.review(), undefined);
  assert.equal(page.state.requests.length, 0);
  assert.ok(find(page.tree(), node => node.props?.href?.includes("ai-interviews?attempt=")));
});

test("an unrelated active interview is offered for resume without replacing the saved review", async () => {
  const page = await savedReview({ onRequest: (request, state) => request.method === "POST" ? Response.json({ attempt: { ...state.attempt, id: "active-other", circuitId: "different-circuit" } }) : undefined });
  const original = page.review().attempt.id;
  page.review().onRetry(); await page.flush();
  assert.equal(page.state.routes.length, 0);
  assert.equal(page.review().attempt.id, original);
  assert.ok(find(page.tree(), node => node.props?.href?.endsWith("attempt=active-other")));
});
