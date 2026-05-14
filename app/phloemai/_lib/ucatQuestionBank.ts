import { ORIGINAL_DM_QUESTIONS } from "./ucatDmQuestions";
import { ORIGINAL_QR_QUESTIONS } from "./ucatQrQuestions";
import {
  GENERATED_DM_QUESTIONS,
  GENERATED_QR_QUESTIONS,
  GENERATED_SJT_QUESTIONS,
  GENERATED_VR_QUESTIONS,
} from "./generatedUcatQuestions";
import {
  ROUND_TWO_DM_QUESTIONS,
  ROUND_TWO_QR_QUESTIONS,
  ROUND_TWO_SJT_QUESTIONS,
  ROUND_TWO_VR_QUESTIONS,
} from "./generatedUcatQuestionsRound2";
import {
  ROUND_THREE_DM_QUESTIONS,
  ROUND_THREE_QR_QUESTIONS,
  ROUND_THREE_SJT_QUESTIONS,
  ROUND_THREE_VR_QUESTIONS,
} from "./generatedUcatQuestionsRound3";
import {
  ROUND_FOUR_DM_QUESTIONS,
  ROUND_FOUR_QR_QUESTIONS,
  ROUND_FOUR_SJT_QUESTIONS,
  ROUND_FOUR_VR_QUESTIONS,
} from "./generatedUcatQuestionsRound4";
import { SJT_QUESTIONS } from "./ucatSjtQuestions";

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
  | "qr-graphs"
  | "qr-percentages"
  | "qr-rates-ratios"
  | "qr-averages"
  | "qr-units-geometry"
  | "qr-estimation"
  | "qr-calculator-strategy"
  | "sjt-appropriateness"
  | "sjt-importance"
  | "sjt-drag-drop"
  | "sjt-communication"
  | "sjt-integrity"
  | "sjt-ordering";

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
  options: Array<{ key: UCATOptionKey; text: string }>;
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
      description: "Sort actions or considerations into the correct side.",
    },
    {
      id: "sjt-communication",
      label: "Communication and teamwork",
      description: "Respond respectfully to patients, peers and colleagues.",
    },
    {
      id: "sjt-integrity",
      label: "Integrity and confidentiality",
      description: "Protect trust, fairness and sensitive information.",
    },
    {
      id: "sjt-ordering",
      label: "Rank / order actions",
      description: "Drag actions into the best professional order.",
    },
  ],
};

const ORIGINAL_VR_QUESTIONS: UCATQuestion[] = [
  {
    id: "vr-bank-tfc-001",
    section: "vr",
    subtype: "vr-tfc",
    setId: "vr-caption-screens",
    tags: ["true-false-cant-tell", "easy", "quick", "text-stem"],
    title: "Verbal Reasoning Practice",
    leftTitle: "Passage",
    stimulus: [
      "Harborview Theatre piloted caption screens for Saturday matinee performances. The screens displayed dialogue and sound cues beside the stage. The aim was to improve access for deaf and hard-of-hearing visitors without changing the evening programme.",
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
      "Harborview Theatre piloted caption screens for Saturday matinee performances. The screens displayed dialogue and sound cues beside the stage. The aim was to improve access for deaf and hard-of-hearing visitors without changing the evening programme.",
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
      "Harborview Theatre piloted caption screens for Saturday matinee performances. The screens displayed dialogue and sound cues beside the stage. The aim was to improve access for deaf and hard-of-hearing visitors without changing the evening programme.",
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

export const UCAT_QUESTION_BANK: Record<UCATSection, UCATQuestion[]> = {
  vr: [
    ...ORIGINAL_VR_QUESTIONS,
    ...GENERATED_VR_QUESTIONS,
    ...ROUND_TWO_VR_QUESTIONS,
    ...ROUND_THREE_VR_QUESTIONS,
    ...ROUND_FOUR_VR_QUESTIONS,
  ],
  dm: [
    ...ORIGINAL_DM_QUESTIONS,
    ...GENERATED_DM_QUESTIONS,
    ...ROUND_TWO_DM_QUESTIONS,
    ...ROUND_THREE_DM_QUESTIONS,
    ...ROUND_FOUR_DM_QUESTIONS,
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
          { id: "clinic", label: "Clinic drills", shape: "circle", x: 90, y: 110, width: 240, height: 220 },
          { id: "essay", label: "Essay plans", shape: "rectangle", x: 230, y: 120, width: 260, height: 190 },
          { id: "interview", label: "Interview role-play", shape: "triangle", x: 240, y: 50, width: 290, height: 300 },
        ],
        regionLabels: [
          { id: "clinic-only", text: "18", x: 150, y: 215 },
          { id: "essay-only", text: "14", x: 440, y: 220 },
          { id: "interview-only", text: "9", x: 385, y: 105 },
          { id: "clinic-essay", text: "11", x: 255, y: 220 },
          { id: "clinic-interview", text: "7", x: 290, y: 145 },
          { id: "essay-interview", text: "10", x: 405, y: 160 },
          { id: "all-three", text: "6", x: 330, y: 195 },
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
          { id: "long", label: "Long recovery", shape: "pentagon", x: 40, y: 60, width: 230, height: 230, rotation: -6 },
          { id: "keyhole", label: "Keyhole", shape: "circle", x: 110, y: 140, width: 230, height: 210 },
          { id: "invasive", label: "Invasive surgery", shape: "rectangle", x: 180, y: 110, width: 330, height: 190 },
          { id: "fasting", label: "Fasting required", shape: "triangle", x: 300, y: 60, width: 300, height: 300 },
        ],
        regionLabels: [
          { id: "long-only", text: "5", x: 130, y: 140 },
          { id: "long-keyhole-invasive", text: "4", x: 220, y: 205 },
          { id: "keyhole-only", text: "7", x: 175, y: 285 },
          { id: "invasive-only", text: "8", x: 455, y: 215 },
          { id: "fasting-only", text: "6", x: 500, y: 110 },
          { id: "fasting-invasive", text: "9", x: 415, y: 165 },
          { id: "keyhole-invasive-fasting", text: "3", x: 320, y: 205 },
          { id: "long-fasting", text: "2", x: 255, y: 130 },
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
          { id: "volunteering", label: "Volunteering", shape: "hexagon", x: 80, y: 80, width: 270, height: 230 },
          { id: "research", label: "Research", shape: "diamond", x: 300, y: 70, width: 230, height: 240 },
          { id: "leadership", label: "Leadership", shape: "circle", x: 190, y: 150, width: 260, height: 220 },
          { id: "interview-course", label: "Interview course", shape: "rectangle", x: 230, y: 210, width: 300, height: 120 },
        ],
        regionLabels: [
          { id: "vol-only", text: "21", x: 145, y: 170 },
          { id: "research-only", text: "12", x: 455, y: 155 },
          { id: "lead-only", text: "17", x: 295, y: 315 },
          { id: "course-only", text: "8", x: 485, y: 285 },
          { id: "vol-lead", text: "14", x: 250, y: 215 },
          { id: "research-lead", text: "9", x: 385, y: 215 },
          { id: "vol-research", text: "5", x: 315, y: 135 },
          { id: "lead-course", text: "6", x: 350, y: 270 },
          { id: "all-three", text: "4", x: 325, y: 205 },
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
  qr: [
    ...ORIGINAL_QR_QUESTIONS,
    ...GENERATED_QR_QUESTIONS,
    ...ROUND_TWO_QR_QUESTIONS,
    ...ROUND_THREE_QR_QUESTIONS,
    ...ROUND_FOUR_QR_QUESTIONS,
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
      tags: ["text-stem", "set-based", "easy", "quick"],
      title: "Quantitative Reasoning Practice",
      leftTitle: "Stem",
      stimulus: [
        "A calculation requires finding 37.5% of 864 and then adding 12.5% of 864.",
      ],
      question: "Which single calculation gives the same result most efficiently?",
      options: [
        { key: "A", text: "0.25 x 864" },
        { key: "B", text: "0.5 x 864" },
        { key: "C", text: "0.625 x 864" },
        { key: "D", text: "1.5 x 864" },
      ],
      answer: "B",
      explanation:
        "37.5% + 12.5% = 50%, so the quickest equivalent calculation is 0.5 x 864.",
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
  ],
  sjt: [
    ...SJT_QUESTIONS,
    ...GENERATED_SJT_QUESTIONS,
    ...ROUND_TWO_SJT_QUESTIONS,
    ...ROUND_THREE_SJT_QUESTIONS,
    ...ROUND_FOUR_SJT_QUESTIONS,
  ],
};

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
