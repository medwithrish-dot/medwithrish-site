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

export const HIGH_QUALITY_9000_TOTAL_BATCHES = 20;
export const HIGH_QUALITY_9000_COMPLETED_BATCHES = 19;
export const HIGH_QUALITY_9000_BATCH_TARGETS: Record<UCATSection, number> = {
  vr: 220,
  dm: 175,
  qr: 180,
  sjt: 325,
};

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

  return `Unsupported alternative ${attempt}`;
}

function buildOptions(correctText: string, distractors: string[], seed: number) {
  const wrongs = distractors
    .map((text) => text.trim())
    .filter((text, index, array) => text && text !== correctText && array.indexOf(text) === index)
    .slice(0, 3);

  let filler = 1;
  while (wrongs.length < 3) {
    const next = fallbackDistractor(correctText, filler);
    if (!wrongs.includes(next)) wrongs.push(next);
    filler += 1;
  }

  const answerIndex = seed % OPTION_KEYS.length;
  const texts = [...wrongs];
  texts.splice(answerIndex, 0, correctText);

  return {
    options: texts.map((text, index) => ({ key: OPTION_KEYS[index], text })),
    answer: OPTION_KEYS[answerIndex],
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
  const built = buildOptions(input.correctText, input.distractors, input.seed);
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
  "All of the following are stated in the passage EXCEPT that",
  "Which of the following is NOT stated in the passage?",
  "Which statement goes beyond what the passage says?",
  "Which option is not supported by the passage?",
  "The passage states all of the following EXCEPT that",
  "Which claim cannot be verified from the passage?",
  "Which option would be an overstatement of the passage?",
  "Which of the following does the passage not establish?",
] as const;

function makeVrSet(setIndex: number): UCATQuestion[] {
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
  const passage = [
    `${setting} tested ${project} for ${group} after ${problem}. The aim was to ${aim}, not to ${oldRoutine}. The project was funded by ${funder}. During the six-week trial, ${metric} ${metricVerb} from ${firstMetric} to ${secondMetric}.`,
    `The review said the figures were encouraging but should be treated carefully because ${caveat}. It also noted that ${limitation}. The recommendation was to keep the project for one more term and compare demand with a similar site before wider rollout.`,
  ];
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
        question: pick(VR_NEGATIVE_QUESTIONS, setIndex),
        correctText: "the project was guaranteed to be used at every similar site.",
        distractors: [
          `the project was funded by ${funder}.`,
          `the trial lasted six weeks.`,
          `the review noted that ${limitation}.`,
        ],
        explanation:
          "The passage recommends another term and comparison; it does not guarantee full rollout.",
        seed: setIndex + 3,
      })
    );
  }

  return questions;
}

export const HIGH_QUALITY_9000_VR_QUESTIONS: UCATQuestion[] = range(
  HIGH_QUALITY_9000_COMPLETED_BATCHES * VR_SETS_PER_BATCH
).flatMap(makeVrSet);

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
  const a = `${qualifier} ${baseA}`;
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
  const leftOnly = 12 + (index % 15);
  const rightOnly = 10 + ((index * 2) % 14);
  const both = 8 + ((index * 3) % 11);
  const neither = 6 + ((index * 5) % 9);
  const total = leftOnly + rightOnly + both + neither;
  const left = leftOnly + both;
  const right = rightOnly + both;
  const groups = pick(
    [
      ["attended a workshop", "submitted a reflection"],
      ["used the app", "booked a tutor slot"],
      ["read the guide", "completed a quiz"],
      ["joined a webinar", "downloaded notes"],
      ["attended mentoring", "submitted practice answers"],
      ["used a calculator trainer", "kept an error log"],
      ["watched a worked solution", "rewrote their explanation"],
      ["booked a library desk", "joined a study group"],
      ["joined a clinic tour", "completed a safety checklist"],
      ["used spaced repetition", "reviewed flagged questions"],
      ["submitted a mock reflection", "attended a feedback meeting"],
      ["used a timing tracker", "changed their revision plan"],
      ["read an ethics case", "answered follow-up questions"],
      ["joined a peer tutorial", "marked another student's answer"],
      ["watched an interview demo", "wrote improvement notes"],
      ["completed a data drill", "checked the worked solution"],
      ["used a study planner", "logged missed questions"],
      ["attended a drop-in session", "booked independent practice"],
      ["read a statistics guide", "completed a probability quiz"],
      ["joined a mentoring call", "submitted weekly targets"],
      ["used a whiteboard method", "reviewed calculation errors"],
      ["completed a mini mock", "analysed timing data"],
      ["read a passage twice", "highlighted key claims"],
      ["completed a logic puzzle", "explained the rule set"],
    ] as const,
    index
  );
  const question = pick(
    [
      `How many students ${groups[0]} or ${groups[1]}?`,
      `How many students did at least one of the two activities?`,
      `What is the total number who completed one or both activities?`,
      `How many students are represented outside the Neither row?`,
      `How many students should be counted in the union of the two activities?`,
    ] as const,
    index
  );
  const visual: UCATChartVisual = {
    type: "table",
    title: `Activity survey ${index + 1}`,
    headers: ["Region", "Members"],
    rows: [
      [`Only ${groups[0]}`, String(leftOnly)],
      [`Only ${groups[1]}`, String(rightOnly)],
      ["Both", String(both)],
      ["Neither", String(neither)],
    ],
  };
  return singleQuestion({
    id: `hq-dm-venn-${pad(index)}`,
    section: "dm",
    subtype: "dm-venn-sets",
    setId: `hq-dm-venn-${pad(index)}`,
    tags: ["data-display", "set-based", index % 3 === 0 ? "hard" : "medium"],
    title: "Decision Making Practice",
    leftTitle: "Data",
    stimulus: [`A group of ${total} students in survey ${index + 1} was surveyed about whether they ${groups[0]} and whether they ${groups[1]}.`],
    visual,
    question,
    correctText: formatNumber(left + rightOnly),
    distractors: [formatNumber(left), formatNumber(right), formatNumber(total)],
    explanation:
      `Students in at least one activity = only first + only second + both = ${leftOnly} + ${rightOnly} + ${both} = ${left + rightOnly}.`,
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

export const HIGH_QUALITY_9000_DM_QUESTIONS: UCATQuestion[] = [
  ...range(HIGH_QUALITY_9000_COMPLETED_BATCHES * DM_SYLLOGISMS_PER_BATCH).map(makeDmSyllogism),
  ...range(HIGH_QUALITY_9000_COMPLETED_BATCHES * DM_LOGIC_PER_BATCH).map(makeDmLogic),
  ...range(HIGH_QUALITY_9000_COMPLETED_BATCHES * DM_ARGUMENTS_PER_BATCH).map(makeDmArgument),
  ...range(HIGH_QUALITY_9000_COMPLETED_BATCHES * DM_YES_NO_PER_BATCH).map(makeDmYesNo),
  ...range(HIGH_QUALITY_9000_COMPLETED_BATCHES * DM_VENN_PER_BATCH).map(makeDmVenn),
  ...range(HIGH_QUALITY_9000_COMPLETED_BATCHES * DM_PROBABILITY_PER_BATCH).map(makeDmProbability),
];

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
  const medicine = pick(["Avenol", "Brixam", "Caldrin", "Dovamil", "Elistat", "Fendrox"], setIndex);
  const dosePerKg = 6 + (setIndex % 5);
  const concentration = 20 + (setIndex % 6) * 5;
  const bottleVolume = 100 + (setIndex % 4) * 25;
  const rows = ["J", "K", "L", "M"].map((patient, index) => ({
    patient,
    weight: 38 + ((setIndex * 7 + index * 11) % 48),
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
  const routeContext = pick(["park trail", "hospital walkway", "campus route", "museum tour", "market path", "sports complex"], setIndex);
  const scale = 0.4 + (setIndex % 5) * 0.15;
  const walkingSpeed = 4.2 + (setIndex % 4) * 0.4;
  const rows = ["North", "East", "South", "West"].map((label, index) => {
    const mapLength = 5 + ((setIndex * 2 + index * 3) % 13);
    const delay = 2 + ((setIndex + index * 4) % 10);
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

export const HIGH_QUALITY_9000_QR_QUESTIONS: UCATQuestion[] = range(
  HIGH_QUALITY_9000_COMPLETED_BATCHES * QR_SETS_PER_BATCH
).flatMap(makeQrSet);

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

function makeSjtSet(setIndex: number): UCATQuestion[] {
  const person = pick(SJT_PEOPLE, setIndex);
  const peer = pick(SJT_PEOPLE, setIndex + 5);
  const scenario = pick(SJT_SCENARIOS, setIndex * 5);
  const setId = `hq-sjt-${pad(setIndex)}`;
  const sessionContext = pick(SJT_SESSION_CONTEXTS, setIndex * 7);
  const peerPressure = pick(SJT_PEER_PRESSURES, setIndex * 11);
  const backgroundDetail = pick(SJT_BACKGROUND_DETAILS, setIndex * 13);
  const stem = `During supervised session ${setIndex + 1}, ${person}, a medical student, is assigned to ${scenario.setting} ${sessionContext}. ${sentenceCase(scenario.problem)}. ${backgroundDetail} ${peer}, another student, suggests ${peerPressure}.`;
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

export const HIGH_QUALITY_9000_SJT_QUESTIONS: UCATQuestion[] = range(
  HIGH_QUALITY_9000_COMPLETED_BATCHES * SJT_SETS_PER_BATCH
).flatMap(makeSjtSet);

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
