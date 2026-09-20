import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const modules = new Map();
function load(file) {
  const path = file.endsWith(".ts") ? file : `${file}.ts`;
  if (modules.has(path)) return modules.get(path).exports;
  const compiled = { exports: {} };
  modules.set(path, compiled);
  const code = ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const require = (name) => name.startsWith("@/") ? load(resolve(root, name.slice(2))) : name.startsWith(".") ? load(resolve(dirname(path), name)) : createRequire(path)(name);
  new Function("require", "module", "exports", code)(require, compiled, compiled.exports);
  return compiled.exports;
}
const { emptyApplicant, readApplicant, questionEligible } = load(resolve(root, "utils/interviews/applicant-profile"));
const { selectStationQuestions } = load(resolve(root, "utils/interviews/station-question-selection"));
const { interviewerSpeech, answerConversation } = load(resolve(root, "app/phloemai/interview/_lib/interviewer-transcript"));
const { questionTransition, DONE_PROMPT } = load(resolve(root, "app/phloemai/interview/_lib/station-flow"));
const { standardInterviewUniversities, universityStationPresets, universityStationSlugs } = load(resolve(root, "app/phloemai/interview/_data/university-stations"));
const { interviewStations } = load(resolve(root, "app/phloemai/interview/_data/interview-stations"));

test("unknown and negative applicant facts exclude personal-history questions", () => {
  const prompts = [
    ["gapYear", "If you took a gap year, how did you use it?"],
    ["previousDegree", "What did you learn from your previous degree?"],
    ["workExperience", "What lessons did you take from your work experience or clinical exposure?"],
    ["volunteering", "What did your volunteering teach you?"],
    ["reapplicant", "How have you changed since your last application?"],
    ["international", "As an international applicant, what attracts you to the NHS?"],
    ["careerChanger", "How has your previous career influenced your decision?"],
  ];
  for (const [field, text] of prompts) {
    assert.equal(questionEligible(text), false, text);
    assert.equal(questionEligible(text, { ...emptyApplicant, [field]: false }), false, text);
    assert.equal(questionEligible(text, { ...emptyApplicant, [field]: true }), true, text);
  }
  assert.equal(questionEligible("What did you learn from your previous degree?", readApplicant({ entryRoute: "graduate" })), false);
  assert.equal(questionEligible("What interests you about this medical degree?"), true);
  assert.equal(questionEligible("How would you respond if a patient asked about their degree of pain?"), true);
});

test("randomised station selection never restores unconfirmed questions to fill a station", () => {
  let confirmedGapQuestions = 0;
  for (let seed = 0; seed < 200; seed++) {
    for (const station of ["why-medicine", "work-experience"]) {
      const selected = selectStationQuestions(station, 480, String(seed));
      assert.equal(selected.length, 3);
      assert.ok(selected.every((question) => questionEligible(question.text)));
    }
    confirmedGapQuestions += selectStationQuestions("work-experience", 480, String(seed), { ...emptyApplicant, gapYear: true }).filter((question) => /gap year/i.test(question.text)).length;
  }
  assert.ok(confirmedGapQuestions > 0);
});

test("university defaults only contain supported topics and academic interviews are excluded", () => {
  assert.ok(standardInterviewUniversities.every((university) => !["oxford", "cambridge"].includes(university.slug)));
  for (const preset of Object.values(universityStationPresets)) {
    assert.ok(preset.stations.length > 0 && preset.stations.length < interviewStations.length);
    assert.equal(new Set(preset.stations).size, preset.stations.length);
    assert.ok(preset.stations.every((slug) => interviewStations.some((station) => station.slug === slug)));
  }
  assert.notDeepEqual(universityStationSlugs("manchester"), universityStationSlugs("birmingham"));
  assert.deepEqual(universityStationSlugs("cambridge"), []);
  assert.deepEqual(universityStationSlugs("unknown"), []);
});

test("transcripts retain actual interviewer prompts without fabricating older conversation", () => {
  const answer = { question: "Why medicine?", answer: "I enjoy science. I also value care.", interviewerIntro: questionTransition(1), interviewerPrompts: [{ text: DONE_PROMPT, answerOffset: 16 }] };
  assert.deepEqual(interviewerSpeech({}, answer), { interviewerIntro: answer.interviewerIntro, interviewerPrompts: answer.interviewerPrompts });
  assert.deepEqual(answerConversation(answer).map((turn) => turn.speaker), ["You", "Interviewer", "You"]);
  assert.deepEqual(interviewerSpeech({ interviewerIntro: "invented", interviewerPrompts: [{ text: "invented", answerOffset: 0 }] }), { interviewerPrompts: [] });
  assert.deepEqual(answerConversation({ question: "Old question?", answer: "Old answer." }), [{ speaker: "You", text: "Old answer." }]);
});
