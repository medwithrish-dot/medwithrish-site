import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const modules = new Map();
function load(file) {
  const filename = file.endsWith(".ts") ? file : `${file}.ts`;
  if (modules.has(filename)) return modules.get(filename).exports;
  const compiled = { exports: {} };
  modules.set(filename, compiled);
  const output = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function("require", "module", "exports", output)(
    name => load(name.startsWith("@/") ? resolve(root, name.slice(2)) : resolve(dirname(filename), name)), compiled, compiled.exports,
  );
  return compiled.exports;
}

const { interviewSetupStations, interviewStations } = load(resolve(root, "app/medicforest/interview/_data/interview-stations.ts"));
const { getStationReviewGuidance } = load(resolve(root, "app/medicforest/interview/_lib/station-review.ts"));
const { categoryRubric, findReviewQuestion, getQuestionMarkScheme } = load(resolve(root, "app/medicforest/interview/_lib/question-review.ts"));

test("every station has a specific framework and the shared question-bank rubric", () => {
  assert.equal(interviewStations.length, 9);
  const frameworks = new Set();
  for (const station of interviewStations) {
    const guidance = getStationReviewGuidance(station.slug);
    assert.ok(guidance, station.slug);
    assert.ok(guidance.framework.length >= 3, station.slug);
    for (const stage of guidance.framework) {
      assert.ok(stage.title.trim(), station.slug);
      assert.ok(stage.items.length > 0 && stage.items.every(item => item.trim()), station.slug);
    }
    assert.deepEqual(guidance.rubric.map(group => group.title), ["General", "Start", "Middle", "End"]);
    assert.equal(guidance.rubric, categoryRubric[guidance.category], "Reviews and question practice must share one rubric source");
    assert.match(guidance.sourceLabel, /MedicForest practice/);
    frameworks.add(JSON.stringify(guidance.framework));
  }
  assert.equal(frameworks.size, 9, "Stations should not fall back to one generic model framework");
});

test("the interview builder shows one ethical dilemma and no group station", () => {
  assert.equal(interviewSetupStations.filter((station) => station.lobbyTitle === "Ethical dilemma").length, 1);
  assert.equal(interviewSetupStations.some((station) => station.lobbyTitle === "Group station"), false);
});

test("saved attempts with legacy station names resolve while unknown stations stay unavailable", () => {
  assert.deepEqual(getStationReviewGuidance("motivation-question"), getStationReviewGuidance("why-medicine"));
  assert.deepEqual(getStationReviewGuidance("ethics-ai-station"), getStationReviewGuidance("disability-in-medicine"));
  for (const slug of ["", "unrecognised", "constructor", "toString", "__proto__"]) {
    assert.equal(getStationReviewGuidance(slug), null);
  }
});

const { INTERVIEW_QUESTIONS } = load(resolve(root, "app/medicforest/interview/_data/interviewQuestionBank.ts"));
const { questionMarkingPoints } = load(resolve(root, "app/medicforest/interview/_data/question-marking-points.ts"));
const { interviewStimuli, getQuestionStimulus } = load(resolve(root, "app/medicforest/interview/_data/interview-stimuli.ts"));
const { assessmentGuidance } = load(resolve(root, "utils/interviews/assessment-guidance.ts"));
const { FOLLOW_UP_STATIONS, followUpsEnabled } = load(resolve(root, "app/medicforest/interview/_lib/station-flow.ts"));
const { questionIdForText, selectStationQuestions } = load(resolve(root, "utils/interviews/station-question-selection.ts"));

test("all 561 questions have independently authored content, with no category or question-text substitution", () => {
  assert.equal(INTERVIEW_QUESTIONS.length, 561);
  assert.equal(Object.keys(questionMarkingPoints).length, 561);
  const content = new Set();
  const middles = new Set();
  for (const question of INTERVIEW_QUESTIONS) {
    const groups = getQuestionMarkScheme(question);
    assert.deepEqual(groups.map(group => group.title), ["General", "Start", "Middle", "End", "Mistakes"], question.id);
    assert.ok(groups.every(group => group.items.length && group.items.every(item => item.trim().length > 10)), question.id);
    assert.ok(groups.find(group => group.title === "Middle").items.length >= 2, question.id);
    const specific = groups.filter(group => group.title !== "General");
    assert.ok(!JSON.stringify(specific).includes(question.text), "Repeating the question does not make a unique markscheme");
    content.add(JSON.stringify(specific));
    middles.add(JSON.stringify(groups.find(group => group.title === "Middle").items));
  }
  assert.equal(content.size, 561);
  assert.equal(middles.size, 561, "Uniqueness must extend to substantive marking points");
  assert.throws(() => getQuestionMarkScheme({ ...INTERVIEW_QUESTIONS[0], id: "iq-99-001-new" }), /Missing question markscheme/);
});

test("supplied examples retain their structure and do not mutate shared or future rubrics", () => {
  const before = structuredClone(getStationReviewGuidance("why-medicine").rubric);
  const question = INTERVIEW_QUESTIONS[0];
  const groups = getQuestionMarkScheme(question);
  assert.ok(groups[0].items.includes("Genuine and personal motivation"));
  assert.ok(groups.find(group => group.title === "Mistakes").items.includes("Idealising medicine"));
  groups[0].items.push("Question-only note");
  assert.ok(!getQuestionMarkScheme(question)[0].items.includes("Question-only note"));
  assert.deepEqual(getStationReviewGuidance("why-medicine").rubric, before);
});

test("every prepared PNG is mapped to a real question with accessible source facts", () => {
  const files = readdirSync(resolve(root, "public/medicforest/interview-stimuli")).filter(name => name.endsWith(".png")).sort();
  assert.equal(interviewStimuli.length, 27);
  assert.deepEqual(interviewStimuli.map(item => `${item.id}.png`).sort(), files);
  for (const stimulus of interviewStimuli) {
    assert.ok(INTERVIEW_QUESTIONS.some(question => question.id === stimulus.id), stimulus.id);
    assert.ok(stimulus.description.length > 200, stimulus.id);
    const png = readFileSync(resolve(root, `public${stimulus.src}`));
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    assert.ok(png.readUInt32BE(16) > png.readUInt32BE(20), stimulus.id);
  }
  assert.equal(getQuestionStimulus(null), null);
  assert.equal(getQuestionStimulus("unknown"), null);
});

test("every visual question names the subject shown in its paired image", () => {
  const expectedTerms = {
    "iq-18-001-data-stations": ["gp", "appointment"],
    "iq-18-002-data-stations": ["smoking", "cessation"],
    "iq-18-003-data-stations": ["exercise", "wellbeing"],
    "iq-18-004-data-stations": ["diabetes", "programme"],
    "iq-18-005-data-stations": ["ward", "discharge"],
    "iq-18-006-graphs-and-trends": ["patient satisfaction"],
    "iq-18-007-graphs-and-trends": ["vaccination"],
    "iq-18-008-graphs-and-trends": ["sleep", "exam"],
    "iq-18-009-data-interpretation": ["heart-event", "new treatment"],
    "iq-18-010-data-interpretation": ["recovery", "programme"],
    "iq-18-011-critical-appraisal": ["energy-drink"],
    "iq-18-012-critical-appraisal": ["reminder-text"],
    "iq-18-013-article-analysis": ["asthma-app"],
    "iq-18-014-article-analysis": ["berry", "cancer"],
    "iq-18-015-article-analysis": ["virtual reality", "anatomy"],
    "iq-19-001-group-discussion": ["healthcare improvement", "two"],
    "iq-19-002-group-tasks": ["nhs", "£10 million"],
    "iq-19-003-group-tasks": ["five items", "mountain"],
    "iq-19-008-group-tasks": ["four patient presentations"],
    "iq-20-001-prioritisation-stations": ["five people"],
    "iq-20-002-prioritisation-stations": ["three demands"],
    "iq-20-003-prioritisation-stations": ["team inbox"],
    "iq-20-004-prioritisation-stations": ["£5 million", "whole proposals"],
    "iq-20-005-prioritisation-stations": ["four public-health options"],
    "iq-20-007-prioritisation-stations": ["diary"],
    "iq-20-008-prioritisation-stations": ["patient-safety concern"],
    "iq-20-009-prioritisation-stations": ["hospital-corridor emergency"],
  };
  for (const stimulus of interviewStimuli) {
    const question = INTERVIEW_QUESTIONS.find(item => item.id === stimulus.id);
    assert.ok(question, stimulus.id);
    for (const term of expectedTerms[stimulus.id]) assert.match(question.text.toLowerCase(), new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${stimulus.id}: ${term}`);
  }
});

test("older saved visual-question wording still resolves to the correct image", () => {
  const oldText = "How might you explain these results to a patient?";
  assert.equal(questionIdForText(oldText), "iq-18-009-data-interpretation");
  assert.equal(getQuestionStimulus(findReviewQuestion(null, oldText)?.id)?.id, "iq-18-009-data-interpretation");
});

test("image marking handles changed denominators, misleading headlines and budget constraints", () => {
  const scheme = prefix => JSON.stringify(getQuestionMarkScheme(INTERVIEW_QUESTIONS.find(question => question.id.startsWith(prefix))));
  assert.match(scheme("iq-18-001"), /13-day peak in 2022/);
  assert.match(scheme("iq-18-002"), /48\/150 = 32%/);
  assert.match(scheme("iq-18-004"), /£215,000/);
  assert.match(scheme("iq-18-006"), /4 percentage-point difference/);
  assert.match(scheme("iq-18-009"), /5 fewer/);
  assert.match(scheme("iq-18-012"), /too small for a firm claim/);
  assert.match(scheme("iq-18-014"), /12\/200 = 6% versus 20\/400 = 5%/);
  assert.match(scheme("iq-20-004"), /different measures/);
});

test("visual data markschemes use applicant-friendly language", () => {
  for (const question of INTERVIEW_QUESTIONS.filter(question => question.sourceSection === 18)) {
    const scheme = JSON.stringify(getQuestionMarkScheme(question));
    assert.doesNotMatch(scheme, /\b(?:NNT|denominator|attrition|confounding|non-significance)\b/i, question.id);
  }
});

test("AI marking receives the exact source facts and criteria, including legacy text lookup", () => {
  const question = INTERVIEW_QUESTIONS.find(question => question.id.startsWith("iq-18-014"));
  const [guidance] = assessmentGuidance([{ question: question.text, id: question.id }]);
  assert.equal(guidance.stimulus.facts, getQuestionStimulus(question.id).description);
  assert.deepEqual(guidance.markingSections, getQuestionMarkScheme(question));
  assert.deepEqual(assessmentGuidance([{ question: question.text }]), [guidance]);
  assert.equal(assessmentGuidance([{ question: "Unrecognised historical prompt" }]).length, 0);
  assert.equal(assessmentGuidance([{ question: "Older wording", id: question.id }])[0].questionId, question.id);
});

test("every data interview has visuals and all 15 data sources can be selected", () => {
  const { findReviewQuestion } = load(resolve(root, "app/medicforest/interview/_lib/question-review.ts"));
  for (const text of interviewStations.find(station => station.slug === "data-analysis").questions) {
    assert.ok(getQuestionStimulus(findReviewQuestion(null, text)?.id), "The preview also needs a matching image");
  }
  const selected = new Set();
  for (let seed = 0; seed < 100; seed++) {
    const questions = selectStationQuestions("data-analysis", 480, String(seed));
    assert.equal(questions.length, 3);
    assert.equal(new Set(questions.map(question => question.id)).size, 3);
    for (const question of questions) {
      assert.ok(getQuestionStimulus(question.id), question.id);
      selected.add(question.id);
    }
  }
  assert.equal(selected.size, 15);
});

test("probing is owner-enabled for every current station but never unknown slugs", () => {
  assert.deepEqual(FOLLOW_UP_STATIONS, interviewStations.map(station => station.slug));
  for (const slug of interviewStations.map(station => station.slug)) assert.equal(followUpsEnabled(slug), true);
  for (const slug of ["unknown", "constructor"]) assert.equal(followUpsEnabled(slug), false);
});
