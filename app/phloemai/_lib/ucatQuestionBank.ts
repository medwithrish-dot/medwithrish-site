import { CURATED_VR_QUESTIONS } from "./ucatVrCuratedInputs";
import { CURATED_DM_QUESTIONS } from "./ucatDmCuratedInputs";
import { CURATED_QR_QUESTIONS } from "./ucatQrCuratedInputs";
import { CURATED_SJT_QUESTIONS } from "./ucatSjtCuratedInputs";
import { reviewUCATQuestionBank } from "./ucatQuestionQualityGate";

// Future generated-bank work should first read ./ucatQuestionDesignNotes.md.
export type UCATSection = "vr" | "dm" | "qr" | "sjt";
export type UCATOptionKey = "A" | "B" | "C" | "D" | "E";
export type UCATYesNoValue = "Yes" | "No";

export type UCATSubtypeId =
  | "vr-tfc"
  | "vr-inference"
  | "vr-author"
  | "vr-detail"
  | "vr-negative"
  | "vr-summary"
  | "dm-syllogisms"
  | "dm-logic"
  | "dm-arguments"
  | "dm-probability-data"
  | "dm-yes-no"
  | "dm-venn-sets"
  | "dm-venn-select"
  | "qr-graphs"
  | "qr-percentages"
  | "qr-rates-ratios"
  | "qr-averages"
  | "qr-units-geometry"
  | "qr-estimation"
  | "qr-calculator-strategy"
  | "sjt-appropriateness"
  | "sjt-importance"
  | "sjt-drag-drop";

export type UCATSetShape =
  | "circle"
  | "rectangle"
  | "triangle"
  | "pentagon"
  | "diamond"
  | "hexagon";

export type UCATQuestionTag =
  | "calculator-heavy"
  | "time-consuming"
  | "multi-step"
  | "easy"
  | "hard"
  | "medium"
  | "quick"
  | "data-display"
  | "text-stem"
  | "set-based"
  | "true-false-cant-tell"
  | "detail-retrieval"
  | "negative-except"
  | "author-opinion"
  | "inference-question"
  | "hypothetical-scenario"
  | "summary-structure";

export type UCATMostLeastSlot = "most" | "least";

export type UCATSjtIssueTag =
  | "autonomy"
  | "beneficence"
  | "candour"
  | "capacity-consent"
  | "communication"
  | "confidentiality"
  | "escalation"
  | "integrity"
  | "justice"
  | "non-maleficence"
  | "patient-safety"
  | "professional-boundaries"
  | "respect-dignity"
  | "scope-of-practice"
  | "teamwork";

export const UCAT_SJT_ISSUE_LABELS: Record<UCATSjtIssueTag, string> = {
  autonomy: "Autonomy",
  beneficence: "Beneficence",
  candour: "Candour",
  "capacity-consent": "Capacity and consent",
  communication: "Communication",
  confidentiality: "Confidentiality",
  escalation: "Escalation",
  integrity: "Integrity",
  justice: "Justice",
  "non-maleficence": "Non-maleficence",
  "patient-safety": "Patient safety",
  "professional-boundaries": "Professional boundaries",
  "respect-dignity": "Respect and dignity",
  "scope-of-practice": "Scope of practice",
  teamwork: "Teamwork",
};

export type UCATChartVisual =
  | {
      type: "bar";
      title: string;
      yLabel: string;
      categories: Array<{ label: string; value: number }>;
      max: number;
      note?: string;
    }
  | {
      type: "grouped-bar";
      title: string;
      yLabel: string;
      seriesLabels: string[];
      groups: Array<{ label: string; values: number[] }>;
      max: number;
      note?: string;
    }
  | {
      type: "line";
      title: string;
      yLabel: string;
      points: Array<{ label: string; value: number }>;
      max: number;
      note?: string;
    }
  | {
      type: "pie";
      title: string;
      slices: Array<{ label: string; value: number }>;
      note?: string;
    }
  | {
      type: "table";
      title: string;
      headers: string[];
      rows: string[][];
      note?: string;
    }
  | {
      type: "set-diagram";
      title: string;
      shapes: Array<{
        id: string;
        label: string;
        shape: UCATSetShape;
        x: number;
        y: number;
        width: number;
        height: number;
        rotation?: number;
      }>;
      regionLabels: Array<{ id: string; text: string; x: number; y: number }>;
      legend?: Array<{ label: string; shape: UCATSetShape }>;
      note?: string;
    };

type UCATQuestionBase = {
  id: string;
  section: UCATSection;
  subtype: UCATSubtypeId;
  setId?: string;
  tags?: UCATQuestionTag[];
  title: string;
  leftTitle?: string;
  stimulus: string[];
  visual?: UCATChartVisual;
  issueTags?: UCATSjtIssueTag[];
  question: string;
  explanation: string;
};

export type UCATSingleQuestion = UCATQuestionBase & {
  questionType?: "single";
  options: Array<{ key: UCATOptionKey; text: string; visual?: UCATChartVisual }>;
  answer: UCATOptionKey;
};

export type UCATDragOrderQuestion = UCATQuestionBase & {
  questionType: "drag-order";
  dragItems: Array<{ id: string; text: string }>;
  answerOrder: string[];
  instruction: string;
};

export type UCATDragCategoryQuestion = UCATQuestionBase & {
  questionType: "drag-category";
  instruction: string;
  categories: Array<{ id: string; label: string }>;
  categoryItems: Array<{ id: string; text: string; answerCategory: string }>;
};

export type UCATYesNoQuestion = UCATQuestionBase & {
  questionType: "yes-no";
  instruction: string;
  yesNoStatements: Array<{
    id: string;
    text: string;
    answer: UCATYesNoValue;
  }>;
};

export type UCATMostLeastQuestion = UCATQuestionBase & {
  questionType: "most-least";
  instruction: string;
  actionItems: Array<{ id: string; text: string }>;
  answerSlots: Record<UCATMostLeastSlot, string>;
};

export type UCATQuestion =
  | UCATSingleQuestion
  | UCATDragOrderQuestion
  | UCATDragCategoryQuestion
  | UCATYesNoQuestion
  | UCATMostLeastQuestion;

export const UCAT_SECTIONS: Array<{
  slug: UCATSection;
  code: string;
  title: string;
  bankTitle: string;
  description: string;
  secondsPerQuestion: number;
}> = [
  {
    slug: "vr",
    code: "VR",
    title: "Verbal Reasoning",
    bankTitle: "PhloemAI Verbal Reasoning",
    description: "Passage comprehension, inference and author attitude.",
    secondsPerQuestion: 64,
  },
  {
    slug: "dm",
    code: "DM",
    title: "Decision Making",
    bankTitle: "PhloemAI Decision Making",
    description: "Logic, syllogisms, probability, data and arguments.",
    secondsPerQuestion: 64,
  },
  {
    slug: "qr",
    code: "QR",
    title: "Quantitative Reasoning",
    bankTitle: "PhloemAI Quantitative Reasoning",
    description: "Numerical problem solving across graphs, rates and data.",
    secondsPerQuestion: 41,
  },
  {
    slug: "sjt",
    code: "SJT",
    title: "Situational Judgement",
    bankTitle: "PhloemAI Situational Judgement",
    description: "Appropriateness, importance and professional judgement.",
    secondsPerQuestion: 26,
  },
];

export const UCAT_SUBTYPES: Record<
  UCATSection,
  Array<{ id: UCATSubtypeId; label: string; description: string }>
> = {
  vr: [
    {
      id: "vr-tfc",
      label: "True / false / can't tell",
      description: "Judge whether a statement follows from the passage.",
    },
    {
      id: "vr-inference",
      label: "Inference",
      description: "Choose the statement best supported by the text.",
    },
    {
      id: "vr-author",
      label: "Author's opinion",
      description: "Identify tone, attitude or likely author agreement.",
    },
    {
      id: "vr-detail",
      label: "Main idea and detail",
      description: "Find the purpose, detail or central reason in the passage.",
    },
    {
      id: "vr-negative",
      label: "Except / not supported",
      description: "Find the false, unsupported or exception statement.",
    },
    {
      id: "vr-summary",
      label: "Summary and structure",
      description: "Select the best summary, title or structural role.",
    },
  ],
  dm: [
    {
      id: "dm-syllogisms",
      label: "Syllogisms",
      description: "Use Yes/No conclusions to decide what must follow.",
    },
    {
      id: "dm-logic",
      label: "Logical puzzles",
      description: "Apply rules, ordering and constraints.",
    },
    {
      id: "dm-arguments",
      label: "Strongest argument",
      description: "Pick the most relevant, evidence-based argument.",
    },
    {
      id: "dm-yes-no",
      label: "Yes / no questions",
      description: "Evaluate conclusions from a short paragraph or data set.",
    },
    {
      id: "dm-venn-sets",
      label: "Venn diagrams",
      description: "Work with overlaps, exclusions and grouped information.",
    },
    {
      id: "dm-probability-data",
      label: "Probability",
      description: "Use chance, combinations and conditional probability.",
    },
  ],
  qr: [
    {
      id: "qr-graphs",
      label: "Data displays",
      description: "Interpret charts, tables, text-only data and visual trends.",
    },
    {
      id: "qr-percentages",
      label: "Percentages, fractions and finance",
      description: "Use percentage change, fractions, discounts, tax and margins.",
    },
    {
      id: "qr-rates-ratios",
      label: "Rates, ratios and proportions",
      description: "Scale quantities, speeds, unit costs and rates.",
    },
    {
      id: "qr-averages",
      label: "Averages, totals and spread",
      description: "Use mean, median, mode, range, totals and missing values.",
    },
    {
      id: "qr-units-geometry",
      label: "Units, geometry and scale",
      description: "Handle conversions, area, volume and scaled measurements.",
    },
    {
      id: "qr-estimation",
      label: "Estimation and mental maths",
      description: "Round, approximate and spot whether an answer is reasonable.",
    },
    {
      id: "qr-calculator-strategy",
      label: "Calculator and working strategy",
      description: "Choose efficient calculator, noteboard and multi-step methods.",
    },
  ],
  sjt: [
    {
      id: "sjt-appropriateness",
      label: "Appropriateness",
      description: "Judge whether an action is suitable in context.",
    },
    {
      id: "sjt-importance",
      label: "Importance",
      description: "Judge how important a consideration or action is.",
    },
    {
      id: "sjt-drag-drop",
      label: "Drag and drop",
      description: "Sort actions into appropriate or inappropriate.",
    },
  ],
};

export const LEGACY_VR_QUESTIONS: UCATQuestion[] = [
  {
    id: "vr-bank-tfc-001",
    section: "vr",
    subtype: "vr-tfc",
    setId: "vr-caption-screens",
    tags: ["true-false-cant-tell", "easy", "quick", "text-stem"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Harbourview Theatre piloted caption screens for Saturday matinee performances. The screens displayed dialogue and sound cues beside the stage. The aim was to improve access for deaf and hard-of-hearing visitors without changing the evening programme.",
      "During the twelve-week trial, matinee ticket sales rose by 9%. Surveys from 130 attendees showed that most visitors who used captions also valued the sound cues. Managers said the sales rise could not be attributed solely to the screens, because a student discount began in the same week. A permanent installation will depend on repair costs and a review of sightlines.",
    ],
    question:
      "The caption screens were used for evening performances during the trial. According to the passage, this statement is:",
    options: [
      { key: "A", text: "True" },
      { key: "B", text: "False" },
      { key: "C", text: "Can't tell" },
    ],
    answer: "B",
    explanation:
      "The passage states that the screens were piloted for Saturday matinee performances and that the evening programme was not changed.",
  },
  {
    id: "vr-bank-tfc-002",
    section: "vr",
    subtype: "vr-tfc",
    setId: "vr-caption-screens",
    tags: ["true-false-cant-tell", "medium", "text-stem"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Harbourview Theatre piloted caption screens for Saturday matinee performances. The screens displayed dialogue and sound cues beside the stage. The aim was to improve access for deaf and hard-of-hearing visitors without changing the evening programme.",
      "During the twelve-week trial, matinee ticket sales rose by 9%. Surveys from 130 attendees showed that most visitors who used captions also valued the sound cues. Managers said the sales rise could not be attributed solely to the screens, because a student discount began in the same week. A permanent installation will depend on repair costs and a review of sightlines.",
    ],
    question:
      "The increase in matinee ticket sales was caused by the caption screens. According to the passage, this statement is:",
    options: [
      { key: "A", text: "True" },
      { key: "B", text: "False" },
      { key: "C", text: "Can't tell" },
    ],
    answer: "C",
    explanation:
      "Sales rose, but the managers specifically say the rise cannot be attributed solely to the screens because a discount started at the same time.",
  },
  {
    id: "vr-bank-tfc-003",
    section: "vr",
    subtype: "vr-tfc",
    setId: "vr-caption-screens",
    tags: [
      "true-false-cant-tell",
      "hard",
      "time-consuming",
      "text-stem",
    ],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Harbourview Theatre piloted caption screens for Saturday matinee performances. The screens displayed dialogue and sound cues beside the stage. The aim was to improve access for deaf and hard-of-hearing visitors without changing the evening programme.",
      "During the twelve-week trial, matinee ticket sales rose by 9%. Surveys from 130 attendees showed that most visitors who used captions also valued the sound cues. Managers said the sales rise could not be attributed solely to the screens, because a student discount began in the same week. A permanent installation will depend on repair costs and a review of sightlines.",
    ],
    question:
      "Most surveyed caption users found the sound-cue information useful. According to the passage, this statement is:",
    options: [
      { key: "A", text: "True" },
      { key: "B", text: "False" },
      { key: "C", text: "Can't tell" },
    ],
    answer: "A",
    explanation:
      "The passage states that most visitors who used captions also valued the sound cues.",
  },
  {
    id: "vr-bank-detail-001",
    section: "vr",
    subtype: "vr-detail",
    setId: "vr-seed-library",
    tags: ["detail-retrieval", "easy", "quick", "text-stem"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Northbridge Library opened a seed-exchange drawer after local gardeners said commercial seed packs were often too large for small balconies. Members could take up to six packets each spring if they agreed to return seeds or growing notes at the end of the season. The library did not require successful harvesting; it valued records of what failed as well as what grew.",
      "After the first year, basil and dwarf beans were the most borrowed seeds. Staff noticed that returned notes were often more useful than returned seeds because they helped choose varieties for shaded flats. The scheme was funded from the library's adult-learning budget, not from council parks money.",
    ],
    question: "Why did Northbridge Library open the seed-exchange drawer?",
    options: [
      { key: "A", text: "Commercial seed packs were often too large for balcony gardeners." },
      { key: "B", text: "Council parks money had become unavailable." },
      { key: "C", text: "The library wanted to stop members growing basil." },
      { key: "D", text: "Members were required to harvest every packet successfully." },
    ],
    answer: "A",
    explanation:
      "The opening sentence gives the reason: local gardeners said commercial seed packs were often too large for small balconies.",
  },
  {
    id: "vr-bank-detail-002",
    section: "vr",
    subtype: "vr-detail",
    setId: "vr-seed-library",
    tags: ["detail-retrieval", "medium", "quick", "text-stem"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Northbridge Library opened a seed-exchange drawer after local gardeners said commercial seed packs were often too large for small balconies. Members could take up to six packets each spring if they agreed to return seeds or growing notes at the end of the season. The library did not require successful harvesting; it valued records of what failed as well as what grew.",
      "After the first year, basil and dwarf beans were the most borrowed seeds. Staff noticed that returned notes were often more useful than returned seeds because they helped choose varieties for shaded flats. The scheme was funded from the library's adult-learning budget, not from council parks money.",
    ],
    question: "According to the passage, the most borrowed seeds were:",
    options: [
      { key: "A", text: "carrots and basil." },
      { key: "B", text: "basil and dwarf beans." },
      { key: "C", text: "dwarf beans and tomatoes." },
      { key: "D", text: "lettuce and carrots." },
    ],
    answer: "B",
    explanation:
      "The second paragraph states that basil and dwarf beans were the most borrowed seeds.",
  },
  {
    id: "vr-bank-detail-003",
    section: "vr",
    subtype: "vr-detail",
    setId: "vr-seed-library",
    tags: ["detail-retrieval", "hard", "text-stem"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Northbridge Library opened a seed-exchange drawer after local gardeners said commercial seed packs were often too large for small balconies. Members could take up to six packets each spring if they agreed to return seeds or growing notes at the end of the season. The library did not require successful harvesting; it valued records of what failed as well as what grew.",
      "After the first year, basil and dwarf beans were the most borrowed seeds. Staff noticed that returned notes were often more useful than returned seeds because they helped choose varieties for shaded flats. The scheme was funded from the library's adult-learning budget, not from council parks money.",
    ],
    question: "Returned notes were especially useful because they:",
    options: [
      { key: "A", text: "proved that every member had harvested successfully." },
      { key: "B", text: "allowed the scheme to be funded by council parks money." },
      { key: "C", text: "helped staff select varieties for shaded flats." },
      { key: "D", text: "showed that basil should no longer be stocked." },
    ],
    answer: "C",
    explanation:
      "The passage says the notes helped staff choose varieties for shaded flats, which made them more useful than returned seeds.",
  },
  {
    id: "vr-bank-negative-001",
    section: "vr",
    subtype: "vr-negative",
    setId: "vr-rain-gardens",
    tags: ["negative-except", "easy", "text-stem"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Riverside installed rain gardens along three streets where heavy rain often overwhelmed drains. The planted beds were designed to hold water temporarily, filter grit before it reached the river and make paved areas cooler in summer. Local volunteers helped plant them, partly because the council wanted residents to understand why some kerbs had been lowered.",
      "Engineers said the gardens should reduce small floods but would not prevent flooding in major storms. Maintenance crews had to clear litter from the beds after market days, which made the pilot more demanding than expected. The council still extended the scheme to two more streets because sensors showed a slower rush of water into drains after ordinary rain.",
    ],
    question:
      "Which of the following was not a stated aim of installing the rain gardens?",
    options: [
      { key: "A", text: "Holding water temporarily." },
      { key: "B", text: "Filtering grit before it reached the river." },
      { key: "C", text: "Cooling paved areas in summer." },
      { key: "D", text: "Increasing market-stall sales." },
    ],
    answer: "D",
    explanation:
      "The passage lists water storage, grit filtering and cooling paved areas as aims. It does not mention market-stall sales as an aim.",
  },
  {
    id: "vr-bank-negative-002",
    section: "vr",
    subtype: "vr-negative",
    setId: "vr-rain-gardens",
    tags: ["negative-except", "medium", "text-stem"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Riverside installed rain gardens along three streets where heavy rain often overwhelmed drains. The planted beds were designed to hold water temporarily, filter grit before it reached the river and make paved areas cooler in summer. Local volunteers helped plant them, partly because the council wanted residents to understand why some kerbs had been lowered.",
      "Engineers said the gardens should reduce small floods but would not prevent flooding in major storms. Maintenance crews had to clear litter from the beds after market days, which made the pilot more demanding than expected. The council still extended the scheme to two more streets because sensors showed a slower rush of water into drains after ordinary rain.",
    ],
    question: "All of the following are true of the rain gardens except:",
    options: [
      { key: "A", text: "They were first installed along three streets." },
      { key: "B", text: "They involved local volunteers." },
      { key: "C", text: "They were expected to prevent flooding in major storms." },
      { key: "D", text: "They were extended to two additional streets." },
    ],
    answer: "C",
    explanation:
      "Engineers said the gardens would not prevent flooding in major storms, so option C is the exception.",
  },
  {
    id: "vr-bank-negative-003",
    section: "vr",
    subtype: "vr-negative",
    setId: "vr-rain-gardens",
    tags: [
      "negative-except",
      "hard",
      "time-consuming",
      "text-stem",
    ],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Riverside installed rain gardens along three streets where heavy rain often overwhelmed drains. The planted beds were designed to hold water temporarily, filter grit before it reached the river and make paved areas cooler in summer. Local volunteers helped plant them, partly because the council wanted residents to understand why some kerbs had been lowered.",
      "Engineers said the gardens should reduce small floods but would not prevent flooding in major storms. Maintenance crews had to clear litter from the beds after market days, which made the pilot more demanding than expected. The council still extended the scheme to two more streets because sensors showed a slower rush of water into drains after ordinary rain.",
    ],
    question: "Which statement is not supported by the passage?",
    options: [
      { key: "A", text: "Sensors provided evidence that ordinary rain reached drains more slowly." },
      { key: "B", text: "The pilot required less maintenance than the council expected." },
      { key: "C", text: "Lowered kerbs were part of the rain-garden design." },
      { key: "D", text: "The gardens were intended to reduce smaller flooding problems." },
    ],
    answer: "B",
    explanation:
      "The passage says litter clearance made the pilot more demanding than expected, not less demanding.",
  },
  {
    id: "vr-bank-author-001",
    section: "vr",
    subtype: "vr-author",
    setId: "vr-remote-museums",
    tags: ["author-opinion", "easy", "text-stem"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Several small museums now offer live video tours for classes that cannot travel. The author notes that these tours can bring rare collections to pupils who would otherwise never see them, and curators can adapt explanations to questions in real time. However, the author argues that remote tours are strongest when they prepare pupils for a later physical visit or support schools too far away to come.",
      "According to the author, the weakness of remote tours is not that screens are inherently shallow. Rather, objects lose some scale, texture and presence when reduced to a camera view. A careful programme can reduce this loss, but it should not pretend that a streamed tour is identical to standing in a gallery.",
    ],
    question: "The author's view of live video museum tours is best described as:",
    options: [
      { key: "A", text: "hostile, because remote tours cannot teach pupils anything." },
      { key: "B", text: "uncritical, because remote tours are identical to gallery visits." },
      { key: "C", text: "supportive but cautious about their limits." },
      { key: "D", text: "indifferent, because access to collections is not discussed." },
    ],
    answer: "C",
    explanation:
      "The author presents real benefits, especially for access, but also stresses that remote tours lose some qualities of a physical visit.",
  },
  {
    id: "vr-bank-author-002",
    section: "vr",
    subtype: "vr-author",
    setId: "vr-remote-museums",
    tags: ["author-opinion", "medium", "text-stem"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Several small museums now offer live video tours for classes that cannot travel. The author notes that these tours can bring rare collections to pupils who would otherwise never see them, and curators can adapt explanations to questions in real time. However, the author argues that remote tours are strongest when they prepare pupils for a later physical visit or support schools too far away to come.",
      "According to the author, the weakness of remote tours is not that screens are inherently shallow. Rather, objects lose some scale, texture and presence when reduced to a camera view. A careful programme can reduce this loss, but it should not pretend that a streamed tour is identical to standing in a gallery.",
    ],
    question: "Which statement would the author most likely support?",
    options: [
      { key: "A", text: "Remote tours should be avoided because screens are always superficial." },
      { key: "B", text: "Remote tours are useful when they improve access or support later visits." },
      { key: "C", text: "Curators cannot respond effectively during live video sessions." },
      { key: "D", text: "Physical museum visits should no longer be encouraged." },
    ],
    answer: "B",
    explanation:
      "The author says remote tours are strongest when they help distant schools or prepare pupils for later physical visits.",
  },
  {
    id: "vr-bank-author-003",
    section: "vr",
    subtype: "vr-author",
    setId: "vr-remote-museums",
    tags: [
      "author-opinion",
      "hard",
      "time-consuming",
      "text-stem",
    ],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Several small museums now offer live video tours for classes that cannot travel. The author notes that these tours can bring rare collections to pupils who would otherwise never see them, and curators can adapt explanations to questions in real time. However, the author argues that remote tours are strongest when they prepare pupils for a later physical visit or support schools too far away to come.",
      "According to the author, the weakness of remote tours is not that screens are inherently shallow. Rather, objects lose some scale, texture and presence when reduced to a camera view. A careful programme can reduce this loss, but it should not pretend that a streamed tour is identical to standing in a gallery.",
    ],
    question: "The author would most likely disagree with the claim that:",
    options: [
      { key: "A", text: "live video tours can be adapted to pupils' questions." },
      { key: "B", text: "a streamed tour can fully replicate standing in a gallery." },
      { key: "C", text: "some schools may be too far away to visit small museums." },
      { key: "D", text: "careful planning can reduce some weaknesses of remote tours." },
    ],
    answer: "B",
    explanation:
      "The passage directly says remote tours should not pretend to be identical to standing in a gallery.",
  },
  {
    id: "vr-bank-inference-001",
    section: "vr",
    subtype: "vr-inference",
    setId: "vr-harbour-evidence",
    tags: ["inference-question", "easy", "text-stem"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Marine archaeologists mapped a silted harbour using nineteenth-century dock plans, fishermen's memories and modern sonar. The dock plans showed where cranes and warehouses once stood, but the shoreline had shifted since they were drawn. Fishermen remembered snagging nets on buried timbers, although their descriptions placed the obstructions in broad areas rather than exact points.",
      "Sonar located several straight-edged objects under the mud, yet it could not show whether they were parts of a pier, wreckage or modern debris. The team argued that the strongest conclusions came when two types of evidence pointed to the same location. They planned to excavate only the sites where documentary and sonar evidence overlapped.",
    ],
    question: "Which statement is best supported by the passage?",
    options: [
      { key: "A", text: "Combining evidence was more reliable than relying on one source alone." },
      { key: "B", text: "The dock plans exactly matched the modern shoreline." },
      { key: "C", text: "Sonar could identify every buried object with certainty." },
      { key: "D", text: "Fishermen's memories were ignored by the research team." },
    ],
    answer: "A",
    explanation:
      "The team said the strongest conclusions came when two types of evidence pointed to the same location.",
  },
  {
    id: "vr-bank-inference-002",
    section: "vr",
    subtype: "vr-inference",
    setId: "vr-harbour-evidence",
    tags: [
      "inference-question",
      "hypothetical-scenario",
      "medium",
      "text-stem",
    ],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Marine archaeologists mapped a silted harbour using nineteenth-century dock plans, fishermen's memories and modern sonar. The dock plans showed where cranes and warehouses once stood, but the shoreline had shifted since they were drawn. Fishermen remembered snagging nets on buried timbers, although their descriptions placed the obstructions in broad areas rather than exact points.",
      "Sonar located several straight-edged objects under the mud, yet it could not show whether they were parts of a pier, wreckage or modern debris. The team argued that the strongest conclusions came when two types of evidence pointed to the same location. They planned to excavate only the sites where documentary and sonar evidence overlapped.",
    ],
    question:
      "If sonar identified an object in a place with no documentary evidence, what would the team most likely do first?",
    options: [
      { key: "A", text: "Excavate it immediately because sonar evidence was treated as conclusive." },
      { key: "B", text: "Avoid prioritising it because the planned excavations required overlapping evidence." },
      { key: "C", text: "Discard the sonar data because fishermen did not mention the location." },
      { key: "D", text: "Assume it was definitely part of a pier." },
    ],
    answer: "B",
    explanation:
      "The team planned to excavate only sites where documentary and sonar evidence overlapped, so a sonar-only location would not be prioritised.",
  },
  {
    id: "vr-bank-inference-003",
    section: "vr",
    subtype: "vr-inference",
    setId: "vr-harbour-evidence",
    tags: [
      "inference-question",
      "hard",
      "time-consuming",
      "text-stem",
    ],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Marine archaeologists mapped a silted harbour using nineteenth-century dock plans, fishermen's memories and modern sonar. The dock plans showed where cranes and warehouses once stood, but the shoreline had shifted since they were drawn. Fishermen remembered snagging nets on buried timbers, although their descriptions placed the obstructions in broad areas rather than exact points.",
      "Sonar located several straight-edged objects under the mud, yet it could not show whether they were parts of a pier, wreckage or modern debris. The team argued that the strongest conclusions came when two types of evidence pointed to the same location. They planned to excavate only the sites where documentary and sonar evidence overlapped.",
    ],
    question: "Which of the following can be inferred from the passage?",
    options: [
      { key: "A", text: "The fishermen gave precise coordinates for each obstruction." },
      { key: "B", text: "Every straight-edged object under the mud was from the nineteenth century." },
      { key: "C", text: "The team considered documentary evidence and sonar evidence stronger together." },
      { key: "D", text: "The shoreline had remained unchanged since the dock plans were drawn." },
    ],
    answer: "C",
    explanation:
      "The team relied most on overlap between sources, showing that documentary and sonar evidence were considered stronger together.",
  },
  {
    id: "vr-bank-summary-001",
    section: "vr",
    subtype: "vr-summary",
    setId: "vr-mobile-library",
    tags: ["summary-structure", "easy", "text-stem"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Westford Council sent a mobile library van to housing estates after the central library began closing early for building work. The van carried exam guides, children's books and laptops with mobile internet. It stopped for only ninety minutes in each area, so borrowers often reserved materials online before it arrived.",
      "The service was praised for reaching readers who could not easily travel into town. Yet librarians found that short visits made it hard to give detailed research help, and unreliable mobile signal sometimes limited laptop use. A review recommended keeping the van after the main library reopened, but as an outreach supplement rather than a replacement.",
    ],
    question: "Which option best summarises the passage?",
    options: [
      { key: "A", text: "The mobile library was unsuccessful because no readers used it." },
      { key: "B", text: "The mobile library replaced the central library permanently." },
      { key: "C", text: "The mobile library improved access but had limits as a full library service." },
      { key: "D", text: "The central library closed because borrowers preferred online reservations." },
    ],
    answer: "C",
    explanation:
      "The passage presents the van as useful for access while also describing limits such as short stops and unreliable signal.",
  },
  {
    id: "vr-bank-summary-002",
    section: "vr",
    subtype: "vr-summary",
    setId: "vr-mobile-library",
    tags: ["summary-structure", "medium", "text-stem"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Westford Council sent a mobile library van to housing estates after the central library began closing early for building work. The van carried exam guides, children's books and laptops with mobile internet. It stopped for only ninety minutes in each area, so borrowers often reserved materials online before it arrived.",
      "The service was praised for reaching readers who could not easily travel into town. Yet librarians found that short visits made it hard to give detailed research help, and unreliable mobile signal sometimes limited laptop use. A review recommended keeping the van after the main library reopened, but as an outreach supplement rather than a replacement.",
    ],
    question: "Which title best fits the passage?",
    options: [
      { key: "A", text: "Why mobile internet ended library outreach" },
      { key: "B", text: "A useful but limited library outreach service" },
      { key: "C", text: "The permanent closure of Westford Central Library" },
      { key: "D", text: "How online reservations replaced books" },
    ],
    answer: "B",
    explanation:
      "The title captures both the benefits of outreach and the limits that prevent the van from replacing the main library.",
  },
  {
    id: "vr-bank-summary-003",
    section: "vr",
    subtype: "vr-summary",
    setId: "vr-mobile-library",
    tags: ["summary-structure", "hard", "text-stem"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Westford Council sent a mobile library van to housing estates after the central library began closing early for building work. The van carried exam guides, children's books and laptops with mobile internet. It stopped for only ninety minutes in each area, so borrowers often reserved materials online before it arrived.",
      "The service was praised for reaching readers who could not easily travel into town. Yet librarians found that short visits made it hard to give detailed research help, and unreliable mobile signal sometimes limited laptop use. A review recommended keeping the van after the main library reopened, but as an outreach supplement rather than a replacement.",
    ],
    question: "What is the main role of the second paragraph?",
    options: [
      { key: "A", text: "To weigh the service's benefits against its limitations and state the review's recommendation." },
      { key: "B", text: "To explain why the central library began building work." },
      { key: "C", text: "To list every book carried by the van." },
      { key: "D", text: "To argue that online reservations made librarians unnecessary." },
    ],
    answer: "A",
    explanation:
      "The second paragraph gives praise, identifies limitations and reports the recommendation to keep the van as a supplement.",
  },
];

const SJT_MOST_LEAST_QUESTIONS = [
  "Choose both the one most appropriate response and the one least appropriate response in this situation.",
  "Select the most appropriate response and the least appropriate response for this situation.",
  "Which response is most appropriate, and which response is least appropriate here?",
  "Choose the one response that would be best and the one response that would be worst in this situation.",
  "Identify the most appropriate response and the least appropriate response.",
  "Drag the response that is most appropriate and the response that is least appropriate into the correct slots.",
] as const;
const SJT_MOST_LEAST_INSTRUCTION =
  "Drag one option to each slot. Half marks are awarded if exactly one slot is correct.";

function textHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function normaliseCategoryId(value: string) {
  return value.toLowerCase().replace(/[^a-z]/g, "");
}

function isPositiveSjtCategory(id: string) {
  const normalised = normaliseCategoryId(id);
  return (
    normalised.includes("appropriate") ||
    normalised.includes("important") ||
    normalised.includes("suitable") ||
    normalised.includes("professional") ||
    normalised === "yes"
  ) && !normalised.includes("inappropriate") &&
    !normalised.includes("unimportant") &&
    !normalised.includes("unsuitable") &&
    !normalised.includes("unprofessional");
}

function isNegativeSjtCategory(id: string) {
  const normalised = normaliseCategoryId(id);
  return (
    normalised.includes("inappropriate") ||
    normalised.includes("unimportant") ||
    normalised.includes("unsuitable") ||
    normalised.includes("unprofessional") ||
    normalised === "no"
  );
}

function getSjtSuitabilityScore(item: {
  text: string;
  answerCategory?: string;
}) {
  const text = item.text.toLowerCase();
  let score = item.answerCategory
    ? isPositiveSjtCategory(item.answerCategory)
      ? 20
      : isNegativeSjtCategory(item.answerCategory)
        ? -20
        : 0
    : 0;

  if (/\b(promptly|qualified|supervisor|staff|escalat|policy|consent|confidential|document|record|apologis|clarif|respect|safe|handover|verify|approved|immediate|immediately|stop|calm|listen|acknowledge)\b/.test(text)) {
    score += 3;
  }

  if (/\b(if unsure|privately|briefly|calmly|local|advice)\b/.test(text)) {
    score += 1;
  }

  if (/\b(ignore|avoid|leave|share|post|delete|hide|accept|guess|pretend|independently|casually|friends|rude|outside your role|slow the team)\b/.test(text)) {
    score -= 5;
  }

  if (/\b(patient safety|confidentiality|consent|identity|authority)\b/.test(text)) {
    score += 2;
  }

  return score;
}

function selectMiddleMostLeastItem(
  items: Array<{ id: string; text: string }>,
  mostId: string,
  leastId: string
) {
  return items.find((item) => item.id !== mostId && item.id !== leastId) ?? null;
}

function orderSjtMostLeastItems(
  questionId: string,
  items: Array<{ id: string; text: string }>
) {
  return [...items].sort(
    (first, second) =>
      textHash(`${questionId}:${first.id}`) - textHash(`${questionId}:${second.id}`)
  );
}

function getSjtMostLeastQuestionPrompt(questionId: string) {
  return SJT_MOST_LEAST_QUESTIONS[
    textHash(questionId) % SJT_MOST_LEAST_QUESTIONS.length
  ];
}

function getQuestionBase(question: UCATQuestion): UCATQuestionBase {
  return {
    id: question.id,
    section: question.section,
    subtype: question.subtype,
    setId: question.setId,
    tags: question.tags,
    title: question.title,
    leftTitle: question.leftTitle,
    stimulus: question.stimulus,
    visual: question.visual,
    issueTags: question.issueTags,
    question: question.question,
    explanation: question.explanation,
  };
}

function makeNormalisedSjtMostLeastQuestion(
  question: UCATQuestionBase,
  items: Array<{ id: string; text: string }>,
  answerSlots: Record<UCATMostLeastSlot, string>
): UCATMostLeastQuestion | null {
  const dedupedItems = items.filter(
    (item, index, list) =>
      item.id.trim() &&
      item.text.trim() &&
      list.findIndex((candidate) => candidate.id === item.id) === index
  ).map((item) => ({ id: item.id, text: item.text }));
  const itemIds = new Set(dedupedItems.map((item) => item.id));

  if (
    dedupedItems.length !== 3 ||
    answerSlots.most === answerSlots.least ||
    !itemIds.has(answerSlots.most) ||
    !itemIds.has(answerSlots.least)
  ) {
    return null;
  }

  return {
    ...question,
    subtype: "sjt-drag-drop",
    questionType: "most-least",
    question: getSjtMostLeastQuestionPrompt(question.id),
    instruction: SJT_MOST_LEAST_INSTRUCTION,
    actionItems: orderSjtMostLeastItems(question.id, dedupedItems),
    answerSlots,
  };
}

function normaliseExistingMostLeastQuestion(
  question: UCATMostLeastQuestion
): UCATMostLeastQuestion | null {
  const mostItem = question.actionItems.find(
    (item) => item.id === question.answerSlots.most
  );
  const leastItem = question.actionItems.find(
    (item) => item.id === question.answerSlots.least
  );

  if (!mostItem || !leastItem) return null;

  const middleItem = selectMiddleMostLeastItem(
    question.actionItems,
    mostItem.id,
    leastItem.id
  );

  if (!middleItem) return null;

  return makeNormalisedSjtMostLeastQuestion(
    getQuestionBase(question),
    [mostItem, middleItem, leastItem],
    question.answerSlots
  );
}

function normaliseDragCategorySjtQuestion(
  question: UCATDragCategoryQuestion
): UCATMostLeastQuestion | null {
  const scoredItems = question.categoryItems
    .map((item) => ({
      id: item.id,
      text: item.text,
      answerCategory: item.answerCategory,
      score: getSjtSuitabilityScore(item),
    }))
    .sort((first, second) => second.score - first.score);
  const mostItem = scoredItems[0];
  const leastItem = scoredItems[scoredItems.length - 1];

  if (!mostItem || !leastItem || mostItem.id === leastItem.id) return null;

  const middleItem =
    scoredItems
      .filter((item) => item.id !== mostItem.id && item.id !== leastItem.id)
      .sort(
        (first, second) => Math.abs(first.score) - Math.abs(second.score)
      )[0] ?? null;

  if (!middleItem) return null;

  return makeNormalisedSjtMostLeastQuestion(
    getQuestionBase(question),
    [mostItem, middleItem, leastItem],
    { most: mostItem.id, least: leastItem.id }
  );
}

function normaliseDragOrderSjtQuestion(
  question: UCATDragOrderQuestion
): UCATMostLeastQuestion | null {
  const orderRank = new Map(
    question.answerOrder.map((itemId, index) => [itemId, index])
  );
  const scoredItems = question.dragItems
    .map((item) => ({ ...item, score: getSjtSuitabilityScore(item) }))
    .sort(
      (first, second) =>
        second.score - first.score ||
        (orderRank.get(first.id) ?? 999) - (orderRank.get(second.id) ?? 999)
    );
  const mostItem = scoredItems[0];

  if (!mostItem) return null;

  const middleItem = scoredItems.find((item) => item.id !== mostItem.id) ?? null;

  if (!middleItem) return null;

  const leastItem = {
    id: question.dragItems.some((item) => item.id === "least-inappropriate")
      ? "least-inappropriate-response"
      : "least-inappropriate",
    text: "Ignore the concern and continue without using the appropriate staff route.",
  };
  const baseQuestion = {
    ...getQuestionBase(question),
    explanation:
      "The best response addresses the immediate concern through a safe route. Ignoring the concern and carrying on without involving appropriate staff is the least appropriate option.",
  };

  return makeNormalisedSjtMostLeastQuestion(
    baseQuestion,
    [mostItem, middleItem, leastItem],
    { most: mostItem.id, least: leastItem.id }
  );
}

function normaliseSjtDragDropQuestion(question: UCATQuestion): UCATQuestion | null {
  if (question.section !== "sjt") return question;

  if (question.questionType === "most-least") {
    return normaliseExistingMostLeastQuestion(question);
  }

  if (question.subtype !== "sjt-drag-drop") return question;

  if (question.questionType === "drag-category") {
    return normaliseDragCategorySjtQuestion(question);
  }

  if (question.questionType === "drag-order") {
    return normaliseDragOrderSjtQuestion(question);
  }

  return question;
}

function isSupportedSjtMostLeastQuestion(
  question: UCATQuestion
): question is UCATMostLeastQuestion {
  if (question.questionType !== "most-least") return false;

  const itemIds = new Set(question.actionItems.map((item) => item.id));
  return (
    question.subtype === "sjt-drag-drop" &&
    question.actionItems.length === 3 &&
    question.answerSlots.most !== question.answerSlots.least &&
    itemIds.has(question.answerSlots.most) &&
    itemIds.has(question.answerSlots.least)
  );
}

function isSupportedSjtQuestion(question: UCATQuestion) {
  if (question.section !== "sjt") return true;

  return (
    ((!question.questionType || question.questionType === "single") &&
      (question.subtype === "sjt-appropriateness" ||
        question.subtype === "sjt-importance")) ||
    (question.subtype === "sjt-drag-drop" &&
      isSupportedSjtMostLeastQuestion(question))
  );
}

const QR_SINGLE_OPTION_KEYS: UCATOptionKey[] = ["A", "B", "C", "D", "E"];

function isSingleSelectQuestion(question: UCATQuestion): question is UCATSingleQuestion {
  return !question.questionType || question.questionType === "single";
}

function normaliseOptionText(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function formatQrOptionNumber(value: number, decimals: number) {
  return value.toLocaleString("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function makeQrFallbackOptionText(question: UCATSingleQuestion, attempt: number) {
  const correctText =
    question.options.find((option) => option.key === question.answer)?.text ??
    question.options[0]?.text ??
    "";
  const ratioMatch = correctText.match(/^(\d+):(\d+)$/);

  if (ratioMatch) {
    return `${Number(ratioMatch[1]) + attempt}:${ratioMatch[2]}`;
  }

  const fractionMatch = correctText.match(/^(\d+)\/(\d+)$/);

  if (fractionMatch) {
    return `${Number(fractionMatch[1]) + attempt}/${fractionMatch[2]}`;
  }

  const numericMatch = correctText.match(/^(.*?)(-?[\d,]+(?:\.\d+)?)(.*)$/);

  if (numericMatch) {
    const prefix = numericMatch[1];
    const rawNumber = numericMatch[2];
    const suffix = numericMatch[3];
    const value = Number(rawNumber.replace(/,/g, ""));
    const decimals = rawNumber.includes(".") ? rawNumber.split(".")[1].length : 0;
    const step =
      decimals > 0
        ? attempt / 10 ** decimals
        : Math.max(1, Math.round(Math.abs(value) * 0.04)) * attempt;
    const direction = attempt % 2 === 0 ? -1 : 1;
    const adjusted = Math.max(0, value + direction * step);

    return `${prefix}${formatQrOptionNumber(adjusted, decimals)}${suffix}`;
  }

  return [
    "More information is required",
    "None of the listed options",
    "The result cannot be determined from the data",
    "The values are equal",
    "No change",
  ][attempt - 1] ?? `Alternative ${attempt}`;
}

function qrAnswerBucket(question: UCATSingleQuestion) {
  const value = `${question.id}|${question.question}`;
  let hash = 0;

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  return hash % QR_SINGLE_OPTION_KEYS.length;
}

function ensureQrFiveOptions(question: UCATQuestion): UCATQuestion {
  if (
    question.section !== "qr" ||
    !isSingleSelectQuestion(question)
  ) {
    return question;
  }

  const options = [...question.options];
  const usedTexts = new Set(options.map((option) => normaliseOptionText(option.text)));
  let attempt = 1;

  while (options.length < QR_SINGLE_OPTION_KEYS.length) {
    const key = QR_SINGLE_OPTION_KEYS[options.length];
    const text = makeQrFallbackOptionText(question, attempt);
    const normalisedText = normaliseOptionText(text);
    attempt += 1;

    if (!key || usedTexts.has(normalisedText)) continue;

    options.push({ key, text });
    usedTexts.add(normalisedText);
  }

  let answer = question.answer;
  const shouldUseAnswerE = qrAnswerBucket(question) === 4;

  if (shouldUseAnswerE && answer !== "E") {
    const correctIndex = options.findIndex((option) => option.key === answer);
    const eIndex = options.findIndex((option) => option.key === "E");

    if (correctIndex !== -1 && eIndex !== -1) {
      const correctOption = options[correctIndex];
      const eOption = options[eIndex];
      options[correctIndex] = { ...eOption, key: correctOption.key };
      options[eIndex] = { ...correctOption, key: "E" };
      answer = "E";
    }
  }

  return { ...question, options, answer };
}

export const LEGACY_UCAT_QUESTION_BANK: Record<UCATSection, UCATQuestion[]> = {
  vr: [
    ...LEGACY_VR_QUESTIONS,
    ...CURATED_VR_QUESTIONS,
  ],
  dm: [
    ...CURATED_DM_QUESTIONS,
    {
      id: "dm-syllogisms-001",
      section: "dm",
      subtype: "dm-syllogisms",
      tags: ["multi-step", "medium", "text-stem"],
      questionType: "yes-no",
      title: "Decision Making Practice",
      leftTitle: "Syllogism",
      stimulus: [
        "All medicines in Cabinet A require refrigeration. Some medicines in Cabinet A are antibiotics. No refrigerated item is kept on the ward trolley.",
      ],
      question:
        "Place 'Yes' if the conclusion follows. Place 'No' if the conclusion does not follow.",
      instruction: "Answer each conclusion using only the information given.",
      yesNoStatements: [
        { id: "antibiotics-refrigerated", text: "Some antibiotics require refrigeration.", answer: "Yes" },
        { id: "cabinet-trolley", text: "No medicines in Cabinet A are kept on the ward trolley.", answer: "Yes" },
        { id: "all-antibiotics", text: "All antibiotics require refrigeration.", answer: "No" },
        { id: "refrigerated-trolley", text: "Some refrigerated items are kept on the ward trolley.", answer: "No" },
        { id: "all-refrigerated-cabinet", text: "All refrigerated items are medicines in Cabinet A.", answer: "No" },
      ],
      explanation:
        "Some Cabinet A medicines are antibiotics, and all Cabinet A medicines require refrigeration, so some antibiotics require refrigeration. Cabinet A medicines are refrigerated, and refrigerated items are not on the trolley. The wider claims about all antibiotics or all refrigerated items are not guaranteed.",
    },
    {
      id: "dm-syllogisms-002",
      section: "dm",
      subtype: "dm-syllogisms",
      tags: ["multi-step", "medium", "text-stem"],
      questionType: "yes-no",
      title: "Decision Making Practice",
      leftTitle: "Syllogism",
      stimulus: [
        "Every person on the reserve list has completed the interview. No applicant who completed the interview is awaiting an identity check. Some applicants awaiting an identity check have paid the test fee.",
      ],
      question:
        "Place 'Yes' if the conclusion follows. Place 'No' if the conclusion does not follow.",
      instruction: "Answer each conclusion using only the information given.",
      yesNoStatements: [
        { id: "reserve-not-check", text: "No person on the reserve list is awaiting an identity check.", answer: "Yes" },
        { id: "fee-and-check", text: "Some applicants who paid the test fee are awaiting an identity check.", answer: "Yes" },
        { id: "interview-reserve", text: "Every applicant who completed the interview is on the reserve list.", answer: "No" },
        { id: "reserve-paid", text: "Some people on the reserve list have paid the test fee.", answer: "No" },
        { id: "check-not-interview", text: "No applicant awaiting an identity check has completed the interview.", answer: "Yes" },
      ],
      explanation:
        "Reserve-list applicants have completed the interview, and interview-completers are not awaiting identity checks. The fee statement only tells us that some identity-check applicants have paid; it says nothing about reserve-list applicants paying.",
    },
    {
      id: "dm-syllogisms-003",
      section: "dm",
      subtype: "dm-syllogisms",
      tags: ["multi-step", "hard", "text-stem"],
      questionType: "yes-no",
      title: "Decision Making Practice",
      leftTitle: "Syllogism",
      stimulus: [
        "All evening seminar attendees are second-year students. Some second-year students are peer mentors. No peer mentor is assigned to Group K.",
      ],
      question:
        "Place 'Yes' if the conclusion follows. Place 'No' if the conclusion does not follow.",
      instruction: "Answer each conclusion using only the information given.",
      yesNoStatements: [
        { id: "seminar-mentors", text: "Some evening seminar attendees are peer mentors.", answer: "No" },
        { id: "mentors-not-k", text: "No peer mentors are assigned to Group K.", answer: "Yes" },
        { id: "some-second-years-not-k", text: "Some second-year students are not assigned to Group K.", answer: "Yes" },
        { id: "all-second-years-seminar", text: "All second-year students attend the evening seminar.", answer: "No" },
        { id: "seminar-not-k", text: "No evening seminar attendee is assigned to Group K.", answer: "No" },
      ],
      explanation:
        "The peer mentors mentioned are second-year students and are not in Group K, so at least some second-year students are not in Group K. Nothing connects evening seminar attendance to being a peer mentor or to Group K.",
    },
    {
      id: "dm-logic-001",
      section: "dm",
      subtype: "dm-logic",
      tags: ["multi-step", "medium", "text-stem"],
      title: "Decision Making Practice",
      leftTitle: "Information",
      stimulus: [
        "An interview circuit has four stations: Data, Teamwork, Motivation and Reflection. Data is immediately before Teamwork. Motivation is before Reflection. Teamwork is not last.",
      ],
      question: "Which station order is possible?",
      options: [
        { key: "A", text: "Data, Teamwork, Motivation, Reflection" },
        { key: "B", text: "Motivation, Data, Reflection, Teamwork" },
        { key: "C", text: "Reflection, Data, Teamwork, Motivation" },
        { key: "D", text: "Motivation, Reflection, Data, Teamwork" },
      ],
      answer: "A",
      explanation:
        "Only A has Data immediately before Teamwork, Motivation before Reflection, and Teamwork somewhere other than last.",
    },
    {
      id: "dm-logic-002",
      section: "dm",
      subtype: "dm-logic",
      tags: ["time-consuming", "multi-step", "hard", "text-stem"],
      title: "Decision Making Practice",
      leftTitle: "Information",
      stimulus: [
        "Amina, Ben and Chloe each teach one subject: Biology, Chemistry or Physics. The subjects are taught in Rooms 1, 2 and 3. Physics is taught in Room 2. Chemistry is not taught in Room 3. Amina does not teach Chemistry. Ben teaches in the room numbered one less than Chloe's room.",
      ],
      question: "Who teaches Chemistry?",
      options: [
        { key: "A", text: "Amina" },
        { key: "B", text: "Ben" },
        { key: "C", text: "Chloe" },
        { key: "D", text: "More information required" },
      ],
      answer: "B",
      explanation:
        "Physics is in Room 2, and Chemistry cannot be in Room 3, so Chemistry is in Room 1. If Ben teaches one room lower than Chloe, Ben must be in Room 1 and Chloe in Room 2. Therefore Ben teaches Chemistry.",
    },
    {
      id: "dm-logic-003",
      section: "dm",
      subtype: "dm-logic",
      tags: ["multi-step", "medium", "text-stem"],
      title: "Decision Making Practice",
      leftTitle: "Information",
      stimulus: [
        "Four parcels, Red, Blue, Green and Yellow, are sent on Monday to Thursday, one parcel each day. Blue is sent immediately before Yellow. Green is sent after Red. Red is not sent on Monday.",
      ],
      question: "Which parcel is sent on Thursday?",
      options: [
        { key: "A", text: "Red" },
        { key: "B", text: "Blue" },
        { key: "C", text: "Green" },
        { key: "D", text: "Yellow" },
      ],
      answer: "C",
      explanation:
        "Blue and Yellow must be Monday and Tuesday. Red then goes on Wednesday, leaving Green for Thursday.",
    },
    {
      id: "dm-arguments-001",
      section: "dm",
      subtype: "dm-arguments",
      tags: ["quick", "medium", "text-stem"],
      title: "Decision Making Practice",
      leftTitle: "Argument",
      stimulus: [
        "A health board is considering whether community pharmacies should offer free weekend blood-pressure checks.",
      ],
      question: "Select the strongest argument from the statements below.",
      options: [
        { key: "A", text: "Yes, because pharmacies already sell many health products." },
        { key: "B", text: "Yes, because many working adults cannot attend weekday GP appointments and untreated high blood pressure can be serious." },
        { key: "C", text: "No, because some people dislike waiting in pharmacies." },
        { key: "D", text: "No, because blood-pressure cuffs come in several sizes." },
      ],
      answer: "B",
      explanation:
        "B directly addresses access and a meaningful health consequence. The other options are weak because they are irrelevant, minor or unsupported.",
    },
    {
      id: "dm-arguments-002",
      section: "dm",
      subtype: "dm-arguments",
      tags: ["quick", "medium", "text-stem"],
      title: "Decision Making Practice",
      leftTitle: "Argument",
      stimulus: [
        "A school is deciding whether to replace disposable lunch trays with washable trays.",
      ],
      question: "Select the strongest argument from the statements below.",
      options: [
        { key: "A", text: "Yes, because washable trays could reduce daily waste if the school has enough washing capacity." },
        { key: "B", text: "Yes, because trays can be ordered in several colours." },
        { key: "C", text: "No, because all pupils prefer disposable trays." },
        { key: "D", text: "No, because lunchtime is often noisy." },
      ],
      answer: "A",
      explanation:
        "A links the proposal to the intended outcome and includes a practical condition. The other options are irrelevant or make unsupported absolute claims.",
    },
    {
      id: "dm-arguments-003",
      section: "dm",
      subtype: "dm-arguments",
      tags: ["quick", "medium", "text-stem"],
      title: "Decision Making Practice",
      leftTitle: "Argument",
      stimulus: [
        "A hospital trust is considering moving all follow-up appointments to video calls.",
      ],
      question: "Select the strongest argument from the statements below.",
      options: [
        { key: "A", text: "Yes, because video calls are a newer technology." },
        { key: "B", text: "Yes, because some patients live far from hospital." },
        { key: "C", text: "No, because some follow-ups require physical examination or private access to equipment that video calls cannot provide." },
        { key: "D", text: "No, because computers sometimes need updates." },
      ],
      answer: "C",
      explanation:
        "C gives a direct reason why moving every follow-up online could be unsafe or unsuitable. B supports some video calls, but not moving all appointments.",
    },
    {
      id: "dm-yes-no-001",
      section: "dm",
      subtype: "dm-yes-no",
      tags: ["multi-step", "medium", "text-stem"],
      questionType: "yes-no",
      title: "Decision Making Practice",
      leftTitle: "Data",
      stimulus: [
        "An online revision group has 74 members. Fifty use flashcards, 42 use timed sets, and 18 use both. Every member uses at least one of these two tools.",
      ],
      question:
        "Place 'Yes' if the conclusion follows. Place 'No' if the conclusion does not follow.",
      instruction: "Use the data to answer each conclusion.",
      yesNoStatements: [
        { id: "only-flashcards", text: "Exactly 30 members use only flashcards.", answer: "No" },
        { id: "only-timed", text: "Exactly 24 members use only timed sets.", answer: "Yes" },
        { id: "all-tools", text: "No members use neither flashcards nor timed sets.", answer: "Yes" },
        { id: "flashcards-more-only", text: "More members use only flashcards than only timed sets.", answer: "Yes" },
        { id: "both-less-quarter", text: "Fewer than a quarter of the members use both tools.", answer: "Yes" },
      ],
      explanation:
        "Only flashcards is 50 - 18 = 32, and only timed sets is 42 - 18 = 24. Everyone uses at least one tool. Eighteen out of 74 is less than one quarter.",
    },
    {
      id: "dm-yes-no-002",
      section: "dm",
      subtype: "dm-yes-no",
      tags: ["multi-step", "medium", "text-stem"],
      questionType: "yes-no",
      title: "Decision Making Practice",
      leftTitle: "Information",
      stimulus: [
        "A clinic introduced a new phone queue in January. In that month, the average wait to speak to reception fell from 18 minutes to 11 minutes. The clinic also hired two temporary receptionists during January. Patient satisfaction scores were not collected until February.",
      ],
      question:
        "Place 'Yes' if the conclusion follows. Place 'No' if the conclusion does not follow.",
      instruction: "Use the paragraph to answer each conclusion.",
      yesNoStatements: [
        { id: "wait-fell", text: "The average phone wait fell in January.", answer: "Yes" },
        { id: "queue-caused-all", text: "The new phone queue alone caused the whole fall in waiting time.", answer: "No" },
        { id: "jan-satisfaction", text: "Patient satisfaction scores improved in January.", answer: "No" },
        { id: "temporary-staff", text: "At least one temporary receptionist was hired during January.", answer: "Yes" },
        { id: "seven-minutes", text: "The average wait was 7 minutes lower than before.", answer: "Yes" },
      ],
      explanation:
        "The fall in waiting time and temporary hires are stated. Causation is not proven because staffing changed too, and satisfaction was not collected until February.",
    },
    {
      id: "dm-yes-no-003",
      section: "dm",
      subtype: "dm-yes-no",
      tags: ["time-consuming", "multi-step", "data-display"],
      questionType: "yes-no",
      title: "Decision Making Practice",
      leftTitle: "Data",
      stimulus: [
        "The table shows practice sets completed and reviewed by four students last week.",
      ],
      visual: {
        type: "table",
        title: "Weekly practice activity",
        headers: ["Student", "Sets completed", "Sets reviewed"],
        rows: [
          ["Aria", "12", "8"],
          ["Ben", "9", "9"],
          ["Cara", "15", "10"],
          ["Dev", "6", "4"],
        ],
      },
      question:
        "Place 'Yes' if the conclusion follows. Place 'No' if the conclusion does not follow.",
      instruction: "Use the table to answer each conclusion.",
      yesNoStatements: [
        { id: "cara-most", text: "Cara completed the most practice sets.", answer: "Yes" },
        { id: "ben-lower-proportion", text: "Ben reviewed a lower proportion of his completed sets than Aria.", answer: "No" },
        { id: "dev-half-aria", text: "Dev completed half as many practice sets as Aria.", answer: "Yes" },
        { id: "two-eighty", text: "Exactly two students reviewed at least 80% of their completed sets.", answer: "No" },
        { id: "under-thirty", text: "Fewer than 30 sets were reviewed in total.", answer: "No" },
      ],
      explanation:
        "Cara completed 15 sets, the highest total. Ben reviewed 9 out of 9, a higher proportion than Aria's 8 out of 12. The reviewed total is 31, and only Ben reached at least 80%.",
    },
    {
      id: "dm-venn-sets-001",
      section: "dm",
      subtype: "dm-venn-sets",
      tags: ["set-based", "data-display", "medium"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "A revision society recorded which members attended three optional sessions. The numbers in the diagram show how many members are in each region.",
      ],
      visual: {
        type: "set-diagram",
        title: "Revision sessions attended",
        shapes: [
          { id: "clinic", label: "Clinic drills", shape: "circle", x: 85, y: 115, width: 250, height: 220 },
          { id: "essay", label: "Essay plans", shape: "rectangle", x: 270, y: 125, width: 225, height: 185 },
          { id: "interview", label: "Interview role-play", shape: "triangle", x: 205, y: 50, width: 320, height: 305 },
        ],
        regionLabels: [
          { id: "clinic-only", text: "18", x: 175, y: 220 },
          { id: "essay-only", text: "14", x: 460, y: 160 },
          { id: "interview-only", text: "9", x: 365, y: 100 },
          { id: "clinic-essay", text: "11", x: 290, y: 160 },
          { id: "clinic-interview", text: "7", x: 250, y: 310 },
          { id: "essay-interview", text: "10", x: 395, y: 245 },
          { id: "all-three", text: "6", x: 300, y: 240 },
        ],
        legend: [
          { label: "Clinic drills", shape: "circle" },
          { label: "Essay plans", shape: "rectangle" },
          { label: "Interview role-play", shape: "triangle" },
        ],
      },
      question:
        "How many members attended Essay plans and Interview role-play but not Clinic drills?",
      options: [
        { key: "A", text: "6" },
        { key: "B", text: "10" },
        { key: "C", text: "16" },
        { key: "D", text: "23" },
      ],
      answer: "B",
      explanation:
        "The required region is inside Essay plans and Interview role-play, but outside Clinic drills. That region is labelled 10.",
    },
    {
      id: "dm-venn-sets-002",
      section: "dm",
      subtype: "dm-venn-sets",
      tags: ["set-based", "data-display", "multi-step", "hard"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "The diagram shows features of several medical procedures. Each number represents procedures in that exact region.",
      ],
      visual: {
        type: "set-diagram",
        title: "Procedure features",
        shapes: [
          { id: "long", label: "Long recovery", shape: "pentagon", x: 40, y: 45, width: 300, height: 255 },
          { id: "keyhole", label: "Keyhole", shape: "circle", x: 95, y: 165, width: 220, height: 205 },
          { id: "invasive", label: "Invasive surgery", shape: "rectangle", x: 155, y: 140, width: 335, height: 185 },
          { id: "fasting", label: "Fasting required", shape: "triangle", x: 115, y: 40, width: 380, height: 335 },
        ],
        regionLabels: [
          { id: "long-only", text: "5", x: 110, y: 150 },
          { id: "long-keyhole-invasive", text: "4", x: 180, y: 200 },
          { id: "keyhole-only", text: "7", x: 130, y: 320 },
          { id: "invasive-only", text: "8", x: 440, y: 190 },
          { id: "fasting-only", text: "6", x: 310, y: 350 },
          { id: "fasting-invasive", text: "9", x: 370, y: 270 },
          { id: "keyhole-invasive-fasting", text: "3", x: 290, y: 310 },
          { id: "long-fasting", text: "2", x: 280, y: 120 },
        ],
        legend: [
          { label: "Long recovery", shape: "pentagon" },
          { label: "Keyhole", shape: "circle" },
          { label: "Invasive surgery", shape: "rectangle" },
          { label: "Fasting required", shape: "triangle" },
        ],
      },
      question:
        "How many procedures require fasting and involve invasive surgery but do not involve keyhole surgery?",
      options: [
        { key: "A", text: "3" },
        { key: "B", text: "8" },
        { key: "C", text: "9" },
        { key: "D", text: "12" },
      ],
      answer: "C",
      explanation:
        "The relevant region is in both Fasting required and Invasive surgery, while outside Keyhole. It is labelled 9.",
    },
    {
      id: "dm-venn-sets-003",
      section: "dm",
      subtype: "dm-venn-sets",
      tags: ["set-based", "data-display", "multi-step", "hard"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "A scholarship panel recorded which applicants had volunteering, research and leadership experience. The numbers in the diagram show applicants in each exact region.",
      ],
      visual: {
        type: "set-diagram",
        title: "Applicant experience",
        shapes: [
          { id: "volunteering", label: "Volunteering", shape: "hexagon", x: 75, y: 80, width: 300, height: 235 },
          { id: "research", label: "Research", shape: "diamond", x: 230, y: 65, width: 280, height: 250 },
          { id: "leadership", label: "Leadership", shape: "circle", x: 185, y: 165, width: 270, height: 220 },
          { id: "interview-course", label: "Interview course", shape: "rectangle", x: 235, y: 265, width: 295, height: 120 },
        ],
        regionLabels: [
          { id: "vol-only", text: "21", x: 185, y: 145 },
          { id: "research-only", text: "12", x: 385, y: 135 },
          { id: "lead-only", text: "17", x: 220, y: 330 },
          { id: "course-only", text: "8", x: 485, y: 340 },
          { id: "vol-lead", text: "14", x: 230, y: 235 },
          { id: "research-lead", text: "9", x: 400, y: 230 },
          { id: "vol-research", text: "5", x: 315, y: 145 },
          { id: "lead-course", text: "6", x: 335, y: 340 },
          { id: "all-three", text: "4", x: 315, y: 210 },
        ],
        legend: [
          { label: "Volunteering", shape: "hexagon" },
          { label: "Research", shape: "diamond" },
          { label: "Leadership", shape: "circle" },
          { label: "Interview course", shape: "rectangle" },
        ],
      },
      question:
        "How many applicants had Leadership and Volunteering experience but not Research experience?",
      options: [
        { key: "A", text: "4" },
        { key: "B", text: "14" },
        { key: "C", text: "18" },
        { key: "D", text: "23" },
      ],
      answer: "B",
      explanation:
        "The region inside Leadership and Volunteering but outside Research is labelled 14.",
    },

    // ── dm-venn-select: logical-statement diagram selection ──────────────────
    {
      id: "dm-venn-select-001",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "medium"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "No radiographer is a surgeon.",
        "No surgeon is a radiographer.",
      ],
      question: "Which of the following diagrams best represents the information given?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram",
            title: "Option A",
            shapes: [
              { id: "a", label: "Radiographers", shape: "circle", x: 10, y: 20, width: 115, height: 110 },
              { id: "b", label: "Surgeons",       shape: "circle", x: 145, y: 20, width: 115, height: 110 },
            ],
            regionLabels: [],
            legend: [{ label: "Radiographers", shape: "circle" }, { label: "Surgeons", shape: "circle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram",
            title: "Option B",
            shapes: [
              { id: "a", label: "Radiographers", shape: "circle", x: 10, y: 15, width: 155, height: 140 },
              { id: "b", label: "Surgeons",       shape: "circle", x: 110, y: 15, width: 155, height: 140 },
            ],
            regionLabels: [],
            legend: [{ label: "Radiographers", shape: "circle" }, { label: "Surgeons", shape: "circle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram",
            title: "Option C",
            shapes: [
              { id: "b", label: "Surgeons",       shape: "circle", x: 10, y: 10, width: 215, height: 185 },
              { id: "a", label: "Radiographers",  shape: "circle", x: 55, y: 42, width: 120, height: 108 },
            ],
            regionLabels: [],
            legend: [{ label: "Radiographers", shape: "circle" }, { label: "Surgeons", shape: "circle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram",
            title: "Option D",
            shapes: [
              { id: "a", label: "Radiographers",  shape: "circle", x: 10, y: 10, width: 215, height: 185 },
              { id: "b", label: "Surgeons",        shape: "circle", x: 65, y: 48, width: 100, height: 92 },
            ],
            regionLabels: [],
            legend: [{ label: "Radiographers", shape: "circle" }, { label: "Surgeons", shape: "circle" }],
          },
        },
      ],
      answer: "A",
      explanation:
        "Both statements confirm no overlap exists between the two groups. Two completely separate circles represent this mutual exclusion. Option B shows overlap, and Options C and D show one set contained within the other — none of which are consistent with 'no radiographer is a surgeon'.",
    },
    {
      id: "dm-venn-select-002",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "medium"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "All ward nurses are registered nurses.",
        "Some registered nurses are not ward nurses.",
      ],
      question: "Which of the following diagrams best represents the information given?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram",
            title: "Option A",
            shapes: [
              { id: "a", label: "Ward Nurses",      shape: "circle", x: 10, y: 15, width: 155, height: 140 },
              { id: "b", label: "Registered Nurses", shape: "circle", x: 110, y: 15, width: 155, height: 140 },
            ],
            regionLabels: [],
            legend: [{ label: "Ward Nurses", shape: "circle" }, { label: "Registered Nurses", shape: "circle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram",
            title: "Option B",
            shapes: [
              { id: "b", label: "Registered Nurses", shape: "circle", x: 10, y: 10, width: 215, height: 185 },
              { id: "a", label: "Ward Nurses",        shape: "circle", x: 55, y: 42, width: 120, height: 108 },
            ],
            regionLabels: [],
            legend: [{ label: "Ward Nurses", shape: "circle" }, { label: "Registered Nurses", shape: "circle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram",
            title: "Option C",
            shapes: [
              { id: "a", label: "Ward Nurses",        shape: "circle", x: 10, y: 10, width: 215, height: 185 },
              { id: "b", label: "Registered Nurses",  shape: "circle", x: 62, y: 45, width: 102, height: 95 },
            ],
            regionLabels: [],
            legend: [{ label: "Ward Nurses", shape: "circle" }, { label: "Registered Nurses", shape: "circle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram",
            title: "Option D",
            shapes: [
              { id: "a", label: "Ward Nurses",        shape: "circle", x: 10, y: 20, width: 115, height: 110 },
              { id: "b", label: "Registered Nurses",  shape: "circle", x: 145, y: 20, width: 115, height: 110 },
            ],
            regionLabels: [],
            legend: [{ label: "Ward Nurses", shape: "circle" }, { label: "Registered Nurses", shape: "circle" }],
          },
        },
      ],
      answer: "B",
      explanation:
        "'All ward nurses are registered nurses' means every ward nurse belongs to the registered nurse group — so the Ward Nurses circle must sit entirely inside the Registered Nurses circle. 'Some registered nurses are not ward nurses' confirms registered nurses is the larger set. Option B shows Ward Nurses (small) inside Registered Nurses (large). Option C reverses the containment, Option A shows overlap only, and Option D shows complete separation.",
    },
    {
      id: "dm-venn-select-003",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "medium"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "Most cardiologists hold research grants.",
        "Some cardiologists do not hold research grants.",
        "Some research grant holders are not cardiologists.",
      ],
      question: "Which of the following diagrams best represents the information given?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram",
            title: "Option A",
            shapes: [
              { id: "b", label: "Grant Holders",  shape: "circle", x: 10, y: 10, width: 215, height: 185 },
              { id: "a", label: "Cardiologists",  shape: "circle", x: 55, y: 42, width: 120, height: 108 },
            ],
            regionLabels: [],
            legend: [{ label: "Cardiologists", shape: "circle" }, { label: "Grant Holders", shape: "circle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram",
            title: "Option B",
            shapes: [
              { id: "a", label: "Cardiologists",  shape: "circle", x: 10, y: 10, width: 215, height: 185 },
              { id: "b", label: "Grant Holders",  shape: "circle", x: 62, y: 45, width: 102, height: 95 },
            ],
            regionLabels: [],
            legend: [{ label: "Cardiologists", shape: "circle" }, { label: "Grant Holders", shape: "circle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram",
            title: "Option C",
            shapes: [
              { id: "a", label: "Cardiologists",  shape: "circle", x: 10, y: 15, width: 155, height: 140 },
              { id: "b", label: "Grant Holders",  shape: "circle", x: 110, y: 15, width: 155, height: 140 },
            ],
            regionLabels: [],
            legend: [{ label: "Cardiologists", shape: "circle" }, { label: "Grant Holders", shape: "circle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram",
            title: "Option D",
            shapes: [
              { id: "a", label: "Cardiologists",  shape: "circle", x: 10, y: 20, width: 115, height: 110 },
              { id: "b", label: "Grant Holders",  shape: "circle", x: 145, y: 20, width: 115, height: 110 },
            ],
            regionLabels: [],
            legend: [{ label: "Cardiologists", shape: "circle" }, { label: "Grant Holders", shape: "circle" }],
          },
        },
      ],
      answer: "C",
      explanation:
        "'Some cardiologists do not hold grants' rules out containment (not all cardiologists are inside the grant circle). 'Some grant holders are not cardiologists' rules out the reverse containment. Only partial overlap satisfies both conditions. Option C shows two overlapping circles with regions outside each — the correct representation. Options A and B show containment, Option D shows complete separation.",
    },
    {
      id: "dm-venn-select-004",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "hard"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "All paediatricians are doctors.",
        "All geriatricians are doctors.",
        "No paediatrician is a geriatrician.",
      ],
      question: "Which of the following diagrams best represents the information given?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram",
            title: "Option A",
            shapes: [
              { id: "a", label: "Paediatricians",  shape: "circle", x: 10, y: 15, width: 130, height: 120 },
              { id: "b", label: "Geriatricians",   shape: "circle", x: 100, y: 15, width: 130, height: 120 },
              { id: "c", label: "Doctors",         shape: "circle", x: 55, y: 155, width: 130, height: 120 },
            ],
            regionLabels: [],
            legend: [{ label: "Paediatricians", shape: "circle" }, { label: "Geriatricians", shape: "circle" }, { label: "Doctors", shape: "circle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram",
            title: "Option B",
            shapes: [
              { id: "c", label: "Doctors",         shape: "circle", x: 10, y: 10, width: 230, height: 200 },
              { id: "a", label: "Paediatricians",  shape: "circle", x: 25, y: 38, width: 95, height: 90 },
              { id: "b", label: "Geriatricians",   shape: "circle", x: 135, y: 38, width: 95, height: 90 },
            ],
            regionLabels: [],
            legend: [{ label: "Paediatricians", shape: "circle" }, { label: "Geriatricians", shape: "circle" }, { label: "Doctors", shape: "circle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram",
            title: "Option C",
            shapes: [
              { id: "c", label: "Doctors",         shape: "circle", x: 10, y: 10, width: 230, height: 200 },
              { id: "a", label: "Paediatricians",  shape: "circle", x: 25, y: 35, width: 110, height: 100 },
              { id: "b", label: "Geriatricians",   shape: "circle", x: 110, y: 35, width: 110, height: 100 },
            ],
            regionLabels: [],
            legend: [{ label: "Paediatricians", shape: "circle" }, { label: "Geriatricians", shape: "circle" }, { label: "Doctors", shape: "circle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram",
            title: "Option D",
            shapes: [
              { id: "a", label: "Paediatricians",  shape: "circle", x: 10, y: 20, width: 100, height: 95 },
              { id: "b", label: "Geriatricians",   shape: "circle", x: 120, y: 20, width: 100, height: 95 },
              { id: "c", label: "Doctors",         shape: "circle", x: 230, y: 20, width: 100, height: 95 },
            ],
            regionLabels: [],
            legend: [{ label: "Paediatricians", shape: "circle" }, { label: "Geriatricians", shape: "circle" }, { label: "Doctors", shape: "circle" }],
          },
        },
      ],
      answer: "B",
      explanation:
        "'All paediatricians are doctors' and 'all geriatricians are doctors' means both specialist circles sit inside the Doctors circle. 'No paediatrician is a geriatrician' means the two specialist circles must not overlap. Option B shows both smaller circles inside Doctors with a clear gap between them. Option C shows them overlapping inside Doctors (violates the third statement). Option A shows all three separate or only partly overlapping. Option D shows three separate circles.",
    },
    {
      id: "dm-venn-select-005",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "hard"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "All trauma surgeons are surgeons.",
        "Some surgeons are not trauma surgeons.",
        "No trauma surgeon is a GP.",
        "Some surgeons are GPs.",
      ],
      question: "Which of the following diagrams best represents the information given?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram",
            title: "Option A",
            shapes: [
              { id: "b", label: "Surgeons",         shape: "circle", x: 10, y: 10, width: 185, height: 170 },
              { id: "a", label: "Trauma Surgeons",  shape: "circle", x: 22, y: 28, width: 95, height: 88 },
              { id: "c", label: "GPs",              shape: "circle", x: 150, y: 55, width: 130, height: 120 },
            ],
            regionLabels: [],
            legend: [{ label: "Trauma Surgeons", shape: "circle" }, { label: "Surgeons", shape: "circle" }, { label: "GPs", shape: "circle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram",
            title: "Option B",
            shapes: [
              { id: "b", label: "Surgeons",         shape: "circle", x: 10, y: 10, width: 230, height: 200 },
              { id: "a", label: "Trauma Surgeons",  shape: "circle", x: 22, y: 30, width: 100, height: 92 },
              { id: "c", label: "GPs",              shape: "circle", x: 135, y: 30, width: 100, height: 92 },
            ],
            regionLabels: [],
            legend: [{ label: "Trauma Surgeons", shape: "circle" }, { label: "Surgeons", shape: "circle" }, { label: "GPs", shape: "circle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram",
            title: "Option C",
            shapes: [
              { id: "a", label: "Trauma Surgeons",  shape: "circle", x: 10, y: 15, width: 120, height: 115 },
              { id: "b", label: "Surgeons",         shape: "circle", x: 100, y: 15, width: 120, height: 115 },
              { id: "c", label: "GPs",              shape: "circle", x: 190, y: 15, width: 120, height: 115 },
            ],
            regionLabels: [],
            legend: [{ label: "Trauma Surgeons", shape: "circle" }, { label: "Surgeons", shape: "circle" }, { label: "GPs", shape: "circle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram",
            title: "Option D",
            shapes: [
              { id: "b", label: "Surgeons",         shape: "circle", x: 10, y: 10, width: 185, height: 170 },
              { id: "a", label: "Trauma Surgeons",  shape: "circle", x: 22, y: 28, width: 95, height: 88 },
              { id: "c", label: "GPs",              shape: "circle", x: 90, y: 28, width: 95, height: 88 },
            ],
            regionLabels: [],
            legend: [{ label: "Trauma Surgeons", shape: "circle" }, { label: "Surgeons", shape: "circle" }, { label: "GPs", shape: "circle" }],
          },
        },
      ],
      answer: "A",
      explanation:
        "'All trauma surgeons are surgeons' puts the Trauma circle inside Surgeons. 'No trauma surgeon is a GP' means Trauma and GP circles must not touch. 'Some surgeons are GPs' means the GP circle overlaps with Surgeons (but extends outside since not all surgeons are GPs). Option A shows Trauma inside Surgeons with GPs overlapping Surgeons but not touching Trauma. Option B puts both Trauma and GPs inside Surgeons as non-overlapping subsets — wrong because 'some surgeons are GPs' only means partial overlap, not full containment. Option C shows all three separate. Option D shows Trauma and GPs overlapping inside Surgeons, violating 'no trauma surgeon is a GP'.",
    },

    {
      id: "dm-venn-select-006",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "hard"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "All nurses are healthcare workers.",
        "Some managers are healthcare workers.",
        "Some managers are not healthcare workers.",
        "No nurse is a manager.",
      ],
      question: "Which of the following diagrams best represents the information given?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram",
            title: "Option A",
            shapes: [
              { id: "b", label: "Healthcare Workers", shape: "circle", x: 10, y: 10, width: 230, height: 195 },
              { id: "a", label: "Nurses",             shape: "circle", x: 22, y: 35, width: 95, height: 88 },
              { id: "c", label: "Managers",           shape: "circle", x: 155, y: 60, width: 130, height: 118 },
            ],
            regionLabels: [],
            legend: [{ label: "Nurses", shape: "circle" }, { label: "Healthcare Workers", shape: "circle" }, { label: "Managers", shape: "circle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram",
            title: "Option B",
            shapes: [
              { id: "b", label: "Healthcare Workers", shape: "circle", x: 10, y: 10, width: 230, height: 195 },
              { id: "a", label: "Nurses",             shape: "circle", x: 22, y: 35, width: 95, height: 88 },
              { id: "c", label: "Managers",           shape: "circle", x: 130, y: 35, width: 95, height: 88 },
            ],
            regionLabels: [],
            legend: [{ label: "Nurses", shape: "circle" }, { label: "Healthcare Workers", shape: "circle" }, { label: "Managers", shape: "circle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram",
            title: "Option C",
            shapes: [
              { id: "a", label: "Nurses",             shape: "circle", x: 10, y: 20, width: 100, height: 95 },
              { id: "b", label: "Healthcare Workers", shape: "circle", x: 120, y: 20, width: 100, height: 95 },
              { id: "c", label: "Managers",           shape: "circle", x: 230, y: 20, width: 100, height: 95 },
            ],
            regionLabels: [],
            legend: [{ label: "Nurses", shape: "circle" }, { label: "Healthcare Workers", shape: "circle" }, { label: "Managers", shape: "circle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram",
            title: "Option D",
            shapes: [
              { id: "b", label: "Healthcare Workers", shape: "circle", x: 10, y: 10, width: 230, height: 195 },
              { id: "a", label: "Nurses",             shape: "circle", x: 22, y: 35, width: 95, height: 88 },
              { id: "c", label: "Managers",           shape: "circle", x: 85, y: 35, width: 130, height: 118 },
            ],
            regionLabels: [],
            legend: [{ label: "Nurses", shape: "circle" }, { label: "Healthcare Workers", shape: "circle" }, { label: "Managers", shape: "circle" }],
          },
        },
      ],
      answer: "A",
      explanation:
        "'All nurses are healthcare workers' places Nurses entirely inside Healthcare Workers. 'Some managers are healthcare workers' and 'some managers are not' means Managers partially overlaps Healthcare Workers. 'No nurse is a manager' means the Nurses and Managers circles must not touch. Option A correctly shows Nurses (small, inside HCW), Managers (partially overlapping HCW but extending outside), with no contact between Nurses and Managers. Option B puts Managers fully inside HCW, contradicting 'some managers are not HCW'. Option D shows Managers overlapping Nurses, which violates 'no nurse is a manager'. Option C shows all three separate.",
    },
    {
      id: "dm-venn-select-007",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "medium"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "All GPs are doctors.",
        "All doctors are healthcare professionals.",
        "Some GPs are not hospital-based.",
      ],
      question: "Which of the following diagrams best represents the information given?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram",
            title: "Option A",
            shapes: [
              { id: "c", label: "Healthcare Professionals", shape: "circle", x: 10, y: 10, width: 235, height: 210 },
              { id: "b", label: "Doctors",                  shape: "circle", x: 30, y: 30, width: 170, height: 155 },
              { id: "a", label: "GPs",                      shape: "circle", x: 58, y: 56, width: 100, height: 95 },
            ],
            regionLabels: [],
            legend: [{ label: "GPs", shape: "circle" }, { label: "Doctors", shape: "circle" }, { label: "Healthcare Professionals", shape: "circle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram",
            title: "Option B",
            shapes: [
              { id: "a", label: "GPs",                      shape: "circle", x: 10, y: 10, width: 235, height: 210 },
              { id: "b", label: "Doctors",                  shape: "circle", x: 30, y: 30, width: 170, height: 155 },
              { id: "c", label: "Healthcare Professionals", shape: "circle", x: 58, y: 56, width: 100, height: 95 },
            ],
            regionLabels: [],
            legend: [{ label: "GPs", shape: "circle" }, { label: "Doctors", shape: "circle" }, { label: "Healthcare Professionals", shape: "circle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram",
            title: "Option C",
            shapes: [
              { id: "c", label: "Healthcare Professionals", shape: "circle", x: 10, y: 10, width: 230, height: 195 },
              { id: "b", label: "Doctors",                  shape: "circle", x: 22, y: 35, width: 95, height: 88 },
              { id: "a", label: "GPs",                      shape: "circle", x: 130, y: 35, width: 95, height: 88 },
            ],
            regionLabels: [],
            legend: [{ label: "GPs", shape: "circle" }, { label: "Doctors", shape: "circle" }, { label: "Healthcare Professionals", shape: "circle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram",
            title: "Option D",
            shapes: [
              { id: "a", label: "GPs",                      shape: "circle", x: 10, y: 20, width: 100, height: 95 },
              { id: "b", label: "Doctors",                  shape: "circle", x: 120, y: 20, width: 100, height: 95 },
              { id: "c", label: "Healthcare Professionals", shape: "circle", x: 230, y: 20, width: 100, height: 95 },
            ],
            regionLabels: [],
            legend: [{ label: "GPs", shape: "circle" }, { label: "Doctors", shape: "circle" }, { label: "Healthcare Professionals", shape: "circle" }],
          },
        },
      ],
      answer: "A",
      explanation:
        "'All GPs are doctors' means GPs ⊂ Doctors. 'All doctors are healthcare professionals' means Doctors ⊂ Healthcare Professionals. This creates a triple nested chain: GPs inside Doctors inside Healthcare Professionals. The third statement about 'some GPs not hospital-based' does not introduce a new set and does not affect the diagram structure. Option A correctly shows this nested chain. Option B reverses the containment order. Option C places GPs and Doctors as separate subsets inside Healthcare Professionals. Option D shows all three separate.",
    },
    {
      id: "dm-venn-select-008",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "hard"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "No physiotherapist is a surgeon.",
        "Some physiotherapists work in hospitals.",
        "Some surgeons work in hospitals.",
        "Some hospital workers are neither physiotherapists nor surgeons.",
      ],
      question: "Which of the following diagrams best represents the information given?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram",
            title: "Option A",
            shapes: [
              { id: "a", label: "Physiotherapists", shape: "circle", x: 10, y: 15, width: 150, height: 140 },
              { id: "c", label: "Hospital Workers",  shape: "circle", x: 110, y: 15, width: 150, height: 140 },
              { id: "b", label: "Surgeons",          shape: "circle", x: 210, y: 15, width: 150, height: 140 },
            ],
            regionLabels: [],
            legend: [{ label: "Physiotherapists", shape: "circle" }, { label: "Hospital Workers", shape: "circle" }, { label: "Surgeons", shape: "circle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram",
            title: "Option B",
            shapes: [
              { id: "c", label: "Hospital Workers",  shape: "circle", x: 10, y: 10, width: 230, height: 195 },
              { id: "a", label: "Physiotherapists", shape: "circle", x: 22, y: 35, width: 95, height: 88 },
              { id: "b", label: "Surgeons",          shape: "circle", x: 130, y: 35, width: 95, height: 88 },
            ],
            regionLabels: [],
            legend: [{ label: "Physiotherapists", shape: "circle" }, { label: "Hospital Workers", shape: "circle" }, { label: "Surgeons", shape: "circle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram",
            title: "Option C",
            shapes: [
              { id: "a", label: "Physiotherapists", shape: "circle", x: 10, y: 15, width: 135, height: 125 },
              { id: "b", label: "Surgeons",          shape: "circle", x: 225, y: 15, width: 135, height: 125 },
              { id: "c", label: "Hospital Workers",  shape: "circle", x: 80, y: 165, width: 210, height: 90 },
            ],
            regionLabels: [],
            legend: [{ label: "Physiotherapists", shape: "circle" }, { label: "Hospital Workers", shape: "circle" }, { label: "Surgeons", shape: "circle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram",
            title: "Option D",
            shapes: [
              { id: "a", label: "Physiotherapists", shape: "circle", x: 10, y: 10, width: 145, height: 135 },
              { id: "b", label: "Surgeons",          shape: "circle", x: 105, y: 10, width: 145, height: 135 },
              { id: "c", label: "Hospital Workers",  shape: "circle", x: 65, y: 100, width: 160, height: 110 },
            ],
            regionLabels: [],
            legend: [{ label: "Physiotherapists", shape: "circle" }, { label: "Hospital Workers", shape: "circle" }, { label: "Surgeons", shape: "circle" }],
          },
        },
      ],
      answer: "D",
      explanation:
        "'No physiotherapist is a surgeon' requires those two circles to be separate. 'Some physiotherapists work in hospitals' means Physiotherapists and Hospital Workers overlap. 'Some surgeons work in hospitals' means Surgeons and Hospital Workers overlap. 'Some hospital workers are neither' confirms Hospital Workers extends beyond both groups. Option D correctly shows Physiotherapists and Surgeons as separate overlapping circles, with Hospital Workers cutting across both from below. Option A chains the three circles linearly, making physios and surgeons appear to overlap via hospital workers. Option B shows both as non-overlapping subsets fully inside Hospital Workers. Option C positions Hospital Workers below both groups but without the required overlaps.",
    },
    {
      id: "dm-venn-select-009",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "medium"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "All clinical psychologists are psychologists.",
        "Some psychologists are not clinical psychologists.",
        "No clinical psychologist is a psychiatrist.",
      ],
      question: "Which of the following diagrams best represents the information given?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram",
            title: "Option A",
            shapes: [
              { id: "b", label: "Psychologists",           shape: "circle", x: 10, y: 10, width: 215, height: 185 },
              { id: "a", label: "Clinical Psychologists",  shape: "circle", x: 55, y: 42, width: 120, height: 108 },
              { id: "c", label: "Psychiatrists",           shape: "circle", x: 245, y: 40, width: 120, height: 108 },
            ],
            regionLabels: [],
            legend: [{ label: "Clinical Psychologists", shape: "circle" }, { label: "Psychologists", shape: "circle" }, { label: "Psychiatrists", shape: "circle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram",
            title: "Option B",
            shapes: [
              { id: "b", label: "Psychologists",           shape: "circle", x: 10, y: 10, width: 215, height: 185 },
              { id: "a", label: "Clinical Psychologists",  shape: "circle", x: 55, y: 42, width: 120, height: 108 },
              { id: "c", label: "Psychiatrists",           shape: "circle", x: 155, y: 60, width: 120, height: 108 },
            ],
            regionLabels: [],
            legend: [{ label: "Clinical Psychologists", shape: "circle" }, { label: "Psychologists", shape: "circle" }, { label: "Psychiatrists", shape: "circle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram",
            title: "Option C",
            shapes: [
              { id: "a", label: "Clinical Psychologists",  shape: "circle", x: 10, y: 20, width: 100, height: 95 },
              { id: "b", label: "Psychologists",           shape: "circle", x: 120, y: 20, width: 100, height: 95 },
              { id: "c", label: "Psychiatrists",           shape: "circle", x: 230, y: 20, width: 100, height: 95 },
            ],
            regionLabels: [],
            legend: [{ label: "Clinical Psychologists", shape: "circle" }, { label: "Psychologists", shape: "circle" }, { label: "Psychiatrists", shape: "circle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram",
            title: "Option D",
            shapes: [
              { id: "b", label: "Psychologists",           shape: "circle", x: 10, y: 15, width: 155, height: 140 },
              { id: "c", label: "Psychiatrists",           shape: "circle", x: 110, y: 15, width: 155, height: 140 },
              { id: "a", label: "Clinical Psychologists",  shape: "circle", x: 62, y: 48, width: 100, height: 92 },
            ],
            regionLabels: [],
            legend: [{ label: "Clinical Psychologists", shape: "circle" }, { label: "Psychologists", shape: "circle" }, { label: "Psychiatrists", shape: "circle" }],
          },
        },
      ],
      answer: "A",
      explanation:
        "'All clinical psychologists are psychologists' puts Clinical Psychologists inside Psychologists. 'No clinical psychologist is a psychiatrist' means the Clinical Psychologists and Psychiatrists circles must not touch. The statements say nothing about the relationship between Psychologists and Psychiatrists, so they may or may not overlap. Option A shows Clinical Psychologists inside Psychologists, with Psychiatrists completely separate from both. Option B places Psychiatrists inside Psychologists overlapping with Clinical Psychologists — violating the third statement. Option C shows all three as separate circles. Option D places Clinical Psychologists in the overlap between Psychologists and Psychiatrists, violating the third statement.",
    },
    {
      id: "dm-venn-select-010",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "hard"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "All ICU nurses work night shifts.",
        "Some general ward nurses work night shifts.",
        "Some general ward nurses do not work night shifts.",
        "No ICU nurse is a general ward nurse.",
      ],
      question: "Which of the following diagrams best represents the information given?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram",
            title: "Option A",
            shapes: [
              { id: "b", label: "Night Shift Workers", shape: "circle", x: 10, y: 10, width: 230, height: 195 },
              { id: "a", label: "ICU Nurses",          shape: "circle", x: 22, y: 35, width: 95, height: 88 },
              { id: "c", label: "Ward Nurses",         shape: "circle", x: 130, y: 35, width: 95, height: 88 },
            ],
            regionLabels: [],
            legend: [{ label: "ICU Nurses", shape: "circle" }, { label: "Night Shift Workers", shape: "circle" }, { label: "Ward Nurses", shape: "circle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram",
            title: "Option B",
            shapes: [
              { id: "b", label: "Night Shift Workers", shape: "circle", x: 10, y: 10, width: 200, height: 180 },
              { id: "a", label: "ICU Nurses",          shape: "circle", x: 22, y: 35, width: 90, height: 85 },
              { id: "c", label: "Ward Nurses",         shape: "circle", x: 150, y: 55, width: 120, height: 110 },
            ],
            regionLabels: [],
            legend: [{ label: "ICU Nurses", shape: "circle" }, { label: "Night Shift Workers", shape: "circle" }, { label: "Ward Nurses", shape: "circle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram",
            title: "Option C",
            shapes: [
              { id: "a", label: "ICU Nurses",          shape: "circle", x: 10, y: 20, width: 100, height: 95 },
              { id: "b", label: "Night Shift Workers", shape: "circle", x: 120, y: 20, width: 100, height: 95 },
              { id: "c", label: "Ward Nurses",         shape: "circle", x: 230, y: 20, width: 100, height: 95 },
            ],
            regionLabels: [],
            legend: [{ label: "ICU Nurses", shape: "circle" }, { label: "Night Shift Workers", shape: "circle" }, { label: "Ward Nurses", shape: "circle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram",
            title: "Option D",
            shapes: [
              { id: "b", label: "Night Shift Workers", shape: "circle", x: 10, y: 10, width: 200, height: 180 },
              { id: "a", label: "ICU Nurses",          shape: "circle", x: 22, y: 35, width: 90, height: 85 },
              { id: "c", label: "Ward Nurses",         shape: "circle", x: 85, y: 55, width: 120, height: 110 },
            ],
            regionLabels: [],
            legend: [{ label: "ICU Nurses", shape: "circle" }, { label: "Night Shift Workers", shape: "circle" }, { label: "Ward Nurses", shape: "circle" }],
          },
        },
      ],
      answer: "B",
      explanation:
        "'All ICU nurses work night shifts' places ICU Nurses entirely inside Night Shift Workers. 'Some ward nurses work night shifts' and 'some do not' means Ward Nurses partially overlaps Night Shift Workers. 'No ICU nurse is a general ward nurse' means ICU Nurses and Ward Nurses circles must not touch. Option B shows ICU Nurses (small, inside Night Shift), with Ward Nurses partially overlapping Night Shift Workers from the other side, keeping clear of ICU Nurses. Option A puts both ICU and Ward Nurses as separate, fully contained subsets of Night Shift Workers — violating 'some ward nurses do not work night shifts'. Option D shows Ward Nurses overlapping both Night Shift Workers and ICU Nurses, violating the fourth statement. Option C shows all three separate.",
    },

    // ── dm-venn-select: numerical data diagram selection ────────────────────
    {
      id: "dm-venn-select-011",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "data-display", "medium"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "A university surveyed 120 students about module enrolment.",
        "60 students study Biology, 50 study Chemistry, and 25 study both.",
      ],
      question: "Which of the following diagrams best represents the data?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram",
            title: "Option A",
            shapes: [
              { id: "a", label: "Biology",   shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Chemistry", shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "35", x: 75,  y: 92 },
              { id: "both",   text: "35", x: 160, y: 92 },
              { id: "b-only", text: "25", x: 245, y: 92 },
            ],
            legend: [{ label: "Biology", shape: "circle" }, { label: "Chemistry", shape: "circle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram",
            title: "Option B",
            shapes: [
              { id: "a", label: "Biology",   shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Chemistry", shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "60", x: 75,  y: 92 },
              { id: "both",   text: "25", x: 160, y: 92 },
              { id: "b-only", text: "50", x: 245, y: 92 },
            ],
            legend: [{ label: "Biology", shape: "circle" }, { label: "Chemistry", shape: "circle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram",
            title: "Option C",
            shapes: [
              { id: "a", label: "Biology",   shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Chemistry", shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "35", x: 75,  y: 92 },
              { id: "both",   text: "25", x: 160, y: 92 },
              { id: "b-only", text: "50", x: 245, y: 92 },
            ],
            legend: [{ label: "Biology", shape: "circle" }, { label: "Chemistry", shape: "circle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram",
            title: "Option D",
            shapes: [
              { id: "a", label: "Biology",   shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Chemistry", shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "25", x: 75,  y: 92 },
              { id: "both",   text: "35", x: 160, y: 92 },
              { id: "b-only", text: "25", x: 245, y: 92 },
            ],
            legend: [{ label: "Biology", shape: "circle" }, { label: "Chemistry", shape: "circle" }],
          },
        },
      ],
      answer: "C",
      explanation:
        "Biology-only = 60 − 25 = 35. Chemistry-only = 50 − 25 = 25. Both = 25. Option C correctly shows 35 | 25 | 25. Option A uses 35 as the overlap value instead of 25 — a common error of using the Biology-only count in the wrong region. Option B places the raw totals (60 and 50) as region values, forgetting to subtract the overlap. Option D swaps the overlap (25) and the Biology-only (35) values.",
    },
    {
      id: "dm-venn-select-012",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "data-display", "hard"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "A hospital ward has 90 nurses. 54 are trained in IV cannulation, 42 are trained in venepuncture, and 18 are trained in both.",
      ],
      question: "Which of the following diagrams best represents the data?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram",
            title: "Option A",
            shapes: [
              { id: "a", label: "IV Cannulation", shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Venepuncture",   shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "36", x: 75,  y: 92 },
              { id: "both",   text: "18", x: 160, y: 92 },
              { id: "b-only", text: "24", x: 245, y: 92 },
            ],
            legend: [{ label: "IV Cannulation", shape: "circle" }, { label: "Venepuncture", shape: "circle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram",
            title: "Option B",
            shapes: [
              { id: "a", label: "IV Cannulation", shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Venepuncture",   shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "54", x: 75,  y: 92 },
              { id: "both",   text: "18", x: 160, y: 92 },
              { id: "b-only", text: "42", x: 245, y: 92 },
            ],
            legend: [{ label: "IV Cannulation", shape: "circle" }, { label: "Venepuncture", shape: "circle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram",
            title: "Option C",
            shapes: [
              { id: "a", label: "IV Cannulation", shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Venepuncture",   shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "36", x: 75,  y: 92 },
              { id: "both",   text: "18", x: 160, y: 92 },
              { id: "b-only", text: "36", x: 245, y: 92 },
            ],
            legend: [{ label: "IV Cannulation", shape: "circle" }, { label: "Venepuncture", shape: "circle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram",
            title: "Option D",
            shapes: [
              { id: "a", label: "IV Cannulation", shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Venepuncture",   shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "18", x: 75,  y: 92 },
              { id: "both",   text: "36", x: 160, y: 92 },
              { id: "b-only", text: "24", x: 245, y: 92 },
            ],
            legend: [{ label: "IV Cannulation", shape: "circle" }, { label: "Venepuncture", shape: "circle" }],
          },
        },
      ],
      answer: "A",
      explanation:
        "IV-only = 54 − 18 = 36. Venepuncture-only = 42 − 18 = 24. Both = 18. Option A correctly shows 36 | 18 | 24. Option B places the raw totals (54 and 42) as region values — a common trap of forgetting to subtract the overlap. Option C uses 36 for both 'only' regions (treating the two groups as equal size, which is wrong). Option D swaps the overlap and IV-only values.",
    },
    {
      id: "dm-venn-select-013",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "data-display", "hard"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "200 patients were assessed for three conditions.",
        "72 have Type 2 Diabetes (T2D), 90 have Hypertension (HTN), and 55 have High Cholesterol (HC).",
        "18 have both T2D and HTN only. 12 have both T2D and HC only. 20 have both HTN and HC only. 8 have all three conditions.",
      ],
      question: "Which of the following diagrams best represents the data?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram",
            title: "Option A",
            shapes: [
              { id: "a", label: "T2D", shape: "circle",    x: 100, y: 10, width: 170, height: 160 },
              { id: "b", label: "HTN", shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "HC",  shape: "triangle",  x: 160, y: 80, width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "t2d-only",   text: "34", x: 175, y: 45  },
              { id: "htn-only",   text: "44", x: 65,  y: 200 },
              { id: "hc-only",    text: "15", x: 290, y: 215 },
              { id: "t2d-htn",    text: "18", x: 120, y: 148 },
              { id: "t2d-hc",     text: "12", x: 230, y: 118 },
              { id: "htn-hc",     text: "20", x: 185, y: 215 },
              { id: "all-three",  text: "8",  x: 182, y: 165 },
            ],
            legend: [{ label: "T2D", shape: "circle" }, { label: "HTN", shape: "rectangle" }, { label: "HC", shape: "triangle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram",
            title: "Option B",
            shapes: [
              { id: "a", label: "T2D", shape: "circle",    x: 100, y: 10, width: 170, height: 160 },
              { id: "b", label: "HTN", shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "HC",  shape: "triangle",  x: 160, y: 80, width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "t2d-only",   text: "72", x: 175, y: 45  },
              { id: "htn-only",   text: "90", x: 65,  y: 200 },
              { id: "hc-only",    text: "55", x: 290, y: 215 },
              { id: "t2d-htn",    text: "18", x: 120, y: 148 },
              { id: "t2d-hc",     text: "12", x: 230, y: 118 },
              { id: "htn-hc",     text: "20", x: 185, y: 215 },
              { id: "all-three",  text: "8",  x: 182, y: 165 },
            ],
            legend: [{ label: "T2D", shape: "circle" }, { label: "HTN", shape: "rectangle" }, { label: "HC", shape: "triangle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram",
            title: "Option C",
            shapes: [
              { id: "a", label: "T2D", shape: "circle",    x: 100, y: 10, width: 170, height: 160 },
              { id: "b", label: "HTN", shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "HC",  shape: "triangle",  x: 160, y: 80, width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "t2d-only",   text: "34", x: 175, y: 45  },
              { id: "htn-only",   text: "44", x: 65,  y: 200 },
              { id: "hc-only",    text: "15", x: 290, y: 215 },
              { id: "t2d-htn",    text: "8",  x: 120, y: 148 },
              { id: "t2d-hc",     text: "12", x: 230, y: 118 },
              { id: "htn-hc",     text: "20", x: 185, y: 215 },
              { id: "all-three",  text: "18", x: 182, y: 165 },
            ],
            legend: [{ label: "T2D", shape: "circle" }, { label: "HTN", shape: "rectangle" }, { label: "HC", shape: "triangle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram",
            title: "Option D",
            shapes: [
              { id: "a", label: "T2D", shape: "circle",    x: 100, y: 10, width: 170, height: 160 },
              { id: "b", label: "HTN", shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "HC",  shape: "triangle",  x: 160, y: 80, width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "t2d-only",   text: "34", x: 175, y: 45  },
              { id: "htn-only",   text: "52", x: 65,  y: 200 },
              { id: "hc-only",    text: "15", x: 290, y: 215 },
              { id: "t2d-htn",    text: "18", x: 120, y: 148 },
              { id: "t2d-hc",     text: "12", x: 230, y: 118 },
              { id: "htn-hc",     text: "20", x: 185, y: 215 },
              { id: "all-three",  text: "8",  x: 182, y: 165 },
            ],
            legend: [{ label: "T2D", shape: "circle" }, { label: "HTN", shape: "rectangle" }, { label: "HC", shape: "triangle" }],
          },
        },
      ],
      answer: "A",
      explanation:
        "T2D-only = 72 − 18 − 12 − 8 = 34. HTN-only = 90 − 18 − 20 − 8 = 44. HC-only = 55 − 12 − 20 − 8 = 15. Option A correctly shows 34 | 44 | 15 for the 'only' regions with the stated overlap values. Option B uses the raw condition totals (72, 90, 55) as the 'only' region values — forgetting to subtract all overlaps. Option C swaps the T2D+HTN-only (18) with the all-three (8) values. Option D uses 52 for HTN-only instead of 44 — an arithmetic error.",
    },
    {
      id: "dm-venn-select-014",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "data-display", "medium"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "A GP practice has 150 patients. 80 have high blood pressure, 60 have high cholesterol, and 25 have both.",
      ],
      question: "Which of the following diagrams best represents the data?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram",
            title: "Option A",
            shapes: [
              { id: "a", label: "High Blood Pressure", shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "High Cholesterol",    shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "55", x: 75,  y: 92 },
              { id: "both",   text: "25", x: 160, y: 92 },
              { id: "b-only", text: "35", x: 245, y: 92 },
            ],
            legend: [{ label: "High Blood Pressure", shape: "circle" }, { label: "High Cholesterol", shape: "circle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram",
            title: "Option B",
            shapes: [
              { id: "a", label: "High Blood Pressure", shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "High Cholesterol",    shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "80", x: 75,  y: 92 },
              { id: "both",   text: "25", x: 160, y: 92 },
              { id: "b-only", text: "60", x: 245, y: 92 },
            ],
            legend: [{ label: "High Blood Pressure", shape: "circle" }, { label: "High Cholesterol", shape: "circle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram",
            title: "Option C",
            shapes: [
              { id: "a", label: "High Blood Pressure", shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "High Cholesterol",    shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "55", x: 75,  y: 92 },
              { id: "both",   text: "35", x: 160, y: 92 },
              { id: "b-only", text: "25", x: 245, y: 92 },
            ],
            legend: [{ label: "High Blood Pressure", shape: "circle" }, { label: "High Cholesterol", shape: "circle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram",
            title: "Option D",
            shapes: [
              { id: "a", label: "High Blood Pressure", shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "High Cholesterol",    shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "25", x: 75,  y: 92 },
              { id: "both",   text: "55", x: 160, y: 92 },
              { id: "b-only", text: "35", x: 245, y: 92 },
            ],
            legend: [{ label: "High Blood Pressure", shape: "circle" }, { label: "High Cholesterol", shape: "circle" }],
          },
        },
      ],
      answer: "A",
      explanation:
        "HBP-only = 80 − 25 = 55. HC-only = 60 − 25 = 35. Both = 25. Option A correctly shows 55 | 25 | 35. Option B is the classic trap of using raw totals (80 and 60) as the region values. Option C swaps the HC-only (35) and Both (25). Option D swaps the HBP-only and Both values entirely.",
    },
    {
      id: "dm-venn-select-015",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "data-display", "hard"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "A year group of 180 junior doctors is selecting surgical speciality preferences.",
        "92 are interested in cardiothoracic surgery, 35 in plastic surgery, and 78 in transplant surgery.",
        "15 prefer a speciality combining plastic and transplant surgery.",
        "Half of those interested in cardiothoracic surgery would also combine it with transplant surgery.",
      ],
      question: "Which of the following diagrams best represents the data?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram",
            title: "Option A",
            shapes: [
              { id: "a", label: "Cardiothoracic", shape: "circle",    x: 100, y: 10, width: 170, height: 160 },
              { id: "b", label: "Plastic",        shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Transplant",     shape: "triangle",  x: 160, y: 80, width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "c-only",  text: "46", x: 175, y: 45  },
              { id: "p-only",  text: "20", x: 65,  y: 200 },
              { id: "t-only",  text: "17", x: 290, y: 215 },
              { id: "c-p",     text: "0",  x: 108, y: 148 },
              { id: "c-t",     text: "46", x: 230, y: 118 },
              { id: "p-t",     text: "15", x: 185, y: 215 },
              { id: "all",     text: "0",  x: 182, y: 165 },
            ],
            legend: [{ label: "Cardiothoracic", shape: "circle" }, { label: "Plastic", shape: "rectangle" }, { label: "Transplant", shape: "triangle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram",
            title: "Option B",
            shapes: [
              { id: "a", label: "Cardiothoracic", shape: "circle",    x: 100, y: 10, width: 170, height: 160 },
              { id: "b", label: "Plastic",        shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Transplant",     shape: "triangle",  x: 160, y: 80, width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "c-only",  text: "46", x: 175, y: 45  },
              { id: "p-only",  text: "20", x: 65,  y: 200 },
              { id: "t-only",  text: "17", x: 290, y: 215 },
              { id: "c-p",     text: "0",  x: 108, y: 148 },
              { id: "c-t",     text: "46", x: 230, y: 118 },
              { id: "p-t",     text: "15", x: 185, y: 215 },
              { id: "all",     text: "5",  x: 182, y: 165 },
            ],
            legend: [{ label: "Cardiothoracic", shape: "circle" }, { label: "Plastic", shape: "rectangle" }, { label: "Transplant", shape: "triangle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram",
            title: "Option C",
            shapes: [
              { id: "a", label: "Cardiothoracic", shape: "circle",    x: 100, y: 10, width: 170, height: 160 },
              { id: "b", label: "Plastic",        shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Transplant",     shape: "triangle",  x: 160, y: 80, width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "c-only",  text: "46", x: 175, y: 45  },
              { id: "p-only",  text: "35", x: 65,  y: 200 },
              { id: "t-only",  text: "17", x: 290, y: 215 },
              { id: "c-p",     text: "0",  x: 108, y: 148 },
              { id: "c-t",     text: "46", x: 230, y: 118 },
              { id: "p-t",     text: "15", x: 185, y: 215 },
              { id: "all",     text: "0",  x: 182, y: 165 },
            ],
            legend: [{ label: "Cardiothoracic", shape: "circle" }, { label: "Plastic", shape: "rectangle" }, { label: "Transplant", shape: "triangle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram",
            title: "Option D",
            shapes: [
              { id: "a", label: "Cardiothoracic", shape: "circle",    x: 100, y: 10, width: 170, height: 160 },
              { id: "b", label: "Plastic",        shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Transplant",     shape: "triangle",  x: 160, y: 80, width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "c-only",  text: "46", x: 175, y: 45  },
              { id: "p-only",  text: "20", x: 65,  y: 200 },
              { id: "t-only",  text: "32", x: 290, y: 215 },
              { id: "c-p",     text: "0",  x: 108, y: 148 },
              { id: "c-t",     text: "46", x: 230, y: 118 },
              { id: "p-t",     text: "15", x: 185, y: 215 },
              { id: "all",     text: "0",  x: 182, y: 165 },
            ],
            legend: [{ label: "Cardiothoracic", shape: "circle" }, { label: "Plastic", shape: "rectangle" }, { label: "Transplant", shape: "triangle" }],
          },
        },
      ],
      answer: "A",
      explanation:
        "Half of 92 cardiothoracic = 46 prefer combining with transplant → C∩T only = 46. C-only = 92 − 46 = 46. P∩T only = 15. P-only = 35 − 15 = 20. T-only = 78 − 46 − 15 = 17. No all-three stated, so all-three = 0. Option A shows these values correctly. Option B adds a spurious all-three value of 5, distorting the counts. Option C uses the raw plastic total (35) as Plastic-only rather than subtracting the P∩T overlap (35 − 15 = 20). Option D uses 32 for Transplant-only instead of 17 — failing to subtract both overlaps.",
    },

    {
      id: "dm-venn-select-016",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "data-display", "medium"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "A hospital surveyed 200 staff about optional training programmes.",
        "120 completed BLS training, 85 completed Infection Control, and 40 completed both.",
      ],
      question: "Which of the following diagrams best represents the data?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram",
            title: "Option A",
            shapes: [
              { id: "a", label: "BLS",              shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Infection Control", shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "80",  x: 75,  y: 92 },
              { id: "both",   text: "40",  x: 160, y: 92 },
              { id: "b-only", text: "45",  x: 245, y: 92 },
            ],
            legend: [{ label: "BLS", shape: "circle" }, { label: "Infection Control", shape: "circle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram",
            title: "Option B",
            shapes: [
              { id: "a", label: "BLS",              shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Infection Control", shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "120", x: 75,  y: 92 },
              { id: "both",   text: "40",  x: 160, y: 92 },
              { id: "b-only", text: "85",  x: 245, y: 92 },
            ],
            legend: [{ label: "BLS", shape: "circle" }, { label: "Infection Control", shape: "circle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram",
            title: "Option C",
            shapes: [
              { id: "a", label: "BLS",              shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Infection Control", shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "80",  x: 75,  y: 92 },
              { id: "both",   text: "45",  x: 160, y: 92 },
              { id: "b-only", text: "40",  x: 245, y: 92 },
            ],
            legend: [{ label: "BLS", shape: "circle" }, { label: "Infection Control", shape: "circle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram",
            title: "Option D",
            shapes: [
              { id: "a", label: "BLS",              shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Infection Control", shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "40",  x: 75,  y: 92 },
              { id: "both",   text: "80",  x: 160, y: 92 },
              { id: "b-only", text: "45",  x: 245, y: 92 },
            ],
            legend: [{ label: "BLS", shape: "circle" }, { label: "Infection Control", shape: "circle" }],
          },
        },
      ],
      answer: "A",
      explanation:
        "BLS-only = 120 − 40 = 80. Infection Control-only = 85 − 40 = 45. Both = 40. Option A correctly shows 80 | 40 | 45. Option B places the raw totals (120 and 85) as region values. Option C swaps the Both (40) and IC-only (45) values. Option D swaps the BLS-only (80) with the overlap (40).",
    },
    {
      id: "dm-venn-select-017",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "data-display", "hard"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "A clinic reviewed 160 patients referred for metabolic assessment.",
        "88 had hypertension, 72 had type 2 diabetes, and 30 had both conditions.",
      ],
      question: "Which of the following diagrams best represents the data?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram",
            title: "Option A",
            shapes: [
              { id: "a", label: "Hypertension",  shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Type 2 Diabetes", shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "58", x: 75,  y: 92 },
              { id: "both",   text: "30", x: 160, y: 92 },
              { id: "b-only", text: "42", x: 245, y: 92 },
            ],
            legend: [{ label: "Hypertension", shape: "circle" }, { label: "Type 2 Diabetes", shape: "circle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram",
            title: "Option B",
            shapes: [
              { id: "a", label: "Hypertension",  shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Type 2 Diabetes", shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "88", x: 75,  y: 92 },
              { id: "both",   text: "30", x: 160, y: 92 },
              { id: "b-only", text: "72", x: 245, y: 92 },
            ],
            legend: [{ label: "Hypertension", shape: "circle" }, { label: "Type 2 Diabetes", shape: "circle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram",
            title: "Option C",
            shapes: [
              { id: "a", label: "Hypertension",  shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Type 2 Diabetes", shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "58", x: 75,  y: 92 },
              { id: "both",   text: "42", x: 160, y: 92 },
              { id: "b-only", text: "30", x: 245, y: 92 },
            ],
            legend: [{ label: "Hypertension", shape: "circle" }, { label: "Type 2 Diabetes", shape: "circle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram",
            title: "Option D",
            shapes: [
              { id: "a", label: "Hypertension",  shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Type 2 Diabetes", shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "30", x: 75,  y: 92 },
              { id: "both",   text: "58", x: 160, y: 92 },
              { id: "b-only", text: "42", x: 245, y: 92 },
            ],
            legend: [{ label: "Hypertension", shape: "circle" }, { label: "Type 2 Diabetes", shape: "circle" }],
          },
        },
      ],
      answer: "A",
      explanation:
        "HTN-only = 88 − 30 = 58. T2D-only = 72 − 30 = 42. Both = 30. Neither = 160 − (58 + 30 + 42) = 160 − 130 = 30. Option A correctly shows 58 | 30 | 42. Option B places the raw totals (88 and 72) as region values — the classic trap of forgetting to subtract the overlap. Option C swaps the T2D-only (42) and Both (30) values. Option D swaps HTN-only (58) with Both (30).",
    },
    {
      id: "dm-venn-select-018",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "data-display", "medium"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "240 medical students were surveyed about extracurricular activities.",
        "96 are members of the Anatomy Society, 80 are in the Global Health Society, and 32 belong to both.",
      ],
      question: "Which of the following diagrams best represents the data?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram",
            title: "Option A",
            shapes: [
              { id: "a", label: "Anatomy Society",       shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Global Health Society", shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "64", x: 75,  y: 92 },
              { id: "both",   text: "32", x: 160, y: 92 },
              { id: "b-only", text: "48", x: 245, y: 92 },
            ],
            legend: [{ label: "Anatomy Society", shape: "circle" }, { label: "Global Health Society", shape: "circle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram",
            title: "Option B",
            shapes: [
              { id: "a", label: "Anatomy Society",       shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Global Health Society", shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "96", x: 75,  y: 92 },
              { id: "both",   text: "32", x: 160, y: 92 },
              { id: "b-only", text: "80", x: 245, y: 92 },
            ],
            legend: [{ label: "Anatomy Society", shape: "circle" }, { label: "Global Health Society", shape: "circle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram",
            title: "Option C",
            shapes: [
              { id: "a", label: "Anatomy Society",       shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Global Health Society", shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "64", x: 75,  y: 92 },
              { id: "both",   text: "48", x: 160, y: 92 },
              { id: "b-only", text: "32", x: 245, y: 92 },
            ],
            legend: [{ label: "Anatomy Society", shape: "circle" }, { label: "Global Health Society", shape: "circle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram",
            title: "Option D",
            shapes: [
              { id: "a", label: "Anatomy Society",       shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Global Health Society", shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "32", x: 75,  y: 92 },
              { id: "both",   text: "64", x: 160, y: 92 },
              { id: "b-only", text: "48", x: 245, y: 92 },
            ],
            legend: [{ label: "Anatomy Society", shape: "circle" }, { label: "Global Health Society", shape: "circle" }],
          },
        },
      ],
      answer: "A",
      explanation:
        "Anatomy-only = 96 − 32 = 64. GHS-only = 80 − 32 = 48. Both = 32. Option A correctly shows 64 | 32 | 48. Option B places the raw totals (96 and 80) as region values. Option C swaps the GHS-only (48) and Both (32) values. Option D swaps Anatomy-only (64) with Both (32).",
    },
    {
      id: "dm-venn-select-019",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "data-display", "hard"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "A hospital audited 180 staff across three optional CPD programmes.",
        "75 completed Leadership, 60 completed Research Methods, and 55 completed Clinical Governance.",
        "20 completed both Leadership and Research Methods only. 15 completed both Leadership and Clinical Governance only. 12 completed both Research Methods and Clinical Governance only. 5 completed all three.",
      ],
      question: "Which of the following diagrams best represents the data?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram",
            title: "Option A",
            shapes: [
              { id: "a", label: "Leadership",         shape: "circle",    x: 100, y: 10, width: 170, height: 160 },
              { id: "b", label: "Research Methods",   shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Clinical Governance",shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "l-only",   text: "35", x: 175, y: 45  },
              { id: "r-only",   text: "23", x: 65,  y: 200 },
              { id: "cg-only",  text: "23", x: 290, y: 215 },
              { id: "l-r",      text: "20", x: 108, y: 148 },
              { id: "l-cg",     text: "15", x: 230, y: 118 },
              { id: "r-cg",     text: "12", x: 185, y: 215 },
              { id: "all",      text: "5",  x: 182, y: 165 },
            ],
            legend: [{ label: "Leadership", shape: "circle" }, { label: "Research Methods", shape: "rectangle" }, { label: "Clinical Governance", shape: "triangle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram",
            title: "Option B",
            shapes: [
              { id: "a", label: "Leadership",         shape: "circle",    x: 100, y: 10, width: 170, height: 160 },
              { id: "b", label: "Research Methods",   shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Clinical Governance",shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "l-only",   text: "75", x: 175, y: 45  },
              { id: "r-only",   text: "60", x: 65,  y: 200 },
              { id: "cg-only",  text: "55", x: 290, y: 215 },
              { id: "l-r",      text: "20", x: 108, y: 148 },
              { id: "l-cg",     text: "15", x: 230, y: 118 },
              { id: "r-cg",     text: "12", x: 185, y: 215 },
              { id: "all",      text: "5",  x: 182, y: 165 },
            ],
            legend: [{ label: "Leadership", shape: "circle" }, { label: "Research Methods", shape: "rectangle" }, { label: "Clinical Governance", shape: "triangle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram",
            title: "Option C",
            shapes: [
              { id: "a", label: "Leadership",         shape: "circle",    x: 100, y: 10, width: 170, height: 160 },
              { id: "b", label: "Research Methods",   shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Clinical Governance",shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "l-only",   text: "35", x: 175, y: 45  },
              { id: "r-only",   text: "23", x: 65,  y: 200 },
              { id: "cg-only",  text: "23", x: 290, y: 215 },
              { id: "l-r",      text: "20", x: 108, y: 148 },
              { id: "l-cg",     text: "15", x: 230, y: 118 },
              { id: "r-cg",     text: "12", x: 185, y: 215 },
              { id: "all",      text: "15", x: 182, y: 165 },
            ],
            legend: [{ label: "Leadership", shape: "circle" }, { label: "Research Methods", shape: "rectangle" }, { label: "Clinical Governance", shape: "triangle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram",
            title: "Option D",
            shapes: [
              { id: "a", label: "Leadership",         shape: "circle",    x: 100, y: 10, width: 170, height: 160 },
              { id: "b", label: "Research Methods",   shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Clinical Governance",shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "l-only",   text: "35", x: 175, y: 45  },
              { id: "r-only",   text: "28", x: 65,  y: 200 },
              { id: "cg-only",  text: "23", x: 290, y: 215 },
              { id: "l-r",      text: "20", x: 108, y: 148 },
              { id: "l-cg",     text: "15", x: 230, y: 118 },
              { id: "r-cg",     text: "12", x: 185, y: 215 },
              { id: "all",      text: "5",  x: 182, y: 165 },
            ],
            legend: [{ label: "Leadership", shape: "circle" }, { label: "Research Methods", shape: "rectangle" }, { label: "Clinical Governance", shape: "triangle" }],
          },
        },
      ],
      answer: "A",
      explanation:
        "L-only = 75 − 20 − 15 − 5 = 35. R-only = 60 − 20 − 12 − 5 = 23. CG-only = 55 − 15 − 12 − 5 = 23. All-three = 5. Option A shows these correct values. Option B uses raw programme totals (75, 60, 55) in the 'only' regions. Option C uses 15 for all-three instead of 5 — a confusion with the L∩CG-only value. Option D uses 28 for R-only (60 − 20 − 12 = 28, forgetting to subtract the all-three component of 5).",
    },
    {
      id: "dm-venn-select-020",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "data-display", "hard"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "A medical school surveyed 200 postgraduate students.",
        "90 had published a research paper, 105 had presented at a conference, and 45 had done both.",
      ],
      question: "Which of the following diagrams best represents the data?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram",
            title: "Option A",
            shapes: [
              { id: "a", label: "Published",   shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Presented",   shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "45",  x: 75,  y: 92 },
              { id: "both",   text: "45",  x: 160, y: 92 },
              { id: "b-only", text: "60",  x: 245, y: 92 },
            ],
            legend: [{ label: "Published", shape: "circle" }, { label: "Presented", shape: "circle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram",
            title: "Option B",
            shapes: [
              { id: "a", label: "Published",   shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Presented",   shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "90",  x: 75,  y: 92 },
              { id: "both",   text: "45",  x: 160, y: 92 },
              { id: "b-only", text: "105", x: 245, y: 92 },
            ],
            legend: [{ label: "Published", shape: "circle" }, { label: "Presented", shape: "circle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram",
            title: "Option C",
            shapes: [
              { id: "a", label: "Published",   shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Presented",   shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "45",  x: 75,  y: 92 },
              { id: "both",   text: "60",  x: 160, y: 92 },
              { id: "b-only", text: "45",  x: 245, y: 92 },
            ],
            legend: [{ label: "Published", shape: "circle" }, { label: "Presented", shape: "circle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram",
            title: "Option D",
            shapes: [
              { id: "a", label: "Published",   shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Presented",   shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "60",  x: 75,  y: 92 },
              { id: "both",   text: "30",  x: 160, y: 92 },
              { id: "b-only", text: "60",  x: 245, y: 92 },
            ],
            legend: [{ label: "Published", shape: "circle" }, { label: "Presented", shape: "circle" }],
          },
        },
      ],
      answer: "A",
      explanation:
        "Published-only = 90 − 45 = 45. Presented-only = 105 − 45 = 60. Both = 45. Option A correctly shows 45 | 45 | 60. Option B uses the raw totals (90 and 105) as region values. Option C uses 60 as the overlap rather than 45, and 45 as Presented-only rather than 60 — swapping the two values. Option D halves the overlap to 30 and uses 60 for both 'only' regions, which is internally inconsistent (60+30+60=150, leaving 50 unaccounted of the 200 total).",
    },

    {
      id: "dm-venn-select-021",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "data-display", "hard"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "A medical school surveyed 300 students about their extracurricular involvement.",
        "85 students participate in a Research Society, 70 in a Volunteering Scheme, and 60 in a Sports Club.",
        "22 students participate in both Research and Volunteering only. 15 participate in both Research and Sports only. 18 participate in both Volunteering and Sports only. 8 participate in all three.",
      ],
      question: "Which of the following diagrams best represents the data?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram", title: "Option A",
            shapes: [
              { id: "a", label: "Research",     shape: "circle",    x: 100, y: 10,  width: 170, height: 160 },
              { id: "b", label: "Volunteering", shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Sports",       shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "r-only",  text: "40", x: 175, y: 45  },
              { id: "v-only",  text: "22", x: 65,  y: 200 },
              { id: "s-only",  text: "19", x: 290, y: 215 },
              { id: "r-v",     text: "22", x: 108, y: 148 },
              { id: "r-s",     text: "15", x: 230, y: 118 },
              { id: "v-s",     text: "18", x: 185, y: 215 },
              { id: "all",     text: "8",  x: 182, y: 165 },
            ],
            legend: [{ label: "Research", shape: "circle" }, { label: "Volunteering", shape: "rectangle" }, { label: "Sports", shape: "triangle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram", title: "Option B",
            shapes: [
              { id: "a", label: "Research",     shape: "circle",    x: 100, y: 10,  width: 170, height: 160 },
              { id: "b", label: "Volunteering", shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Sports",       shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "r-only",  text: "85", x: 175, y: 45  },
              { id: "v-only",  text: "70", x: 65,  y: 200 },
              { id: "s-only",  text: "60", x: 290, y: 215 },
              { id: "r-v",     text: "22", x: 108, y: 148 },
              { id: "r-s",     text: "15", x: 230, y: 118 },
              { id: "v-s",     text: "18", x: 185, y: 215 },
              { id: "all",     text: "8",  x: 182, y: 165 },
            ],
            legend: [{ label: "Research", shape: "circle" }, { label: "Volunteering", shape: "rectangle" }, { label: "Sports", shape: "triangle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram", title: "Option C",
            shapes: [
              { id: "a", label: "Research",     shape: "circle",    x: 100, y: 10,  width: 170, height: 160 },
              { id: "b", label: "Volunteering", shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Sports",       shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "r-only",  text: "48", x: 175, y: 45  },
              { id: "v-only",  text: "30", x: 65,  y: 200 },
              { id: "s-only",  text: "27", x: 290, y: 215 },
              { id: "r-v",     text: "22", x: 108, y: 148 },
              { id: "r-s",     text: "15", x: 230, y: 118 },
              { id: "v-s",     text: "18", x: 185, y: 215 },
              { id: "all",     text: "8",  x: 182, y: 165 },
            ],
            legend: [{ label: "Research", shape: "circle" }, { label: "Volunteering", shape: "rectangle" }, { label: "Sports", shape: "triangle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram", title: "Option D",
            shapes: [
              { id: "a", label: "Research",     shape: "circle",    x: 100, y: 10,  width: 170, height: 160 },
              { id: "b", label: "Volunteering", shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Sports",       shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "r-only",  text: "40", x: 175, y: 45  },
              { id: "v-only",  text: "22", x: 65,  y: 200 },
              { id: "s-only",  text: "19", x: 290, y: 215 },
              { id: "r-v",     text: "22", x: 108, y: 148 },
              { id: "r-s",     text: "15", x: 230, y: 118 },
              { id: "v-s",     text: "18", x: 185, y: 215 },
              { id: "all",     text: "5",  x: 182, y: 165 },
            ],
            legend: [{ label: "Research", shape: "circle" }, { label: "Volunteering", shape: "rectangle" }, { label: "Sports", shape: "triangle" }],
          },
        },
      ],
      answer: "A",
      explanation:
        "R-only = 85 − 22 − 15 − 8 = 40. V-only = 70 − 22 − 18 − 8 = 22. S-only = 60 − 15 − 18 − 8 = 19. All-three = 8. Option A shows these correct values. Option B puts the raw set totals (85, 70, 60) in the 'only' regions — forgetting to subtract overlaps. Option C subtracts the pairwise overlaps but forgets to subtract the all-three value (e.g. R-only = 85 − 22 − 15 = 48 instead of 40). Option D uses 5 as the all-three value instead of the stated 8.",
    },
    {
      id: "dm-venn-select-022",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "data-display", "medium"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "An NHS trust audited 250 clinical staff members about two professional development roles.",
        "110 staff hold a clinical leadership position, 80 are research-active, and 35 hold both roles.",
      ],
      question: "Which of the following diagrams best represents the data?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram", title: "Option A",
            shapes: [
              { id: "a", label: "Clinical Leadership", shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Research Active",     shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "75", x: 75,  y: 92 },
              { id: "both",   text: "35", x: 160, y: 92 },
              { id: "b-only", text: "45", x: 245, y: 92 },
            ],
            legend: [{ label: "Clinical Leadership", shape: "circle" }, { label: "Research Active", shape: "circle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram", title: "Option B",
            shapes: [
              { id: "a", label: "Clinical Leadership", shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Research Active",     shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "110", x: 75,  y: 92 },
              { id: "both",   text: "35",  x: 160, y: 92 },
              { id: "b-only", text: "80",  x: 245, y: 92 },
            ],
            legend: [{ label: "Clinical Leadership", shape: "circle" }, { label: "Research Active", shape: "circle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram", title: "Option C",
            shapes: [
              { id: "a", label: "Clinical Leadership", shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Research Active",     shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "35", x: 75,  y: 92 },
              { id: "both",   text: "75", x: 160, y: 92 },
              { id: "b-only", text: "45", x: 245, y: 92 },
            ],
            legend: [{ label: "Clinical Leadership", shape: "circle" }, { label: "Research Active", shape: "circle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram", title: "Option D",
            shapes: [
              { id: "a", label: "Clinical Leadership", shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Research Active",     shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "75", x: 75,  y: 92 },
              { id: "both",   text: "45", x: 160, y: 92 },
              { id: "b-only", text: "35", x: 245, y: 92 },
            ],
            legend: [{ label: "Clinical Leadership", shape: "circle" }, { label: "Research Active", shape: "circle" }],
          },
        },
      ],
      answer: "A",
      explanation:
        "CL-only = 110 − 35 = 75. RA-only = 80 − 35 = 45. Both = 35. Option A correctly shows 75 | 35 | 45. Option B places the raw set totals (110 and 80) as the 'only' region values. Option C swaps CL-only (75) and Both (35). Option D swaps the RA-only (45) and Both (35) values — using 45 as the overlap and 35 as the RA-only region.",
    },
    {
      id: "dm-venn-select-023",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "data-display", "hard"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "A community health screening programme assessed 150 participants for three conditions.",
        "60 have hypertension, 50 have type 2 diabetes, and 40 have obesity.",
        "14 have both hypertension and diabetes only. 10 have both hypertension and obesity only. 8 have both diabetes and obesity only. 5 have all three conditions.",
      ],
      question: "Which of the following diagrams best represents the data?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram", title: "Option A",
            shapes: [
              { id: "a", label: "Hypertension", shape: "circle",    x: 100, y: 10,  width: 170, height: 160 },
              { id: "b", label: "Diabetes",     shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Obesity",      shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "h-only",  text: "31", x: 175, y: 45  },
              { id: "d-only",  text: "23", x: 65,  y: 200 },
              { id: "o-only",  text: "17", x: 290, y: 215 },
              { id: "h-d",     text: "14", x: 108, y: 148 },
              { id: "h-o",     text: "10", x: 230, y: 118 },
              { id: "d-o",     text: "8",  x: 185, y: 215 },
              { id: "all",     text: "5",  x: 182, y: 165 },
            ],
            legend: [{ label: "Hypertension", shape: "circle" }, { label: "Diabetes", shape: "rectangle" }, { label: "Obesity", shape: "triangle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram", title: "Option B",
            shapes: [
              { id: "a", label: "Hypertension", shape: "circle",    x: 100, y: 10,  width: 170, height: 160 },
              { id: "b", label: "Diabetes",     shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Obesity",      shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "h-only",  text: "60", x: 175, y: 45  },
              { id: "d-only",  text: "50", x: 65,  y: 200 },
              { id: "o-only",  text: "40", x: 290, y: 215 },
              { id: "h-d",     text: "14", x: 108, y: 148 },
              { id: "h-o",     text: "10", x: 230, y: 118 },
              { id: "d-o",     text: "8",  x: 185, y: 215 },
              { id: "all",     text: "5",  x: 182, y: 165 },
            ],
            legend: [{ label: "Hypertension", shape: "circle" }, { label: "Diabetes", shape: "rectangle" }, { label: "Obesity", shape: "triangle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram", title: "Option C",
            shapes: [
              { id: "a", label: "Hypertension", shape: "circle",    x: 100, y: 10,  width: 170, height: 160 },
              { id: "b", label: "Diabetes",     shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Obesity",      shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "h-only",  text: "36", x: 175, y: 45  },
              { id: "d-only",  text: "28", x: 65,  y: 200 },
              { id: "o-only",  text: "22", x: 290, y: 215 },
              { id: "h-d",     text: "14", x: 108, y: 148 },
              { id: "h-o",     text: "10", x: 230, y: 118 },
              { id: "d-o",     text: "8",  x: 185, y: 215 },
              { id: "all",     text: "5",  x: 182, y: 165 },
            ],
            legend: [{ label: "Hypertension", shape: "circle" }, { label: "Diabetes", shape: "rectangle" }, { label: "Obesity", shape: "triangle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram", title: "Option D",
            shapes: [
              { id: "a", label: "Hypertension", shape: "circle",    x: 100, y: 10,  width: 170, height: 160 },
              { id: "b", label: "Diabetes",     shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Obesity",      shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "h-only",  text: "31", x: 175, y: 45  },
              { id: "d-only",  text: "23", x: 65,  y: 200 },
              { id: "o-only",  text: "17", x: 290, y: 215 },
              { id: "h-d",     text: "14", x: 108, y: 148 },
              { id: "h-o",     text: "10", x: 230, y: 118 },
              { id: "d-o",     text: "8",  x: 185, y: 215 },
              { id: "all",     text: "8",  x: 182, y: 165 },
            ],
            legend: [{ label: "Hypertension", shape: "circle" }, { label: "Diabetes", shape: "rectangle" }, { label: "Obesity", shape: "triangle" }],
          },
        },
      ],
      answer: "A",
      explanation:
        "H-only = 60 − 14 − 10 − 5 = 31. D-only = 50 − 14 − 8 − 5 = 23. O-only = 40 − 10 − 8 − 5 = 17. All-three = 5. Option A shows the correct values. Option B uses raw condition totals in the 'only' regions. Option C subtracts only pairwise overlaps without the all-three: H-only = 60 − 14 − 10 = 36. Option D replaces all-three (5) with 8 — confusing it with the D∩O-only value.",
    },
    {
      id: "dm-venn-select-024",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "data-display", "medium"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "An emergency department audited 180 nursing staff about two advanced life support qualifications.",
        "96 nurses hold Advanced Life Support (ALS) certification and 72 hold Advanced Trauma Life Support (ATLS) certification.",
        "30 nurses hold both qualifications.",
      ],
      question: "Which of the following diagrams best represents the data?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram", title: "Option A",
            shapes: [
              { id: "a", label: "ALS",  shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "ATLS", shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "66", x: 75,  y: 92 },
              { id: "both",   text: "30", x: 160, y: 92 },
              { id: "b-only", text: "42", x: 245, y: 92 },
            ],
            legend: [{ label: "ALS", shape: "circle" }, { label: "ATLS", shape: "circle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram", title: "Option B",
            shapes: [
              { id: "a", label: "ALS",  shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "ATLS", shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "96", x: 75,  y: 92 },
              { id: "both",   text: "30", x: 160, y: 92 },
              { id: "b-only", text: "72", x: 245, y: 92 },
            ],
            legend: [{ label: "ALS", shape: "circle" }, { label: "ATLS", shape: "circle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram", title: "Option C",
            shapes: [
              { id: "a", label: "ALS",  shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "ATLS", shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "42", x: 75,  y: 92 },
              { id: "both",   text: "30", x: 160, y: 92 },
              { id: "b-only", text: "66", x: 245, y: 92 },
            ],
            legend: [{ label: "ALS", shape: "circle" }, { label: "ATLS", shape: "circle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram", title: "Option D",
            shapes: [
              { id: "a", label: "ALS",  shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "ATLS", shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "66", x: 75,  y: 92 },
              { id: "both",   text: "42", x: 160, y: 92 },
              { id: "b-only", text: "30", x: 245, y: 92 },
            ],
            legend: [{ label: "ALS", shape: "circle" }, { label: "ATLS", shape: "circle" }],
          },
        },
      ],
      answer: "A",
      explanation:
        "ALS-only = 96 − 30 = 66. ATLS-only = 72 − 30 = 42. Both = 30. Option A correctly shows 66 | 30 | 42. Option B places raw totals (96 and 72) as region values. Option C swaps the ALS-only and ATLS-only values (66 becomes ATLS-only and 42 becomes ALS-only). Option D moves the ATLS-only value (42) into the overlap region and places 30 as ATLS-only.",
    },
    {
      id: "dm-venn-select-025",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "data-display", "hard"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "A medical school reviewed 200 applicants shortlisted for interview.",
        "100 achieved AAA at A-level, 70 had at least 100 hours of healthcare work experience, and 65 scored above the national UCAT average.",
        "18 met both the AAA and work experience criteria only. 14 met both AAA and UCAT criteria only. 10 met both work experience and UCAT criteria only. 6 met all three criteria.",
      ],
      question: "Which of the following diagrams best represents the data?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram", title: "Option A",
            shapes: [
              { id: "a", label: "AAA Grades",   shape: "circle",    x: 100, y: 10,  width: 170, height: 160 },
              { id: "b", label: "Work Exp",      shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "High UCAT",     shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "a-only",  text: "62", x: 175, y: 45  },
              { id: "b-only",  text: "36", x: 65,  y: 200 },
              { id: "c-only",  text: "35", x: 290, y: 215 },
              { id: "a-b",     text: "18", x: 108, y: 148 },
              { id: "a-c",     text: "14", x: 230, y: 118 },
              { id: "b-c",     text: "10", x: 185, y: 215 },
              { id: "all",     text: "6",  x: 182, y: 165 },
            ],
            legend: [{ label: "AAA Grades", shape: "circle" }, { label: "Work Exp", shape: "rectangle" }, { label: "High UCAT", shape: "triangle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram", title: "Option B",
            shapes: [
              { id: "a", label: "AAA Grades",   shape: "circle",    x: 100, y: 10,  width: 170, height: 160 },
              { id: "b", label: "Work Exp",      shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "High UCAT",     shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "a-only",  text: "100", x: 175, y: 45  },
              { id: "b-only",  text: "70",  x: 65,  y: 200 },
              { id: "c-only",  text: "65",  x: 290, y: 215 },
              { id: "a-b",     text: "18",  x: 108, y: 148 },
              { id: "a-c",     text: "14",  x: 230, y: 118 },
              { id: "b-c",     text: "10",  x: 185, y: 215 },
              { id: "all",     text: "6",   x: 182, y: 165 },
            ],
            legend: [{ label: "AAA Grades", shape: "circle" }, { label: "Work Exp", shape: "rectangle" }, { label: "High UCAT", shape: "triangle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram", title: "Option C",
            shapes: [
              { id: "a", label: "AAA Grades",   shape: "circle",    x: 100, y: 10,  width: 170, height: 160 },
              { id: "b", label: "Work Exp",      shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "High UCAT",     shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "a-only",  text: "68", x: 175, y: 45  },
              { id: "b-only",  text: "42", x: 65,  y: 200 },
              { id: "c-only",  text: "41", x: 290, y: 215 },
              { id: "a-b",     text: "18", x: 108, y: 148 },
              { id: "a-c",     text: "14", x: 230, y: 118 },
              { id: "b-c",     text: "10", x: 185, y: 215 },
              { id: "all",     text: "6",  x: 182, y: 165 },
            ],
            legend: [{ label: "AAA Grades", shape: "circle" }, { label: "Work Exp", shape: "rectangle" }, { label: "High UCAT", shape: "triangle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram", title: "Option D",
            shapes: [
              { id: "a", label: "AAA Grades",   shape: "circle",    x: 100, y: 10,  width: 170, height: 160 },
              { id: "b", label: "Work Exp",      shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "High UCAT",     shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "a-only",  text: "62", x: 175, y: 45  },
              { id: "b-only",  text: "36", x: 65,  y: 200 },
              { id: "c-only",  text: "35", x: 290, y: 215 },
              { id: "a-b",     text: "18", x: 108, y: 148 },
              { id: "a-c",     text: "14", x: 230, y: 118 },
              { id: "b-c",     text: "10", x: 185, y: 215 },
              { id: "all",     text: "10", x: 182, y: 165 },
            ],
            legend: [{ label: "AAA Grades", shape: "circle" }, { label: "Work Exp", shape: "rectangle" }, { label: "High UCAT", shape: "triangle" }],
          },
        },
      ],
      answer: "A",
      explanation:
        "AAA-only = 100 − 18 − 14 − 6 = 62. WE-only = 70 − 18 − 10 − 6 = 36. UCAT-only = 65 − 14 − 10 − 6 = 35. All-three = 6. Option A is correct. Option B places raw criterion totals in the 'only' regions. Option C subtracts only the pairwise overlaps without all-three: AAA-only = 100 − 18 − 14 = 68. Option D changes all-three from 6 to 10 — confusing it with the WE∩UCAT-only value.",
    },
    {
      id: "dm-venn-select-026",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "data-display", "medium"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "A community pharmacy surveyed 300 regular customers about two health services they had used in the past six months.",
        "140 customers had used the prescription collection service, 100 had attended a health screening clinic, and 45 had used both services.",
      ],
      question: "Which of the following diagrams best represents the data?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram", title: "Option A",
            shapes: [
              { id: "a", label: "Prescription Service", shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Health Screening",     shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "95",  x: 75,  y: 92 },
              { id: "both",   text: "45",  x: 160, y: 92 },
              { id: "b-only", text: "55",  x: 245, y: 92 },
            ],
            legend: [{ label: "Prescription Service", shape: "circle" }, { label: "Health Screening", shape: "circle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram", title: "Option B",
            shapes: [
              { id: "a", label: "Prescription Service", shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Health Screening",     shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "140", x: 75,  y: 92 },
              { id: "both",   text: "45",  x: 160, y: 92 },
              { id: "b-only", text: "100", x: 245, y: 92 },
            ],
            legend: [{ label: "Prescription Service", shape: "circle" }, { label: "Health Screening", shape: "circle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram", title: "Option C",
            shapes: [
              { id: "a", label: "Prescription Service", shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Health Screening",     shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "55",  x: 75,  y: 92 },
              { id: "both",   text: "45",  x: 160, y: 92 },
              { id: "b-only", text: "95",  x: 245, y: 92 },
            ],
            legend: [{ label: "Prescription Service", shape: "circle" }, { label: "Health Screening", shape: "circle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram", title: "Option D",
            shapes: [
              { id: "a", label: "Prescription Service", shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Health Screening",     shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "95",  x: 75,  y: 92 },
              { id: "both",   text: "55",  x: 160, y: 92 },
              { id: "b-only", text: "45",  x: 245, y: 92 },
            ],
            legend: [{ label: "Prescription Service", shape: "circle" }, { label: "Health Screening", shape: "circle" }],
          },
        },
      ],
      answer: "A",
      explanation:
        "Prescription-only = 140 − 45 = 95. HealthScreening-only = 100 − 45 = 55. Both = 45. Option A shows 95 | 45 | 55 — correct. Option B places the raw service totals as region values. Option C swaps the two 'only' values (putting Prescription-only where HS-only should be and vice versa). Option D swaps the HS-only (55) with the overlap (45).",
    },
    {
      id: "dm-venn-select-027",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "data-display", "hard"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "A foundation year programme reviewed 120 FY1 doctors who each completed at least one rotation.",
        "65 completed a cardiology rotation, 55 a respiratory medicine rotation, and 50 a general surgery rotation.",
        "18 completed both cardiology and respiratory only. 12 completed both cardiology and surgery only. 10 completed both respiratory and surgery only. 6 completed all three rotations.",
      ],
      question: "Which of the following diagrams best represents the data?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram", title: "Option A",
            shapes: [
              { id: "a", label: "Cardiology",  shape: "circle",    x: 100, y: 10,  width: 170, height: 160 },
              { id: "b", label: "Respiratory", shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Gen Surgery", shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "c-only",  text: "29", x: 175, y: 45  },
              { id: "r-only",  text: "21", x: 65,  y: 200 },
              { id: "gs-only", text: "22", x: 290, y: 215 },
              { id: "c-r",     text: "18", x: 108, y: 148 },
              { id: "c-gs",    text: "12", x: 230, y: 118 },
              { id: "r-gs",    text: "10", x: 185, y: 215 },
              { id: "all",     text: "6",  x: 182, y: 165 },
            ],
            legend: [{ label: "Cardiology", shape: "circle" }, { label: "Respiratory", shape: "rectangle" }, { label: "Gen Surgery", shape: "triangle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram", title: "Option B",
            shapes: [
              { id: "a", label: "Cardiology",  shape: "circle",    x: 100, y: 10,  width: 170, height: 160 },
              { id: "b", label: "Respiratory", shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Gen Surgery", shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "c-only",  text: "65", x: 175, y: 45  },
              { id: "r-only",  text: "55", x: 65,  y: 200 },
              { id: "gs-only", text: "50", x: 290, y: 215 },
              { id: "c-r",     text: "18", x: 108, y: 148 },
              { id: "c-gs",    text: "12", x: 230, y: 118 },
              { id: "r-gs",    text: "10", x: 185, y: 215 },
              { id: "all",     text: "6",  x: 182, y: 165 },
            ],
            legend: [{ label: "Cardiology", shape: "circle" }, { label: "Respiratory", shape: "rectangle" }, { label: "Gen Surgery", shape: "triangle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram", title: "Option C",
            shapes: [
              { id: "a", label: "Cardiology",  shape: "circle",    x: 100, y: 10,  width: 170, height: 160 },
              { id: "b", label: "Respiratory", shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Gen Surgery", shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "c-only",  text: "35", x: 175, y: 45  },
              { id: "r-only",  text: "27", x: 65,  y: 200 },
              { id: "gs-only", text: "28", x: 290, y: 215 },
              { id: "c-r",     text: "18", x: 108, y: 148 },
              { id: "c-gs",    text: "12", x: 230, y: 118 },
              { id: "r-gs",    text: "10", x: 185, y: 215 },
              { id: "all",     text: "6",  x: 182, y: 165 },
            ],
            legend: [{ label: "Cardiology", shape: "circle" }, { label: "Respiratory", shape: "rectangle" }, { label: "Gen Surgery", shape: "triangle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram", title: "Option D",
            shapes: [
              { id: "a", label: "Cardiology",  shape: "circle",    x: 100, y: 10,  width: 170, height: 160 },
              { id: "b", label: "Respiratory", shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Gen Surgery", shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "c-only",  text: "29", x: 175, y: 45  },
              { id: "r-only",  text: "21", x: 65,  y: 200 },
              { id: "gs-only", text: "22", x: 290, y: 215 },
              { id: "c-r",     text: "18", x: 108, y: 148 },
              { id: "c-gs",    text: "12", x: 230, y: 118 },
              { id: "r-gs",    text: "10", x: 185, y: 215 },
              { id: "all",     text: "12", x: 182, y: 165 },
            ],
            legend: [{ label: "Cardiology", shape: "circle" }, { label: "Respiratory", shape: "rectangle" }, { label: "Gen Surgery", shape: "triangle" }],
          },
        },
      ],
      answer: "A",
      explanation:
        "C-only = 65 − 18 − 12 − 6 = 29. R-only = 55 − 18 − 10 − 6 = 21. GS-only = 50 − 12 − 10 − 6 = 22. All-three = 6. Option A is correct. Option B uses raw rotation totals. Option C subtracts only the pairwise overlaps (ignoring all-three): C-only = 65 − 18 − 12 = 35. Option D replaces all-three (6) with 12 — confusing it with the C∩GS-only value.",
    },
    {
      id: "dm-venn-select-028",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "data-display", "medium"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "A public health survey of 500 adults assessed adherence to two healthy lifestyle behaviours.",
        "280 adults exercise regularly and 220 follow a Mediterranean diet. 120 adults do both.",
      ],
      question: "Which of the following diagrams best represents the data?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram", title: "Option A",
            shapes: [
              { id: "a", label: "Regular Exercise",    shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Mediterranean Diet",  shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "160", x: 75,  y: 92 },
              { id: "both",   text: "120", x: 160, y: 92 },
              { id: "b-only", text: "100", x: 245, y: 92 },
            ],
            legend: [{ label: "Regular Exercise", shape: "circle" }, { label: "Mediterranean Diet", shape: "circle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram", title: "Option B",
            shapes: [
              { id: "a", label: "Regular Exercise",    shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Mediterranean Diet",  shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "280", x: 75,  y: 92 },
              { id: "both",   text: "120", x: 160, y: 92 },
              { id: "b-only", text: "220", x: 245, y: 92 },
            ],
            legend: [{ label: "Regular Exercise", shape: "circle" }, { label: "Mediterranean Diet", shape: "circle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram", title: "Option C",
            shapes: [
              { id: "a", label: "Regular Exercise",    shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Mediterranean Diet",  shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "120", x: 75,  y: 92 },
              { id: "both",   text: "160", x: 160, y: 92 },
              { id: "b-only", text: "100", x: 245, y: 92 },
            ],
            legend: [{ label: "Regular Exercise", shape: "circle" }, { label: "Mediterranean Diet", shape: "circle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram", title: "Option D",
            shapes: [
              { id: "a", label: "Regular Exercise",    shape: "circle", x: 20, y: 20, width: 160, height: 145 },
              { id: "b", label: "Mediterranean Diet",  shape: "circle", x: 125, y: 20, width: 160, height: 145 },
            ],
            regionLabels: [
              { id: "a-only", text: "160", x: 75,  y: 92 },
              { id: "both",   text: "100", x: 160, y: 92 },
              { id: "b-only", text: "120", x: 245, y: 92 },
            ],
            legend: [{ label: "Regular Exercise", shape: "circle" }, { label: "Mediterranean Diet", shape: "circle" }],
          },
        },
      ],
      answer: "A",
      explanation:
        "Exercise-only = 280 − 120 = 160. MedDiet-only = 220 − 120 = 100. Both = 120. Option A correctly shows 160 | 120 | 100. Option B uses raw totals (280 and 220). Option C swaps Exercise-only (160) with Both (120). Option D swaps MedDiet-only (100) and Both (120), placing 100 as the overlap and 120 as MedDiet-only.",
    },
    {
      id: "dm-venn-select-029",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "data-display", "hard"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "A nursing school surveyed 180 students in their final year about clinical placements completed.",
        "80 students completed an acute care placement, 75 a community placement, and 60 a mental health placement.",
        "15 completed both acute and community only. 10 completed both acute and mental health only. 12 completed both community and mental health only. 5 completed all three.",
      ],
      question: "Which of the following diagrams best represents the data?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram", title: "Option A",
            shapes: [
              { id: "a", label: "Acute Care",    shape: "circle",    x: 100, y: 10,  width: 170, height: 160 },
              { id: "b", label: "Community",     shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Mental Health", shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "ac-only", text: "50", x: 175, y: 45  },
              { id: "cm-only", text: "43", x: 65,  y: 200 },
              { id: "mh-only", text: "33", x: 290, y: 215 },
              { id: "ac-cm",   text: "15", x: 108, y: 148 },
              { id: "ac-mh",   text: "10", x: 230, y: 118 },
              { id: "cm-mh",   text: "12", x: 185, y: 215 },
              { id: "all",     text: "5",  x: 182, y: 165 },
            ],
            legend: [{ label: "Acute Care", shape: "circle" }, { label: "Community", shape: "rectangle" }, { label: "Mental Health", shape: "triangle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram", title: "Option B",
            shapes: [
              { id: "a", label: "Acute Care",    shape: "circle",    x: 100, y: 10,  width: 170, height: 160 },
              { id: "b", label: "Community",     shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Mental Health", shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "ac-only", text: "80", x: 175, y: 45  },
              { id: "cm-only", text: "75", x: 65,  y: 200 },
              { id: "mh-only", text: "60", x: 290, y: 215 },
              { id: "ac-cm",   text: "15", x: 108, y: 148 },
              { id: "ac-mh",   text: "10", x: 230, y: 118 },
              { id: "cm-mh",   text: "12", x: 185, y: 215 },
              { id: "all",     text: "5",  x: 182, y: 165 },
            ],
            legend: [{ label: "Acute Care", shape: "circle" }, { label: "Community", shape: "rectangle" }, { label: "Mental Health", shape: "triangle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram", title: "Option C",
            shapes: [
              { id: "a", label: "Acute Care",    shape: "circle",    x: 100, y: 10,  width: 170, height: 160 },
              { id: "b", label: "Community",     shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Mental Health", shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "ac-only", text: "55", x: 175, y: 45  },
              { id: "cm-only", text: "48", x: 65,  y: 200 },
              { id: "mh-only", text: "38", x: 290, y: 215 },
              { id: "ac-cm",   text: "15", x: 108, y: 148 },
              { id: "ac-mh",   text: "10", x: 230, y: 118 },
              { id: "cm-mh",   text: "12", x: 185, y: 215 },
              { id: "all",     text: "5",  x: 182, y: 165 },
            ],
            legend: [{ label: "Acute Care", shape: "circle" }, { label: "Community", shape: "rectangle" }, { label: "Mental Health", shape: "triangle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram", title: "Option D",
            shapes: [
              { id: "a", label: "Acute Care",    shape: "circle",    x: 100, y: 10,  width: 170, height: 160 },
              { id: "b", label: "Community",     shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Mental Health", shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "ac-only", text: "50", x: 175, y: 45  },
              { id: "cm-only", text: "43", x: 65,  y: 200 },
              { id: "mh-only", text: "33", x: 290, y: 215 },
              { id: "ac-cm",   text: "15", x: 108, y: 148 },
              { id: "ac-mh",   text: "10", x: 230, y: 118 },
              { id: "cm-mh",   text: "12", x: 185, y: 215 },
              { id: "all",     text: "10", x: 182, y: 165 },
            ],
            legend: [{ label: "Acute Care", shape: "circle" }, { label: "Community", shape: "rectangle" }, { label: "Mental Health", shape: "triangle" }],
          },
        },
      ],
      answer: "A",
      explanation:
        "AC-only = 80 − 15 − 10 − 5 = 50. CM-only = 75 − 15 − 12 − 5 = 43. MH-only = 60 − 10 − 12 − 5 = 33. All-three = 5. Option A is correct. Option B uses the raw placement totals (80, 75, 60). Option C subtracts only the two pairwise overlaps per set without the all-three: AC-only = 80 − 15 − 10 = 55. Option D changes all-three to 10 — confusing it with the AC∩MH-only value.",
    },
    {
      id: "dm-venn-select-030",
      section: "dm",
      subtype: "dm-venn-select",
      tags: ["set-based", "data-display", "hard"],
      title: "Decision Making Practice",
      leftTitle: "Diagram",
      stimulus: [
        "A hospital trust with 200 staff members reviewed attendance at three mandatory training sessions.",
        "95 staff attended CPR training, 70 attended a Safeguarding update, and 60 attended a Fire Safety briefing.",
        "20 attended both CPR and Safeguarding only. 15 attended both CPR and Fire Safety only. 10 attended both Safeguarding and Fire Safety only. 5 attended all three sessions.",
      ],
      question: "Which of the following diagrams best represents the data?",
      options: [
        {
          key: "A",
          text: "Diagram A",
          visual: {
            type: "set-diagram", title: "Option A",
            shapes: [
              { id: "a", label: "CPR",          shape: "circle",    x: 100, y: 10,  width: 170, height: 160 },
              { id: "b", label: "Safeguarding", shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Fire Safety",  shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "cpr-only", text: "55", x: 175, y: 45  },
              { id: "sg-only",  text: "35", x: 65,  y: 200 },
              { id: "fs-only",  text: "30", x: 290, y: 215 },
              { id: "cpr-sg",   text: "20", x: 108, y: 148 },
              { id: "cpr-fs",   text: "15", x: 230, y: 118 },
              { id: "sg-fs",    text: "10", x: 185, y: 215 },
              { id: "all",      text: "5",  x: 182, y: 165 },
            ],
            legend: [{ label: "CPR", shape: "circle" }, { label: "Safeguarding", shape: "rectangle" }, { label: "Fire Safety", shape: "triangle" }],
          },
        },
        {
          key: "B",
          text: "Diagram B",
          visual: {
            type: "set-diagram", title: "Option B",
            shapes: [
              { id: "a", label: "CPR",          shape: "circle",    x: 100, y: 10,  width: 170, height: 160 },
              { id: "b", label: "Safeguarding", shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Fire Safety",  shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "cpr-only", text: "95", x: 175, y: 45  },
              { id: "sg-only",  text: "70", x: 65,  y: 200 },
              { id: "fs-only",  text: "60", x: 290, y: 215 },
              { id: "cpr-sg",   text: "20", x: 108, y: 148 },
              { id: "cpr-fs",   text: "15", x: 230, y: 118 },
              { id: "sg-fs",    text: "10", x: 185, y: 215 },
              { id: "all",      text: "5",  x: 182, y: 165 },
            ],
            legend: [{ label: "CPR", shape: "circle" }, { label: "Safeguarding", shape: "rectangle" }, { label: "Fire Safety", shape: "triangle" }],
          },
        },
        {
          key: "C",
          text: "Diagram C",
          visual: {
            type: "set-diagram", title: "Option C",
            shapes: [
              { id: "a", label: "CPR",          shape: "circle",    x: 100, y: 10,  width: 170, height: 160 },
              { id: "b", label: "Safeguarding", shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Fire Safety",  shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "cpr-only", text: "60", x: 175, y: 45  },
              { id: "sg-only",  text: "40", x: 65,  y: 200 },
              { id: "fs-only",  text: "35", x: 290, y: 215 },
              { id: "cpr-sg",   text: "20", x: 108, y: 148 },
              { id: "cpr-fs",   text: "15", x: 230, y: 118 },
              { id: "sg-fs",    text: "10", x: 185, y: 215 },
              { id: "all",      text: "5",  x: 182, y: 165 },
            ],
            legend: [{ label: "CPR", shape: "circle" }, { label: "Safeguarding", shape: "rectangle" }, { label: "Fire Safety", shape: "triangle" }],
          },
        },
        {
          key: "D",
          text: "Diagram D",
          visual: {
            type: "set-diagram", title: "Option D",
            shapes: [
              { id: "a", label: "CPR",          shape: "circle",    x: 100, y: 10,  width: 170, height: 160 },
              { id: "b", label: "Safeguarding", shape: "rectangle", x: 30,  y: 100, width: 170, height: 155 },
              { id: "c", label: "Fire Safety",  shape: "triangle",  x: 160, y: 80,  width: 175, height: 175 },
            ],
            regionLabels: [
              { id: "cpr-only", text: "55", x: 175, y: 45  },
              { id: "sg-only",  text: "35", x: 65,  y: 200 },
              { id: "fs-only",  text: "30", x: 290, y: 215 },
              { id: "cpr-sg",   text: "20", x: 108, y: 148 },
              { id: "cpr-fs",   text: "15", x: 230, y: 118 },
              { id: "sg-fs",    text: "10", x: 185, y: 215 },
              { id: "all",      text: "20", x: 182, y: 165 },
            ],
            legend: [{ label: "CPR", shape: "circle" }, { label: "Safeguarding", shape: "rectangle" }, { label: "Fire Safety", shape: "triangle" }],
          },
        },
      ],
      answer: "A",
      explanation:
        "CPR-only = 95 − 20 − 15 − 5 = 55. SG-only = 70 − 20 − 10 − 5 = 35. FS-only = 60 − 15 − 10 − 5 = 30. All-three = 5. Option A is correct. Option B places the raw training totals (95, 70, 60) in the 'only' regions. Option C subtracts only the pairwise overlaps without all-three: CPR-only = 95 − 20 − 15 = 60. Option D replaces all-three (5) with 20 — confusing it with the CPR∩SG-only value.",
    },

    {
      id: "dm-probability-001",
      section: "dm",
      subtype: "dm-probability-data",
      tags: ["multi-step", "medium", "text-stem"],
      title: "Decision Making Practice",
      leftTitle: "Probability",
      stimulus: [
        "A bag contains 4 red counters, 5 blue counters and 3 white counters. Two counters are chosen at random without replacement.",
      ],
      question: "What is the probability that exactly one of the two counters is red?",
      options: [
        { key: "A", text: "2/11" },
        { key: "B", text: "16/33" },
        { key: "C", text: "4/11" },
        { key: "D", text: "8/33" },
      ],
      answer: "B",
      explanation:
        "Exactly one red can happen as red then not red or not red then red: (4/12 x 8/11) + (8/12 x 4/11) = 64/132 = 16/33.",
    },
    {
      id: "dm-probability-002",
      section: "dm",
      subtype: "dm-probability-data",
      tags: ["quick", "medium", "text-stem"],
      title: "Decision Making Practice",
      leftTitle: "Probability",
      stimulus: [
        "For a remote placement check, the probability that a student uploads the form on time is 0.8. The probability that their ID is verified on the first attempt is 0.9. These events are independent.",
      ],
      question:
        "What is the probability that the student uploads the form on time and has their ID verified on the first attempt?",
      options: [
        { key: "A", text: "0.17" },
        { key: "B", text: "0.72" },
        { key: "C", text: "0.80" },
        { key: "D", text: "0.98" },
      ],
      answer: "B",
      explanation:
        "For independent events, multiply the probabilities: 0.8 x 0.9 = 0.72.",
    },
    {
      id: "dm-probability-003",
      section: "dm",
      subtype: "dm-probability-data",
      tags: ["multi-step", "medium", "text-stem"],
      title: "Decision Making Practice",
      leftTitle: "Probability",
      stimulus: [
        "A standard deck has 52 cards and no jokers. One card is drawn at random.",
      ],
      question: "What is the probability that the card is either a heart or a queen?",
      options: [
        { key: "A", text: "4/13" },
        { key: "B", text: "17/52" },
        { key: "C", text: "1/4" },
        { key: "D", text: "15/52" },
      ],
      answer: "A",
      explanation:
        "There are 13 hearts and 4 queens, but the queen of hearts has been counted twice. Favourable cards = 13 + 4 - 1 = 16, and 16/52 = 4/13.",
    },
  ],
  qr: ([
    {
      id: "qr-graphs-001",
      section: "qr",
      subtype: "qr-graphs",
      setId: "qr-student-priorities",
      tags: ["data-display", "set-based", "easy", "quick"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Graph",
      stimulus: [
        "A student council surveyed 128 students about four campus issues. Each student chose one issue they considered most important and one issue they considered least important. The results are shown in the chart.",
      ],
      visual: {
        type: "grouped-bar",
        title: "Student priorities survey",
        yLabel: "Responses",
        max: 60,
        seriesLabels: ["Most important", "Least important"],
        groups: [
          { label: "Research spaces", values: [44, 18] },
          { label: "Exam fees", values: [36, 22] },
          { label: "Housing", values: [28, 48] },
          { label: "Transport", values: [20, 40] },
        ],
      },
      question:
        "How many more students selected Housing as least important than as most important?",
      options: [
        { key: "A", text: "12" },
        { key: "B", text: "20" },
        { key: "C", text: "28" },
        { key: "D", text: "48" },
      ],
      answer: "B",
      explanation:
        "Housing was selected as least important by 48 students and most important by 28 students. The difference is 20.",
    },
    {
      id: "qr-graphs-002",
      section: "qr",
      subtype: "qr-graphs",
      setId: "qr-student-priorities",
      tags: ["data-display", "set-based", "easy", "multi-step"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Graph",
      stimulus: [
        "A student council surveyed 128 students about four campus issues. Each student chose one issue they considered most important and one issue they considered least important. The results are shown in the chart.",
      ],
      visual: {
        type: "grouped-bar",
        title: "Student priorities survey",
        yLabel: "Responses",
        max: 60,
        seriesLabels: ["Most important", "Least important"],
        groups: [
          { label: "Research spaces", values: [44, 18] },
          { label: "Exam fees", values: [36, 22] },
          { label: "Housing", values: [28, 48] },
          { label: "Transport", values: [20, 40] },
        ],
      },
      question: "Which issue had a combined total of 58 responses?",
      options: [
        { key: "A", text: "Research spaces" },
        { key: "B", text: "Exam fees" },
        { key: "C", text: "Housing" },
        { key: "D", text: "Transport" },
      ],
      answer: "B",
      explanation:
        "Exam fees had 36 most-important responses and 22 least-important responses. 36 + 22 = 58.",
    },
    {
      id: "qr-graphs-003",
      section: "qr",
      subtype: "qr-graphs",
      setId: "qr-student-priorities",
      tags: ["data-display", "set-based", "medium", "multi-step"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Graph",
      stimulus: [
        "A student council surveyed 128 students about four campus issues. Each student chose one issue they considered most important and one issue they considered least important. The results are shown in the chart.",
      ],
      visual: {
        type: "grouped-bar",
        title: "Student priorities survey",
        yLabel: "Responses",
        max: 60,
        seriesLabels: ["Most important", "Least important"],
        groups: [
          { label: "Research spaces", values: [44, 18] },
          { label: "Exam fees", values: [36, 22] },
          { label: "Housing", values: [28, 48] },
          { label: "Transport", values: [20, 40] },
        ],
      },
      question:
        "What is the ratio of students selecting Research spaces or Exam fees as most important to students selecting Housing or Transport as least important?",
      options: [
        { key: "A", text: "8:9" },
        { key: "B", text: "9:10" },
        { key: "C", text: "10:11" },
        { key: "D", text: "11:12" },
      ],
      answer: "C",
      explanation:
        "Research spaces or Exam fees as most important = 44 + 36 = 80. Housing or Transport as least important = 48 + 40 = 88. 80:88 simplifies to 10:11.",
    },
    {
      id: "qr-graphs-004",
      section: "qr",
      subtype: "qr-graphs",
      setId: "qr-student-priorities",
      tags: ["data-display", "set-based", "hard", "multi-step", "time-consuming"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Graph",
      stimulus: [
        "A student council surveyed 128 students about four campus issues. Each student chose one issue they considered most important and one issue they considered least important. The results are shown in the chart.",
      ],
      visual: {
        type: "grouped-bar",
        title: "Student priorities survey",
        yLabel: "Responses",
        max: 60,
        seriesLabels: ["Most important", "Least important"],
        groups: [
          { label: "Research spaces", values: [44, 18] },
          { label: "Exam fees", values: [36, 22] },
          { label: "Housing", values: [28, 48] },
          { label: "Transport", values: [20, 40] },
        ],
      },
      question:
        "If one third of the students who selected Housing as least important were reallocated equally to Research spaces and Exam fees as least important, and 10 students who selected Transport as most important switched to Housing, what would be the ratio of least-important responses for Research spaces and Exam fees combined to most-important responses for Housing and Transport combined?",
      options: [
        { key: "A", text: "5:4" },
        { key: "B", text: "7:6" },
        { key: "C", text: "4:3" },
        { key: "D", text: "3:2" },
      ],
      answer: "B",
      explanation:
        "One third of 48 is 16, split as 8 to Research spaces and 8 to Exam fees. Their least-important total becomes 26 + 30 = 56. Housing most becomes 38 and Transport most becomes 10, total 48. 56:48 simplifies to 7:6.",
    },
    {
      id: "qr-percentages-001",
      section: "qr",
      subtype: "qr-percentages",
      setId: "qr-course-completion",
      tags: ["data-display", "set-based", "easy", "quick"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Table",
      stimulus: [
        "The table shows how many students enrolled in and completed four online practice courses.",
      ],
      visual: {
        type: "table",
        title: "Course completion",
        headers: ["Course", "Enrolled", "Completed"],
        rows: [
          ["Verbal Reasoning", "160", "132"],
          ["Decision Making", "150", "120"],
          ["Quantitative Reasoning", "180", "153"],
          ["Situational Judgement", "120", "108"],
        ],
      },
      question: "Which course had the highest completion percentage?",
      options: [
        { key: "A", text: "Verbal Reasoning" },
        { key: "B", text: "Decision Making" },
        { key: "C", text: "Quantitative Reasoning" },
        { key: "D", text: "Situational Judgement" },
      ],
      answer: "D",
      explanation:
        "The completion rates are 82.5%, 80%, 85% and 90%. Situational Judgement is highest.",
    },
    {
      id: "qr-percentages-002",
      section: "qr",
      subtype: "qr-percentages",
      setId: "qr-course-completion",
      tags: ["data-display", "set-based", "easy", "multi-step"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Table",
      stimulus: [
        "The table shows how many students enrolled in and completed four online practice courses.",
      ],
      visual: {
        type: "table",
        title: "Course completion",
        headers: ["Course", "Enrolled", "Completed"],
        rows: [
          ["Verbal Reasoning", "160", "132"],
          ["Decision Making", "150", "120"],
          ["Quantitative Reasoning", "180", "153"],
          ["Situational Judgement", "120", "108"],
        ],
      },
      question:
        "How many students enrolled in Quantitative Reasoning but did not complete it?",
      options: [
        { key: "A", text: "21" },
        { key: "B", text: "24" },
        { key: "C", text: "27" },
        { key: "D", text: "30" },
      ],
      answer: "C",
      explanation:
        "180 students enrolled in Quantitative Reasoning and 153 completed it, so 180 - 153 = 27 did not complete it.",
    },
    {
      id: "qr-percentages-003",
      section: "qr",
      subtype: "qr-percentages",
      setId: "qr-course-completion",
      tags: ["data-display", "set-based", "medium", "calculator-heavy", "multi-step"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Table",
      stimulus: [
        "The table shows how many students enrolled in and completed four online practice courses.",
      ],
      visual: {
        type: "table",
        title: "Course completion",
        headers: ["Course", "Enrolled", "Completed"],
        rows: [
          ["Verbal Reasoning", "160", "132"],
          ["Decision Making", "150", "120"],
          ["Quantitative Reasoning", "180", "153"],
          ["Situational Judgement", "120", "108"],
        ],
      },
      question:
        "If Decision Making completions increased by 15% while enrolment stayed the same, what would the new completion percentage be?",
      options: [
        { key: "A", text: "82%" },
        { key: "B", text: "88%" },
        { key: "C", text: "92%" },
        { key: "D", text: "95%" },
      ],
      answer: "C",
      explanation:
        "Decision Making completions would be 120 x 1.15 = 138. 138 out of 150 is 92%.",
    },
    {
      id: "qr-percentages-004",
      section: "qr",
      subtype: "qr-percentages",
      setId: "qr-course-completion",
      tags: [
        "data-display",
        "set-based",
        "hard",
        "calculator-heavy",
        "multi-step",
        "time-consuming",
      ],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Table",
      stimulus: [
        "The table shows how many students enrolled in and completed four online practice courses.",
      ],
      visual: {
        type: "table",
        title: "Course completion",
        headers: ["Course", "Enrolled", "Completed"],
        rows: [
          ["Verbal Reasoning", "160", "132"],
          ["Decision Making", "150", "120"],
          ["Quantitative Reasoning", "180", "153"],
          ["Situational Judgement", "120", "108"],
        ],
      },
      question:
        "How many additional completions are needed in total for every course to have at least a 90% completion rate?",
      options: [
        { key: "A", text: "24" },
        { key: "B", text: "30" },
        { key: "C", text: "36" },
        { key: "D", text: "42" },
      ],
      answer: "C",
      explanation:
        "The 90% targets are 144, 135, 162 and 108 completions. Additional completions needed are 12, 15, 9 and 0, giving 36 in total.",
    },
    {
      id: "qr-rates-001",
      section: "qr",
      subtype: "qr-rates-ratios",
      setId: "qr-mobile-clinic-routes",
      tags: ["data-display", "set-based", "easy", "quick"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Table",
      stimulus: [
        "A mobile phlebotomy team recorded travel distance, travel time and samples collected on four routes.",
      ],
      visual: {
        type: "table",
        title: "Mobile clinic routes",
        headers: ["Route", "Distance (km)", "Travel time (min)", "Samples"],
        rows: [
          ["North", "18", "24", "42"],
          ["East", "30", "40", "55"],
          ["South", "24", "30", "48"],
          ["West", "36", "45", "60"],
        ],
      },
      question: "Which route took exactly 1.25 minutes per kilometre?",
      options: [
        { key: "A", text: "North" },
        { key: "B", text: "East" },
        { key: "C", text: "South" },
        { key: "D", text: "West" },
      ],
      answer: "C",
      explanation:
        "South took 30 minutes over 24 km. 30 / 24 = 1.25 minutes per kilometre.",
    },
    {
      id: "qr-rates-002",
      section: "qr",
      subtype: "qr-rates-ratios",
      setId: "qr-mobile-clinic-routes",
      tags: ["data-display", "set-based", "easy", "multi-step"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Table",
      stimulus: [
        "A mobile phlebotomy team recorded travel distance, travel time and samples collected on four routes.",
      ],
      visual: {
        type: "table",
        title: "Mobile clinic routes",
        headers: ["Route", "Distance (km)", "Travel time (min)", "Samples"],
        rows: [
          ["North", "18", "24", "42"],
          ["East", "30", "40", "55"],
          ["South", "24", "30", "48"],
          ["West", "36", "45", "60"],
        ],
      },
      question: "Which route had the highest number of samples collected per kilometre?",
      options: [
        { key: "A", text: "North" },
        { key: "B", text: "East" },
        { key: "C", text: "South" },
        { key: "D", text: "West" },
      ],
      answer: "A",
      explanation:
        "North collected 42 samples over 18 km, about 2.33 samples per km. The other routes are lower.",
    },
    {
      id: "qr-rates-003",
      section: "qr",
      subtype: "qr-rates-ratios",
      setId: "qr-mobile-clinic-routes",
      tags: ["data-display", "set-based", "medium", "calculator-heavy", "multi-step"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Table",
      stimulus: [
        "A mobile phlebotomy team recorded travel distance, travel time and samples collected on four routes.",
      ],
      visual: {
        type: "table",
        title: "Mobile clinic routes",
        headers: ["Route", "Distance (km)", "Travel time (min)", "Samples"],
        rows: [
          ["North", "18", "24", "42"],
          ["East", "30", "40", "55"],
          ["South", "24", "30", "48"],
          ["West", "36", "45", "60"],
        ],
      },
      question:
        "For the East route, what was the approximate rate of samples collected per hour of travel time?",
      options: [
        { key: "A", text: "73" },
        { key: "B", text: "83" },
        { key: "C", text: "92" },
        { key: "D", text: "110" },
      ],
      answer: "B",
      explanation:
        "East collected 55 samples in 40 minutes. In 60 minutes, that is 55 x 60 / 40 = 82.5, approximately 83.",
    },
    {
      id: "qr-rates-004",
      section: "qr",
      subtype: "qr-rates-ratios",
      setId: "qr-mobile-clinic-routes",
      tags: [
        "data-display",
        "set-based",
        "hard",
        "calculator-heavy",
        "multi-step",
        "time-consuming",
      ],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Table",
      stimulus: [
        "A mobile phlebotomy team recorded travel distance, travel time and samples collected on four routes.",
      ],
      visual: {
        type: "table",
        title: "Mobile clinic routes",
        headers: ["Route", "Distance (km)", "Travel time (min)", "Samples"],
        rows: [
          ["North", "18", "24", "42"],
          ["East", "30", "40", "55"],
          ["South", "24", "30", "48"],
          ["West", "36", "45", "60"],
        ],
      },
      question:
        "If the West route distance increased by 25%, while its travel speed and samples-per-minute rate stayed the same, how many samples would be expected?",
      options: [
        { key: "A", text: "68" },
        { key: "B", text: "72" },
        { key: "C", text: "75" },
        { key: "D", text: "80" },
      ],
      answer: "C",
      explanation:
        "A 25% longer route at the same speed takes 25% longer. With the same samples-per-minute rate, samples also rise by 25%: 60 x 1.25 = 75.",
    },
    {
      id: "qr-averages-001",
      section: "qr",
      subtype: "qr-averages",
      setId: "qr-mini-mock-scores",
      tags: ["data-display", "set-based", "easy", "multi-step"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Table",
      stimulus: ["Four students completed three mini-mocks. Their scaled scores are shown."],
      visual: {
        type: "table",
        title: "Mini-mock scores",
        headers: ["Student", "Mock 1", "Mock 2", "Mock 3"],
        rows: [
          ["Asha", "640", "680", "720"],
          ["Ben", "700", "690", "710"],
          ["Cara", "580", "620", "640"],
          ["Dan", "760", "740", "720"],
        ],
      },
      question: "Who had the highest mean score?",
      options: [
        { key: "A", text: "Asha" },
        { key: "B", text: "Ben" },
        { key: "C", text: "Cara" },
        { key: "D", text: "Dan" },
      ],
      answer: "D",
      explanation:
        "Dan's mean is (760 + 740 + 720) / 3 = 740, higher than Asha, Ben and Cara.",
    },
    {
      id: "qr-averages-002",
      section: "qr",
      subtype: "qr-averages",
      setId: "qr-mini-mock-scores",
      tags: ["data-display", "set-based", "easy", "quick"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Table",
      stimulus: ["Four students completed three mini-mocks. Their scaled scores are shown."],
      visual: {
        type: "table",
        title: "Mini-mock scores",
        headers: ["Student", "Mock 1", "Mock 2", "Mock 3"],
        rows: [
          ["Asha", "640", "680", "720"],
          ["Ben", "700", "690", "710"],
          ["Cara", "580", "620", "640"],
          ["Dan", "760", "740", "720"],
        ],
      },
      question: "What is the range of Cara's scores?",
      options: [
        { key: "A", text: "40" },
        { key: "B", text: "50" },
        { key: "C", text: "60" },
        { key: "D", text: "70" },
      ],
      answer: "C",
      explanation:
        "Cara's highest score is 640 and lowest score is 580. The range is 60.",
    },
    {
      id: "qr-averages-003",
      section: "qr",
      subtype: "qr-averages",
      setId: "qr-mini-mock-scores",
      tags: ["data-display", "set-based", "medium", "calculator-heavy", "multi-step"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Table",
      stimulus: ["Four students completed three mini-mocks. Their scaled scores are shown."],
      visual: {
        type: "table",
        title: "Mini-mock scores",
        headers: ["Student", "Mock 1", "Mock 2", "Mock 3"],
        rows: [
          ["Asha", "640", "680", "720"],
          ["Ben", "700", "690", "710"],
          ["Cara", "580", "620", "640"],
          ["Dan", "760", "740", "720"],
        ],
      },
      question: "What is the median of all 12 scores shown?",
      options: [
        { key: "A", text: "690" },
        { key: "B", text: "695" },
        { key: "C", text: "700" },
        { key: "D", text: "710" },
      ],
      answer: "B",
      explanation:
        "Ordered scores are 580, 620, 640, 640, 680, 690, 700, 710, 720, 720, 740, 760. The median is (690 + 700) / 2 = 695.",
    },
    {
      id: "qr-averages-004",
      section: "qr",
      subtype: "qr-averages",
      setId: "qr-mini-mock-scores",
      tags: [
        "data-display",
        "set-based",
        "hard",
        "calculator-heavy",
        "multi-step",
        "time-consuming",
      ],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Table",
      stimulus: ["Four students completed three mini-mocks. Their scaled scores are shown."],
      visual: {
        type: "table",
        title: "Mini-mock scores",
        headers: ["Student", "Mock 1", "Mock 2", "Mock 3"],
        rows: [
          ["Asha", "640", "680", "720"],
          ["Ben", "700", "690", "710"],
          ["Cara", "580", "620", "640"],
          ["Dan", "760", "740", "720"],
        ],
      },
      question:
        "A fifth student scored 650, 710 and 740. What would be the mean of all 15 scores, to the nearest whole number?",
      options: [
        { key: "A", text: "683" },
        { key: "B", text: "687" },
        { key: "C", text: "690" },
        { key: "D", text: "693" },
      ],
      answer: "B",
      explanation:
        "The original 12 scores total 8,200. The fifth student's scores total 2,100. Overall mean = 10,300 / 15 = 686.7, which rounds to 687.",
    },
    {
      id: "qr-geometry-001",
      section: "qr",
      subtype: "qr-units-geometry",
      setId: "qr-community-pool",
      tags: ["text-stem", "set-based", "easy", "multi-step"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stem",
      stimulus: [
        "A cuboidal community swimming pool has a width of 25 m, a length of 50 m and a depth of 3 m.",
        "The pool regulations state that the pool can hold 1.5 people per square metre of floor area.",
      ],
      question:
        "If 80% of the total cuboidal volume can be filled with water, what volume of water can the pool hold?",
      options: [
        { key: "A", text: "2,750 m3" },
        { key: "B", text: "3,000 m3" },
        { key: "C", text: "3,250 m3" },
        { key: "D", text: "3,750 m3" },
      ],
      answer: "B",
      explanation:
        "The cuboidal volume is 25 x 50 x 3 = 3,750 m3. 80% of this is 3,000 m3.",
    },
    {
      id: "qr-geometry-002",
      section: "qr",
      subtype: "qr-units-geometry",
      setId: "qr-community-pool",
      tags: ["text-stem", "set-based", "easy", "multi-step"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stem",
      stimulus: [
        "A cuboidal community swimming pool has a width of 25 m, a length of 50 m and a depth of 3 m.",
        "The pool regulations state that the pool can hold 1.5 people per square metre of floor area.",
      ],
      question:
        "On Saturday, the pool had 60% of the maximum number of customers allowed. How many people were in the pool?",
      options: [
        { key: "A", text: "985 people" },
        { key: "B", text: "1,065 people" },
        { key: "C", text: "1,125 people" },
        { key: "D", text: "1,250 people" },
      ],
      answer: "C",
      explanation:
        "The floor area is 25 x 50 = 1,250 m2. Maximum people = 1,250 x 1.5 = 1,875. 60% of 1,875 is 1,125.",
    },
    {
      id: "qr-geometry-003",
      section: "qr",
      subtype: "qr-units-geometry",
      setId: "qr-community-pool",
      tags: ["text-stem", "set-based", "medium", "calculator-heavy", "multi-step"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stem",
      stimulus: [
        "A cuboidal community swimming pool has a width of 25 m, a length of 50 m and a depth of 3 m.",
        "The pool regulations state that the pool can hold 1.5 people per square metre of floor area.",
      ],
      question:
        "During swimming lessons, the pool has 40% of the maximum number of people allowed. The ratio of children to adults is 5:1. How many adults are in the pool?",
      options: [
        { key: "A", text: "85 adults" },
        { key: "B", text: "97 adults" },
        { key: "C", text: "125 adults" },
        { key: "D", text: "180 adults" },
      ],
      answer: "C",
      explanation:
        "Maximum people = 1,875. 40% of this is 750. In a 5:1 child-adult ratio, adults make up 1/6, so 750 / 6 = 125 adults.",
    },
    {
      id: "qr-geometry-004",
      section: "qr",
      subtype: "qr-units-geometry",
      setId: "qr-community-pool",
      tags: [
        "text-stem",
        "set-based",
        "hard",
        "calculator-heavy",
        "multi-step",
        "time-consuming",
      ],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stem",
      stimulus: [
        "A cuboidal community swimming pool has a width of 25 m, a length of 50 m and a depth of 3 m.",
        "The pool regulations state that the pool can hold 1.5 people per square metre of floor area.",
      ],
      question:
        "A shallow teaching pool is built with length and width each equal to 50% of the main pool. Its total volume is 1/12 of the main pool. What is the depth of the shallow pool?",
      options: [
        { key: "A", text: "0.8 m" },
        { key: "B", text: "1.0 m" },
        { key: "C", text: "1.2 m" },
        { key: "D", text: "1.5 m" },
      ],
      answer: "B",
      explanation:
        "Main volume is 3,750 m3, so the shallow pool volume is 312.5 m3. Its length is 25 m and width is 12.5 m, giving floor area 312.5 m2. Depth = 312.5 / 312.5 = 1 m.",
    },
    {
      id: "qr-estimation-001",
      section: "qr",
      subtype: "qr-estimation",
      setId: "qr-appointment-estimates",
      tags: ["text-stem", "set-based", "easy", "quick"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stem",
      stimulus: [
        "A walk-in clinic recorded 1,984 appointments in April, 2,116 in May and 1,907 in June.",
      ],
      question:
        "Using quick estimation, approximately how many appointments were recorded across the three months?",
      options: [
        { key: "A", text: "5,700" },
        { key: "B", text: "6,000" },
        { key: "C", text: "6,300" },
        { key: "D", text: "6,600" },
      ],
      answer: "B",
      explanation:
        "Round the figures to about 2,000, 2,100 and 1,900. The estimated total is 6,000.",
    },
    {
      id: "qr-estimation-002",
      section: "qr",
      subtype: "qr-estimation",
      setId: "qr-appointment-estimates",
      tags: ["text-stem", "set-based", "easy", "quick"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stem",
      stimulus: ["A practice platform logged 14,870 questions completed over a 30-day month."],
      question:
        "Which is the best estimate for the average number of questions completed per day?",
      options: [
        { key: "A", text: "400" },
        { key: "B", text: "500" },
        { key: "C", text: "600" },
        { key: "D", text: "700" },
      ],
      answer: "B",
      explanation:
        "14,870 is close to 15,000. 15,000 / 30 = 500 questions per day.",
    },
    {
      id: "qr-estimation-003",
      section: "qr",
      subtype: "qr-estimation",
      setId: "qr-appointment-estimates",
      tags: ["text-stem", "set-based", "medium", "multi-step"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stem",
      stimulus: [
        "A hospital had 6,020 outpatient visits last month. About 49.8% required a follow-up message.",
      ],
      question:
        "Which is the best estimate for the number of follow-up messages required?",
      options: [
        { key: "A", text: "2,400" },
        { key: "B", text: "3,000" },
        { key: "C", text: "3,600" },
        { key: "D", text: "4,200" },
      ],
      answer: "B",
      explanation:
        "49.8% is approximately 50%, and 6,020 is approximately 6,000. Half of 6,000 is 3,000.",
    },
    {
      id: "qr-estimation-004",
      section: "qr",
      subtype: "qr-estimation",
      setId: "qr-appointment-estimates",
      tags: ["text-stem", "set-based", "hard", "multi-step", "time-consuming"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stem",
      stimulus: [
        "A clinic expects about 6,000 appointments next month. It predicts a 12% increase in bookings, then expects 5% of booked patients not to attend.",
      ],
      question:
        "Which is the best estimate for the number of patients who will attend?",
      options: [
        { key: "A", text: "5,700" },
        { key: "B", text: "6,100" },
        { key: "C", text: "6,400" },
        { key: "D", text: "6,900" },
      ],
      answer: "C",
      explanation:
        "6,000 increased by 12% is 6,720. If 5% do not attend, about 95% attend: 6,720 x 0.95 = 6,384, closest to 6,400.",
    },
    {
      id: "qr-calculator-strategy-001",
      section: "qr",
      subtype: "qr-calculator-strategy",
      setId: "qr-efficient-working",
      tags: ["data-display", "set-based", "hard", "multi-step", "calculator-heavy"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Data",
      stimulus: [
        "The table shows the prices and places sold for weekday and weekend study workshops at four centres.",
      ],
      visual: {
        type: "table",
        title: "Study workshop sales",
        headers: [
          "Centre",
          "Weekday price",
          "Weekday places",
          "Weekend price",
          "Weekend places",
        ],
        rows: [
          ["Riverside", "GBP 6.40", "28,450", "GBP 9.75", "41,220"],
          ["Meadow", "GBP 5.85", "116,300", "GBP 8.40", "148,750"],
          ["Hillview", "GBP 7.20", "33,180", "GBP 9.10", "38,600"],
          ["Brook", "GBP 6.95", "52,040", "GBP 8.75", "47,900"],
        ],
      },
      question:
        "At Riverside and Meadow combined, how much more revenue was made from weekend places than weekday places?",
      options: [
        { key: "A", text: "GBP 569,145.00" },
        { key: "B", text: "GBP 788,960.00" },
        { key: "C", text: "GBP 970,040.00" },
        { key: "D", text: "GBP 1,651,395.00" },
      ],
      answer: "B",
      explanation:
        "Weekend revenue at Riverside and Meadow is GBP 1,651,395.00. Weekday revenue is GBP 862,435.00. The difference is GBP 788,960.00.",
    },
    {
      id: "qr-calculator-strategy-002",
      section: "qr",
      subtype: "qr-calculator-strategy",
      setId: "qr-efficient-working",
      tags: ["text-stem", "set-based", "easy", "quick"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stem",
      stimulus: ["A student needs to calculate 48% of 625 without writing out a long multiplication."],
      question: "Which method is the most efficient?",
      options: [
        { key: "A", text: "Find 50% of 625, then subtract 2% of 625" },
        { key: "B", text: "Find 40% of 625, then divide by 8" },
        { key: "C", text: "Find 60% of 625, then add 12% of 625" },
        { key: "D", text: "Divide 625 by 48" },
      ],
      answer: "A",
      explanation:
        "48% = 50% - 2%. Half of 625 is quick to find, and 2% is also simple.",
    },
    {
      id: "qr-calculator-strategy-003",
      section: "qr",
      subtype: "qr-calculator-strategy",
      setId: "qr-efficient-working",
      tags: ["text-stem", "set-based", "medium", "multi-step"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stem",
      stimulus: ["A student needs to calculate 17.5% of 840 efficiently."],
      question: "Which expression is the most efficient equivalent calculation?",
      options: [
        { key: "A", text: "10% of 840 + 5% of 840 + 2.5% of 840" },
        { key: "B", text: "20% of 840 + 5% of 840" },
        { key: "C", text: "25% of 840 - 10% of 840" },
        { key: "D", text: "840 / 17.5" },
      ],
      answer: "A",
      explanation:
        "17.5% can be split into 10% + 5% + 2.5%, all of which are quick to calculate from 840.",
    },
    {
      id: "qr-calculator-strategy-004",
      section: "qr",
      subtype: "qr-calculator-strategy",
      setId: "qr-efficient-working",
      tags: ["text-stem", "set-based", "hard", "multi-step", "calculator-heavy"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stem",
      stimulus: [
        "A value rises by 20%, then falls by 15%, then rises by 10%. A student wants to replace this with one multiplier.",
      ],
      question: "Which multiplier gives the final value from the original value?",
      options: [
        { key: "A", text: "0.952" },
        { key: "B", text: "1.020" },
        { key: "C", text: "1.122" },
        { key: "D", text: "1.450" },
      ],
      answer: "C",
      explanation:
        "The combined multiplier is 1.20 x 0.85 x 1.10 = 1.122.",
    },
    ...CURATED_QR_QUESTIONS,
  ] as UCATQuestion[]).map(ensureQrFiveOptions),
  sjt: [
    ...CURATED_SJT_QUESTIONS,
  ]
    .map(normaliseSjtDragDropQuestion)
    .filter((question): question is UCATQuestion => question !== null)
    .filter(isSupportedSjtQuestion),
};

const DRAFT_9200_UCAT_QUESTION_BANK: Record<UCATSection, UCATQuestion[]> = {
  vr: [],
  dm: [],
  qr: [],
  sjt: [],
};

export const UCAT_QUESTION_QUALITY_REVIEW = reviewUCATQuestionBank({
  auditedBank: LEGACY_UCAT_QUESTION_BANK,
  draftBank: DRAFT_9200_UCAT_QUESTION_BANK,
});

export const UCAT_QUESTION_BANK: Record<UCATSection, UCATQuestion[]> =
  UCAT_QUESTION_QUALITY_REVIEW.bank;

export function isUCATSection(value: string): value is UCATSection {
  return UCAT_SECTIONS.some((section) => section.slug === value);
}

export function getUCATSectionMeta(section: UCATSection) {
  return UCAT_SECTIONS.find((item) => item.slug === section) ?? UCAT_SECTIONS[0];
}

export function getUCATSubtypeMeta(subtype: UCATSubtypeId) {
  return (
    Object.values(UCAT_SUBTYPES)
      .flat()
      .find((item) => item.id === subtype) ?? UCAT_SUBTYPES.vr[0]
  );
}

export function getUCATSjtIssueLabel(issueTag: UCATSjtIssueTag) {
  return UCAT_SJT_ISSUE_LABELS[issueTag] ?? issueTag;
}

export function isUCATDragOrderQuestion(
  question: UCATQuestion
): question is UCATDragOrderQuestion {
  return question.questionType === "drag-order";
}

export function isUCATDragCategoryQuestion(
  question: UCATQuestion
): question is UCATDragCategoryQuestion {
  return question.questionType === "drag-category";
}

export function isUCATYesNoQuestion(
  question: UCATQuestion
): question is UCATYesNoQuestion {
  return question.questionType === "yes-no";
}

export function isUCATMostLeastQuestion(
  question: UCATQuestion
): question is UCATMostLeastQuestion {
  return question.questionType === "most-least";
}
