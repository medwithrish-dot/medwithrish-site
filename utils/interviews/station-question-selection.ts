import { INTERVIEW_QUESTIONS, LEGACY_INTERVIEW_QUESTION_IDS_BY_TEXT, type InterviewQuestion } from "@/app/medicforest/interview/_data/interviewQuestionBank";
import { stationQuestionCount } from "@/app/medicforest/interview/_data/interview-stations";
import { questionEligible, type ApplicantProfile } from "@/utils/interviews/applicant-profile";
import { getQuestionStimulus } from "@/app/medicforest/interview/_data/interview-stimuli";
import { DATA_INTERPRETATION_STATION_QUESTIONS } from "@/app/medicforest/interview/_data/data-interpretation-station";

type StationQuestionRule = {
  sourceTopics?: readonly string[];
  subcategories?: readonly InterviewQuestion["subcategory"][];
};

const rules: Record<string, StationQuestionRule> = {
  "why-medicine": { subcategories: ["Motivation for Medicine"] },
  "work-experience": { subcategories: ["Work Experience & Reflection"] },
  "disability-in-medicine": { subcategories: ["Core Medical Ethics"] },
  "equality-diversity-inclusion": { subcategories: ["Ethical & Professional Scenarios"] },
  ozempic: { sourceTopics: ["WEIGHT-LOSS MEDICATIONS / GLP-1 & GIP MEDICINES"] },
  "ethics-confidentiality": { subcategories: ["Consent, Capacity & Confidentiality"] },
  "nhs-waiting-lists": { sourceTopics: ["NHS WAITING LISTS & ACCESS TO CARE"] },
  "teamwork-group-discussion": { subcategories: ["Teamwork", "Conflict & Difficult Conversations", "Group Discussion"] },
  "data-analysis": { subcategories: ["Data Stations", "Graphs & Trends", "Data Interpretation", "Critical Appraisal", "Article Analysis"] },
};

const questions: readonly InterviewQuestion[] = INTERVIEW_QUESTIONS;
const questionByText = new Map<string, InterviewQuestion>(
  [...questions, ...DATA_INTERPRETATION_STATION_QUESTIONS].map((question) => [question.text, question]),
);

function seedNumber(seed: string) {
  let value = 2166136261;
  for (const character of seed) value = Math.imul(value ^ character.charCodeAt(0), 16777619);
  return value >>> 0;
}

function matchingQuestions(stationSlug: string) {
  const rule = rules[stationSlug];
  if (!rule) return [];
  return questions.filter((question) =>
    (rule.sourceTopics?.includes(question.sourceTopic ?? "") ?? false)
    || (rule.subcategories?.includes(question.subcategory) ?? false));
}

// Authored topic routes vary the order while keeping neighbouring topics related.
// Every question comes from the bank; panel planning needs no provider request.
const PANEL_ROUTES: readonly (readonly (readonly InterviewQuestion["subcategory"][])[])[] = [
  [["Motivation for Medicine"], ["Role of a Doctor"], ["Communication & Empathy"], ["Consent, Capacity & Confidentiality"], ["Ethical & Professional Scenarios"], ["Working in Healthcare Teams"], ["Healthcare Resources & Priorities"], ["Strengths, Weaknesses & Resilience"]],
  [["NHS Structure & Challenges"], ["Health Inequalities"], ["Organ Donation & Resource Allocation"], ["Ethical & Professional Scenarios"], ["Communication & Empathy"], ["Working in Healthcare Teams"], ["Role of a Doctor"], ["Personal Insight"]],
  [["Teamwork"], ["Communication & Empathy"], ["Professionalism & Professional Boundaries"], ["Safeguarding & Duty of Candour"], ["Role of a Doctor"], ["Motivation for Medicine"], ["Technology, AI & Digital Health"], ["Strengths, Weaknesses & Resilience"]],
  [["Motivation for Medicine"], ["Work Experience & Reflection", "Personal Insight"], ["Working in Healthcare Teams"], ["Ethical & Professional Scenarios"], ["Consent, Capacity & Confidentiality"], ["Communication & Empathy"], ["Health Inequalities"], ["Personal Insight"]],
];

export function selectPanelQuestions(stationSeconds: number, seed: string, applicant?: ApplicantProfile) {
  const count = stationQuestionCount(stationSeconds);
  // For a 15-minute panel: six prompts including a closing reflection.
  const route = PANEL_ROUTES[seedNumber(`${seed}:route`) % PANEL_ROUTES.length];
  const topics = [...route.slice(0, Math.max(0, count - 1)), route.at(-1)!];
  const used = new Set<string>();
  return topics.flatMap((subcategories, index) => {
    const pool = questions.filter(question => subcategories.includes(question.subcategory)
      && !used.has(question.id) && !getQuestionStimulus(question.id)
      && !/\b(?:graph|chart|image|photograph|diagram|table|article|role.?play|provided|shown|above|below)\b/i.test(question.text)
      && questionEligible(question.text, applicant));
    if (!pool.length) return [];
    const picked = pool[seedNumber(`${seed}:panel:${index}`) % pool.length];
    used.add(picked.id);
    return [picked];
  });
}

/**
 * Selects a coherent cluster from the question bank. Questions with a source
 * topic stay within that topic; older questions fall back to their subcategory.
 */
export function selectStationQuestions(stationSlug: string, stationSeconds: number, seed: string, applicant?: ApplicantProfile) {
  if (stationSlug === "panel-interview") return selectPanelQuestions(stationSeconds, seed, applicant);
  // A data station is one visual explored in three stages, not three unrelated
  // visual questions sampled from the wider question bank.
  if (stationSlug === "data-analysis") return [...DATA_INTERPRETATION_STATION_QUESTIONS];
  const count = stationQuestionCount(stationSeconds);
  const groups = new Map<string, InterviewQuestion[]>();
  for (const question of matchingQuestions(stationSlug)) {
    if (stationSlug === "data-analysis" && !getQuestionStimulus(question.id)) continue;
    if (!questionEligible(question.text, applicant)) continue;
    const key = stationSlug === "data-analysis" ? "visual-data" : question.sourceTopic || question.subcategory;
    groups.set(key, [...(groups.get(key) ?? []), question]);
  }
  const eligible = [...groups.values()].filter((group) => group.length >= count);
  const choices = eligible.length ? eligible : [...groups.values()].filter((group) => group.length > 0);
  if (!choices.length) return [];
  const numericSeed = seedNumber(`${stationSlug}:${seed}`);
  const group = choices[numericSeed % choices.length]
    .toSorted((a, b) => a.sourceQuestionNumber - b.sourceQuestionNumber || a.id.localeCompare(b.id));
  const take = Math.min(count, group.length);
  const start = Math.floor(numericSeed / Math.max(1, choices.length)) % group.length;
  const selected = Array.from({ length: take }, (_, index) => group[(start + index) % group.length]);
  // Filtering personal-history questions can shorten a cluster. Fill only from
  // eligible questions in the same station, never restore excluded questions.
  const stationQuestions = [...selected, ...[...groups.values()].flat().filter((question) => !selected.includes(question))];
  if (stationSlug === "work-experience" && stationQuestions.length < count) {
    stationQuestions.push(...questions.filter((question) => question.subcategory === "Personal Insight" && questionEligible(question.text, applicant)));
  }
  return stationQuestions.slice(0, count);
}

export function questionIdForText(text: string) {
  return questionByText.get(text)?.id ?? LEGACY_INTERVIEW_QUESTION_IDS_BY_TEXT.get(text) ?? null;
}
