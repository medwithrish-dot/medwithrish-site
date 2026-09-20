import { INTERVIEW_QUESTIONS, type InterviewQuestion } from "@/app/phloemai/interview/_data/interviewQuestionBank";
import { stationQuestionCount } from "@/app/phloemai/interview/_data/interview-stations";
import { questionEligible, type ApplicantProfile } from "@/utils/interviews/applicant-profile";
import { getQuestionStimulus } from "@/app/phloemai/interview/_data/interview-stimuli";

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
const questionByText = new Map<string, InterviewQuestion>(questions.map((question) => [question.text, question]));

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

/**
 * Selects a coherent cluster from the question bank. Questions with a source
 * topic stay within that topic; older questions fall back to their subcategory.
 */
export function selectStationQuestions(stationSlug: string, stationSeconds: number, seed: string, applicant?: ApplicantProfile) {
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
  return questionByText.get(text)?.id ?? null;
}
