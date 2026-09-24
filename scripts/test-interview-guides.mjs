import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";
import ts from "typescript";

function loadData(relativePath) {
  const compiledModule = { exports: {} };
  const javascript = ts.transpileModule(readFileSync(resolve(relativePath), "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  new Function("module", "exports", javascript)(compiledModule, compiledModule.exports);
  return compiledModule.exports;
}
const { interviewGuides, searchInterviewGuides, guidesForInterviewQuestion } = loadData("app/medicforest/interview/_data/interviewGuides.ts");
const { INTERVIEW_QUESTIONS, INTERVIEW_QUESTION_SUBCATEGORIES, INTERVIEW_QUESTION_CATEGORIES } = loadData("app/medicforest/interview/_data/interviewQuestionBank.ts");

test("every question-bank subcategory and named topic has a guide", () => {
  for (const category of INTERVIEW_QUESTION_CATEGORIES) assert.ok(interviewGuides.some((guide) => guide.category === category), category);
  for (const subcategory of INTERVIEW_QUESTION_SUBCATEGORIES) assert.ok(interviewGuides.some((guide) => guide.subcategories.includes(subcategory)), subcategory);
  for (const topic of new Set(INTERVIEW_QUESTIONS.map((question) => question.sourceTopic).filter(Boolean))) assert.ok(interviewGuides.some((guide) => guide.topics.includes(topic)), topic);
  for (const question of INTERVIEW_QUESTIONS) assert.ok(guidesForInterviewQuestion(question).length > 0, question.id);
});

test("search finds station names and hot-topic aliases with punctuation and combined filters", () => {
  assert.ok(searchInterviewGuides("Why Medicine?").some((guide) => guide.slug === "why-medicine"));
  assert.ok(searchInterviewGuides("Bawa Garba").some((guide) => guide.slug === "bawa-garba-case"));
  assert.ok(searchInterviewGuides("Ozempic").some((guide) => guide.slug === "weight-loss-medicines"));
  assert.ok(searchInterviewGuides("GLP-1").some((guide) => guide.slug === "weight-loss-medicines"));
  assert.ok(searchInterviewGuides("bawa", "Hot Topics & Current Affairs").length > 0);
  assert.equal(searchInterviewGuides("bawa", "Personal & Motivation").length, 0);
  assert.equal(searchInterviewGuides("unmatchedtopicxyz").length, 0);
  assert.equal(searchInterviewGuides("   ").length, interviewGuides.length);
});

test("exact topic metadata points to a topic-specific guide before broad category guides", () => {
  const question = INTERVIEW_QUESTIONS.find((item) => item.sourceTopic === "WEIGHT-LOSS MEDICATIONS / GLP-1 & GIP MEDICINES");
  assert.equal(guidesForInterviewQuestion(question)[0].slug, "weight-loss-medicines");
  assert.equal(new Set(interviewGuides.map((guide) => guide.slug)).size, interviewGuides.length);
  assert.ok(interviewGuides.find((guide) => guide.slug === "why-medicine").featured);
  assert.ok(interviewGuides.find((guide) => guide.slug === "bawa-garba-case").featured);
});

test("guide public sources are official and public university data contains no prep-company links", () => {
  for (const guide of interviewGuides) {
    for (const source of guide.sources) assert.match(new URL(source.url).hostname, /^(www\.)?(gmc-uk\.org|nhs\.uk|england\.nhs\.uk|gov\.uk|nice\.org\.uk|who\.int|organdonation\.nhs\.uk)$/);
  }
  const { interviewUniversities } = loadData("app/medicforest/interview/_data/universities.ts");
  for (const university of interviewUniversities) {
    assert.doesNotMatch(university.timingNote, /theukcatpeople|medify|medentry/i);
    assert.doesNotMatch(university.sourceUrl, /theukcatpeople|medify|medentry/i);
  }
});
