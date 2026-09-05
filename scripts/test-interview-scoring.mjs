import assert from "node:assert/strict";
import { test } from "node:test";
import { interviewPercentage, validateFeedback } from "../utils/interviews/scoring.ts";

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

test("higher percentages need successively more rubric evidence", () => {
  const thresholds = [50, 60, 70, 80, 90, 98].map((target) => {
    for (let raw = 0; raw <= 100; raw += 0.01) if (interviewPercentage(raw) >= target) return raw;
    throw new Error("Unreachable score");
  });
  assert.ok(thresholds[4] - thresholds[3] > thresholds[3] - thresholds[2]);
  assert.ok(thresholds[3] - thresholds[2] > thresholds[2] - thresholds[1]);
});

const valid = () => ({ summary: "A clear and reflective answer.", strengths: ["Uses a specific example."], improvements: ["Explain what changed in your understanding."], rubric: Array.from({ length: 5 }, () => ({ score: 60, reason: "Relevant evidence with room for deeper reflection." })) });

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
