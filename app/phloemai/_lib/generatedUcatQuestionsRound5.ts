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

function range(length: number) {
  return Array.from({ length }, (_, index) => index);
}

function formatNumber(value: number, decimals = 1) {
  if (Number.isInteger(value)) return value.toLocaleString("en-GB");
  return value.toLocaleString("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function options(correctText: string, distractors: string[], seed: number) {
  const texts = distractors
    .filter((text, index) => text !== correctText && distractors.indexOf(text) === index)
    .slice(0, 3);
  while (texts.length < 3) texts.push("Cannot be determined");
  const answerIndex = seed % 4;
  texts.splice(answerIndex, 0, correctText);
  return {
    options: texts.map((text, index) => ({ key: OPTION_KEYS[index], text })),
    answer: OPTION_KEYS[answerIndex],
  };
}

function single(input: {
  id: string;
  section: UCATSection;
  subtype: UCATSubtypeId;
  title: string;
  leftTitle: string;
  setId?: string;
  tags: UCATQuestionTag[];
  issueTags?: UCATSjtIssueTag[];
  stimulus: string[];
  visual?: UCATChartVisual;
  question: string;
  correctText: string;
  distractors: string[];
  explanation: string;
  seed: number;
}): UCATQuestion {
  const built = options(input.correctText, input.distractors, input.seed);
  return { ...input, ...built };
}

type VrKind =
  | "true"
  | "false"
  | "cant"
  | "detail"
  | "inference"
  | "author"
  | "negative"
  | "summary";

const VR_KIND_CYCLE: VrKind[] = [
  "true",
  "false",
  "detail",
  "inference",
  "cant",
  "detail",
  "author",
  "negative",
  "true",
  "false",
  "detail",
  "summary",
  "cant",
  "detail",
  "inference",
  "summary",
];

const VR_TOPICS = [
  ["river taxis", "pre-booked boarding windows", "on-time departures", "dock complaints", "remove crew judgement"],
  ["science clubs", "shared equipment bags", "completed experiments", "missing kit reports", "replace teacher supervision"],
  ["town trails", "numbered wayfinding posts", "finished routes", "lost visitor calls", "close the visitor desk"],
  ["meal schemes", "collection time slots", "successful pickups", "duplicate parcels", "replace volunteer discretion"],
  ["cinema clubs", "captioned matinees", "new bookings", "refund queries", "cancel standard screenings"],
  ["music hubs", "instrument lockers", "practice attendance", "room clashes", "replace tutors"],
  ["repair cafes", "triage cards", "items fixed", "waiting times", "guarantee every repair"],
  ["heritage tours", "small-group tickets", "tour completion", "crowding reports", "remove safety briefings"],
] as const;

function makeVrQuestion(index: number): UCATQuestion {
  const kind = VR_KIND_CYCLE[index % VR_KIND_CYCLE.length];
  const setIndex = Math.floor(index / 4);
  const [area, project, positiveMetric, negativeMetric, rejectedAim] =
    VR_TOPICS[setIndex % VR_TOPICS.length];
  const setId = `vr-round5-set-${String(setIndex + 1).padStart(3, "0")}`;
  const sites = 4 + (setIndex % 6);
  const before = 32 + ((setIndex * 5) % 28);
  const after = before + 7 + (setIndex % 9);
  const problemBefore = 30 + ((setIndex * 3) % 15);
  const problemAfter = problemBefore - (4 + (setIndex % 5));
  const stimulus = [
    `A pilot scheme in ${area} tested ${project} across ${sites} locations. The organisers said the scheme was meant to improve flow, not to ${rejectedAim}.`,
    `After eight weeks, ${positiveMetric} increased from ${before} to ${after}, while ${negativeMetric} reduced from ${problemBefore} to ${problemAfter}. Some staff still wanted clearer fallback instructions.`,
    "The summary recommended continuing the scheme at the busiest locations, but only after the instructions had been rewritten and reviewed.",
  ];
  const common = {
    id: `vr-round5-${String(index + 1).padStart(3, "0")}`,
    section: "vr" as const,
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    setId,
    stimulus,
  };

  if (kind === "true" || kind === "false" || kind === "cant") {
    const answer: UCATOptionKey = kind === "true" ? "A" : kind === "false" ? "B" : "C";
    return {
      ...common,
      subtype: "vr-tfc",
      tags: ["true-false-cant-tell", "text-stem", "quick"],
      question:
        kind === "true"
          ? `The pilot scheme was tested across ${sites} locations.`
          : kind === "false"
            ? `The organisers said the scheme was meant to ${rejectedAim}.`
            : "The passage states that the scheme was cheaper than the previous approach.",
      options: TFC_OPTIONS,
      answer,
      explanation:
        kind === "true"
          ? "The number of locations is stated in the first sentence."
          : kind === "false"
            ? "The passage says this was not the aim of the scheme."
            : "The passage gives no cost comparison.",
    };
  }

  if (kind === "detail") {
    return single({
      ...common,
      subtype: "vr-detail",
      tags: ["detail-retrieval", "text-stem", "quick"],
      question: "Which change is stated in the passage?",
      correctText: `${positiveMetric} increased from ${before} to ${after}.`,
      distractors: [
        `${negativeMetric} increased from ${problemAfter} to ${problemBefore}.`,
        "The number of locations was halved.",
        "The scheme was made permanent immediately.",
      ],
      explanation: `The passage states that ${positiveMetric} increased from ${before} to ${after}.`,
      seed: index,
    });
  }

  if (kind === "inference") {
    return single({
      ...common,
      subtype: "vr-inference",
      tags: ["inference-question", "text-stem", "medium"],
      question: "Which conclusion is best supported?",
      correctText: "The scheme showed promise, but the review treated improvement work as necessary.",
      distractors: [
        "The scheme was rejected because both measures worsened.",
        "The scheme was intended to remove human judgement entirely.",
        "The review recommended immediate national rollout.",
      ],
      explanation:
        "The recommendation was conditional: continue at busy locations after instructions were rewritten and reviewed.",
      seed: index,
    });
  }

  if (kind === "author") {
    return single({
      ...common,
      subtype: "vr-author",
      tags: ["author-opinion", "text-stem", "medium"],
      question: "What is the summary's stance?",
      correctText: "Supportive with reservations",
      distractors: ["Hostile throughout", "Unconcerned with evidence", "Certain the scheme has no value"],
      explanation:
        "The summary supports continuation in some places but adds conditions.",
      seed: index,
    });
  }

  if (kind === "negative") {
    return single({
      ...common,
      subtype: "vr-negative",
      tags: ["negative-except", "text-stem", "medium"],
      question: "Which statement is not supported?",
      correctText: "The scheme removed the need for fallback instructions.",
      distractors: [
        `${negativeMetric} reduced during the pilot.`,
        `${positiveMetric} increased during the pilot.`,
        "The scheme was recommended only with further work.",
      ],
      explanation:
        "The passage says staff wanted clearer fallback instructions, not that they were unnecessary.",
      seed: index,
    });
  }

  return single({
    ...common,
    subtype: "vr-summary",
    tags: ["summary-structure", "text-stem", "medium"],
    question: "Which title best fits the passage?",
    correctText: `${project}: promising results with conditions`,
    distractors: [
      `${project}: a project with no recorded outcomes`,
      `${area}: why staff should be replaced`,
      `${area}: a national law change explained`,
    ],
    explanation:
      "The passage is about useful early results and a conditional recommendation.",
    seed: index,
  });
}

function makeDmSyllogism(index: number): UCATQuestion {
  const setId = `dm-round5-syllogism-${String(index + 1).padStart(3, "0")}`;
  const a = ["blue cards", "weekday passes", "silver tokens", "north forms"][index % 4];
  const b = ["checked items", "registered items", "verified items", "logged items"][index % 4];
  const c = ["expired items", "red folders", "late entries", "manual slips"][index % 4];
  return {
    id: setId,
    section: "dm",
    subtype: "dm-syllogisms",
    questionType: "yes-no",
    tags: ["text-stem", "medium"],
    title: "Decision Making Practice",
    leftTitle: "Syllogism",
    setId,
    stimulus: [
      `All ${a} are ${b}. No ${b} are ${c}. Some ${b} are stored in cabinet K.`,
      "Decide whether each conclusion must follow.",
    ],
    question: "Does each conclusion follow?",
    instruction: "Select Yes only if the conclusion must be true.",
    yesNoStatements: [
      { id: "s1", text: `No ${a} are ${c}.`, answer: "Yes" },
      { id: "s2", text: `Some items in cabinet K are ${b}.`, answer: "Yes" },
      { id: "s3", text: `All ${b} are ${a}.`, answer: "No" },
      { id: "s4", text: `Some ${c} are ${a}.`, answer: "No" },
      { id: "s5", text: `All items in cabinet K are ${a}.`, answer: "No" },
    ],
    explanation:
      "Only conclusions forced by the all/no/some relationships should be marked Yes.",
  };
}

function makeDmLogic(index: number): UCATQuestion {
  const first = 1 + (index % 7);
  const second = first * 2;
  const third = second + 5;
  const fourth = third - first;
  return single({
    id: `dm-round5-logic-${String(index + 1).padStart(3, "0")}`,
    section: "dm",
    subtype: "dm-logic",
    tags: ["multi-step", "hard", "time-consuming", "text-stem"],
    title: "Decision Making Practice",
    leftTitle: "Logic puzzle",
    stimulus: [
      "A four-number label follows three rules.",
      `The second number is twice the first. The third number is five more than the second. The fourth number is the third minus the first. The first number is ${first}.`,
    ],
    question: "Which label is correct?",
    correctText: `${first}-${second}-${third}-${fourth}`,
    distractors: [
      `${first}-${second}-${third}-${third + first}`,
      `${first}-${second + 1}-${third}-${fourth}`,
      `${second}-${first}-${third}-${fourth}`,
    ],
    explanation: `The numbers are ${first}, ${second}, ${third} and ${fourth}.`,
    seed: index,
  });
}

function makeDmArgument(index: number): UCATQuestion {
  const topics = [
    ["introducing quiet desks in a busy library", "it matches the purpose of the space while leaving other areas for discussion"],
    ["sending appointment reminders by text", "it can reduce missed slots without changing clinical decisions"],
    ["marking allergens more clearly in a cafe", "it directly supports safe choices for customers"],
    ["trialling numbered queues at an event", "it can reduce disputes while still allowing staff to help exceptions"],
  ] as const;
  const [topic, reason] = topics[index % topics.length];
  return single({
    id: `dm-round5-argument-${String(index + 1).padStart(3, "0")}`,
    section: "dm",
    subtype: "dm-arguments",
    tags: ["text-stem", "easy", "quick"],
    title: "Decision Making Practice",
    leftTitle: "Strongest argument",
    stimulus: [`A local group is considering ${topic}.`],
    question: "Which is the strongest argument in favour?",
    correctText: `Yes, because ${reason}.`,
    distractors: [
      "Yes, because every new system is automatically fair.",
      "No, because no policy can satisfy every person.",
      "Yes, because the group should never review its decisions.",
    ],
    explanation:
      "The strongest argument is relevant and proportionate, not absolute or off-topic.",
    seed: index,
  });
}

function makeDmYesNo(index: number): UCATQuestion {
  const setId = `dm-round5-yesno-${String(index + 1).padStart(3, "0")}`;
  const total = 160 + index * 2;
  const morning = 55 + (index % 18);
  const afternoon = 48 + (index % 16);
  const evening = total - morning - afternoon;
  return {
    id: setId,
    section: "dm",
    subtype: "dm-yes-no",
    questionType: "yes-no",
    tags: ["data-display", "set-based", "time-consuming"],
    title: "Decision Making Practice",
    leftTitle: "Booking data",
    setId,
    stimulus: [
      `${total} bookings were split between morning, afternoon and evening sessions. Morning had ${morning}; afternoon had ${afternoon}; the remainder were evening bookings.`,
    ],
    question: "Does each statement follow?",
    instruction: "Select Yes only if the statement is supported.",
    yesNoStatements: [
      { id: "s1", text: `Evening had ${evening} bookings.`, answer: "Yes" },
      { id: "s2", text: "Morning had more bookings than afternoon.", answer: morning > afternoon ? "Yes" : "No" },
      { id: "s3", text: "Evening was the largest session.", answer: evening > morning && evening > afternoon ? "Yes" : "No" },
      { id: "s4", text: "Morning and afternoon together made more than half the total.", answer: (morning + afternoon) * 2 > total ? "Yes" : "No" },
      { id: "s5", text: "The data explain why people chose each session.", answer: "No" },
    ],
    explanation:
      "The evening value is the remainder; other statements depend on direct comparison.",
  };
}

function makeDmVenn(index: number): UCATQuestion {
  const onlyOne = 9 + (index % 8);
  const onlyTwo = 6 + ((index * 2) % 7);
  const both = 5 + (index % 5);
  const neither = 4 + (index % 6);
  const total = onlyOne + onlyTwo + both + neither;
  return single({
    id: `dm-round5-venn-${String(index + 1).padStart(3, "0")}`,
    section: "dm",
    subtype: "dm-venn-sets",
    tags: ["data-display", "set-based", "medium"],
    title: "Decision Making Practice",
    leftTitle: "Set information",
    stimulus: [
      `Out of ${total} people, ${onlyOne} selected only A, ${onlyTwo} selected only B, ${both} selected both A and B, and ${neither} selected neither.`,
    ],
    question: "How many selected at least one of A or B?",
    correctText: String(onlyOne + onlyTwo + both),
    distractors: [String(onlyOne + both), String(onlyTwo + both), String(total)],
    explanation: `At least one = only A + only B + both = ${onlyOne + onlyTwo + both}.`,
    seed: index,
  });
}

function fraction(numerator: number, denominator: number) {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(numerator, denominator);
  return `${numerator / divisor}/${denominator / divisor}`;
}

function makeDmProbability(index: number): UCATQuestion {
  const a = 2 + (index % 6);
  const b = 5 + ((index * 3) % 7);
  const c = 3 + (index % 5);
  return single({
    id: `dm-round5-probability-${String(index + 1).padStart(3, "0")}`,
    section: "dm",
    subtype: "dm-probability-data",
    tags: ["text-stem", "easy"],
    title: "Decision Making Practice",
    leftTitle: "Probability",
    stimulus: [`A bag contains ${a} amber counters, ${b} black counters and ${c} cream counters. One counter is selected at random.`],
    question: "What is the probability of selecting a cream counter?",
    correctText: fraction(c, a + b + c),
    distractors: [fraction(a, a + b + c), fraction(c, a + c), fraction(b + c, a + b + c)],
    explanation: `There are ${c} cream counters out of ${a + b + c} counters.`,
    seed: index,
  });
}

export const ROUND_FIVE_DM_QUESTIONS: UCATQuestion[] = [
  ...range(33).map(makeDmSyllogism),
  ...range(33).map(makeDmLogic),
  ...range(27).map(makeDmArgument),
  ...range(27).map(makeDmYesNo),
  ...range(43).map(makeDmVenn),
  ...range(27).map(makeDmProbability),
];

function makeQrQuestion(index: number): UCATQuestion {
  const setIndex = Math.floor(index / 4);
  const questionIndex = index % 4;
  const setId = `qr-round5-set-${String(setIndex + 1).padStart(3, "0")}`;
  const labels = ["Zone A", "Zone B", "Zone C", "Zone D"];
  const rows = labels.map((label, row) => {
    const first = 35 + setIndex * 2 + row * 6;
    const second = first + 5 + row;
    const third = second + 4 + ((setIndex + row) % 5);
    return { label, first, second, third };
  });
  const visual: UCATChartVisual = {
    type: "table",
    title: "Weekly activity counts",
    headers: ["Zone", "Week 1", "Week 2", "Week 3"],
    rows: rows.map((row) => [row.label, String(row.first), String(row.second), String(row.third)]),
  };
  const picked = rows[setIndex % rows.length];
  const weekThreeTotal = rows.reduce((sum, row) => sum + row.third, 0);
  const weekTwoAverage = rows.reduce((sum, row) => sum + row.second, 0) / rows.length;
  const increase = picked.third - picked.first;
  const percent = (increase / picked.first) * 100;
  const common = {
    section: "qr" as const,
    title: "Quantitative Reasoning Practice",
    leftTitle: "Data table",
    setId,
    stimulus: ["The table shows activity counts recorded over three weeks."],
    visual,
  };

  if (questionIndex === 0) {
    return single({
      id: `${setId}-1`,
      ...common,
      subtype: "qr-graphs",
      tags: ["data-display", "set-based", "easy", "quick"],
      question: "What is the total count for Week 3?",
      correctText: String(weekThreeTotal),
      distractors: [String(weekThreeTotal - picked.third), String(weekThreeTotal + 4), String(rows.reduce((sum, row) => sum + row.second, 0))],
      explanation: `Adding the four Week 3 values gives ${weekThreeTotal}.`,
      seed: index,
    });
  }
  if (questionIndex === 1) {
    return single({
      id: `${setId}-2`,
      ...common,
      subtype: "qr-percentages",
      tags: ["data-display", "set-based", "medium"],
      question: `What was the percentage increase for ${picked.label} from Week 1 to Week 3?`,
      correctText: `${formatNumber(percent, 1)}%`,
      distractors: [`${formatNumber((increase / picked.third) * 100, 1)}%`, `${formatNumber(percent + 4, 1)}%`, `${formatNumber(Math.max(0, percent - 4), 1)}%`],
      explanation: `Increase = ${increase}; divide by Week 1 ${picked.first} and multiply by 100.`,
      seed: index,
    });
  }
  if (questionIndex === 2) {
    return single({
      id: `${setId}-3`,
      ...common,
      subtype: "qr-averages",
      tags: ["data-display", "set-based", "medium"],
      question: "What is the mean Week 2 count?",
      correctText: formatNumber(weekTwoAverage, 1),
      distractors: [formatNumber(weekTwoAverage + 3, 1), formatNumber(weekTwoAverage - 3, 1), formatNumber(weekThreeTotal / 4, 1)],
      explanation: `The Week 2 total divided by 4 is ${formatNumber(weekTwoAverage, 1)}.`,
      seed: index,
    });
  }
  return single({
    id: `${setId}-4`,
    ...common,
    subtype: setIndex % 2 === 0 ? "qr-rates-ratios" : "qr-units-geometry",
    tags: ["data-display", "set-based", "hard", "time-consuming", "calculator-heavy"],
    question: `If each count in ${picked.label} represents 12 minutes, how many minutes does Week 3 represent?`,
    correctText: String(picked.third * 12),
    distractors: [String(picked.second * 12), String(picked.third + 12), String(picked.third * 10)],
    explanation: `${picked.third} x 12 = ${picked.third * 12} minutes.`,
    seed: index,
  });
}

export const ROUND_FIVE_QR_QUESTIONS: UCATQuestion[] = range(200).map(makeQrQuestion);

const SJT_CONTEXTS = [
  ["A patient asks a student to explain a result before the doctor has reviewed it.", ["scope-of-practice", "communication"]],
  ["A student spots a label mismatch on a sample before it leaves the clinic.", ["patient-safety", "escalation"]],
  ["A peer wants to include a recognisable patient story in a presentation.", ["confidentiality", "integrity"]],
  ["A relative asks to speak for a patient who appears able to answer.", ["autonomy", "capacity-consent"]],
  ["A student hears another student making a dismissive joke about a patient.", ["respect-dignity", "teamwork"]],
  ["A ward is busy and a patient says they feel dizzy while standing.", ["patient-safety", "beneficence"]],
] as const satisfies ReadonlyArray<readonly [string, readonly UCATSjtIssueTag[]]>;

function makeSjtRating(index: number): UCATQuestion {
  const [scenario, issueTags] = SJT_CONTEXTS[index % SJT_CONTEXTS.length];
  const importance = index % 2 === 1;
  const answer = OPTION_KEYS[index % 4];
  const phrase =
    answer === "A"
      ? "raise the concern immediately through the correct staff route"
      : answer === "B"
        ? "ask the supervisor for advice before acting"
        : answer === "C"
          ? "wait to see whether anyone else notices"
          : "share the details casually outside the care team";
  return {
    id: `sjt-round5-rating-${String(index + 1).padStart(3, "0")}`,
    section: "sjt",
    subtype: importance ? "sjt-importance" : "sjt-appropriateness",
    tags: ["text-stem", "set-based", index % 6 === 0 ? "medium" : "quick"],
    issueTags: [...issueTags],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    setId: `sjt-round5-rating-set-${Math.floor(index / 4) + 1}`,
    stimulus: [scenario],
    question: importance
      ? `How important is it to consider whether you should ${phrase}?`
      : `How appropriate is it to ${phrase}?`,
    options: importance ? IMPORTANCE_OPTIONS : APPROPRIATENESS_OPTIONS,
    answer,
    explanation:
      "The rating depends on safety, confidentiality, consent, honesty and the limits of a student role.",
  };
}

function makeSjtDrag(index: number): UCATQuestion {
  const [scenario, issueTags] = SJT_CONTEXTS[index % SJT_CONTEXTS.length];
  const setId = `sjt-round5-drag-${String(index + 1).padStart(3, "0")}`;
  return {
    id: setId,
    section: "sjt",
    subtype: "sjt-drag-drop",
    questionType: "drag-category",
    tags: ["text-stem", "set-based", "multi-step"],
    issueTags: [...issueTags],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    setId,
    stimulus: [scenario],
    question: "Classify each response.",
    instruction: "Drag each response to appropriate or inappropriate.",
    categories: [
      { id: "appropriate", label: "Appropriate" },
      { id: "inappropriate", label: "Inappropriate" },
    ],
    categoryItems: [
      { id: "check", text: "Check the concern with an appropriate staff member.", answerCategory: "appropriate" },
      { id: "guess", text: "Guess the answer because it saves time.", answerCategory: "inappropriate" },
      { id: "respect", text: "Listen respectfully and stay within your role.", answerCategory: "appropriate" },
      { id: "gossip", text: "Discuss identifiable details with friends later.", answerCategory: "inappropriate" },
    ],
    explanation:
      "Appropriate responses use the team route and protect patients. Inappropriate responses risk safety, confidentiality or scope.",
  };
}

function makeSjtOrder(index: number): UCATQuestion {
  const [scenario, issueTags] = SJT_CONTEXTS[index % SJT_CONTEXTS.length];
  const setId = `sjt-round5-order-${String(index + 1).padStart(3, "0")}`;
  return {
    id: setId,
    section: "sjt",
    subtype: "sjt-drag-drop",
    questionType: "drag-order",
    tags: ["text-stem", "set-based", "multi-step"],
    issueTags: [...issueTags],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    setId,
    stimulus: [scenario],
    question: "Put the actions into the best order.",
    instruction: "Prioritise immediate safety and escalation before later reflection.",
    dragItems: [
      { id: "recognise", text: "Recognise the immediate risk or professional concern." },
      { id: "escalate", text: "Escalate to the relevant staff member promptly." },
      { id: "assist", text: "Assist within your role while the team responds." },
      { id: "learn", text: "Reflect afterwards and identify a prevention step." },
    ],
    answerOrder: ["recognise", "escalate", "assist", "learn"],
    explanation:
      "Immediate recognition and escalation come before support and later learning.",
  };
}

function makeSjtMostLeast(index: number): UCATQuestion {
  const [scenario, issueTags] = SJT_CONTEXTS[index % SJT_CONTEXTS.length];
  const setId = `sjt-round5-mostleast-${String(index + 1).padStart(3, "0")}`;
  return {
    id: setId,
    section: "sjt",
    subtype: "sjt-appropriateness",
    questionType: "most-least",
    tags: ["text-stem", "set-based", "multi-step"],
    issueTags: [...issueTags],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    setId,
    stimulus: [scenario],
    question: "Select the most appropriate and least appropriate actions.",
    instruction: "Choose one action for each slot.",
    actionItems: [
      { id: "staff", text: "Explain the concern clearly to the appropriate staff member." },
      { id: "listen", text: "Listen respectfully without promising something outside your role." },
      { id: "ignore", text: "Ignore the issue because the placement is busy." },
      { id: "share", text: "Share identifiable details in a private chat for advice." },
    ],
    answerSlots: { most: "staff", least: "share" },
    explanation:
      "The best action uses the proper route; sharing identifiable details outside the team is the least appropriate.",
  };
}

export const ROUND_FIVE_SJT_QUESTIONS: UCATQuestion[] = [
  ...range(202).map(makeSjtRating),
  ...range(67).map(makeSjtDrag),
  ...range(50).map(makeSjtOrder),
  ...range(51).map(makeSjtMostLeast),
];

export const ROUND_FIVE_VR_QUESTIONS: UCATQuestion[] = range(240).map(makeVrQuestion);
