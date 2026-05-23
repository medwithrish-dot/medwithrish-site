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

function formatWhole(value: number) {
  return value.toLocaleString("en-GB", { maximumFractionDigits: 0 });
}

function formatNumber(value: number, decimals = 1) {
  if (Number.isInteger(value)) return formatWhole(value);
  return value.toLocaleString("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function makeOptions(correctText: string, distractors: string[], seed: number) {
  const uniqueDistractors = distractors.filter(
    (text, index) => text !== correctText && distractors.indexOf(text) === index
  );
  const texts = uniqueDistractors.slice(0, 3);
  while (texts.length < 3) {
    texts.push("Cannot be determined from the information given");
  }

  const answerIndex = seed % 4;
  texts.splice(answerIndex, 0, correctText);

  return {
    options: texts.map((text, index) => ({ key: OPTION_KEYS[index], text })),
    answer: OPTION_KEYS[answerIndex],
  };
}

function makeSingleQuestion(input: {
  id: string;
  section: UCATSection;
  subtype: UCATSubtypeId;
  setId?: string;
  tags: UCATQuestionTag[];
  title: string;
  leftTitle: string;
  stimulus: string[];
  visual?: UCATChartVisual;
  issueTags?: UCATSjtIssueTag[];
  question: string;
  correctText: string;
  distractors: string[];
  explanation: string;
  seed: number;
}): UCATQuestion {
  const { options, answer } = makeOptions(
    input.correctText,
    input.distractors,
    input.seed
  );

  return {
    id: input.id,
    section: input.section,
    subtype: input.subtype,
    setId: input.setId,
    tags: input.tags,
    title: input.title,
    leftTitle: input.leftTitle,
    stimulus: input.stimulus,
    visual: input.visual,
    issueTags: input.issueTags,
    question: input.question,
    options,
    answer,
    explanation: input.explanation,
  };
}

function range(length: number) {
  return Array.from({ length }, (_, index) => index);
}

type VrQuestionKind =
  | "tfc-true"
  | "tfc-false"
  | "tfc-cant"
  | "detail"
  | "inference"
  | "author"
  | "negative"
  | "summary";

const VR_PATTERNS: VrQuestionKind[][] = [
  ["tfc-true", "tfc-false", "detail", "inference"],
  ["tfc-cant", "detail", "author", "negative"],
  ["tfc-true", "tfc-false", "detail", "summary"],
  ["tfc-cant", "detail", "inference", "negative"],
  ["tfc-true", "tfc-false", "author", "summary"],
  ["tfc-cant", "detail", "inference", "summary"],
];

const VR_CONTEXTS = [
  ["coastal buses", "later ferry links", "journey reliability", "missed connections", "replace all ticket offices"],
  ["museum workshops", "family weekend sessions", "repeat visits", "unused booking slots", "turn the museum into a school"],
  ["library lockers", "evening reservation pickup", "collection speed", "staff queries", "remove librarians from branches"],
  ["community gardens", "tool-sharing sheds", "plot attendance", "lost equipment reports", "privatise the allotments"],
  ["sports centres", "off-peak swim passes", "pool attendance", "queue length", "close the gym halls"],
  ["rail station kiosks", "platform guidance screens", "boarding confidence", "wrong-platform reports", "replace all announcements"],
  ["theatre matinees", "low-cost preview tickets", "new audience bookings", "empty seats", "cancel evening performances"],
  ["college kitchens", "shared breakfast clubs", "morning attendance", "food waste", "replace tutor meetings"],
  ["park rangers", "guided walking maps", "route completion", "lost visitor calls", "remove ranger patrols"],
  ["cycle hubs", "repair stands", "commuter cycling", "abandoned bikes", "make helmets compulsory"],
  ["market halls", "shared card terminals", "stall sales", "payment delays", "ban cash payments"],
  ["music schools", "loaned practice rooms", "student practice hours", "room clashes", "replace individual lessons"],
  ["recycling centres", "clearer lane signs", "correct sorting", "turnaround time", "stop staff checks"],
  ["town archives", "digitised appointment slots", "researcher visits", "missed appointments", "dispose of paper records"],
  ["wildlife parks", "timed feeding talks", "visitor dwell time", "crowding complaints", "remove keeper talks"],
  ["language clubs", "paired conversation hours", "member retention", "late cancellations", "replace formal classes"],
  ["youth theatres", "short rehearsal blocks", "attendance", "script return delays", "make every role audition-only"],
  ["mobile clinics", "text reminders", "arrival punctuality", "missed calls", "replace reception staff"],
  ["book festivals", "reserved signing queues", "ticket holder satisfaction", "queue disputes", "remove author interviews"],
  ["art studios", "shared materials shelves", "completed projects", "missing supplies", "charge every visitor a deposit"],
  ["outdoor cinemas", "weather update messages", "ticket use", "refund queries", "cancel all cloudy screenings"],
  ["food banks", "appointment windows", "parcel collection", "duplicate visits", "replace volunteer judgement"],
  ["harbour tours", "numbered boarding groups", "on-time departures", "boarding disputes", "remove safety briefings"],
  ["student unions", "quiet study zones", "desk availability", "noise complaints", "ban group study"],
] as const;

function makeVrSet(setIndex: number): UCATQuestion[] {
  const [domain, project, primaryMetric, secondaryMetric, rejectedAim] =
    VR_CONTEXTS[setIndex % VR_CONTEXTS.length];
  const setId = `vr-round4-set-${String(setIndex + 1).padStart(3, "0")}`;
  const siteCount = 3 + (setIndex % 7);
  const months = 2 + (setIndex % 4);
  const before = 38 + ((setIndex * 7) % 31);
  const after = before + 9 + (setIndex % 8);
  const secondaryBefore = 18 + ((setIndex * 5) % 19);
  const secondaryAfter = Math.max(5, secondaryBefore - (3 + (setIndex % 6)));
  const issue =
    setIndex % 2 === 0
      ? "staff said the first week needed clearer instructions"
      : "users said the booking page needed simpler wording";
  const recommendation =
    setIndex % 3 === 0
      ? "extend the trial for one term before making it permanent"
      : setIndex % 3 === 1
        ? "keep the service only if the support material was improved"
        : "continue the project at the busiest sites while reviewing quieter ones";
  const stimulus = [
    `A six-month trial in ${domain} tested ${project} across ${siteCount} sites. Managers said the project was intended to improve access and planning, not to ${rejectedAim}.`,
    `During the first ${months} months, ${primaryMetric} rose from ${before} to ${after} per week, while ${secondaryMetric} fell from ${secondaryBefore} to ${secondaryAfter}. However, ${issue}.`,
    `The review described the results as useful but incomplete. It recommended that the organisers ${recommendation}.`,
  ];
  const patterns = VR_PATTERNS[setIndex % VR_PATTERNS.length];

  return patterns.map((kind, questionIndex) =>
    makeVrQuestion({
      kind,
      setId,
      id: `${setId}-${questionIndex + 1}`,
      seed: setIndex * 4 + questionIndex,
      stimulus,
      domain,
      project,
      primaryMetric,
      secondaryMetric,
      rejectedAim,
      siteCount,
      before,
      after,
      secondaryBefore,
      secondaryAfter,
      recommendation,
    })
  );
}

function makeVrQuestion(input: {
  kind: VrQuestionKind;
  setId: string;
  id: string;
  seed: number;
  stimulus: string[];
  domain: string;
  project: string;
  primaryMetric: string;
  secondaryMetric: string;
  rejectedAim: string;
  siteCount: number;
  before: number;
  after: number;
  secondaryBefore: number;
  secondaryAfter: number;
  recommendation: string;
}): UCATQuestion {
  const common = {
    section: "vr" as const,
    setId: input.setId,
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: input.stimulus,
  };

  if (input.kind.startsWith("tfc")) {
    const answer =
      input.kind === "tfc-true"
        ? ("A" as UCATOptionKey)
        : input.kind === "tfc-false"
          ? ("B" as UCATOptionKey)
          : ("C" as UCATOptionKey);
    const question =
      input.kind === "tfc-true"
        ? `The trial covered ${input.siteCount} sites.`
        : input.kind === "tfc-false"
          ? `Managers said the project was designed to ${input.rejectedAim}.`
          : "The passage states that the project reduced the total annual cost of the service.";
    const explanation =
      input.kind === "tfc-true"
        ? "The site count is stated directly in the opening sentence."
        : input.kind === "tfc-false"
          ? "The passage says this was not the aim of the project."
          : "Costs are not reported, so the statement cannot be confirmed or rejected.";

    return {
      id: input.id,
      ...common,
      subtype: "vr-tfc",
      tags: ["true-false-cant-tell", "text-stem", "quick"],
      question,
      options: TFC_OPTIONS,
      answer,
      explanation,
    };
  }

  if (input.kind === "detail") {
    return makeSingleQuestion({
      id: input.id,
      ...common,
      subtype: "vr-detail",
      tags: ["detail-retrieval", "text-stem", "quick", "easy"],
      question: "Which measure improved during the early part of the trial?",
      correctText: `${input.primaryMetric} rose from ${input.before} to ${input.after} per week.`,
      distractors: [
        `${input.secondaryMetric} rose from ${input.secondaryBefore} to ${input.secondaryAfter}.`,
        "The review found no measurable change in any area.",
        "The number of trial sites doubled during the first month.",
      ],
      explanation: `The passage says ${input.primaryMetric} rose from ${input.before} to ${input.after} per week.`,
      seed: input.seed,
    });
  }

  if (input.kind === "inference") {
    return makeSingleQuestion({
      id: input.id,
      ...common,
      subtype: "vr-inference",
      tags: ["inference-question", "text-stem", "medium"],
      question: "Which conclusion is best supported by the passage?",
      correctText:
        "The trial produced useful gains, but the review did not treat it as ready for unrestricted rollout.",
      distractors: [
        "The trial failed because every measured outcome got worse.",
        "The organisers had already decided to make the trial permanent everywhere.",
        "The project was mainly intended to reduce staffing levels.",
      ],
      explanation:
        "The review called the results useful but incomplete and recommended a conditional next step.",
      seed: input.seed,
    });
  }

  if (input.kind === "author") {
    return makeSingleQuestion({
      id: input.id,
      ...common,
      subtype: "vr-author",
      tags: ["author-opinion", "text-stem", "medium"],
      question: "Which phrase best describes the review's attitude?",
      correctText: "Cautiously positive",
      distractors: [
        "Openly dismissive",
        "Entirely neutral about all outcomes",
        "Certain that the project should replace existing services immediately",
      ],
      explanation:
        "The review recognises useful results but also says the evidence is incomplete.",
      seed: input.seed,
    });
  }

  if (input.kind === "negative") {
    return makeSingleQuestion({
      id: input.id,
      ...common,
      subtype: "vr-negative",
      tags: ["negative-except", "text-stem", "medium"],
      question: "Which statement is not supported by the passage?",
      correctText: "The project removed the need for staff involvement.",
      distractors: [
        `The trial involved ${input.domain}.`,
        `The review recommended that organisers ${input.recommendation}.`,
        `${input.secondaryMetric} decreased during the first part of the trial.`,
      ],
      explanation:
        "The passage mentions staff or user concerns and does not say staff involvement was removed.",
      seed: input.seed,
    });
  }

  return makeSingleQuestion({
    id: input.id,
    ...common,
    subtype: "vr-summary",
    tags: ["summary-structure", "text-stem", "medium"],
    question: "Which title best fits the passage?",
    correctText: `${input.project}: useful early results with conditions`,
    distractors: [
      `${input.project}: why all existing support should end`,
      `${input.domain}: a trial with no measurable outcomes`,
      `${input.domain}: a review of national funding law`,
    ],
    explanation:
      "The passage focuses on a trial that improved some measures but still needed conditions or review.",
    seed: input.seed,
  });
}

export const ROUND_FOUR_VR_QUESTIONS: UCATQuestion[] = range(60).flatMap(
  makeVrSet
);

const DM_CONTEXTS = [
  ["artists", "cardholders", "evening members", "studio users"],
  ["gardeners", "tool borrowers", "weekend volunteers", "shed users"],
  ["drivers", "permit holders", "electric-van users", "route planners"],
  ["students", "lab members", "project leaders", "library users"],
  ["nurses", "training attendees", "shift coordinators", "clinic observers"],
  ["bakers", "market traders", "card-terminal users", "stall holders"],
  ["runners", "club members", "relay entrants", "track users"],
  ["readers", "archive visitors", "appointment holders", "document users"],
] as const;

function makeDmSyllogism(index: number): UCATQuestion {
  const [a, b, c, d] = DM_CONTEXTS[index % DM_CONTEXTS.length];
  const setId = `dm-round4-syllogism-${String(index + 1).padStart(3, "0")}`;

  return {
    id: setId,
    section: "dm",
    subtype: "dm-syllogisms",
    questionType: "yes-no",
    tags: ["text-stem", index % 3 === 0 ? "medium" : "easy"],
    title: "Decision Making Practice",
    leftTitle: "Syllogism",
    setId,
    stimulus: [
      `All ${a} are ${b}. No ${b} are ${c}. Some ${a} are ${d}.`,
      "For each conclusion, decide whether it must follow from the statements.",
    ],
    question: "Does each conclusion follow?",
    instruction: "Select Yes only when the conclusion must be true.",
    yesNoStatements: [
      { id: "s1", text: `All ${a} are ${b}.`, answer: "Yes" },
      { id: "s2", text: `No ${a} are ${c}.`, answer: "Yes" },
      { id: "s3", text: `Some ${d} are ${b}.`, answer: "Yes" },
      { id: "s4", text: `All ${b} are ${a}.`, answer: "No" },
      { id: "s5", text: `Some ${c} are ${a}.`, answer: "No" },
    ],
    explanation:
      "The conclusions that follow preserve the all/no/some relationships. The reverse of an all statement does not have to follow.",
  };
}

function makeDmLogic(index: number): UCATQuestion {
  const setId = `dm-round4-logic-${String(index + 1).padStart(3, "0")}`;
  const first = 2 + (index % 5);
  const second = first + 3;
  const third = second * 2 - 1;
  const fourth = third + first;
  const code = `${first}${second}${third}${fourth}`;

  return makeSingleQuestion({
    id: setId,
    section: "dm",
    subtype: "dm-logic",
    setId,
    tags: ["multi-step", "hard", "time-consuming", "text-stem"],
    title: "Decision Making Practice",
    leftTitle: "Logic puzzle",
    stimulus: [
      "A four-part access code follows these rules.",
      `The first number is ${first}. The second number is three more than the first. The third number is one less than twice the second. The fourth number is the sum of the first and third.`,
    ],
    question: "Which access code satisfies all the rules?",
    correctText: code,
    distractors: [
      `${first}${second}${third}${third + second}`,
      `${first}${second}${third + 1}${fourth}`,
      `${second}${first}${third}${fourth}`,
    ],
    explanation: `${first}, ${second}, ${third}, ${fourth} follows each rule in order.`,
    seed: index,
  });
}

const ARGUMENT_TOPICS = [
  ["a library keeping quiet carriages during exam week", "it protects a clear study need while still leaving other areas for conversation"],
  ["a clinic using appointment reminders", "missed appointments affect other patients and reminders are a proportionate way to reduce them"],
  ["a sports centre adding beginner-only lanes", "separate beginner space can improve safety without stopping faster swimmers"],
  ["a college publishing room-booking rules", "shared rooms work best when expectations are clear and applied consistently"],
  ["a bus service trialling contactless-only express boarding", "a trial can test speed while alternative payment routes remain available"],
  ["a museum limiting flash photography", "protecting exhibits and visitor comfort is directly relevant to the setting"],
] as const;

function makeDmArgument(index: number): UCATQuestion {
  const [topic, reason] = ARGUMENT_TOPICS[index % ARGUMENT_TOPICS.length];

  return makeSingleQuestion({
    id: `dm-round4-argument-${String(index + 1).padStart(3, "0")}`,
    section: "dm",
    subtype: "dm-arguments",
    tags: ["text-stem", "easy", "quick"],
    title: "Decision Making Practice",
    leftTitle: "Strongest argument",
    stimulus: [`A committee is deciding whether to support ${topic}.`],
    question: "Which is the strongest argument in favour?",
    correctText: `Yes, because ${reason}.`,
    distractors: [
      "Yes, because any new rule is always better than an old one.",
      "No, because some people dislike changes even when they are explained.",
      "Yes, because the committee should copy every policy used elsewhere.",
    ],
    explanation:
      "The strongest argument is specific, relevant and balanced rather than absolute or off-topic.",
    seed: index,
  });
}

function makeDmYesNo(index: number): UCATQuestion {
  const setId = `dm-round4-yesno-${String(index + 1).padStart(3, "0")}`;
  const total = 120 + index * 3;
  const online = 45 + (index % 20);
  const paper = 30 + (index % 15);
  const phone = total - online - paper;

  return {
    id: setId,
    section: "dm",
    subtype: "dm-yes-no",
    questionType: "yes-no",
    tags: ["data-display", "set-based", "time-consuming"],
    title: "Decision Making Practice",
    leftTitle: "Survey",
    setId,
    stimulus: [
      `A survey recorded ${total} bookings. ${online} were made online, ${paper} were made on paper forms and the rest were made by phone.`,
      "For each statement, decide whether it follows from the information.",
    ],
    question: "Does each statement follow?",
    instruction: "Select Yes only when the statement is supported by the data.",
    yesNoStatements: [
      { id: "s1", text: `${phone} bookings were made by phone.`, answer: "Yes" },
      { id: "s2", text: "More bookings were made online than on paper forms.", answer: "Yes" },
      { id: "s3", text: "Phone bookings were the smallest category.", answer: phone < online && phone < paper ? "Yes" : "No" },
      { id: "s4", text: "At least half of all bookings were made online.", answer: online * 2 >= total ? "Yes" : "No" },
      { id: "s5", text: "The survey explains why people chose each booking method.", answer: "No" },
    ],
    explanation:
      "Phone bookings are the remainder. The other supported statements follow from comparing the three counts.",
  };
}

function makeDmVenn(index: number): UCATQuestion {
  const onlyA = 8 + (index % 9);
  const onlyB = 7 + ((index * 2) % 8);
  const both = 4 + (index % 6);
  const neither = 5 + ((index * 3) % 7);
  const total = onlyA + onlyB + both + neither;
  const choseA = onlyA + both;

  return makeSingleQuestion({
    id: `dm-round4-venn-${String(index + 1).padStart(3, "0")}`,
    section: "dm",
    subtype: "dm-venn-sets",
    tags: ["data-display", "set-based", index % 4 === 0 ? "hard" : "medium"],
    title: "Decision Making Practice",
    leftTitle: "Set information",
    stimulus: [
      `In a group of ${total} people, ${onlyA} chose only the workshop, ${onlyB} chose only the talk, ${both} chose both, and ${neither} chose neither.`,
    ],
    question: "How many people chose the workshop?",
    correctText: String(choseA),
    distractors: [String(onlyA), String(onlyA + onlyB), String(total - neither)],
    explanation: `Workshop total = workshop only ${onlyA} + both ${both} = ${choseA}.`,
    seed: index,
  });
}

function simplifyFraction(numerator: number, denominator: number) {
  function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
  }
  const divisor = gcd(numerator, denominator);
  return `${numerator / divisor}/${denominator / divisor}`;
}

function makeDmProbability(index: number): UCATQuestion {
  const red = 3 + (index % 5);
  const blue = 4 + ((index * 2) % 6);
  const green = 2 + (index % 4);
  const total = red + blue + green;
  const correct = simplifyFraction(red, total);

  return makeSingleQuestion({
    id: `dm-round4-probability-${String(index + 1).padStart(3, "0")}`,
    section: "dm",
    subtype: "dm-probability-data",
    tags: ["text-stem", index % 5 === 0 ? "medium" : "easy"],
    title: "Decision Making Practice",
    leftTitle: "Probability",
    stimulus: [
      `A box contains ${red} red tokens, ${blue} blue tokens and ${green} green tokens. One token is selected at random.`,
    ],
    question: "What is the probability that the token is red?",
    correctText: correct,
    distractors: [
      simplifyFraction(blue, total),
      simplifyFraction(red, red + blue),
      simplifyFraction(red + green, total),
    ],
    explanation: `There are ${red} red tokens out of ${total} tokens, giving ${correct}.`,
    seed: index,
  });
}

export const ROUND_FOUR_DM_QUESTIONS: UCATQuestion[] = [
  ...range(33).map(makeDmSyllogism),
  ...range(33).map(makeDmLogic),
  ...range(27).map(makeDmArgument),
  ...range(27).map(makeDmYesNo),
  ...range(43).map(makeDmVenn),
  ...range(27).map(makeDmProbability),
];

const QR_CONTEXTS = [
  ["clinic open days", "North", "East", "South", "West"],
  ["revision workshops", "Alpha", "Beta", "Gamma", "Delta"],
  ["sports bookings", "Court A", "Court B", "Court C", "Court D"],
  ["library visits", "Branch 1", "Branch 2", "Branch 3", "Branch 4"],
  ["festival stalls", "Food", "Books", "Crafts", "Music"],
  ["bike repairs", "Monday", "Tuesday", "Wednesday", "Thursday"],
  ["study pods", "Morning", "Midday", "Afternoon", "Evening"],
  ["museum tickets", "Adult", "Student", "Family", "Group"],
] as const;

function makeQrSet(setIndex: number): UCATQuestion[] {
  const [title, a, b, c, d] = QR_CONTEXTS[setIndex % QR_CONTEXTS.length];
  const labels = [a, b, c, d];
  const base = 24 + setIndex * 3;
  const rows = labels.map((label, rowIndex) => {
    const weekOne = base + rowIndex * 7 + (setIndex % 5);
    const weekTwo = weekOne + 4 + rowIndex * 2;
    const weekThree = weekTwo + 6 + ((setIndex + rowIndex) % 4);
    return { label, weekOne, weekTwo, weekThree };
  });
  const setId = `qr-round4-set-${String(setIndex + 1).padStart(3, "0")}`;
  const visual: UCATChartVisual = {
    type: "table",
    title: `${title} by week`,
    headers: ["Category", "Week 1", "Week 2", "Week 3"],
    rows: rows.map((row) => [
      row.label,
      String(row.weekOne),
      String(row.weekTwo),
      String(row.weekThree),
    ]),
    note: "All values are counts.",
  };
  const totalWeekThree = rows.reduce((sum, row) => sum + row.weekThree, 0);
  const selected = rows[setIndex % rows.length];
  const increase = selected.weekThree - selected.weekOne;
  const percentIncrease = (increase / selected.weekOne) * 100;
  const averageWeekTwo =
    rows.reduce((sum, row) => sum + row.weekTwo, 0) / rows.length;
  const ratio = `${selected.weekThree}:${selected.weekOne}`;

  return [
    makeSingleQuestion({
      id: `${setId}-1`,
      section: "qr",
      subtype: "qr-graphs",
      setId,
      tags: ["data-display", "set-based", "easy", "quick"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data table",
      stimulus: [`The table shows counts for ${title}.`],
      visual,
      question: "What is the total for Week 3?",
      correctText: String(totalWeekThree),
      distractors: [
        String(rows.reduce((sum, row) => sum + row.weekTwo, 0)),
        String(totalWeekThree - selected.weekThree),
        String(totalWeekThree + rows.length),
      ],
      explanation: `Adding the Week 3 values gives ${totalWeekThree}.`,
      seed: setIndex,
    }),
    makeSingleQuestion({
      id: `${setId}-2`,
      section: "qr",
      subtype: "qr-percentages",
      setId,
      tags: ["data-display", "set-based", "medium"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data table",
      stimulus: [`The table shows counts for ${title}.`],
      visual,
      question: `By what percentage did ${selected.label} increase from Week 1 to Week 3?`,
      correctText: `${formatNumber(percentIncrease, 1)}%`,
      distractors: [
        `${formatNumber((increase / selected.weekThree) * 100, 1)}%`,
        `${formatNumber(percentIncrease + 5, 1)}%`,
        `${formatNumber(Math.max(0, percentIncrease - 5), 1)}%`,
      ],
      explanation: `Increase = ${increase}. Percentage increase = ${increase}/${selected.weekOne} x 100 = ${formatNumber(percentIncrease, 1)}%.`,
      seed: setIndex + 1,
    }),
    makeSingleQuestion({
      id: `${setId}-3`,
      section: "qr",
      subtype: "qr-averages",
      setId,
      tags: ["data-display", "set-based", "medium"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data table",
      stimulus: [`The table shows counts for ${title}.`],
      visual,
      question: "What was the mean Week 2 count across the four categories?",
      correctText: formatNumber(averageWeekTwo, 1),
      distractors: [
        formatNumber(averageWeekTwo + 2, 1),
        formatNumber(Math.max(0, averageWeekTwo - 2), 1),
        formatNumber(totalWeekThree / 4, 1),
      ],
      explanation: `The Week 2 total divided by 4 gives ${formatNumber(averageWeekTwo, 1)}.`,
      seed: setIndex + 2,
    }),
    makeSingleQuestion({
      id: `${setId}-4`,
      section: "qr",
      subtype: setIndex % 2 === 0 ? "qr-rates-ratios" : "qr-calculator-strategy",
      setId,
      tags: ["data-display", "set-based", "hard", "time-consuming", "calculator-heavy"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data table",
      stimulus: [`The table shows counts for ${title}.`],
      visual,
      question: `What is the ratio of Week 3 to Week 1 for ${selected.label}?`,
      correctText: ratio,
      distractors: [
        `${selected.weekOne}:${selected.weekThree}`,
        `${selected.weekThree}:${selected.weekTwo}`,
        `${increase}:${selected.weekOne}`,
      ],
      explanation: `Use Week 3 then Week 1 for ${selected.label}: ${selected.weekThree}:${selected.weekOne}.`,
      seed: setIndex + 3,
    }),
  ];
}

export const ROUND_FOUR_QR_QUESTIONS: UCATQuestion[] = range(50).flatMap(
  makeQrSet
);

const SJT_SCENARIOS = [
  ["A student notices a patient's name is visible on a teaching slide before a small group session.", ["confidentiality", "integrity"]],
  ["A patient says they do not want students present during a sensitive examination.", ["autonomy", "respect-dignity"]],
  ["A peer suggests changing an audit result because the chart would look clearer.", ["integrity", "justice"]],
  ["A visitor appears lost near a ward entrance while staff are dealing with an emergency.", ["communication", "patient-safety"]],
  ["A student is asked by a patient whether they should stop a medicine.", ["scope-of-practice", "patient-safety"]],
  ["A relative answers every question during a consultation while the patient stays quiet.", ["autonomy", "capacity-consent"]],
  ["A student receives a message containing identifiable patient details on a personal phone.", ["confidentiality", "professional-boundaries"]],
  ["A peer seems unwell before seeing the next patient and says they cannot concentrate.", ["teamwork", "patient-safety"]],
  ["A patient thanks a student and asks to connect on a personal social media account.", ["professional-boundaries", "communication"]],
  ["A student realises they gave a patient unclear directions to the imaging department.", ["candour", "communication"]],
] as const satisfies ReadonlyArray<readonly [string, readonly UCATSjtIssueTag[]]>;

function makeSjtRating(index: number): UCATQuestion {
  const [scenario, issueTags] = SJT_SCENARIOS[index % SJT_SCENARIOS.length];
  const appropriateness = index % 2 === 0;
  const answer = OPTION_KEYS[index % 4];
  const actionByAnswer: Record<UCATOptionKey, string> = {
    A: "raise the concern promptly with the appropriate staff member while staying within your role",
    B: "ask for advice from the supervisor before taking further action",
    C: "leave the issue until the end of the day unless someone else mentions it",
    D: "share the details informally with friends because it seems interesting",
    E: "do nothing",
  };
  const importanceByAnswer: Record<UCATOptionKey, string> = {
    A: "whether patient safety, consent or confidentiality could be affected",
    B: "whether the supervising team needs accurate information to respond well",
    C: "whether the student feels slightly embarrassed about asking for help",
    D: "whether acting professionally might take a few extra minutes",
    E: "whether the corridor is painted a neutral colour",
  };
  const question = appropriateness
    ? `How appropriate is it to ${actionByAnswer[answer]}?`
    : `How important is it to consider ${importanceByAnswer[answer]}?`;

  return {
    id: `sjt-round4-rating-${String(index + 1).padStart(3, "0")}`,
    section: "sjt",
    subtype: appropriateness ? "sjt-appropriateness" : "sjt-importance",
    tags: ["text-stem", "set-based", index % 5 === 0 ? "medium" : "quick"],
    issueTags: [...issueTags],
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    setId: `sjt-round4-rating-set-${Math.floor(index / 4) + 1}`,
    stimulus: [scenario],
    question,
    options: appropriateness ? APPROPRIATENESS_OPTIONS : IMPORTANCE_OPTIONS,
    answer,
    explanation:
      "The best rating reflects patient safety, confidentiality, consent, honesty and the limits of a student role.",
  };
}

function makeSjtDragCategory(index: number): UCATQuestion {
  const [scenario, issueTags] = SJT_SCENARIOS[index % SJT_SCENARIOS.length];
  const setId = `sjt-round4-drag-${String(index + 1).padStart(3, "0")}`;

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
    question: "Drag each response to the side that best describes it.",
    instruction: "Classify each response as appropriate or inappropriate.",
    categories: [
      { id: "appropriate", label: "Appropriate" },
      { id: "inappropriate", label: "Inappropriate" },
    ],
    categoryItems: [
      {
        id: "raise",
        text: "Raise the concern with the relevant staff member promptly.",
        answerCategory: "appropriate",
      },
      {
        id: "guess",
        text: "Act independently outside your role because it seems quicker.",
        answerCategory: "inappropriate",
      },
      {
        id: "record",
        text: "Keep factual notes if asked to help with follow-up.",
        answerCategory: "appropriate",
      },
      {
        id: "share",
        text: "Discuss identifiable details casually with people not involved.",
        answerCategory: "inappropriate",
      },
    ],
    explanation:
      "Appropriate actions protect patients and use the team route. Inappropriate actions breach boundaries, safety or confidentiality.",
  };
}

function makeSjtOrdering(index: number): UCATQuestion {
  const [scenario, issueTags] = SJT_SCENARIOS[index % SJT_SCENARIOS.length];
  const setId = `sjt-round4-order-${String(index + 1).padStart(3, "0")}`;

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
    question: "Drag the actions into the most appropriate order.",
    instruction: "Prioritise immediate risk, then escalation, then later follow-up.",
    dragItems: [
      { id: "notice", text: "Recognise the immediate professional or safety concern." },
      { id: "escalate", text: "Tell the appropriate member of staff promptly." },
      { id: "support", text: "Support the patient or team while staying within your role." },
      { id: "reflect", text: "Reflect afterwards on how to prevent a similar issue." },
    ],
    answerOrder: ["notice", "escalate", "support", "reflect"],
    explanation:
      "Immediate recognition and escalation come before support and later reflection.",
  };
}

function makeSjtMostLeast(index: number): UCATQuestion {
  const [scenario, issueTags] = SJT_SCENARIOS[index % SJT_SCENARIOS.length];
  const setId = `sjt-round4-mostleast-${String(index + 1).padStart(3, "0")}`;

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
      { id: "team", text: "Use the appropriate staff route and explain the concern clearly." },
      { id: "ignore", text: "Ignore it because someone else will probably deal with it." },
      { id: "listen", text: "Listen respectfully and avoid making promises outside your role." },
      { id: "post", text: "Post the details in a private chat to ask friends what they think." },
    ],
    answerSlots: { most: "team", least: "post" },
    explanation:
      "The most appropriate action uses the correct team route. Posting details is the least appropriate because it risks confidentiality and professionalism.",
  };
}

export const ROUND_FOUR_SJT_QUESTIONS: UCATQuestion[] = [
  ...range(202).map(makeSjtRating),
  ...range(67).map(makeSjtDragCategory),
  ...range(50).map(makeSjtOrdering),
  ...range(51).map(makeSjtMostLeast),
];
