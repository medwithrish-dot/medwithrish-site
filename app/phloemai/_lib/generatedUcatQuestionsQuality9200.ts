import type {
  UCATChartVisual,
  UCATOptionKey,
  UCATQuestion,
  UCATQuestionTag,
  UCATSection,
  UCATSjtIssueTag,
  UCATSubtypeId,
} from "./ucatQuestionBank";

// QA WARNING: this generated 9,200-question layer is a draft scaffold.
// Before generating more UCAT questions, read ucatQuestionDesignNotes.md and
// quality-check originality, template repetition, answer correctness, subtype
// ratios and realistic difficulty. Do not present a bulk batch as high quality
// until that audit has happened.

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

function pad(index: number) {
  return String(index + 1).padStart(3, "0");
}

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function fraction(numerator: number, denominator: number) {
  const divisor = gcd(numerator, denominator);
  return `${numerator / divisor}/${denominator / divisor}`;
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

function numericDistractors(correct: number, seed: number) {
  const step = Math.max(1, Math.round(Math.abs(correct) * 0.08));
  return [
    correct + step,
    Math.max(0, correct - step),
    correct + step * 2 + (seed % 3),
  ].map((value) => formatNumber(value));
}

function buildOptions(correctText: string, distractors: string[], seed: number) {
  const wrongs = distractors
    .map((text) => text.trim())
    .filter((text, index, array) => text && text !== correctText && array.indexOf(text) === index)
    .slice(0, 3);

  let filler = 1;
  while (wrongs.length < 3) {
    const next = `${correctText} ${filler}`;
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

type VrProfile = {
  setting: string;
  project: string;
  group: string;
  problem: string;
  aim: string;
  oldRoutine: string;
  metric: string;
  metricVerb: "rose" | "fell";
  caveat: string;
  limitation: string;
  funder: string;
  wrongFunder: string;
  recommendation: string;
  extraBenefit: string;
};

const VR_PROFILES: VrProfile[] = [
  {
    setting: "Lindale sixth-form college",
    project: "a quiet breakfast room",
    group: "exam-year students",
    problem: "several pupils were arriving without eating before early revision sessions",
    aim: "improve concentration before first-period lessons",
    oldRoutine: "requiring pupils to join a formal mentoring group",
    metric: "first-period attendance",
    metricVerb: "rose",
    caveat: "the college also changed the bus-gate opening time in the same week",
    limitation: "only two year groups used the room regularly",
    funder: "the college welfare budget",
    wrongFunder: "the local sports grant",
    recommendation: "continue the room during exam terms and review demand after winter",
    extraBenefit: "students reported that the room made early study feel less rushed",
  },
  {
    setting: "Bramford Museum",
    project: "short object-handling sessions",
    group: "primary-school classes",
    problem: "teachers said long gallery talks were difficult for younger pupils",
    aim: "make visits more interactive without reducing the number of artefacts shown",
    oldRoutine: "replacing the main gallery tour entirely",
    metric: "teacher satisfaction scores",
    metricVerb: "rose",
    caveat: "the pilot coincided with a new booking form that reduced admin delays",
    limitation: "fragile items still had to remain behind glass",
    funder: "a learning-access fund",
    wrongFunder: "ticket income from weekend visitors",
    recommendation: "keep the sessions for classes under eleven and train two more volunteers",
    extraBenefit: "pupils asked more follow-up questions than in standard tours",
  },
  {
    setting: "Northmere Council",
    project: "colour-coded food-waste bins",
    group: "residents in high-rise blocks",
    problem: "contamination in shared recycling rooms was increasing",
    aim: "reduce rejected recycling collections",
    oldRoutine: "issuing fines to every household in a block",
    metric: "rejected recycling loads",
    metricVerb: "fell",
    caveat: "collection crews also began leaving clearer feedback tags",
    limitation: "blocks with narrow bin stores saw smaller improvements",
    funder: "the waste-prevention budget",
    wrongFunder: "a parks-maintenance reserve",
    recommendation: "extend the bins to buildings with suitable storage space",
    extraBenefit: "caretakers said the clearer labels made disputes easier to resolve",
  },
  {
    setting: "Stonehaven Library",
    project: "late-evening study desks",
    group: "adult learners",
    problem: "many learners could not reach the library before standard closing time",
    aim: "support study after work without opening the whole building",
    oldRoutine: "turning the library into a full overnight service",
    metric: "desk bookings",
    metricVerb: "rose",
    caveat: "a nearby college advertised the service heavily during the trial",
    limitation: "security costs rose on nights with very low use",
    funder: "an adult-skills partnership",
    wrongFunder: "the children's reading prize fund",
    recommendation: "offer two late evenings each week rather than five",
    extraBenefit: "users valued predictable quiet space more than extra computers",
  },
  {
    setting: "Calverton Park Service",
    project: "temporary wildflower strips",
    group: "visitors and local volunteers",
    problem: "several grass verges had become worn by informal shortcuts",
    aim: "protect soil while improving the appearance of entrances",
    oldRoutine: "closing the park during summer weekends",
    metric: "recorded shortcut use",
    metricVerb: "fell",
    caveat: "new signs were installed before the flowers had grown",
    limitation: "the strips needed watering during an unusually dry month",
    funder: "a small biodiversity grant",
    wrongFunder: "parking-fine income",
    recommendation: "repeat the strips at entrances with wide verges",
    extraBenefit: "volunteers said the planting made entrances easier to identify",
  },
  {
    setting: "Riverton Outpatients",
    project: "text reminders with map links",
    group: "new patients",
    problem: "patients often arrived late after using the wrong hospital entrance",
    aim: "reduce preventable delays at reception",
    oldRoutine: "changing every appointment length",
    metric: "late arrivals",
    metricVerb: "fell",
    caveat: "a volunteer desk opened near the main entrance during the same period",
    limitation: "patients without smartphones still needed paper directions",
    funder: "a digital-inclusion fund",
    wrongFunder: "the staff social committee",
    recommendation: "keep map links but offer printed directions on request",
    extraBenefit: "reception staff received fewer calls asking for directions",
  },
  {
    setting: "Eastbrook Rail",
    project: "platform crowding screens",
    group: "commuters during the morning peak",
    problem: "passengers clustered near the first staircase even when carriages were emptier elsewhere",
    aim: "spread passengers along the platform",
    oldRoutine: "reducing the number of peak services",
    metric: "boarding delays",
    metricVerb: "fell",
    caveat: "two timetable changes also took effect in the trial month",
    limitation: "the screens were less visible in bright sunlight",
    funder: "a station-safety innovation fund",
    wrongFunder: "retail-unit rent",
    recommendation: "install brighter screens before expanding the system",
    extraBenefit: "staff said crowd movement became easier to predict",
  },
  {
    setting: "Marlowe Arts Centre",
    project: "pay-what-you-can rehearsal previews",
    group: "local residents",
    problem: "weekday matinees were underused outside school-holiday periods",
    aim: "test demand among people who rarely bought full-price tickets",
    oldRoutine: "cancelling the main evening performances",
    metric: "new visitor registrations",
    metricVerb: "rose",
    caveat: "a local newspaper ran a feature on the centre during the same month",
    limitation: "preview audiences could not judge the finished lighting design",
    funder: "the audience-development budget",
    wrongFunder: "stage-equipment insurance",
    recommendation: "run previews for selected productions only",
    extraBenefit: "front-of-house staff collected more detailed feedback than usual",
  },
  {
    setting: "Fernway GP Practice",
    project: "pharmacist-led medication checks",
    group: "patients on repeat prescriptions",
    problem: "some patients were booking GP appointments only to ask about routine medicine queries",
    aim: "free GP time for diagnostic appointments",
    oldRoutine: "stopping patients from speaking to doctors when clinically needed",
    metric: "routine GP medicine appointments",
    metricVerb: "fell",
    caveat: "a new online request form launched halfway through the trial",
    limitation: "complex cases still required GP review",
    funder: "a primary-care access budget",
    wrongFunder: "a hospital theatre fund",
    recommendation: "keep the checks for stable repeat prescriptions",
    extraBenefit: "patients liked receiving written notes after the call",
  },
  {
    setting: "Oakminster Council",
    project: "shared cargo-bike loans",
    group: "small market traders",
    problem: "short delivery trips were adding van congestion near the market square",
    aim: "test whether some bulky deliveries could avoid vans",
    oldRoutine: "banning all trader vehicles from the town centre",
    metric: "short van trips",
    metricVerb: "fell",
    caveat: "roadworks temporarily diverted general traffic away from the square",
    limitation: "the bikes were less useful for refrigerated goods",
    funder: "a clean-transport grant",
    wrongFunder: "library book fines",
    recommendation: "continue the scheme for non-chilled deliveries",
    extraBenefit: "traders found parking easier on market mornings",
  },
];

function makeVrPassage(profile: VrProfile, index: number) {
  const weeks = 6 + (index % 8) * 2;
  const baseline = profile.metricVerb === "rose" ? 41 + (index % 9) * 3 : 54 + (index % 8) * 4;
  const after =
    profile.metricVerb === "rose"
      ? baseline + 8 + (index % 5) * 2
      : Math.max(11, baseline - 7 - (index % 6) * 3);

  return [
    `${profile.setting} piloted ${profile.project} after ${profile.problem}. The service was aimed at ${profile.group}. Its main purpose was to ${profile.aim}, while avoiding ${profile.oldRoutine}.`,
    `Over ${weeks} weeks, ${profile.metric} ${profile.metricVerb} from ${baseline} to ${after}. Surveys and staff notes suggested that ${profile.extraBenefit}. Managers warned, however, that ${profile.caveat}, so the change could not be credited to the pilot alone. The review recommended that the organisation should ${profile.recommendation}. It also noted that ${profile.limitation}. The pilot was funded through ${profile.funder}, not through ${profile.wrongFunder}.`,
  ];
}

type VrQuestionVariant =
  | "tfc-purpose"
  | "tfc-funding"
  | "tfc-certainty"
  | "detail-reason"
  | "inference-balanced"
  | "author-cautious"
  | "negative-except"
  | "summary-qualified";

const VR_BATCH_VARIANTS: VrQuestionVariant[] = [
  "tfc-purpose",
  "tfc-funding",
  "tfc-certainty",
  "tfc-purpose",
  "tfc-funding",
  "tfc-certainty",
  "tfc-purpose",
  "tfc-funding",
  "tfc-certainty",
  "tfc-purpose",
  "tfc-funding",
  "tfc-certainty",
  "tfc-purpose",
  "tfc-funding",
  "tfc-certainty",
  "tfc-purpose",
  "detail-reason",
  "detail-reason",
  "detail-reason",
  "detail-reason",
  "detail-reason",
  "detail-reason",
  "detail-reason",
  "detail-reason",
  "inference-balanced",
  "inference-balanced",
  "inference-balanced",
  "inference-balanced",
  "inference-balanced",
  "inference-balanced",
  "author-cautious",
  "author-cautious",
  "author-cautious",
  "author-cautious",
  "author-cautious",
  "negative-except",
  "negative-except",
  "negative-except",
  "negative-except",
  "summary-qualified",
  "summary-qualified",
  "summary-qualified",
  "summary-qualified",
  "summary-qualified",
];

function makeVrQuestion(setIndex: number, itemIndex: number): UCATQuestion {
  const profile = VR_PROFILES[setIndex % VR_PROFILES.length];
  const setId = `quality-vr-${pad(setIndex)}`;
  const stimulus = makeVrPassage(profile, setIndex);
  const seed = setIndex * 7 + itemIndex;
  const globalQuestionIndex = setIndex * 4 + itemIndex;
  const variant = VR_BATCH_VARIANTS[globalQuestionIndex % VR_BATCH_VARIANTS.length];
  const base = {
    id: `${setId}-${itemIndex + 1}`,
    section: "vr" as const,
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    setId,
    stimulus,
  };

  if (variant === "tfc-purpose") {
    return {
      ...base,
      subtype: "vr-tfc",
      tags: ["true-false-cant-tell", "easy", "quick", "text-stem"],
      question: `The pilot was intended to ${profile.aim}. According to the passage, this statement is:`,
      options: TFC_OPTIONS,
      answer: "A",
      explanation: `The opening paragraph states that the main purpose was to ${profile.aim}.`,
    };
  }

  if (variant === "tfc-funding") {
    return {
      ...base,
      subtype: "vr-tfc",
      tags: ["true-false-cant-tell", "medium", "text-stem"],
      question: `The pilot was funded through ${profile.wrongFunder}. According to the passage, this statement is:`,
      options: TFC_OPTIONS,
      answer: "B",
      explanation: `The passage says the pilot was funded through ${profile.funder}, not through ${profile.wrongFunder}.`,
    };
  }

  if (variant === "tfc-certainty") {
    return {
      ...base,
      subtype: "vr-tfc",
      tags: ["true-false-cant-tell", "medium", "text-stem"],
      question:
        "The organisation will definitely run the pilot unchanged for the next five years. According to the passage, this statement is:",
      options: TFC_OPTIONS,
      answer: "C",
      explanation:
        "The passage gives a recommendation, but it does not say that the pilot will definitely continue unchanged for five years.",
    };
  }

  if (variant === "detail-reason") {
    return singleQuestion({
      ...base,
      subtype: "vr-detail",
      tags: ["detail-retrieval", "easy", "quick", "text-stem"],
      question: `Why was ${profile.project} introduced?`,
      correctText: `Because ${profile.problem}.`,
      distractors: [
        `Because ${profile.wrongFunder} had become available.`,
        `Because the organisation wanted to start ${profile.oldRoutine}.`,
        `Because managers had already proved the pilot was the only cause of the result.`,
      ],
      explanation: `The first sentence says the pilot was introduced after ${profile.problem}.`,
      seed,
    });
  }

  if (variant === "inference-balanced") {
    return singleQuestion({
      ...base,
      subtype: "vr-inference",
      tags: ["inference-question", "medium", "text-stem"],
      question: "Which statement is best supported by the passage?",
      correctText:
        "The pilot showed encouraging signs, but other changes may have affected the result.",
      distractors: [
        "The pilot failed because the main metric moved in the wrong direction.",
        "The review said the pilot should be abandoned immediately.",
        "The result proves that the pilot alone caused the change.",
      ],
      explanation:
        "The metric moved in a favourable direction, but the passage explicitly gives a caveat that prevents a simple causal claim.",
      seed,
    });
  }

  if (variant === "negative-except") {
    return singleQuestion({
      ...base,
      subtype: "vr-negative",
      tags: ["negative-except", "medium", "text-stem"],
      question: "All of the following are stated in the passage except:",
      correctText: "The pilot removed the need for all existing services.",
      distractors: [
        `The pilot was aimed at ${profile.group}.`,
        `The review noted that ${profile.limitation}.`,
        `The pilot was funded through ${profile.funder}.`,
      ],
      explanation:
        "The passage says the pilot avoided a more drastic replacement or restriction; it does not say all existing services became unnecessary.",
      seed,
    });
  }

  if (variant === "author-cautious") {
    return singleQuestion({
      ...base,
      subtype: "vr-author",
      tags: ["author-opinion", "medium", "text-stem"],
      question: "The passage's attitude towards the pilot is best described as:",
      correctText: "cautiously supportive, because it recognises benefits and limitations.",
      distractors: [
        "wholly negative, because it says the pilot had no useful effect.",
        "uncritical, because it ignores possible alternative explanations.",
        "irrelevant, because it focuses only on the funding source.",
      ],
      explanation:
        "The passage reports improved results and a recommendation, while also naming a caveat and a limitation.",
      seed,
    });
  }

  return singleQuestion({
    ...base,
    subtype: "vr-summary",
    tags: ["summary-structure", "hard", "text-stem"],
    question: "Which option best summarises the passage?",
    correctText:
      "A small pilot produced promising results, but the review recommended limited continuation because the evidence had caveats.",
    distractors: [
      "A long-running national policy was cancelled after no one used it.",
      "A funding dispute is described in detail, with no mention of outcomes.",
      "A project was proven to be the sole cause of a permanent organisational change.",
    ],
    explanation:
      "The passage combines the reason for the pilot, the favourable metric, the caveat and the qualified recommendation.",
    seed,
  });
}

export const QUALITY_9200_VR_QUESTIONS: UCATQuestion[] = range(550).flatMap((setIndex) =>
  range(4).map((itemIndex) => makeVrQuestion(setIndex, itemIndex))
);

function qrBase(setIndex: number, itemIndex: number, visual?: UCATChartVisual) {
  return {
    id: `quality-qr-${pad(setIndex)}-${itemIndex + 1}`,
    section: "qr" as const,
    title: "Quantitative Reasoning Practice",
    leftTitle: visual ? "Data" : "Stem",
    setId: `quality-qr-${pad(setIndex)}`,
    visual,
  };
}

function makeQrTableSet(setIndex: number): UCATQuestion[] {
  const labels = ["North", "East", "South", "West"];
  const base = 34 + (setIndex % 11) * 3;
  const rows = labels.map((label, index) => ({
    label,
    booked: base + index * 7 + (setIndex % 5),
    attended: base + index * 5 + 12 - (setIndex % 4),
  }));
  const visual: UCATChartVisual = {
    type: "table",
    title: "Workshop bookings by centre",
    headers: ["Centre", "Booked", "Attended"],
    rows: rows.map((row) => [row.label, String(row.booked), String(row.attended)]),
    note: "Each booking is for one learner.",
  };
  const totalAttended = rows.reduce((sum, row) => sum + row.attended, 0);
  const northBooked = rows[0].booked;
  const southAttended = rows[2].attended;
  const westBooked = rows[3].booked;
  const attendanceRate = (rows[1].attended / rows[1].booked) * 100;

  return [
    singleQuestion({
      ...qrBase(setIndex, 0, visual),
      subtype: "qr-graphs",
      tags: ["data-display", "set-based", "easy", "quick"],
      stimulus: ["The table shows bookings and attendance for four revision workshops."],
      question: "How many learners attended across all four centres?",
      correctText: formatNumber(totalAttended),
      distractors: numericDistractors(totalAttended, setIndex),
      explanation: `Add the attended values: ${rows.map((row) => row.attended).join(" + ")} = ${totalAttended}.`,
      seed: setIndex,
    }),
    singleQuestion({
      ...qrBase(setIndex, 1, visual),
      subtype: "qr-percentages",
      tags: ["data-display", "set-based", "medium", "multi-step"],
      stimulus: ["The table shows bookings and attendance for four revision workshops."],
      question: "What was the attendance rate for the East centre, to 1 decimal place?",
      correctText: formatPercent(attendanceRate),
      distractors: [
        formatPercent((rows[1].booked / rows[1].attended) * 100),
        formatPercent((rows[1].attended / totalAttended) * 100),
        formatPercent(((rows[1].booked - rows[1].attended) / rows[1].booked) * 100),
      ],
      explanation: `East attendance rate = ${rows[1].attended} / ${rows[1].booked} x 100 = ${formatPercent(attendanceRate)}.`,
      seed: setIndex + 1,
    }),
    singleQuestion({
      ...qrBase(setIndex, 2, visual),
      subtype: "qr-rates-ratios",
      tags: ["data-display", "set-based", "medium"],
      stimulus: ["The table shows bookings and attendance for four revision workshops."],
      question: "What is the ratio of North bookings to West bookings, in its simplest form?",
      correctText: fraction(northBooked, westBooked),
      distractors: [
        `${northBooked}:${westBooked}`,
        fraction(westBooked, northBooked),
        fraction(northBooked, southAttended),
      ],
      explanation: `North bookings to West bookings = ${northBooked}:${westBooked}, which simplifies to ${fraction(northBooked, westBooked)}.`,
      seed: setIndex + 2,
    }),
    singleQuestion({
      ...qrBase(setIndex, 3, visual),
      subtype: "qr-averages",
      tags: ["data-display", "set-based", "hard", "time-consuming"],
      stimulus: ["The table shows bookings and attendance for four revision workshops."],
      question:
        "If 6 more learners attended South, what would be the mean attendance across the four centres?",
      correctText: formatNumber((totalAttended + 6) / 4, 1),
      distractors: [
        formatNumber(totalAttended / 4, 1),
        formatNumber((totalAttended + 6) / 5, 1),
        formatNumber((totalAttended + 12) / 4, 1),
      ],
      explanation: `New total attendance = ${totalAttended} + 6 = ${totalAttended + 6}. Divide by 4 to get ${formatNumber((totalAttended + 6) / 4, 1)}.`,
      seed: setIndex + 3,
    }),
  ];
}

function makeQrGroupedSet(setIndex: number): UCATQuestion[] {
  const groups = ["January", "February", "March", "April"].map((label, index) => ({
    label,
    values: [42 + index * 8 + (setIndex % 6), 31 + index * 6 + (setIndex % 5)],
  }));
  const visual: UCATChartVisual = {
    type: "grouped-bar",
    title: "Practice packs completed",
    yLabel: "Packs",
    seriesLabels: ["VR packs", "QR packs"],
    groups,
    max: 90,
  };
  const firstTotal = groups[0].values[0] + groups[0].values[1];
  const finalTotal = groups[3].values[0] + groups[3].values[1];
  const qrIncrease = groups[3].values[1] - groups[0].values[1];
  const vrTotal = groups.reduce((sum, group) => sum + group.values[0], 0);
  const qrTotal = groups.reduce((sum, group) => sum + group.values[1], 0);
  const combined = vrTotal + qrTotal;

  return [
    singleQuestion({
      ...qrBase(setIndex, 0, visual),
      subtype: "qr-graphs",
      tags: ["data-display", "set-based", "easy", "quick"],
      stimulus: ["The chart shows completed practice packs in four months."],
      question: "How many more QR packs were completed in April than in January?",
      correctText: formatNumber(qrIncrease),
      distractors: numericDistractors(qrIncrease, setIndex),
      explanation: `April QR packs minus January QR packs = ${groups[3].values[1]} - ${groups[0].values[1]} = ${qrIncrease}.`,
      seed: setIndex,
    }),
    singleQuestion({
      ...qrBase(setIndex, 1, visual),
      subtype: "qr-percentages",
      tags: ["data-display", "set-based", "medium", "multi-step"],
      stimulus: ["The chart shows completed practice packs in four months."],
      question: "What was the percentage increase in total packs from January to April?",
      correctText: formatPercent(((finalTotal - firstTotal) / firstTotal) * 100),
      distractors: [
        formatPercent((finalTotal / firstTotal) * 100),
        formatPercent(((finalTotal - firstTotal) / finalTotal) * 100),
        formatPercent(((groups[3].values[0] - groups[0].values[0]) / groups[0].values[0]) * 100),
      ],
      explanation: `January total = ${firstTotal}; April total = ${finalTotal}. Increase = ${finalTotal - firstTotal}, so percentage increase = ${formatPercent(((finalTotal - firstTotal) / firstTotal) * 100)}.`,
      seed: setIndex + 1,
    }),
    singleQuestion({
      ...qrBase(setIndex, 2, visual),
      subtype: "qr-averages",
      tags: ["data-display", "set-based", "medium"],
      stimulus: ["The chart shows completed practice packs in four months."],
      question: "What was the mean number of VR packs completed per month?",
      correctText: formatNumber(vrTotal / 4, 1),
      distractors: [
        formatNumber(qrTotal / 4, 1),
        formatNumber(combined / 4, 1),
        formatNumber(vrTotal / 3, 1),
      ],
      explanation: `Total VR packs = ${vrTotal}. Divide by 4 months to get ${formatNumber(vrTotal / 4, 1)}.`,
      seed: setIndex + 2,
    }),
    singleQuestion({
      ...qrBase(setIndex, 3, visual),
      subtype: "qr-calculator-strategy",
      tags: ["data-display", "set-based", "hard", "calculator-heavy"],
      stimulus: ["The chart shows completed practice packs in four months."],
      question: "What percentage of all completed packs were QR packs?",
      correctText: formatPercent((qrTotal / combined) * 100),
      distractors: [
        formatPercent((vrTotal / combined) * 100),
        formatPercent((qrTotal / vrTotal) * 100),
        formatPercent((groups[3].values[1] / combined) * 100),
      ],
      explanation: `QR packs = ${qrTotal}; all packs = ${combined}. ${qrTotal} / ${combined} x 100 = ${formatPercent((qrTotal / combined) * 100)}.`,
      seed: setIndex + 3,
    }),
  ];
}

function makeQrLineSet(setIndex: number): UCATQuestion[] {
  const start = 58 + (setIndex % 7) * 4;
  const points = range(5).map((index) => ({
    label: `Week ${index + 1}`,
    value: start + index * (4 + (setIndex % 3)) - (index === 2 ? 3 : 0),
  }));
  const visual: UCATChartVisual = {
    type: "line",
    title: "Average daily questions attempted",
    yLabel: "Questions",
    points,
    max: 110,
  };
  const total = points.reduce((sum, point) => sum + point.value, 0);
  const biggestChange = Math.max(
    ...points.slice(1).map((point, index) => Math.abs(point.value - points[index].value))
  );
  const finalIncrease = points[4].value - points[0].value;

  return [
    singleQuestion({
      ...qrBase(setIndex, 0, visual),
      subtype: "qr-graphs",
      tags: ["data-display", "set-based", "easy", "quick"],
      stimulus: ["The line chart shows average daily question attempts over five weeks."],
      question: "What was the increase from Week 1 to Week 5?",
      correctText: formatNumber(finalIncrease),
      distractors: numericDistractors(finalIncrease, setIndex),
      explanation: `Week 5 minus Week 1 = ${points[4].value} - ${points[0].value} = ${finalIncrease}.`,
      seed: setIndex,
    }),
    singleQuestion({
      ...qrBase(setIndex, 1, visual),
      subtype: "qr-averages",
      tags: ["data-display", "set-based", "medium"],
      stimulus: ["The line chart shows average daily question attempts over five weeks."],
      question: "What was the mean of the five weekly values?",
      correctText: formatNumber(total / 5, 1),
      distractors: [
        formatNumber(total / 4, 1),
        formatNumber((total - points[2].value) / 4, 1),
        formatNumber((points[0].value + points[4].value) / 2, 1),
      ],
      explanation: `The five values total ${total}; ${total} / 5 = ${formatNumber(total / 5, 1)}.`,
      seed: setIndex + 1,
    }),
    singleQuestion({
      ...qrBase(setIndex, 2, visual),
      subtype: "qr-estimation",
      tags: ["data-display", "set-based", "medium", "multi-step"],
      stimulus: ["The line chart shows average daily question attempts over five weeks."],
      question: "What was the largest week-to-week change?",
      correctText: formatNumber(biggestChange),
      distractors: numericDistractors(biggestChange, setIndex + 2),
      explanation: `Compare consecutive differences; the largest absolute change is ${biggestChange}.`,
      seed: setIndex + 2,
    }),
    singleQuestion({
      ...qrBase(setIndex, 3, visual),
      subtype: "qr-percentages",
      tags: ["data-display", "set-based", "hard", "calculator-heavy"],
      stimulus: ["The line chart shows average daily question attempts over five weeks."],
      question: "What was the percentage increase from Week 1 to Week 5?",
      correctText: formatPercent((finalIncrease / points[0].value) * 100),
      distractors: [
        formatPercent((points[4].value / points[0].value) * 100),
        formatPercent((finalIncrease / points[4].value) * 100),
        formatPercent((biggestChange / points[0].value) * 100),
      ],
      explanation: `Increase = ${finalIncrease}; percentage increase = ${finalIncrease} / ${points[0].value} x 100 = ${formatPercent((finalIncrease / points[0].value) * 100)}.`,
      seed: setIndex + 3,
    }),
  ];
}

function makeQrRateSet(setIndex: number): UCATQuestion[] {
  const distance = 18 + (setIndex % 8) * 3;
  const outwardSpeed = 12 + (setIndex % 5) * 2;
  const returnSpeed = outwardSpeed + 6;
  const prepMinutes = 10 + (setIndex % 4) * 5;
  const outwardMinutes = (distance / outwardSpeed) * 60;
  const returnMinutes = (distance / returnSpeed) * 60;
  const totalMinutes = outwardMinutes + returnMinutes + prepMinutes;

  return [
    singleQuestion({
      ...qrBase(setIndex, 0),
      subtype: "qr-rates-ratios",
      tags: ["text-stem", "set-based", "easy"],
      stimulus: [
        `A courier travels ${distance} km to a clinic at ${outwardSpeed} km/h, spends ${prepMinutes} minutes checking delivery notes, and returns by the same route at ${returnSpeed} km/h.`,
      ],
      question: "How long does the outward journey take?",
      correctText: `${formatNumber(outwardMinutes)} minutes`,
      distractors: [
        `${formatNumber(returnMinutes)} minutes`,
        `${formatNumber(outwardMinutes + prepMinutes)} minutes`,
        `${formatNumber(distance + outwardSpeed)} minutes`,
      ],
      explanation: `Time = distance / speed = ${distance} / ${outwardSpeed} hours = ${formatNumber(outwardMinutes)} minutes.`,
      seed: setIndex,
    }),
    singleQuestion({
      ...qrBase(setIndex, 1),
      subtype: "qr-rates-ratios",
      tags: ["text-stem", "set-based", "medium", "multi-step"],
      stimulus: [
        `A courier travels ${distance} km to a clinic at ${outwardSpeed} km/h, spends ${prepMinutes} minutes checking delivery notes, and returns by the same route at ${returnSpeed} km/h.`,
      ],
      question: "How long does the full trip take, including the delivery-note check?",
      correctText: `${formatNumber(totalMinutes)} minutes`,
      distractors: [
        `${formatNumber(outwardMinutes + returnMinutes)} minutes`,
        `${formatNumber(totalMinutes + prepMinutes)} minutes`,
        `${formatNumber(outwardMinutes + prepMinutes)} minutes`,
      ],
      explanation: `Outward ${formatNumber(outwardMinutes)} minutes + return ${formatNumber(returnMinutes)} minutes + check ${prepMinutes} minutes = ${formatNumber(totalMinutes)} minutes.`,
      seed: setIndex + 1,
    }),
    singleQuestion({
      ...qrBase(setIndex, 2),
      subtype: "qr-averages",
      tags: ["text-stem", "set-based", "hard", "multi-step"],
      stimulus: [
        `A courier travels ${distance} km to a clinic at ${outwardSpeed} km/h, spends ${prepMinutes} minutes checking delivery notes, and returns by the same route at ${returnSpeed} km/h.`,
      ],
      question: "What is the average travelling speed, excluding the delivery-note check?",
      correctText: `${formatNumber((distance * 2) / ((outwardMinutes + returnMinutes) / 60), 1)} km/h`,
      distractors: [
        `${formatNumber((outwardSpeed + returnSpeed) / 2, 1)} km/h`,
        `${formatNumber((distance * 2) / (totalMinutes / 60), 1)} km/h`,
        `${formatNumber(returnSpeed - outwardSpeed, 1)} km/h`,
      ],
      explanation:
        "Average travelling speed is total distance divided by travel time, not the simple average of the two speeds.",
      seed: setIndex + 2,
    }),
    singleQuestion({
      ...qrBase(setIndex, 3),
      subtype: "qr-units-geometry",
      tags: ["text-stem", "set-based", "medium"],
      stimulus: [
        `A courier travels ${distance} km to a clinic at ${outwardSpeed} km/h, spends ${prepMinutes} minutes checking delivery notes, and returns by the same route at ${returnSpeed} km/h.`,
      ],
      question: "What total distance does the courier travel?",
      correctText: `${distance * 2} km`,
      distractors: [`${distance} km`, `${distance + returnSpeed} km`, `${distance * 2 + outwardSpeed} km`],
      explanation: `The courier travels the same ${distance} km route twice, so total distance = ${distance * 2} km.`,
      seed: setIndex + 3,
    }),
  ];
}

function makeQrFinanceSet(setIndex: number): UCATQuestion[] {
  const cost = 8 + (setIndex % 9) * 1.25;
  const price = cost * (1.35 + (setIndex % 4) * 0.05);
  const units = 120 + (setIndex % 6) * 15;
  const discount = 10 + (setIndex % 4) * 5;
  const discountedPrice = price * (1 - discount / 100);
  const revenue = price * units;
  const profit = (price - cost) * units;

  return [
    singleQuestion({
      ...qrBase(setIndex, 0),
      subtype: "qr-percentages",
      tags: ["text-stem", "set-based", "easy"],
      stimulus: [
        `A revision shop buys question packs for ${asMoney(cost)} each and sells them for ${asMoney(price)} each. It sells ${units} packs in one week. During a promotion, the selling price is reduced by ${discount}%.`,
      ],
      question: "What is the promotional selling price per pack?",
      correctText: asMoney(discountedPrice),
      distractors: [asMoney(price - discount), asMoney(price * (1 + discount / 100)), asMoney(costedAverage(cost, price))],
      explanation: `A ${discount}% discount leaves ${100 - discount}% of the price: ${asMoney(price)} x ${(100 - discount) / 100} = ${asMoney(discountedPrice)}.`,
      seed: setIndex,
    }),
    singleQuestion({
      ...qrBase(setIndex, 1),
      subtype: "qr-calculator-strategy",
      tags: ["text-stem", "set-based", "medium", "calculator-heavy"],
      stimulus: [
        `A revision shop buys question packs for ${asMoney(cost)} each and sells them for ${asMoney(price)} each. It sells ${units} packs in one week. During a promotion, the selling price is reduced by ${discount}%.`,
      ],
      question: "What is the total revenue before any discount?",
      correctText: asMoney(revenue),
      distractors: [asMoney(cost * units), asMoney(profit), asMoney(discountedPrice * units)],
      explanation: `Revenue before discount = selling price x units = ${asMoney(price)} x ${units} = ${asMoney(revenue)}.`,
      seed: setIndex + 1,
    }),
    singleQuestion({
      ...qrBase(setIndex, 2),
      subtype: "qr-rates-ratios",
      tags: ["text-stem", "set-based", "medium"],
      stimulus: [
        `A revision shop buys question packs for ${asMoney(cost)} each and sells them for ${asMoney(price)} each. It sells ${units} packs in one week. During a promotion, the selling price is reduced by ${discount}%.`,
      ],
      question: "What is the profit before any discount?",
      correctText: asMoney(profit),
      distractors: [asMoney(revenue), asMoney(price - cost), asMoney(cost * units)],
      explanation: `Profit per pack = ${asMoney(price)} - ${asMoney(cost)} = ${asMoney(price - cost)}. Multiply by ${units} packs.`,
      seed: setIndex + 2,
    }),
    singleQuestion({
      ...qrBase(setIndex, 3),
      subtype: "qr-estimation",
      tags: ["text-stem", "set-based", "hard", "time-consuming"],
      stimulus: [
        `A revision shop buys question packs for ${asMoney(cost)} each and sells them for ${asMoney(price)} each. It sells ${units} packs in one week. During a promotion, the selling price is reduced by ${discount}%.`,
      ],
      question: "After the discount, approximately what is the percentage profit margin per pack?",
      correctText: formatPercent(((discountedPrice - cost) / discountedPrice) * 100),
      distractors: [
        formatPercent(((price - cost) / price) * 100),
        formatPercent(((discountedPrice - cost) / cost) * 100),
        formatPercent((discount / 100) * 100),
      ],
      explanation: `Margin uses profit divided by selling price: (${asMoney(discountedPrice)} - ${asMoney(cost)}) / ${asMoney(discountedPrice)} x 100.`,
      seed: setIndex + 3,
    }),
  ];
}

function costedAverage(a: number, b: number) {
  return (a + b) / 2;
}

function makeQrSet(setIndex: number): UCATQuestion[] {
  switch (setIndex % 5) {
    case 0:
      return makeQrTableSet(setIndex);
    case 1:
      return makeQrGroupedSet(setIndex);
    case 2:
      return makeQrLineSet(setIndex);
    case 3:
      return makeQrRateSet(setIndex);
    default:
      return makeQrFinanceSet(setIndex);
  }
}

export const QUALITY_9200_QR_QUESTIONS: UCATQuestion[] = range(450).flatMap(makeQrSet);

const DM_GROUPS = [
  ["blue forms", "checked records", "urgent referrals", "archived files"],
  ["river samples", "labelled specimens", "weekday tests", "discarded batches"],
  ["grant bids", "reviewed proposals", "student projects", "late submissions"],
  ["training rooms", "booked spaces", "clinical sessions", "maintenance areas"],
  ["library requests", "approved loans", "digital renewals", "overdue items"],
  ["market stalls", "licensed units", "food vendors", "temporary pitches"],
];

function makeDmSyllogism(index: number): UCATQuestion {
  const [a, b, c, d] = DM_GROUPS[index % DM_GROUPS.length];
  return {
    id: `quality-dm-syllogism-${pad(index)}`,
    section: "dm",
    subtype: "dm-syllogisms",
    questionType: "yes-no",
    tags: ["text-stem", index % 3 === 0 ? "hard" : "medium", "multi-step"],
    title: "Decision Making Practice",
    leftTitle: "Syllogism",
    stimulus: [
      `All ${a} are ${b}. Some ${a} are ${c}. No ${b} are ${d}.`,
    ],
    question: "Place 'Yes' if the conclusion follows. Place 'No' if it does not follow.",
    instruction: "Use only the information given.",
    yesNoStatements: [
      { id: "some-c-b", text: `Some ${c} are ${b}.`, answer: "Yes" },
      { id: "no-a-d", text: `No ${a} are ${d}.`, answer: "Yes" },
      { id: "all-c-b", text: `All ${c} are ${b}.`, answer: "No" },
      { id: "some-d-a", text: `Some ${d} are ${a}.`, answer: "No" },
      { id: "all-b-a", text: `All ${b} are ${a}.`, answer: "No" },
    ],
    explanation:
      "The definite conclusions follow through the 'all' and 'no' links. The wider claims are not guaranteed by the premises.",
  };
}

const LOGIC_NAMES = [
  ["Asha", "Ben", "Clara", "Dev"],
  ["Mina", "Owen", "Priya", "Sam"],
  ["Iris", "Jude", "Kiran", "Lena"],
  ["Noah", "Elif", "Hana", "Tariq"],
];

function makeDmLogic(index: number): UCATQuestion {
  const names = LOGIC_NAMES[index % LOGIC_NAMES.length];
  const rotation = index % names.length;
  const order = [...names.slice(rotation), ...names.slice(0, rotation)];
  const askedPosition = index % 4;
  const positions = ["first", "second", "third", "fourth"];
  return singleQuestion({
    id: `quality-dm-logic-${pad(index)}`,
    section: "dm",
    subtype: "dm-logic",
    tags: ["text-stem", "hard", "time-consuming"],
    title: "Decision Making Practice",
    leftTitle: "Logic puzzle",
    stimulus: [
      `Four students give presentations in the order first to fourth. ${order[1]} presents immediately after ${order[0]}. ${order[2]} presents after ${order[1]} but before ${order[3]}. No two students present at the same time.`,
    ],
    question: `Who presents ${positions[askedPosition]}?`,
    correctText: order[askedPosition],
    distractors: order.filter((name) => name !== order[askedPosition]),
    explanation: `The clues fix the order as ${order.join(", ")}.`,
    seed: index,
  });
}

const ARGUMENT_TOPICS = [
  ["Should a college keep a silent study room open at lunch?", "It gives students without quiet homes a predictable place to work, provided supervision is arranged."],
  ["Should a clinic send appointment maps by text?", "It may reduce avoidable lateness because many late arrivals are caused by confusion about entrances."],
  ["Should a library extend laptop loans?", "It supports users who cannot afford devices, but the scheme needs a booking and repair process."],
  ["Should a council trial timed recycling collections?", "A small trial can test whether timed collections reduce missed bins before a costly borough-wide change."],
  ["Should a school publish revision-session attendance?", "Individual attendance should remain private; aggregated figures can guide planning without naming pupils."],
  ["Should a museum run shorter school tours?", "Shorter tours may improve attention for younger pupils if teachers can still request longer sessions."],
];

function makeDmArgument(index: number): UCATQuestion {
  const [issue, correct] = ARGUMENT_TOPICS[index % ARGUMENT_TOPICS.length];
  return singleQuestion({
    id: `quality-dm-argument-${pad(index)}`,
    section: "dm",
    subtype: "dm-arguments",
    tags: ["text-stem", "easy", "quick"],
    title: "Decision Making Practice",
    leftTitle: "Strongest argument",
    stimulus: [issue],
    question: "Which is the strongest argument?",
    correctText: correct,
    distractors: [
      "Yes, because any new idea is automatically better than the current system.",
      "No, because one possible problem means the proposal can never be useful.",
      "Yes, because everyone will certainly prefer it, regardless of their circumstances.",
    ],
    explanation:
      "The strongest argument is relevant, balanced and linked to the stated aim rather than relying on exaggeration.",
    seed: index,
  });
}

function makeDmYesNo(index: number): UCATQuestion {
  const a = 48 + (index % 8) * 5;
  const b = 36 + (index % 7) * 4;
  const c = 22 + (index % 6) * 3;
  const total = a + b + c;
  return {
    id: `quality-dm-yes-no-${pad(index)}`,
    section: "dm",
    subtype: "dm-yes-no",
    questionType: "yes-no",
    tags: ["text-stem", "medium", "multi-step"],
    title: "Decision Making Practice",
    leftTitle: "Data conclusions",
    stimulus: [
      `A training provider recorded ${a} learners on clinical-skills sessions, ${b} learners on interview sessions and ${c} learners on calculation sessions. Each learner chose only one session type. The provider had capacity for ${total + 12} learners.`,
    ],
    question: "Place 'Yes' if the conclusion follows. Place 'No' if it does not follow.",
    instruction: "Use only the information given.",
    yesNoStatements: [
      { id: "total", text: `The provider recorded ${total} learners in total.`, answer: "Yes" },
      { id: "spare", text: "There were 12 unused places.", answer: "Yes" },
      { id: "clinical-majority", text: "Clinical-skills learners made up more than half of all learners.", answer: a > total / 2 ? "Yes" : "No" },
      { id: "interview-more", text: "More learners chose interview sessions than calculation sessions.", answer: b > c ? "Yes" : "No" },
      { id: "reasons", text: "Learners chose clinical-skills sessions because they were the cheapest.", answer: "No" },
    ],
    explanation:
      "The numerical conclusions can be checked from the counts. The reason for learners' choices is not given.",
  };
}

function makeDmVenn(index: number): UCATQuestion {
  const total = 90 + (index % 7) * 6;
  const a = 38 + (index % 6) * 4;
  const b = 34 + (index % 5) * 5;
  const both = 12 + (index % 4) * 3;
  const onlyA = a - both;
  const onlyB = b - both;
  const neither = total - onlyA - onlyB - both;
  const asks = [
    ["How many people chose only the first activity?", onlyA],
    ["How many people chose exactly one of the two activities?", onlyA + onlyB],
    ["How many people chose neither activity?", neither],
    ["How many people chose at least one of the two activities?", onlyA + onlyB + both],
  ] as const;
  const [question, correct] = asks[index % asks.length];
  return singleQuestion({
    id: `quality-dm-venn-${pad(index)}`,
    section: "dm",
    subtype: "dm-venn-sets",
    tags: ["set-based", index % 4 === 1 ? "hard" : "medium", "multi-step"],
    title: "Decision Making Practice",
    leftTitle: "Set problem",
    stimulus: [
      `In a group of ${total} applicants, ${a} chose a mock interview, ${b} chose a calculation clinic, and ${both} chose both activities.`,
    ],
    question,
    correctText: formatNumber(correct),
    distractors: numericDistractors(correct, index),
    explanation: `Only first = ${a} - ${both} = ${onlyA}; only second = ${b} - ${both} = ${onlyB}; neither = ${total} - ${onlyA + onlyB + both} = ${neither}.`,
    seed: index,
  });
}

function makeDmProbability(index: number): UCATQuestion {
  const red = 3 + (index % 5);
  const blue = 5 + (index % 4);
  const green = 4 + (index % 3);
  const total = red + blue + green;
  const askBlueOrGreen = index % 2 === 0;
  const numerator = askBlueOrGreen ? blue + green : red;
  return singleQuestion({
    id: `quality-dm-probability-${pad(index)}`,
    section: "dm",
    subtype: "dm-probability-data",
    tags: ["text-stem", "medium"],
    title: "Decision Making Practice",
    leftTitle: "Probability",
    stimulus: [
      `A box contains ${red} red cards, ${blue} blue cards and ${green} green cards. One card is selected at random.`,
    ],
    question: askBlueOrGreen
      ? "What is the probability that the card is blue or green?"
      : "What is the probability that the card is red?",
    correctText: fraction(numerator, total),
    distractors: [
      fraction(blue, total),
      fraction(green, total),
      fraction(total - numerator, total),
    ],
    explanation: `There are ${numerator} favourable cards out of ${total}, so the probability is ${fraction(numerator, total)}.`,
    seed: index,
  });
}

export const QUALITY_9200_DM_QUESTIONS: UCATQuestion[] = [
  ...range(300).map(makeDmSyllogism),
  ...range(300).map(makeDmLogic),
  ...range(250).map(makeDmArgument),
  ...range(250).map(makeDmYesNo),
  ...range(400).map(makeDmVenn),
  ...range(250).map(makeDmProbability),
];

type SjtScenario = {
  setting: string;
  tension: string;
  issueTags: UCATSjtIssueTag[];
  safeAction: string;
  partialAction: string;
  weakAction: string;
  unsafeAction: string;
  importantFactor: string;
  minorFactor: string;
};

const SJT_SCENARIOS: SjtScenario[] = [
  {
    setting: "During a ward shadowing placement, you notice a patient looking anxious after a handover.",
    tension: "The team is busy and the patient has not asked a direct question.",
    issueTags: ["communication", "patient-safety", "respect-dignity"],
    safeAction: "Ask the patient whether they would like you to find a qualified staff member to answer their questions.",
    partialAction: "Wait a few minutes to see whether the patient raises the concern again.",
    weakAction: "Reassure the patient that everything is fine without checking what they have heard.",
    unsafeAction: "Explain the handover details from memory in a public area.",
    importantFactor: "The patient may have misunderstood information that affects their confidence in care.",
    minorFactor: "Whether the corridor is busier than usual that morning.",
  },
  {
    setting: "A friend in your teaching group asks to see your reflective placement notes.",
    tension: "Your notes include details that could identify a patient even though the name is omitted.",
    issueTags: ["confidentiality", "integrity", "professional-boundaries"],
    safeAction: "Decline to share the notes and offer to discuss the general learning points without identifiable details.",
    partialAction: "Remove obvious names but leave the timing, ward and unusual clinical details unchanged.",
    weakAction: "Send the notes because your friend says they will delete them afterwards.",
    unsafeAction: "Upload the notes to a shared group folder so others can learn from them.",
    importantFactor: "Patients can be identifiable from context even when names are removed.",
    minorFactor: "Whether your friend usually receives higher marks than you.",
  },
  {
    setting: "In a skills session, a student repeatedly signs equipment logs without actually cleaning the equipment.",
    tension: "You are not the session lead, but other students will use the equipment later.",
    issueTags: ["integrity", "patient-safety", "escalation"],
    safeAction: "Raise the concern with the session lead and explain what you observed.",
    partialAction: "Clean the equipment yourself this time but say nothing about the false log entries.",
    weakAction: "Ignore it because the equipment looks clean from a distance.",
    unsafeAction: "Sign the remaining logs for the student to avoid conflict.",
    importantFactor: "False records can create a safety risk and undermine trust in the process.",
    minorFactor: "Whether the student is in the same friendship group as you.",
  },
  {
    setting: "A patient tells you they do not understand a consent form before a procedure.",
    tension: "A staff member has asked you to help move the patient to the procedure room.",
    issueTags: ["capacity-consent", "autonomy", "escalation"],
    safeAction: "Pause and tell the qualified staff member that the patient has questions about consent.",
    partialAction: "Encourage the patient to sign first because the staff member can explain later.",
    weakAction: "Tell the patient that forms are routine and everyone signs them.",
    unsafeAction: "Witness the form even though the patient has said they do not understand it.",
    importantFactor: "Consent must be informed and the concern should be addressed before proceeding.",
    minorFactor: "Whether the form is printed on one page or two pages.",
  },
  {
    setting: "A colleague makes a dismissive joke about a patient who needs an interpreter.",
    tension: "The comment is made quietly just before a teaching round begins.",
    issueTags: ["respect-dignity", "communication", "teamwork"],
    safeAction: "Challenge the comment calmly and, if needed, seek advice from the supervisor after the round.",
    partialAction: "Avoid laughing but say nothing because the round is about to begin.",
    weakAction: "Repeat the joke later to show you understood it was not serious.",
    unsafeAction: "Tell the patient the colleague was joking about them.",
    importantFactor: "Respectful communication affects patient dignity and team culture.",
    minorFactor: "Whether the colleague used a quiet voice.",
  },
  {
    setting: "You realise you gave a tutor the wrong attendance reason for missing a compulsory session.",
    tension: "The inaccurate reason makes your absence sound more unavoidable than it was.",
    issueTags: ["integrity", "candour", "professional-boundaries"],
    safeAction: "Contact the tutor promptly, correct the record and apologise for the inaccurate explanation.",
    partialAction: "Wait until the tutor asks for evidence before correcting the reason.",
    weakAction: "Leave it because the absence has already been accepted.",
    unsafeAction: "Create a false message to support the original explanation.",
    importantFactor: "Correcting inaccurate information is part of acting honestly.",
    minorFactor: "Whether other students also missed the same session.",
  },
  {
    setting: "During volunteering, a relative asks you for a patient's test result.",
    tension: "The relative says the patient usually tells them everything.",
    issueTags: ["confidentiality", "professional-boundaries", "autonomy"],
    safeAction: "Explain that you cannot share information and direct them to the appropriate staff member.",
    partialAction: "Say that the result looked normal but avoid giving numbers.",
    weakAction: "Ask another volunteer whether the relative is trustworthy.",
    unsafeAction: "Read the result aloud because the relative seems worried.",
    importantFactor: "The patient's permission and proper information-sharing route are essential.",
    minorFactor: "Whether the relative knows your first name.",
  },
  {
    setting: "A junior student says they feel pressured to perform a task they have not been trained to do.",
    tension: "The clinic is running late and the task seems simple.",
    issueTags: ["scope-of-practice", "patient-safety", "teamwork"],
    safeAction: "Encourage them to state their limits and help them find a qualified supervisor.",
    partialAction: "Talk them through it from memory while you both try to finish quickly.",
    weakAction: "Tell them everyone has to learn somehow and leave them to do it.",
    unsafeAction: "Record that the task was supervised even though no supervisor was present.",
    importantFactor: "Working beyond competence can put patients and students at risk.",
    minorFactor: "Whether the clinic usually finishes on time.",
  },
  {
    setting: "A patient says they do not want a student present for a consultation.",
    tension: "You were hoping to observe the consultation for a portfolio reflection.",
    issueTags: ["autonomy", "respect-dignity", "professional-boundaries"],
    safeAction: "Leave promptly and thank the patient, making clear that their care will not be affected.",
    partialAction: "Ask once whether they are sure, because you need the observation.",
    weakAction: "Remain silently in the corner because the doctor has not asked you to leave.",
    unsafeAction: "Complain in the waiting area that the patient has damaged your portfolio chances.",
    importantFactor: "The patient has the right to decline student involvement.",
    minorFactor: "Whether your portfolio deadline is the following week.",
  },
  {
    setting: "You find an unattended clinic computer still open on a patient record.",
    tension: "The staff member who was using it has stepped away briefly.",
    issueTags: ["confidentiality", "patient-safety", "integrity"],
    safeAction: "Avoid reading the record and alert a staff member or lock the screen if you have been shown how.",
    partialAction: "Quickly check the record to identify the staff member who left it open.",
    weakAction: "Leave the screen open because the staff member is probably nearby.",
    unsafeAction: "Take a photo of the record so you can report it later.",
    importantFactor: "Patient records must be protected from unnecessary access.",
    minorFactor: "Whether the computer monitor is new.",
  },
];

function makeSjtAppropriateness(index: number): UCATQuestion {
  const scenario = SJT_SCENARIOS[index % SJT_SCENARIOS.length];
  const actions: Array<[string, UCATOptionKey, string]> = [
    [scenario.safeAction, "A" as const, "This protects the patient or professional standard while using the right escalation route."],
    [scenario.partialAction, "B" as const, "This may be well-intentioned, but it leaves an important issue unresolved or delayed."],
    [scenario.weakAction, "C" as const, "This is not a good response, although it is less serious than actively breaching a duty."],
    [scenario.unsafeAction, "D" as const, "This directly risks confidentiality, safety, consent, honesty or dignity."],
  ];
  const [action, answer, explanation] = actions[index % actions.length];
  return {
    id: `quality-sjt-appropriateness-${pad(index)}`,
    section: "sjt",
    subtype: "sjt-appropriateness",
    issueTags: scenario.issueTags,
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [scenario.setting, scenario.tension],
    question: `How appropriate is the following response? ${action}`,
    options: APPROPRIATENESS_OPTIONS,
    answer,
    explanation,
  };
}

function makeSjtImportance(index: number): UCATQuestion {
  const scenario = SJT_SCENARIOS[(index * 3) % SJT_SCENARIOS.length];
  const factors: Array<[string, UCATOptionKey, string]> = [
    [scenario.importantFactor, "A" as const, "This goes to a core professional duty or patient interest."],
    ["Whether a qualified person can help you address the issue safely.", "B" as const, "This matters because escalation and supervision often determine the safest next step."],
    [scenario.minorFactor, "C" as const, "This may affect convenience or context, but it should not drive the professional judgement."],
    ["Whether dealing with the concern might make you look less confident.", "D" as const, "Personal image is not a proper reason to ignore a professional concern."],
  ];
  const [factor, answer, explanation] = factors[index % factors.length];
  return {
    id: `quality-sjt-importance-${pad(index)}`,
    section: "sjt",
    subtype: "sjt-importance",
    issueTags: scenario.issueTags,
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [scenario.setting, scenario.tension],
    question: `How important is the following consideration? ${factor}`,
    options: IMPORTANCE_OPTIONS,
    answer,
    explanation,
  };
}

function makeSjtDrag(index: number): UCATQuestion {
  const scenario = SJT_SCENARIOS[(index * 5) % SJT_SCENARIOS.length];
  return {
    id: `quality-sjt-drag-${pad(index)}`,
    section: "sjt",
    subtype: "sjt-drag-drop",
    questionType: "drag-category",
    issueTags: scenario.issueTags,
    title: "Situational Judgement Practice",
    leftTitle: "Scenario",
    stimulus: [scenario.setting, scenario.tension],
    question: "Sort each response as appropriate or inappropriate.",
    instruction: "Place each action into the most suitable category.",
    categories: [
      { id: "appropriate", label: "Appropriate" },
      { id: "inappropriate", label: "Inappropriate" },
    ],
    categoryItems: [
      { id: "safe-action", text: scenario.safeAction, answerCategory: "appropriate" },
      {
        id: "escalate-action",
        text: "Seek advice from a qualified supervisor before acting beyond your role.",
        answerCategory: "appropriate",
      },
      { id: "weak-action", text: scenario.weakAction, answerCategory: "inappropriate" },
      { id: "unsafe-action", text: scenario.unsafeAction, answerCategory: "inappropriate" },
    ],
    explanation:
      "Appropriate responses protect patients, respect professional boundaries and use supervision. Inappropriate responses ignore or worsen the concern.",
  };
}

export const QUALITY_9200_SJT_QUESTIONS: UCATQuestion[] = [
  ...range(1200).map(makeSjtAppropriateness),
  ...range(1250).map(makeSjtImportance),
  ...range(1000).map(makeSjtDrag),
];
