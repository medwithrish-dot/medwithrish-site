import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const id = number => `00000000-0000-4000-8000-${String(number).padStart(12, "0")}`;
const rows = Array.from({ length: 330 }, (_, index) => ({ id: id(index), user_id: "student", started_at: "2026-10-14T10:00:00.123456+00:00", status: "completed", station_slug: "why-medicine", title: "Why medicine?", university_slug: null, preparation_seconds: 0, station_seconds: 180, questions: ["Private question"], answers: [{ answer: "Private answer" }], metrics: {}, feedback_score: 75 }));

function harness({ user = "student", unavailable = false, sourceRows = rows } = {}) {
  const queries = [];
  const supabase = { auth: { getUser: async () => ({ data: { user: user ? { id: user } : null } }) }, from(table) {
    const state = { table, filters: [], orders: [] };
    queries.push(state);
    const query = {
      select(columns) { state.columns = columns; return this; },
      eq(key, value) { state.filters.push([key, value]); return this; },
      order(key, options) { state.orders.push([key, options]); return this; },
      limit(count) { state.count = count; return this; },
      or(value) { state.cursor = value; return this; },
      then(resolvePromise, reject) {
        let data = sourceRows.filter(row => state.filters.every(([key, value]) => row[key] === value)).toSorted((a, b) => b.started_at.localeCompare(a.started_at) || b.id.localeCompare(a.id));
        if (state.cursor) {
          const match = /^started_at\.lt\.(.+),and\(started_at\.eq\.(.+),id\.lt\.([a-f0-9-]+)\)$/.exec(state.cursor);
          assert.ok(match, "Pagination uses a validated time and ID pair");
          assert.equal(match[1], match[2]);
          data = data.filter(row => row.started_at < match[1] || (row.started_at === match[1] && row.id < match[3]));
        }
        return Promise.resolve({ data: unavailable ? null : data.slice(0, state.count), error: unavailable ? { message: "Private database diagnostic" } : null }).then(resolvePromise, reject);
      },
    };
    return query;
  } };
  class InterviewError extends Error { constructor(message, status = 400) { super(message); this.status = status; } }
  const mocks = {
    "server-only": {},
    "@/utils/supabase/server": { createClient: async () => supabase },
    "@/utils/interviews/server": {
      InterviewError, validId: value => typeof value === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value),
      interviewJson: data => Response.json(data, { headers: { "Cache-Control": "private, no-store" } }),
      interviewFailure: error => Response.json({ error: error.message }, { status: error.status || 503 }),
    },
  };
  mocks["./server"] = { toInterviewAttempt: row => ({ id: row.id, stationSlug: row.station_slug, title: row.title, status: row.status, universitySlug: row.university_slug, startedAt: row.started_at, questions: row.questions, answers: row.answers, preparationSeconds: row.preparation_seconds, stationSeconds: row.station_seconds, feedback: row.feedback, metrics: row.metrics }) };
  const cache = new Map();
  function load(file) {
    const filename = file.endsWith(".ts") ? file : `${file}.ts`;
    if (cache.has(filename)) return cache.get(filename).exports;
    const loaded = { exports: {} };
    cache.set(filename, loaded);
    const code = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    new Function("require", "module", "exports", code)(name => Object.hasOwn(mocks, name) ? mocks[name] : name.startsWith("@/") ? load(resolve(root, name.slice(2))) : name.startsWith(".") ? load(resolve(dirname(filename), name)) : require(name), loaded, loaded.exports);
    return loaded.exports;
  }
  const history = load(resolve(root, "utils/interviews/history"));
  const route = load(resolve(root, "app/api/interviews/history/route"));
  return { queries, history: history.interviewHistory, get: params => route.GET(new Request(`https://medicforest.com/api/interviews/history${params ? `?${new URLSearchParams(params)}` : ""}`)) };
}

test("older saved history remains reachable after 300 attempts, including identical microsecond timestamps", async () => {
  const api = harness();
  const first = await api.history();
  assert.equal(first.attempts.length, 300);
  assert.ok(first.nextCursor);
  const second = await api.history(first.nextCursor);
  assert.equal(second.attempts.length, 30);
  assert.equal(second.nextCursor, null);
  assert.equal(new Set([...first.attempts, ...second.attempts].map(attempt => attempt.id)).size, 330);
  for (const query of api.queries) {
    assert.deepEqual(query.filters, [["user_id", "student"]]);
    assert.doesNotMatch(query.columns, /questions|answers|user_id/);
    assert.equal(query.count, 301);
  }
});

test("Progress retrieves older paused work separately from hundreds of newer completed attempts", async () => {
  const pausedAt = Date.parse("2026-09-01T10:00:30Z");
  const older = { ...rows[0], id: id(999), status: "in_progress", started_at: "2026-09-01T10:00:00Z", paused_at: pausedAt };
  const api = harness({ sourceRows: [...rows, older] });
  const recent = await api.history();
  assert.ok(recent.attempts.every(attempt => attempt.id !== older.id));
  const unfinished = await api.history(undefined, true);
  assert.equal(unfinished.attempts.length, 1);
  assert.equal(unfinished.attempts[0].id, older.id);
  assert.equal(unfinished.attempts[0].metrics.pausedAt, pausedAt);
  assert.deepEqual(api.queries[1].filters, [["user_id", "student"], ["status", "in_progress"]]);
  assert.doesNotMatch(api.queries[1].columns, /answers|questions/);
});

test("history API requires an account and returns private summaries with no answer content", async () => {
  const guest = harness({ user: null });
  assert.equal((await guest.get()).status, 401);
  assert.equal(guest.queries.length, 0);
  const api = harness();
  const response = await api.get();
  assert.equal(response.headers.get("Cache-Control"), "private, no-store");
  const body = await response.json();
  assert.equal(body.attempts.length, 300);
  assert.equal(body.attempts[0].feedbackScore, 75);
  assert.match(api.queries[0].columns, /feedback_score:feedback->score/);
  assert.ok(!api.queries[0].columns.split(",").includes("feedback"));
  assert.doesNotMatch(JSON.stringify(body), /Private answer|Private question|user_id/);
  const older = await api.get({ before: body.nextCursor.startedAt, beforeId: body.nextCursor.id });
  assert.equal((await older.json()).attempts.length, 30);
});

test("history rejects incomplete and injected cursors before querying and reports storage failures honestly", async () => {
  const api = harness();
  for (const params of [{ before: "2026-10-14" }, { beforeId: id(1) }, { before: "2026-10-14T10:00:00Z),user_id.neq.student", beforeId: id(1) }, { before: "2026-10-14T10:00:00Z", beforeId: "anything" }]) assert.equal((await api.get(params)).status, 400);
  assert.equal(api.queries.length, 0);
  const broken = harness({ unavailable: true });
  const response = await broken.get();
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /Private database diagnostic/);
});
