import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const compiled = ts.transpileModule(
  readFileSync(new URL("../app/phloemai/_lib/ucatQuestionQualityGate.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText;
const compiledModule = { exports: {} };
new Function("module", "exports", compiled)(compiledModule, compiledModule.exports);
const { reviewUCATQuestionBank } = compiledModule.exports;

const baseQuestion = {
  id: "test-question", section: "dm", subtype: "dm-logic", title: "Practice",
  stimulus: ["Four people are in a queue."], question: "Who is first?",
  explanation: "Alex is first because the remaining people must all stand behind Alex.",
  options: ["Alex", "Blair", "Charlie", "Drew"].map((text, index) => ({ key: "ABCD"[index], text })),
  answer: "A",
};
function review(question) {
  const bank = { vr: [], dm: [], qr: [], sjt: [] };
  bank[question.section] = [question];
  return reviewUCATQuestionBank({ auditedBank: bank, draftBank: { vr: [], dm: [], qr: [], sjt: [] } }).summary[question.section];
}

test("single-choice answers require unique keys and non-empty option text", () => {
  assert.equal(review(baseQuestion).accepted, 1);
  const duplicate = structuredClone(baseQuestion);
  duplicate.options[1].key = "A";
  assert.equal(review(duplicate).rejectedByReason["invalid-options"], 1);
  const empty = structuredClone(baseQuestion);
  empty.options[1].text = "   ";
  assert.equal(review(empty).rejectedByReason["invalid-options"], 1);
});

test("SJT rating questions require the complete scale", () => {
  const question = { ...baseQuestion, section: "sjt", subtype: "sjt-importance",
    options: ["Very important", "Important", "Of minor importance"].map((text, index) => ({ key: "ABC"[index], text })),
  };
  assert.equal(review(question).rejectedByReason["invalid-sjt-scale"], 1);
});

test("drag-order answers must be a permutation of every available item", () => {
  const question = { ...baseQuestion, questionType: "drag-order",
    dragItems: [{ id: "first", text: "First action" }, { id: "second", text: "Second action" }],
    answerOrder: ["first", "second"],
  };
  assert.equal(review(question).accepted, 1);
  for (const answerOrder of [["first", "first"], ["first"], ["first", "missing"]]) {
    assert.equal(review({ ...question, answerOrder }).rejectedByReason["invalid-answer"], 1);
  }
});

test("most/least answers must name two different available actions", () => {
  const question = { ...baseQuestion, questionType: "most-least",
    actionItems: [{ id: "first", text: "First action" }, { id: "second", text: "Second action" }],
    answerSlots: { most: "first", least: "second" },
  };
  assert.equal(review(question).accepted, 1);
  for (const least of ["first", "missing"]) {
    assert.equal(review({ ...question, answerSlots: { most: "first", least } }).rejectedByReason["invalid-answer"], 1);
  }
});
