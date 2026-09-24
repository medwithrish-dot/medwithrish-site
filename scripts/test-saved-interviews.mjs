import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const source = readFileSync(new URL("../app/medicforest/interview/_lib/saved-interviews.ts", import.meta.url), "utf8");
const compiledModule = { exports: {} };
new Function("module", "exports", ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 },
}).outputText)(compiledModule, compiledModule.exports);
const { filterSavedInterviews, groupSavedInterviews, canResumeSavedInterview, savedInterviewHref, savedInterviewStatus } = compiledModule.exports;

function attempt(overrides = {}) {
  return {
    id: "saved-1", title: "Why medicine?", stationSlug: "why-medicine", universitySlug: "bristol",
    universityName: "University of Bristol", status: "submitted", feedbackScore: null, canResume: false,
    startedAtLabel: "12 Sept 2026, 10:30", ...overrides,
  };
}

test("complete interviews group stations in order and keep retries separate", () => {
  const rows = [attempt({ id: "retry", circuitId: "retry", stationCount: 1 }), attempt({ id: "second", circuitId: "circuit", stationIndex: 1, stationCount: 2, title: "Ethics" }), attempt({ id: "first", circuitId: "circuit", stationIndex: 0, stationCount: 2 })];
  const grouped = groupSavedInterviews(rows);
  assert.equal(grouped.length, 2);
  assert.equal(grouped[1].id, "first");
  assert.deepEqual(grouped[1].stationTitles, ["Why medicine?", "Ethics"]);
  assert.equal(filterSavedInterviews(grouped, "ethics", "all", "all")[0].id, "first");
  const active = groupSavedInterviews([{ ...rows[1], canResume: true }, rows[2]])[0];
  assert.equal(active.id, "second");
  assert.equal(active.canResume, true);
});

test("university, word search and feedback filters combine without losing older retries", () => {
  const newest = attempt({ id: "newest" });
  const older = attempt({ id: "older", status: "completed", feedbackScore: 72 });
  const unrelated = attempt({ id: "different-school", universitySlug: "oxford", universityName: "University of Oxford" });
  const rows = [newest, unrelated, older];
  assert.deepEqual(filterSavedInterviews(rows, "  MEDICINE bristol ", "bristol", "all"), [newest, older]);
  assert.deepEqual(filterSavedInterviews(rows, "medicine", "bristol", "feedback"), [older]);
  assert.deepEqual(filterSavedInterviews(rows, "", "bristol", "saved"), [newest]);
  assert.deepEqual(filterSavedInterviews(rows, "ethics", "bristol", "all"), []);
  assert.deepEqual(rows, [newest, unrelated, older]);
});

test("general practice and zero scores remain searchable and correctly categorised", () => {
  const general = attempt({ id: "general", universitySlug: null, universityName: "General practice", status: "completed", feedbackScore: 0 });
  const active = attempt({ id: "active", status: "in_progress", canResume: true });
  const expired = attempt({ id: "expired", status: "in_progress" });
  assert.deepEqual(filterSavedInterviews([general, active, expired], "", "general", "feedback"), [general]);
  assert.deepEqual(filterSavedInterviews([general, active, expired], "", "all", "in_progress"), [active]);
  assert.deepEqual(filterSavedInterviews([general, active, expired], "", "all", "saved"), [expired]);
  assert.equal(savedInterviewStatus(general), "Feedback ready");
  assert.equal(savedInterviewStatus(expired), "Transcript saved · Ready to review");
});

test("only an unexpired active attempt opens the interview room", () => {
  const active = { status: "in_progress", startedAt: "2026-09-12T10:00:00Z", preparationSeconds: 60, stationSeconds: 480 };
  const deadline = Date.parse("2026-09-12T10:09:00Z");
  assert.equal(canResumeSavedInterview(active, deadline - 1), true);
  assert.equal(canResumeSavedInterview(active, deadline), false);
  assert.equal(canResumeSavedInterview(active, deadline + 1), false);
  assert.equal(savedInterviewHref(attempt({ id: "active", canResume: true })), "/medicforest/interview/ai-interviews?attempt=active");
  for (const status of ["submitted", "grading", "completed", "failed"]) {
    assert.equal(canResumeSavedInterview({ ...active, status }, deadline - 1), false);
    assert.equal(savedInterviewHref(attempt({ id: status, status })), `/medicforest/interview/reports/${status}`);
  }
  assert.equal(savedInterviewHref(attempt({ id: "expired", status: "in_progress" })), "/medicforest/interview/reports/expired");
});
