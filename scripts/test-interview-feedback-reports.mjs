import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { interviewPercentage, validateFeedback, RUBRIC_CRITERIA } from "../utils/interviews/scoring.ts";

const require = createRequire(import.meta.url);

test("the practice rubric uses five stable Med interview criteria", () => {
  assert.equal(RUBRIC_CRITERIA.length, 5);
  assert.deepEqual(RUBRIC_CRITERIA, [
    "Relevance and motivation",
    "Evidence and reflection",
    "Reasoning and balance",
    "Structure and clarity",
    "Insight and professionalism",
  ]);
});

function renderReview(feedback = null, preview = false) {
  const source = readFileSync(new URL("../app/medicforest/interview/_components/AIInterviewReview.tsx", import.meta.url), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  const loaded = { exports: {} };
  const React = require("react");
  new Function("require", "module", "exports", output)(name => {
    if (name === "@/utils/interviews/scoring") return { practiceResult: scores => validateFeedback({ summary: "Valid", strengths: ["Valid"], improvements: ["Valid"], rubric: scores }).practiceResult, PRACTICE_PASS_AVERAGE: 75 };
    if (name === "react" || name === "react/jsx-runtime") return require(name);
    if (name === "next/link") return { __esModule: true, default: ({ children, href }) => React.createElement("a", { href }, children) };
    if (name === "lucide-react") return new Proxy({}, { get: () => () => null });
    if (name.endsWith("/universities")) return { findInterviewUniversity: () => null };
    if (name === "./AttemptMarkSchemes") return { AttemptMarkSchemes: ({ headerAction }) => React.createElement(React.Fragment, null, headerAction) };
    if (name.endsWith("/speech-delivery")) return { getTranscriptHints: text => ({ wordCount: text.trim().split(/\s+/).filter(Boolean).length }), normalizeSpeechTranscript: text => text };
    if (name.endsWith("/interviewer-transcript")) return { answerConversation: answer => [{ speaker: "You", text: answer.answer }] };
    if (name.endsWith(".module.css")) return { __esModule: true, default: {} };
    throw new Error(`Unexpected review dependency: ${name}`);
  }, loaded, loaded.exports);
  const attempt = {
    id: "12345678-1234-4234-8234-123456789012", circuitId: "12345678-1234-4234-8234-123456789012",
    stationSlug: "why-medicine", stationIndex: 0, stationCount: 1, title: "Why medicine?", mode: "free",
    status: "submitted", startedAt: "2026-09-01T12:00:00Z", completedAt: "2026-09-01T12:05:00Z",
    universitySlug: null, questions: ["Why medicine?"], answers: [{ question: "Why medicine?", answer: "I want to study medicine because I value scientific reasoning and careful conversations with patients. Volunteering helped me understand the importance of listening, teamwork, and reflecting on what I do not yet know." }],
    metrics: {}, feedback,
  };
  const html = renderToStaticMarkup(React.createElement(loaded.exports.AIInterviewReview, {
    attempt, preview, configured: false, onGenerate() {}, onRetry() {},
  }));
  return html;
}

test("unconfigured AI shows availability instead of a paid upgrade claim", () => {
  const html = renderReview();
  assert.match(html, /AI feedback is unavailable/);
  assert.doesNotMatch(html, /Upgrade to unlock|official UK medical school/);
  assert.match(html.match(/<button[^>]*aria-controls="ai-feedback"[^>]*>/)?.[0] ?? "", /disabled/);
});

test("students see pass/fail blockers and borderline guidance, while old reports and previews remain honest", () => {
  const report = scores => validateFeedback({ summary: "Practice feedback.", strengths: ["Clear example."], weaknesses: ["Explain the reasoning further."], fixes: ["Compare the options and justify your next step."], rubric: scores.map(score => ({ score, reason: "Evidence from the candidate's answer." })) });
  const fail = renderReview(report([90, 90, 90, 90, 30]));
  assert.match(fail, /Practice fail/);
  assert.match(fail, /Insight and professionalism needs to reach 50/);
  const pass = renderReview(report([75, 75, 75, 75, 75]));
  assert.match(pass, /Practice pass/);
  assert.match(pass, /average at least 75\/100/);
  const old = report([60, 60, 60, 60, 60]);
  old.practiceResult = { version: "practice-pass-v1", outcome: "pass", borderline: true, reasons: ["Old threshold"] };
  assert.match(renderReview(old), /Practice fail/);
  assert.match(pass, /Close to a practice cutoff/);
  assert.match(pass, /medical schools set their own admissions criteria/);
  const legacy = report([60, 60, 60, 60, 60]);
  delete legacy.practiceResult;
  assert.match(renderReview(legacy), /older report was not assessed/);
  assert.doesNotMatch(renderReview(report([80, 80, 80, 80, 80]), true), /aria-label="Practice pass or fail"/);
});

test("validateFeedback handles structured feedback with distinct weaknesses and fixes", () => {
  const structuredData = {
    summary: "Clear reasoning with relevant work experience examples.",
    strengths: ["Demonstrated empathy with patient perspective.", "Structured response well."],
    weaknesses: ["Did not reflect deeply on the emotional toll on the team."],
    fixes: ["Mention how doctors decompress and support colleagues after difficult cases."],
    rubric: [
      { score: 75, reason: "Clear personal connection." },
      { score: 70, reason: "Good reflection on care home volunteering." },
      { score: 80, reason: "Balanced perspectives on NHS pressures." },
      { score: 65, reason: "Well structured with clear opening." },
      { score: 75, reason: "Professional insight shown." },
    ],
  };

  const validated = validateFeedback(structuredData);
  assert.equal(validated.summary, structuredData.summary);
  assert.deepEqual(validated.strengths, structuredData.strengths);
  assert.deepEqual(validated.weaknesses, structuredData.weaknesses);
  assert.deepEqual(validated.fixes, structuredData.fixes);
  assert.deepEqual(validated.improvements, structuredData.fixes); // Backwards compatibility alias
  assert.equal(validated.rubric.length, 5);
  assert.equal(typeof validated.score, "number");
  assert.ok(validated.score > 0 && validated.score <= 99);
});

test("validateFeedback handles legacy feedback with improvements array", () => {
  const legacyData = {
    summary: "Solid answer with good communication.",
    strengths: ["Confident pacing."],
    improvements: ["Elaborate on multidisciplinary teamwork."],
    rubric: Array.from({ length: 5 }, () => ({ score: 60, reason: "Competent demonstration." })),
  };

  const validated = validateFeedback(legacyData);
  assert.equal(validated.weaknesses, undefined);
  assert.deepEqual(validated.improvements, ["Elaborate on multidisciplinary teamwork."]);
  assert.equal(validated.score, interviewPercentage(60));
});

test("validateFeedback rejects rubric scores outside 0-100 or non-finite values", () => {
  const base = {
    summary: "Good effort.",
    strengths: ["Clear speech."],
    improvements: ["Provide more evidence."],
    rubric: Array.from({ length: 5 }, () => ({ score: 50, reason: "Satisfactory." })),
  };

  assert.throws(() => validateFeedback({ ...base, rubric: [{ score: -5, reason: "Low" }, ...base.rubric.slice(1)] }));
  assert.throws(() => validateFeedback({ ...base, rubric: [{ score: 105, reason: "High" }, ...base.rubric.slice(1)] }));
  assert.throws(() => validateFeedback({ ...base, rubric: [{ score: NaN, reason: "NaN" }, ...base.rubric.slice(1)] }));
  assert.throws(() => validateFeedback({ ...base, rubric: [{ score: Infinity, reason: "Inf" }, ...base.rubric.slice(1)] }));
});

test("validateFeedback rejects missing summary or empty string arrays", () => {
  const base = {
    summary: "Good.",
    strengths: ["Clear."],
    improvements: ["More detail."],
    rubric: Array.from({ length: 5 }, () => ({ score: 50, reason: "OK." })),
  };

  assert.throws(() => validateFeedback({ ...base, summary: "" }));
  assert.throws(() => validateFeedback({ ...base, summary: "   " }));
  assert.throws(() => validateFeedback({ ...base, strengths: [] }));
  assert.throws(() => validateFeedback({ ...base, strengths: [""] }));
  assert.throws(() => validateFeedback({ ...base, improvements: [] }));
});

test("interviewPercentage formula guarantees sub-100 ceiling and strictly monotonic growth", () => {
  assert.equal(interviewPercentage(0), 0);
  assert.equal(interviewPercentage(100), 99); // Calibrated 99% cap

  for (let score = 0; score < 100; score += 5) {
    const current = interviewPercentage(score);
    const next = interviewPercentage(score + 5);
    assert.ok(next >= current, `Score at ${score + 5} should be >= ${score}`);
  }
});
