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
  "detail",
  "false",
  "inference",
  "cant",
  "detail",
  "true",
  "author",
  "false",
  "summary",
  "cant",
  "negative",
  "detail",
  "true",
  "inference",
  "author",
  "false",
  "detail",
  "summary",
  "true",
  "cant",
  "inference",
  "negative",
  "detail",
  "false",
  "author",
  "true",
  "summary",
  "cant",
  "detail",
  "inference",
  "negative",
  "false",
  "author",
  "true",
  "detail",
  "summary",
  "cant",
  "inference",
  "detail",
  "author",
  "negative",
  "inference",
  "summary",
];

const VR_TOPICS = [
  [
    "community seed libraries",
    "seasonal borrowing cards",
    "returned seed packets",
    "unlabelled packet reports",
    "replace gardening advice",
  ],
  [
    "library study rooms",
    "half-hour release slots",
    "completed bookings",
    "unused reserved rooms",
    "close walk-in study areas",
  ],
  [
    "sports centre inductions",
    "colour-coded equipment tags",
    "safe setup checks",
    "staff call-outs",
    "remove supervision entirely",
  ],
  [
    "food waste collections",
    "street-level reminder cards",
    "correctly sorted bins",
    "missed collection notes",
    "fine every household",
  ],
  [
    "museum family trails",
    "short clue sheets",
    "finished trails",
    "requests for directions",
    "replace gallery assistants",
  ],
  [
    "bike repair sessions",
    "numbered intake slips",
    "repairs completed",
    "queue disputes",
    "guarantee same-day repairs",
  ],
  [
    "evening language clubs",
    "shared topic packs",
    "conversation tasks completed",
    "speaker drop-outs",
    "make attendance compulsory",
  ],
  [
    "archive reading days",
    "pre-ordered document trays",
    "documents viewed",
    "delayed retrievals",
    "remove archivist checks",
  ],
  [
    "community theatre rehearsals",
    "rotating prompt sheets",
    "scene run-throughs",
    "missed cue reports",
    "replace directors",
  ],
  [
    "neighbourhood tool shares",
    "return-time labels",
    "on-time returns",
    "missing accessory forms",
    "ban new borrowers",
  ],
  [
    "science fair stands",
    "setup checklists",
    "stands ready by opening",
    "power-socket queries",
    "cancel safety checks",
  ],
  [
    "digital inclusion clinics",
    "simple triage sheets",
    "resolved support requests",
    "repeat help-desk visits",
    "replace one-to-one support",
  ],
] as const;

function makeVrQuestion(index: number): UCATQuestion {
  const kind = VR_KIND_CYCLE[index % VR_KIND_CYCLE.length];
  const setIndex = Math.floor(index / 4);
  const [area, project, positiveMetric, negativeMetric, rejectedAim] =
    VR_TOPICS[setIndex % VR_TOPICS.length];
  const setId = `vr-round6-set-${String(setIndex + 1).padStart(3, "0")}`;
  const locations = 5 + (setIndex % 7);
  const before = 28 + ((setIndex * 7) % 31);
  const after = before + 6 + (setIndex % 8);
  const problemBefore = 24 + ((setIndex * 5) % 19);
  const problemAfter = problemBefore - (3 + (setIndex % 6));
  const stimulus = [
    `A review of ${area} examined ${project} across ${locations} sites. The organisers described the change as a way to make routines clearer, not to ${rejectedAim}.`,
    `Over six weeks, ${positiveMetric} rose from ${before} to ${after}. During the same period, ${negativeMetric} fell from ${problemBefore} to ${problemAfter}. Several staff members still asked for clearer exception guidance.`,
    "The review advised keeping the approach in the busiest sites, but said the written guidance should be revised before wider use.",
  ];
  const common = {
    id: `vr-round6-${String(index + 1).padStart(3, "0")}`,
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
          ? `${positiveMetric} increased during the review period.`
          : kind === "false"
            ? `The organisers said the project was designed to ${rejectedAim}.`
            : "The passage states that the revised approach cost less than the previous routine.",
      options: TFC_OPTIONS,
      answer,
      explanation:
        kind === "true"
          ? "The second paragraph states that this measure rose."
          : kind === "false"
            ? "The first paragraph says this was not the purpose of the change."
            : "No comparison of costs is given.",
    };
  }

  if (kind === "detail") {
    return single({
      ...common,
      subtype: "vr-detail",
      tags: ["detail-retrieval", "text-stem", "quick"],
      question: "Which detail is stated in the passage?",
      correctText: `${negativeMetric} fell from ${problemBefore} to ${problemAfter}.`,
      distractors: [
        `${positiveMetric} fell from ${after} to ${before}.`,
        "The approach was recommended for every site immediately.",
        "All staff said the written guidance was already clear.",
      ],
      explanation: `The passage states that ${negativeMetric} fell from ${problemBefore} to ${problemAfter}.`,
      seed: index,
    });
  }

  if (kind === "inference") {
    return single({
      ...common,
      subtype: "vr-inference",
      tags: ["inference-question", "text-stem", "medium"],
      question: "Which conclusion is best supported?",
      correctText: "The approach improved some measures, but the review did not treat it as ready for full expansion.",
      distractors: [
        "The approach failed because every recorded measure worsened.",
        "The review recommended abandoning the approach at busy sites.",
        "Staff concerns were mainly about the cost of the project.",
      ],
      explanation:
        "The measures improved, but wider use was conditional on revising the guidance.",
      seed: index,
    });
  }

  if (kind === "author") {
    return single({
      ...common,
      subtype: "vr-author",
      tags: ["author-opinion", "text-stem", "medium"],
      question: "Which description best captures the review's tone?",
      correctText: "Cautiously positive",
      distractors: ["Dismissive", "Uncritically enthusiastic", "Unable to identify any outcome"],
      explanation:
        "The review notes improvements and recommends limited continuation, but also sets a condition.",
      seed: index,
    });
  }

  if (kind === "negative") {
    return single({
      ...common,
      subtype: "vr-negative",
      tags: ["negative-except", "text-stem", "medium"],
      question: "Which statement is not supported by the passage?",
      correctText: "The review proved that the approach saved money.",
      distractors: [
        `${positiveMetric} rose during the review.`,
        `${negativeMetric} fell during the review.`,
        "Guidance revision was recommended before wider use.",
      ],
      explanation:
        "The passage does not provide cost data, so a saving cannot be concluded.",
      seed: index,
    });
  }

  return single({
    ...common,
    subtype: "vr-summary",
    tags: ["summary-structure", "text-stem", "medium"],
    question: "Which title best fits the passage?",
    correctText: `${project}: useful early results, but guidance still matters`,
    distractors: [
      `${area}: why all local schemes should stop`,
      `${project}: a cost-saving proof with no reservations`,
      `${area}: replacing staff judgement with fixed rules`,
    ],
    explanation:
      "The passage reports positive early outcomes and a conditional recommendation.",
    seed: index,
  });
}

function makeDmSyllogism(index: number): UCATQuestion {
  const setId = `dm-round6-syllogism-${String(index + 1).padStart(3, "0")}`;
  const a = ["green labels", "priority notes", "round stamps", "south tickets"][index % 4];
  const b = ["audited records", "approved files", "checked forms", "valid entries"][index % 4];
  const c = ["archived errors", "orange folders", "withdrawn slips", "uncoded items"][index % 4];
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
      `All ${a} are ${b}. No ${b} are ${c}. Some ${b} are stored in drawer M.`,
      "Decide whether each conclusion must follow.",
    ],
    question: "Does each conclusion follow?",
    instruction: "Select Yes only if the conclusion must be true.",
    yesNoStatements: [
      { id: "s1", text: `No ${a} are ${c}.`, answer: "Yes" },
      { id: "s2", text: `Some items in drawer M are ${b}.`, answer: "Yes" },
      { id: "s3", text: `All ${b} are ${a}.`, answer: "No" },
      { id: "s4", text: `Some ${c} are ${a}.`, answer: "No" },
      { id: "s5", text: `All items in drawer M are ${a}.`, answer: "No" },
    ],
    explanation:
      "Only the conclusions forced by the all, no and some statements should be marked Yes.",
  };
}

function makeDmLogic(index: number): UCATQuestion {
  const first = 2 + (index % 8);
  const second = first + 3;
  const third = second * 2;
  const fourth = third - first + 1;
  return single({
    id: `dm-round6-logic-${String(index + 1).padStart(3, "0")}`,
    section: "dm",
    subtype: "dm-logic",
    tags: ["multi-step", "hard", "time-consuming", "text-stem"],
    title: "Decision Making Practice",
    leftTitle: "Logic puzzle",
    stimulus: [
      "A four-part access code follows three rules.",
      `The second part is three more than the first. The third part is twice the second. The fourth part is one more than the third minus the first. The first part is ${first}.`,
    ],
    question: "Which access code is correct?",
    correctText: `${first}-${second}-${third}-${fourth}`,
    distractors: [
      `${first}-${second}-${third}-${third - first}`,
      `${first}-${second + 1}-${third}-${fourth}`,
      `${second}-${first}-${third}-${fourth}`,
    ],
    explanation: `The four parts are ${first}, ${second}, ${third} and ${fourth}.`,
    seed: index,
  });
}

function makeDmArgument(index: number): UCATQuestion {
  const topics = [
    [
      "offering earlier collection windows at a school uniform exchange",
      "it directly reduces crowding while keeping access open to all families",
    ],
    [
      "adding clearer shelf labels in a shared pantry",
      "it helps users find items without changing who is eligible to use the service",
    ],
    [
      "booking quiet practice rooms through a simple online form",
      "it gives fairer access to a limited resource and creates a record of demand",
    ],
    [
      "trialling reusable cups at a community event",
      "it targets waste from the event while allowing organisers to review uptake",
    ],
    [
      "sending reminder emails for volunteer training",
      "it can reduce missed sessions without forcing anyone to attend",
    ],
  ] as const;
  const [topic, reason] = topics[index % topics.length];
  return single({
    id: `dm-round6-argument-${String(index + 1).padStart(3, "0")}`,
    section: "dm",
    subtype: "dm-arguments",
    tags: ["text-stem", "easy", "quick"],
    title: "Decision Making Practice",
    leftTitle: "Strongest argument",
    stimulus: [`A committee is considering ${topic}.`],
    question: "Which is the strongest argument in favour?",
    correctText: `Yes, because ${reason}.`,
    distractors: [
      "Yes, because any new process is automatically better than an old one.",
      "No, because there will always be at least one person who dislikes change.",
      "Yes, because the committee should avoid measuring the result.",
    ],
    explanation:
      "The strongest argument is relevant, balanced and linked to the proposal's purpose.",
    seed: index,
  });
}

function makeDmYesNo(index: number): UCATQuestion {
  const setId = `dm-round6-yesno-${String(index + 1).padStart(3, "0")}`;
  const total = 180 + index * 3;
  const adult = 62 + (index % 21);
  const student = 49 + ((index * 2) % 19);
  const community = total - adult - student;
  return {
    id: setId,
    section: "dm",
    subtype: "dm-yes-no",
    questionType: "yes-no",
    tags: ["data-display", "set-based", "time-consuming"],
    title: "Decision Making Practice",
    leftTitle: "Ticket data",
    setId,
    stimulus: [
      `${total} tickets were issued as adult, student or community tickets. Adult tickets totalled ${adult}; student tickets totalled ${student}; all remaining tickets were community tickets.`,
    ],
    question: "Does each statement follow?",
    instruction: "Select Yes only if the statement is supported.",
    yesNoStatements: [
      { id: "s1", text: `There were ${community} community tickets.`, answer: "Yes" },
      { id: "s2", text: "Adult tickets outnumbered student tickets.", answer: adult > student ? "Yes" : "No" },
      { id: "s3", text: "Community tickets formed the largest category.", answer: community > adult && community > student ? "Yes" : "No" },
      { id: "s4", text: "Adult and student tickets together were more than half of all tickets.", answer: (adult + student) * 2 > total ? "Yes" : "No" },
      { id: "s5", text: "The figures show why people chose each ticket type.", answer: "No" },
    ],
    explanation:
      "The community figure is the remainder; the other supported statements require direct comparison only.",
  };
}

function makeDmVenn(index: number): UCATQuestion {
  const onlyAlpha = 8 + (index % 9);
  const onlyBeta = 7 + ((index * 3) % 8);
  const both = 4 + (index % 6);
  const neither = 5 + ((index * 2) % 7);
  const total = onlyAlpha + onlyBeta + both + neither;
  return single({
    id: `dm-round6-venn-${String(index + 1).padStart(3, "0")}`,
    section: "dm",
    subtype: "dm-venn-sets",
    tags: ["data-display", "set-based", "medium"],
    title: "Decision Making Practice",
    leftTitle: "Set information",
    stimulus: [
      `In a group of ${total} participants, ${onlyAlpha} chose only workshop A, ${onlyBeta} chose only workshop B, ${both} chose both workshops, and ${neither} chose neither workshop.`,
    ],
    question: "How many participants chose exactly one workshop?",
    correctText: String(onlyAlpha + onlyBeta),
    distractors: [String(onlyAlpha + onlyBeta + both), String(both), String(total - neither)],
    explanation: `Exactly one workshop = only A + only B = ${onlyAlpha + onlyBeta}.`,
    seed: index,
  });
}

function fraction(numerator: number, denominator: number) {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(numerator, denominator);
  return `${numerator / divisor}/${denominator / divisor}`;
}

function makeDmProbability(index: number): UCATQuestion {
  const blue = 3 + (index % 7);
  const green = 4 + ((index * 2) % 8);
  const white = 2 + ((index * 3) % 6);
  const total = blue + green + white;
  return single({
    id: `dm-round6-probability-${String(index + 1).padStart(3, "0")}`,
    section: "dm",
    subtype: "dm-probability-data",
    tags: ["text-stem", "easy"],
    title: "Decision Making Practice",
    leftTitle: "Probability",
    stimulus: [
      `A box contains ${blue} blue counters, ${green} green counters and ${white} white counters. One counter is selected at random.`,
    ],
    question: "What is the probability of selecting a green counter?",
    correctText: fraction(green, total),
    distractors: [fraction(blue, total), fraction(green, blue + green), fraction(green + white, total)],
    explanation: `There are ${green} green counters out of ${total} counters.`,
    seed: index,
  });
}

export const ROUND_SIX_DM_QUESTIONS: UCATQuestion[] = [
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
  const setId = `qr-round6-set-${String(setIndex + 1).padStart(3, "0")}`;
  const labels = ["Hub A", "Hub B", "Hub C", "Hub D"];
  const rows = labels.map((label, row) => {
    const april = 38 + setIndex * 3 + row * 8;
    const may = april + 4 + ((setIndex + row) % 5);
    const june = may + 6 + ((setIndex * 2 + row) % 6);
    return { label, april, may, june };
  });
  const visual: UCATChartVisual = {
    type: "table",
    title: "Monthly task completions",
    headers: ["Hub", "April", "May", "June"],
    rows: rows.map((row) => [row.label, String(row.april), String(row.may), String(row.june)]),
  };
  const picked = rows[setIndex % rows.length];
  const juneTotal = rows.reduce((sum, row) => sum + row.june, 0);
  const aprilTotal = rows.reduce((sum, row) => sum + row.april, 0);
  const mayAverage = rows.reduce((sum, row) => sum + row.may, 0) / rows.length;
  const costPerTask = 6 + (setIndex % 7);
  const percentIncrease = ((picked.june - picked.april) / picked.april) * 100;
  const common = {
    id: `qr-round6-${String(index + 1).padStart(3, "0")}`,
    section: "qr" as const,
    title: "Quantitative Reasoning Practice",
    leftTitle: "Data",
    setId,
    visual,
    stimulus: [
      "The table shows the number of tasks completed by four hubs over three months.",
      `Each June task costs GBP ${costPerTask} to process.`,
    ],
  };

  if (questionIndex === 0) {
    return single({
      ...common,
      subtype: "qr-graphs",
      tags: ["data-display", "set-based", "easy", "quick"],
      question: "What was the total number of tasks completed in June?",
      correctText: String(juneTotal),
      distractors: [String(aprilTotal), String(juneTotal - picked.june), String(juneTotal + rows.length)],
      explanation: `Add the June values for all four hubs: ${juneTotal}.`,
      seed: index,
    });
  }

  if (questionIndex === 1) {
    return single({
      ...common,
      subtype: "qr-percentages",
      tags: ["data-display", "set-based", "medium"],
      question: `By what percentage did ${picked.label}'s completions increase from April to June?`,
      correctText: `${formatNumber(percentIncrease)}%`,
      distractors: [
        `${formatNumber(((picked.june - picked.may) / picked.may) * 100)}%`,
        `${formatNumber(((picked.june - picked.april) / picked.june) * 100)}%`,
        `${formatNumber(picked.june - picked.april)}%`,
      ],
      explanation: `Increase = ${picked.june - picked.april}; divide by April's ${picked.april}.`,
      seed: index,
    });
  }

  if (questionIndex === 2) {
    return single({
      ...common,
      subtype: "qr-averages",
      tags: ["data-display", "set-based", "medium"],
      question: "What was the mean number of tasks completed per hub in May?",
      correctText: formatNumber(mayAverage),
      distractors: [
        formatNumber(juneTotal / rows.length),
        formatNumber(aprilTotal / rows.length),
        formatNumber(rows.reduce((sum, row) => sum + row.may, 0)),
      ],
      explanation: `The May total is ${rows.reduce((sum, row) => sum + row.may, 0)}, and ${rows.length} hubs gives a mean of ${formatNumber(mayAverage)}.`,
      seed: index,
    });
  }

  return single({
    ...common,
    subtype: "qr-rates-ratios",
    tags: ["data-display", "set-based", "hard", "calculator-heavy", "time-consuming"],
    question: "What was the total processing cost for all June tasks?",
    correctText: `GBP ${formatNumber(juneTotal * costPerTask, 2)}`,
    distractors: [
      `GBP ${formatNumber(aprilTotal * costPerTask, 2)}`,
      `GBP ${formatNumber(juneTotal + costPerTask, 2)}`,
      `GBP ${formatNumber(picked.june * costPerTask, 2)}`,
    ],
    explanation: `June total ${juneTotal} multiplied by GBP ${costPerTask} gives GBP ${formatNumber(juneTotal * costPerTask, 2)}.`,
    seed: index,
  });
}

export const ROUND_SIX_QR_QUESTIONS: UCATQuestion[] = range(200).map(makeQrQuestion);

const SJT_CONTEXTS = [
  [
    "During a ward round, a patient asks a student to explain a medication change before the doctor has discussed it with them.",
    ["scope-of-practice", "communication"],
  ],
  [
    "A student notices that a patient's allergy band is missing while observations are being recorded.",
    ["patient-safety", "escalation"],
  ],
  [
    "A peer suggests using a recognisable patient anecdote in a teaching slide without asking permission.",
    ["confidentiality", "integrity"],
  ],
  [
    "A patient appears unsure about a procedure but a relative keeps answering questions on their behalf.",
    ["autonomy", "capacity-consent"],
  ],
  [
    "A healthcare assistant is spoken to rudely by a student in front of patients.",
    ["respect-dignity", "teamwork"],
  ],
  [
    "A student realises they recorded a blood pressure under the wrong patient name.",
    ["candour", "patient-safety"],
  ],
  [
    "A patient says they do not want their diagnosis discussed while visitors are nearby.",
    ["confidentiality", "respect-dignity"],
  ],
  [
    "A student is asked to perform a task they have only watched once and do not feel competent to do.",
    ["scope-of-practice", "non-maleficence"],
  ],
] as const satisfies ReadonlyArray<readonly [string, readonly UCATSjtIssueTag[]]>;

const APPROPRIATENESS_ACTIONS = [
  ["pause and alert the supervising clinician immediately", "A"],
  ["ask a supervisor for advice before giving an answer", "B"],
  ["leave the matter until the end of the shift without telling anyone", "C"],
  ["share identifiable details in a group chat to get a quick answer", "D"],
] as const satisfies ReadonlyArray<readonly [string, UCATOptionKey]>;

const IMPORTANCE_CONSIDERATIONS = [
  ["whether there is an immediate risk to patient safety", "A"],
  ["whether the patient has been given clear and respectful information", "B"],
  ["whether the student will finish their paperwork slightly earlier", "C"],
  ["whether avoiding an awkward conversation would be more comfortable for the student", "D"],
] as const satisfies ReadonlyArray<readonly [string, UCATOptionKey]>;

function makeSjtRating(index: number): UCATQuestion {
  const [scenario, issueTags] = SJT_CONTEXTS[index % SJT_CONTEXTS.length];
  const importance = index % 2 === 1;
  const item = importance
    ? IMPORTANCE_CONSIDERATIONS[index % IMPORTANCE_CONSIDERATIONS.length]
    : APPROPRIATENESS_ACTIONS[index % APPROPRIATENESS_ACTIONS.length];
  const [text, answer] = item;
  return {
    id: `sjt-round6-rating-${String(index + 1).padStart(3, "0")}`,
    section: "sjt",
    subtype: importance ? "sjt-importance" : "sjt-appropriateness",
    tags: ["text-stem", "set-based", index % 7 === 0 ? "medium" : "quick"],
    issueTags: [...issueTags],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    setId: `sjt-round6-rating-set-${Math.floor(index / 4) + 1}`,
    stimulus: [scenario],
    question: importance
      ? `How important is this consideration: ${text}?`
      : `How appropriate is it to ${text}?`,
    options: importance ? IMPORTANCE_OPTIONS : APPROPRIATENESS_OPTIONS,
    answer,
    explanation:
      "The best rating depends on patient safety, confidentiality, honesty, respect and the limits of a student role.",
  };
}

function makeSjtDrag(index: number): UCATQuestion {
  const [scenario, issueTags] = SJT_CONTEXTS[index % SJT_CONTEXTS.length];
  const setId = `sjt-round6-drag-${String(index + 1).padStart(3, "0")}`;
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
      { id: "escalate", text: "Escalate the concern to the relevant member of staff.", answerCategory: "appropriate" },
      { id: "clarify", text: "Check what you are allowed to do before acting.", answerCategory: "appropriate" },
      { id: "ignore", text: "Ignore the issue because the team is busy.", answerCategory: "inappropriate" },
      { id: "share", text: "Discuss identifiable details with friends for advice.", answerCategory: "inappropriate" },
    ],
    explanation:
      "Appropriate responses protect patients and use the team route. Inappropriate responses risk safety, confidentiality or honesty.",
  };
}

function makeSjtOrder(index: number): UCATQuestion {
  const [scenario, issueTags] = SJT_CONTEXTS[index % SJT_CONTEXTS.length];
  const setId = `sjt-round6-order-${String(index + 1).padStart(3, "0")}`;
  return {
    id: setId,
    section: "sjt",
    subtype: "sjt-ordering",
    questionType: "drag-order",
    tags: ["text-stem", "set-based", "multi-step"],
    issueTags: [...issueTags],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    setId,
    stimulus: [scenario],
    question: "Put the actions into the best order.",
    instruction: "Prioritise immediate risk, then communication, then follow-up.",
    dragItems: [
      { id: "notice", text: "Recognise the immediate safety or professional concern." },
      { id: "escalate", text: "Tell the appropriate staff member promptly." },
      { id: "support", text: "Support the patient or team within your competence." },
      { id: "record", text: "Document or reflect afterwards as advised." },
    ],
    answerOrder: ["notice", "escalate", "support", "record"],
    explanation:
      "Immediate recognition and escalation come before support within role and later documentation or reflection.",
  };
}

function makeSjtMostLeast(index: number): UCATQuestion {
  const [scenario, issueTags] = SJT_CONTEXTS[index % SJT_CONTEXTS.length];
  const setId = `sjt-round6-mostleast-${String(index + 1).padStart(3, "0")}`;
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
      { id: "supervisor", text: "Explain the concern clearly to the supervising clinician or appropriate staff member." },
      { id: "patient", text: "Listen respectfully and avoid promising anything outside your role." },
      { id: "delay", text: "Delay mentioning the issue because it may make the shift slower." },
      { id: "message", text: "Send identifiable patient details to friends to ask what they would do." },
    ],
    answerSlots: { most: "supervisor", least: "message" },
    explanation:
      "The best action uses the correct professional route; sharing identifiable details outside the team is least appropriate.",
  };
}

export const ROUND_SIX_SJT_QUESTIONS: UCATQuestion[] = [
  ...range(202).map(makeSjtRating),
  ...range(67).map(makeSjtDrag),
  ...range(50).map(makeSjtOrder),
  ...range(51).map(makeSjtMostLeast),
];

export const ROUND_SIX_VR_QUESTIONS: UCATQuestion[] = range(240).map(makeVrQuestion);
