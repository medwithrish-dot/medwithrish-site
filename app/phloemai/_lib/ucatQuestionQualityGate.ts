import type {
  UCATOptionKey,
  UCATQuestion,
  UCATSection,
  UCATSubtypeId,
  UCATYesNoValue,
} from "./ucatQuestionBank";

type UCATQuestionBank = Record<UCATSection, UCATQuestion[]>;

type ReviewInput = {
  auditedBank: UCATQuestionBank;
  draftBank: UCATQuestionBank;
};

type RejectionReason =
  | "duplicate-id"
  | "duplicate-content"
  | "draft-share-limit"
  | "draft-subtype-limit"
  | "draft-template-limit"
  | "empty-core-field"
  | "invalid-answer"
  | "invalid-drag-category"
  | "invalid-options"
  | "invalid-section"
  | "invalid-sjt-scale"
  | "invalid-tfc-scale"
  | "invalid-yes-no"
  | "weak-explanation";

export type UCATQuestionQualityReview = {
  bank: UCATQuestionBank;
  summary: Record<
    UCATSection,
    {
      accepted: number;
      acceptedAudited: number;
      acceptedDrafts: number;
      rejected: number;
      rejectedByReason: Partial<Record<RejectionReason, number>>;
      subtypeCounts: Partial<Record<UCATSubtypeId, number>>;
    }
  >;
};

const SECTIONS: UCATSection[] = ["vr", "dm", "qr", "sjt"];
const OPTION_KEYS: UCATOptionKey[] = ["A", "B", "C", "D", "E"];

const TFC_SCALE = ["True", "False", "Can't tell"];
const APPROPRIATENESS_SCALE = [
  "A very appropriate thing to do",
  "Appropriate, but not ideal",
  "Inappropriate, but not awful",
  "A very inappropriate thing to do",
];
const IMPORTANCE_SCALE = [
  "Very important",
  "Important",
  "Of minor importance",
  "Not important at all",
];

const DRAFT_SUBTYPE_LIMITS: Partial<Record<UCATSubtypeId, number>> = {
  "dm-logic": 20,
  "dm-venn-sets": 96,
  "dm-syllogisms": 48,
  "dm-arguments": 36,
  "dm-yes-no": 48,
  "dm-probability-data": 36,
  "sjt-appropriateness": 80,
  "sjt-importance": 80,
  "sjt-drag-drop": 60,
};

const DEFAULT_DRAFT_TEMPLATE_LIMIT = 3;

function createEmptySummary(): UCATQuestionQualityReview["summary"][UCATSection] {
  return {
    accepted: 0,
    acceptedAudited: 0,
    acceptedDrafts: 0,
    rejected: 0,
    rejectedByReason: {},
    subtypeCounts: {},
  };
}

function noteRejection(
  summary: UCATQuestionQualityReview["summary"][UCATSection],
  reason: RejectionReason
) {
  summary.rejected += 1;
  summary.rejectedByReason[reason] =
    (summary.rejectedByReason[reason] ?? 0) + 1;
}

function isSingleQuestion(question: UCATQuestion) {
  return !question.questionType || question.questionType === "single";
}

function normaliseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normaliseForDuplicate(value: string) {
  return normaliseWhitespace(value)
    .toLowerCase()
    .replace(/[^\w\s%/.-]/g, "")
    .replace(/\s+/g, " ");
}

function normaliseForTemplate(value: string) {
  return normaliseForDuplicate(value)
    .replace(/\b\d+(?:\.\d+)?%?\b/g, "#")
    .replace(/\bgbp\s*#(?:\.\d+)?\b/g, "gbp #")
    .replace(/\b[a-e]\b/g, "letter");
}

function optionTexts(question: UCATQuestion) {
  if (isSingleQuestion(question) && "options" in question) {
    return question.options.map((option) => option.text);
  }

  if (question.questionType === "yes-no") {
    return question.yesNoStatements.map((statement) => statement.text);
  }

  if (question.questionType === "drag-category") {
    return question.categoryItems.map((item) => item.text);
  }

  if (question.questionType === "drag-order") {
    return question.dragItems.map((item) => item.text);
  }

  if (question.questionType === "most-least") {
    return question.actionItems.map((item) => item.text);
  }

  return [];
}

function questionBody(question: UCATQuestion) {
  const visualText = question.visual
    ? JSON.stringify(question.visual)
    : "";

  return [
    question.section,
    question.subtype,
    question.stimulus.join(" "),
    visualText,
    question.question,
    ...optionTexts(question),
  ].join(" ");
}

function getDuplicateFingerprint(question: UCATQuestion) {
  return `${question.section}:${question.subtype}:${normaliseForDuplicate(
    questionBody(question)
  )}`;
}

function getVrTemplate(question: UCATQuestion) {
  const text = question.question.toLowerCase();

  if (text.startsWith("the pilot was intended")) return "tfc-purpose";
  if (text.startsWith("the pilot was funded")) return "tfc-funding";
  if (text.includes("definitely run the pilot")) return "tfc-certainty";
  if (text.startsWith("why was")) return "detail-reason";
  if (text.startsWith("which statement is best supported")) {
    return "inference-balanced";
  }
  if (text.startsWith("all of the following")) return "negative-except";
  if (text.includes("attitude towards the pilot")) return "author-cautious";
  if (text.startsWith("which option best summarises")) {
    return "summary-qualified";
  }

  return normaliseForTemplate(question.question);
}

function getQrTemplate(question: UCATQuestion) {
  const match = question.id.match(/^quality-qr-(\d+)-(\d+)$/);
  if (!match) return normaliseForTemplate(question.question);

  const setIndex = Number(match[1]) - 1;
  const itemIndex = Number(match[2]);
  const families = ["table", "grouped-bar", "line", "rate", "finance"];
  return `${families[setIndex % families.length]}-${itemIndex}`;
}

function getDraftTemplateKey(question: UCATQuestion) {
  if (question.id.startsWith("quality-vr-")) {
    return `quality:${question.section}:${question.subtype}:${getVrTemplate(
      question
    )}`;
  }

  if (question.id.startsWith("quality-qr-")) {
    return `quality:${question.section}:${question.subtype}:${getQrTemplate(
      question
    )}`;
  }

  if (question.id.startsWith("quality-dm-logic-")) {
    return "quality:dm:logic:fixed-four-person-order";
  }

  if (question.id.startsWith("quality-dm-venn-")) {
    return `quality:dm:venn:${normaliseForTemplate(question.question)}`;
  }

  if (question.id.startsWith("quality-dm-syllogism-")) {
    return "quality:dm:syllogism:all-some-no";
  }

  if (question.id.startsWith("quality-dm-argument-")) {
    return `quality:dm:argument:${normaliseForTemplate(
      question.stimulus.join(" ")
    )}`;
  }

  if (question.id.startsWith("quality-dm-yes-no-")) {
    return "quality:dm:yes-no:three-count-table";
  }

  if (question.id.startsWith("quality-dm-probability-")) {
    return `quality:dm:probability:${normaliseForTemplate(question.question)}`;
  }

  if (question.id.startsWith("quality-sjt-")) {
    const answer =
      isSingleQuestion(question) && "answer" in question
        ? question.answer
        : "drag";
    const issueKey = [...(question.issueTags ?? [])].sort().join("-");
    return `quality:sjt:${question.subtype}:${issueKey}:${answer}`;
  }

  return `${question.section}:${question.subtype}:${normaliseForTemplate(
    questionBody(question)
  )}`;
}

function draftTemplateLimit(question: UCATQuestion) {
  if (question.id.startsWith("quality-dm-venn-")) return 24;
  if (question.id.startsWith("quality-dm-logic-")) return 20;
  if (question.id.startsWith("quality-dm-syllogism-")) return 48;
  if (question.id.startsWith("quality-dm-yes-no-")) return 48;
  if (question.id.startsWith("quality-dm-probability-")) return 18;
  if (question.id.startsWith("quality-qr-")) return 4;
  if (question.id.startsWith("quality-sjt-")) return 2;
  return DEFAULT_DRAFT_TEMPLATE_LIMIT;
}

function hasUniqueStrings(values: string[]) {
  return new Set(values.map(normaliseForDuplicate)).size === values.length;
}

function validateSingleQuestion(question: UCATQuestion): RejectionReason | null {
  if (!isSingleQuestion(question) || !("options" in question)) {
    return null;
  }

  const optionKeys = question.options.map((option) => option.key);
  const optionTexts = question.options.map((option) => option.text);

  if (
    question.options.length < 3 ||
    question.options.length > 5 ||
    !optionKeys.every((key) => OPTION_KEYS.includes(key)) ||
    !optionKeys.includes(question.answer) ||
    !hasUniqueStrings(optionTexts)
  ) {
    return "invalid-options";
  }

  if (
    question.subtype === "vr-tfc" &&
    (question.options.length !== TFC_SCALE.length ||
      question.options.some((option, index) => option.text !== TFC_SCALE[index]))
  ) {
    return "invalid-tfc-scale";
  }

  if (
    question.subtype === "sjt-appropriateness" &&
    question.options.some(
      (option, index) => option.text !== APPROPRIATENESS_SCALE[index]
    )
  ) {
    return "invalid-sjt-scale";
  }

  if (
    question.subtype === "sjt-importance" &&
    question.options.some(
      (option, index) => option.text !== IMPORTANCE_SCALE[index]
    )
  ) {
    return "invalid-sjt-scale";
  }

  return null;
}

function validateYesNoQuestion(question: UCATQuestion): RejectionReason | null {
  if (question.questionType !== "yes-no") return null;

  const answers: UCATYesNoValue[] = ["Yes", "No"];
  const ids = question.yesNoStatements.map((statement) => statement.id);
  const texts = question.yesNoStatements.map((statement) => statement.text);

  if (
    question.yesNoStatements.length < 4 ||
    !hasUniqueStrings(ids) ||
    !hasUniqueStrings(texts) ||
    !question.yesNoStatements.every((statement) =>
      answers.includes(statement.answer)
    )
  ) {
    return "invalid-yes-no";
  }

  return null;
}

function validateDragCategoryQuestion(
  question: UCATQuestion
): RejectionReason | null {
  if (question.questionType !== "drag-category") return null;

  const categoryIds = question.categories.map((category) => category.id);
  const itemIds = question.categoryItems.map((item) => item.id);
  const itemTexts = question.categoryItems.map((item) => item.text);

  if (
    question.categories.length < 2 ||
    question.categoryItems.length < 3 ||
    !hasUniqueStrings(categoryIds) ||
    !hasUniqueStrings(itemIds) ||
    !hasUniqueStrings(itemTexts)
  ) {
    return "invalid-drag-category";
  }

  const categorySet = new Set(categoryIds);
  if (
    !question.categoryItems.every((item) =>
      categorySet.has(item.answerCategory)
    )
  ) {
    return "invalid-drag-category";
  }

  return null;
}

function validateStructure(
  question: UCATQuestion,
  section: UCATSection
): RejectionReason | null {
  if (question.section !== section) return "invalid-section";

  if (
    !normaliseWhitespace(question.id) ||
    !normaliseWhitespace(question.title) ||
    !normaliseWhitespace(question.question) ||
    question.stimulus.length === 0 ||
    question.stimulus.some((part) => !normaliseWhitespace(part))
  ) {
    return "empty-core-field";
  }

  if (normaliseWhitespace(question.explanation).length < 24) {
    return "weak-explanation";
  }

  return (
    validateSingleQuestion(question) ??
    validateYesNoQuestion(question) ??
    validateDragCategoryQuestion(question)
  );
}

function addAcceptedQuestion(
  accepted: UCATQuestion[],
  summary: UCATQuestionQualityReview["summary"][UCATSection],
  question: UCATQuestion,
  source: "audited" | "draft"
) {
  accepted.push(question);
  summary.accepted += 1;
  if (source === "audited") {
    summary.acceptedAudited += 1;
  } else {
    summary.acceptedDrafts += 1;
  }
  summary.subtypeCounts[question.subtype] =
    (summary.subtypeCounts[question.subtype] ?? 0) + 1;
}

export function reviewUCATQuestionBank({
  auditedBank,
  draftBank,
}: ReviewInput): UCATQuestionQualityReview {
  const acceptedIds = new Set<string>();
  const acceptedFingerprints = new Set<string>();
  const draftTemplateCounts = new Map<string, number>();
  const draftSubtypeCounts = new Map<UCATSubtypeId, number>();
  const bank: UCATQuestionBank = {
    vr: [],
    dm: [],
    qr: [],
    sjt: [],
  };
  const summary: UCATQuestionQualityReview["summary"] = {
    vr: createEmptySummary(),
    dm: createEmptySummary(),
    qr: createEmptySummary(),
    sjt: createEmptySummary(),
  };

  for (const section of SECTIONS) {
    const sectionSummary = summary[section];

    for (const question of auditedBank[section]) {
      const structuralRejection = validateStructure(question, section);
      const fingerprint = getDuplicateFingerprint(question);

      if (structuralRejection) {
        noteRejection(sectionSummary, structuralRejection);
      } else if (acceptedIds.has(question.id)) {
        noteRejection(sectionSummary, "duplicate-id");
      } else if (acceptedFingerprints.has(fingerprint)) {
        noteRejection(sectionSummary, "duplicate-content");
      } else {
        acceptedIds.add(question.id);
        acceptedFingerprints.add(fingerprint);
        addAcceptedQuestion(bank[section], sectionSummary, question, "audited");
      }
    }

    const maxDraftsForSection = bank[section].length;

    for (const question of draftBank[section]) {
      const structuralRejection = validateStructure(question, section);
      const fingerprint = getDuplicateFingerprint(question);
      const templateKey = getDraftTemplateKey(question);
      const templateCount = draftTemplateCounts.get(templateKey) ?? 0;
      const subtypeCount = draftSubtypeCounts.get(question.subtype) ?? 0;
      const subtypeLimit =
        DRAFT_SUBTYPE_LIMITS[question.subtype] ?? Number.POSITIVE_INFINITY;

      if (structuralRejection) {
        noteRejection(sectionSummary, structuralRejection);
      } else if (sectionSummary.acceptedDrafts >= maxDraftsForSection) {
        noteRejection(sectionSummary, "draft-share-limit");
      } else if (subtypeCount >= subtypeLimit) {
        noteRejection(sectionSummary, "draft-subtype-limit");
      } else if (templateCount >= draftTemplateLimit(question)) {
        noteRejection(sectionSummary, "draft-template-limit");
      } else if (acceptedIds.has(question.id)) {
        noteRejection(sectionSummary, "duplicate-id");
      } else if (acceptedFingerprints.has(fingerprint)) {
        noteRejection(sectionSummary, "duplicate-content");
      } else {
        acceptedIds.add(question.id);
        acceptedFingerprints.add(fingerprint);
        draftTemplateCounts.set(templateKey, templateCount + 1);
        draftSubtypeCounts.set(question.subtype, subtypeCount + 1);
        addAcceptedQuestion(bank[section], sectionSummary, question, "draft");
      }
    }
  }

  return { bank, summary };
}
