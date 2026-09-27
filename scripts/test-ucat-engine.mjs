import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const fs = require("node:fs");

require.extensions[".ts"] = function loadTypeScript(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

require.extensions[".tsx"] = require.extensions[".ts"];

function transpileAndLoad(relativePath) {
  const fileUrl = new URL(relativePath, import.meta.url);
  const fileRequire = createRequire(fileUrl);
  return fileRequire(fileUrl.pathname.replace(/^\/([A-Za-z]:)/, "$1"));
}

const {
  isUCATSection,
  getUCATSectionMeta,
} = transpileAndLoad("../app/medicforest/ucat/_lib/ucatQuestionBank.ts");

const {
  getAnswerScore,
  isAnswerCorrect,
  isAnswered,
  getEstimatedScaledScore,
  getSjtBand,
  isSameSjtScaleSide,
} = transpileAndLoad("../app/medicforest/ucat/_lib/ucatScoring.ts");

const { formatDisplayText } = transpileAndLoad("../app/medicforest/ucat/_components/UCATQuestionVisuals.tsx");

test("section validation and metadata recognize all 4 core UCAT sections", () => {
  for (const slug of ["vr", "dm", "qr", "sjt"]) {
    assert.equal(isUCATSection(slug), true);
    const meta = getUCATSectionMeta(slug);
    assert.ok(meta.title.length > 0);
    assert.ok(meta.bankTitle.length > 0);
  }
  assert.equal(isUCATSection("bmat"), false);
  assert.equal(isUCATSection("chemistry"), false);
  assert.equal(isUCATSection(""), false);
});

test("single-choice answers award 1 mark for exact match and 0 for incorrect/unanswered", () => {
  const question = {
    id: "vr-1",
    section: "vr",
    subtype: "vr-detail",
    title: "Detail check",
    stimulus: ["Passage text here."],
    question: "Which statement is true?",
    options: [
      { key: "A", text: "Option A" },
      { key: "B", text: "Option B" },
    ],
    answer: "A",
    explanation: "A is directly stated.",
  };

  assert.equal(isAnswered(question, "A"), true);
  assert.equal(isAnswered(question, undefined), false);
  assert.equal(isAnswered(question, ""), false);

  const correctResult = getAnswerScore(question, "A");
  assert.equal(correctResult.status, "correct");
  assert.equal(correctResult.points, 1);
  assert.equal(isAnswerCorrect(question, "A"), true);

  const wrongResult = getAnswerScore(question, "B");
  assert.equal(wrongResult.status, "incorrect");
  assert.equal(wrongResult.points, 0);
  assert.equal(isAnswerCorrect(question, "B"), false);

  const missingResult = getAnswerScore(question, undefined);
  assert.equal(missingResult.status, "unanswered");
  assert.equal(missingResult.points, 0);
});

test("SJT single-choice questions award 0.5 partial credit for same side of the 4-point scale", () => {
  const sjtQuestion = {
    id: "sjt-1",
    section: "sjt",
    subtype: "sjt-appropriateness",
    title: "Appropriateness",
    stimulus: ["Scenario text."],
    question: "How appropriate is this action?",
    options: [
      { key: "A", text: "A very appropriate thing to do" },
      { key: "B", text: "Appropriate, but not ideal" },
      { key: "C", text: "Inappropriate, but not awful" },
      { key: "D", text: "A very inappropriate thing to do" },
    ],
    answer: "A",
    explanation: "Action follows GMC guidance.",
  };

  assert.equal(isSameSjtScaleSide("A", "B"), true);
  assert.equal(isSameSjtScaleSide("C", "D"), true);
  assert.equal(isSameSjtScaleSide("A", "C"), false);
  assert.equal(isSameSjtScaleSide("B", "D"), false);

  // Exact match -> 1.0 point
  const fullMark = getAnswerScore(sjtQuestion, "A");
  assert.equal(fullMark.status, "correct");
  assert.equal(fullMark.points, 1);

  // Same side (B when answer is A) -> 0.5 point partial credit
  const partialMark = getAnswerScore(sjtQuestion, "B");
  assert.equal(partialMark.status, "partial");
  assert.equal(partialMark.points, 0.5);

  // Opposite side (C when answer is A) -> 0 points
  const zeroMark = getAnswerScore(sjtQuestion, "C");
  assert.equal(zeroMark.status, "incorrect");
  assert.equal(zeroMark.points, 0);
});

test("drag-order questions award 1 mark for exact sequence match and 0 otherwise", () => {
  const question = {
    id: "dm-drag-1",
    section: "dm",
    subtype: "dm-logic",
    title: "Ranking",
    stimulus: ["Arrange in order."],
    question: "Order items 1 to 3.",
    questionType: "drag-order",
    dragItems: [
      { id: "item-1", text: "First" },
      { id: "item-2", text: "Second" },
      { id: "item-3", text: "Third" },
    ],
    answerOrder: ["item-1", "item-2", "item-3"],
    explanation: "1 then 2 then 3.",
  };

  assert.equal(isAnswered(question, ["item-1", "item-2", "item-3"]), true);
  assert.equal(isAnswered(question, ["item-1"]), false);

  const perfect = getAnswerScore(question, ["item-1", "item-2", "item-3"]);
  assert.equal(perfect.status, "correct");
  assert.equal(perfect.points, 1);

  const swapped = getAnswerScore(question, ["item-2", "item-1", "item-3"]);
  assert.equal(swapped.status, "incorrect");
  assert.equal(swapped.points, 0);
});

test("DM yes/no multi-statement questions award 1 mark for 5/5 and 0.5 for 4/5 correct", () => {
  const question = {
    id: "dm-yn-1",
    section: "dm",
    subtype: "dm-yes-no",
    title: "Multi-statement Syllogisms",
    stimulus: ["Stem facts."],
    question: "Does each conclusion follow?",
    questionType: "yes-no",
    yesNoStatements: [
      { id: "s1", text: "Statement 1", answer: "Yes" },
      { id: "s2", text: "Statement 2", answer: "No" },
      { id: "s3", text: "Statement 3", answer: "Yes" },
      { id: "s4", text: "Statement 4", answer: "No" },
      { id: "s5", text: "Statement 5", answer: "Yes" },
    ],
    explanation: "Check each logically.",
  };

  // 5/5 correct -> 1 point
  const allCorrect = { s1: "Yes", s2: "No", s3: "Yes", s4: "No", s5: "Yes" };
  assert.equal(isAnswered(question, allCorrect), true);
  const fullScore = getAnswerScore(question, allCorrect);
  assert.equal(fullScore.status, "correct");
  assert.equal(fullScore.points, 1);

  // 4/5 correct (1 wrong) -> 0.5 partial point
  const oneWrong = { s1: "Yes", s2: "No", s3: "Yes", s4: "No", s5: "No" };
  const partialScore = getAnswerScore(question, oneWrong);
  assert.equal(partialScore.status, "partial");
  assert.equal(partialScore.points, 0.5);

  // 3/5 correct (2 wrong) -> 0 points
  const twoWrong = { s1: "Yes", s2: "No", s3: "No", s4: "Yes", s5: "Yes" };
  const zeroScore = getAnswerScore(question, twoWrong);
  assert.equal(zeroScore.status, "incorrect");
  assert.equal(zeroScore.points, 0);
});

test("scaled score calculator scales strictly within 300 to 900 rounded to 10", () => {
  assert.equal(getEstimatedScaledScore(0, 44), 300);
  assert.equal(getEstimatedScaledScore(44, 44), 900);
  assert.equal(getEstimatedScaledScore(22, 44), 600);
  assert.equal(getEstimatedScaledScore(0, 0), 300);

  // Monotonicity check
  let prev = 300;
  for (let points = 0; points <= 36; points += 1) {
    const scaled = getEstimatedScaledScore(points, 36);
    assert.ok(scaled >= prev, `Score must be monotonic: ${scaled} >= ${prev}`);
    assert.ok(scaled >= 300 && scaled <= 900, `Score must be within 300-900: ${scaled}`);
    assert.equal(scaled % 10, 0, `Score must be a multiple of 10: ${scaled}`);
    prev = scaled;
  }
});

test("SJT band calculator converts percentages accurately into Bands 1 to 4", () => {
  assert.equal(getSjtBand(75, 100), 1);
  assert.equal(getSjtBand(100, 100), 1);
  assert.equal(getSjtBand(60, 100), 2);
  assert.equal(getSjtBand(74.9, 100), 2);
  assert.equal(getSjtBand(40, 100), 3);
  assert.equal(getSjtBand(59.9, 100), 3);
  assert.equal(getSjtBand(39.9, 100), 4);
  assert.equal(getSjtBand(0, 100), 4);
});

test("formatDisplayText formats exponent units to clean superscript notation", () => {
  assert.equal(formatDisplayText("Area is 45 mm^2"), "Area is 45 mm²");
  assert.equal(formatDisplayText("Volume is 120 cm^3"), "Volume is 120 cm³");
  assert.equal(formatDisplayText("Distance in km^2 and m^3"), "Distance in km² and m³");
  assert.equal(formatDisplayText("Standard text without units"), "Standard text without units");
});
