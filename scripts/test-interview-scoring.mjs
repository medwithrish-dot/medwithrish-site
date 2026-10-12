import assert from "node:assert/strict";
import { test } from "node:test";
import { highlightAnswerChanges } from "../app/medicforest/interview/_lib/answer-rewrite.ts";
import { interviewPercentage, practiceResult, validateFeedback } from "../utils/interviews/scoring.ts";

test("scores are bounded, finite, monotonic and reach exactly 99", () => {
  assert.equal(interviewPercentage(-1), 0);
  assert.equal(interviewPercentage(0), 0);
  assert.equal(interviewPercentage(100), 99);
  assert.equal(interviewPercentage(1000), 99);
  let previous = 0;
  for (let raw = 0; raw <= 100; raw += 0.1) {
    const current = interviewPercentage(raw);
    assert.ok(current >= previous && current <= 99);
    previous = current;
  }
  for (const value of [NaN, Infinity, -Infinity]) assert.throws(() => interviewPercentage(value));
});

test("strict scores do not inflate weak or adequate evidence", () => {
  for (const raw of [0, 20, 40, 60, 80, 90]) assert.equal(interviewPercentage(raw), raw);
  assert.equal(interviewPercentage(99.9), 99);
});

const valid = () => ({ summary: "A clear and reflective answer.", strengths: ["Uses a specific example."], improvements: ["Explain what changed in your understanding."], rubric: Array.from({ length: 5 }, () => ({ score: 60, reason: "Relevant evidence with room for deeper reflection." })) });

test("AI coverage preserves only valid trusted points and supports older reports", () => {
  const guidance = [{ questionId: "q1", checklistPoints: [{ id: "General-Reasons clearly" }] }];
  const coveredMarkScheme = [{ questionId: "q1", pointIds: ["General-Reasons clearly", "General-Reasons clearly"] }];
  assert.deepEqual(validateFeedback({ ...valid(), coveredMarkScheme }, undefined, guidance).coveredMarkScheme, [{ questionId: "q1", pointIds: ["General-Reasons clearly"] }]);
  assert.equal(validateFeedback(valid()).coveredMarkScheme, undefined);
  for (const rows of [[], [{ questionId: "q2", pointIds: [] }], [{ questionId: "q1", pointIds: ["Mistakes-Unsafe suggestion"] }], [{ questionId: "q1", pointIds: [123] }], [...coveredMarkScheme, ...coveredMarkScheme]]) {
    assert.throws(() => validateFeedback({ ...valid(), coveredMarkScheme: rows }, undefined, guidance));
  }
  assert.deepEqual(validateFeedback({ ...valid(), coveredMarkScheme: [{ questionId: "q1", pointIds: [] }] }, undefined, guidance).coveredMarkScheme[0].pointIds, []);
});

test("practice pass requires the overall standard and independent criterion minimums", () => {
  const result = scores => practiceResult(scores.map(score => ({ score })));
  assert.equal(result([75, 75, 75, 75, 75]).outcome, "pass");
  assert.equal(result([60, 60, 60, 60, 60]).outcome, "fail");
  assert.equal(result([100, 75, 50, 100, 50]).outcome, "pass");
  assert.equal(result([74, 74, 74, 74, 74]).outcome, "fail");
  assert.equal(result([100, 100, 100, 100, 30]).outcome, "fail");
  assert.equal(result([100, 100, 49, 100, 100]).outcome, "fail");
  assert.equal(result([100, 39, 100, 100, 100]).outcome, "fail");
  assert.equal(result([75, 75, 75, 75, 75]).borderline, true);
  assert.equal(result([85, 85, 85, 85, 85]).borderline, false);
  assert.equal(result([20, 20, 20, 20, 20]).borderline, false);
  assert.equal(result([74.99, 74.99, 74.99, 74.99, 74.99]).outcome, "fail");
  assert.throws(() => result([100]));
  assert.throws(() => result([100, 100, NaN, 100, 100]));
});

test("provider pass claims cannot override the server's practice decision", () => {
  const report = validateFeedback({ ...valid(), practiceResult: { outcome: "pass" }, rubric: valid().rubric.map(row => ({ ...row, score: 20 })) });
  assert.equal(report.practiceResult.outcome, "fail");
  assert.ok(report.practiceResult.reasons.length > 0);
});

test("validated feedback ignores provider or client percentage claims", () => {
  const feedback = validateFeedback({ ...valid(), score: 999 });
  assert.equal(feedback.score, interviewPercentage(60));
  assert.equal(feedback.rubric.length, 5);
  assert.equal(feedback.rubric[0].criterion, "Relevance and motivation");
});

test("invalid or truncated provider output cannot become a leaderboard score", () => {
  for (const value of [null, "", {}, { ...valid(), rubric: [] }, { ...valid(), strengths: [] }, { ...valid(), summary: "" }, { ...valid(), rubric: [{ score: 200, reason: "Bad" }, ...valid().rubric.slice(1)] }, { ...valid(), rubric: [{ score: NaN, reason: "Bad" }, ...valid().rubric.slice(1)] }]) {
    assert.throws(() => validateFeedback(value));
  }
});


test("new feedback preserves distinct strengths, weaknesses and fixes alongside legacy reports", () => {
  const legacy = validateFeedback(valid());
  assert.deepEqual(legacy.improvements, valid().improvements);
  const base = valid();
  delete base.improvements;
  const report = validateFeedback({ ...base, weaknesses: ["No reflection on challenges."], fixes: ["Explain one challenge you observed and what you learnt."] });
  assert.deepEqual(report.weaknesses, ["No reflection on challenges."]);
  assert.deepEqual(report.fixes, report.improvements);
  assert.equal(report.score, legacy.score);
  for (const fields of [{ weaknesses: ["A gap"] }, { fixes: ["An action"] }, { weaknesses: [], fixes: ["An action"] }, { weaknesses: ["A gap"], fixes: [12] }]) {
    assert.throws(() => validateFeedback({ ...base, ...fields }));
  }
});


test("answer diffs preserve the exact rewrite and distinguish additions and replacements", () => {
  const before = "I would listen to the patient.";
  for (const after of [before, "I would listen carefully to the patient and ask what matters to them.", "I would ask the patient what matters to them.", "I would listen to the patient.\nThen I would ask for help.", "<script>example</script>"]) {
    const parts = highlightAnswerChanges(before, after);
    assert.equal(parts.map(part => part.text).join(""), after);
  }
  assert.ok(highlightAnswerChanges(before, before).every(part => !part.added));
  const parts = highlightAnswerChanges(before, "I would listen carefully to the patient.");
  assert.ok(parts.some(part => part.added && part.text.includes("carefully")));
  assert.ok(parts.some(part => !part.added && part.text.includes("I would listen")));
  assert.ok(highlightAnswerChanges("", "New answer").every(part => part.added));
});

test("new feedback validates answer indexes and never changes marks for transcript warnings or rewrites", () => {
  const enhanced = { ...valid(), transcriptionWarning: true, rewrittenAnswers: [{ answerIndex: 0, text: "A stronger answer." }] };
  assert.equal(validateFeedback(enhanced, 1).score, validateFeedback(valid()).score);
  for (const rewrittenAnswers of [[], [{ answerIndex: 1, text: "Wrong index" }], [{ answerIndex: 0, text: "" }], [{ answerIndex: 0, text: "Valid" }, { answerIndex: 0, text: "Duplicate" }]]) {
    assert.throws(() => validateFeedback({ ...enhanced, rewrittenAnswers }, 1));
  }
  assert.throws(() => validateFeedback({ ...enhanced, transcriptionWarning: "yes" }, 1));
  assert.throws(() => validateFeedback(valid(), 1));
});
