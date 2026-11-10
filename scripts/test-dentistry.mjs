import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const cache = new Map();
function load(file) {
  const path = resolve(root, file);
  if (cache.has(path)) return cache.get(path);
  const mod = { exports: {} };
  cache.set(path, mod.exports);
  const code = ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("require", "module", "exports", code)(name => {
    if (name.startsWith("@/")) return load(`${name.slice(2)}.ts`);
    if (name.startsWith(".")) return load(resolve(dirname(path), `${name}.ts`));
    return require(name);
  }, mod, mod.exports);
  return mod.exports;
}
const dental = load("app/medicforest/interview/_data/dentistry-question-bank.ts");
const medicine = load("app/medicforest/interview/_data/interviewQuestionBank.ts");
const selection = load("utils/interviews/station-question-selection.ts");
const review = load("app/medicforest/interview/_lib/question-review.ts");
const platform = load("utils/interviews/platform.ts");
const progress = load("utils/interviews/question-bank-progress.ts");
const catalogue = load("utils/interviews/catalogue.ts");

test("every dentistry question has its own usable markscheme and distinct identity", () => {
  assert.equal(dental.DENTISTRY_QUESTIONS.length, 110);
  const medicineIds = new Set(medicine.INTERVIEW_QUESTIONS.map(q => q.id));
  assert.equal(new Set(dental.DENTISTRY_QUESTIONS.map(q => q.id)).size, 110);
  assert.equal(new Set(dental.DENTISTRY_QUESTIONS.map(q => q.text)).size, 110);
  for (const question of dental.DENTISTRY_QUESTIONS) {
    assert.match(question.id, /^dq-/);
    assert.ok(!medicineIds.has(question.id));
    assert.equal(review.findReviewQuestion(question.id, question.text)?.id, question.id);
    const sections = review.getQuestionMarkScheme(question);
    assert.ok(sections.some(s => s.title === "Mistakes"));
    assert.ok(sections.filter(s => s.title !== "Mistakes").flatMap(s => s.items).length >= 4);
    assert.ok(sections.every(s => s.items.every(point => point.length > 15)));
  }
});

test("shared selector only draws dental questions for all dentistry stations and seeds", () => {
  const ids = new Set(dental.DENTISTRY_QUESTIONS.map(q => q.id));
  for (const station of dental.DENTISTRY_STATIONS) {
    const seen = new Set();
    for (let seed = 0; seed < 15; seed++) {
      const selected = selection.selectStationQuestions(station.slug, 480, String(seed), undefined, "dentistry");
      assert.equal(selected.length, 3, station.slug);
      for (const question of selected) {
        assert.ok(ids.has(question.id));
        assert.ok(question.tags.includes(station.slug));
        seen.add(question.id);
      }
    }
    assert.ok(seen.size > 3, `${station.slug} should vary between sessions`);
  }
  assert.deepEqual(selection.selectStationQuestions("why-medicine", 480, "test", undefined, "dentistry"), []);
  assert.deepEqual(selection.selectStationQuestions("data-analysis", 480, "test", undefined, "dentistry"), []);
  assert.deepEqual(selection.selectStationQuestions("panel-interview", 480, "test", undefined, "dentistry"), []);
  assert.deepEqual(selection.selectStationQuestions("why-dentistry", 480, "test"), []);
});

test("identical general wording cannot change medicine question IDs or completion", () => {
  for (const question of medicine.INTERVIEW_QUESTIONS) {
    assert.equal(selection.questionIdForText(question.text), question.id);
  }
  for (const question of dental.DENTISTRY_QUESTIONS) {
    assert.equal(selection.questionIdForText(question.text, "dentistry"), question.id);
  }
  const rows = [{ question_id: dental.DENTISTRY_QUESTIONS[0].id, status: "completed" }, { question_id: medicine.INTERVIEW_QUESTIONS[0].id, status: "review" }];
  assert.equal(progress.deriveInterviewQuestionProgress(rows).completed, 0);
  const result = progress.deriveInterviewQuestionProgress(rows, "dentistry");
  assert.equal(result.completed, 1);
  assert.equal(result.review, 0);
  assert.equal(result.total, 110);
});

test("routes and university presets remain inside their platform", () => {
  assert.equal(platform.preparationTable("medicine"), "interview_preparation_profiles");
  assert.equal(platform.preparationTable("dentistry"), "interview_dentistry_preparation_profiles");
  const { validatePreparation } = load("utils/interviews/preparation-validation.ts");
  const profile = { experience: "starting", focusThemes: [], weeklyTarget: 3, targets: [{ universitySlug: "imperial", interviewDate: null }] };
  assert.equal(validatePreparation(profile).targets[0].universitySlug, "imperial", "legacy medicine aliases remain accepted");
  assert.throws(() => validatePreparation(profile, "dentistry"));
  const { medicForestPublicHref } = load("utils/medicforest/public-navigation.ts");
  for (const path of ["/dentistry/interviews/dashboard", "/medicforest/dentistry/interviews/dashboard"]) {
    assert.equal(platform.platformFromPath(path), "dentistry");
    assert.ok(medicForestPublicHref(path, "/medicforest/interview/reports/123").includes("/dentistry/interviews/reports/123"));
  }
  assert.equal(medicForestPublicHref("/interviews/dashboard", "/medicforest/interview/question-bank"), "/interviews/question-bank");
  assert.equal(platform.interviewApiHref("/api/interviews/session?attempt=123", "dentistry"), "/api/interviews/session?attempt=123&platform=dentistry");
  assert.equal(platform.requestInterviewPlatform(new Request("https://example.com/api/interviews/session")), "medicine");
  assert.throws(() => platform.requestInterviewPlatform(new Request("https://example.com/api/interviews/session?platform=other")));
  for (const university of catalogue.universitiesForPlatform("dentistry")) {
    assert.equal(university.timingStatus, "practice");
    for (const slug of catalogue.platformUniversityStations("dentistry", university.slug)) {
      assert.ok(dental.DENTISTRY_STATIONS.some(station => station.slug === slug));
    }
  }
});

test("dentistry guidance reaches the same assessment pipeline without medicine rubric substitution", () => {
  const { assessmentGuidance } = load("utils/interviews/assessment-guidance.ts");
  const question = dental.DENTISTRY_QUESTIONS[0];
  const guidance = assessmentGuidance([{ question: question.text, id: question.id }]);
  assert.equal(guidance[0].questionId, question.id);
  assert.deepEqual(guidance[0].markingSections, dental.DENTISTRY_MARK_SCHEMES[question.id]);
  assert.ok(guidance[0].checklistPoints.every(p => !p.id.startsWith("Mistakes")));
});
