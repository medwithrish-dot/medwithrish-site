import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const circuitId = "12345678-1234-4234-8234-123456789012";

// Run the real route and catalogue, substituting only account/database services.
// No credentials, writes to a real account, or AI provider are needed.
function sessionRoute({ premium = true, previous = null } = {}) {
  const reservations = [];
  const filters = [];
  class InterviewError extends Error {
    constructor(message, status = 400) { super(message); this.status = status; }
  }
  const query = {
    select() { return this; },
    eq(key, value) { filters.push([key, value]); return this; },
    async maybeSingle() { return { data: previous, error: null }; },
  };
  const server = {
    InterviewError,
    interviewContext: async () => ({ user: { id: "test-user" }, isPremium: premium, admin: {
      from: () => query,
      rpc: async (name, args) => { reservations.push({ name, ...args }); return { data: args.p_payload, error: null }; },
    } }),
    readInterviewBody: async request => request.json(),
    interviewJson: data => Response.json(data),
    interviewFailure: error => Response.json({ error: error.message }, { status: error.status || 503 }),
    databaseError: error => { throw error; },
    toInterviewAttempt: data => data,
    validId: value => typeof value === "string" && /^[0-9a-f-]{36}$/.test(value),
  };
  const modules = new Map();
  function load(filename) {
    if (!filename.endsWith(".ts")) filename += ".ts";
    if (modules.has(filename)) return modules.get(filename).exports;
    const output = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const compiled = { exports: {} }; modules.set(filename, compiled);
    const localRequire = specifier => {
      if (specifier === "@/utils/interviews/server") return server;
      if (specifier.startsWith("@/")) return load(resolve(root, specifier.slice(2)));
      if (specifier.startsWith(".")) return load(resolve(dirname(filename), specifier));
      return require(specifier);
    };
    new Function("require", "module", "exports", output)(localRequire, compiled, compiled.exports);
    return compiled.exports;
  }
  const route = load(resolve(root, "app/api/interviews/session/route.ts"));
  return {
    reservations, filters,
    post: body => route.POST(new Request("http://localhost/api/interviews/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })),
  };
}

test("a custom circuit reserves the chosen first topic and count", async () => {
  const api = sessionRoute();
  const response = await api.post({ mode: "reference", stationCount: 3, stationSlug: "work-experience" });
  assert.equal(response.status, 200);
  const payload = api.reservations[0].p_payload;
  assert.equal(payload.station_count, 3);
  assert.equal(payload.station_slug, "work-experience");
  assert.match(payload.questions[0], /experience/);
  assert.equal(payload.break_seconds, 120);
});

test("university customisation preserves that university's practice timings", async () => {
  const api = sessionRoute();
  const response = await api.post({ mode: "university", universitySlug: "aberdeen", stationCount: 2, stationSlug: "data-analysis" });
  assert.equal(response.status, 200);
  const payload = api.reservations[0].p_payload;
  assert.equal(payload.station_slug, "data-analysis");
  assert.equal(payload.station_count, 2);
  assert.equal(payload.station_seconds, 300);
  assert.equal(payload.university_slug, "aberdeen");
});

test("legacy presets still use their original counts and topic order", async () => {
  for (const [body, count] of [[{ mode: "reference" }, 5], [{ mode: "university", universitySlug: "aberdeen" }, 6], [{ mode: "free" }, 1]]) {
    const api = sessionRoute();
    assert.equal((await api.post(body)).status, 200);
    assert.equal(api.reservations[0].p_payload.station_count, count);
    assert.equal(api.reservations[0].p_payload.station_slug, "why-medicine");
  }
});

test("empty, malformed and oversized station selections do not reserve an attempt", async () => {
  for (const stationCount of [0, -1, 10, 1.5, "3", null, {}, []]) {
    const api = sessionRoute();
    assert.equal((await api.post({ mode: "reference", stationCount })).status, 400);
    assert.equal(api.reservations.length, 0);
  }
  const api = sessionRoute();
  assert.equal((await api.post({ mode: "reference", stationCount: 1, stationSlug: "made-up-station" })).status, 404);
  assert.equal(api.reservations.length, 0);
});

const previousStation = overrides => ({ status: "completed", mode: "reference", university_slug: null, station_count: 3, completed_at: "2020-01-01T00:00:00Z", break_seconds: 120, ...overrides });

test("continuation uses the saved circuit count and the next selected topic", async () => {
  const api = sessionRoute({ previous: previousStation() });
  assert.equal((await api.post({ mode: "reference", circuitId, stationIndex: 1, stationSlug: "teamwork-group-discussion" })).status, 200);
  assert.equal(api.reservations[0].p_payload.station_count, 3);
  assert.equal(api.reservations[0].p_payload.station_slug, "teamwork-group-discussion");
  assert.ok(api.filters.some(([key, value]) => key === "user_id" && value === "test-user"));
  assert.ok(api.filters.some(([key, value]) => key === "circuit_id" && value === circuitId));
  assert.ok(api.filters.some(([key, value]) => key === "station_index" && value === 0));
});

test("a finished circuit cannot be extended or have its length changed", async () => {
  for (const body of [{ stationIndex: 3 }, { stationIndex: 1, stationCount: 5 }]) {
    const api = sessionRoute({ previous: previousStation() });
    assert.equal((await api.post({ mode: "reference", circuitId, ...body })).status, 409);
    assert.equal(api.reservations.length, 0);
  }
});

test("an older university circuit can continue beyond the custom topic limit", async () => {
  const api = sessionRoute({ previous: previousStation({ mode: "university", university_slug: "aberdeen", station_count: 12 }) });
  assert.equal((await api.post({ mode: "university", universitySlug: "aberdeen", circuitId, stationIndex: 10, stationSlug: "data-analysis" })).status, 200);
  assert.equal(api.reservations[0].p_payload.station_count, 12);
  assert.equal(api.reservations[0].p_payload.station_index, 10);
});

test("customisation retains the completion, break and membership checks", async () => {
  for (const previous of [null, previousStation({ status: "in_progress" }), previousStation({ completed_at: new Date().toISOString() }), previousStation({ mode: "university" })]) {
    const api = sessionRoute({ previous });
    assert.equal((await api.post({ mode: "reference", circuitId, stationIndex: 1, stationSlug: "data-analysis" })).status, 409);
    assert.equal(api.reservations.length, 0);
  }
  const api = sessionRoute({ premium: false });
  assert.equal((await api.post({ mode: "reference", stationCount: 2 })).status, 403);
  assert.equal(api.reservations.length, 0);
  assert.equal((await api.post({ mode: "free", stationCount: 1 })).status, 200);
});
