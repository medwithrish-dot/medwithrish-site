import type {
  UCATChartVisual,
  UCATOptionKey,
  UCATQuestion,
  UCATQuestionTag,
  UCATSection,
  UCATSjtIssueTag,
  UCATSubtypeId,
} from "./ucatQuestionBank";

const OPTION_KEYS: UCATOptionKey[] = ["A", "B", "C", "D"];
const QR_OPTION_KEYS: UCATOptionKey[] = ["A", "B", "C", "D"];

const TFC_OPTIONS = [
  { key: "A" as const, text: "True" },
  { key: "B" as const, text: "False" },
  { key: "C" as const, text: "Can't tell" },
];

const IMPORTANCE_OPTIONS = [
  { key: "A" as const, text: "Very important" },
  { key: "B" as const, text: "Important" },
  { key: "C" as const, text: "Of minor importance" },
  { key: "D" as const, text: "Not important at all" },
];

const APPROPRIATENESS_OPTIONS = [
  { key: "A" as const, text: "A very appropriate thing to do" },
  { key: "B" as const, text: "Appropriate, but not ideal" },
  { key: "C" as const, text: "Inappropriate, but not awful" },
  { key: "D" as const, text: "A very inappropriate thing to do" },
];

export const HIGH_QUALITY_9000_LOCKED_BATCHES = 20;
export const HIGH_QUALITY_9000_NEXT_WAVE_TOTAL_BATCHES = 20;
export const HIGH_QUALITY_9000_NEXT_WAVE_COMPLETED_BATCHES = 20;
export const HIGH_QUALITY_9000_TOTAL_BATCHES =
  HIGH_QUALITY_9000_LOCKED_BATCHES + HIGH_QUALITY_9000_NEXT_WAVE_TOTAL_BATCHES;
export const HIGH_QUALITY_9000_COMPLETED_BATCHES =
  HIGH_QUALITY_9000_LOCKED_BATCHES +
  HIGH_QUALITY_9000_NEXT_WAVE_COMPLETED_BATCHES;
export const HIGH_QUALITY_9000_BATCH_TARGETS: Record<UCATSection, number> = {
  vr: 220,
  dm: 175,
  qr: 180,
  sjt: 325,
};
export const HIGH_QUALITY_9000_FILTERED_TARGETS: Record<UCATSection, number> = {
  vr: 4000,
  dm: 3899,
  qr: 3624,
  sjt: 8000,
};
export const HIGH_QUALITY_9000_FILTERED_TOTAL_TARGET =
  HIGH_QUALITY_9000_FILTERED_TARGETS.vr +
  HIGH_QUALITY_9000_FILTERED_TARGETS.dm +
  HIGH_QUALITY_9000_FILTERED_TARGETS.qr +
  HIGH_QUALITY_9000_FILTERED_TARGETS.sjt;

const VR_SETS_PER_BATCH = 55;
const QR_SETS_PER_BATCH = 45;
const SJT_SETS_PER_BATCH = 65;
const DM_SYLLOGISMS_PER_BATCH = 30;
const DM_LOGIC_PER_BATCH = 30;
const DM_ARGUMENTS_PER_BATCH = 25;
const DM_YES_NO_PER_BATCH = 25;
const DM_VENN_PER_BATCH = 40;
const DM_PROBABILITY_PER_BATCH = 25;

function range(length: number) {
  return Array.from({ length }, (_, index) => index);
}

function pick<T>(items: readonly T[], index: number) {
  return items[index % items.length];
}

function pickPair<T>(items: readonly [T, T][], index: number) {
  return items[index % items.length];
}

function pad(index: number, width = 4) {
  return String(index + 1).padStart(width, "0");
}

function sentenceCase(text: string) {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

function indefiniteArticle(text: string) {
  return /^[aeiou]/i.test(text) ? "an" : "a";
}

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function fraction(numerator: number, denominator: number) {
  const divisor = gcd(numerator, denominator);
  return `${numerator / divisor}/${denominator / divisor}`;
}

function ratio(numerator: number, denominator: number) {
  const divisor = gcd(numerator, denominator);
  return `${numerator / divisor}:${denominator / divisor}`;
}

function uniqueDistractors(correctText: string, candidates: string[]) {
  const unique: string[] = [];

  for (const candidate of [...candidates, "1:1", "2:1", "1:2", "3:2", "2:3"]) {
    if (candidate !== correctText && !unique.includes(candidate)) {
      unique.push(candidate);
    }
  }

  return unique.slice(0, 3);
}

function formatNumber(value: number, decimals = 0) {
  const rounded = Number(value.toFixed(decimals));
  return rounded.toLocaleString("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatPercent(value: number, decimals = 1) {
  return `${formatNumber(value, decimals)}%`;
}

function asMoney(value: number) {
  return `GBP ${formatNumber(value, 2)}`;
}

function numericDistractors(correct: number, seed: number, decimals = 0) {
  const step = Math.max(1, Math.round(Math.abs(correct) * (0.06 + (seed % 4) * 0.01)));
  return [
    correct + step,
    Math.max(0, correct - step),
    correct + step * 2 + (seed % 5),
  ].map((value) => formatNumber(value, decimals));
}

function fallbackDistractor(correctText: string, attempt: number) {
  const clockMatch = correctText.match(/^(\d{1,2}):([0-5]\d)$/);
  if (clockMatch && Number(clockMatch[1]) <= 23) {
    const minutes =
      (Number(clockMatch[1]) * 60 + Number(clockMatch[2]) + attempt * 5) %
      (24 * 60);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  }

  const ratioMatch = correctText.match(/^(\d+):(\d+)$/);
  if (ratioMatch) {
    return `${Number(ratioMatch[1]) + attempt}:${ratioMatch[2]}`;
  }

  const fractionMatch = correctText.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    return `${Number(fractionMatch[1]) + attempt}/${fractionMatch[2]}`;
  }

  const moneyMatch = correctText.match(/^GBP ([\d,]+(?:\.\d+)?)$/);
  if (moneyMatch) {
    const value = Number(moneyMatch[1].replace(/,/g, ""));
    return asMoney(value + Math.max(1, Math.round(Math.abs(value) * 0.04)) * attempt);
  }

  const percentMatch = correctText.match(/^(-?[\d,]+(?:\.\d+)?)%$/);
  if (percentMatch) {
    const value = Number(percentMatch[1].replace(/,/g, ""));
    return formatPercent(value + attempt, percentMatch[1].includes(".") ? 1 : 0);
  }

  const unitMatch = correctText.match(/^(-?[\d,]+(?:\.\d+)?)\s+(.+)$/);
  if (unitMatch) {
    const value = Number(unitMatch[1].replace(/,/g, ""));
    const decimals = unitMatch[1].includes(".") ? 1 : 0;
    return `${formatNumber(value + attempt, decimals)} ${unitMatch[2]}`;
  }

  const numericValue = Number(correctText.replace(/,/g, ""));
  if (Number.isFinite(numericValue)) {
    return formatNumber(numericValue + attempt);
  }

  const letteredLabelMatch = correctText.match(/^(.+\s)([A-E])$/);
  if (letteredLabelMatch) {
    const nextLetter = String.fromCharCode(
      "A".charCodeAt(0) + ((letteredLabelMatch[2].charCodeAt(0) - "A".charCodeAt(0) + attempt) % 5)
    );
    return `${letteredLabelMatch[1]}${nextLetter}`;
  }

  return pick(
    [
      "More information required",
      "Pay-as-you-go option",
      "Standard option",
      "Flexible option",
      "No suitable option",
    ],
    attempt - 1
  );
}

function buildOptions(
  correctText: string,
  distractors: string[],
  seed: number,
  optionKeys = OPTION_KEYS
) {
  const wrongTarget = optionKeys.length - 1;
  const wrongs = distractors
    .map((text) => text.trim())
    .filter((text, index, array) => text && text !== correctText && array.indexOf(text) === index)
    .slice(0, wrongTarget);

  let filler = 1;
  while (wrongs.length < wrongTarget) {
    const next = fallbackDistractor(correctText, filler);
    if (next !== correctText && !wrongs.includes(next)) wrongs.push(next);
    filler += 1;
  }

  const answerIndex = seed % optionKeys.length;
  const texts = [...wrongs];
  texts.splice(answerIndex, 0, correctText);

  return {
    options: texts.map((text, index) => ({ key: optionKeys[index], text })),
    answer: optionKeys[answerIndex],
  };
}

function singleQuestion(input: {
  id: string;
  section: UCATSection;
  subtype: UCATSubtypeId;
  title: string;
  leftTitle: string;
  setId?: string;
  tags?: UCATQuestionTag[];
  issueTags?: UCATSjtIssueTag[];
  stimulus: string[];
  visual?: UCATChartVisual;
  question: string;
  correctText: string;
  distractors: string[];
  explanation: string;
  seed: number;
}): UCATQuestion {
  const built = buildOptions(
    input.correctText,
    input.distractors,
    input.seed,
    input.section === "qr" ? QR_OPTION_KEYS : OPTION_KEYS
  );
  return { ...input, ...built };
}

function yesNoQuestion(input: {
  id: string;
  section: UCATSection;
  subtype: UCATSubtypeId;
  title: string;
  leftTitle: string;
  setId?: string;
  tags?: UCATQuestionTag[];
  stimulus: string[];
  visual?: UCATChartVisual;
  question: string;
  instruction: string;
  yesNoStatements: Array<{ id: string; text: string; answer: "Yes" | "No" }>;
  explanation: string;
}): UCATQuestion {
  return { ...input, questionType: "yes-no" };
}

function dragCategoryQuestion(input: {
  id: string;
  section: UCATSection;
  subtype: UCATSubtypeId;
  title: string;
  leftTitle: string;
  setId?: string;
  tags?: UCATQuestionTag[];
  issueTags?: UCATSjtIssueTag[];
  stimulus: string[];
  question: string;
  instruction: string;
  categories: Array<{ id: string; label: string }>;
  categoryItems: Array<{ id: string; text: string; answerCategory: string }>;
  explanation: string;
}): UCATQuestion {
  return { ...input, questionType: "drag-category" };
}

function normaliseForQuality(value: string) {
  return value
    .toLowerCase()
    .replace(/\b\d+(?:[,.]\d+)*(?:\.\d+)?%?\b/g, "<n>")
    .replace(/gbp\s*<n>(?:\.\d+)?/g, "gbp <n>")
    .replace(/[^\w\s%/.-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normaliseForExactMatch(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\w\s%/.,-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function optionText(question: UCATQuestion) {
  if ((!question.questionType || question.questionType === "single") && "options" in question) {
    return question.options.map((option) => option.text).join(" | ");
  }

  if (question.questionType === "yes-no") {
    return question.yesNoStatements.map((statement) => statement.text).join(" | ");
  }

  if (question.questionType === "drag-category") {
    return question.categoryItems.map((item) => item.text).join(" | ");
  }

  if (question.questionType === "drag-order") {
    return question.dragItems.map((item) => item.text).join(" | ");
  }

  if (question.questionType === "most-least") {
    return question.actionItems.map((item) => item.text).join(" | ");
  }

  return "";
}

function questionFingerprint(question: UCATQuestion) {
  return `${question.section}:${question.subtype}:${normaliseForExactMatch(
    [
      question.stimulus.join(" "),
      question.visual ? JSON.stringify(question.visual) : "",
      question.question,
      optionText(question),
    ].join(" | ")
  )}`;
}

function questionTemplate(question: UCATQuestion) {
  return `${question.section}:${question.subtype}:${normaliseForQuality(question.question)}`;
}

function stimulusTemplate(question: UCATQuestion) {
  return normaliseForQuality(
    `${question.stimulus.join(" ")} ${question.visual ? JSON.stringify(question.visual) : ""}`
  );
}

function hasValidQuestionShape(question: UCATQuestion) {
  if (
    question.section !== "vr" &&
    question.section !== "dm" &&
    question.section !== "qr" &&
    question.section !== "sjt"
  ) {
    return false;
  }

  if (
    !question.id.trim() ||
    !question.title.trim() ||
    !question.question.trim() ||
    !question.explanation.trim() ||
    question.explanation.trim().length < 24 ||
    question.stimulus.length === 0 ||
    question.stimulus.some((part) => !part.trim())
  ) {
    return false;
  }

  if (!question.questionType || question.questionType === "single") {
    if (!("options" in question)) return false;

    const keys = question.options.map((option) => option.key);
    const texts = question.options.map((option) =>
      normaliseForExactMatch(option.text)
    );

    if (
      question.options.length < 3 ||
      question.options.length > 4 ||
      !keys.includes(question.answer) ||
      new Set(keys).size !== keys.length ||
      new Set(texts).size !== texts.length
    ) {
      return false;
    }

    if (
      question.subtype === "vr-tfc" &&
      (question.options.length !== TFC_OPTIONS.length ||
        question.options.some((option, index) => option.text !== TFC_OPTIONS[index].text))
    ) {
      return false;
    }

    if (
      question.subtype === "sjt-appropriateness" &&
      question.options.some(
        (option, index) => option.text !== APPROPRIATENESS_OPTIONS[index].text
      )
    ) {
      return false;
    }

    if (
      question.subtype === "sjt-importance" &&
      question.options.some(
        (option, index) => option.text !== IMPORTANCE_OPTIONS[index].text
      )
    ) {
      return false;
    }

    return true;
  }

  if (question.questionType === "yes-no") {
    const ids = question.yesNoStatements.map((statement) => statement.id);
    const texts = question.yesNoStatements.map((statement) =>
      normaliseForExactMatch(statement.text)
    );

    return (
      question.yesNoStatements.length >= 4 &&
      new Set(ids).size === ids.length &&
      new Set(texts).size === texts.length &&
      question.yesNoStatements.every(
        (statement) => statement.answer === "Yes" || statement.answer === "No"
      )
    );
  }

  if (question.questionType === "drag-category") {
    const categoryIds = question.categories.map((category) => category.id);
    const itemIds = question.categoryItems.map((item) => item.id);
    const itemTexts = question.categoryItems.map((item) =>
      normaliseForExactMatch(item.text)
    );
    const categorySet = new Set(categoryIds);

    return (
      question.categories.length >= 2 &&
      question.categoryItems.length >= 3 &&
      new Set(categoryIds).size === categoryIds.length &&
      new Set(itemIds).size === itemIds.length &&
      new Set(itemTexts).size === itemTexts.length &&
      question.categoryItems.every((item) => categorySet.has(item.answerCategory))
    );
  }

  return false;
}

function spreadItems<T>(items: T[], targetCount: number) {
  const selected: T[] = [];
  const used = new Set<number>();

  for (let index = 0; index < targetCount && index < items.length; index += 1) {
    const sourceIndex = Math.floor((index * items.length) / targetCount);
    if (!used.has(sourceIndex)) {
      selected.push(items[sourceIndex]);
      used.add(sourceIndex);
    }
  }

  for (let index = 0; selected.length < targetCount && index < items.length; index += 1) {
    if (!used.has(index)) {
      selected.push(items[index]);
      used.add(index);
    }
  }

  return selected;
}

function groupedBySet(questions: UCATQuestion[]) {
  const groups = new Map<string, UCATQuestion[]>();

  for (const question of questions) {
    const key = question.setId ?? question.id;
    const group = groups.get(key) ?? [];
    group.push(question);
    groups.set(key, group);
  }

  return [...groups.values()];
}

function selectQuestionGroups({
  questions,
  targetQuestions,
  expectedGroupSize,
  stimulusCap,
  questionTemplateCap,
}: {
  questions: UCATQuestion[];
  targetQuestions: number;
  expectedGroupSize: number;
  stimulusCap: number;
  questionTemplateCap?: number;
}) {
  const allGroups = groupedBySet(questions);
  const groups = spreadItems(allGroups, allGroups.length);
  const selected: UCATQuestion[] = [];
  const fingerprints = new Set<string>();
  const stimulusCounts = new Map<string, number>();
  const questionTemplateCounts = new Map<string, number>();

  for (const group of groups) {
    if (selected.length >= targetQuestions) break;
    if (group.length !== expectedGroupSize) continue;
    if (!group.every(hasValidQuestionShape)) continue;

    const groupFingerprints = group.map(questionFingerprint);
    if (new Set(groupFingerprints).size !== groupFingerprints.length) continue;
    if (groupFingerprints.some((fingerprint) => fingerprints.has(fingerprint))) continue;

    const nextStimulusCounts = new Map(stimulusCounts);
    const nextQuestionTemplateCounts = new Map(questionTemplateCounts);
    let accepted = true;

    for (const question of group) {
      const stimulusKey = stimulusTemplate(question);
      const nextStimulusCount = (nextStimulusCounts.get(stimulusKey) ?? 0) + 1;
      nextStimulusCounts.set(stimulusKey, nextStimulusCount);

      if (nextStimulusCount > stimulusCap) {
        accepted = false;
        break;
      }

      if (questionTemplateCap) {
        const questionKey = questionTemplate(question);
        const nextQuestionCount =
          (nextQuestionTemplateCounts.get(questionKey) ?? 0) + 1;
        nextQuestionTemplateCounts.set(questionKey, nextQuestionCount);

        if (nextQuestionCount > questionTemplateCap) {
          accepted = false;
          break;
        }
      }
    }

    if (!accepted) continue;

    groupFingerprints.forEach((fingerprint) => fingerprints.add(fingerprint));
    nextStimulusCounts.forEach((count, key) => stimulusCounts.set(key, count));
    nextQuestionTemplateCounts.forEach((count, key) =>
      questionTemplateCounts.set(key, count)
    );
    selected.push(...group);
  }

  if (selected.length !== targetQuestions) {
    throw new Error(
      `Could not select ${targetQuestions} high-quality questions; selected ${selected.length}.`
    );
  }

  return selected;
}

function selectQuestionsBySubtype({
  questions,
  targets,
  templateCap,
}: {
  questions: UCATQuestion[];
  targets: Partial<Record<UCATSubtypeId, number>>;
  templateCap: Partial<Record<UCATSubtypeId, number>>;
}) {
  const selected: UCATQuestion[] = [];
  const fingerprints = new Set<string>();
  const templateCounts = new Map<string, number>();

  for (const subtype of Object.keys(targets) as UCATSubtypeId[]) {
    const target = targets[subtype] ?? 0;
    const subtypeQuestions = spreadItems(
      questions.filter((question) => question.subtype === subtype),
      target * 2
    );
    const subtypeSelected: UCATQuestion[] = [];

    for (const question of subtypeQuestions) {
      if (subtypeSelected.length >= target) break;
      if (!hasValidQuestionShape(question)) continue;

      const fingerprint = questionFingerprint(question);
      if (fingerprints.has(fingerprint)) continue;

      const templateKey =
        subtype === "dm-syllogisms" ||
        subtype === "dm-logic" ||
        subtype === "dm-arguments" ||
        subtype === "dm-yes-no"
          ? `${subtype}:${stimulusTemplate(question)}`
          : questionTemplate(question);
      const count = (templateCounts.get(templateKey) ?? 0) + 1;
      if (count > (templateCap[subtype] ?? 80)) continue;

      fingerprints.add(fingerprint);
      templateCounts.set(templateKey, count);
      subtypeSelected.push(question);
    }

    if (subtypeSelected.length !== target) {
      throw new Error(
        `Could not select ${target} ${subtype} questions; selected ${subtypeSelected.length}.`
      );
    }

    selected.push(...subtypeSelected);
  }

  return selected;
}

const ORGANISATIONS = [
  "Aberford College",
  "Bexley Arts Centre",
  "Calder Library",
  "Dunmere Council",
  "Eastbrook Clinic",
  "Fallowfield Museum",
  "Glenford Transport",
  "Harbour Sports Trust",
  "Ivybridge Park Service",
  "Juniper Sixth Form",
  "Kenton Archive",
  "Larchwood Theatre",
  "Moorfield Food Hub",
  "Norhaven School",
  "Oakmere Observatory",
  "Pinecross Advice Centre",
  "Quarrygate Garden",
  "Rosedale Workshop",
  "Silverton Pool",
  "Tarnside Youth Project",
  "Upton Music School",
  "Vale Street Market",
  "Westmere College",
  "Yarwood Library",
  "Zephyr Community Hall",
] as const;

const PROJECTS = [
  "a quiet study booking system",
  "short object-handling sessions",
  "colour-coded recycling rooms",
  "early-morning breakfast desks",
  "a shared bicycle repair stand",
  "evening digital-skills clinics",
  "a low-cost theatre ticket trial",
  "temporary wildflower strips",
  "a guided archive-labelling project",
  "parent drop-in advice hours",
  "a tablet-lending service",
  "a volunteer welcome rota",
  "one-page appointment reminders",
  "a weekend practice-room scheme",
  "a neighbourhood tool library",
  "small-group numeracy workshops",
  "a safer crossing notice trial",
  "water-refill points",
  "a local history recording booth",
  "a shared revision timetable",
] as const;

const GROUPS = [
  "exam-year students",
  "adult learners",
  "new visitors",
  "local volunteers",
  "shift workers",
  "parents of younger pupils",
  "clinic patients",
  "community sports teams",
  "library members",
  "market traders",
] as const;

const PROBLEMS = [
  "attendance was uneven at the start of the week",
  "people said the original process felt too formal",
  "staff were spending too long correcting avoidable errors",
  "the busiest period left little time for explanations",
  "new users often missed important instructions",
  "several bookings were cancelled at short notice",
  "equipment was being used inefficiently",
  "feedback forms showed confusion about where to go next",
  "small groups were being crowded out by larger bookings",
  "the existing timetable did not match demand",
] as const;

const AIMS = [
  "make the service easier to use",
  "reduce wasted time before appointments",
  "support people who could not attend standard sessions",
  "improve confidence without adding a full new course",
  "test whether clearer prompts would change behaviour",
  "spread demand more evenly across the week",
  "protect staff time while keeping the service open",
  "make the first visit less intimidating",
] as const;

const METRICS = [
  "attendance",
  "repeat bookings",
  "on-time arrivals",
  "completed forms",
  "volunteer sign-ups",
  "correctly sorted items",
  "same-day cancellations",
  "desk usage",
] as const;

const CAVEATS = [
  "the trial coincided with a clearer online booking page",
  "staff gave extra reminders during the first fortnight",
  "a nearby college advertised the service at the same time",
  "poor weather affected the middle week of the trial",
  "two sessions were led by unusually experienced volunteers",
  "the comparison period was shorter than managers wanted",
  "a local event temporarily increased footfall",
  "the newest signs were installed before the trial began",
] as const;

const LIMITATIONS = [
  "only two sites took part",
  "the trial did not include school holidays",
  "the busiest users were already highly motivated",
  "weekend demand was not measured separately",
  "staff did not collect long-term follow-up data",
  "the sample was smaller than the review group preferred",
  "the costs were not tested during winter",
  "some users still needed face-to-face support",
] as const;

const FOLLOW_UP_NOTES = [
  "A later note said reviewers also checked staff workload, but it did not change the cautious recommendation.",
  "A follow-up discussion asked whether the same approach would work with fewer reminders, but no firm conclusion was recorded.",
  "Reviewers later added that the figures should be read alongside staff feedback, which was mixed but generally useful.",
  "A short update said the project team would monitor whether demand stayed steady after the initial publicity faded.",
  "The review group later asked for clearer cost records before any wider decision was made.",
  "A later meeting agreed that the trial had identified useful questions as well as possible benefits.",
  "The project team later noted that user confidence, not only raw demand, should be checked in any extension.",
] as const;

const FUNDERS = [
  "the access budget",
  "a small innovation fund",
  "the volunteer-support grant",
  "the adult-skills partnership",
  "a temporary community grant",
  "the centre improvement reserve",
] as const;

const WRONG_FUNDERS = [
  "parking-fine income",
  "the sports-prize fund",
  "ticket sales from a separate event",
  "the staff social budget",
  "a national research award",
  "a private sponsorship deal",
] as const;

const VR_INFERENCE_QUESTIONS = [
  "Which statement is best supported by the passage?",
  "Which conclusion can most safely be drawn from the passage?",
  "Which option follows most closely from the review described?",
  "Which statement is the fairest interpretation of the evidence?",
  "Which claim is most consistent with the passage?",
  "Which option reflects the review group's likely position?",
  "Which statement avoids going beyond the evidence in the passage?",
  "Which conclusion is most justified by the trial results?",
  "Which option best captures the implication of the recommendation?",
  "Which statement is supported without assuming facts not given?",
  "Which response best matches the cautious tone of the review?",
  "Which judgement would be most reasonable based on the passage?",
] as const;

const VR_SUMMARY_QUESTIONS = [
  "Which option best summarises the passage?",
  "Which summary gives the most accurate account of the passage?",
  "Which option captures the main point of the passage?",
  "Which statement best describes the overall message?",
  "Which option gives the best balanced summary?",
  "Which summary reflects both the result and the caution in the passage?",
  "Which option most accurately condenses the passage?",
  "Which summary avoids overstating the findings?",
] as const;

const VR_AUTHOR_QUESTIONS = [
  "What is the writer's attitude towards the trial?",
  "Which phrase best describes the writer's view of the project?",
  "How does the writer present the trial?",
  "Which description best matches the tone of the passage?",
  "What attitude is implied by the way the review is described?",
  "How would the writer most likely characterise the results?",
  "Which option best describes the writer's stance?",
  "What is the passage's overall attitude to the trial?",
] as const;

const VR_NEGATIVE_QUESTIONS = [
  "All of the following are true of the trial except:",
  "All of the following are named as reasons for caution except:",
  "All of the following are parts of the recommendation except:",
  "All of the following are stated facts about the project except:",
  "All of the following are true according to the passage except:",
  "All of the following are supported by the review except:",
  "All of the following are described in the passage except:",
  "All of the following are accurate statements about the trial except:",
] as const;

const VR_OBSERVATION_GROUPS = [
  "front-desk staff",
  "first-time users",
  "regular users",
  "weekend volunteers",
  "session leaders",
  "booking staff",
  "family members",
  "support workers",
  "branch managers",
  "community partners",
  "student representatives",
  "accessibility advisers",
  "maintenance staff",
  "evening supervisors",
  "local organisers",
  "new members",
  "returning visitors",
  "helpline staff",
  "workshop tutors",
  "reception volunteers",
  "route marshals",
  "project mentors",
  "attendance officers",
  "outreach workers",
  "site coordinators",
  "digital support staff",
  "event stewards",
  "parent helpers",
  "training assistants",
  "neighbourhood leads",
] as const;

const VR_OBSERVATION_DETAILS = [
  "wanted the instructions to be shorter",
  "said reminders were most useful before busy periods",
  "asked for clearer information about eligibility",
  "reported that the first visit still felt confusing",
  "found the booking step easier than the follow-up step",
  "thought the change worked best when staff explained it briefly",
  "said demand was strongest just after opening",
  "preferred a paper back-up for people without reliable phones",
  "noticed that some users misunderstood the purpose of the trial",
  "said the busiest site was not typical of the whole service",
  "asked whether the change would continue after funding ended",
  "wanted a clearer route for urgent questions",
  "said the signs helped only when the entrance was staffed",
  "reported that several users arrived without reading the reminder",
  "thought the trial helped confident users more than anxious users",
  "said the new process was easier to explain than the old one",
  "noted that quiet periods were still underused",
  "wanted the comparison site to have similar opening hours",
  "said some users needed reassurance before trying the change",
  "reported that the most useful feedback came from repeat users",
  "thought the change reduced interruptions but not complex queries",
  "asked for translated instructions before a wider rollout",
  "said the trial worked less well when equipment was shared",
  "noticed that weather affected attendance on two days",
  "thought staff confidence improved as the trial went on",
  "said several users confused the trial with a permanent policy",
  "wanted clearer wording about what had not changed",
  "reported that the trial shifted demand rather than removing it",
  "said the strongest support came from users with fixed routines",
  "thought the next review should include unsuccessful users",
  "asked for better data on people who chose not to take part",
] as const;

function makeVrObservation(setIndex: number) {
  const group = pick(VR_OBSERVATION_GROUPS, setIndex * 31);
  const detail = pick(VR_OBSERVATION_DETAILS, setIndex * 37);

  switch (setIndex % 6) {
    case 0:
      return `Staff also logged comments from ${group}, who ${detail}.`;
    case 1:
      return `A separate note recorded this from ${group}: they ${detail}.`;
    case 2:
      return `Informal feedback from ${group} added another point: they ${detail}.`;
    case 3:
      return `The review included a short comment from ${group}, who ${detail}.`;
    case 4:
      return `Alongside the figures, feedback from ${group} recorded that they ${detail}.`;
    default:
      return `The team also recorded a point from ${group}: they ${detail}.`;
  }
}

function makeVrPassage(input: {
  setIndex: number;
  setting: string;
  project: string;
  group: string;
  problem: string;
  aim: string;
  oldRoutine: string;
  funder: string;
  metric: string;
  metricVerb: string;
  firstMetric: number;
  secondMetric: number;
  caveat: string;
  limitation: string;
  followUpNote: string;
}) {
  const metricSentence = `During the six-week trial, ${input.metric} ${input.metricVerb} from ${input.firstMetric} to ${input.secondMetric}.`;
  const followUp = input.followUpNote.trim();
  const followUpSentence = followUp ? ` ${followUp}` : "";
  const recommendation =
    `The recommendation was to keep the project for one more term and compare demand with a similar site before wider rollout.${followUpSentence}`;
  const caution =
    `The review said the figures were encouraging but should be treated carefully because ${input.caveat}. It also noted that ${input.limitation}.`;
  const observation = makeVrObservation(input.setIndex);

  switch (input.setIndex % 12) {
    case 0:
      return [
        `${input.setting} tested ${input.project} for ${input.group} after ${input.problem}. The aim was to ${input.aim}, rather than ${input.oldRoutine}. The project was funded by ${input.funder}.`,
        `${metricSentence} ${caution} ${observation}`,
        recommendation,
      ];
    case 1:
      return [
        `${input.problem} led ${input.setting} to try ${input.project} with ${input.group}. Managers described it as a limited service change: it was intended to ${input.aim}, not to ${input.oldRoutine}. Funding came from ${input.funder}.`,
        `${metricSentence} The improvement looked useful at first, but the review linked its caution to the fact that ${input.caveat}. A second uncertainty was that ${input.limitation}. ${observation}`,
        recommendation,
      ];
    case 2:
      return [
        `At ${input.setting}, ${input.group} were offered ${input.project}. The scheme was introduced because ${input.problem}. It was paid for by ${input.funder} and was framed as a way to ${input.aim}, rather than as a plan to ${input.oldRoutine}.`,
        `${sentenceCase(input.metric)} ${input.metricVerb} from ${input.firstMetric} to ${input.secondMetric} over six weeks. Reviewers said this was promising, while warning that ${input.caveat}. They also pointed out that ${input.limitation}. ${observation}`,
        recommendation,
      ];
    case 3:
      return [
        `${input.setting} did not begin with a full redesign. Instead, after ${input.problem}, it ran a six-week test of ${input.project} for ${input.group}. The project was funded by ${input.funder}.`,
        `The stated aim was to ${input.aim}; managers explicitly avoided using it to ${input.oldRoutine}. ${metricSentence}`,
        `${caution} ${observation} ${recommendation}`,
      ];
    case 4:
      return [
        `A short review at ${input.setting} considered whether ${input.project} helped ${input.group}. The idea followed reports that ${input.problem}. ${sentenceCase(input.funder)} funded the work.`,
        `The project was meant to ${input.aim}. It was not presented as a route to ${input.oldRoutine}. Over six weeks, ${input.metric} ${input.metricVerb} from ${input.firstMetric} to ${input.secondMetric}.`,
        `${caution} ${observation} ${recommendation}`,
      ];
    case 5:
      return [
        `${input.group} at ${input.setting} were invited to use ${input.project} after staff found that ${input.problem}. The funding source was ${input.funder}.`,
        `Although the project aimed to ${input.aim}, the review stressed that it should not be read as an attempt to ${input.oldRoutine}. ${metricSentence}`,
        `The figures were not treated as conclusive because ${input.caveat}. The review also recorded that ${input.limitation}. ${observation} ${recommendation}`,
      ];
    case 6:
      return [
        `${input.setting} used ${input.funder} to run a trial of ${input.project}. It targeted ${input.group}, following concern that ${input.problem}.`,
        `Its purpose was to ${input.aim}, not to ${input.oldRoutine}. ${sentenceCase(input.metric)} ${input.metricVerb} from ${input.firstMetric} to ${input.secondMetric} during the trial.`,
        `Reviewers called the change encouraging but qualified that judgement because ${input.caveat}; they also noted that ${input.limitation}. ${observation} ${recommendation}`,
      ];
    case 7:
      return [
        `When ${input.setting} introduced ${input.project}, it described the change as deliberately modest. The problem was that ${input.problem}, and the intended users were ${input.group}.`,
        `The project, funded by ${input.funder}, aimed to ${input.aim}. It was not supposed to ${input.oldRoutine}. ${metricSentence}`,
        `${caution} ${observation} ${recommendation}`,
      ];
    case 8:
      return [
        `A six-week pilot at ${input.setting} offered ${input.project} to ${input.group}. It responded to the finding that ${input.problem}, and used funding from ${input.funder}.`,
        `Staff wanted to ${input.aim}, while avoiding a wider change that would ${input.oldRoutine}. The recorded outcome was that ${input.metric} ${input.metricVerb} from ${input.firstMetric} to ${input.secondMetric}.`,
        `The review was cautious because ${input.caveat}. It further noted that ${input.limitation}. ${observation} ${recommendation}`,
      ];
    case 9:
      return [
        `${input.setting} trialled ${input.project} after ${input.problem}. The trial was for ${input.group} and was funded by ${input.funder}.`,
        `Rather than using the project to ${input.oldRoutine}, staff said they wanted to ${input.aim}. ${metricSentence}`,
        `The report treated the result as provisional: ${input.caveat}, and ${input.limitation}. ${observation} ${recommendation}`,
      ];
    case 10:
      return [
        `${input.funder} funded ${input.project} at ${input.setting}. The project focused on ${input.group}, because ${input.problem}.`,
        `Its aim was to ${input.aim}; it was not a proposal to ${input.oldRoutine}. Six-week data showed that ${input.metric} ${input.metricVerb} from ${input.firstMetric} to ${input.secondMetric}.`,
        `${caution} ${observation} ${recommendation}`,
      ];
    default:
      return [
        `${input.setting} selected ${input.project} as a temporary response after ${input.problem}. It was aimed at ${input.group} and funded by ${input.funder}.`,
        `The change was intended to ${input.aim}, not to ${input.oldRoutine}. The main recorded measure was that ${input.metric} ${input.metricVerb} from ${input.firstMetric} to ${input.secondMetric}.`,
        `However, ${input.caveat}, and ${input.limitation}. ${observation} Reviewers therefore avoided a firm conclusion. ${recommendation}`,
      ];
  }
}

function makeVrSet(setIndex: number): UCATQuestion[] {
  const cycle = Math.floor(setIndex / 1800);
  const setting = pick(ORGANISATIONS, setIndex);
  const project = pick(PROJECTS, setIndex * 3);
  const group = pick(GROUPS, setIndex * 5);
  const problem = pick(PROBLEMS, setIndex * 7);
  const aim = pick(AIMS, setIndex * 11);
  const metric = pick(METRICS, setIndex * 13);
  const metricVerb = metric === "same-day cancellations" ? "fell" : "rose";
  const caveat = pick(CAVEATS, setIndex * 17);
  const limitation = pick(LIMITATIONS, setIndex * 19);
  const funder = pick(FUNDERS, setIndex * 23);
  const wrongFunder = pick(WRONG_FUNDERS, setIndex * 29);
  const oldRoutine = pick(
    [
      "replace the existing service entirely",
      "make every user join a formal course",
      "close the standard booking route",
      "charge everyone a higher fee",
      "move all support online",
    ],
    setIndex
  );
  const firstMetric = 42 + (setIndex % 18) * 3;
  const secondMetric =
    metricVerb === "rose"
      ? firstMetric + 9 + (setIndex % 8)
      : Math.max(4, firstMetric - 8 - (setIndex % 7));
  const followUpNote =
    cycle > 0 ? ` ${pick(FOLLOW_UP_NOTES, setIndex + cycle * 7)}` : "";
  const passage = makeVrPassage({
    setIndex,
    setting,
    project,
    group,
    problem,
    aim,
    oldRoutine,
    funder,
    metric,
    metricVerb,
    firstMetric,
    secondMetric,
    caveat,
    limitation,
    followUpNote,
  });
  const setId = `hq-vr-${pad(setIndex)}`;
  const tfcKind = setIndex % 4;
  const tfcStatement =
    tfcKind === 0
      ? `The project was funded by ${funder}.`
      : tfcKind === 1
        ? `The project was funded by ${wrongFunder}.`
        : tfcKind === 2
          ? `${setting} will definitely roll out the project to every similar site next year.`
          : `${sentenceCase(metric)} ${metricVerb} during the trial.`;
  const tfcAnswer =
    tfcKind === 0 || tfcKind === 3 ? "A" : tfcKind === 1 ? "B" : "C";
  const fourthSubtype = pick(["vr-summary", "vr-author", "vr-negative"] as const, setIndex);

  const questions: UCATQuestion[] = [
    {
      id: `${setId}-1`,
      section: "vr",
      subtype: "vr-tfc",
      setId,
      tags: ["true-false-cant-tell", "text-stem", "set-based", "easy"],
      title: "Verbal Reasoning Practice",
      leftTitle: "Passage",
      stimulus: passage,
      question: tfcStatement,
      options: TFC_OPTIONS,
      answer: tfcAnswer,
      explanation:
        tfcAnswer === "A"
          ? "The statement follows directly from the passage."
          : tfcAnswer === "B"
            ? "The passage gives different information, so the statement is false."
            : "The passage recommends further comparison before wider rollout; it does not confirm a definite full rollout.",
    },
    singleQuestion({
      id: `${setId}-2`,
      section: "vr",
      subtype: "vr-detail",
      setId,
      tags: ["detail-retrieval", "text-stem", "set-based", "easy", "quick"],
      title: "Verbal Reasoning Practice",
      leftTitle: "Passage",
      stimulus: passage,
      question: `Why did ${setting} test ${project}?`,
      correctText: `To ${aim}`,
      distractors: [
        `To ${oldRoutine}`,
        `Because ${wrongFunder} had paid for it`,
        `Because ${limitation}`,
      ],
      explanation: `The first paragraph states that the aim was to ${aim}.`,
      seed: setIndex + 1,
    }),
    singleQuestion({
      id: `${setId}-3`,
      section: "vr",
      subtype: "vr-inference",
      setId,
      tags: ["inference-question", "text-stem", "set-based", "medium"],
      title: "Verbal Reasoning Practice",
      leftTitle: "Passage",
      stimulus: passage,
      question: pick(VR_INFERENCE_QUESTIONS, setIndex),
      correctText:
        "The trial was promising, but the evidence was not strong enough for immediate wider rollout.",
      distractors: [
        "The review proved that the project would work equally well everywhere.",
        "The project failed because the main metric moved in the wrong direction.",
        "The project was mainly introduced to replace all existing support.",
      ],
      explanation:
        "The review called the figures encouraging but recommended another term and comparison with a similar site before wider rollout.",
      seed: setIndex + 2,
    }),
  ];

  if (fourthSubtype === "vr-summary") {
    questions.push(
      singleQuestion({
        id: `${setId}-4`,
        section: "vr",
        subtype: "vr-summary",
        setId,
        tags: ["summary-structure", "text-stem", "set-based", "medium"],
        title: "Verbal Reasoning Practice",
        leftTitle: "Passage",
        stimulus: passage,
        question: pick(VR_SUMMARY_QUESTIONS, setIndex),
        correctText:
          "A small trial produced useful signs of improvement but needed more comparison before expansion.",
        distractors: [
          "A service was closed because a short trial showed no demand.",
          "A national fund required every site to copy one local project immediately.",
          "A project was abandoned after staff refused to collect any data.",
        ],
        explanation:
          "The passage describes a limited trial, encouraging results, caveats and a recommendation for further comparison.",
        seed: setIndex + 3,
      })
    );
  } else if (fourthSubtype === "vr-author") {
    questions.push(
      singleQuestion({
        id: `${setId}-4`,
        section: "vr",
        subtype: "vr-author",
        setId,
        tags: ["author-opinion", "text-stem", "set-based", "medium"],
        title: "Verbal Reasoning Practice",
        leftTitle: "Passage",
        stimulus: passage,
        question: pick(VR_AUTHOR_QUESTIONS, setIndex),
        correctText: "Cautiously positive",
        distractors: ["Completely dismissive", "Certain and unqualified", "Uninterested in the result"],
        explanation:
          "The writer reports encouraging figures but also stresses caveats and further comparison.",
        seed: setIndex + 3,
      })
    );
  } else {
    const negativeKind = setIndex % 4;
    const negativeQuestion = pick(VR_NEGATIVE_QUESTIONS, setIndex);
    const negativeInput =
      negativeKind === 0
        ? {
            question: negativeQuestion,
            correctText: "The project was guaranteed to be used at every similar site.",
            distractors: [
              `The project was funded by ${funder}.`,
              "The trial lasted six weeks.",
              `${sentenceCase(metric)} ${metricVerb} during the trial.`,
            ],
            explanation:
              "The passage recommends another term and comparison; it does not guarantee full rollout.",
          }
        : negativeKind === 1
          ? {
              question: negativeQuestion,
              correctText: `The project was funded by ${funder}.`,
              distractors: [
                `The figures should be treated carefully because ${caveat}.`,
                `The review noted that ${limitation}.`,
                "Demand still needed comparison with a similar site before wider rollout.",
              ],
              explanation:
                "The funding source is stated, but it is not given as a reason for caution. The caveat, limitation and comparison point are all cautionary.",
            }
          : negativeKind === 2
            ? {
                question: negativeQuestion,
                correctText: "Roll the project out immediately to every similar site.",
                distractors: [
                  "Keep the project for one more term.",
                  "Compare demand with a similar site.",
                  "Wait for further comparison before wider rollout.",
                ],
                explanation:
                  "The recommendation was limited: keep the project for one more term and compare demand before wider rollout.",
              }
            : {
                question: negativeQuestion,
                correctText: `The project was funded by ${wrongFunder}.`,
                distractors: [
                  `The aim was to ${aim}.`,
                  `The project was funded by ${funder}.`,
                  `${sentenceCase(metric)} ${metricVerb} during the trial.`,
                ],
                explanation: `The passage says the project was funded by ${funder}, not by ${wrongFunder}.`,
              };

    questions.push(
      singleQuestion({
        id: `${setId}-4`,
        section: "vr",
        subtype: "vr-negative",
        setId,
        tags: ["negative-except", "text-stem", "set-based", "hard"],
        title: "Verbal Reasoning Practice",
        leftTitle: "Passage",
        stimulus: passage,
        question: negativeInput.question,
        correctText: negativeInput.correctText,
        distractors: negativeInput.distractors,
        explanation: negativeInput.explanation,
        seed: setIndex + 3,
      })
    );
  }

  return questions;
}

const HIGH_QUALITY_9000_CURATED_REPLACEMENTS: Record<string, UCATQuestion> = {
  "hq-vr-0001-1": {
    id: "hq-vr-0001-1",
    section: "vr",
    subtype: "vr-tfc",
    setId: "hq-vr-0001",
    tags: ["true-false-cant-tell", "text-stem", "set-based", "easy"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Belford Hospital introduced volunteer wayfinders at the entrance to a new outpatient wing after patients complained that the route from reception to clinic rooms was confusing. The volunteers wore blue sashes and could guide patients to departments, but they were not permitted to answer clinical questions or view appointment lists.",
      "During the eight-week trial, late check-ins fell from 14% to 9%. However, a separate text-message reminder pilot began midway through the same period. Managers also noted that volunteers were mainly available in the mornings, while missed appointments had previously been most common in the afternoon.",
      "The review recommended keeping wayfinders at the entrance for three more months while testing whether clearer signs could achieve a similar result. It warned against treating the fall in late arrivals as proof that the volunteers alone had caused the improvement.",
    ],
    question:
      "The volunteer wayfinders were allowed to view patients' appointment lists. According to the passage, this statement is:",
    options: TFC_OPTIONS,
    answer: "B",
    explanation:
      "The passage says the volunteers could guide patients to departments, but were not permitted to view appointment lists.",
  },
  "hq-vr-0001-2": {
    id: "hq-vr-0001-2",
    section: "vr",
    subtype: "vr-detail",
    setId: "hq-vr-0001",
    tags: ["detail-retrieval", "text-stem", "set-based", "easy", "quick"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Belford Hospital introduced volunteer wayfinders at the entrance to a new outpatient wing after patients complained that the route from reception to clinic rooms was confusing. The volunteers wore blue sashes and could guide patients to departments, but they were not permitted to answer clinical questions or view appointment lists.",
      "During the eight-week trial, late check-ins fell from 14% to 9%. However, a separate text-message reminder pilot began midway through the same period. Managers also noted that volunteers were mainly available in the mornings, while missed appointments had previously been most common in the afternoon.",
      "The review recommended keeping wayfinders at the entrance for three more months while testing whether clearer signs could achieve a similar result. It warned against treating the fall in late arrivals as proof that the volunteers alone had caused the improvement.",
    ],
    question: "Which factor limited the interpretation of the late check-in figures?",
    options: [
      { key: "A", text: "The volunteers refused to guide patients to clinic rooms." },
      { key: "B", text: "A text-message reminder pilot overlapped with part of the trial." },
      { key: "C", text: "Late check-ins increased during the eight-week period." },
      { key: "D", text: "Managers cancelled the plan to test clearer signs." },
    ],
    answer: "B",
    explanation:
      "The text-message reminder pilot began midway through the same period, making it harder to attribute the change only to wayfinders.",
  },
  "hq-vr-0001-3": {
    id: "hq-vr-0001-3",
    section: "vr",
    subtype: "vr-inference",
    setId: "hq-vr-0001",
    tags: ["inference-question", "text-stem", "set-based", "medium"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Belford Hospital introduced volunteer wayfinders at the entrance to a new outpatient wing after patients complained that the route from reception to clinic rooms was confusing. The volunteers wore blue sashes and could guide patients to departments, but they were not permitted to answer clinical questions or view appointment lists.",
      "During the eight-week trial, late check-ins fell from 14% to 9%. However, a separate text-message reminder pilot began midway through the same period. Managers also noted that volunteers were mainly available in the mornings, while missed appointments had previously been most common in the afternoon.",
      "The review recommended keeping wayfinders at the entrance for three more months while testing whether clearer signs could achieve a similar result. It warned against treating the fall in late arrivals as proof that the volunteers alone had caused the improvement.",
    ],
    question: "Which judgement is best supported by the passage?",
    options: [
      { key: "A", text: "The wayfinders may have helped, but the evidence did not isolate their effect." },
      { key: "B", text: "The wayfinders were introduced mainly to answer patients' clinical questions." },
      { key: "C", text: "The hospital proved that signs would be less effective than volunteers." },
      { key: "D", text: "Afternoon appointments were excluded from the trial." },
    ],
    answer: "A",
    explanation:
      "The passage describes improved late check-ins, but also gives overlapping reminders, uneven volunteer availability and a recommendation for further testing.",
  },
  "hq-vr-0001-4": {
    id: "hq-vr-0001-4",
    section: "vr",
    subtype: "vr-summary",
    setId: "hq-vr-0001",
    tags: ["summary-structure", "text-stem", "set-based", "medium"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Belford Hospital introduced volunteer wayfinders at the entrance to a new outpatient wing after patients complained that the route from reception to clinic rooms was confusing. The volunteers wore blue sashes and could guide patients to departments, but they were not permitted to answer clinical questions or view appointment lists.",
      "During the eight-week trial, late check-ins fell from 14% to 9%. However, a separate text-message reminder pilot began midway through the same period. Managers also noted that volunteers were mainly available in the mornings, while missed appointments had previously been most common in the afternoon.",
      "The review recommended keeping wayfinders at the entrance for three more months while testing whether clearer signs could achieve a similar result. It warned against treating the fall in late arrivals as proof that the volunteers alone had caused the improvement.",
    ],
    question: "Which title best captures the passage?",
    options: [
      { key: "A", text: "Why volunteers were allowed to replace reception staff" },
      { key: "B", text: "A navigation trial with encouraging but uncertain results" },
      { key: "C", text: "How text reminders ended outpatient late arrivals" },
      { key: "D", text: "A hospital decision to abandon clearer signs" },
    ],
    answer: "B",
    explanation:
      "The passage focuses on a wayfinding trial, an apparent improvement and the reasons the review treated that improvement cautiously.",
  },
  "hq-vr-0002-1": {
    id: "hq-vr-0002-1",
    section: "vr",
    subtype: "vr-tfc",
    setId: "hq-vr-0002",
    tags: ["true-false-cant-tell", "text-stem", "set-based", "easy"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Northmere Archive placed short audio clips from its oral-history collection on a public website. The archivist selected extracts from interviews with former mill workers because the full recordings were difficult for casual visitors to search. Full transcripts remained available in the reading room.",
      "The website attracted more school users than the archive had expected. Some researchers, however, argued that the clips overemphasised dramatic memories of closures and strikes, while everyday accounts of routine work were less visible. Staff replied that each clip linked to the catalogue record for the complete interview.",
      "An advisory panel supported keeping the clips online, but asked the archive to add notes explaining how extracts were chosen and why remembered events might differ between interviewees. The panel said the website should be treated as an entry point, not as a replacement for the full collection.",
    ],
    question:
      "The archive withdrew full transcripts once the audio clips were placed online. According to the passage, this statement is:",
    options: TFC_OPTIONS,
    answer: "B",
    explanation:
      "The passage says full transcripts remained available in the reading room, so the statement is false.",
  },
  "hq-vr-0002-2": {
    id: "hq-vr-0002-2",
    section: "vr",
    subtype: "vr-detail",
    setId: "hq-vr-0002",
    tags: ["detail-retrieval", "text-stem", "set-based", "easy", "quick"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Northmere Archive placed short audio clips from its oral-history collection on a public website. The archivist selected extracts from interviews with former mill workers because the full recordings were difficult for casual visitors to search. Full transcripts remained available in the reading room.",
      "The website attracted more school users than the archive had expected. Some researchers, however, argued that the clips overemphasised dramatic memories of closures and strikes, while everyday accounts of routine work were less visible. Staff replied that each clip linked to the catalogue record for the complete interview.",
      "An advisory panel supported keeping the clips online, but asked the archive to add notes explaining how extracts were chosen and why remembered events might differ between interviewees. The panel said the website should be treated as an entry point, not as a replacement for the full collection.",
    ],
    question: "Why did the archivist select short extracts for the website?",
    options: [
      { key: "A", text: "The complete recordings were difficult for casual visitors to search." },
      { key: "B", text: "Researchers had asked for dramatic memories to be removed." },
      { key: "C", text: "The advisory panel wanted to close the reading room." },
      { key: "D", text: "The full transcripts had been lost." },
    ],
    answer: "A",
    explanation:
      "The first paragraph states that full recordings were difficult for casual visitors to search, so short extracts were selected.",
  },
  "hq-vr-0002-3": {
    id: "hq-vr-0002-3",
    section: "vr",
    subtype: "vr-inference",
    setId: "hq-vr-0002",
    tags: ["inference-question", "text-stem", "set-based", "medium"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Northmere Archive placed short audio clips from its oral-history collection on a public website. The archivist selected extracts from interviews with former mill workers because the full recordings were difficult for casual visitors to search. Full transcripts remained available in the reading room.",
      "The website attracted more school users than the archive had expected. Some researchers, however, argued that the clips overemphasised dramatic memories of closures and strikes, while everyday accounts of routine work were less visible. Staff replied that each clip linked to the catalogue record for the complete interview.",
      "An advisory panel supported keeping the clips online, but asked the archive to add notes explaining how extracts were chosen and why remembered events might differ between interviewees. The panel said the website should be treated as an entry point, not as a replacement for the full collection.",
    ],
    question: "Which inference is best supported by the passage?",
    options: [
      { key: "A", text: "The clips broadened access but could distort understanding if used alone." },
      { key: "B", text: "The archive regarded school users as less important than researchers." },
      { key: "C", text: "The advisory panel opposed public access to oral-history material." },
      { key: "D", text: "Every interviewee remembered the same events in the same way." },
    ],
    answer: "A",
    explanation:
      "The clips attracted school users, but the panel wanted selection notes and warned that the website was only an entry point.",
  },
  "hq-vr-0002-4": {
    id: "hq-vr-0002-4",
    section: "vr",
    subtype: "vr-author",
    setId: "hq-vr-0002",
    tags: ["author-opinion", "text-stem", "set-based", "medium"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Northmere Archive placed short audio clips from its oral-history collection on a public website. The archivist selected extracts from interviews with former mill workers because the full recordings were difficult for casual visitors to search. Full transcripts remained available in the reading room.",
      "The website attracted more school users than the archive had expected. Some researchers, however, argued that the clips overemphasised dramatic memories of closures and strikes, while everyday accounts of routine work were less visible. Staff replied that each clip linked to the catalogue record for the complete interview.",
      "An advisory panel supported keeping the clips online, but asked the archive to add notes explaining how extracts were chosen and why remembered events might differ between interviewees. The panel said the website should be treated as an entry point, not as a replacement for the full collection.",
    ],
    question: "The author's attitude towards the website is best described as:",
    options: [
      { key: "A", text: "Supportive of access, but alert to the need for context." },
      { key: "B", text: "Hostile to any use of selected audio extracts." },
      { key: "C", text: "Certain that short clips are more reliable than transcripts." },
      { key: "D", text: "Indifferent to how the clips are selected." },
    ],
    answer: "A",
    explanation:
      "The passage notes access benefits and the panel's support, while also emphasising context, selection notes and limits.",
  },
  "hq-vr-0004-1": {
    id: "hq-vr-0004-1",
    section: "vr",
    subtype: "vr-tfc",
    setId: "hq-vr-0004",
    tags: ["true-false-cant-tell", "text-stem", "set-based", "easy"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Greenborough Market asked stallholders to weigh unsold produce before it was donated or sent for composting. The council said the aim was to identify patterns in waste rather than to rank individual traders. Volunteers helped with weighing during the first month because some smaller stalls had limited staff.",
      "The first set of figures showed a fall in produce sent to compost. Yet the market manager noted that unusually dry weather had reduced damaged stock that month, and a new delivery schedule had also started. The stall with the largest recorded waste sold soft berries, which spoiled more quickly than root vegetables.",
      "The council kept the weighing scheme but simplified the categories on the recording sheet. It also planned to compare the results with a nearby market where weighing had not been introduced.",
    ],
    question:
      "The stall with the largest recorded waste was necessarily the least efficient stall. According to the passage, this statement is:",
    options: TFC_OPTIONS,
    answer: "B",
    explanation:
      "The passage says that stall sold soft berries, which spoiled more quickly, so the figure does not necessarily show inefficiency.",
  },
  "hq-vr-0004-2": {
    id: "hq-vr-0004-2",
    section: "vr",
    subtype: "vr-detail",
    setId: "hq-vr-0004",
    tags: ["detail-retrieval", "text-stem", "set-based", "easy", "quick"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Greenborough Market asked stallholders to weigh unsold produce before it was donated or sent for composting. The council said the aim was to identify patterns in waste rather than to rank individual traders. Volunteers helped with weighing during the first month because some smaller stalls had limited staff.",
      "The first set of figures showed a fall in produce sent to compost. Yet the market manager noted that unusually dry weather had reduced damaged stock that month, and a new delivery schedule had also started. The stall with the largest recorded waste sold soft berries, which spoiled more quickly than root vegetables.",
      "The council kept the weighing scheme but simplified the categories on the recording sheet. It also planned to compare the results with a nearby market where weighing had not been introduced.",
    ],
    question: "Why were volunteers used during the first month?",
    options: [
      { key: "A", text: "Some smaller stalls had limited staff available for weighing." },
      { key: "B", text: "The council wanted volunteers to rank traders publicly." },
      { key: "C", text: "The delivery schedule had been cancelled." },
      { key: "D", text: "The nearby market had already introduced weighing." },
    ],
    answer: "A",
    explanation:
      "The passage states that volunteers helped because some smaller stalls had limited staff.",
  },
  "hq-vr-0004-3": {
    id: "hq-vr-0004-3",
    section: "vr",
    subtype: "vr-inference",
    setId: "hq-vr-0004",
    tags: ["inference-question", "text-stem", "set-based", "medium"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Greenborough Market asked stallholders to weigh unsold produce before it was donated or sent for composting. The council said the aim was to identify patterns in waste rather than to rank individual traders. Volunteers helped with weighing during the first month because some smaller stalls had limited staff.",
      "The first set of figures showed a fall in produce sent to compost. Yet the market manager noted that unusually dry weather had reduced damaged stock that month, and a new delivery schedule had also started. The stall with the largest recorded waste sold soft berries, which spoiled more quickly than root vegetables.",
      "The council kept the weighing scheme but simplified the categories on the recording sheet. It also planned to compare the results with a nearby market where weighing had not been introduced.",
    ],
    question: "Which inference is best supported?",
    options: [
      { key: "A", text: "The waste data needed context before conclusions were drawn." },
      { key: "B", text: "The scheme proved that all market waste was caused by poor traders." },
      { key: "C", text: "Dry weather increased the amount of damaged stock." },
      { key: "D", text: "The council abandoned weighing after the first month." },
    ],
    answer: "A",
    explanation:
      "The passage gives several reasons for caution: weather, delivery changes and differences between types of produce.",
  },
  "hq-vr-0004-4": {
    id: "hq-vr-0004-4",
    section: "vr",
    subtype: "vr-summary",
    setId: "hq-vr-0004",
    tags: ["summary-structure", "text-stem", "set-based", "medium"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Greenborough Market asked stallholders to weigh unsold produce before it was donated or sent for composting. The council said the aim was to identify patterns in waste rather than to rank individual traders. Volunteers helped with weighing during the first month because some smaller stalls had limited staff.",
      "The first set of figures showed a fall in produce sent to compost. Yet the market manager noted that unusually dry weather had reduced damaged stock that month, and a new delivery schedule had also started. The stall with the largest recorded waste sold soft berries, which spoiled more quickly than root vegetables.",
      "The council kept the weighing scheme but simplified the categories on the recording sheet. It also planned to compare the results with a nearby market where weighing had not been introduced.",
    ],
    question: "Which option best summarises the passage?",
    options: [
      { key: "A", text: "A weighing scheme produced useful data, but the results needed careful comparison." },
      { key: "B", text: "The council used waste figures to punish the least efficient traders." },
      { key: "C", text: "A nearby market proved weighing was unnecessary." },
      { key: "D", text: "Volunteers replaced stallholders permanently." },
    ],
    answer: "A",
    explanation:
      "The passage describes the purpose of weighing, early results, reasons for caution and a plan for comparison.",
  },
  "hq-qr-revenue-0001-1": {
    id: "hq-qr-revenue-0001-1",
    section: "qr",
    subtype: "qr-graphs",
    setId: "hq-qr-revenue-0001",
    tags: ["data-display", "set-based", "easy", "quick"],
    title: "Quantitative Reasoning Practice",
    leftTitle: "Data",
    stimulus: ["The table shows fees and bookings for community first-aid courses at four centres."],
    visual: {
      type: "table",
      title: "Community first-aid course bookings",
      headers: ["Centre", "Online fee", "Online bookings", "In-person fee", "In-person bookings"],
      rows: [
        ["North", "GBP 18.00", "420", "GBP 24.00", "310"],
        ["East", "GBP 16.50", "380", "GBP 22.00", "260"],
        ["South", "GBP 20.00", "295", "GBP 26.00", "335"],
        ["West", "GBP 17.50", "450", "GBP 23.50", "280"],
      ],
    },
    question: "How many bookings were made at centres where in-person bookings exceeded online bookings?",
    options: [
      { key: "A", text: "595" },
      { key: "B", text: "630" },
      { key: "C", text: "675" },
      { key: "D", text: "1,225" },
    ],
    answer: "B",
    explanation:
      "Only South had more in-person than online bookings. Its total bookings were 295 + 335 = 630.",
  },
  "hq-qr-revenue-0001-2": {
    id: "hq-qr-revenue-0001-2",
    section: "qr",
    subtype: "qr-percentages",
    setId: "hq-qr-revenue-0001",
    tags: ["data-display", "set-based", "medium", "calculator-heavy"],
    title: "Quantitative Reasoning Practice",
    leftTitle: "Data",
    stimulus: ["The table shows fees and bookings for community first-aid courses at four centres."],
    visual: {
      type: "table",
      title: "Community first-aid course bookings",
      headers: ["Centre", "Online fee", "Online bookings", "In-person fee", "In-person bookings"],
      rows: [
        ["North", "GBP 18.00", "420", "GBP 24.00", "310"],
        ["East", "GBP 16.50", "380", "GBP 22.00", "260"],
        ["South", "GBP 20.00", "295", "GBP 26.00", "335"],
        ["West", "GBP 17.50", "450", "GBP 23.50", "280"],
      ],
    },
    question: "What percentage of all in-person bookings were at North and South combined?",
    options: [
      { key: "A", text: "48.9%" },
      { key: "B", text: "54.4%" },
      { key: "C", text: "58.8%" },
      { key: "D", text: "64.5%" },
    ],
    answer: "B",
    explanation:
      "In-person bookings total 310 + 260 + 335 + 280 = 1,185. North and South together have 310 + 335 = 645. 645 / 1,185 x 100 = 54.4%.",
  },
  "hq-qr-revenue-0001-3": {
    id: "hq-qr-revenue-0001-3",
    section: "qr",
    subtype: "qr-rates-ratios",
    setId: "hq-qr-revenue-0001",
    tags: ["data-display", "set-based", "medium", "multi-step"],
    title: "Quantitative Reasoning Practice",
    leftTitle: "Data",
    stimulus: ["The table shows fees and bookings for community first-aid courses at four centres."],
    visual: {
      type: "table",
      title: "Community first-aid course bookings",
      headers: ["Centre", "Online fee", "Online bookings", "In-person fee", "In-person bookings"],
      rows: [
        ["North", "GBP 18.00", "420", "GBP 24.00", "310"],
        ["East", "GBP 16.50", "380", "GBP 22.00", "260"],
        ["South", "GBP 20.00", "295", "GBP 26.00", "335"],
        ["West", "GBP 17.50", "450", "GBP 23.50", "280"],
      ],
    },
    question: "For East and West combined, what was the ratio of online bookings to in-person bookings?",
    options: [
      { key: "A", text: "83:54" },
      { key: "B", text: "54:83" },
      { key: "C", text: "19:13" },
      { key: "D", text: "830:560" },
    ],
    answer: "A",
    explanation:
      "East and West online bookings were 380 + 450 = 830. In-person bookings were 260 + 280 = 540. The ratio 830:540 simplifies to 83:54.",
  },
  "hq-qr-revenue-0001-4": {
    id: "hq-qr-revenue-0001-4",
    section: "qr",
    subtype: "qr-calculator-strategy",
    setId: "hq-qr-revenue-0001",
    tags: ["data-display", "set-based", "hard", "calculator-heavy", "time-consuming"],
    title: "Quantitative Reasoning Practice",
    leftTitle: "Data",
    stimulus: ["The table shows fees and bookings for community first-aid courses at four centres."],
    visual: {
      type: "table",
      title: "Community first-aid course bookings",
      headers: ["Centre", "Online fee", "Online bookings", "In-person fee", "In-person bookings"],
      rows: [
        ["North", "GBP 18.00", "420", "GBP 24.00", "310"],
        ["East", "GBP 16.50", "380", "GBP 22.00", "260"],
        ["South", "GBP 20.00", "295", "GBP 26.00", "335"],
        ["West", "GBP 17.50", "450", "GBP 23.50", "280"],
      ],
    },
    question:
      "At North and East combined, how much more revenue was made from online bookings than from in-person bookings?",
    options: [
      { key: "A", text: "GBP 670.00" },
      { key: "B", text: "GBP 1,410.00" },
      { key: "C", text: "GBP 13,160.00" },
      { key: "D", text: "GBP 26,990.00" },
    ],
    answer: "A",
    explanation:
      "Online revenue at North and East was 18 x 420 + 16.50 x 380 = GBP 13,830.00. In-person revenue was 24 x 310 + 22 x 260 = GBP 13,160.00. The difference is GBP 670.00.",
  },
  "hq-qr-trend-0002-1": {
    id: "hq-qr-trend-0002-1",
    section: "qr",
    subtype: "qr-graphs",
    setId: "hq-qr-trend-0002",
    tags: ["data-display", "set-based", "easy", "quick"],
    title: "Quantitative Reasoning Practice",
    leftTitle: "Chart",
    stimulus: ["The line chart shows the average number of patient call-backs waiting at 5 pm each day."],
    visual: {
      type: "line",
      title: "Call-backs waiting at 5 pm",
      yLabel: "Call-backs",
      max: 170,
      points: [
        { label: "Mon", value: 96 },
        { label: "Tue", value: 124 },
        { label: "Wed", value: 118 },
        { label: "Thu", value: 151 },
        { label: "Fri", value: 139 },
      ],
    },
    question: "Between which two consecutive days was the increase in waiting call-backs greatest?",
    options: [
      { key: "A", text: "Monday to Tuesday" },
      { key: "B", text: "Tuesday to Wednesday" },
      { key: "C", text: "Wednesday to Thursday" },
      { key: "D", text: "Thursday to Friday" },
    ],
    answer: "C",
    explanation:
      "The increases were 28 from Monday to Tuesday and 33 from Wednesday to Thursday. Other changes were decreases, so the greatest increase was Wednesday to Thursday.",
  },
  "hq-qr-trend-0002-2": {
    id: "hq-qr-trend-0002-2",
    section: "qr",
    subtype: "qr-averages",
    setId: "hq-qr-trend-0002",
    tags: ["data-display", "set-based", "medium"],
    title: "Quantitative Reasoning Practice",
    leftTitle: "Chart",
    stimulus: ["The line chart shows the average number of patient call-backs waiting at 5 pm each day."],
    visual: {
      type: "line",
      title: "Call-backs waiting at 5 pm",
      yLabel: "Call-backs",
      max: 170,
      points: [
        { label: "Mon", value: 96 },
        { label: "Tue", value: 124 },
        { label: "Wed", value: 118 },
        { label: "Thu", value: 151 },
        { label: "Fri", value: 139 },
      ],
    },
    question: "A target says the five-day mean should be at most 122 call-backs. By how many did this week's mean exceed the target?",
    options: [
      { key: "A", text: "2.4" },
      { key: "B", text: "3.6" },
      { key: "C", text: "4.8" },
      { key: "D", text: "5.6" },
    ],
    answer: "B",
    explanation:
      "The total is 96 + 124 + 118 + 151 + 139 = 628. The mean is 628 / 5 = 125.6, which is 3.6 above 122.",
  },
  "hq-qr-trend-0002-3": {
    id: "hq-qr-trend-0002-3",
    section: "qr",
    subtype: "qr-estimation",
    setId: "hq-qr-trend-0002",
    tags: ["data-display", "set-based", "medium", "multi-step"],
    title: "Quantitative Reasoning Practice",
    leftTitle: "Chart",
    stimulus: ["The line chart shows the average number of patient call-backs waiting at 5 pm each day."],
    visual: {
      type: "line",
      title: "Call-backs waiting at 5 pm",
      yLabel: "Call-backs",
      max: 170,
      points: [
        { label: "Mon", value: 96 },
        { label: "Tue", value: 124 },
        { label: "Wed", value: 118 },
        { label: "Thu", value: 151 },
        { label: "Fri", value: 139 },
      ],
    },
    question:
      "Using quick rounding to the nearest 10, what is the best estimate of the combined Thursday and Friday call-backs?",
    options: [
      { key: "A", text: "270" },
      { key: "B", text: "290" },
      { key: "C", text: "310" },
      { key: "D", text: "330" },
    ],
    answer: "B",
    explanation:
      "Round Thursday's 151 to 150 and Friday's 139 to 140. The estimated total is 290.",
  },
  "hq-qr-trend-0002-4": {
    id: "hq-qr-trend-0002-4",
    section: "qr",
    subtype: "qr-percentages",
    setId: "hq-qr-trend-0002",
    tags: ["data-display", "set-based", "hard", "calculator-heavy"],
    title: "Quantitative Reasoning Practice",
    leftTitle: "Chart",
    stimulus: ["The line chart shows the average number of patient call-backs waiting at 5 pm each day."],
    visual: {
      type: "line",
      title: "Call-backs waiting at 5 pm",
      yLabel: "Call-backs",
      max: 170,
      points: [
        { label: "Mon", value: 96 },
        { label: "Tue", value: 124 },
        { label: "Wed", value: 118 },
        { label: "Thu", value: 151 },
        { label: "Fri", value: 139 },
      ],
    },
    question:
      "A manager says Friday's figure was at least 10% lower than Thursday's. Which option is correct?",
    options: [
      { key: "A", text: "Yes, it was about 12% lower." },
      { key: "B", text: "No, it was about 8% lower." },
      { key: "C", text: "No, it was about 3% lower." },
      { key: "D", text: "Yes, it was about 18% lower." },
    ],
    answer: "B",
    explanation:
      "The fall was 151 - 139 = 12. As a percentage of Thursday, 12 / 151 x 100 is about 8%, so it was not at least 10% lower.",
  },
  "hq-qr-rate-0003-1": {
    id: "hq-qr-rate-0003-1",
    section: "qr",
    subtype: "qr-rates-ratios",
    setId: "hq-qr-rate-0003",
    tags: ["text-stem", "set-based", "easy"],
    title: "Quantitative Reasoning Practice",
    leftTitle: "Stem",
    stimulus: [
      "A mobile clinic leaves its depot, travels 18 km to Village A at 36 km/h and spends 22 minutes there. It then travels 12 km to Village B at 30 km/h and spends 18 minutes there. It returns 24 km to the depot at 48 km/h.",
    ],
    question: "How long after leaving the depot does the clinic arrive at Village B?",
    options: [
      { key: "A", text: "54 minutes" },
      { key: "B", text: "72 minutes" },
      { key: "C", text: "76 minutes" },
      { key: "D", text: "94 minutes" },
    ],
    answer: "C",
    explanation:
      "Depot to Village A takes 18 / 36 hours = 30 minutes. Add 22 minutes at Village A and 12 / 30 hours = 24 minutes to Village B. Total = 76 minutes.",
  },
  "hq-qr-rate-0003-2": {
    id: "hq-qr-rate-0003-2",
    section: "qr",
    subtype: "qr-averages",
    setId: "hq-qr-rate-0003",
    tags: ["text-stem", "set-based", "medium", "multi-step"],
    title: "Quantitative Reasoning Practice",
    leftTitle: "Stem",
    stimulus: [
      "A mobile clinic leaves its depot, travels 18 km to Village A at 36 km/h and spends 22 minutes there. It then travels 12 km to Village B at 30 km/h and spends 18 minutes there. It returns 24 km to the depot at 48 km/h.",
    ],
    question: "Including both stops, what is the total time for the whole trip?",
    options: [
      { key: "A", text: "84 minutes" },
      { key: "B", text: "106 minutes" },
      { key: "C", text: "124 minutes" },
      { key: "D", text: "142 minutes" },
    ],
    answer: "C",
    explanation:
      "Travel times are 30, 24 and 30 minutes. Stops are 22 and 18 minutes. Total = 30 + 22 + 24 + 18 + 30 = 124 minutes.",
  },
  "hq-qr-rate-0003-3": {
    id: "hq-qr-rate-0003-3",
    section: "qr",
    subtype: "qr-rates-ratios",
    setId: "hq-qr-rate-0003",
    tags: ["text-stem", "set-based", "hard", "multi-step"],
    title: "Quantitative Reasoning Practice",
    leftTitle: "Stem",
    stimulus: [
      "A mobile clinic leaves its depot, travels 18 km to Village A at 36 km/h and spends 22 minutes there. It then travels 12 km to Village B at 30 km/h and spends 18 minutes there. It returns 24 km to the depot at 48 km/h.",
    ],
    question: "What is the average travelling speed, excluding time spent at the stops?",
    options: [
      { key: "A", text: "32.1 km/h" },
      { key: "B", text: "38.6 km/h" },
      { key: "C", text: "41.0 km/h" },
      { key: "D", text: "48.0 km/h" },
    ],
    answer: "B",
    explanation:
      "Total distance is 18 + 12 + 24 = 54 km. Travelling time is 30 + 24 + 30 = 84 minutes = 1.4 hours. Average speed = 54 / 1.4 = 38.6 km/h.",
  },
  "hq-qr-rate-0003-4": {
    id: "hq-qr-rate-0003-4",
    section: "qr",
    subtype: "qr-units-geometry",
    setId: "hq-qr-rate-0003",
    tags: ["text-stem", "set-based", "medium"],
    title: "Quantitative Reasoning Practice",
    leftTitle: "Stem",
    stimulus: [
      "A mobile clinic leaves its depot, travels 18 km to Village A at 36 km/h and spends 22 minutes there. It then travels 12 km to Village B at 30 km/h and spends 18 minutes there. It returns 24 km to the depot at 48 km/h.",
      "On a route map, 1 cm represents 3 km.",
    ],
    question: "How long would the whole route be on the map?",
    options: [
      { key: "A", text: "12 cm" },
      { key: "B", text: "16 cm" },
      { key: "C", text: "18 cm" },
      { key: "D", text: "21 cm" },
    ],
    answer: "C",
    explanation:
      "The total route distance is 54 km. At 1 cm for every 3 km, the map length is 54 / 3 = 18 cm.",
  },
  "hq-sjt-0001-1": {
    id: "hq-sjt-0001-1",
    section: "sjt",
    subtype: "sjt-appropriateness",
    setId: "hq-sjt-0001",
    tags: ["text-stem", "set-based", "medium"],
    issueTags: ["confidentiality"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "Nadia, a medical student, is shadowing outpatient reception. A caller says he is collecting a patient after an endoscopy and asks whether the patient has been discharged. He knows the patient's name and date of birth, but he is not listed as a contact. The patient's record says updates should not be given by phone because of a family conflict. The receptionist is on another call and the caller says he only needs to arrange parking.",
    ],
    question:
      "How appropriate is it for Nadia to say she cannot discuss patient details and ask the caller to wait until the receptionist is free, but not take a contact number or mention the transport concern to staff?",
    options: APPROPRIATENESS_OPTIONS,
    answer: "B",
    explanation:
      "This protects confidentiality, so it is appropriate. It is not ideal because Nadia does not help staff follow up the practical transport concern.",
  },
  "hq-sjt-0001-2": {
    id: "hq-sjt-0001-2",
    section: "sjt",
    subtype: "sjt-appropriateness",
    setId: "hq-sjt-0001",
    tags: ["text-stem", "set-based", "medium"],
    issueTags: ["confidentiality"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "Nadia, a medical student, is shadowing outpatient reception. A caller says he is collecting a patient after an endoscopy and asks whether the patient has been discharged. He knows the patient's name and date of birth, but he is not listed as a contact. The patient's record says updates should not be given by phone because of a family conflict. The receptionist is on another call and the caller says he only needs to arrange parking.",
    ],
    question:
      "How appropriate is it for Nadia to confirm that the patient is still in the department because the caller knows the patient's date of birth?",
    options: APPROPRIATENESS_OPTIONS,
    answer: "D",
    explanation:
      "This is very inappropriate. Knowing demographic details does not override the recorded confidentiality concern, and confirming attendance could disclose sensitive information.",
  },
  "hq-sjt-0001-3": {
    id: "hq-sjt-0001-3",
    section: "sjt",
    subtype: "sjt-importance",
    setId: "hq-sjt-0001",
    tags: ["text-stem", "set-based", "medium"],
    issueTags: ["confidentiality"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "Nadia, a medical student, is shadowing outpatient reception. A caller says he is collecting a patient after an endoscopy and asks whether the patient has been discharged. He knows the patient's name and date of birth, but he is not listed as a contact. The patient's record says updates should not be given by phone because of a family conflict. The receptionist is on another call and the caller says he only needs to arrange parking.",
    ],
    question: "How important is the recorded instruction not to give updates by phone?",
    options: IMPORTANCE_OPTIONS,
    answer: "A",
    explanation:
      "This is very important because it directly concerns the patient's confidentiality and expressed restrictions on information sharing.",
  },
  "hq-sjt-0001-4": {
    id: "hq-sjt-0001-4",
    section: "sjt",
    subtype: "sjt-importance",
    setId: "hq-sjt-0001",
    tags: ["text-stem", "set-based", "easy"],
    issueTags: ["confidentiality"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "Nadia, a medical student, is shadowing outpatient reception. A caller says he is collecting a patient after an endoscopy and asks whether the patient has been discharged. He knows the patient's name and date of birth, but he is not listed as a contact. The patient's record says updates should not be given by phone because of a family conflict. The receptionist is on another call and the caller says he only needs to arrange parking.",
    ],
    question: "How important is whether the caller sounds polite and under time pressure?",
    options: IMPORTANCE_OPTIONS,
    answer: "C",
    explanation:
      "This is of minor importance. It may affect how Nadia communicates, but it does not justify disclosing information or ignoring the recorded restriction.",
  },
  "hq-sjt-0001-5": dragCategoryQuestion({
    id: "hq-sjt-0001-5",
    section: "sjt",
    subtype: "sjt-drag-drop",
    setId: "hq-sjt-0001",
    tags: ["text-stem", "set-based", "hard", "multi-step"],
    issueTags: ["confidentiality"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "Nadia, a medical student, is shadowing outpatient reception. A caller says he is collecting a patient after an endoscopy and asks whether the patient has been discharged. He knows the patient's name and date of birth, but he is not listed as a contact. The patient's record says updates should not be given by phone because of a family conflict. The receptionist is on another call and the caller says he only needs to arrange parking.",
    ],
    question: "Sort the actions according to whether they are appropriate in this situation.",
    instruction: "Place each action into the most suitable category.",
    categories: [
      { id: "appropriate", label: "Appropriate" },
      { id: "inappropriate", label: "Inappropriate" },
    ],
    categoryItems: [
      { id: "take-details", text: "Take the caller's details and ask reception staff to advise.", answerCategory: "appropriate" },
      { id: "confirm-attendance", text: "Confirm whether the patient is still in the department.", answerCategory: "inappropriate" },
      { id: "explain-limit", text: "Explain that patient information cannot be discussed by phone without the right authorisation.", answerCategory: "appropriate" },
      { id: "use-dob", text: "Treat the caller's knowledge of the date of birth as enough proof to share discharge information.", answerCategory: "inappropriate" },
    ],
    explanation:
      "Appropriate actions protect confidentiality while involving reception staff. Inappropriate actions disclose or risk disclosing attendance without authority.",
  }),
  "hq-sjt-0002-1": {
    id: "hq-sjt-0002-1",
    section: "sjt",
    subtype: "sjt-appropriateness",
    setId: "hq-sjt-0002",
    tags: ["text-stem", "set-based", "medium"],
    issueTags: ["integrity"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "Owen, a medical student, is helping a placement group finalise an audit poster. The spreadsheet now includes 18 patient-feedback forms, but Owen can only find 14 paper forms in the approved folder. A teammate says the missing four were probably collected and that removing them will make the chart look too small. The poster deadline is later that day.",
    ],
    question:
      "How suitable would it be for Owen to pause the submission, explain that the numbers must match the source data and contact the supervisor with the discrepancy?",
    options: APPROPRIATENESS_OPTIONS,
    answer: "A",
    explanation:
      "This is very appropriate because it protects honesty in the audit while using the supervisor to resolve the uncertainty before submission.",
  },
  "hq-sjt-0002-2": {
    id: "hq-sjt-0002-2",
    section: "sjt",
    subtype: "sjt-appropriateness",
    setId: "hq-sjt-0002",
    tags: ["text-stem", "set-based", "medium"],
    issueTags: ["integrity"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "Owen, a medical student, is helping a placement group finalise an audit poster. The spreadsheet now includes 18 patient-feedback forms, but Owen can only find 14 paper forms in the approved folder. A teammate says the missing four were probably collected and that removing them will make the chart look too small. The poster deadline is later that day.",
    ],
    question:
      "How suitable would it be for Owen to remove the four unverified responses and submit the poster using 14 responses, but not tell the supervisor there was a discrepancy?",
    options: APPROPRIATENESS_OPTIONS,
    answer: "C",
    explanation:
      "This is inappropriate because it hides a data discrepancy from the supervisor. It is not the worst response because Owen would at least avoid submitting unsupported responses.",
  },
  "hq-sjt-0002-3": {
    id: "hq-sjt-0002-3",
    section: "sjt",
    subtype: "sjt-importance",
    setId: "hq-sjt-0002",
    tags: ["text-stem", "set-based", "medium"],
    issueTags: ["integrity"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "Owen, a medical student, is helping a placement group finalise an audit poster. The spreadsheet now includes 18 patient-feedback forms, but Owen can only find 14 paper forms in the approved folder. A teammate says the missing four were probably collected and that removing them will make the chart look too small. The poster deadline is later that day.",
    ],
    question: "How much importance should be given to the poster deadline being later that day?",
    options: IMPORTANCE_OPTIONS,
    answer: "B",
    explanation:
      "The deadline is important because it affects how quickly Owen must act, but it does not outweigh the need for accurate and honest data.",
  },
  "hq-sjt-0002-4": {
    id: "hq-sjt-0002-4",
    section: "sjt",
    subtype: "sjt-importance",
    setId: "hq-sjt-0002",
    tags: ["text-stem", "set-based", "easy"],
    issueTags: ["integrity"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "Owen, a medical student, is helping a placement group finalise an audit poster. The spreadsheet now includes 18 patient-feedback forms, but Owen can only find 14 paper forms in the approved folder. A teammate says the missing four were probably collected and that removing them will make the chart look too small. The poster deadline is later that day.",
    ],
    question: "How much importance should be given to the teammate worrying that the chart will look too small?",
    options: IMPORTANCE_OPTIONS,
    answer: "C",
    explanation:
      "This is of minor importance. It may explain the teammate's concern, but presentation worries do not justify unsupported data.",
  },
  "hq-sjt-0002-5": dragCategoryQuestion({
    id: "hq-sjt-0002-5",
    section: "sjt",
    subtype: "sjt-drag-drop",
    setId: "hq-sjt-0002",
    tags: ["text-stem", "set-based", "hard", "multi-step"],
    issueTags: ["integrity"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "Owen, a medical student, is helping a placement group finalise an audit poster. The spreadsheet now includes 18 patient-feedback forms, but Owen can only find 14 paper forms in the approved folder. A teammate says the missing four were probably collected and that removing them will make the chart look too small. The poster deadline is later that day.",
    ],
    question: "Place each action into the category that best fits this situation.",
    instruction: "Place each action into the most suitable category.",
    categories: [
      { id: "appropriate", label: "Appropriate" },
      { id: "inappropriate", label: "Inappropriate" },
    ],
    categoryItems: [
      { id: "raise-discrepancy", text: "Tell the supervisor the source forms and spreadsheet do not match.", answerCategory: "appropriate" },
      { id: "invent-note", text: "Keep the 18 responses and add a vague limitation so the poster looks complete.", answerCategory: "inappropriate" },
      { id: "use-confirmed", text: "Use only the 14 forms that can be checked unless the missing forms are verified.", answerCategory: "appropriate" },
      { id: "avoid-delay", text: "Submit without mentioning the discrepancy because the deadline is close.", answerCategory: "inappropriate" },
    ],
    explanation:
      "Appropriate actions keep the audit honest and verifiable. Inappropriate actions hide uncertainty or knowingly submit unsupported data.",
  }),
  "hq-vr-0008-1": {
    id: "hq-vr-0008-1",
    section: "vr",
    subtype: "vr-tfc",
    setId: "hq-vr-0008",
    tags: ["true-false-cant-tell", "text-stem", "set-based", "easy"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Westport School introduced a lunch pre-order app after kitchen staff found that popular meals were selling out early while unpopular meals were thrown away. Pupils had to choose by 9:30 am, but staff could still adjust numbers for pupils who arrived late or forgot to order.",
      "In the first half-term, recorded food waste fell by 18%. The catering manager said the figure was promising, although a new supplier had also changed portion sizes during the same period. Teachers reported fewer queues, but some pupils without reliable phone access still needed help ordering at registration.",
      "The governors kept the app for another term and asked for a comparison between year groups before deciding whether to reduce the number of spare meals. They emphasised that the aim was better planning, not a fully automated lunch service.",
    ],
    question:
      "Staff could still make some adjustments for pupils who had not ordered by 9:30 am. According to the passage, this statement is:",
    options: TFC_OPTIONS,
    answer: "A",
    explanation:
      "The passage states that staff could still adjust numbers for pupils who arrived late or forgot to order.",
  },
  "hq-vr-0008-2": {
    id: "hq-vr-0008-2",
    section: "vr",
    subtype: "vr-detail",
    setId: "hq-vr-0008",
    tags: ["detail-retrieval", "text-stem", "set-based", "easy", "quick"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Westport School introduced a lunch pre-order app after kitchen staff found that popular meals were selling out early while unpopular meals were thrown away. Pupils had to choose by 9:30 am, but staff could still adjust numbers for pupils who arrived late or forgot to order.",
      "In the first half-term, recorded food waste fell by 18%. The catering manager said the figure was promising, although a new supplier had also changed portion sizes during the same period. Teachers reported fewer queues, but some pupils without reliable phone access still needed help ordering at registration.",
      "The governors kept the app for another term and asked for a comparison between year groups before deciding whether to reduce the number of spare meals. They emphasised that the aim was better planning, not a fully automated lunch service.",
    ],
    question: "Which factor made it harder to judge the app's effect on waste?",
    options: [
      { key: "A", text: "The supplier changed portion sizes during the same period." },
      { key: "B", text: "Teachers reported longer queues after the app was introduced." },
      { key: "C", text: "The governors immediately removed all spare meals." },
      { key: "D", text: "Pupils were no longer allowed help at registration." },
    ],
    answer: "A",
    explanation:
      "The portion-size change happened during the same period, so the waste reduction cannot be attributed solely to the app.",
  },
  "hq-vr-0008-3": {
    id: "hq-vr-0008-3",
    section: "vr",
    subtype: "vr-inference",
    setId: "hq-vr-0008",
    tags: ["inference-question", "text-stem", "set-based", "medium"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Westport School introduced a lunch pre-order app after kitchen staff found that popular meals were selling out early while unpopular meals were thrown away. Pupils had to choose by 9:30 am, but staff could still adjust numbers for pupils who arrived late or forgot to order.",
      "In the first half-term, recorded food waste fell by 18%. The catering manager said the figure was promising, although a new supplier had also changed portion sizes during the same period. Teachers reported fewer queues, but some pupils without reliable phone access still needed help ordering at registration.",
      "The governors kept the app for another term and asked for a comparison between year groups before deciding whether to reduce the number of spare meals. They emphasised that the aim was better planning, not a fully automated lunch service.",
    ],
    question: "Which conclusion is best supported by the passage?",
    options: [
      { key: "A", text: "The app was useful enough to continue, but its effect still needed checking." },
      { key: "B", text: "The app removed the need for kitchen staff to make daily decisions." },
      { key: "C", text: "Phone access problems affected every pupil equally." },
      { key: "D", text: "The governors decided to end spare meals immediately." },
    ],
    answer: "A",
    explanation:
      "The governors kept the app but requested comparison data before changing spare-meal provision, showing cautious continuation.",
  },
  "hq-vr-0008-4": {
    id: "hq-vr-0008-4",
    section: "vr",
    subtype: "vr-author",
    setId: "hq-vr-0008",
    tags: ["author-opinion", "text-stem", "set-based", "medium"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Westport School introduced a lunch pre-order app after kitchen staff found that popular meals were selling out early while unpopular meals were thrown away. Pupils had to choose by 9:30 am, but staff could still adjust numbers for pupils who arrived late or forgot to order.",
      "In the first half-term, recorded food waste fell by 18%. The catering manager said the figure was promising, although a new supplier had also changed portion sizes during the same period. Teachers reported fewer queues, but some pupils without reliable phone access still needed help ordering at registration.",
      "The governors kept the app for another term and asked for a comparison between year groups before deciding whether to reduce the number of spare meals. They emphasised that the aim was better planning, not a fully automated lunch service.",
    ],
    question: "The passage's overall attitude to the app is best described as:",
    options: [
      { key: "A", text: "Opposed, because it created phone access problems." },
      { key: "B", text: "Uncritically enthusiastic, because waste fell." },
      { key: "C", text: "Cautiously positive, with attention to practical limits." },
      { key: "D", text: "Indifferent, because no recommendation was made." },
    ],
    answer: "C",
    explanation:
      "The passage reports promising waste and queue figures while noting confounding factors, access issues and the need for comparison.",
  },
  "hq-vr-0012-1": {
    id: "hq-vr-0012-1",
    section: "vr",
    subtype: "vr-tfc",
    setId: "hq-vr-0012",
    tags: ["true-false-cant-tell", "text-stem", "set-based", "easy"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Marlow Museum trialled quiet-viewing sessions on two weekday mornings after visitors with sensory sensitivities said the main galleries were overwhelming. The museum dimmed some lights, lowered audio exhibits and capped ticket numbers, but it did not remove any objects from display.",
      "Attendance was lower than at standard morning sessions, yet the feedback forms were unusually detailed. Several visitors said they stayed longer than they usually could. The visitor services manager cautioned that the trial took place outside school holidays, when the museum was quieter anyway.",
      "Trustees extended the trial but rejected a proposal to reserve every morning for quiet viewing. They asked staff to test one weekend slot and to measure whether ordinary visitors were displaced or simply chose other times.",
    ],
    question:
      "Objects were removed from display during quiet-viewing sessions. According to the passage, this statement is:",
    options: TFC_OPTIONS,
    answer: "B",
    explanation:
      "The passage says the museum did not remove any objects from display.",
  },
  "hq-vr-0012-2": {
    id: "hq-vr-0012-2",
    section: "vr",
    subtype: "vr-detail",
    setId: "hq-vr-0012",
    tags: ["detail-retrieval", "text-stem", "set-based", "easy", "quick"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Marlow Museum trialled quiet-viewing sessions on two weekday mornings after visitors with sensory sensitivities said the main galleries were overwhelming. The museum dimmed some lights, lowered audio exhibits and capped ticket numbers, but it did not remove any objects from display.",
      "Attendance was lower than at standard morning sessions, yet the feedback forms were unusually detailed. Several visitors said they stayed longer than they usually could. The visitor services manager cautioned that the trial took place outside school holidays, when the museum was quieter anyway.",
      "Trustees extended the trial but rejected a proposal to reserve every morning for quiet viewing. They asked staff to test one weekend slot and to measure whether ordinary visitors were displaced or simply chose other times.",
    ],
    question: "Why did the visitor services manager urge caution about the attendance figures?",
    options: [
      { key: "A", text: "The trial happened outside school holidays, when the museum was already quieter." },
      { key: "B", text: "The quiet sessions had removed the most popular objects." },
      { key: "C", text: "Visitors were not allowed to complete feedback forms." },
      { key: "D", text: "Trustees had already reserved every morning for quiet viewing." },
    ],
    answer: "A",
    explanation:
      "The manager noted that the trial took place outside school holidays, which could partly explain lower attendance.",
  },
  "hq-vr-0012-3": {
    id: "hq-vr-0012-3",
    section: "vr",
    subtype: "vr-inference",
    setId: "hq-vr-0012",
    tags: ["inference-question", "text-stem", "set-based", "medium"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Marlow Museum trialled quiet-viewing sessions on two weekday mornings after visitors with sensory sensitivities said the main galleries were overwhelming. The museum dimmed some lights, lowered audio exhibits and capped ticket numbers, but it did not remove any objects from display.",
      "Attendance was lower than at standard morning sessions, yet the feedback forms were unusually detailed. Several visitors said they stayed longer than they usually could. The visitor services manager cautioned that the trial took place outside school holidays, when the museum was quieter anyway.",
      "Trustees extended the trial but rejected a proposal to reserve every morning for quiet viewing. They asked staff to test one weekend slot and to measure whether ordinary visitors were displaced or simply chose other times.",
    ],
    question: "Which judgement would be most reasonable based on the passage?",
    options: [
      { key: "A", text: "The museum saw enough value to extend the trial, but not enough evidence to make it dominant." },
      { key: "B", text: "The museum concluded that quiet sessions were unsuitable for sensory-sensitive visitors." },
      { key: "C", text: "The museum proved that ordinary visitors were displaced." },
      { key: "D", text: "The museum planned to stop all weekend visits." },
    ],
    answer: "A",
    explanation:
      "Trustees extended the trial but rejected reserving every morning, and asked for further testing and measurement.",
  },
  "hq-vr-0012-4": {
    id: "hq-vr-0012-4",
    section: "vr",
    subtype: "vr-negative",
    setId: "hq-vr-0012",
    tags: ["negative-except", "text-stem", "set-based", "hard"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Marlow Museum trialled quiet-viewing sessions on two weekday mornings after visitors with sensory sensitivities said the main galleries were overwhelming. The museum dimmed some lights, lowered audio exhibits and capped ticket numbers, but it did not remove any objects from display.",
      "Attendance was lower than at standard morning sessions, yet the feedback forms were unusually detailed. Several visitors said they stayed longer than they usually could. The visitor services manager cautioned that the trial took place outside school holidays, when the museum was quieter anyway.",
      "Trustees extended the trial but rejected a proposal to reserve every morning for quiet viewing. They asked staff to test one weekend slot and to measure whether ordinary visitors were displaced or simply chose other times.",
    ],
    question: "All of the following are stated facts about the project except:",
    options: [
      { key: "A", text: "Some lights were dimmed during the quiet-viewing sessions." },
      { key: "B", text: "Ticket numbers were capped for the quiet-viewing sessions." },
      { key: "C", text: "Every weekday morning was reserved for quiet viewing." },
      { key: "D", text: "Trustees asked staff to test a weekend slot." },
    ],
    answer: "C",
    explanation:
      "Trustees rejected reserving every morning for quiet viewing, so option C is the exception.",
  },
  "hq-vr-0016-1": {
    id: "hq-vr-0016-1",
    section: "vr",
    subtype: "vr-tfc",
    setId: "hq-vr-0016",
    tags: ["true-false-cant-tell", "text-stem", "set-based", "easy"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Fairlake Advice Centre introduced evening video appointments for tenants who could not attend during working hours. Advisers used the same case notes as daytime staff, but complex debt cases were still booked for longer in-person sessions.",
      "The number of missed appointments fell in the first month. However, the centre had also started sending reminder texts, and one local employer had recently allowed staff to take paid time for advice appointments. Advisers said some clients found video convenient, while others struggled to find a private place to speak.",
      "The management committee kept one evening video clinic each week and asked for data on whether cases were resolved as quickly as in daytime clinics. It said convenience should not be mistaken for equal access.",
    ],
    question:
      "Complex debt cases were routinely moved to longer in-person sessions. According to the passage, this statement is:",
    options: TFC_OPTIONS,
    answer: "A",
    explanation:
      "The passage says complex debt cases were still booked for longer in-person sessions.",
  },
  "hq-vr-0016-2": {
    id: "hq-vr-0016-2",
    section: "vr",
    subtype: "vr-detail",
    setId: "hq-vr-0016",
    tags: ["detail-retrieval", "text-stem", "set-based", "easy", "quick"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Fairlake Advice Centre introduced evening video appointments for tenants who could not attend during working hours. Advisers used the same case notes as daytime staff, but complex debt cases were still booked for longer in-person sessions.",
      "The number of missed appointments fell in the first month. However, the centre had also started sending reminder texts, and one local employer had recently allowed staff to take paid time for advice appointments. Advisers said some clients found video convenient, while others struggled to find a private place to speak.",
      "The management committee kept one evening video clinic each week and asked for data on whether cases were resolved as quickly as in daytime clinics. It said convenience should not be mistaken for equal access.",
    ],
    question: "Which problem with video appointments is mentioned in the passage?",
    options: [
      { key: "A", text: "Some clients struggled to find a private place to speak." },
      { key: "B", text: "Advisers could not access any case notes." },
      { key: "C", text: "The centre stopped all daytime appointments." },
      { key: "D", text: "Reminder texts were banned during the trial." },
    ],
    answer: "A",
    explanation:
      "The second paragraph states that some clients struggled to find a private place to speak.",
  },
  "hq-vr-0016-3": {
    id: "hq-vr-0016-3",
    section: "vr",
    subtype: "vr-inference",
    setId: "hq-vr-0016",
    tags: ["inference-question", "text-stem", "set-based", "medium"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Fairlake Advice Centre introduced evening video appointments for tenants who could not attend during working hours. Advisers used the same case notes as daytime staff, but complex debt cases were still booked for longer in-person sessions.",
      "The number of missed appointments fell in the first month. However, the centre had also started sending reminder texts, and one local employer had recently allowed staff to take paid time for advice appointments. Advisers said some clients found video convenient, while others struggled to find a private place to speak.",
      "The management committee kept one evening video clinic each week and asked for data on whether cases were resolved as quickly as in daytime clinics. It said convenience should not be mistaken for equal access.",
    ],
    question: "Which statement is the fairest interpretation of the evidence?",
    options: [
      { key: "A", text: "The video clinic may help access, but missed appointments were affected by other changes too." },
      { key: "B", text: "Video appointments resolved complex debt cases more quickly than all other formats." },
      { key: "C", text: "Reminder texts had no possible effect on missed appointments." },
      { key: "D", text: "The committee believed convenience was identical to equal access." },
    ],
    answer: "A",
    explanation:
      "Missed appointments fell, but reminder texts and employer leave policies also changed, and the committee asked for further outcome data.",
  },
  "hq-vr-0016-4": {
    id: "hq-vr-0016-4",
    section: "vr",
    subtype: "vr-summary",
    setId: "hq-vr-0016",
    tags: ["summary-structure", "text-stem", "set-based", "medium"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Fairlake Advice Centre introduced evening video appointments for tenants who could not attend during working hours. Advisers used the same case notes as daytime staff, but complex debt cases were still booked for longer in-person sessions.",
      "The number of missed appointments fell in the first month. However, the centre had also started sending reminder texts, and one local employer had recently allowed staff to take paid time for advice appointments. Advisers said some clients found video convenient, while others struggled to find a private place to speak.",
      "The management committee kept one evening video clinic each week and asked for data on whether cases were resolved as quickly as in daytime clinics. It said convenience should not be mistaken for equal access.",
    ],
    question: "Which summary avoids overstating the findings?",
    options: [
      { key: "A", text: "Evening video appointments were continued cautiously while the centre checked outcomes and access." },
      { key: "B", text: "Video appointments proved that in-person advice was no longer needed." },
      { key: "C", text: "The centre cancelled reminder texts because they confused clients." },
      { key: "D", text: "All cases were resolved faster in evening clinics." },
    ],
    answer: "A",
    explanation:
      "The passage describes cautious continuation, confounding factors and a request for evidence on resolution speed and access.",
  },
  "hq-vr-0020-1": {
    id: "hq-vr-0020-1",
    section: "vr",
    subtype: "vr-tfc",
    setId: "hq-vr-0020",
    tags: ["true-false-cant-tell", "text-stem", "set-based", "easy"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Riverton Council placed temporary stewards at a riverside crossing after cyclists and pedestrians reported confusion about a new diversion. The stewards could remind users of the marked route, but they had no power to enforce fines or stop traffic.",
      "Reported near-misses fell during the three-week trial. The transport officer noted that the trial coincided with dry weather and a school holiday, both of which may have changed traffic patterns. Local shopkeepers said the crossing felt calmer, although some disliked the extra signs outside their premises.",
      "The council extended the stewards for two further weekends while commissioning clearer painted markings. It said the trial suggested that route information mattered, but it did not prove that paid stewards were the only solution.",
    ],
    question:
      "The stewards had the power to issue fines to cyclists. According to the passage, this statement is:",
    options: TFC_OPTIONS,
    answer: "B",
    explanation:
      "The passage says the stewards had no power to enforce fines.",
  },
  "hq-vr-0020-2": {
    id: "hq-vr-0020-2",
    section: "vr",
    subtype: "vr-detail",
    setId: "hq-vr-0020",
    tags: ["detail-retrieval", "text-stem", "set-based", "easy", "quick"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Riverton Council placed temporary stewards at a riverside crossing after cyclists and pedestrians reported confusion about a new diversion. The stewards could remind users of the marked route, but they had no power to enforce fines or stop traffic.",
      "Reported near-misses fell during the three-week trial. The transport officer noted that the trial coincided with dry weather and a school holiday, both of which may have changed traffic patterns. Local shopkeepers said the crossing felt calmer, although some disliked the extra signs outside their premises.",
      "The council extended the stewards for two further weekends while commissioning clearer painted markings. It said the trial suggested that route information mattered, but it did not prove that paid stewards were the only solution.",
    ],
    question: "Which circumstance made the fall in near-misses harder to interpret?",
    options: [
      { key: "A", text: "The trial coincided with dry weather and a school holiday." },
      { key: "B", text: "The stewards stopped all traffic at the crossing." },
      { key: "C", text: "Shopkeepers unanimously opposed the trial." },
      { key: "D", text: "The council refused to commission painted markings." },
    ],
    answer: "A",
    explanation:
      "The transport officer said dry weather and a school holiday may have changed traffic patterns during the trial.",
  },
  "hq-vr-0020-3": {
    id: "hq-vr-0020-3",
    section: "vr",
    subtype: "vr-inference",
    setId: "hq-vr-0020",
    tags: ["inference-question", "text-stem", "set-based", "medium"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Riverton Council placed temporary stewards at a riverside crossing after cyclists and pedestrians reported confusion about a new diversion. The stewards could remind users of the marked route, but they had no power to enforce fines or stop traffic.",
      "Reported near-misses fell during the three-week trial. The transport officer noted that the trial coincided with dry weather and a school holiday, both of which may have changed traffic patterns. Local shopkeepers said the crossing felt calmer, although some disliked the extra signs outside their premises.",
      "The council extended the stewards for two further weekends while commissioning clearer painted markings. It said the trial suggested that route information mattered, but it did not prove that paid stewards were the only solution.",
    ],
    question: "Which conclusion is most justified by the trial results?",
    options: [
      { key: "A", text: "Clearer route information may reduce confusion, but the best permanent method is not yet established." },
      { key: "B", text: "The council proved that only paid stewards could reduce near-misses." },
      { key: "C", text: "The trial showed that fines were necessary." },
      { key: "D", text: "Weather and holidays had no relevance to traffic patterns." },
    ],
    answer: "A",
    explanation:
      "The council said route information mattered, but did not treat paid stewards as the only solution and commissioned markings.",
  },
  "hq-vr-0020-4": {
    id: "hq-vr-0020-4",
    section: "vr",
    subtype: "vr-author",
    setId: "hq-vr-0020",
    tags: ["author-opinion", "text-stem", "set-based", "medium"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Riverton Council placed temporary stewards at a riverside crossing after cyclists and pedestrians reported confusion about a new diversion. The stewards could remind users of the marked route, but they had no power to enforce fines or stop traffic.",
      "Reported near-misses fell during the three-week trial. The transport officer noted that the trial coincided with dry weather and a school holiday, both of which may have changed traffic patterns. Local shopkeepers said the crossing felt calmer, although some disliked the extra signs outside their premises.",
      "The council extended the stewards for two further weekends while commissioning clearer painted markings. It said the trial suggested that route information mattered, but it did not prove that paid stewards were the only solution.",
    ],
    question: "Which description best matches the tone of the passage?",
    options: [
      { key: "A", text: "Measured and cautious about attributing cause." },
      { key: "B", text: "Dismissive of any value in route information." },
      { key: "C", text: "Certain that weather was the only explanation." },
      { key: "D", text: "Hostile towards shopkeepers' concerns." },
    ],
    answer: "A",
    explanation:
      "The passage notes positive signs but repeatedly qualifies what can be concluded from the trial.",
  },
  "hq-sjt-0003-1": {
    id: "hq-sjt-0003-1",
    section: "sjt",
    subtype: "sjt-appropriateness",
    setId: "hq-sjt-0003",
    tags: ["text-stem", "set-based", "medium"],
    issueTags: ["professional-boundaries"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "Leah, a medical student, has been helping at a diabetes education group. A participant thanks her afterwards and asks for her personal phone number, saying they sometimes feel embarrassed asking questions in front of the group. The specialist nurse is packing away nearby, and the participant says they do not want to bother staff with small questions.",
    ],
    question:
      "How professional would it be for Leah to politely decline to share her personal number and direct the participant to the nurse or official clinic contact route?",
    options: APPROPRIATENESS_OPTIONS,
    answer: "A",
    explanation:
      "This is very appropriate because it maintains professional boundaries while helping the participant access legitimate support.",
  },
  "hq-sjt-0003-2": {
    id: "hq-sjt-0003-2",
    section: "sjt",
    subtype: "sjt-appropriateness",
    setId: "hq-sjt-0003",
    tags: ["text-stem", "set-based", "medium"],
    issueTags: ["professional-boundaries"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "Leah, a medical student, has been helping at a diabetes education group. A participant thanks her afterwards and asks for her personal phone number, saying they sometimes feel embarrassed asking questions in front of the group. The specialist nurse is packing away nearby, and the participant says they do not want to bother staff with small questions.",
    ],
    question:
      "How professional would it be for Leah to share her number but say she can only answer simple questions?",
    options: APPROPRIATENESS_OPTIONS,
    answer: "D",
    explanation:
      "This is very inappropriate. It creates a private route outside supervision and could lead to advice beyond Leah's role.",
  },
  "hq-sjt-0003-3": {
    id: "hq-sjt-0003-3",
    section: "sjt",
    subtype: "sjt-importance",
    setId: "hq-sjt-0003",
    tags: ["text-stem", "set-based", "medium"],
    issueTags: ["professional-boundaries"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "Leah, a medical student, has been helping at a diabetes education group. A participant thanks her afterwards and asks for her personal phone number, saying they sometimes feel embarrassed asking questions in front of the group. The specialist nurse is packing away nearby, and the participant says they do not want to bother staff with small questions.",
    ],
    question: "How important would it be to consider that an official clinic contact route may be available?",
    options: IMPORTANCE_OPTIONS,
    answer: "B",
    explanation:
      "This is important because it helps Leah redirect the participant appropriately, although the central issue is maintaining boundaries.",
  },
  "hq-sjt-0003-4": {
    id: "hq-sjt-0003-4",
    section: "sjt",
    subtype: "sjt-importance",
    setId: "hq-sjt-0003",
    tags: ["text-stem", "set-based", "easy"],
    issueTags: ["professional-boundaries"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "Leah, a medical student, has been helping at a diabetes education group. A participant thanks her afterwards and asks for her personal phone number, saying they sometimes feel embarrassed asking questions in front of the group. The specialist nurse is packing away nearby, and the participant says they do not want to bother staff with small questions.",
    ],
    question: "How important would it be to consider whether Leah's phone contract includes free texts?",
    options: IMPORTANCE_OPTIONS,
    answer: "D",
    explanation:
      "This is not important. Cost or convenience does not affect the professional boundary or the need for supervised communication.",
  },
  "hq-sjt-0003-5": dragCategoryQuestion({
    id: "hq-sjt-0003-5",
    section: "sjt",
    subtype: "sjt-drag-drop",
    setId: "hq-sjt-0003",
    tags: ["text-stem", "set-based", "hard", "multi-step"],
    issueTags: ["professional-boundaries"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "Leah, a medical student, has been helping at a diabetes education group. A participant thanks her afterwards and asks for her personal phone number, saying they sometimes feel embarrassed asking questions in front of the group. The specialist nurse is packing away nearby, and the participant says they do not want to bother staff with small questions.",
    ],
    question: "Classify the actions as appropriate or inappropriate.",
    instruction: "Place each action into the most suitable category.",
    categories: [
      { id: "appropriate", label: "Appropriate" },
      { id: "inappropriate", label: "Inappropriate" },
    ],
    categoryItems: [
      { id: "decline-personal", text: "Decline to share personal contact details and explain that questions should go through official routes.", answerCategory: "appropriate" },
      { id: "share-simple", text: "Share a number but promise only to answer simple questions.", answerCategory: "inappropriate" },
      { id: "involve-nurse", text: "Ask the specialist nurse how the participant can get follow-up support.", answerCategory: "appropriate" },
      { id: "private-chat", text: "Suggest discussing the questions privately outside the clinic to avoid embarrassment.", answerCategory: "inappropriate" },
    ],
    explanation:
      "Appropriate actions preserve boundaries and connect the participant with supervised support. Inappropriate actions create private unsupervised contact.",
  }),
  "hq-sjt-0004-1": {
    id: "hq-sjt-0004-1",
    section: "sjt",
    subtype: "sjt-appropriateness",
    setId: "hq-sjt-0004",
    tags: ["text-stem", "set-based", "medium"],
    issueTags: ["scope-of-practice"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "Marcus, a medical student, is observing in a minor injuries unit. A patient who has been waiting for an X-ray result recognises him from a previous placement and asks whether the wrist looks broken on the image that is open on a nearby screen. The supervising clinician has stepped into another cubicle, and the patient says they only want Marcus's honest opinion.",
    ],
    question:
      "How acceptable is it for Marcus to explain that he cannot interpret the X-ray for the patient and to ask the supervising clinician to speak with them?",
    options: APPROPRIATENESS_OPTIONS,
    answer: "A",
    explanation:
      "This is very appropriate because Marcus stays within competence and ensures the patient receives information from a qualified clinician.",
  },
  "hq-sjt-0004-2": {
    id: "hq-sjt-0004-2",
    section: "sjt",
    subtype: "sjt-appropriateness",
    setId: "hq-sjt-0004",
    tags: ["text-stem", "set-based", "medium"],
    issueTags: ["scope-of-practice"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "Marcus, a medical student, is observing in a minor injuries unit. A patient who has been waiting for an X-ray result recognises him from a previous placement and asks whether the wrist looks broken on the image that is open on a nearby screen. The supervising clinician has stepped into another cubicle, and the patient says they only want Marcus's honest opinion.",
    ],
    question:
      "How acceptable is it for Marcus to give a likely answer but add that the clinician will confirm it later?",
    options: APPROPRIATENESS_OPTIONS,
    answer: "D",
    explanation:
      "This is very inappropriate because Marcus would be interpreting an investigation and giving clinical information beyond his role.",
  },
  "hq-sjt-0004-3": {
    id: "hq-sjt-0004-3",
    section: "sjt",
    subtype: "sjt-importance",
    setId: "hq-sjt-0004",
    tags: ["text-stem", "set-based", "medium"],
    issueTags: ["scope-of-practice"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "Marcus, a medical student, is observing in a minor injuries unit. A patient who has been waiting for an X-ray result recognises him from a previous placement and asks whether the wrist looks broken on the image that is open on a nearby screen. The supervising clinician has stepped into another cubicle, and the patient says they only want Marcus's honest opinion.",
    ],
    question: "How relevant is staying within competence when discussing investigation results?",
    options: IMPORTANCE_OPTIONS,
    answer: "A",
    explanation:
      "This is very important. Giving or interpreting clinical results requires appropriate competence and supervision.",
  },
  "hq-sjt-0004-4": {
    id: "hq-sjt-0004-4",
    section: "sjt",
    subtype: "sjt-importance",
    setId: "hq-sjt-0004",
    tags: ["text-stem", "set-based", "easy"],
    issueTags: ["scope-of-practice"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "Marcus, a medical student, is observing in a minor injuries unit. A patient who has been waiting for an X-ray result recognises him from a previous placement and asks whether the wrist looks broken on the image that is open on a nearby screen. The supervising clinician has stepped into another cubicle, and the patient says they only want Marcus's honest opinion.",
    ],
    question: "How relevant is whether Marcus wanted to practise reading X-rays?",
    options: IMPORTANCE_OPTIONS,
    answer: "C",
    explanation:
      "This is of minor importance. Learning needs may be relevant to supervision later, but they do not justify giving the patient an interpretation.",
  },
  "hq-sjt-0004-5": dragCategoryQuestion({
    id: "hq-sjt-0004-5",
    section: "sjt",
    subtype: "sjt-drag-drop",
    setId: "hq-sjt-0004",
    tags: ["text-stem", "set-based", "hard", "multi-step"],
    issueTags: ["scope-of-practice"],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [
      "Marcus, a medical student, is observing in a minor injuries unit. A patient who has been waiting for an X-ray result recognises him from a previous placement and asks whether the wrist looks broken on the image that is open on a nearby screen. The supervising clinician has stepped into another cubicle, and the patient says they only want Marcus's honest opinion.",
    ],
    question: "Sort the responses by whether they would be suitable here.",
    instruction: "Place each action into the most suitable category.",
    categories: [
      { id: "appropriate", label: "Appropriate" },
      { id: "inappropriate", label: "Inappropriate" },
    ],
    categoryItems: [
      { id: "ask-clinician", text: "Tell the patient a clinician will discuss the X-ray and seek the supervisor promptly.", answerCategory: "appropriate" },
      { id: "likely-answer", text: "Give a likely interpretation because the patient asks for honesty.", answerCategory: "inappropriate" },
      { id: "stay-kind", text: "Acknowledge the wait and avoid making clinical comments beyond role.", answerCategory: "appropriate" },
      { id: "screen-teaching", text: "Use the open image to teach the patient what Marcus thinks he can see.", answerCategory: "inappropriate" },
    ],
    explanation:
      "Appropriate actions are honest about limits and involve the clinician. Inappropriate actions interpret results beyond the student's role.",
  }),
};

function makeCuratedVrPassageSet(input: {
  setId: string;
  stimulus: string[];
  items: Array<{
    suffix: number;
    subtype: UCATSubtypeId;
    tags: UCATQuestionTag[];
    question: string;
    options: Array<{ key: UCATOptionKey; text: string }>;
    answer: UCATOptionKey;
    explanation: string;
  }>;
}) {
  return input.items.map(
    (item): UCATQuestion => ({
      id: `${input.setId}-${item.suffix}`,
      section: "vr",
      subtype: item.subtype,
      setId: input.setId,
      tags: item.tags,
      title: "Verbal Reasoning Practice",
      leftTitle: "Passage",
      stimulus: input.stimulus,
      question: item.question,
      options: item.options,
      answer: item.answer,
      explanation: item.explanation,
    })
  );
}

function makeCuratedQrSet(input: {
  setId: string;
  stimulus: string[];
  visual?: UCATChartVisual;
  items: Array<{
    suffix: number;
    subtype: UCATSubtypeId;
    tags: UCATQuestionTag[];
    question: string;
    options: Array<{ key: UCATOptionKey; text: string }>;
    answer: UCATOptionKey;
    explanation: string;
  }>;
}) {
  return input.items.map(
    (item): UCATQuestion => ({
      id: `${input.setId}-${item.suffix}`,
      section: "qr",
      subtype: item.subtype,
      setId: input.setId,
      tags: item.tags,
      title: "Quantitative Reasoning Practice",
      leftTitle: input.visual ? "Data" : "Stem",
      stimulus: input.stimulus,
      visual: input.visual,
      question: item.question,
      options: item.options,
      answer: item.answer,
      explanation: item.explanation,
    })
  );
}

type CuratedSjtSingleItem = {
  suffix: number;
  subtype: "sjt-appropriateness" | "sjt-importance";
  tags: UCATQuestionTag[];
  question: string;
  options: Array<{ key: UCATOptionKey; text: string }>;
  answer: UCATOptionKey;
  explanation: string;
};

type CuratedSjtDragItem = {
  suffix: number;
  subtype: "sjt-drag-drop";
  tags: UCATQuestionTag[];
  question: string;
  categoryItems: Array<{ id: string; text: string; answerCategory: string }>;
  explanation: string;
};

function makeCuratedSjtSet(input: {
  setId: string;
  issueTags: UCATSjtIssueTag[];
  stimulus: string[];
  items: Array<CuratedSjtSingleItem | CuratedSjtDragItem>;
}) {
  return input.items.map((item): UCATQuestion => {
    if (item.subtype === "sjt-drag-drop") {
      return dragCategoryQuestion({
        id: `${input.setId}-${item.suffix}`,
        section: "sjt",
        subtype: "sjt-drag-drop",
        setId: input.setId,
        tags: item.tags,
        issueTags: input.issueTags,
        title: "Situational Judgement Practice",
        leftTitle: "Scenario",
        stimulus: input.stimulus,
        question: item.question,
        instruction: "Place each action into the most suitable category.",
        categories: [
          { id: "appropriate", label: "Appropriate" },
          { id: "inappropriate", label: "Inappropriate" },
        ],
        categoryItems: item.categoryItems,
        explanation: item.explanation,
      });
    }

    return {
      id: `${input.setId}-${item.suffix}`,
      section: "sjt",
      subtype: item.subtype,
      setId: input.setId,
      tags: item.tags,
      issueTags: input.issueTags,
      title: "Situational Judgement Practice",
      leftTitle: "Scenario",
      stimulus: input.stimulus,
      question: item.question,
      options: item.options,
      answer: item.answer,
      explanation: item.explanation,
    };
  });
}

const MORE_CURATED_REPLACEMENTS = Object.fromEntries(
  [
    ...makeCuratedVrPassageSet({
      setId: "hq-vr-0024",
      stimulus: [
        "A city pharmacy chain trialled a colour-coded shelf label for medicines that required counselling before sale. The label did not change legal sale restrictions, but it prompted assistants to pause and call the pharmacist when certain products were selected.",
        "Mystery-shopper checks found that counselling reminders were given more consistently during the trial. However, two of the participating branches had recently hired experienced pharmacy technicians, and the trial covered only weekdays. Some assistants said the labels were helpful for unfamiliar stock, while others worried that too many warnings would make genuine risks easier to miss.",
        "The superintendent pharmacist extended the trial to weekend shifts and asked for a comparison with branches using a shorter checklist instead. The report concluded that the labels might support safer conversations, but should not be treated as a substitute for training.",
      ],
      items: [
        {
          suffix: 1,
          subtype: "vr-tfc",
          tags: ["true-false-cant-tell", "text-stem", "set-based", "easy"],
          question:
            "The shelf label changed the legal restrictions on medicine sales. According to the passage, this statement is:",
          options: TFC_OPTIONS,
          answer: "B",
          explanation:
            "The passage states that the label did not change legal sale restrictions.",
        },
        {
          suffix: 2,
          subtype: "vr-detail",
          tags: ["detail-retrieval", "text-stem", "set-based", "easy", "quick"],
          question: "What did assistants do when certain labelled products were selected?",
          options: [
            { key: "A", text: "Pause and call the pharmacist." },
            { key: "B", text: "Remove the product from sale permanently." },
            { key: "C", text: "Replace counselling with a printed leaflet only." },
            { key: "D", text: "Ignore weekday sales and record weekend sales only." },
          ],
          answer: "A",
          explanation:
            "The first paragraph says the label prompted assistants to pause and call the pharmacist.",
        },
        {
          suffix: 3,
          subtype: "vr-inference",
          tags: ["inference-question", "text-stem", "set-based", "medium"],
          question: "Which judgement would be most reasonable based on the passage?",
          options: [
            { key: "A", text: "The labels may improve practice, but other staffing and timing factors need checking." },
            { key: "B", text: "The labels proved training was no longer needed." },
            { key: "C", text: "The trial showed weekend shifts were safer than weekday shifts." },
            { key: "D", text: "Experienced technicians made counselling reminders less consistent." },
          ],
          answer: "A",
          explanation:
            "The trial showed more consistent reminders, but staffing changes and weekday-only data limited the conclusion.",
        },
        {
          suffix: 4,
          subtype: "vr-negative",
          tags: ["negative-except", "text-stem", "set-based", "hard"],
          question: "All of the following are accurate statements about the trial except:",
          options: [
            { key: "A", text: "The trial used mystery-shopper checks." },
            { key: "B", text: "Some staff worried about warning labels becoming too common." },
            { key: "C", text: "The report recommended replacing pharmacist training with labels." },
            { key: "D", text: "A comparison with branches using a shorter checklist was requested." },
          ],
          answer: "C",
          explanation:
            "The report said labels should not be treated as a substitute for training, so option C is the exception.",
        },
      ],
    }),
    ...makeCuratedVrPassageSet({
      setId: "hq-vr-0028",
      stimulus: [
        "Calder Library installed self-service reservation lockers in its foyer after members complained that collection queues were longest during the first hour after work. Users received a code by email when a reserved book was ready. Staff still handled damaged items, fines and requests for books held off-site.",
        "Collections from the lockers rose quickly, and the main desk queue shortened on two evenings each week. The library manager warned that the result could not be separated from a new email reminder system introduced at the same time. Older members also reported that the locker screen timed out too quickly.",
        "The library kept the lockers but delayed removing any desk hours. It planned to test a longer screen timeout and compare branches with and without email reminders.",
      ],
      items: [
        {
          suffix: 1,
          subtype: "vr-tfc",
          tags: ["true-false-cant-tell", "text-stem", "set-based", "easy"],
          question:
            "Staff still dealt with some reservation-related problems after the lockers were introduced. According to the passage, this statement is:",
          options: TFC_OPTIONS,
          answer: "A",
          explanation:
            "The passage says staff still handled damaged items, fines and off-site book requests.",
        },
        {
          suffix: 2,
          subtype: "vr-detail",
          tags: ["detail-retrieval", "text-stem", "set-based", "easy", "quick"],
          question: "What difficulty was reported by older members?",
          options: [
            { key: "A", text: "The locker screen timed out too quickly." },
            { key: "B", text: "The library stopped sending all emails." },
            { key: "C", text: "The main desk closed every evening." },
            { key: "D", text: "Reservations could no longer include off-site books." },
          ],
          answer: "A",
          explanation:
            "The passage states that older members reported the locker screen timed out too quickly.",
        },
        {
          suffix: 3,
          subtype: "vr-inference",
          tags: ["inference-question", "text-stem", "set-based", "medium"],
          question: "Which statement is the fairest interpretation of the evidence?",
          options: [
            { key: "A", text: "The lockers were promising, but the email reminders may also have affected collections." },
            { key: "B", text: "The lockers made desk staff unnecessary for all reservation issues." },
            { key: "C", text: "The library proved that older members preferred lockers." },
            { key: "D", text: "Branches without email reminders had already been compared." },
          ],
          answer: "A",
          explanation:
            "The manager warned that the queue result could not be separated from the new email reminder system.",
        },
        {
          suffix: 4,
          subtype: "vr-summary",
          tags: ["summary-structure", "text-stem", "set-based", "medium"],
          question: "Which statement best describes the overall message?",
          options: [
            { key: "A", text: "Lockers may reduce collection queues, but access issues and other changes need testing." },
            { key: "B", text: "The library replaced all reservation staff with lockers." },
            { key: "C", text: "Email reminders failed because collections did not rise." },
            { key: "D", text: "The lockers were removed because older members disliked them." },
          ],
          answer: "A",
          explanation:
            "The passage describes early benefits, a confounding reminder system and a planned screen-timeout adjustment.",
        },
      ],
    }),
    ...makeCuratedVrPassageSet({
      setId: "hq-vr-0032",
      stimulus: [
        "Glenford Transport changed the timetable for a river ferry that linked a park-and-ride site with the town centre. The new timetable added two early sailings but removed one late-morning sailing that had usually carried few passengers.",
        "Passenger counts rose in the first month, especially among commuters. Yet the change coincided with roadworks on the main bridge, and a local employer had begun subsidising ferry passes. Tour operators complained that the missing late-morning sailing made one walking-tour connection harder.",
        "Transport officers kept the early sailings for another quarter but reinstated the late-morning sailing on Saturdays. They said the figures supported further testing, not a permanent conclusion about demand.",
      ],
      items: [
        {
          suffix: 1,
          subtype: "vr-tfc",
          tags: ["true-false-cant-tell", "text-stem", "set-based", "easy"],
          question:
            "The new timetable removed one late-morning sailing. According to the passage, this statement is:",
          options: TFC_OPTIONS,
          answer: "A",
          explanation:
            "The first paragraph states that one late-morning sailing was removed.",
        },
        {
          suffix: 2,
          subtype: "vr-detail",
          tags: ["detail-retrieval", "text-stem", "set-based", "easy", "quick"],
          question: "Which group especially contributed to the rise in passenger counts?",
          options: [
            { key: "A", text: "Commuters." },
            { key: "B", text: "Tour operators." },
            { key: "C", text: "Bridge repair workers." },
            { key: "D", text: "Late-morning walkers only." },
          ],
          answer: "A",
          explanation:
            "The passage says passenger counts rose especially among commuters.",
        },
        {
          suffix: 3,
          subtype: "vr-inference",
          tags: ["inference-question", "text-stem", "set-based", "medium"],
          question: "Which conclusion is most justified by the trial results?",
          options: [
            { key: "A", text: "The early sailings may be useful, but other events could have increased ferry use." },
            { key: "B", text: "The ferry timetable had no effect on commuters." },
            { key: "C", text: "Roadworks proved that late-morning sailings were unnecessary every day." },
            { key: "D", text: "Tour operators preferred removing all late-morning sailings." },
          ],
          answer: "A",
          explanation:
            "Roadworks and subsidised passes coincided with the timetable change, so the rise cannot be attributed only to early sailings.",
        },
        {
          suffix: 4,
          subtype: "vr-author",
          tags: ["author-opinion", "text-stem", "set-based", "medium"],
          question: "What is the passage's overall attitude to the timetable change?",
          options: [
            { key: "A", text: "Cautious, because early gains are balanced against confounding factors and connection problems." },
            { key: "B", text: "Dismissive, because passenger counts fell." },
            { key: "C", text: "Certain, because demand was permanently proved." },
            { key: "D", text: "Hostile to commuters using the ferry." },
          ],
          answer: "A",
          explanation:
            "The passage reports benefits but stresses bridge works, subsidies and a partial reinstatement before permanent conclusions.",
        },
      ],
    }),
    ...makeCuratedVrPassageSet({
      setId: "hq-vr-0036",
      stimulus: [
        "Kenton Archive ran evening workshops to help residents interpret digitised housing records. Staff chose evening sessions after daytime users said the online catalogue was hard to understand without examples. The workshops used public records only and did not give access to restricted files.",
        "Bookings filled quickly, but attendance varied. Some residents registered for more than one session because they were researching several addresses. The archivist said this made the booking figures look stronger than the number of individual users. A new local-history exhibition also opened during the same month.",
        "The archive kept the workshops but changed the booking form so repeat attendance could be counted separately. It also planned a comparison with a written guide for people who could not attend in person.",
      ],
      items: [
        {
          suffix: 1,
          subtype: "vr-tfc",
          tags: ["true-false-cant-tell", "text-stem", "set-based", "easy"],
          question:
            "The workshops gave residents access to restricted files. According to the passage, this statement is:",
          options: TFC_OPTIONS,
          answer: "B",
          explanation:
            "The passage says the workshops used public records only and did not give access to restricted files.",
        },
        {
          suffix: 2,
          subtype: "vr-detail",
          tags: ["detail-retrieval", "text-stem", "set-based", "easy", "quick"],
          question: "Why could the booking figures overstate the number of individual users?",
          options: [
            { key: "A", text: "Some residents registered for more than one session." },
            { key: "B", text: "The archive counted restricted files as bookings." },
            { key: "C", text: "The written guide had already replaced workshops." },
            { key: "D", text: "Daytime users were excluded from all records." },
          ],
          answer: "A",
          explanation:
            "The archivist said repeat registrations made booking figures look stronger than the number of individual users.",
        },
        {
          suffix: 3,
          subtype: "vr-inference",
          tags: ["inference-question", "text-stem", "set-based", "medium"],
          question: "Which judgement would be most reasonable based on the passage?",
          options: [
            { key: "A", text: "Demand appeared encouraging, but the archive needed better counting and comparison." },
            { key: "B", text: "The workshops proved that written guides would be useless." },
            { key: "C", text: "The local-history exhibition had no possible effect on interest." },
            { key: "D", text: "The archive intended to stop all in-person support." },
          ],
          answer: "A",
          explanation:
            "The archive kept workshops but changed counting and planned a comparison with a written guide.",
        },
        {
          suffix: 4,
          subtype: "vr-negative",
          tags: ["negative-except", "text-stem", "set-based", "hard"],
          question: "All of the following are stated facts about the project except:",
          options: [
            { key: "A", text: "The sessions were held in the evening." },
            { key: "B", text: "A new local-history exhibition opened during the same month." },
            { key: "C", text: "Repeat attendance would be counted separately in future." },
            { key: "D", text: "The workshops replaced the public catalogue entirely." },
          ],
          answer: "D",
          explanation:
            "The passage says the workshops helped people interpret the online catalogue, not that they replaced it.",
        },
      ],
    }),
    ...makeCuratedVrPassageSet({
      setId: "hq-vr-0040",
      stimulus: [
        "Oakmere Observatory opened a limited number of low-light viewing evenings for families whose children found crowded public nights difficult. Visitors were asked to arrive in small groups, and staff reduced loud announcements, but the telescope programme was otherwise unchanged.",
        "Feedback was positive, and families stayed for longer than on standard open nights. The education officer noted, however, that the trial nights were all cloudless, whereas several standard nights that month had poor visibility. Volunteers also said the quieter format required more staff time per visitor.",
        "The observatory added two further low-light evenings but did not replace standard public nights. It planned to compare satisfaction on nights with similar weather before deciding how often to run the format.",
      ],
      items: [
        {
          suffix: 1,
          subtype: "vr-tfc",
          tags: ["true-false-cant-tell", "text-stem", "set-based", "easy"],
          question:
            "The telescope programme was changed for the low-light evenings. According to the passage, this statement is:",
          options: TFC_OPTIONS,
          answer: "B",
          explanation:
            "The passage says the telescope programme was otherwise unchanged.",
        },
        {
          suffix: 2,
          subtype: "vr-detail",
          tags: ["detail-retrieval", "text-stem", "set-based", "easy", "quick"],
          question: "What made comparison with standard open nights difficult?",
          options: [
            { key: "A", text: "The trial nights were cloudless while some standard nights had poor visibility." },
            { key: "B", text: "The low-light evenings had no visitors." },
            { key: "C", text: "The observatory cancelled all standard public nights." },
            { key: "D", text: "Families were not allowed to give feedback." },
          ],
          answer: "A",
          explanation:
            "Weather conditions differed, so longer stays and satisfaction could not be compared cleanly.",
        },
        {
          suffix: 3,
          subtype: "vr-inference",
          tags: ["inference-question", "text-stem", "set-based", "medium"],
          question: "Which statement is the fairest interpretation of the evidence?",
          options: [
            { key: "A", text: "The quieter format was promising but more resource-intensive and not fully comparable yet." },
            { key: "B", text: "The trial proved weather had no effect on visitor satisfaction." },
            { key: "C", text: "The observatory decided low-light evenings should replace all other nights." },
            { key: "D", text: "Volunteers said the format required less staff time per visitor." },
          ],
          answer: "A",
          explanation:
            "Feedback and stays were positive, but weather and staffing demands limited conclusions.",
        },
        {
          suffix: 4,
          subtype: "vr-summary",
          tags: ["summary-structure", "text-stem", "set-based", "medium"],
          question: "Which summary avoids overstating the findings?",
          options: [
            { key: "A", text: "A quieter viewing format was extended cautiously while fairer comparisons were planned." },
            { key: "B", text: "The observatory abandoned standard nights after one successful month." },
            { key: "C", text: "Poor visibility caused the trial to fail." },
            { key: "D", text: "The telescope programme was redesigned for every visitor." },
          ],
          answer: "A",
          explanation:
            "The observatory added further evenings but planned comparison on similar-weather nights before deciding frequency.",
        },
      ],
    }),
    ...makeCuratedVrPassageSet({
      setId: "hq-vr-0044",
      stimulus: [
        "Silverton Leisure Centre tested coloured wristbands for lane-swim sessions after swimmers complained that fast and slow lanes were often mixed. The bands showed which lane a swimmer had booked, but lifeguards could still move swimmers if a lane became unsafe or overcrowded.",
        "Complaints about lane speed fell, although the centre also introduced a new booking limit in the same week. Some swimmers liked the clearer system, while others said the colours made them feel publicly labelled. Staff noticed that beginners were more likely to ask for advice before entering the pool.",
        "Managers kept the wristbands for peak sessions only and asked for feedback on whether signs alone could achieve the same clarity. They said the system should guide swimmers, not embarrass them.",
      ],
      items: [
        {
          suffix: 1,
          subtype: "vr-tfc",
          tags: ["true-false-cant-tell", "text-stem", "set-based", "easy"],
          question:
            "Lifeguards could still move swimmers between lanes for safety or crowding reasons. According to the passage, this statement is:",
          options: TFC_OPTIONS,
          answer: "A",
          explanation:
            "The passage states that lifeguards could still move swimmers if a lane became unsafe or overcrowded.",
        },
        {
          suffix: 2,
          subtype: "vr-detail",
          tags: ["detail-retrieval", "text-stem", "set-based", "easy", "quick"],
          question: "What concern did some swimmers have about the wristbands?",
          options: [
            { key: "A", text: "The colours made them feel publicly labelled." },
            { key: "B", text: "The wristbands prevented lifeguards from acting." },
            { key: "C", text: "The booking limit had been removed." },
            { key: "D", text: "Beginners were banned from asking for advice." },
          ],
          answer: "A",
          explanation:
            "The passage says some swimmers felt publicly labelled by the colours.",
        },
        {
          suffix: 3,
          subtype: "vr-inference",
          tags: ["inference-question", "text-stem", "set-based", "medium"],
          question: "Which conclusion is most justified by the trial results?",
          options: [
            { key: "A", text: "The bands may have helped lane organisation, but the booking limit and swimmer comfort matter." },
            { key: "B", text: "The wristbands proved signs could never work." },
            { key: "C", text: "The centre decided to use bands at all times." },
            { key: "D", text: "Complaints rose because lifeguards could move swimmers." },
          ],
          answer: "A",
          explanation:
            "Complaints fell, but a booking limit started at the same time and managers asked whether signs could achieve the same clarity.",
        },
        {
          suffix: 4,
          subtype: "vr-author",
          tags: ["author-opinion", "text-stem", "set-based", "medium"],
          question: "Which description best matches the tone of the passage?",
          options: [
            { key: "A", text: "Balanced, recognising operational benefits and possible embarrassment." },
            { key: "B", text: "Dismissive of swimmers who wanted clearer lanes." },
            { key: "C", text: "Certain that wristbands were the only possible solution." },
            { key: "D", text: "Hostile towards lifeguards moving swimmers." },
          ],
          answer: "A",
          explanation:
            "The passage describes reduced complaints and clearer advice, but also concerns about labelling and the possibility of signs.",
        },
      ],
    }),
    ...makeCuratedSjtSet({
      setId: "hq-sjt-0005",
      issueTags: ["candour"],
      stimulus: [
        "Sofia, a medical student, realises she told a visitor that visiting starts at 2 pm, but the ward has temporarily changed visiting to 3 pm because of infection-control cleaning. The visitor has travelled a long way and is already at the hospital entrance. A nurse is available but busy arranging another patient's discharge.",
      ],
      items: [
        {
          suffix: 1,
          subtype: "sjt-appropriateness",
          tags: ["text-stem", "set-based", "medium"],
          question:
            "How appropriate is it for Sofia to tell the visitor there may have been a mistake and find the nurse, but not clearly explain that she gave the wrong time?",
          options: APPROPRIATENESS_OPTIONS,
          answer: "B",
          explanation:
            "This is appropriate because Sofia seeks help and does not ignore the issue. It is not ideal because she is not fully open about her own mistake.",
        },
        {
          suffix: 2,
          subtype: "sjt-appropriateness",
          tags: ["text-stem", "set-based", "medium"],
          question:
            "How appropriate is it for Sofia to say nothing and hope the entrance staff explain the correct time?",
          options: APPROPRIATENESS_OPTIONS,
          answer: "D",
          explanation:
            "This is very inappropriate because it avoids correcting misinformation and leaves the visitor to deal with the consequence of Sofia's error.",
        },
        {
          suffix: 3,
          subtype: "sjt-importance",
          tags: ["text-stem", "set-based", "medium"],
          question: "How important is being open about the incorrect information so it can be corrected?",
          options: IMPORTANCE_OPTIONS,
          answer: "A",
          explanation:
            "This is very important because honesty allows staff to correct the situation and maintain trust.",
        },
        {
          suffix: 4,
          subtype: "sjt-importance",
          tags: ["text-stem", "set-based", "easy"],
          question: "How important is whether the visitor remembers Sofia's name?",
          options: IMPORTANCE_OPTIONS,
          answer: "D",
          explanation:
            "This is not important to deciding the right action. The priority is correcting the information and being honest.",
        },
        {
          suffix: 5,
          subtype: "sjt-drag-drop",
          tags: ["text-stem", "set-based", "hard", "multi-step"],
          question: "Decide which actions are appropriate and which are inappropriate.",
          categoryItems: [
            { id: "tell-nurse", text: "Tell the nurse what Sofia said and ask how best to help the visitor.", answerCategory: "appropriate" },
            { id: "ignore-error", text: "Avoid mentioning the error because the visitor may not complain.", answerCategory: "inappropriate" },
            { id: "apologise", text: "Apologise for the incorrect information once the correct arrangements are confirmed.", answerCategory: "appropriate" },
            { id: "blame-signs", text: "Blame the ward signs without checking the current visiting arrangement.", answerCategory: "inappropriate" },
          ],
          explanation:
            "Appropriate actions correct the misinformation and involve staff. Inappropriate actions avoid honesty or shift blame without checking facts.",
        },
      ],
    }),
    ...makeCuratedSjtSet({
      setId: "hq-sjt-0006",
      issueTags: ["patient-safety"],
      stimulus: [
        "Tariq, a medical student, notices that a sharps bin in a treatment room is filled above the marked line and is partly blocking the work surface. A healthcare assistant says the room is needed for the next patient and suggests pushing the lid down to make space. The nurse in charge is checking medication nearby.",
      ],
      items: [
        {
          suffix: 1,
          subtype: "sjt-appropriateness",
          tags: ["text-stem", "set-based", "medium"],
          question:
            "How suitable would it be for Tariq to avoid touching the bin and promptly tell the nurse in charge?",
          options: APPROPRIATENESS_OPTIONS,
          answer: "A",
          explanation:
            "This is very appropriate because it recognises a safety risk and escalates it without handling hazardous equipment beyond role.",
        },
        {
          suffix: 2,
          subtype: "sjt-appropriateness",
          tags: ["text-stem", "set-based", "medium"],
          question:
            "How suitable would it be for Tariq to keep the next patient away from the work surface but wait until later to mention the overfilled bin?",
          options: APPROPRIATENESS_OPTIONS,
          answer: "C",
          explanation:
            "This is inappropriate because an overfilled sharps bin should be escalated promptly. It is not the worst response because Tariq is at least trying to reduce immediate exposure.",
        },
        {
          suffix: 3,
          subtype: "sjt-importance",
          tags: ["text-stem", "set-based", "medium"],
          question: "How much importance should be given to preventing avoidable sharps injury?",
          options: IMPORTANCE_OPTIONS,
          answer: "A",
          explanation:
            "This is very important because an overfilled sharps bin is an immediate safety concern.",
        },
        {
          suffix: 4,
          subtype: "sjt-importance",
          tags: ["text-stem", "set-based", "easy"],
          question: "How much importance should be given to whether the work surface has recently been cleaned?",
          options: IMPORTANCE_OPTIONS,
          answer: "D",
          explanation:
            "This is not important to the decision about an overfilled sharps bin. The safety risk needs escalation regardless.",
        },
        {
          suffix: 5,
          subtype: "sjt-drag-drop",
          tags: ["text-stem", "set-based", "hard", "multi-step"],
          question: "Group the actions according to their professional suitability.",
          categoryItems: [
            { id: "tell-nurse", text: "Tell the nurse in charge that the sharps bin is above the marked fill line.", answerCategory: "appropriate" },
            { id: "push-lid", text: "Push the contents down to make the room ready faster.", answerCategory: "inappropriate" },
            { id: "keep-clear", text: "Avoid using the blocked work surface until staff have dealt with the bin.", answerCategory: "appropriate" },
            { id: "move-alone", text: "Carry the overfilled bin to another room without asking staff.", answerCategory: "inappropriate" },
          ],
          explanation:
            "Appropriate actions avoid handling the hazard and alert qualified staff. Inappropriate actions increase sharps risk or act beyond role.",
        },
      ],
    }),
    ...makeCuratedQrSet({
      setId: "hq-qr-geometry-0004",
      stimulus: [
        "The table shows dimensions for four clinic rooms. Flooring is priced per square metre. Paint calculations use the four walls only and ignore doors and windows.",
      ],
      visual: {
        type: "table",
        title: "Clinic room dimensions",
        headers: ["Room", "Length", "Width", "Height"],
        rows: [
          ["A", "6.5 m", "4.0 m", "2.8 m"],
          ["B", "5.2 m", "5.0 m", "2.8 m"],
          ["C", "7.0 m", "3.8 m", "2.8 m"],
          ["D", "4.5 m", "6.2 m", "2.8 m"],
        ],
      },
      items: [
        {
          suffix: 1,
          subtype: "qr-units-geometry",
          tags: ["data-display", "set-based", "medium"],
          question: "Which room has the greatest floor area?",
          options: [
            { key: "A", text: "Room A" },
            { key: "B", text: "Room B" },
            { key: "C", text: "Room C" },
            { key: "D", text: "Room D" },
          ],
          answer: "D",
          explanation:
            "Floor areas are A 26.0 m2, B 26.0 m2, C 26.6 m2 and D 27.9 m2. Room D is greatest.",
        },
        {
          suffix: 2,
          subtype: "qr-units-geometry",
          tags: ["data-display", "set-based", "hard", "multi-step"],
          question:
            "Vinyl flooring costs GBP 18 per m2. If Rooms A and D need 10% extra material for waste, what is the total material cost?",
          options: [
            { key: "A", text: "GBP 970.20" },
            { key: "B", text: "GBP 1,067.22" },
            { key: "C", text: "GBP 1,164.24" },
            { key: "D", text: "GBP 1,940.40" },
          ],
          answer: "B",
          explanation:
            "Rooms A and D have 26.0 + 27.9 = 53.9 m2. Adding 10% gives 59.29 m2. 59.29 x GBP 18 = GBP 1,067.22.",
        },
        {
          suffix: 3,
          subtype: "qr-rates-ratios",
          tags: ["data-display", "set-based", "medium"],
          question: "For Room C, what is the ratio of length to width in simplest whole-number form?",
          options: [
            { key: "A", text: "19:35" },
            { key: "B", text: "35:19" },
            { key: "C", text: "70:19" },
            { key: "D", text: "7:38" },
          ],
          answer: "B",
          explanation:
            "Room C is 7.0 m by 3.8 m. The ratio 7.0:3.8 is 70:38, which simplifies to 35:19.",
        },
        {
          suffix: 4,
          subtype: "qr-calculator-strategy",
          tags: ["data-display", "set-based", "hard", "multi-step"],
          question:
            "Paint covers 12 m2 per litre. How many whole litres are needed to paint the walls of Rooms B and C once?",
          options: [
            { key: "A", text: "8 litres" },
            { key: "B", text: "9 litres" },
            { key: "C", text: "10 litres" },
            { key: "D", text: "12 litres" },
          ],
          answer: "C",
          explanation:
            "Wall area = 2 x (length + width) x height. Room B is 57.12 m2 and Room C is 60.48 m2, total 117.6 m2. 117.6 / 12 = 9.8, so 10 whole litres are needed.",
        },
      ],
    }),
    ...makeCuratedQrSet({
      setId: "hq-qr-finance-0005",
      stimulus: [
        "A revision shop records packs sold during a promotion. Returned packs are fully refunded and are not counted as final sales.",
      ],
      visual: {
        type: "table",
        title: "Revision pack sales",
        headers: ["Pack", "Selling price", "Packs sold", "Return rate"],
        rows: [
          ["Basic", "GBP 12.60", "240", "5%"],
          ["Plus", "GBP 16.80", "200", "8%"],
          ["Clinical", "GBP 21.00", "160", "10%"],
        ],
      },
      items: [
        {
          suffix: 1,
          subtype: "qr-percentages",
          tags: ["data-display", "set-based", "medium", "multi-step"],
          question: "What percentage of final sales were Plus packs?",
          options: [
            { key: "A", text: "30.7%" },
            { key: "B", text: "33.1%" },
            { key: "C", text: "36.0%" },
            { key: "D", text: "40.0%" },
          ],
          answer: "B",
          explanation:
            "Final sales are Basic 228, Plus 184 and Clinical 144, total 556. Plus share = 184 / 556 x 100 = 33.1%.",
        },
        {
          suffix: 2,
          subtype: "qr-calculator-strategy",
          tags: ["data-display", "set-based", "hard", "calculator-heavy"],
          question: "What was the final revenue from Basic and Plus packs combined?",
          options: [
            { key: "A", text: "GBP 5,600.00" },
            { key: "B", text: "GBP 5,964.00" },
            { key: "C", text: "GBP 6,384.00" },
            { key: "D", text: "GBP 7,224.00" },
          ],
          answer: "B",
          explanation:
            "Basic final revenue is 228 x GBP 12.60 = GBP 2,872.80. Plus final revenue is 184 x GBP 16.80 = GBP 3,091.20. Combined = GBP 5,964.00.",
        },
        {
          suffix: 3,
          subtype: "qr-rates-ratios",
          tags: ["data-display", "set-based", "medium", "multi-step"],
          question: "What is the ratio of final Basic sales to final Clinical sales?",
          options: [
            { key: "A", text: "5:3" },
            { key: "B", text: "12:19" },
            { key: "C", text: "19:12" },
            { key: "D", text: "3:2" },
          ],
          answer: "C",
          explanation:
            "Final Basic sales are 240 x 95% = 228. Final Clinical sales are 160 x 90% = 144. The ratio 228:144 simplifies to 19:12.",
        },
        {
          suffix: 4,
          subtype: "qr-estimation",
          tags: ["data-display", "set-based", "medium", "multi-step"],
          question: "Using quick estimation, which is closest to the final revenue from all three pack types?",
          options: [
            { key: "A", text: "GBP 7,000" },
            { key: "B", text: "GBP 8,000" },
            { key: "C", text: "GBP 9,000" },
            { key: "D", text: "GBP 10,500" },
          ],
          answer: "C",
          explanation:
            "Final revenue is about GBP 2,873 + GBP 3,091 + GBP 3,024 = GBP 8,988, closest to GBP 9,000.",
        },
      ],
    }),
    ...makeCuratedQrSet({
      setId: "hq-qr-geometry-0017",
      stimulus: [
        "A community centre is choosing flooring and acoustic panels for four rooms. The plan scale for Room A is also being checked.",
      ],
      visual: {
        type: "table",
        title: "Community centre rooms",
        headers: ["Room", "Length", "Width", "Height"],
        rows: [
          ["A", "8.0 m", "6.0 m", "3.0 m"],
          ["B", "7.5 m", "5.2 m", "3.0 m"],
          ["C", "9.0 m", "4.4 m", "3.0 m"],
          ["D", "6.2 m", "6.1 m", "3.0 m"],
        ],
      },
      items: [
        {
          suffix: 1,
          subtype: "qr-units-geometry",
          tags: ["data-display", "set-based", "medium"],
          question: "Which room has a floor area of at least 40 m2 and a perimeter under 29 m?",
          options: [
            { key: "A", text: "Room A" },
            { key: "B", text: "Room B" },
            { key: "C", text: "Room C" },
            { key: "D", text: "Room D" },
          ],
          answer: "A",
          explanation:
            "Room A has area 8 x 6 = 48 m2 and perimeter 2 x (8 + 6) = 28 m. The other rooms either have area below 40 m2 or do not meet both conditions.",
        },
        {
          suffix: 2,
          subtype: "qr-units-geometry",
          tags: ["data-display", "set-based", "hard", "multi-step"],
          question:
            "Carpet tiles cover 5 m2 per box. Rooms B and D need 5% extra tiles for spare stock. How many boxes are needed?",
          options: [
            { key: "A", text: "15 boxes" },
            { key: "B", text: "16 boxes" },
            { key: "C", text: "17 boxes" },
            { key: "D", text: "18 boxes" },
          ],
          answer: "C",
          explanation:
            "Rooms B and D total 39.0 + 37.82 = 76.82 m2. Adding 5% gives 80.661 m2. 80.661 / 5 = 16.13, so 17 boxes are needed.",
        },
        {
          suffix: 3,
          subtype: "qr-rates-ratios",
          tags: ["data-display", "set-based", "medium"],
          question: "Room A is drawn as 16 cm long on a plan. What scale is being used?",
          options: [
            { key: "A", text: "1 cm represents 0.25 m" },
            { key: "B", text: "1 cm represents 0.5 m" },
            { key: "C", text: "1 cm represents 1.6 m" },
            { key: "D", text: "1 cm represents 2 m" },
          ],
          answer: "B",
          explanation:
            "Room A is 8.0 m long. 8.0 m / 16 cm = 0.5 m per cm.",
        },
        {
          suffix: 4,
          subtype: "qr-calculator-strategy",
          tags: ["data-display", "set-based", "hard", "multi-step"],
          question:
            "Acoustic panels cover 2.4 m2 each. If panels are fitted to the lower 1.2 m of all walls in Rooms C and D, how many panels are needed?",
          options: [
            { key: "A", text: "24 panels" },
            { key: "B", text: "25 panels" },
            { key: "C", text: "26 panels" },
            { key: "D", text: "28 panels" },
          ],
          answer: "C",
          explanation:
            "Panel area is perimeter x 1.2 m. Room C: 2 x (9.0 + 4.4) x 1.2 = 32.16 m2. Room D: 2 x (6.2 + 6.1) x 1.2 = 29.52 m2. Total 61.68 / 2.4 = 25.7, so 26 panels.",
        },
      ],
    }),
    ...makeCuratedQrSet({
      setId: "hq-qr-finance-0018",
      stimulus: [
        "A clinic sells monthly wellbeing memberships. Concession members pay a reduced monthly fee.",
      ],
      visual: {
        type: "table",
        title: "Monthly membership data",
        headers: ["Plan", "Monthly fee", "Members", "Concession share", "Concession discount"],
        rows: [
          ["Bronze", "GBP 18", "320", "30%", "25%"],
          ["Silver", "GBP 26", "210", "40%", "20%"],
          ["Gold", "GBP 40", "95", "20%", "15%"],
        ],
      },
      items: [
        {
          suffix: 1,
          subtype: "qr-percentages",
          tags: ["data-display", "set-based", "medium", "multi-step"],
          question: "What percentage of all members are concession members on the Bronze or Silver plans?",
          options: [
            { key: "A", text: "24.6%" },
            { key: "B", text: "28.8%" },
            { key: "C", text: "32.0%" },
            { key: "D", text: "36.4%" },
          ],
          answer: "B",
          explanation:
            "Bronze concession members = 30% of 320 = 96. Silver concession members = 40% of 210 = 84. Total = 180 out of 625 members, so 180 / 625 x 100 = 28.8%.",
        },
        {
          suffix: 2,
          subtype: "qr-calculator-strategy",
          tags: ["data-display", "set-based", "hard", "calculator-heavy"],
          question: "What is the monthly revenue from Silver members after concession discounts?",
          options: [
            { key: "A", text: "GBP 4,368.00" },
            { key: "B", text: "GBP 5,023.20" },
            { key: "C", text: "GBP 5,460.00" },
            { key: "D", text: "GBP 6,552.00" },
          ],
          answer: "B",
          explanation:
            "Silver has 126 full-price members and 84 concession members. Revenue = 126 x GBP 26 + 84 x GBP 20.80 = GBP 5,023.20.",
        },
        {
          suffix: 3,
          subtype: "qr-rates-ratios",
          tags: ["data-display", "set-based", "medium", "multi-step"],
          question: "What is the ratio of full-price Bronze members to full-price Gold members?",
          options: [
            { key: "A", text: "56:19" },
            { key: "B", text: "19:56" },
            { key: "C", text: "16:5" },
            { key: "D", text: "224:95" },
          ],
          answer: "A",
          explanation:
            "Full-price Bronze members = 70% of 320 = 224. Full-price Gold members = 80% of 95 = 76. The ratio 224:76 simplifies to 56:19.",
        },
        {
          suffix: 4,
          subtype: "qr-estimation",
          tags: ["data-display", "set-based", "medium", "multi-step"],
          question: "Using quick estimation, which is closest to total monthly revenue from all plans?",
          options: [
            { key: "A", text: "GBP 11,500" },
            { key: "B", text: "GBP 14,000" },
            { key: "C", text: "GBP 16,500" },
            { key: "D", text: "GBP 19,000" },
          ],
          answer: "B",
          explanation:
            "Revenue is about GBP 5,328 from Bronze, GBP 5,023 from Silver and GBP 3,686 from Gold, total about GBP 14,037, closest to GBP 14,000.",
        },
      ],
    }),
  ].map((question) => [question.id, question])
) as Record<string, UCATQuestion>;

const ALL_CURATED_REPLACEMENTS: Record<string, UCATQuestion> = {
  ...HIGH_QUALITY_9000_CURATED_REPLACEMENTS,
  ...MORE_CURATED_REPLACEMENTS,
};

function applyCuratedQuestionReplacements(questions: UCATQuestion[]) {
  return questions.map(
    (question) => ALL_CURATED_REPLACEMENTS[question.id] ?? question
  );
}

export const HIGH_QUALITY_9000_RAW_VR_QUESTIONS: UCATQuestion[] = range(
  HIGH_QUALITY_9000_COMPLETED_BATCHES * VR_SETS_PER_BATCH
).flatMap(makeVrSet);

export const HIGH_QUALITY_9000_VR_QUESTIONS: UCATQuestion[] =
  applyCuratedQuestionReplacements(
    selectQuestionGroups({
      questions: HIGH_QUALITY_9000_RAW_VR_QUESTIONS,
      targetQuestions: HIGH_QUALITY_9000_FILTERED_TARGETS.vr,
      expectedGroupSize: 4,
      stimulusCap: 8,
      questionTemplateCap: 160,
    })
  );

const DM_NOUN_GROUPS = [
  ["amber permits", "checked records", "urgent referrals", "archived files", "digital logs"],
  ["river samples", "labelled specimens", "weekday tests", "discarded batches", "sealed crates"],
  ["grant bids", "reviewed proposals", "student projects", "late submissions", "funded pilots"],
  ["training rooms", "booked spaces", "clinical sessions", "maintenance areas", "quiet zones"],
  ["library requests", "approved loans", "digital renewals", "overdue items", "reserved books"],
  ["market stalls", "licensed units", "food vendors", "temporary pitches", "inspection notes"],
  ["clinic referrals", "triaged cases", "urgent letters", "routine notes", "follow-up calls"],
  ["science kits", "checked boxes", "loaned items", "damaged labels", "replacement orders"],
  ["community grants", "approved bids", "sports projects", "late reviews", "reserve awards"],
  ["training badges", "verified passes", "mentor sessions", "cancelled slots", "waiting-list entries"],
  ["archive requests", "digitised records", "local maps", "restricted files", "catalogue notes"],
  ["garden plots", "leased spaces", "winter crops", "unused beds", "compost bookings"],
] as const;

const DM_SYLLOGISM_CONTEXTS = [
  "permit audit",
  "laboratory sample review",
  "grant allocation meeting",
  "room-booking check",
  "library loan review",
  "market inspection",
  "clinic triage review",
  "equipment inventory",
  "community funding panel",
  "training-register check",
  "archive access review",
  "garden-allocation meeting",
] as const;

const DM_SYLLOGISM_QUALIFIERS = [
  "priority",
  "weekday",
  "sealed",
  "temporary",
  "online",
  "north-desk",
  "evening",
  "reserve",
  "marked",
  "flagged",
  "winter",
  "local",
  "verified",
  "pilot",
  "central",
  "manual",
  "digital",
  "early",
  "late",
  "training",
  "external",
  "internal",
  "reviewed",
  "monthly",
  "shared",
  "urgent",
  "routine",
  "paper",
  "green",
  "amber",
  "blue",
] as const;

const DM_SYLLOGISM_QUESTIONS = [
  "Place each conclusion under Yes if it must follow, or No if it does not have to follow.",
  "For each conclusion, decide whether it follows logically from the statements.",
  "Sort the conclusions according to whether they must be true.",
  "Use the statements to decide which conclusions are forced and which are not.",
  "Classify each conclusion as following or not following from the information given.",
  "Decide whether each conclusion must follow from the premises.",
] as const;

function makeDmSyllogism(index: number): UCATQuestion {
  const [baseA, baseB, baseC, baseD, baseE] = pick(DM_NOUN_GROUPS, index);
  const context = pick(DM_SYLLOGISM_CONTEXTS, index * 5);
  const qualifier = pick(DM_SYLLOGISM_QUALIFIERS, index * 7);
  const a = baseA.toLowerCase().startsWith(`${qualifier} `) ? baseA : `${qualifier} ${baseA}`;
  const b = baseB;
  const c = baseC;
  const d = baseD;
  const e = baseE;
  return dragCategoryQuestion({
    id: `hq-dm-syllogism-${pad(index)}`,
    section: "dm",
    subtype: "dm-syllogisms",
    tags: ["text-stem", "set-based", index % 4 === 0 ? "hard" : "medium"],
    title: "Decision Making Practice",
    leftTitle: "Syllogism",
    stimulus: [`During ${context} ${index + 1}, all ${a} are ${b}. Some ${b} are ${c}. No ${c} are ${d}. All ${d} are ${e}.`],
    question: pick(DM_SYLLOGISM_QUESTIONS, index),
    instruction: "Use only the information in the syllogism.",
    categories: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" },
    ],
    categoryItems: [
      { id: "all-a-b", text: `All ${a} are ${b}.`, answerCategory: "yes" },
      { id: "some-b-c", text: `Some ${b} are ${c}.`, answerCategory: "yes" },
      { id: "some-c-a", text: `Some ${c} are ${a}.`, answerCategory: "no" },
      { id: "no-d-c", text: `No ${d} are ${c}.`, answerCategory: "yes" },
      { id: "all-e-d", text: `All ${e} are ${d}.`, answerCategory: "no" },
    ],
    explanation:
      "Only the exact all/some/no relationships given, plus their valid reversals for no statements, must follow. The other conclusions reverse or overextend the premises.",
  });
}

const LOGIC_NAMES = [
  ["Amina", "Ben", "Cara", "Dev"],
  ["Ella", "Farid", "Grace", "Hugo"],
  ["Iris", "Jonah", "Kiran", "Lena"],
  ["Maya", "Noah", "Orla", "Priya"],
  ["Ravi", "Sofia", "Theo", "Una"],
  ["Anya", "Bilal", "Cerys", "Dara"],
  ["Eli", "Freya", "Gita", "Hamza"],
  ["Iman", "Joel", "Keira", "Luca"],
  ["Mina", "Nikhil", "Owen", "Pia"],
  ["Rhea", "Samir", "Talia", "Vik"],
] as const;

const LOGIC_TASKS = [
  ["forms", "keys", "samples", "badges"],
  ["tents", "lights", "maps", "passes"],
  ["prints", "labels", "boxes", "folders"],
  ["rooms", "chairs", "screens", "cables"],
  ["routes", "tickets", "bags", "radios"],
  ["forms", "lanyards", "clipboards", "keys"],
  ["posters", "tables", "signs", "speakers"],
  ["samples", "coolers", "labels", "gloves"],
  ["passes", "menus", "tokens", "receipts"],
  ["maps", "radios", "torches", "first-aid kits"],
] as const;

function makeDmLogic(index: number): UCATQuestion {
  const people = pick(LOGIC_NAMES, index);
  const tasks = pick(LOGIC_TASKS, index * 3);
  const first = people[index % people.length];
  const second = people[(index + 1) % people.length];
  const third = people[(index + 2) % people.length];
  const fourth = people[(index + 3) % people.length];
  const firstTask = tasks[(index + 1) % tasks.length];
  const thirdTask = tasks[(index + 2) % tasks.length];
  const variant = index % 4;
  const questionText =
    variant === 0
      ? `Who works immediately before ${second}?`
      : variant === 1
        ? "Who works last?"
        : variant === 2
          ? `Who completes ${thirdTask}?`
          : `Who cannot complete ${firstTask}?`;
  const correctText =
    variant === 0 ? first : variant === 1 ? fourth : variant === 2 ? third : first;
  const distractors = people.filter((person) => person !== correctText);
  const explanation =
    variant === 0
      ? `${first} is stated to work immediately before ${second}.`
      : variant === 1
        ? `${fourth} is explicitly stated to be last.`
        : variant === 2
          ? `${third} is explicitly stated to complete ${thirdTask}.`
          : `${first} cannot complete ${firstTask} because that restriction is stated directly.`;

  return singleQuestion({
    id: `hq-dm-logic-${pad(index)}`,
    section: "dm",
    subtype: "dm-logic",
    tags: ["text-stem", "multi-step", index % 3 === 0 ? "hard" : "medium", "time-consuming"],
    title: "Decision Making Practice",
    leftTitle: "Information",
    stimulus: [
      `During rota ${index + 1}, ${people.join(", ")} each complete one task: ${tasks.join(", ")}. ${first} works immediately before ${second}. ${fourth} is last. ${first} does not complete ${firstTask}. ${third} completes ${thirdTask}.`,
    ],
    question: questionText,
    correctText,
    distractors,
    explanation,
    seed: index,
  });
}

const ARGUMENT_TOPICS = [
  {
    body: "school governing board",
    proposal: "a school should open its study hall on Saturday mornings",
    reason: "some pupils have caring or work responsibilities after school",
    contexts: [
      "attendance records show that weekday sessions are missed by the same small group",
      "pupil feedback says the current support times clash with home responsibilities",
      "teachers have noticed that some pupils ask for space but cannot stay after school",
      "the school wants to test whether an extra supervised slot removes a practical barrier",
    ],
  },
  {
    body: "council working group",
    proposal: "a council should trial dimmer street lighting after midnight",
    reason: "the trial could reduce energy use while retaining monitored safety checks",
    contexts: [
      "energy costs have risen but residents have raised safety concerns about full switch-offs",
      "maintenance data shows several streets stay brightly lit when pedestrian use is low",
      "local representatives want a measured trial rather than a permanent overnight change",
      "the council has access to usage and incident data for the proposed trial streets",
    ],
  },
  {
    body: "clinic admin team",
    proposal: "a clinic should text appointment reminders in two languages",
    reason: "missed appointments can fall when reminders are understandable",
    contexts: [
      "missed appointments are highest among patients who report difficulty using English letters",
      "reception staff often repeat the same appointment details by phone",
      "patient feedback says some written reminders are not clear enough",
      "the team wants a change linked to attendance rather than general convenience",
    ],
  },
  {
    body: "library service panel",
    proposal: "a library should keep a small quiet room for phone-free study",
    reason: "some users need distraction-free space for timed work",
    contexts: [
      "desk surveys show that noise is the most common complaint during exam season",
      "staff have seen users leave early when group study tables become loud",
      "booking notes show repeated requests for a place to complete timed practice",
      "the panel wants to protect mixed-use spaces while meeting a specific study need",
    ],
  },
  {
    body: "transport review group",
    proposal: "a bus company should add one early route during exam week",
    reason: "students with early exams may otherwise rely on costly taxis",
    contexts: [
      "college timetables show several exams begin before the first usual bus arrives",
      "fare feedback says alternative travel is expensive for students living furthest away",
      "the company can compare usage across the exam-week trial",
      "schools have asked for a limited change that matches the exam timetable",
    ],
  },
  {
    body: "sports centre board",
    proposal: "a sports centre should reserve one lane for beginners",
    reason: "new swimmers may practise more safely when they are not mixed with faster users",
    contexts: [
      "incident reports show that newer swimmers often stop when faster swimmers pass closely",
      "coaches say beginners need a predictable space for basic practice",
      "customer comments suggest confidence is lower during the busiest lane sessions",
      "the board wants a targeted safety reason rather than a general claim about popularity",
    ],
  },
  {
    body: "museum education team",
    proposal: "a museum should add timed entry for school groups",
    reason: "arrival slots could reduce crowding without reducing total visitor numbers",
    contexts: [
      "school visits often arrive in large clusters around the same exhibition entrance",
      "gallery staff report bottlenecks when several classes arrive together",
      "teachers have asked for more predictable entry times during busy mornings",
      "the team wants to manage flow while still allowing the same number of pupils to visit",
    ],
  },
  {
    body: "college exams team",
    proposal: "a college should lend calculators during mock exams",
    reason: "students who forget equipment can still practise under realistic conditions",
    contexts: [
      "mock exam reports show several students lose practice time after forgetting equipment",
      "teachers want the mock to test reasoning rather than whether spare equipment was available",
      "students are expected to bring their own calculators in the real exam",
      "the team wants an argument linked to fair practice rather than making the mock easier",
    ],
  },
  {
    body: "pharmacy operations group",
    proposal: "a pharmacy should use clearer queue signs",
    reason: "patients may reach the right counter sooner and reduce avoidable delays",
    contexts: [
      "staff often redirect patients who have waited in the wrong queue",
      "patient feedback says the difference between collection and advice counters is unclear",
      "the group wants to reduce confusion without adding extra staff",
      "waiting-time checks show delays are worst when counter roles are not obvious",
    ],
  },
  {
    body: "theatre access panel",
    proposal: "a theatre should publish access information beside each event",
    reason: "visitors with mobility needs can decide whether the venue is suitable before booking",
    contexts: [
      "box-office staff frequently answer access questions after customers have already chosen seats",
      "audience feedback says access details are hard to find during booking",
      "the panel wants to improve informed choice rather than only respond after problems occur",
      "some events use different entrances, so general venue information is not always enough",
    ],
  },
  {
    body: "community garden committee",
    proposal: "a community garden should introduce booking windows for tools",
    reason: "shared equipment is more likely to be available when demand is spread out",
    contexts: [
      "members often ask for the same tools at the start of weekend sessions",
      "volunteer logs show that popular equipment is idle later in the day",
      "the committee wants a scheduling reason rather than a claim that rules are always better",
      "new members report that they are unsure when shared tools will be free",
    ],
  },
  {
    body: "revision club organiser",
    proposal: "a revision club should cap each group at eight students",
    reason: "smaller groups may give tutors enough time to check individual misunderstandings",
    contexts: [
      "tutors report that larger groups leave little time for individual checking",
      "student feedback says misconceptions are missed when sessions are too crowded",
      "the organiser wants a reason linked to learning quality rather than atmosphere alone",
      "attendance records show that some sessions regularly exceed the planned group size",
    ],
  },
] as const;

const ARGUMENT_SITE_NAMES = [
  "Aberford",
  "Bexley",
  "Calder",
  "Dunmere",
  "Eastmere",
  "Fallowfield",
  "Grafton",
  "Hawthorne",
  "Ivybridge",
  "Juniper",
  "Kenton",
  "Larkhill",
  "Marlowe",
  "Norfield",
  "Oakmere",
  "Pemberton",
  "Quarrygate",
  "Ravensby",
  "Stonecross",
  "Thornwick",
  "Upton",
  "Vale Street",
  "Westbrook",
  "Yarwood",
  "Zephyr",
  "Aster",
  "Brighton Road",
  "Cedar Lane",
  "Draycott",
  "Elmhurst",
  "Foxwell",
] as const;

const ARGUMENT_PERIODS = [
  "for a four-week pilot",
  "during the busiest part of term",
  "before deciding on a permanent policy",
  "as a limited trial",
  "for the next review cycle",
  "during a period when demand is unusually high",
  "while collecting feedback from affected users",
  "before the service is expanded",
] as const;

const DM_ARGUMENT_QUESTIONS = [
  "Select the strongest argument from the statements below.",
  "Which is the strongest argument about this proposal?",
  "Which statement gives the most relevant argument?",
  "Which option is the best-supported argument?",
  "Which argument is strongest because it is directly linked to the decision?",
  "Which response gives the clearest reason for the proposal?",
] as const;

function makeDmArgument(index: number): UCATQuestion {
  const topic = pick(ARGUMENT_TOPICS, index);
  const site = pick(ARGUMENT_SITE_NAMES, index * 5);
  const period = pick(ARGUMENT_PERIODS, index * 7);
  const context = pick(topic.contexts, Math.floor(index / ARGUMENT_TOPICS.length));
  return singleQuestion({
    id: `hq-dm-argument-${pad(index)}`,
    section: "dm",
    subtype: "dm-arguments",
    tags: ["text-stem", "quick", "medium"],
    title: "Decision Making Practice",
    leftTitle: "Argument",
    stimulus: [
      `The ${site} ${topic.body} is deciding whether ${topic.proposal} ${period}. Recent information says ${context}.`,
    ],
    question: pick(DM_ARGUMENT_QUESTIONS, index),
    correctText: `Yes, because ${topic.reason}.`,
    distractors: [
      "Yes, because any change is automatically popular.",
      "No, because someone may dislike filling in a feedback form.",
      "No, because the committee discussed the topic in a long meeting.",
    ],
    explanation:
      "The strongest argument is relevant, proportionate and linked to the decision's likely effect. The other options are vague, emotional or irrelevant.",
    seed: index,
  });
}

function makeDmYesNo(index: number): UCATQuestion {
  const total = 90 + (index % 40);
  const first = 45 + (index % 22);
  const second = 36 + (index % 18);
  const both = 14 + (index % 9);
  const firstOnly = first - both;
  const secondOnly = second - both;
  const neither = total - firstOnly - secondOnly - both;
  const toolA = pick(["flashcards", "timed sets", "video notes", "worked examples", "mind maps", "past-paper logs", "formula cards", "topic checklists"], index);
  const toolB = pick(["summary sheets", "question logs", "audio notes", "peer marking", "mini mocks", "error notebooks", "group quizzes", "teacher feedback"], index + 1);
  const question = pick(
    [
      "Place Yes if the conclusion follows from the data, otherwise place No.",
      "For each conclusion, decide whether it follows from the information.",
      "Select Yes for conclusions that must be true and No for those that need not be true.",
      "Use the data to judge each conclusion.",
      "Decide whether each statement is supported by the figures.",
    ] as const,
    index
  );
  return yesNoQuestion({
    id: `hq-dm-yes-no-${pad(index)}`,
    section: "dm",
    subtype: "dm-yes-no",
    tags: ["text-stem", "multi-step", index % 4 === 0 ? "hard" : "medium"],
    title: "Decision Making Practice",
    leftTitle: "Data",
    stimulus: [
      `Revision cohort ${index + 1} has ${total} members. ${first} use ${toolA}, ${second} use ${toolB}, and ${both} use both tools.`,
    ],
    question,
    instruction: "Use the data to answer each conclusion.",
    yesNoStatements: [
      { id: "first-only", text: `Exactly ${firstOnly} members use only ${toolA}.`, answer: "Yes" },
      { id: "second-only-wrong", text: `Exactly ${secondOnly + 2} members use only ${toolB}.`, answer: "No" },
      { id: "neither", text: `${neither} members use neither tool.`, answer: "Yes" },
      { id: "both-majority", text: "More than half of the group uses both tools.", answer: both > total / 2 ? "Yes" : "No" },
      { id: "total-uses", text: `${first + second} members use at least one of the two tools.`, answer: "No" },
    ],
    explanation:
      `Only ${toolA} = ${first} - ${both} = ${firstOnly}; only ${toolB} = ${second} - ${both} = ${secondOnly}; neither = ${total} - ${firstOnly + secondOnly + both} = ${neither}.`,
  });
}

function makeDmVenn(index: number): UCATQuestion {
  const contexts = [
    {
      title: "Revision habits",
      noun: "students",
      setting: "revision hub",
      labels: ["Flashcards", "Timed drills", "Error log"],
    },
    {
      title: "Clinic contact routes",
      noun: "patients",
      setting: "clinic reception team",
      labels: ["App", "Phone line", "Email"],
    },
    {
      title: "Library use",
      noun: "members",
      setting: "community library",
      labels: ["Study desk", "Book loan", "Printing"],
    },
    {
      title: "Training formats",
      noun: "staff",
      setting: "hospital education team",
      labels: ["Briefing", "E-learning", "Simulation"],
    },
    {
      title: "Event roles",
      noun: "volunteers",
      setting: "fundraising event",
      labels: ["Welcome desk", "Refreshments", "First aid"],
    },
    {
      title: "Course support",
      noun: "applicants",
      setting: "sixth-form advice centre",
      labels: ["Mentoring", "Mock test", "Feedback session"],
    },
    {
      title: "Sports sessions",
      noun: "club members",
      setting: "leisure centre",
      labels: ["Swimming", "Cycling", "Strength class"],
    },
    {
      title: "Museum activities",
      noun: "visitors",
      setting: "city museum",
      labels: ["Audio guide", "Workshop", "Archive room"],
    },
    {
      title: "Transport passes",
      noun: "commuters",
      setting: "travel office",
      labels: ["Railcard", "Bus pass", "Bike locker"],
    },
    {
      title: "Practice resources",
      noun: "learners",
      setting: "online course",
      labels: ["Video lesson", "Question bank", "Notes pack"],
    },
    {
      title: "Market services",
      noun: "stallholders",
      setting: "market office",
      labels: ["Card reader", "Storage unit", "Delivery bay"],
    },
    {
      title: "Arts centre bookings",
      noun: "participants",
      setting: "arts centre",
      labels: ["Choir", "Drawing", "Drama"],
    },
  ] as const;
  const shapeSets = [
    ["circle", "rectangle", "triangle"],
    ["pentagon", "circle", "triangle"],
    ["circle", "diamond", "triangle"],
    ["hexagon", "circle", "rectangle"],
  ] as const;
  const context = pick(contexts, index + Math.floor(index / contexts.length));
  const [firstLabel, secondLabel, thirdLabel] = context.labels;
  const [firstShape, secondShape, thirdShape] = pick(shapeSets, index);
  const firstOnly = 8 + (index % 13);
  const secondOnly = 7 + ((index * 2) % 12);
  const thirdOnly = 6 + ((index * 3) % 11);
  const firstSecond = 4 + ((index * 5) % 9);
  const firstThird = 3 + ((index * 7) % 8);
  const secondThird = 5 + ((index * 4) % 10);
  const allThree = 2 + ((index * 3) % 7);
  const neither = 5 + ((index * 5) % 14);
  const exactlyOne = firstOnly + secondOnly + thirdOnly;
  const exactlyTwo = firstSecond + firstThird + secondThird;
  const atLeastTwo = exactlyTwo + allThree;
  const firstTotal = firstOnly + firstSecond + firstThird + allThree;
  const secondTotal = secondOnly + firstSecond + secondThird + allThree;
  const thirdTotal = thirdOnly + firstThird + secondThird + allThree;
  const union = exactlyOne + exactlyTwo + allThree;
  const total = union + neither;
  const questionKind = index % 12;
  const questionChoices: Array<{
    question: string;
    correct: number;
    explanation: string;
    difficulty: UCATQuestionTag;
  }> = [
      {
        question: `How many ${context.noun} are in exactly one of the three categories?`,
        correct: exactlyOne,
        explanation: `Exactly one category = ${firstOnly} + ${secondOnly} + ${thirdOnly} = ${exactlyOne}.`,
        difficulty: "easy",
      },
      {
        question: `How many ${context.noun} are in exactly two of the three categories?`,
        correct: exactlyTwo,
        explanation: `Exactly two categories = ${firstSecond} + ${firstThird} + ${secondThird} = ${exactlyTwo}.`,
        difficulty: "medium",
      },
      {
        question: `How many ${context.noun} are in at least two categories?`,
        correct: atLeastTwo,
        explanation: `At least two categories includes the three two-way-only regions and the all-three region: ${exactlyTwo} + ${allThree} = ${atLeastTwo}.`,
        difficulty: "medium",
      },
      {
        question: `How many ${context.noun} are in the ${firstLabel} category?`,
        correct: firstTotal,
        explanation: `${firstLabel} includes ${firstOnly}, ${firstSecond}, ${firstThird} and ${allThree}, giving ${firstTotal}.`,
        difficulty: "medium",
      },
      {
        question: `How many ${context.noun} are in both ${firstLabel} and ${secondLabel}, but not ${thirdLabel}?`,
        correct: firstSecond,
        explanation: `The exact overlap of ${firstLabel} and ${secondLabel}, outside ${thirdLabel}, is ${firstSecond}.`,
        difficulty: "easy",
      },
      {
        question: `How many ${context.noun} are in ${firstLabel} or ${thirdLabel}, but not ${secondLabel}?`,
        correct: firstOnly + thirdOnly + firstThird,
        explanation: `Exclude every ${secondLabel} region. The remaining ${firstLabel} or ${thirdLabel} regions are ${firstOnly}, ${thirdOnly} and ${firstThird}, giving ${firstOnly + thirdOnly + firstThird}.`,
        difficulty: "hard",
      },
      {
        question: `How many ${context.noun} are in ${firstLabel} and exactly one other category?`,
        correct: firstSecond + firstThird,
        explanation: `${firstLabel} with exactly one other category means ${firstLabel}+${secondLabel} only and ${firstLabel}+${thirdLabel} only: ${firstSecond} + ${firstThird} = ${firstSecond + firstThird}.`,
        difficulty: "medium",
      },
      {
        question: `How many ${context.noun} are not in the ${thirdLabel} category?`,
        correct: firstOnly + secondOnly + firstSecond + neither,
        explanation: `Not in ${thirdLabel} includes ${firstOnly}, ${secondOnly}, ${firstSecond} and neither: ${firstOnly} + ${secondOnly} + ${firstSecond} + ${neither} = ${firstOnly + secondOnly + firstSecond + neither}.`,
        difficulty: "hard",
      },
      {
        question: `How many ${context.noun} are in all three categories?`,
        correct: allThree,
        explanation: `The centre region shared by all three categories is ${allThree}.`,
        difficulty: "easy",
      },
      {
        question: `How many ${context.noun} are in none of the three categories?`,
        correct: neither,
        explanation: `The number outside all three categories is ${neither}.`,
        difficulty: "easy",
      },
      {
        question: `How many ${context.noun} are in ${firstLabel} or ${secondLabel}?`,
        correct: firstOnly + secondOnly + firstSecond + firstThird + secondThird + allThree,
        explanation: `${firstLabel} or ${secondLabel} includes every region touching either category: ${firstOnly} + ${secondOnly} + ${firstSecond} + ${firstThird} + ${secondThird} + ${allThree} = ${firstOnly + secondOnly + firstSecond + firstThird + secondThird + allThree}.`,
        difficulty: "hard",
      },
      {
        question: `How many ${context.noun} are only in the ${thirdLabel} category?`,
        correct: thirdOnly,
        explanation: `The ${thirdLabel}-only region is ${thirdOnly}.`,
        difficulty: "easy",
      },
  ];
  const questionData = pick(questionChoices, questionKind);
  const visual: UCATChartVisual = {
    type: "set-diagram",
    title: context.title,
    shapes: [
      { id: "first", label: firstLabel, shape: firstShape, x: 70, y: 95, width: 235, height: 210 },
      { id: "second", label: secondLabel, shape: secondShape, x: 240, y: 105, width: 250, height: 190 },
      { id: "third", label: thirdLabel, shape: thirdShape, x: 175, y: 45, width: 285, height: 285 },
    ],
    regionLabels: [
      { id: "first-only", text: String(firstOnly), x: 135, y: 215 },
      { id: "second-only", text: String(secondOnly), x: 435, y: 215 },
      { id: "third-only", text: String(thirdOnly), x: 320, y: 95 },
      { id: "first-second", text: String(firstSecond), x: 270, y: 225 },
      { id: "first-third", text: String(firstThird), x: 235, y: 160 },
      { id: "second-third", text: String(secondThird), x: 385, y: 165 },
      { id: "all-three", text: String(allThree), x: 315, y: 195 },
      { id: "neither", text: String(neither), x: 535, y: 315 },
    ],
    legend: [
      { label: firstLabel, shape: firstShape },
      { label: secondLabel, shape: secondShape },
      { label: thirdLabel, shape: thirdShape },
    ],
  };
  const distractorNumbers = [
    union,
    total,
    exactlyOne,
    exactlyTwo,
    atLeastTwo,
    firstTotal,
    secondTotal,
    thirdTotal,
    questionData.correct + allThree,
    Math.max(0, questionData.correct - allThree),
  ];
  const distractors: string[] = [];

  for (const candidate of distractorNumbers) {
    const text = formatNumber(candidate);
    if (candidate !== questionData.correct && !distractors.includes(text)) {
      distractors.push(text);
    }
    if (distractors.length >= 3) break;
  }

  return singleQuestion({
    id: `hq-dm-venn-${pad(index)}`,
    section: "dm",
    subtype: "dm-venn-sets",
    setId: `hq-dm-venn-${pad(index)}`,
    tags: ["data-display", "set-based", questionData.difficulty],
    title: "Decision Making Practice",
    leftTitle: "Diagram",
    stimulus: [
      `A ${context.setting} recorded ${total} ${context.noun} across three categories: ${firstLabel}, ${secondLabel} and ${thirdLabel}. Each number in the diagram shows ${context.noun} in that exact region.`,
    ],
    visual,
    question: questionData.question,
    correctText: formatNumber(questionData.correct),
    distractors,
    explanation: questionData.explanation,
    seed: index,
  });
}

function makeDmProbability(index: number): UCATQuestion {
  const red = 3 + (index % 6);
  const blue = 4 + ((index * 2) % 7);
  const green = 2 + ((index * 3) % 5);
  const total = red + blue + green;
  const numerator = red + blue;
  const item = pick(["tokens", "cards", "badges", "folders", "tickets", "tiles", "sample pots", "labels"], index);
  const firstColour = pick(["red", "amber", "blue", "green"], index);
  const secondColour = pick(["white", "yellow", "purple", "silver"], index + 2);
  const thirdColour = pick(["green", "grey", "black", "orange"], index + 4);
  return singleQuestion({
    id: `hq-dm-probability-${pad(index)}`,
    section: "dm",
    subtype: "dm-probability-data",
    tags: ["text-stem", index % 5 === 0 ? "multi-step" : "quick", "medium"],
    title: "Decision Making Practice",
    leftTitle: "Information",
    stimulus: [
      `Box ${index + 1} contains ${red} ${firstColour} ${item}, ${blue} ${secondColour} ${item} and ${green} ${thirdColour} ${item}. One ${item.slice(0, -1)} is selected at random.`,
    ],
    question: `What is the probability that the selected ${item.slice(0, -1)} is ${firstColour} or ${secondColour}?`,
    correctText: fraction(numerator, total),
    distractors: [fraction(red, total), fraction(blue, total), fraction(green, total)],
    explanation:
      `There are ${numerator} ${firstColour} or ${secondColour} ${item} out of ${total} total ${item}, giving ${fraction(numerator, total)}.`,
    seed: index,
  });
}

export const HIGH_QUALITY_9000_RAW_DM_QUESTIONS: UCATQuestion[] = [
  ...range(HIGH_QUALITY_9000_COMPLETED_BATCHES * DM_SYLLOGISMS_PER_BATCH).map(makeDmSyllogism),
  ...range(HIGH_QUALITY_9000_COMPLETED_BATCHES * DM_LOGIC_PER_BATCH).map(makeDmLogic),
  ...range(HIGH_QUALITY_9000_COMPLETED_BATCHES * DM_ARGUMENTS_PER_BATCH).map(makeDmArgument),
  ...range(HIGH_QUALITY_9000_COMPLETED_BATCHES * DM_YES_NO_PER_BATCH).map(makeDmYesNo),
  ...range(HIGH_QUALITY_9000_COMPLETED_BATCHES * DM_VENN_PER_BATCH).map(makeDmVenn),
  ...range(HIGH_QUALITY_9000_COMPLETED_BATCHES * DM_PROBABILITY_PER_BATCH).map(makeDmProbability),
];

export const HIGH_QUALITY_9000_DM_QUESTIONS: UCATQuestion[] = selectQuestionsBySubtype({
  questions: HIGH_QUALITY_9000_RAW_DM_QUESTIONS,
  targets: {
    "dm-syllogisms": 669,
    "dm-logic": 669,
    "dm-arguments": 557,
    "dm-yes-no": 557,
    "dm-venn-sets": 891,
    "dm-probability-data": 556,
  },
  templateCap: {
    "dm-syllogisms": 40,
    "dm-logic": 40,
    "dm-arguments": 40,
    "dm-yes-no": 80,
    "dm-venn-sets": 160,
    "dm-probability-data": 96,
  },
});

const QR_DOMAINS = [
  ["meal", "meals", "Vegetarian", "Non-vegetarian"],
  ["study pack", "packs", "Weekday", "Weekend"],
  ["clinic slot", "slots", "Morning", "Evening"],
  ["museum ticket", "tickets", "Adult", "Student"],
  ["fitness class", "places", "Standard", "Premium"],
  ["revision workshop", "places", "Online", "In-person"],
] as const;

function makeQrRevenueSet(setIndex: number): UCATQuestion[] {
  const [, plural, firstType, secondType] = pick(QR_DOMAINS, setIndex);
  const centres = ["Cardiff", "Leeds", "Norwich", "Exeter"].map(
    (city, index) => `${city} ${pick(["North", "Central", "West", "South"], setIndex + index)}`
  );
  const rows = centres.map((centre, index) => {
    const firstPrice = 4.8 + ((setIndex + index) % 9) * 0.35;
    const secondPrice = firstPrice + 2.1 + (index % 3) * 0.42;
    const firstCount = 18_000 + ((setIndex * 17 + index * 4123) % 92_000);
    const secondCount = 16_500 + ((setIndex * 31 + index * 5291) % 105_000);
    return { centre, firstPrice, secondPrice, firstCount, secondCount };
  });
  const visual: UCATChartVisual = {
    type: "table",
    title: `${plural[0].toUpperCase()}${plural.slice(1)} sold - report ${setIndex + 1}`,
    headers: ["Location", `${firstType} price`, `${firstType} sold`, `${secondType} price`, `${secondType} sold`],
    rows: rows.map((row) => [
      row.centre,
      asMoney(row.firstPrice),
      formatNumber(row.firstCount),
      asMoney(row.secondPrice),
      formatNumber(row.secondCount),
    ]),
  };
  const totalSecondRevenue = rows.reduce((sum, row) => sum + row.secondPrice * row.secondCount, 0);
  const selectedFirstRevenue = rows[0].firstPrice * rows[0].firstCount + rows[1].firstPrice * rows[1].firstCount;
  const selectedSecondRevenue = rows[0].secondPrice * rows[0].secondCount + rows[1].secondPrice * rows[1].secondCount;
  const difference = selectedSecondRevenue - selectedFirstRevenue;
  const totalSold = rows.reduce((sum, row) => sum + row.firstCount + row.secondCount, 0);
  const setId = `hq-qr-revenue-${pad(setIndex)}`;
  const revenueStimulus = `The table shows prices and numbers of ${plural} sold at four locations in report ${setIndex + 1}.`;

  return [
    singleQuestion({
      id: `${setId}-1`,
      section: "qr",
      subtype: "qr-graphs",
      setId,
      tags: ["data-display", "set-based", "easy", "quick"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data",
      stimulus: [revenueStimulus],
      visual,
      question: `How many ${plural} were sold in total?`,
      correctText: formatNumber(totalSold),
      distractors: numericDistractors(totalSold, setIndex),
      explanation: `Add all ${firstType} and ${secondType} sales across the four locations to get ${formatNumber(totalSold)}.`,
      seed: setIndex,
    }),
    singleQuestion({
      id: `${setId}-2`,
      section: "qr",
      subtype: "qr-percentages",
      setId,
      tags: ["data-display", "set-based", "medium", "calculator-heavy"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data",
      stimulus: [revenueStimulus],
      visual,
      question: `What percentage of all sold ${plural} were ${secondType.toLowerCase()} ${plural}?`,
      correctText: formatPercent((rows.reduce((sum, row) => sum + row.secondCount, 0) / totalSold) * 100),
      distractors: [
        formatPercent((rows.reduce((sum, row) => sum + row.firstCount, 0) / totalSold) * 100),
        formatPercent((rows[0].secondCount / totalSold) * 100),
        formatPercent((rows.reduce((sum, row) => sum + row.secondCount, 0) / rows.reduce((sum, row) => sum + row.firstCount, 0)) * 100),
      ],
      explanation:
        `${secondType} share = total ${secondType.toLowerCase()} sold divided by all ${plural} sold, multiplied by 100.`,
      seed: setIndex + 1,
    }),
    singleQuestion({
      id: `${setId}-3`,
      section: "qr",
      subtype: "qr-rates-ratios",
      setId,
      tags: ["data-display", "set-based", "medium", "multi-step"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data",
      stimulus: [revenueStimulus],
      visual,
      question: `What was the ratio of ${firstType.toLowerCase()} ${plural} sold at the first two locations, in simplest form?`,
      correctText: ratio(rows[0].firstCount, rows[1].firstCount),
      distractors: uniqueDistractors(ratio(rows[0].firstCount, rows[1].firstCount), [
        `${rows[0].firstCount}:${rows[1].firstCount}`,
        ratio(rows[1].firstCount, rows[0].firstCount),
        ratio(rows[0].secondCount, rows[1].secondCount),
        ratio(rows[0].firstCount + rows[1].firstCount, rows[1].firstCount),
      ]),
      explanation:
        `Use the first two ${firstType.toLowerCase()} counts and simplify ${rows[0].firstCount}:${rows[1].firstCount}.`,
      seed: setIndex + 2,
    }),
    singleQuestion({
      id: `${setId}-4`,
      section: "qr",
      subtype: "qr-calculator-strategy",
      setId,
      tags: ["data-display", "set-based", "hard", "calculator-heavy", "time-consuming"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data",
      stimulus: [revenueStimulus],
      visual,
      question: `At the first two locations combined, how much more revenue was made from ${secondType.toLowerCase()} ${plural} than ${firstType.toLowerCase()} ${plural}?`,
      correctText: asMoney(difference),
      distractors: [asMoney(Math.abs(difference - totalSecondRevenue * 0.12)), asMoney(selectedFirstRevenue), asMoney(totalSecondRevenue)],
      explanation:
        `${secondType} revenue at the first two locations minus ${firstType.toLowerCase()} revenue at the same locations gives ${asMoney(difference)}.`,
      seed: setIndex + 3,
    }),
  ];
}

function makeQrTrendSet(setIndex: number): UCATQuestion[] {
  const [metricLabel, unitLabel] = pickPair(
    [
      ["daily question attempts", "Attempts"],
      ["minutes of focused revision", "Minutes"],
      ["completed flashcard reviews", "Reviews"],
      ["practice explanations written", "Explanations"],
      ["timed drill questions completed", "Questions"],
      ["checked error-log entries", "Entries"],
      ["calculator drills completed", "Drills"],
      ["reading passages reviewed", "Passages"],
    ] as const,
    setIndex
  );
  const cohort = pick(["learner group", "revision circle", "after-school cohort", "Saturday class", "online study group", "library group"], setIndex * 3);
  const start = 48 + (setIndex % 12) * 5;
  const points = range(5).map((index) => ({
    label: `Week ${index + 1}`,
    value: start + index * (5 + (setIndex % 4)) - (index === 2 ? 4 : 0),
  }));
  const visual: UCATChartVisual = {
    type: "line",
    title: `${sentenceCase(metricLabel)} - ${cohort} ${setIndex + 1}`,
    yLabel: unitLabel,
    points,
    max: 140,
  };
  const total = points.reduce((sum, point) => sum + point.value, 0);
  const increase = points[4].value - points[0].value;
  const largest = Math.max(...points.slice(1).map((point, index) => Math.abs(point.value - points[index].value)));
  const setId = `hq-qr-trend-${pad(setIndex)}`;
  const trendStimulus = `The line chart shows average ${metricLabel} over five weeks for ${cohort} ${setIndex + 1}.`;

  return [
    singleQuestion({
      id: `${setId}-1`,
      section: "qr",
      subtype: "qr-graphs",
      setId,
      tags: ["data-display", "set-based", "easy", "quick"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Chart",
      stimulus: [trendStimulus],
      visual,
      question: "What was the increase from Week 1 to Week 5?",
      correctText: formatNumber(increase),
      distractors: numericDistractors(increase, setIndex),
      explanation: `Week 5 minus Week 1 = ${points[4].value} - ${points[0].value} = ${increase}.`,
      seed: setIndex,
    }),
    singleQuestion({
      id: `${setId}-2`,
      section: "qr",
      subtype: "qr-averages",
      setId,
      tags: ["data-display", "set-based", "medium"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Chart",
      stimulus: [trendStimulus],
      visual,
      question: "What was the mean of the five weekly values?",
      correctText: formatNumber(total / 5, 1),
      distractors: [formatNumber(total / 4, 1), formatNumber((points[0].value + points[4].value) / 2, 1), formatNumber((total - points[2].value) / 4, 1)],
      explanation: `The five values total ${total}; ${total} / 5 = ${formatNumber(total / 5, 1)}.`,
      seed: setIndex + 1,
    }),
    singleQuestion({
      id: `${setId}-3`,
      section: "qr",
      subtype: "qr-estimation",
      setId,
      tags: ["data-display", "set-based", "medium", "multi-step"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Chart",
      stimulus: [trendStimulus],
      visual,
      question: "What was the largest week-to-week change?",
      correctText: formatNumber(largest),
      distractors: numericDistractors(largest, setIndex + 2),
      explanation: `Compare consecutive differences; the largest absolute change is ${largest}.`,
      seed: setIndex + 2,
    }),
    singleQuestion({
      id: `${setId}-4`,
      section: "qr",
      subtype: "qr-percentages",
      setId,
      tags: ["data-display", "set-based", "hard", "calculator-heavy"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Chart",
      stimulus: [trendStimulus],
      visual,
      question: "What was the percentage increase from Week 1 to Week 5?",
      correctText: formatPercent((increase / points[0].value) * 100),
      distractors: [formatPercent((points[4].value / points[0].value) * 100), formatPercent((increase / points[4].value) * 100), formatPercent((largest / points[0].value) * 100)],
      explanation: `Increase = ${increase}; percentage increase = ${increase} / ${points[0].value} x 100.`,
      seed: setIndex + 3,
    }),
  ];
}

function makeQrRateSet(setIndex: number): UCATQuestion[] {
  const journey = pick(
    [
      ["courier", "clinic", "delivery route"],
      ["technician", "training centre", "maintenance visit"],
      ["volunteer", "food hub", "collection route"],
      ["student", "library branch", "study-space trip"],
      ["driver", "sports hall", "equipment drop-off"],
      ["nurse", "community room", "outreach visit"],
    ] as const,
    setIndex
  );
  const distance = 12 + (setIndex % 16) * 2;
  const outwardSpeed = 10 + (setIndex % 6) * 3;
  const returnSpeed = outwardSpeed + 4 + (setIndex % 4);
  const waitMinutes = 8 + (setIndex % 7) * 3;
  const outward = (distance / outwardSpeed) * 60;
  const returning = (distance / returnSpeed) * 60;
  const total = outward + returning + waitMinutes;
  const setId = `hq-qr-rate-${pad(setIndex)}`;
  const stem = `For ${journey[2]} ${setIndex + 1}, a ${journey[0]} travels ${distance} km to a ${journey[1]} at ${outwardSpeed} km/h, waits ${waitMinutes} minutes, then returns by the same route at ${returnSpeed} km/h.`;

  return [
    singleQuestion({
      id: `${setId}-1`,
      section: "qr",
      subtype: "qr-rates-ratios",
      setId,
      tags: ["text-stem", "set-based", "easy"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stem",
      stimulus: [stem],
      question: "How long does the outward journey take?",
      correctText: `${formatNumber(outward)} minutes`,
      distractors: [`${formatNumber(returning)} minutes`, `${formatNumber(outward + waitMinutes)} minutes`, `${formatNumber(distance + outwardSpeed)} minutes`],
      explanation: `Time = distance / speed = ${distance} / ${outwardSpeed} hours = ${formatNumber(outward)} minutes.`,
      seed: setIndex,
    }),
    singleQuestion({
      id: `${setId}-2`,
      section: "qr",
      subtype: "qr-averages",
      setId,
      tags: ["text-stem", "set-based", "medium", "multi-step"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stem",
      stimulus: [stem],
      question: "How long does the full trip take, including the wait?",
      correctText: `${formatNumber(total)} minutes`,
      distractors: [`${formatNumber(outward + returning)} minutes`, `${formatNumber(total + waitMinutes)} minutes`, `${formatNumber(outward + waitMinutes)} minutes`],
      explanation: `Add outward travel, return travel and waiting time to get ${formatNumber(total)} minutes.`,
      seed: setIndex + 1,
    }),
    singleQuestion({
      id: `${setId}-3`,
      section: "qr",
      subtype: "qr-rates-ratios",
      setId,
      tags: ["text-stem", "set-based", "hard", "multi-step"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stem",
      stimulus: [stem],
      question: "What is the average travelling speed, excluding the wait?",
      correctText: `${formatNumber((distance * 2) / ((outward + returning) / 60), 1)} km/h`,
      distractors: [`${formatNumber((outwardSpeed + returnSpeed) / 2, 1)} km/h`, `${formatNumber((distance * 2) / (total / 60), 1)} km/h`, `${formatNumber(returnSpeed - outwardSpeed, 1)} km/h`],
      explanation: "Average travelling speed uses total distance divided by travelling time, excluding the waiting time.",
      seed: setIndex + 2,
    }),
    singleQuestion({
      id: `${setId}-4`,
      section: "qr",
      subtype: "qr-units-geometry",
      setId,
      tags: ["text-stem", "set-based", "medium"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stem",
      stimulus: [stem],
      question: `What total distance does the ${journey[0]} travel?`,
      correctText: `${distance * 2} km`,
      distractors: [`${distance} km`, `${distance + returnSpeed} km`, `${distance * 2 + outwardSpeed} km`],
      explanation: `The ${journey[0]} travels the same ${distance} km route twice, so total distance is ${distance * 2} km.`,
      seed: setIndex + 3,
    }),
  ];
}

function makeQrGeometrySet(setIndex: number): UCATQuestion[] {
  const space = pick(
    [
      ["storage room", "paint the four walls once", "Paint"],
      ["training room", "cover the four walls with acoustic panels", "Panels"],
      ["display bay", "paint the four sides once", "Paint"],
      ["garden shed", "treat the four outside walls once", "Wood treatment"],
      ["equipment room", "seal the four walls once", "Sealant"],
      ["archive room", "coat the four walls once", "Protective coating"],
    ] as const,
    setIndex
  );
  const length = 18 + (setIndex % 10) * 3;
  const width = 8 + (setIndex % 8) * 2;
  const height = 3 + (setIndex % 4);
  const area = length * width;
  const volume = area * height;
  const scale = 2 + (setIndex % 5);
  const setId = `hq-qr-geometry-${pad(setIndex)}`;
  const stem = `The ${space[0]} in plan ${setIndex + 1} is ${length} m long, ${width} m wide and ${height} m high. A plan uses a scale of 1 cm to ${scale} m.`;

  return [
    singleQuestion({
      id: `${setId}-1`,
      section: "qr",
      subtype: "qr-units-geometry",
      setId,
      tags: ["text-stem", "set-based", "easy", "quick"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stem",
      stimulus: [stem],
      question: "What is the floor area of the room?",
      correctText: `${formatNumber(area)} m2`,
      distractors: [`${formatNumber(volume)} m2`, `${formatNumber(length + width)} m2`, `${formatNumber(2 * (length + width))} m2`],
      explanation: `Floor area = length x width = ${length} x ${width} = ${area} m2.`,
      seed: setIndex,
    }),
    singleQuestion({
      id: `${setId}-2`,
      section: "qr",
      subtype: "qr-units-geometry",
      setId,
      tags: ["text-stem", "set-based", "medium"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stem",
      stimulus: [stem],
      question: "What is the volume of the room?",
      correctText: `${formatNumber(volume)} m3`,
      distractors: [`${formatNumber(area)} m3`, `${formatNumber(volume + area)} m3`, `${formatNumber(length * height)} m3`],
      explanation: `Volume = length x width x height = ${length} x ${width} x ${height} = ${volume} m3.`,
      seed: setIndex + 1,
    }),
    singleQuestion({
      id: `${setId}-3`,
      section: "qr",
      subtype: "qr-rates-ratios",
      setId,
      tags: ["text-stem", "set-based", "medium", "multi-step"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stem",
      stimulus: [stem],
      question: "How long is the room on the plan?",
      correctText: `${formatNumber(length / scale, 1)} cm`,
      distractors: [`${formatNumber(width / scale, 1)} cm`, `${formatNumber(length * scale, 1)} cm`, `${formatNumber((length + width) / scale, 1)} cm`],
      explanation: `Plan length = actual length divided by scale = ${length} / ${scale} = ${formatNumber(length / scale, 1)} cm.`,
      seed: setIndex + 2,
    }),
    singleQuestion({
      id: `${setId}-4`,
      section: "qr",
      subtype: "qr-calculator-strategy",
      setId,
      tags: ["text-stem", "set-based", "hard", "multi-step", "time-consuming"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stem",
      stimulus: [stem],
      question: `${space[2]} covers 9 m2 per litre. How many whole litres are needed to ${space[1]}?`,
      correctText: `${Math.ceil((2 * (length + width) * height) / 9)} litres`,
      distractors: [`${Math.ceil(area / 9)} litres`, `${Math.floor((2 * (length + width) * height) / 9)} litres`, `${Math.ceil(volume / 9)} litres`],
      explanation: `Wall area = 2 x (${length} + ${width}) x ${height}. Divide by 9 and round up because whole litres are needed.`,
      seed: setIndex + 3,
    }),
  ];
}

function makeQrFinanceSet(setIndex: number): UCATQuestion[] {
  const product = pick(
    [
      ["revision packs", "pack"],
      ["lab notebooks", "notebook"],
      ["clinic folders", "folder"],
      ["workshop tickets", "ticket"],
      ["study guides", "guide"],
      ["calculator cases", "case"],
    ] as const,
    setIndex
  );
  const cost = 7.5 + (setIndex % 12) * 0.85;
  const price = cost * (1.35 + (setIndex % 5) * 0.04);
  const units = 90 + (setIndex % 12) * 18;
  const discount = 10 + (setIndex % 4) * 5;
  const discounted = price * (1 - discount / 100);
  const revenue = price * units;
  const profit = (price - cost) * units;
  const setId = `hq-qr-finance-${pad(setIndex)}`;
  const stem = `Trading week ${setIndex + 1}: a shop buys ${product[0]} for ${asMoney(cost)} each and sells them for ${asMoney(price)} each. It sells ${units} ${product[0]} before a ${discount}% promotion.`;

  return [
    singleQuestion({
      id: `${setId}-1`,
      section: "qr",
      subtype: "qr-percentages",
      setId,
      tags: ["text-stem", "set-based", "easy"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stem",
      stimulus: [stem],
      question: `What is the promotional selling price per ${product[1]}?`,
      correctText: asMoney(discounted),
      distractors: [asMoney(price * (discount / 100)), asMoney(price * (1 + discount / 100)), asMoney(cost)],
      explanation: `A ${discount}% discount leaves ${100 - discount}% of the price.`,
      seed: setIndex,
    }),
    singleQuestion({
      id: `${setId}-2`,
      section: "qr",
      subtype: "qr-calculator-strategy",
      setId,
      tags: ["text-stem", "set-based", "medium", "calculator-heavy"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stem",
      stimulus: [stem],
      question: "What is the total revenue before the promotion?",
      correctText: asMoney(revenue),
      distractors: [asMoney(cost * units), asMoney(profit), asMoney(discounted * units)],
      explanation: `Revenue before promotion = selling price x units = ${asMoney(price)} x ${units}.`,
      seed: setIndex + 1,
    }),
    singleQuestion({
      id: `${setId}-3`,
      section: "qr",
      subtype: "qr-rates-ratios",
      setId,
      tags: ["text-stem", "set-based", "medium"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stem",
      stimulus: [stem],
      question: "What is the profit before the promotion?",
      correctText: asMoney(profit),
      distractors: [asMoney(revenue), asMoney(price - cost), asMoney(cost * units)],
      explanation: `Profit per ${product[1]} is selling price minus cost. Multiply by ${units} ${product[0]}.`,
      seed: setIndex + 2,
    }),
    singleQuestion({
      id: `${setId}-4`,
      section: "qr",
      subtype: "qr-estimation",
      setId,
      tags: ["text-stem", "set-based", "hard", "time-consuming"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stem",
      stimulus: [stem],
      question: `After the discount, approximately what is the percentage profit margin per ${product[1]}?`,
      correctText: formatPercent(((discounted - cost) / discounted) * 100),
      distractors: [formatPercent(((price - cost) / price) * 100), formatPercent(((discounted - cost) / cost) * 100), formatPercent(discount)],
      explanation: `Margin is profit divided by selling price after discount for each ${product[1]}, multiplied by 100.`,
      seed: setIndex + 3,
    }),
  ];
}

function minutesToClock(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function makeQrExpenseSet(setIndex: number): UCATQuestion[] {
  const planContext = pick(["household plan", "student budget", "training bursary", "club budget", "placement allowance", "travel grant"], setIndex);
  const income = 2_450 + (setIndex % 32) * 125;
  const labels = ["Rent", "Food", "Travel", "Training", "Savings", "Other"];
  const rent = 30 + (setIndex % 7);
  const food = 14 + ((setIndex * 2) % 7);
  const travel = 7 + ((setIndex * 3) % 5);
  const training = 9 + ((setIndex * 5) % 6);
  const savings = 6 + ((setIndex * 7) % 8);
  const other = 100 - rent - food - travel - training - savings;
  const values = [rent, food, travel, training, savings, other];
  const savingAmount = income * (savings / 100);
  const leftAfterDeposit = savingAmount * 0.25;
  const foodTravelAmount = income * ((food + travel) / 100);
  const rentTrainingDifference = income * ((rent - training) / 100);
  const setId = `hq-qr-expense-${pad(setIndex)}`;
  const stimulus = `The chart shows how monthly income of ${asMoney(income)} is allocated in ${planContext} ${setIndex + 1}.`;
  const visual: UCATChartVisual = {
    type: "bar",
    title: `Monthly allocation - ${planContext} ${setIndex + 1}`,
    yLabel: "Percentage",
    max: 40,
    categories: labels.map((label, index) => ({ label, value: values[index] })),
  };

  return [
    singleQuestion({
      id: `${setId}-1`,
      section: "qr",
      subtype: "qr-percentages",
      setId,
      tags: ["data-display", "set-based", "easy", "quick"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Chart",
      stimulus: [stimulus],
      visual,
      question: pick([
        "How much money is allocated to savings?",
        "What is the monthly savings amount?",
        "How many pounds are assigned to the savings category?",
      ] as const, setIndex),
      correctText: asMoney(savingAmount),
      distractors: [asMoney(income * (rent / 100)), asMoney(income * (other / 100)), asMoney(savingAmount + 25)],
      explanation: `Savings are ${savings}% of ${asMoney(income)}.`,
      seed: setIndex,
    }),
    singleQuestion({
      id: `${setId}-2`,
      section: "qr",
      subtype: "qr-calculator-strategy",
      setId,
      tags: ["data-display", "set-based", "medium", "calculator-heavy"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Chart",
      stimulus: [stimulus],
      visual,
      question: pick([
        "If 75% of the savings amount is deposited, how much savings money is left outside the deposit?",
        "After depositing three quarters of the savings amount, how much remains undeclared for deposit?",
        "What is one quarter of the savings allocation?",
      ] as const, setIndex),
      correctText: asMoney(leftAfterDeposit),
      distractors: [asMoney(savingAmount * 0.75), asMoney(income * 0.25), asMoney(leftAfterDeposit + income * 0.01)],
      explanation: `The amount left is 25% of the savings allocation: ${asMoney(savingAmount)} x 0.25.`,
      seed: setIndex + 1,
    }),
    singleQuestion({
      id: `${setId}-3`,
      section: "qr",
      subtype: "qr-calculator-strategy",
      setId,
      tags: ["data-display", "set-based", "medium", "multi-step"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Chart",
      stimulus: [stimulus],
      visual,
      question: pick([
        "How much is spent on food and travel combined?",
        "What is the combined monthly amount for food and travel?",
        "How many pounds are allocated to the two transport-and-food categories together?",
      ] as const, setIndex),
      correctText: asMoney(foodTravelAmount),
      distractors: [asMoney(income * (food / 100)), asMoney(income * (travel / 100)), asMoney(foodTravelAmount + 50)],
      explanation: `Food and travel total ${food + travel}% of income.`,
      seed: setIndex + 2,
    }),
    singleQuestion({
      id: `${setId}-4`,
      section: "qr",
      subtype: "qr-percentages",
      setId,
      tags: ["data-display", "set-based", "hard", "calculator-heavy"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Chart",
      stimulus: [stimulus],
      visual,
      question: pick([
        "How much more is allocated to rent than to training?",
        "What is the difference between the rent and training amounts?",
        "By how many pounds does rent exceed training?",
      ] as const, setIndex),
      correctText: asMoney(rentTrainingDifference),
      distractors: [asMoney(income * ((rent + training) / 100)), asMoney(income * (training / 100)), asMoney(rentTrainingDifference + 35)],
      explanation: `The percentage difference is ${rent}% - ${training}% = ${rent - training}%.`,
      seed: setIndex + 3,
    }),
  ];
}

function makeQrTimetableSet(setIndex: number): UCATQuestion[] {
  const serviceType = pick(["shuttle", "tram", "minibus", "ferry", "campus bus", "park-and-ride"], setIndex);
  const baseDepart = 420 + (setIndex % 8) * 17;
  const rows = ["Alder", "Bramley", "Crown", "Denton"].map((route, index) => {
    const depart = baseDepart + index * (18 + (setIndex % 5));
    const duration = 42 + ((setIndex * 3 + index * 7) % 38);
    const fare = 2.4 + ((setIndex + index) % 8) * 0.45;
    return { route, depart, duration, fare };
  });
  const selected = rows[setIndex % rows.length];
  const comparison = rows[(setIndex + 2) % rows.length];
  const latestArrival = rows.reduce((latest, row) =>
    row.depart + row.duration > latest.depart + latest.duration ? row : latest
  );
  const setId = `hq-qr-timetable-${pad(setIndex)}`;
  const stimulus = `The table shows four ${serviceType} services in timetable ${setIndex + 1}.`;
  const visual: UCATChartVisual = {
    type: "table",
    title: `${sentenceCase(serviceType)} timetable ${setIndex + 1}`,
    headers: ["Service", "Departure", "Duration", "Single fare"],
    rows: rows.map((row) => [row.route, minutesToClock(row.depart), `${row.duration} min`, asMoney(row.fare)]),
  };

  return [
    singleQuestion({
      id: `${setId}-1`,
      section: "qr",
      subtype: "qr-units-geometry",
      setId,
      tags: ["data-display", "set-based", "easy", "quick"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Timetable",
      stimulus: [stimulus],
      visual,
      question: `At what time does the ${selected.route} service arrive?`,
      correctText: minutesToClock(selected.depart + selected.duration),
      distractors: [minutesToClock(selected.depart), minutesToClock(selected.depart + selected.duration + 10), minutesToClock(selected.depart + comparison.duration)],
      explanation: `Add ${selected.duration} minutes to ${minutesToClock(selected.depart)}.`,
      seed: setIndex,
    }),
    singleQuestion({
      id: `${setId}-2`,
      section: "qr",
      subtype: "qr-rates-ratios",
      setId,
      tags: ["data-display", "set-based", "medium"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Timetable",
      stimulus: [stimulus],
      visual,
      question: "Which service arrives latest?",
      correctText: latestArrival.route,
      distractors: rows.map((row) => row.route).filter((route) => route !== latestArrival.route),
      explanation: "Compare departure time plus duration for each service.",
      seed: setIndex + 1,
    }),
    singleQuestion({
      id: `${setId}-3`,
      section: "qr",
      subtype: "qr-calculator-strategy",
      setId,
      tags: ["data-display", "set-based", "medium", "multi-step"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Timetable",
      stimulus: [stimulus],
      visual,
      question: `What is the total fare for two ${selected.route} tickets and one ${comparison.route} ticket?`,
      correctText: asMoney(selected.fare * 2 + comparison.fare),
      distractors: [asMoney(selected.fare + comparison.fare), asMoney(selected.fare * 2), asMoney((selected.fare + comparison.fare) * 2)],
      explanation: `Calculate 2 x ${asMoney(selected.fare)} plus ${asMoney(comparison.fare)}.`,
      seed: setIndex + 2,
    }),
    singleQuestion({
      id: `${setId}-4`,
      section: "qr",
      subtype: "qr-estimation",
      setId,
      tags: ["data-display", "set-based", "hard"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Timetable",
      stimulus: [stimulus],
      visual,
      question: `How much longer is the ${comparison.route} journey than the ${selected.route} journey?`,
      correctText: `${Math.abs(comparison.duration - selected.duration)} min`,
      distractors: [`${comparison.duration + selected.duration} min`, `${Math.abs(comparison.depart - selected.depart)} min`, `${Math.abs(comparison.duration - selected.duration) + 5} min`],
      explanation: "Compare the journey durations, not the departure times.",
      seed: setIndex + 3,
    }),
  ];
}

function makeQrDosageSet(setIndex: number): UCATQuestion[] {
  const longCycle = Math.floor(setIndex / 780);
  const medicine = pick(["Avenol", "Brixam", "Caldrin", "Dovamil", "Elistat", "Fendrox"], setIndex + longCycle);
  const dosePerKg = 6 + ((setIndex + longCycle) % 5);
  const concentration = 20 + ((setIndex + longCycle) % 6) * 5;
  const bottleVolume = 100 + ((setIndex + longCycle) % 4) * 25;
  const rows = ["J", "K", "L", "M"].map((patient, index) => ({
    patient,
    weight: 38 + ((setIndex * 7 + index * 11 + longCycle * 5) % 48),
    doses: index % 2 === 0 ? 2 : 3,
  }));
  const selected = rows[setIndex % rows.length];
  const selectedDailyMg = selected.weight * dosePerKg;
  const selectedDoseMl = selectedDailyMg / selected.doses / concentration;
  const third = rows[(setIndex + 2) % rows.length];
  const thirdDailyMl = (third.weight * dosePerKg) / concentration;
  const totalSevenDayMl = rows.reduce((sum, row) => sum + ((row.weight * dosePerKg) / concentration) * 7, 0);
  const setId = `hq-qr-dosage-${pad(setIndex)}`;
  const stimulus = `${medicine} is prescribed at ${dosePerKg} mg per kg per day. The liquid contains ${concentration} mg per mL and bottles contain ${bottleVolume} mL.`;
  const visual: UCATChartVisual = {
    type: "table",
    title: `Patient weights - clinic ${setIndex + 1}`,
    headers: ["Patient", "Weight", "Daily doses"],
    rows: rows.map((row) => [row.patient, `${row.weight} kg`, String(row.doses)]),
  };

  return [
    singleQuestion({
      id: `${setId}-1`,
      section: "qr",
      subtype: "qr-rates-ratios",
      setId,
      tags: ["data-display", "set-based", "easy"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data",
      stimulus: [stimulus],
      visual,
      question: `What is Patient ${selected.patient}'s total daily dose in mg?`,
      correctText: `${formatNumber(selectedDailyMg)} mg`,
      distractors: [`${formatNumber(selectedDailyMg / selected.doses)} mg`, `${formatNumber(selected.weight * concentration)} mg`, `${formatNumber(selectedDailyMg + dosePerKg)} mg`],
      explanation: `Daily dose = ${selected.weight} x ${dosePerKg} = ${selectedDailyMg} mg.`,
      seed: setIndex,
    }),
    singleQuestion({
      id: `${setId}-2`,
      section: "qr",
      subtype: "qr-units-geometry",
      setId,
      tags: ["data-display", "set-based", "medium", "multi-step"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data",
      stimulus: [stimulus],
      visual,
      question: `How many mL are needed for each of Patient ${selected.patient}'s doses?`,
      correctText: `${formatNumber(selectedDoseMl, 1)} mL`,
      distractors: [`${formatNumber(selectedDailyMg / concentration, 1)} mL`, `${formatNumber(selectedDoseMl * 2, 1)} mL`, `${formatNumber(selectedDoseMl + 1, 1)} mL`],
      explanation: "Find the daily mL dose, then divide by the number of daily doses.",
      seed: setIndex + 1,
    }),
    singleQuestion({
      id: `${setId}-3`,
      section: "qr",
      subtype: "qr-calculator-strategy",
      setId,
      tags: ["data-display", "set-based", "medium", "calculator-heavy"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data",
      stimulus: [stimulus],
      visual,
      question: `How many complete days will one bottle last for Patient ${third.patient}?`,
      correctText: `${Math.floor(bottleVolume / thirdDailyMl)} days`,
      distractors: [`${Math.ceil(bottleVolume / thirdDailyMl)} days`, `${Math.floor(bottleVolume / thirdDailyMl) + 2} days`, `${Math.floor(thirdDailyMl)} days`],
      explanation: "Divide bottle volume by that patient's daily volume and count complete days only.",
      seed: setIndex + 2,
    }),
    singleQuestion({
      id: `${setId}-4`,
      section: "qr",
      subtype: "qr-calculator-strategy",
      setId,
      tags: ["data-display", "set-based", "hard", "calculator-heavy", "time-consuming"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data",
      stimulus: [stimulus],
      visual,
      question: "How many full bottles are needed for all four patients for 7 days?",
      correctText: `${Math.ceil(totalSevenDayMl / bottleVolume)} bottles`,
      distractors: [`${Math.floor(totalSevenDayMl / bottleVolume)} bottles`, `${Math.ceil(totalSevenDayMl / bottleVolume) + 1} bottles`, `${Math.ceil(totalSevenDayMl / bottleVolume) + 2} bottles`],
      explanation: "Calculate each patient's 7-day volume, total it, divide by bottle size and round up.",
      seed: setIndex + 3,
    }),
  ];
}

function makeQrPlanSet(setIndex: number): UCATQuestion[] {
  const unitContext = pick(["printer credits", "practice questions", "booking minutes", "storage units", "training tokens", "revision downloads"], setIndex);
  const need = 120 + (setIndex % 18) * 15;
  const extra = 0.18 + (setIndex % 5) * 0.04;
  const rows = [
    { plan: "Lite", included: 80 + (setIndex % 5) * 10, fee: 11 + (setIndex % 4), joining: 8 },
    { plan: "Core", included: 130 + (setIndex % 6) * 12, fee: 17 + (setIndex % 5), joining: 12 },
    { plan: "Plus", included: 190 + (setIndex % 7) * 14, fee: 24 + (setIndex % 6), joining: 16 },
    { plan: "Max", included: 260 + (setIndex % 8) * 15, fee: 32 + (setIndex % 7), joining: 20 },
  ];
  const monthlyCost = (row: (typeof rows)[number]) => row.fee + Math.max(0, need - row.included) * extra;
  const cheapest = rows.reduce((best, row) => (monthlyCost(row) < monthlyCost(best) ? row : best));
  const annual = rows[2].fee * 12 + rows[2].joining;
  const raisedCosts = rows.map((row) => ({
    row,
    cost: row.fee * 1.08 + Math.max(0, need - row.included) * extra * 0.75,
  }));
  const raisedCheapest = raisedCosts.reduce((best, item) => (item.cost < best.cost ? item : best));
  const setId = `hq-qr-plan-${pad(setIndex)}`;
  const stimulus = `A student needs ${need} ${unitContext} each month. Extra ${unitContext} cost ${asMoney(extra)} each.`;
  const visual: UCATChartVisual = {
    type: "table",
    title: `Monthly plans ${setIndex + 1}`,
    headers: ["Plan", `Included ${unitContext}`, "Monthly fee", "Joining fee"],
    rows: rows.map((row) => [row.plan, String(row.included), asMoney(row.fee), asMoney(row.joining)]),
  };

  return [
    singleQuestion({
      id: `${setId}-1`,
      section: "qr",
      subtype: "qr-rates-ratios",
      setId,
      tags: ["data-display", "set-based", "easy"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Plans",
      stimulus: [stimulus],
      visual,
      question: `What is the monthly cost per included ${unitContext.slice(0, -1)} for the ${rows[1].plan} plan?`,
      correctText: asMoney(rows[1].fee / rows[1].included),
      distractors: [asMoney(rows[1].fee), asMoney(rows[1].included / rows[1].fee), asMoney((rows[1].fee + rows[1].joining) / rows[1].included)],
      explanation: "Divide the monthly fee by the included units.",
      seed: setIndex,
    }),
    singleQuestion({
      id: `${setId}-2`,
      section: "qr",
      subtype: "qr-calculator-strategy",
      setId,
      tags: ["data-display", "set-based", "medium", "multi-step"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Plans",
      stimulus: [stimulus],
      visual,
      question: `Which plan gives the lowest monthly cost for the required ${unitContext}?`,
      correctText: cheapest.plan,
      distractors: rows.map((row) => row.plan).filter((plan) => plan !== cheapest.plan),
      explanation: "Compare monthly fee plus any extra unit cost for each plan.",
      seed: setIndex + 1,
    }),
    singleQuestion({
      id: `${setId}-3`,
      section: "qr",
      subtype: "qr-percentages",
      setId,
      tags: ["data-display", "set-based", "medium", "calculator-heavy"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Plans",
      stimulus: [stimulus],
      visual,
      question: `What is the annual cost of the ${rows[2].plan} plan including its joining fee?`,
      correctText: asMoney(annual),
      distractors: [asMoney(rows[2].fee * 12), asMoney(annual + rows[2].fee), asMoney(annual - rows[2].joining)],
      explanation: "Annual cost is 12 monthly payments plus the joining fee.",
      seed: setIndex + 2,
    }),
    singleQuestion({
      id: `${setId}-4`,
      section: "qr",
      subtype: "qr-percentages",
      setId,
      tags: ["data-display", "set-based", "hard", "calculator-heavy"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Plans",
      stimulus: [stimulus],
      visual,
      question: `Monthly fees rise by 8%, while extra ${unitContext.slice(0, -1)} charges fall by 25%. What is the new cheapest monthly cost?`,
      correctText: asMoney(raisedCheapest.cost),
      distractors: [asMoney(monthlyCost(cheapest)), asMoney(raisedCheapest.cost + extra), asMoney(Math.max(0, raisedCheapest.cost - extra))],
      explanation: "Apply both price changes to each plan and compare the resulting monthly costs.",
      seed: setIndex + 3,
    }),
  ];
}

function makeQrWorkRateSet(setIndex: number): UCATQuestion[] {
  const projectType = pick(["mural", "stocktake", "mailing project", "garden clearance", "archive scan", "equipment check"], setIndex);
  const target = 45 + (setIndex % 8) * 5;
  const rows = ["A", "B", "C", "D"].map((worker, index) => ({
    worker,
    days: 3 + ((setIndex + index) % 5),
    completed: 12 + ((setIndex * 3 + index * 8) % 24),
  }));
  const selected = rows[setIndex % rows.length];
  const partner = rows[(setIndex + 1) % rows.length];
  const finisher = rows[(setIndex + 2) % rows.length];
  const selectedRate = selected.completed / selected.days;
  const partnerRate = partner.completed / partner.days;
  const collaborationDays = 2 + (setIndex % 2);
  const combined = (selectedRate + partnerRate) * collaborationDays;
  const remaining = Math.max(0, 100 - combined);
  const finisherRate = finisher.completed / finisher.days;
  const setId = `hq-qr-workrate-${pad(setIndex)}`;
  const stimulus = `The table shows how much of ${indefiniteArticle(projectType)} ${projectType} each worker completed during a trial period. Assume each worker keeps the same daily rate.`;
  const visual: UCATChartVisual = {
    type: "table",
    title: `Project work rates ${setIndex + 1}`,
    headers: ["Worker", "Days worked", "Project completed"],
    rows: rows.map((row) => [row.worker, String(row.days), `${row.completed}%`]),
  };

  return [
    singleQuestion({
      id: `${setId}-1`,
      section: "qr",
      subtype: "qr-rates-ratios",
      setId,
      tags: ["data-display", "set-based", "easy"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data",
      stimulus: [stimulus],
      visual,
      question: `What percentage of the project does Worker ${selected.worker} complete per day?`,
      correctText: `${formatNumber(selectedRate, 1)}%`,
      distractors: [`${selected.completed}%`, `${formatNumber(selectedRate + 1, 1)}%`, `${formatNumber(selectedRate * selected.days, 1)}%`],
      explanation: "Divide the percentage completed by the number of days worked.",
      seed: setIndex,
    }),
    singleQuestion({
      id: `${setId}-2`,
      section: "qr",
      subtype: "qr-rates-ratios",
      setId,
      tags: ["data-display", "set-based", "medium"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data",
      stimulus: [stimulus],
      visual,
      question: `Workers ${selected.worker} and ${partner.worker} work together for ${collaborationDays} days. What percentage do they complete?`,
      correctText: `${formatNumber(combined, 1)}%`,
      distractors: [`${formatNumber(combined / 2, 1)}%`, `${formatNumber(selected.completed + partner.completed, 1)}%`, `${formatNumber(combined + 5, 1)}%`],
      explanation: `Add their daily rates and multiply by ${collaborationDays}.`,
      seed: setIndex + 1,
    }),
    singleQuestion({
      id: `${setId}-3`,
      section: "qr",
      subtype: "qr-calculator-strategy",
      setId,
      tags: ["data-display", "set-based", "medium", "calculator-heavy"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data",
      stimulus: [stimulus],
      visual,
      question: `After Workers ${selected.worker} and ${partner.worker} have worked together for ${collaborationDays} days, how many more days would Worker ${finisher.worker} take to finish the project?`,
      correctText: `${formatNumber(remaining / finisherRate, 1)} days`,
      distractors: [`${formatNumber(remaining, 1)} days`, `${formatNumber(remaining / finisherRate + 2, 1)} days`, `${formatNumber(Math.max(0, remaining / finisherRate - 2), 1)} days`],
      explanation: "First subtract the joint work already completed, then divide the remaining percentage by the worker's daily rate.",
      seed: setIndex + 2,
    }),
    singleQuestion({
      id: `${setId}-4`,
      section: "qr",
      subtype: "qr-estimation",
      setId,
      tags: ["data-display", "set-based", "hard"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data",
      stimulus: [stimulus],
      visual,
      question: `How many days would Worker ${rows[3].worker} take to complete ${target}% at the same rate?`,
      correctText: `${formatNumber(target / (rows[3].completed / rows[3].days), 1)} days`,
      distractors: [`${formatNumber(target / rows[3].completed, 1)} days`, `${formatNumber(target / (rows[3].completed / rows[3].days) + 3, 1)} days`, `${formatNumber(Math.max(0, target / (rows[3].completed / rows[3].days) - 3), 1)} days`],
      explanation: "Divide the target percentage by Worker D's daily completion rate.",
      seed: setIndex + 3,
    }),
  ];
}

function makeQrRecipeSet(setIndex: number): UCATQuestion[] {
  const dish = pick(["soup", "flatbread", "pasta bake", "bean stew", "rice salad", "vegetable curry"], setIndex);
  const baseServings = 4 + (setIndex % 4) * 2;
  const targetServings = baseServings + 6 + (setIndex % 5) * 2;
  const flour = 180 + (setIndex % 7) * 20;
  const oil = 40 + (setIndex % 5) * 10;
  const spice = 12 + (setIndex % 4) * 3;
  const packFlour = 500;
  const flourPackCost = 1.2 + (setIndex % 5) * 0.15;
  const scale = targetServings / baseServings;
  const setId = `hq-qr-recipe-${pad(setIndex)}`;
  const stimulus = `A recipe serves ${baseServings} people. It is scaled for ${targetServings} people in batch ${setIndex + 1}.`;
  const visual: UCATChartVisual = {
    type: "table",
    title: `Recipe quantities ${setIndex + 1}`,
    headers: ["Ingredient", "Amount for base recipe", "Pack size/cost"],
    rows: [
      ["Flour", `${flour} g`, `${packFlour} g for ${asMoney(flourPackCost)}`],
      ["Oil", `${oil} mL`, "250 mL bottle"],
      ["Spice", `${spice} g`, "50 g jar"],
    ],
  };
  const scaledFlour = flour * scale;
  const flourPacks = Math.ceil(scaledFlour / packFlour);

  return [
    singleQuestion({
      id: `${setId}-1`,
      section: "qr",
      subtype: "qr-rates-ratios",
      setId,
      tags: ["data-display", "set-based", "easy"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Recipe",
      stimulus: [`A ${dish} recipe is being prepared. ${stimulus}`],
      visual,
      question: "How much flour is needed for the scaled recipe?",
      correctText: `${formatNumber(scaledFlour)} g`,
      distractors: [`${formatNumber(flour + targetServings)} g`, `${formatNumber(flour * baseServings)} g`, `${formatNumber(scaledFlour + 50)} g`],
      explanation: `Scale factor = ${targetServings}/${baseServings}. Multiply the base flour by this factor.`,
      seed: setIndex,
    }),
    singleQuestion({
      id: `${setId}-2`,
      section: "qr",
      subtype: "qr-calculator-strategy",
      setId,
      tags: ["data-display", "set-based", "medium", "multi-step"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Recipe",
      stimulus: [`A ${dish} recipe is being prepared. ${stimulus}`],
      visual,
      question: "How many whole flour packs must be bought?",
      correctText: `${flourPacks} packs`,
      distractors: [`${Math.floor(scaledFlour / packFlour)} packs`, `${flourPacks + 1} packs`, `${Math.ceil(flour / packFlour)} packs`],
      explanation: "Divide required flour by pack size and round up.",
      seed: setIndex + 1,
    }),
    singleQuestion({
      id: `${setId}-3`,
      section: "qr",
      subtype: "qr-units-geometry",
      setId,
      tags: ["data-display", "set-based", "medium"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Recipe",
      stimulus: [`A ${dish} recipe is being prepared. ${stimulus}`],
      visual,
      question: "How much oil is needed for the scaled recipe?",
      correctText: `${formatNumber(oil * scale)} mL`,
      distractors: [`${formatNumber(oil + targetServings)} mL`, `${formatNumber(oil * baseServings)} mL`, `${formatNumber(oil * scale + 25)} mL`],
      explanation: "Multiply the base oil amount by the same serving scale factor.",
      seed: setIndex + 2,
    }),
    singleQuestion({
      id: `${setId}-4`,
      section: "qr",
      subtype: "qr-percentages",
      setId,
      tags: ["data-display", "set-based", "hard", "calculator-heavy"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Recipe",
      stimulus: [`A ${dish} recipe is being prepared. ${stimulus}`],
      visual,
      question: "What is the total cost of the flour packs bought?",
      correctText: asMoney(flourPacks * flourPackCost),
      distractors: [asMoney(flourPackCost), asMoney((scaledFlour / packFlour) * flourPackCost), asMoney((flourPacks + 1) * flourPackCost)],
      explanation: `Buy ${flourPacks} packs, each costing ${asMoney(flourPackCost)}.`,
      seed: setIndex + 3,
    }),
  ];
}

function makeQrStockSet(setIndex: number): UCATQuestion[] {
  const stockContext = pick(["college shop", "clinic store", "library desk", "event kiosk", "training centre", "community hub"], setIndex);
  const itemGroup = pick(
    [
      ["Notebooks", "Pens", "Cards", "Folders"],
      ["Masks", "Gloves", "Aprons", "Visors"],
      ["Guides", "Maps", "Badges", "Lanyards"],
      ["Tickets", "Tokens", "Menus", "Labels"],
      ["Cables", "Cases", "Chargers", "Adapters"],
      ["Leaflets", "Posters", "Forms", "Envelopes"],
    ] as const,
    setIndex
  );
  const rows = itemGroup.map((item, index) => {
    const opening = 120 + ((setIndex * 11 + index * 37) % 260);
    const delivered = 40 + ((setIndex * 7 + index * 19) % 120);
    const wasted = 2 + ((setIndex + index * 3) % 16);
    const sold = Math.min(70 + ((setIndex * 5 + index * 23) % 210), opening + delivered - wasted - 12);
    return { item, opening, delivered, sold, wasted };
  });
  const selected = rows[setIndex % rows.length];
  const closing = selected.opening + selected.delivered - selected.sold - selected.wasted;
  const totalSold = rows.reduce((sum, row) => sum + row.sold, 0);
  const totalAvailable = rows.reduce((sum, row) => sum + row.opening + row.delivered, 0);
  const setId = `hq-qr-stock-${pad(setIndex)}`;
  const stimulus = `The table shows stock movements at ${indefiniteArticle(stockContext)} ${stockContext} during week ${setIndex + 1}.`;
  const visual: UCATChartVisual = {
    type: "table",
    title: `Store stock ${setIndex + 1}`,
    headers: ["Item", "Opening", "Delivered", "Sold", "Damaged"],
    rows: rows.map((row) => [row.item, String(row.opening), String(row.delivered), String(row.sold), String(row.wasted)]),
  };

  return [
    singleQuestion({
      id: `${setId}-1`,
      section: "qr",
      subtype: "qr-calculator-strategy",
      setId,
      tags: ["data-display", "set-based", "easy"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stock",
      stimulus: [stimulus],
      visual,
      question: `What is the closing stock for ${selected.item}?`,
      correctText: formatNumber(closing),
      distractors: [formatNumber(selected.opening + selected.delivered), formatNumber(selected.opening - selected.sold), formatNumber(closing + selected.wasted)],
      explanation: "Closing stock = opening + delivered - sold - damaged.",
      seed: setIndex,
    }),
    singleQuestion({
      id: `${setId}-2`,
      section: "qr",
      subtype: "qr-percentages",
      setId,
      tags: ["data-display", "set-based", "medium", "calculator-heavy"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stock",
      stimulus: [stimulus],
      visual,
      question: "What percentage of all available stock was sold?",
      correctText: formatPercent((totalSold / totalAvailable) * 100),
      distractors: [formatPercent(totalSold / 100), formatPercent((totalAvailable / totalSold) * 100), formatPercent(((totalSold + rows[0].wasted) / totalAvailable) * 100)],
      explanation: "Available stock is opening plus delivered across all rows. Divide total sold by total available.",
      seed: setIndex + 1,
    }),
    singleQuestion({
      id: `${setId}-3`,
      section: "qr",
      subtype: "qr-rates-ratios",
      setId,
      tags: ["data-display", "set-based", "medium"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stock",
      stimulus: [stimulus],
      visual,
      question: `What is the ratio of ${rows[0].item} sold to ${rows[1].item} sold, in simplest form?`,
      correctText: ratio(rows[0].sold, rows[1].sold),
      distractors: uniqueDistractors(ratio(rows[0].sold, rows[1].sold), [
        `${rows[0].sold}:${rows[1].sold}`,
        ratio(rows[1].sold, rows[0].sold),
        ratio(rows[0].opening, rows[1].opening),
        ratio(rows[0].sold + rows[1].sold, rows[1].sold),
      ]),
      explanation: "Use the sold figures for the first two rows and simplify the ratio.",
      seed: setIndex + 2,
    }),
    singleQuestion({
      id: `${setId}-4`,
      section: "qr",
      subtype: "qr-estimation",
      setId,
      tags: ["data-display", "set-based", "hard"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stock",
      stimulus: [stimulus],
      visual,
      question: "Approximately how many available items were not sold, including damaged stock?",
      correctText: formatNumber(totalAvailable - totalSold),
      distractors: [formatNumber(totalSold), formatNumber(totalAvailable), formatNumber(totalAvailable - totalSold - rows.reduce((sum, row) => sum + row.wasted, 0))],
      explanation: "Subtract total sold from total available. The question includes damaged stock because those items were not sold.",
      seed: setIndex + 3,
    }),
  ];
}

function makeQrMapScaleSet(setIndex: number): UCATQuestion[] {
  const longCycle = Math.floor(setIndex / 780);
  const routeContext = pick(["park trail", "hospital walkway", "campus route", "museum tour", "market path", "sports complex"], setIndex + longCycle);
  const scale = 0.4 + ((setIndex + longCycle) % 5) * 0.15;
  const walkingSpeed = 4.2 + ((setIndex + longCycle) % 4) * 0.4;
  const rows = ["North", "East", "South", "West"].map((label, index) => {
    const mapLength = 5 + ((setIndex * 2 + index * 3 + longCycle * 4) % 13);
    const delay = 2 + ((setIndex + index * 4 + longCycle * 3) % 10);
    return { label: `${label} route`, mapLength, delay };
  });
  const selected = rows[setIndex % rows.length];
  const comparison = rows[(setIndex + 2) % rows.length];
  const routeTime = (row: (typeof rows)[number]) => ((row.mapLength * scale) / walkingSpeed) * 60 + row.delay;
  const fastest = rows.reduce((best, row) => (routeTime(row) < routeTime(best) ? row : best));
  const setId = `hq-qr-map-${pad(setIndex)}`;
  const stimulus = `A map of ${indefiniteArticle(routeContext)} ${routeContext} uses a scale of 1 cm to ${formatNumber(scale, 2)} km. Walking speed is ${formatNumber(walkingSpeed, 1)} km/h, plus the stated delay.`;
  const visual: UCATChartVisual = {
    type: "table",
    title: `${sentenceCase(routeContext)} map ${setIndex + 1}`,
    headers: ["Route", "Map length", "Extra delay"],
    rows: rows.map((row) => [row.label, `${row.mapLength} cm`, `${row.delay} min`]),
  };

  return [
    singleQuestion({
      id: `${setId}-1`,
      section: "qr",
      subtype: "qr-units-geometry",
      setId,
      tags: ["data-display", "set-based", "easy", "quick"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Map",
      stimulus: [stimulus],
      visual,
      question: `What is the actual distance of the ${selected.label}?`,
      correctText: `${formatNumber(selected.mapLength * scale, 1)} km`,
      distractors: [`${formatNumber(selected.mapLength, 1)} km`, `${formatNumber(selected.mapLength + scale, 1)} km`, `${formatNumber(Math.max(0, selected.mapLength * scale - scale), 1)} km`],
      explanation: "Multiply the map length by the distance represented by 1 cm.",
      seed: setIndex,
    }),
    singleQuestion({
      id: `${setId}-2`,
      section: "qr",
      subtype: "qr-rates-ratios",
      setId,
      tags: ["data-display", "set-based", "medium", "multi-step"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Map",
      stimulus: [stimulus],
      visual,
      question: `What is the estimated time for the ${comparison.label}, including delay?`,
      correctText: `${formatNumber(routeTime(comparison), 1)} minutes`,
      distractors: [`${formatNumber(routeTime(comparison) - comparison.delay, 1)} minutes`, `${formatNumber(routeTime(comparison) + 5, 1)} minutes`, `${formatNumber(Math.max(0, routeTime(comparison) - 5), 1)} minutes`],
      explanation: "Convert map length to distance, calculate walking time, then add the delay.",
      seed: setIndex + 1,
    }),
    singleQuestion({
      id: `${setId}-3`,
      section: "qr",
      subtype: "qr-estimation",
      setId,
      tags: ["data-display", "set-based", "medium"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Map",
      stimulus: [stimulus],
      visual,
      question: "Which route is estimated to be quickest?",
      correctText: fastest.label,
      distractors: rows.map((row) => row.label).filter((label) => label !== fastest.label),
      explanation: "Compare each route's walking time plus delay.",
      seed: setIndex + 2,
    }),
    singleQuestion({
      id: `${setId}-4`,
      section: "qr",
      subtype: "qr-calculator-strategy",
      setId,
      tags: ["data-display", "set-based", "hard", "calculator-heavy"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Map",
      stimulus: [stimulus],
      visual,
      question: `What is the absolute difference between the estimated times for the ${selected.label} and ${comparison.label}?`,
      correctText: `${formatNumber(Math.abs(routeTime(selected) - routeTime(comparison)), 1)} minutes`,
      distractors: [`${formatNumber(Math.abs(selected.mapLength - comparison.mapLength) * scale, 1)} minutes`, `${formatNumber(Math.abs(routeTime(selected) - routeTime(comparison)) + 4, 1)} minutes`, `${formatNumber(Math.max(0, Math.abs(routeTime(selected) - routeTime(comparison)) - 4), 1)} minutes`],
      explanation: "Calculate both complete route times, including delay, then subtract.",
      seed: setIndex + 3,
    }),
  ];
}

function makeQrSet(setIndex: number): UCATQuestion[] {
  switch (setIndex % 13) {
    case 0:
      return makeQrRevenueSet(setIndex);
    case 1:
      return makeQrTrendSet(setIndex);
    case 2:
      return makeQrRateSet(setIndex);
    case 3:
      return makeQrGeometrySet(setIndex);
    case 4:
      return makeQrFinanceSet(setIndex);
    case 5:
      return makeQrExpenseSet(setIndex);
    case 6:
      return makeQrTimetableSet(setIndex);
    case 7:
      return makeQrDosageSet(setIndex);
    case 8:
      return makeQrPlanSet(setIndex);
    case 9:
      return makeQrWorkRateSet(setIndex);
    case 10:
      return makeQrRecipeSet(setIndex);
    case 11:
      return makeQrStockSet(setIndex);
    default:
      return makeQrMapScaleSet(setIndex);
  }
}

const QR_CONTEXT_SOURCES = [
  "a clinic operations dashboard",
  "a school resource review",
  "a community transport log",
  "a pharmacy stock audit",
  "a catering order sheet",
  "a leisure-centre booking report",
  "a charity delivery record",
  "a revision-course finance sheet",
  "a library usage summary",
  "a mobile health-team rota",
  "a workshop attendance register",
  "a local council planning note",
  "an equipment hire ledger",
  "a patient-support service review",
  "a campus facilities spreadsheet",
  "a visitor-services log",
] as const;

const QR_CONTEXT_NOTES = [
  "Values have been rounded only where shown.",
  "Use the figures shown; no seasonal adjustment has been made.",
  "Ignore fixed overheads unless they are stated in the question.",
  "Assume the same conditions apply throughout the period described.",
  "Treat all percentages as applying to the relevant row only.",
  "Where a whole item is needed, round up at the final step.",
  "Times are recorded using the same clock for all entries.",
  "The comparison is intended to support a quick operational decision.",
  "All prices include VAT unless a question states otherwise.",
  "The table excludes cancelled bookings unless stated.",
  "Distances are one-way unless a return journey is specified.",
  "Use exact values during working and round only the answer.",
  "The data were checked once before being entered into the table.",
  "Assume missing administrative time is negligible.",
  "The figures refer to completed activity, not planned activity.",
  "No extra discount applies beyond what is shown.",
  "Stock figures refer to usable items only.",
  "The same measurement units are used across the table.",
  "The manager wants the closest practical answer.",
  "The calculation should be based only on the listed items.",
] as const;

function qrSetIndex(question: UCATQuestion) {
  const value = question.setId ?? question.id;
  const match = value.match(/-(\d+)$/);
  return match ? Number(match[1]) - 1 : 0;
}

function makeQrContextNote(setIndex: number) {
  const source = pick(QR_CONTEXT_SOURCES, setIndex * 7);
  const note = pick(QR_CONTEXT_NOTES, setIndex * 11);
  return `Source note: the data come from ${source}. ${note}`;
}

function varyQrQuestionText(questionText: string, setIndex: number) {
  const simpleVariants: Record<string, string[]> = {
    "Which service arrives latest?": [
      "Which listed service reaches its destination last?",
      "Which service has the latest arrival time?",
      "Which service arrives after all the others?",
      "Which service would a passenger reach last?",
    ],
    "How many full bottles are needed for all four patients for 7 days?": [
      "How many complete bottles are required to cover all four patients for 7 days?",
      "What is the minimum number of full bottles needed for the four patients over 7 days?",
      "For a 7-day supply for all four patients, how many whole bottles are needed?",
      "How many bottles must be opened to provide all four patients with 7 days of treatment?",
    ],
    "What is the annual cost of the Plus plan including its joining fee?": [
      "Including the joining fee, what is the first-year cost of the Plus plan?",
      "What would a customer pay for the Plus plan in the first year, including the joining fee?",
      "What is the total year-one cost for the Plus plan?",
      "How much does the Plus plan cost over 12 months once the joining fee is included?",
    ],
    "How much flour is needed for the scaled recipe?": [
      "How much flour is required after scaling the recipe?",
      "What quantity of flour is needed for the adjusted number of portions?",
      "After scaling, what mass of flour should be used?",
      "How much flour should be measured for the larger batch?",
    ],
    "What is the total revenue before the promotion?": [
      "What revenue was made before the promotion began?",
      "Before any promotional discount, what was the sales revenue?",
      "What was pre-promotion revenue for the units sold?",
      "How much income was generated before the promotion?",
    ],
    "What is the profit before the promotion?": [
      "What profit was made before the promotion began?",
      "Before the promotion, what was the total profit?",
      "What was the pre-promotion profit on the units sold?",
      "How much profit was generated before any promotional discount?",
    ],
  };

  const exact = simpleVariants[questionText];
  if (exact) return pick(exact, setIndex);

  const workerMatch = questionText.match(
    /^How many days would Worker D take to complete (\d+)% at the same rate\?$/
  );
  if (workerMatch) {
    const target = workerMatch[1];
    return pick(
      [
        `At the same rate, how many days would Worker D need to complete ${target}% of the project?`,
        `How long would Worker D take to complete ${target}% if their rate stayed constant?`,
        `Using Worker D's current rate, how many days are needed for ${target}% completion?`,
        `How many days of Worker D's work are required to complete ${target}%?`,
      ],
      setIndex
    );
  }

  return questionText;
}

function enrichGeneratedQrQuestions(questions: UCATQuestion[]) {
  return questions.map((question) => {
    if (question.section !== "qr") return question;

    const setIndex = qrSetIndex(question);
    const contextNote = makeQrContextNote(setIndex);

    return {
      ...question,
      stimulus: question.stimulus.includes(contextNote)
        ? question.stimulus
        : [...question.stimulus, contextNote],
      question: varyQrQuestionText(question.question, setIndex),
    };
  });
}

export const HIGH_QUALITY_9000_RAW_QR_QUESTIONS: UCATQuestion[] = range(
  HIGH_QUALITY_9000_COMPLETED_BATCHES * QR_SETS_PER_BATCH
).flatMap(makeQrSet);

export const HIGH_QUALITY_9000_QR_QUESTIONS: UCATQuestion[] =
  enrichGeneratedQrQuestions(
    applyCuratedQuestionReplacements(
      selectQuestionGroups({
        questions: HIGH_QUALITY_9000_RAW_QR_QUESTIONS,
        targetQuestions: HIGH_QUALITY_9000_FILTERED_TARGETS.qr,
        expectedGroupSize: 4,
        stimulusCap: 80,
        questionTemplateCap: 96,
      })
    )
  );

const SJT_PEOPLE = [
  "Amira",
  "Ben",
  "Chloe",
  "Dylan",
  "Elena",
  "Farah",
  "George",
  "Hana",
  "Isaac",
  "Jasmin",
  "Kofi",
  "Lara",
] as const;

const SJT_SCENARIOS: Array<{
  issue: UCATSjtIssueTag;
  setting: string;
  problem: string;
  safeAction: string;
  partlyAppropriateAction: string;
  learningButPoorAction: string;
  unsafeAction: string;
  important: string;
  secondaryImportant: string;
  learningReason: string;
  minor: string;
}> = [
  {
    issue: "confidentiality",
    setting: "the outpatient reception desk",
    problem: "a visitor asks to see a patient's appointment details without proof of permission",
    safeAction: "explain that patient information cannot be shared without appropriate consent or verification",
    partlyAppropriateAction: "say they cannot share the details and ask reception staff where to direct the visitor, but not check whether urgent help is needed",
    learningButPoorAction: "check the appointment screen to understand the process before asking staff what to do",
    unsafeAction: "read the details aloud because the visitor sounds worried",
    important: "protecting patient confidentiality while seeking appropriate help",
    secondaryImportant: "whether a receptionist can verify the visitor's authority promptly",
    learningReason: "whether the student wanted to learn how appointment enquiries are usually handled",
    minor: "whether the visitor is standing near the noticeboard",
  },
  {
    issue: "patient-safety",
    setting: "the ward stock room",
    problem: "a medicine trolley is left unlocked in a corridor",
    safeAction: "tell a qualified staff member promptly and keep the trolley under observation if safe to do so",
    partlyAppropriateAction: "keep the trolley in sight while waiting for a qualified staff member to pass",
    learningButPoorAction: "try to work out the trolley's locking mechanism before telling staff",
    unsafeAction: "ignore it because medicine storage is not a student's responsibility",
    important: "preventing unauthorised access to medicines",
    secondaryImportant: "whether the student can keep the trolley in sight without putting themselves at risk",
    learningReason: "whether the student wanted to learn how medicine trolleys are secured",
    minor: "whether the corridor paint has recently been changed",
  },
  {
    issue: "communication",
    setting: "the clinic waiting area",
    problem: "a patient says they do not understand the written instructions they were given",
    safeAction: "ask a staff member for appropriate communication support and avoid guessing",
    partlyAppropriateAction: "tell the patient they will find someone to explain it, but give no immediate reassurance about getting help",
    learningButPoorAction: "try to paraphrase the instructions as practice before checking with staff",
    unsafeAction: "invent a simpler explanation without checking the clinical meaning",
    important: "making sure the patient receives accurate information in a form they can understand",
    secondaryImportant: "whether appropriate communication support is available nearby",
    learningReason: "whether the student wanted practice explaining written information",
    minor: "whether the leaflet has a colourful front page",
  },
  {
    issue: "scope-of-practice",
    setting: "the teaching clinic",
    problem: "a patient asks a student to diagnose a new symptom",
    safeAction: "explain that a qualified clinician should assess the symptom and escalate the request",
    partlyAppropriateAction: "say they cannot diagnose the symptom and ask the patient to wait for a clinician, but not check whether the symptom sounds urgent",
    learningButPoorAction: "ask extra symptom questions to test their own learning before escalating the request",
    unsafeAction: "give a likely diagnosis to reassure the patient quickly",
    important: "staying within competence and seeking qualified review",
    secondaryImportant: "whether the relevant supervisor is nearby",
    learningReason: "whether the student wanted to practise clinical reasoning",
    minor: "whether the student has revised the topic recently",
  },
  {
    issue: "teamwork",
    setting: "a busy skills session",
    problem: "a colleague is struggling with a task and becoming flustered",
    safeAction: "offer calm help and suggest involving the supervisor if the task remains unsafe",
    partlyAppropriateAction: "quietly offer help, but wait too long before suggesting supervisor support",
    learningButPoorAction: "take over the task to learn it themselves without checking whether the colleague is comfortable",
    unsafeAction: "criticise the colleague in front of the group",
    important: "supporting the team while keeping the task safe",
    secondaryImportant: "whether the colleague would welcome quiet support",
    learningReason: "whether the student thought taking over would improve their own skills",
    minor: "whether the colleague usually arrives before everyone else",
  },
  {
    issue: "integrity",
    setting: "a placement logbook review",
    problem: "a student notices an attendance entry has been recorded incorrectly in their favour",
    safeAction: "raise the error honestly and ask how to correct the record",
    partlyAppropriateAction: "ask the student to check the entry and offer to help raise it if needed",
    learningButPoorAction: "wait to see whether the error is noticed later so they can understand the correction process",
    unsafeAction: "leave the record unchanged because the error is helpful",
    important: "being honest about records that affect assessment",
    secondaryImportant: "whether the record affects assessment outcomes",
    learningReason: "whether the student wanted to learn how logbook corrections are processed",
    minor: "whether the pen colour matches earlier entries",
  },
  {
    issue: "respect-dignity",
    setting: "the admissions desk",
    problem: "an anxious patient is spoken over while trying to explain their concern",
    safeAction: "make space for the patient to finish and ask a staff member how best to help",
    partlyAppropriateAction: "ask the patient to pause while finding a staff member, but not acknowledge their anxiety",
    learningButPoorAction: "interrupt briefly to practise managing a busy queue before seeking staff help",
    unsafeAction: "tell the patient to be brief because the queue is long",
    important: "treating the patient respectfully while keeping the queue moving safely",
    secondaryImportant: "whether the patient appears distressed",
    learningReason: "whether the student hoped to practise handling difficult conversations",
    minor: "whether the queue barrier is the newest style",
  },
  {
    issue: "escalation",
    setting: "the simulation room",
    problem: "a student notices that a practice oxygen cylinder appears damaged",
    safeAction: "stop using the equipment and alert the supervisor immediately",
    partlyAppropriateAction: "move people away from the equipment and tell the supervisor when they return",
    learningButPoorAction: "inspect the cylinder closely to learn what damage looks like before reporting it",
    unsafeAction: "continue the session because the cylinder is only being used for practice",
    important: "escalating a possible equipment risk promptly",
    secondaryImportant: "whether the equipment can be isolated without using it",
    learningReason: "whether the student wanted to learn how equipment checks are done",
    minor: "whether the simulation room has enough spare pens",
  },
  {
    issue: "candour",
    setting: "the ward office",
    problem: "a student realises they gave a visitor an incorrect visiting time",
    safeAction: "tell the supervising staff member and help correct the information honestly",
    partlyAppropriateAction: "tell the visitor there may have been a mistake and look for the supervisor, but not clearly explain what happened",
    learningButPoorAction: "wait briefly to see if the visitor returns, intending to mention the error later as a learning point",
    unsafeAction: "hope the visitor checks the website and avoid mentioning the mistake",
    important: "being open about an error so it can be corrected",
    secondaryImportant: "whether the incorrect time could cause the visitor to miss access to the ward",
    learningReason: "whether the student wanted to learn how visitor information errors are corrected",
    minor: "whether the visitor noticed the student's name badge",
  },
  {
    issue: "capacity-consent",
    setting: "the outpatient corridor",
    problem: "a patient seems unsure about a form they are being asked to sign",
    safeAction: "ask a qualified staff member to check the patient's understanding before proceeding",
    partlyAppropriateAction: "pause the paperwork and look for staff, but not explain to the patient why they are waiting",
    learningButPoorAction: "ask the patient informal questions to practise checking understanding before getting staff",
    unsafeAction: "encourage the patient to sign quickly because the clinic is running late",
    important: "checking understanding and consent before paperwork is completed",
    secondaryImportant: "whether the form can safely wait until a qualified staff member is free",
    learningReason: "whether the student wanted to learn how consent discussions are checked",
    minor: "whether the form is printed on blue paper",
  },
  {
    issue: "professional-boundaries",
    setting: "a student teaching session",
    problem: "a patient asks a student to contact them privately on social media",
    safeAction: "politely decline and explain that communication should use appropriate clinical routes",
    partlyAppropriateAction: "decline private contact and say they will check what official contact routes are available later",
    learningButPoorAction: "look through the request to understand why the patient wants contact before declining",
    unsafeAction: "accept the request because it may make the patient feel supported",
    important: "maintaining clear professional boundaries",
    secondaryImportant: "whether there is an official route for follow-up questions",
    learningReason: "whether the student wanted to learn how patients use social media for support",
    minor: "whether the social media app is popular with students",
  },
  {
    issue: "justice",
    setting: "the appointment booking desk",
    problem: "a staff member is tempted to move a friend higher on the waiting list",
    safeAction: "avoid giving unfair priority and follow the normal booking process",
    partlyAppropriateAction: "say they cannot change the list and ask staff to explain the process, but not directly challenge the unfair request",
    learningButPoorAction: "look through the waiting list to understand prioritisation before refusing the request",
    unsafeAction: "agree because the friend has been waiting for several days",
    important: "treating patients fairly according to the agreed process",
    secondaryImportant: "whether the booking process has an approved urgent-priority route",
    learningReason: "whether the student wanted to learn how waiting-list decisions are made",
    minor: "whether the waiting-list spreadsheet uses colour coding",
  },
] as const;

const SJT_APPROPRIATENESS_QUESTIONS = [
  "How appropriate is it for",
  "How suitable would it be for",
  "How professional would it be for",
  "How acceptable is it for",
] as const;

const SJT_IMPORTANCE_QUESTIONS = [
  "How important is",
  "How much importance should be given to",
  "How important would it be to consider",
  "How relevant is",
] as const;

const SJT_SESSION_CONTEXTS = [
  "near the start of a shift",
  "while the supervisor is briefly away",
  "during a busy handover period",
  "shortly before the next appointment",
  "after a patient-facing teaching session",
  "while the team is preparing to close the area",
  "during a routine safety check",
  "after several people have asked for help at once",
] as const;

const SJT_PEER_PRESSURES = [
  "dealing with it quickly so the team can move on",
  "leaving it because a qualified staff member will probably notice later",
  "taking the quickest option to avoid delaying the session",
  "keeping it informal because it seems minor",
  "handling it without asking anyone else",
  "waiting until the end of the session before mentioning it",
] as const;

const SJT_BACKGROUND_DETAILS = [
  "A receptionist nearby is also managing phone calls.",
  "The supervising clinician is speaking to another patient.",
  "The area is busy but not unsafe.",
  "Several students have noticed the situation developing.",
  "A member of staff has asked students to raise concerns promptly.",
  "The patient-facing area is still open.",
  "The team has a short break scheduled soon.",
  "A senior student is nearby but not responsible for supervision.",
  "The placement handbook says concerns should be escalated.",
  "The situation has not yet been recorded anywhere.",
  "A queue is forming behind the patient.",
  "The student has not encountered this exact situation before.",
  "The situation is not immediately being managed by anyone else.",
  "The team is trying to keep appointments on time.",
  "A noticeboard lists the local escalation route.",
  "The student is being assessed on professional behaviour.",
  "The concern could affect another person if ignored.",
] as const;

const SJT_DRAG_QUESTIONS = [
  "Sort the actions according to whether they are appropriate in this situation.",
  "Place each action into the category that best fits this situation.",
  "Classify the actions as appropriate or inappropriate.",
  "Sort the responses by whether they would be suitable here.",
  "Decide which actions are appropriate and which are inappropriate.",
  "Group the actions according to their professional suitability.",
] as const;

function makeSjtStem(input: {
  setIndex: number;
  person: string;
  peer: string;
  scenario: (typeof SJT_SCENARIOS)[number];
  sessionContext: string;
  peerPressure: string;
  backgroundDetail: string;
}) {
  const problem = sentenceCase(input.scenario.problem);

  switch (input.setIndex % 10) {
    case 0:
      return `${input.person}, a medical student, is working at ${input.scenario.setting} ${input.sessionContext}. ${problem}. ${input.backgroundDetail} ${input.peer}, another student, suggests ${input.peerPressure}.`;
    case 1:
      return `While placed at ${input.scenario.setting}, ${input.person} sees the following issue ${input.sessionContext}: ${input.scenario.problem}. ${input.backgroundDetail} ${input.peer} suggests ${input.peerPressure}.`;
    case 2:
      return `${input.person} is on placement at ${input.scenario.setting}. ${problem}. This happens ${input.sessionContext}. ${input.backgroundDetail} Another student, ${input.peer}, suggests ${input.peerPressure}.`;
    case 3:
      return `In ${input.scenario.setting}, ${input.person} notices that ${input.scenario.problem}. The situation arises ${input.sessionContext}. ${input.backgroundDetail} ${input.peer}, who is also present, suggests ${input.peerPressure}.`;
    case 4:
      return `${input.person}, a medical student, has been asked to help at ${input.scenario.setting}. ${problem}. ${input.backgroundDetail} The team is ${input.sessionContext}; ${input.peer} suggests ${input.peerPressure}.`;
    case 5:
      return `${problem} while ${input.person}, a medical student, is at ${input.scenario.setting}. ${input.backgroundDetail} This is ${input.sessionContext}. ${input.peer}, another student, suggests ${input.peerPressure}.`;
    case 6:
      return `${input.person} is observing at ${input.scenario.setting} ${input.sessionContext}. ${problem}. ${input.backgroundDetail} ${input.peer} says they should consider ${input.peerPressure}.`;
    case 7:
      return `During placement, ${input.person} is at ${input.scenario.setting} when ${input.scenario.problem}. ${input.backgroundDetail} The timing is awkward because it is ${input.sessionContext}. ${input.peer} suggests ${input.peerPressure}.`;
    case 8:
      return `${input.person}, a medical student at ${input.scenario.setting}, becomes aware that ${input.scenario.problem}. ${input.backgroundDetail} It is ${input.sessionContext}, and ${input.peer} suggests ${input.peerPressure}.`;
    default:
      return `${input.person} is helping at ${input.scenario.setting}. ${problem}. ${input.backgroundDetail} The issue comes up ${input.sessionContext}. ${input.peer}, another student nearby, suggests ${input.peerPressure}.`;
  }
}

function makeSjtSet(setIndex: number): UCATQuestion[] {
  const person = pick(SJT_PEOPLE, setIndex);
  const peer = pick(SJT_PEOPLE, setIndex + 5);
  const scenario = pick(SJT_SCENARIOS, setIndex * 5);
  const setId = `hq-sjt-${pad(setIndex)}`;
  const sessionContext = pick(SJT_SESSION_CONTEXTS, setIndex * 7);
  const peerPressure = pick(SJT_PEER_PRESSURES, setIndex * 11);
  const backgroundDetail = pick(SJT_BACKGROUND_DETAILS, setIndex * 13);
  const stem = makeSjtStem({
    setIndex,
    person,
    peer,
    scenario,
    sessionContext,
    peerPressure,
    backgroundDetail,
  });
  const issueTags = [scenario.issue];
  const appropriatenessQuestion = pick(SJT_APPROPRIATENESS_QUESTIONS, setIndex);
  const importanceQuestion = pick(SJT_IMPORTANCE_QUESTIONS, setIndex);
  const positiveActionIsPartial = setIndex % 4 === 0;
  const negativeActionIsPartial = setIndex % 4 === 1;
  const importantFactorIsSecondary = setIndex % 4 === 2;
  const minorFactorIsLearning = setIndex % 4 === 3;
  const positiveAction = positiveActionIsPartial ? scenario.partlyAppropriateAction : scenario.safeAction;
  const negativeAction = negativeActionIsPartial ? scenario.learningButPoorAction : scenario.unsafeAction;
  const importantFactor = importantFactorIsSecondary ? scenario.secondaryImportant : scenario.important;
  const minorFactor = minorFactorIsLearning ? scenario.learningReason : scenario.minor;

  return [
    {
      id: `${setId}-1`,
      section: "sjt",
      subtype: "sjt-appropriateness",
      setId,
      tags: ["text-stem", "set-based", "medium"],
      issueTags,
      title: "Situational Judgement Practice",
      leftTitle: "Scenario",
      stimulus: [stem],
      question: `${appropriatenessQuestion} ${person} to ${positiveAction}?`,
      options: APPROPRIATENESS_OPTIONS,
      answer: positiveActionIsPartial ? "B" : "A",
      explanation: positiveActionIsPartial
        ? "This is appropriate but not ideal: it recognises the professional concern and seeks help, but the response is delayed or incomplete."
        : "This is a very appropriate response because it protects the patient or service user, stays within role and seeks appropriate support.",
    },
    {
      id: `${setId}-2`,
      section: "sjt",
      subtype: "sjt-appropriateness",
      setId,
      tags: ["text-stem", "set-based", "medium"],
      issueTags,
      title: "Situational Judgement Practice",
      leftTitle: "Scenario",
      stimulus: [stem],
      question: `${appropriatenessQuestion} ${person} to ${negativeAction}?`,
      options: APPROPRIATENESS_OPTIONS,
      answer: negativeActionIsPartial ? "C" : "D",
      explanation: negativeActionIsPartial
        ? "This is inappropriate but not the worst response: wanting to learn does not justify delaying escalation or acting beyond role, although the action is less severe than ignoring the concern entirely."
        : "This is very inappropriate because it creates avoidable risk, ignores professional limits or fails to respect patient-centred practice.",
    },
    {
      id: `${setId}-3`,
      section: "sjt",
      subtype: "sjt-importance",
      setId,
      tags: ["text-stem", "set-based", "medium"],
      issueTags,
      title: "Situational Judgement Practice",
      leftTitle: "Scenario",
      stimulus: [stem],
      question: `${importanceQuestion} ${importantFactor}?`,
      options: IMPORTANCE_OPTIONS,
      answer: importantFactorIsSecondary ? "B" : "A",
      explanation: importantFactorIsSecondary
        ? "This is important because it affects how the student should manage the situation, but it is not the central professional principle."
        : "This is very important because it directly affects safe, respectful and professional handling of the situation.",
    },
    {
      id: `${setId}-4`,
      section: "sjt",
      subtype: "sjt-importance",
      setId,
      tags: ["text-stem", "set-based", "easy"],
      issueTags,
      title: "Situational Judgement Practice",
      leftTitle: "Scenario",
      stimulus: [stem],
      question: `${importanceQuestion} ${minorFactor}?`,
      options: IMPORTANCE_OPTIONS,
      answer: minorFactorIsLearning ? "C" : "D",
      explanation: minorFactorIsLearning
        ? "This is of minor importance. A learning motive may explain why the student was tempted, but it does not outweigh safety, confidentiality, consent, honesty or professional boundaries."
        : "This is not important to the professional decision. It does not address safety, confidentiality, honesty, consent or respect.",
    },
    dragCategoryQuestion({
      id: `${setId}-5`,
      section: "sjt",
      subtype: "sjt-drag-drop",
      setId,
      tags: ["text-stem", "set-based", "hard", "multi-step"],
      issueTags,
      title: "Situational Judgement Practice",
      leftTitle: "Scenario",
      stimulus: [stem],
      question: pick(SJT_DRAG_QUESTIONS, setIndex),
      instruction: "Place each action into the most suitable category.",
      categories: [
        { id: "appropriate", label: "Appropriate" },
        { id: "inappropriate", label: "Inappropriate" },
      ],
      categoryItems: [
        { id: "safe-action", text: `${sentenceCase(scenario.safeAction)}.`, answerCategory: "appropriate" },
        { id: "unsafe-action", text: `Decide to ${scenario.unsafeAction}.`, answerCategory: "inappropriate" },
        { id: "ask-supervisor", text: "Ask a qualified member of staff for advice if unsure.", answerCategory: "appropriate" },
        { id: "avoid-record", text: "Avoid documenting or reporting the concern because it may slow the team down.", answerCategory: "inappropriate" },
      ],
      explanation:
        "Appropriate actions manage the risk, respect professional boundaries and involve qualified support. Inappropriate actions ignore the concern or act beyond the student's role.",
    }),
  ];
}

export const HIGH_QUALITY_9000_RAW_SJT_QUESTIONS: UCATQuestion[] = range(
  HIGH_QUALITY_9000_COMPLETED_BATCHES * SJT_SETS_PER_BATCH
).flatMap(makeSjtSet);

export const HIGH_QUALITY_9000_SJT_QUESTIONS: UCATQuestion[] =
  applyCuratedQuestionReplacements(
    selectQuestionGroups({
      questions: HIGH_QUALITY_9000_RAW_SJT_QUESTIONS,
      targetQuestions: HIGH_QUALITY_9000_FILTERED_TARGETS.sjt,
      expectedGroupSize: 5,
      stimulusCap: 20,
    })
  );

export const HIGH_QUALITY_9000_UCAT_QUESTION_BANK: Record<UCATSection, UCATQuestion[]> = {
  vr: HIGH_QUALITY_9000_VR_QUESTIONS,
  dm: HIGH_QUALITY_9000_DM_QUESTIONS,
  qr: HIGH_QUALITY_9000_QR_QUESTIONS,
  sjt: HIGH_QUALITY_9000_SJT_QUESTIONS,
};

export const HIGH_QUALITY_9000_TOTAL =
  HIGH_QUALITY_9000_VR_QUESTIONS.length +
  HIGH_QUALITY_9000_DM_QUESTIONS.length +
  HIGH_QUALITY_9000_QR_QUESTIONS.length +
  HIGH_QUALITY_9000_SJT_QUESTIONS.length;
