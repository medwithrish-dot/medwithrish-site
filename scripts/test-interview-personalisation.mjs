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
const { getQuestionStimulus } = load(resolve(root, "app/medicforest/interview/_data/interview-stimuli"));
const { interviewerSpeech, answerConversation } = load(resolve(root, "app/medicforest/interview/_lib/interviewer-transcript"));
const { questionTransition, DONE_PROMPT } = load(resolve(root, "app/medicforest/interview/_lib/station-flow"));
const { standardInterviewUniversities, universityStationPresets, universityStationSlugs, universityUsesPanelFlow } = load(resolve(root, "app/medicforest/interview/_data/university-stations"));
const { interviewSetupStations, interviewStations } = load(resolve(root, "app/medicforest/interview/_data/interview-stations"));

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

test("data interpretation asks three linked questions about one stimulus", () => {
  const selected = selectStationQuestions("data-analysis", 300, "data-station-seed");
  assert.deepEqual(selected.map((question) => question.text), [
    "Describe the main changes in GP appointment waits shown here. Use the figures to compare the two districts and mention any limits to that comparison.",
    "Suggest a possible reason for the changing appointment waits. What else could produce the same pattern, and why can this graph alone not tell us the cause?",
    "How would you check your explanation for the appointment-wait pattern? Describe the information you would collect and a fair comparison you could make.",
  ]);
  assert.equal(new Set(selected.map((question) => getQuestionStimulus(question.id)?.src)).size, 1);
  assert.equal(getQuestionStimulus(selected[0].id)?.id, "iq-18-001-data-stations");
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
  const setupSlugs = new Set(interviewSetupStations.map((station) => station.slug));
  for (const university of standardInterviewUniversities) {
    assert.ok(universityStationSlugs(university.slug).every((slug) => universityUsesPanelFlow(university.slug) ? slug === "panel-interview" : setupSlugs.has(slug)));
  }
});

test("transcripts retain actual interviewer prompts without fabricating older conversation", () => {
  const answer = { question: "Why medicine?", answer: "I enjoy science. I also value care.", interviewerIntro: questionTransition(1), interviewerPrompts: [{ text: DONE_PROMPT, answerOffset: 16 }] };
  assert.deepEqual(interviewerSpeech({}, answer), { interviewerIntro: answer.interviewerIntro, interviewerPrompts: answer.interviewerPrompts });
  assert.deepEqual(answerConversation(answer).map((turn) => turn.speaker), ["You", "Interviewer", "You"]);
  assert.deepEqual(interviewerSpeech({ interviewerIntro: "invented", interviewerPrompts: [{ text: "invented", answerOffset: 0 }] }), { interviewerPrompts: [] });
  assert.deepEqual(answerConversation({ question: "Old question?", answer: "Old answer." }), [{ speaker: "You", text: "Old answer." }]);
});


test("panel discussions mix linked topic groups without image tasks or probes", () => {
  const { followUpsEnabled } = load(resolve(root, "app/medicforest/interview/_lib/station-flow"));
  assert.equal(followUpsEnabled("panel-interview"), false);
  const starts = new Set();
  for (let seed = 0; seed < 50; seed++) {
    const selected = selectStationQuestions("panel-interview", 900, String(seed), emptyApplicant);
    assert.equal(selected.length, 6);
    assert.equal(new Set(selected.map(question => question.id)).size, 6);
    starts.add(selected[0].subcategory);
    assert.ok(new Set(selected.map(question => question.subcategory)).size >= 5);
    assert.ok(selected.some(question => question.category === "Ethics & Professionalism"));
    assert.ok(["Strengths, Weaknesses & Resilience", "Personal Insight"].includes(selected.at(-1).subcategory));
    assert.ok(selected.every(question => !getQuestionStimulus(question.id) && questionEligible(question.text, emptyApplicant)));
    assert.ok(selected.every(question => !/\b(?:graph|chart|image|table|provided|shown)\b/i.test(question.text)));
    assert.equal(selectStationQuestions("panel-interview", 1200, String(seed), emptyApplicant).length, 8);
  }
  assert.ok(starts.size >= 3, "Panel order must vary");
});


test("extended mixed discussions use full-length varied question flows", () => {
  for (const [slug, seconds, count] of [["dundee", 1800, 12], ["southampton", 1200, 8]]) {
    assert.ok(universityStationSlugs(slug).every(station => station === "panel-interview"));
    for (let seed = 0; seed < 40; seed++) {
      const selected = selectStationQuestions("panel-interview", seconds, String(seed), emptyApplicant);
      assert.equal(selected.length, count);
      assert.equal(new Set(selected.map(question => question.id)).size, count);
      assert.ok(new Set(selected.map(question => question.subcategory)).size >= 5);
      assert.ok(selected.every(question => questionEligible(question.text, emptyApplicant) && !getQuestionStimulus(question.id)));
    }
  }
  for (const slug of ["sheffield", "edinburgh", "hull-york", "kent-medway", "swansea"]) {
    assert.equal(universityUsesPanelFlow(slug), false);
    assert.ok(universityStationSlugs(slug).every(station => station !== "panel-interview"));
  }
});

test("panels rotate skills and topic order instead of repeating teamwork and communication", () => {
  const skills = new Set();
  const orders = new Set();
  let panelsWithoutTeamworkOrCommunication = 0;
  for (let seed = 0; seed < 160; seed++) {
    const selected = selectStationQuestions("panel-interview", 900, `variety-${seed}`, emptyApplicant);
    assert.deepEqual(selected, selectStationQuestions("panel-interview", 900, `variety-${seed}`, emptyApplicant));
    selected.forEach(question => skills.add(question.subcategory));
    orders.add(selected.map(question => question.category).join("/"));
    if (selected.every(question => !["Teamwork", "Communication & Empathy", "Working in Healthcare Teams"].includes(question.subcategory))) panelsWithoutTeamworkOrCommunication++;
  }
  for (const topic of ["Leadership", "Giving & Receiving Feedback", "Conflict & Difficult Conversations", "Prioritisation Stations", "Critical Thinking", "Strengths, Weaknesses & Resilience"]) {
    assert.ok(skills.has(topic), `Panel selection must reach ${topic}`);
  }
  assert.ok(orders.size > 12, "Topic order must vary beyond four fixed routes");
  assert.ok(panelsWithoutTeamworkOrCommunication > 30, "Teamwork and communication must be optional topics");
});


test("Dundee lobby replaces station building and stale choices with mixed discussions", () => {
  const filename = resolve(root, "app/medicforest/interview/_components/AIInterviewSetup.tsx");
  const output = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const compiled = { exports: {} };
  const jsx = (type, props) => ({ type, props });
  const require = name => {
    if (name === "react") return { useState: value => [value, () => {}] };
    if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
    if (name.startsWith("../_data/")) return load(resolve(dirname(filename), name));
    if (name.endsWith("why-medicine-challenge")) return { WHY_MEDICINE_SECONDS: 180 };
    if (name.endsWith(".module.css")) return { default: {} };
    return {};
  };
  new Function("require", "module", "exports", output)(require, compiled, compiled.exports);
  const starts = [];
  const tree = compiled.exports.AIInterviewSetup({ initialUniversitySlug: "dundee", initialPlan: { mode: "university", universitySlug: "dundee", stationSlugs: ["ethics-confidentiality"] }, devices: {}, onStart: (plan, preview) => starts.push({ plan, preview }) });
  const nodes = node => Array.isArray(node) ? node.flatMap(nodes) : node && typeof node === "object" ? [node, ...nodes(node.props?.children)] : [];
  const text = node => Array.isArray(node) ? node.map(text).join(" ") : node && typeof node === "object" ? text(node.props?.children) : typeof node === "string" || typeof node === "number" ? String(node) : "";
  assert.match(text(tree), /Your panel interview/);
  assert.match(text(tree).replace(/\s+/g, " "), /24 questions across 2 discussions/);
  assert.match(text(tree).replace(/\s+/g, " "), /12 mixed questions/);
  assert.doesNotMatch(text(tree), /Build your Med interview|Select all|Keep what you need|Qty/);
  for (const label of ["Preview room", "Join Med interview"]) nodes(tree).find(node => node.type === "button" && text(node).includes(label)).props.onClick();
  assert.ok(starts.every(({ plan }) => plan.stationSeconds === 1800 && plan.stationSlugs.length === 2 && plan.stationSlugs.every(slug => slug === "panel-interview")));
  assert.deepEqual(starts.map(({ preview }) => preview), [true, false]);
});
