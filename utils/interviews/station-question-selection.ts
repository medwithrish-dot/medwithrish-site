import { INTERVIEW_QUESTIONS, LEGACY_INTERVIEW_QUESTION_IDS_BY_TEXT, type InterviewQuestion } from "@/app/medicforest/interview/_data/interviewQuestionBank";
import { panelQuestionCount, stationQuestionCount } from "@/app/medicforest/interview/_data/interview-stations";
import { questionEligible, type ApplicantProfile } from "@/utils/interviews/applicant-profile";
import { getQuestionStimulus } from "@/app/medicforest/interview/_data/interview-stimuli";
import { DATA_INTERPRETATION_STATION_QUESTIONS } from "@/app/medicforest/interview/_data/data-interpretation-station";
import { WHY_MEDICINE_PROMPT, WHY_MEDICINE_QUESTION_ID } from "@/app/medicforest/interview/_lib/why-medicine-challenge";

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

// Balance broad topic areas, then vary their order, subcategories and questions.
// Choose subcategories before questions so large teamwork/communication pools
// cannot crowd out leadership, feedback, judgement or critical thinking.
const PANEL_TOPIC_AREAS: readonly (readonly InterviewQuestion["subcategory"][])[] = [
  ["Motivation for Medicine", "Medical School & Course", "Work Experience & Reflection"],
  ["Communication & Empathy", "Teamwork", "Leadership", "Conflict & Difficult Conversations", "Giving & Receiving Feedback", "Working in Healthcare Teams", "Prioritisation Stations"],
  ["Core Medical Ethics", "Consent, Capacity & Confidentiality", "Safeguarding & Duty of Candour", "Professionalism & Professional Boundaries", "Ethical & Professional Scenarios", "Situational Judgement", "End-of-Life Care & Assisted Dying"],
  ["NHS Structure & Challenges", "Role of a Doctor", "Health Inequalities", "Public Health", "Healthcare Policy & Funding", "Healthcare Resources & Priorities", "Current NHS Issues", "Workforce Issues"],
  ["Research & Evidence", "Critical Appraisal", "Critical Thinking", "Technology, AI & Digital Health", "New Treatments & Innovation", "Public Health Debates"],
];
const PANEL_REFLECTION_TOPICS: readonly InterviewQuestion["subcategory"][] = ["Strengths, Weaknesses & Resilience", "Personal Insight"];

export function selectPanelQuestions(stationSeconds: number, seed: string, applicant?: ApplicantProfile) {
  const count = panelQuestionCount(stationSeconds);
  const eligible = questions.filter(question => !getQuestionStimulus(question.id)
    && !/\b(?:graph|chart|image|photograph|diagram|table|article|role.?play|provided|shown|above|below)\b/i.test(question.text)
    && questionEligible(question.text, applicant));
  const selected: InterviewQuestion[] = [];
  const usedTopics = new Set<InterviewQuestion["subcategory"]>();
  const pick = (topics: readonly InterviewQuestion["subcategory"][], index: number) => {
    const available = topics.map(topic => ({ topic, pool: eligible.filter(question => question.subcategory === topic && !selected.includes(question)) }))
      .filter(choice => choice.pool.length);
    const fresh = available.filter(choice => !usedTopics.has(choice.topic));
    const choices = fresh.length ? fresh : available;
    if (!choices.length) return;
    const choice = choices[seedNumber(`${seed}:topic:${index}`) % choices.length];
    const question = choice.pool[seedNumber(`${seed}:question:${index}`) % choice.pool.length];
    usedTopics.add(choice.topic);
    selected.push(question);
  };
  for (let index = 0; index < count - 1; index++) {
    const round = Math.floor(index / PANEL_TOPIC_AREAS.length);
    const areas = PANEL_TOPIC_AREAS.map((topics, area) => ({ topics, order: seedNumber(`${seed}:round:${round}:area:${area}`) }))
      .toSorted((a, b) => a.order - b.order);
    pick(areas[index % areas.length].topics, index);
  }
  pick(PANEL_REFLECTION_TOPICS, count - 1);
  return selected;
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
  if (text === WHY_MEDICINE_PROMPT) return WHY_MEDICINE_QUESTION_ID;
  return questionByText.get(text)?.id ?? LEGACY_INTERVIEW_QUESTION_IDS_BY_TEXT.get(text) ?? null;
}
