import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = readFileSync(new URL("../app/medicforest/ucat/_lib/ucatDiagnostics.ts", import.meta.url), "utf8");
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const compiledModule = { exports: {} };
new Function("require", "module", "exports", javascript)(require, compiledModule, compiledModule.exports);

const {
  getCombinedDiagnosticAccuracy,
  getCombinedDiagnosticAvgSeconds,
  getReportIssueDefinitionForLabel,
  normaliseDashboardDiagnostic,
  getDiagnosticStudyPlanTasks,
} = compiledModule.exports;

const diagnostic = (overrides = {}) => ({
  accuracy: 0,
  scorePoints: null,
  maxScore: null,
  totalQuestions: null,
  avgSecondsPerQuestion: null,
  ...overrides,
});

test("combined diagnostic metrics include legacy scores and ignore missing timing", () => {
  const reports = [
    diagnostic({ accuracy: 50, scorePoints: 5, maxScore: 10, totalQuestions: 10, avgSecondsPerQuestion: 30 }),
    diagnostic({ accuracy: 80, totalQuestions: 10 }),
  ];
  assert.equal(getCombinedDiagnosticAccuracy(reports), 65);
  assert.equal(getCombinedDiagnosticAvgSeconds(reports), 30);
  assert.equal(getCombinedDiagnosticAccuracy([]), 0);
  assert.equal(getCombinedDiagnosticAvgSeconds([]), 0);
});

test("empty issue labels never match a specific issue definition", () => {
  assert.equal(getReportIssueDefinitionForLabel(""), undefined);
  assert.equal(getReportIssueDefinitionForLabel("  "), undefined);
});

test("saved diagnostics discard malformed issues and study tasks before rendering", () => {
  const saved = normaliseDashboardDiagnostic({
    id: "attempt-1",
    accuracy: Number.NaN,
    metadata: {
      summary: { section: "QR", scorePoints: Number.POSITIVE_INFINITY },
      insights: {
        issues: [null, { label: 42 }, { label: "Timing issue", evidence: ["Slow QR", 2], studyFixes: ["Timed QR", null] }],
        strengths: ["Good pacing", 9],
      },
      studyPlanTasks: [null, { fix: 42 }, { fix: "Timed practice", label: "Timing" }],
    },
  });
  assert.equal(saved.accuracy, 0);
  assert.equal(saved.scorePoints, null);
  assert.deepEqual(saved.issues.map((issue) => issue.label), ["Timing issue"]);
  assert.deepEqual(saved.issues[0].evidence, ["Slow QR"]);
  assert.deepEqual(saved.strengths, ["Good pacing"]);
  assert.equal(saved.studyPlanTasks.length, 1);
  assert.ok(getDiagnosticStudyPlanTasks(saved).length > 0);
});
