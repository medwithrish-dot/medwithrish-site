import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const attemptId = "ad7bd5f9-a495-4003-a0d1-c2fa8f8a9110";
const circuitId = "12345678-1234-4234-8234-123456789012";
const question = "Why medicine?";
const words = "Working with residents in a care home taught me to listen carefully and recognise how different members of the healthcare team support each person.";
const feedback = { score: 75, summary: "A thoughtful answer", strengths: ["Reflection"], improvements: ["Be specific"], rubric: [] };

function load(file, mocks) {
  const filename = resolve(root, file);
  const compiled = { exports: {} };
  const output = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const localRequire = name => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name === "server-only") return {};
    if (name.startsWith("@/")) return load(`${name.slice(2)}.ts`, mocks);
    if (name.startsWith(".")) return load(resolve(dirname(filename), `${name}.ts`), mocks);
    return require(name);
  };
  new Function("require", "module", "exports", output)(localRequire, compiled, compiled.exports);
  return compiled.exports;
}

// Exercise real validation, ownership, mapping and route behaviour; substitute
// only Supabase transport and the external AI provider.
function harness({ overrides = {}, configured = false, user = "user-1", beforeUpdate, assess = async () => feedback } = {}) {
  const state = { row: {
    id: attemptId, user_id: "user-1", mode: "reference", university_slug: null, station_slug: "why-medicine", title: question,
    status: "in_progress", started_at: new Date(Date.now() - 180_000).toISOString(), completed_at: null, answer_submitted_at: null,
    preparation_seconds: 60, station_seconds: 480, break_seconds: 120, station_index: 0, station_count: 3, circuit_id: circuitId,
    questions: [question], answers: [{ question, answer: "Previously saved answer" }], metrics: { wordCount: 3 },
    feedback: null, score: null, grading_tries: 0, last_error: null, ...overrides,
  }, providerCalls: 0, gradingClaims: 0, reservations: [], writes: 0 };
  class Query {
    constructor(table) { this.table = table; this.filters = []; }
    select() { return this; }
    eq(key, value) { this.filters.push([key, value]); return this; }
    update(value) { this.mutation = value; return this; }
    async maybeSingle() {
      if (this.table === "profiles") return { data: { current_plan: "premium" }, error: null };
      if (this.mutation && beforeUpdate) { const callback = beforeUpdate; beforeUpdate = undefined; callback(state); }
      const match = this.filters.every(([key, value]) => ["questions", "answers"].includes(key) ? JSON.stringify(state.row[key]) === value : state.row[key] === value);
      if (!match) return { data: null, error: null };
      if (this.mutation) { state.writes += 1; Object.assign(state.row, structuredClone(this.mutation)); }
      return { data: structuredClone(state.row), error: null };
    }
    then(resolve, reject) { return this.maybeSingle().then(resolve, reject); }
  }
  const admin = {
    from: table => new Query(table),
    async rpc(name, args) {
      if (name === "reserve_interview_attempt") {
        state.reservations.push(args.p_payload);
        return { data: { ...state.row, ...args.p_payload }, error: null };
      }
      assert.equal(name, "claim_interview_grading");
      state.gradingClaims += 1;
      Object.assign(state.row, { status: "grading", grading_token: args.p_token, grading_tries: state.row.grading_tries + 1, last_error: null });
      return { data: structuredClone(state.row), error: null };
    },
  };
  const mocks = {
    "@/utils/supabase/server": { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: user ? { id: user } : null } }) } }) },
    "@/utils/supabase/admin": { createAdminClient: () => admin },
    "@/utils/interviews/gemini": { interviewAiConfigured: () => configured, assessInterview: async (...args) => { state.providerCalls += 1; return assess(...args); } },
  };
  const session = load("app/api/interviews/session/route.ts", mocks);
  const grade = load("app/api/interviews/feedback/route.ts", mocks);
  const request = (path, method, body) => new Request(`https://example.test/api/interviews/${path}`, { method,
    headers: { "Content-Type": "application/json", Origin: "https://example.test" }, body: JSON.stringify(body) });
  return { state,
    patch: (body = {}) => session.PATCH(request("session", "PATCH", { attemptId, answers: [{ question, answer: words }], ...body })),
    post: body => session.POST(request("session", "POST", body)),
    grade: () => grade.POST(request("feedback", "POST", { attemptId })),
  };
}

test("finishing saves even an empty transcript and opens an ungraded review without AI", async () => {
  for (const answer of ["", "A short answer"]) {
    const api = harness();
    const response = await api.patch({ finish: true, answers: [{ question, answer }] });
    assert.equal(response.status, 200);
    const { attempt } = await response.json();
    assert.equal(attempt.status, "submitted");
    assert.equal(attempt.answers[0].answer, answer);
    assert.equal(attempt.feedback, null);
    assert.equal(api.state.row.last_error, "awaiting_feedback");
    assert.ok(attempt.completedAt);
    assert.equal(attempt.answerSubmittedAt, attempt.completedAt);
    assert.equal(Date.parse(attempt.nextAvailableAt) - Date.parse(attempt.completedAt), 120_000);
    assert.equal(api.state.providerCalls, 0);
    assert.equal(api.state.gradingClaims, 0);
    assert.match(response.headers.get("cache-control"), /private, no-store/);
  }
});

test("finish is idempotent, keeps its snapshot and rejects subsequent autosaves", async () => {
  const api = harness();
  const first = await (await api.patch({ finish: true })).json();
  const repeated = await (await api.patch({ finish: true, answers: [{ question, answer: "Overwrite it" }] })).json();
  assert.deepEqual(repeated.attempt, first.attempt);
  assert.equal(api.state.writes, 1);
  assert.equal((await api.patch()).status, 409);
  assert.equal(api.state.row.answers[0].answer, words);
});

test("expired stations submit the saved snapshot and ignore text and metrics supplied after grace", async () => {
  const api = harness({ overrides: { started_at: new Date(Date.now() - 900_000).toISOString() } });
  assert.equal((await api.patch()).status, 409);
  const response = await api.patch({ finish: true, metrics: { wordCount: 999 } });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.usedSavedAnswers, true);
  assert.equal(result.attempt.answers[0].answer, "Previously saved answer");
  assert.equal(result.attempt.metrics.wordCount, 3);
  assert.equal(result.attempt.status, "submitted");
});

test("finishing preserves omitted follow-up answers and rejects concurrent autosave overwrites", async () => {
  const probe = "What did you learn?";
  const api = harness({ overrides: { questions: [question, probe], answers: [{ question, answer: "Original" }, { question: probe, answer: "Saved reflection" }] } });
  const result = await (await api.patch({ finish: true })).json();
  assert.equal(result.attempt.answers[1].answer, "Saved reflection");
  const racing = harness({ beforeUpdate: state => { state.row.answers[0].answer = "A newer answer saved from another tab"; } });
  assert.equal((await racing.patch({ finish: true })).status, 409);
  assert.equal(racing.state.row.status, "in_progress");
  assert.equal(racing.state.row.answers[0].answer, "A newer answer saved from another tab");
});

test("finish validates ownership, answer limits and abandoned attempts", async () => {
  assert.equal((await harness({ user: null }).patch({ finish: true })).status, 401);
  assert.equal((await harness({ user: "another-user" }).patch({ finish: true })).status, 404);
  assert.equal((await harness().patch({ finish: true, answers: [{ question, answer: "x".repeat(8001) }] })).status, 400);
  assert.equal((await harness({ overrides: { status: "failed", last_error: "abandoned" } }).patch({ finish: true })).status, 409);
});

test("circuits can continue after ungraded submission and failed or pending optional feedback", async () => {
  for (const [status, last_error] of [["failed", "awaiting_feedback"], ["failed", "feedback_unavailable"], ["grading", null]]) {
    const api = harness({ overrides: { status, last_error, completed_at: "2020-01-01T00:00:00Z", answer_submitted_at: "2020-01-01T00:00:00Z" } });
    const response = await api.post({ mode: "reference", circuitId, stationIndex: 1, stationSlug: "data-analysis" });
    assert.equal(response.status, 200);
    assert.equal(api.state.reservations[0].station_count, 3);
  }
});

test("ungraded circuit continuation still enforces completion, abandonment and breaks", async () => {
  for (const overrides of [
    { status: "failed", last_error: "awaiting_feedback", completed_at: null, answer_submitted_at: null },
    { status: "failed", last_error: "abandoned", completed_at: "2020-01-01T00:00:00Z", answer_submitted_at: "2020-01-01T00:00:00Z" },
    { status: "failed", last_error: "awaiting_feedback", completed_at: new Date().toISOString(), answer_submitted_at: new Date().toISOString() },
  ]) {
    const api = harness({ overrides });
    assert.equal((await api.post({ mode: "reference", circuitId, stationIndex: 1, stationSlug: "data-analysis" })).status, 409);
    assert.equal(api.state.reservations.length, 0);
  }
});

test("a university station retry reserves a new circuit with the same university timing", async () => {
  const api = harness();
  const newCircuit = "23456789-1234-4234-8234-123456789012";
  const response = await api.post({ mode: "university", universitySlug: "aberdeen", stationSlug: "data-analysis", stationCount: 1, stationIndex: 0, circuitId: newCircuit });
  assert.equal(response.status, 200);
  assert.equal(api.state.reservations[0].circuit_id, newCircuit);
  assert.equal(api.state.reservations[0].university_slug, "aberdeen");
  assert.equal(api.state.reservations[0].station_seconds, 300);
  assert.equal(api.state.reservations[0].station_count, 1);
  assert.equal(api.state.row.circuit_id, circuitId, "Reserving the retry does not modify the prior attempt");
});

test("feedback is explicit and keeps the original finish time and circuit break", async () => {
  const finishedAt = "2020-01-01T00:00:00Z";
  const api = harness({ configured: true, overrides: { status: "failed", last_error: "awaiting_feedback", completed_at: finishedAt, answer_submitted_at: finishedAt, answers: [{ question, answer: words }] } });
  const response = await api.grade();
  assert.equal(response.status, 200);
  const { attempt } = await response.json();
  assert.equal(attempt.status, "completed");
  assert.equal(attempt.feedback.score, 75);
  assert.equal(attempt.completedAt, finishedAt);
  assert.equal(attempt.answerSubmittedAt, finishedAt);
  assert.equal(api.state.providerCalls, 1);
  assert.equal(api.state.gradingClaims, 1);
  await api.grade();
  assert.equal(api.state.providerCalls, 1, "Reopening completed feedback must not regrade");
});

test("unavailable or unsuccessful AI feedback preserves the submitted transcript", async () => {
  for (const configured of [false, true]) {
    const api = harness({ configured, assess: async () => { throw new Error("Provider temporarily unavailable"); } });
    await api.patch({ finish: true });
    const submittedAt = api.state.row.completed_at;
    assert.equal((await api.grade()).status, 503);
    assert.equal(api.state.row.answers[0].answer, words);
    assert.equal(api.state.row.completed_at, submittedAt);
    assert.equal(api.state.providerCalls, configured ? 1 : 0);
  }
});
