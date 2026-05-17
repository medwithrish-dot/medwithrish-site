"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  createClient as createSupabaseClient,
  hasSupabaseConfig,
} from "@/utils/supabase/client";
import { ExpandableAiFeedback } from "./ExpandableAiFeedback";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Calculator,
  CheckCircle,
  Clock3,
  Eye,
  Flag,
  GripVertical,
  HelpCircle,
  Info,
  ListChecks,
  LockKeyhole,
  MousePointer2,
  Play,
  Sparkles,
  Target,
  Timer,
  XCircle,
} from "lucide-react";
import {
  CALIB_PHASES,
  useAttentionTracker,
  type TrackingMode,
} from "../_lib/useAttentionTracker";
import {
  getUCATSectionMeta,
  getUCATSjtIssueLabel,
  getUCATSubtypeMeta,
  isUCATSection,
  isUCATDragCategoryQuestion,
  isUCATDragOrderQuestion,
  isUCATMostLeastQuestion,
  isUCATYesNoQuestion,
  UCAT_QUESTION_BANK,
  UCAT_SECTIONS,
  UCAT_SUBTYPES,
  type UCATChartVisual,
  type UCATOptionKey,
  type UCATQuestion,
  type UCATQuestionTag,
  type UCATSection,
  type UCATSingleQuestion,
  type UCATSjtIssueTag,
  type UCATSubtypeId,
  type UCATYesNoValue,
} from "../_lib/ucatQuestionBank";
import {
  SUBTYPE_WEAKNESS_RULES,
  getSubtypeWeaknessSeverity,
  type SubtypeWeaknessRule,
} from "../_lib/ucatWeaknessRules";

type PracticeAnswerMap = Record<string, string>;
type PracticeAnswer = UCATOptionKey | string[] | PracticeAnswerMap;
type SessionLengthMode = "questions" | "minutes";
type PracticePhase =
  | "practice"
  | "review"
  | "diagnostic-complete"
  | "marked"
  | "marked-review";
type PracticeAnswerStatus = "correct" | "partial" | "incorrect" | "unanswered";
type DiagnosticMode =
  | "free-qr"
  | "full"
  | "full-mock"
  | "section-mock"
  | "full-section"
  | "subset";
type MockId = "mock-a" | "mock-b" | "mock-c";
type MockStartScope = "full-mock" | "subtest" | "diagnostic" | "free";
type MockFilter = "all" | "continue" | "attempted" | "unattempted";
type MockScoreMetric = "overall" | UCATSection;
type SectionMockTimingMode = "official" | "short";
type DiagnosticSectionScore = {
  label: string;
  value: string;
  helper: string;
  metadata: {
    rawScore: number;
    maxScore: number;
    accuracy: number;
    scaledScore: number | null;
    sjtBand: number | null;
  };
};
type DiagnosticAiFeedbackState = {
  requested: boolean;
  status: string;
  credits: number;
  message: string | null;
  requesting: boolean;
  text: string | null;
};
type PracticeAnswerScore = {
  points: number;
  maxPoints: number;
  status: PracticeAnswerStatus;
  feedback: string;
};
type QuestionTrackingZone = "stimulus" | "question" | "answers";
type TrackingPayload = Record<string, string | number | boolean | null>;
type TrackingEvent = {
  at: number;
  type: string;
  questionId?: string;
  questionIndex?: number;
  payload?: TrackingPayload;
};
type QuestionTiming = {
  questionId: string;
  visits: number;
  totalMs: number;
  answeredAtMs?: number;
};
type SaveStatus = "idle" | "saving" | "saved" | "skipped" | "error";
type SaveState = {
  status: SaveStatus;
  message: string;
};
type SavedDiagnosticAttempt = {
  summary: PracticeSessionSummary;
  attemptId: string | null;
  aiFeedbackRequestedAt: string | null;
  aiFeedbackStatus: string | null;
  aiFeedbackText: string | null;
  credits: number;
};
type TimingBySubtype = {
  subtype: UCATSubtypeId;
  label: string;
  questions: number;
  answered: number;
  correct: number;
  flagged: number;
  visits: number;
  totalSeconds: number;
  avgSeconds: number;
};
type AnswerPathEntry = {
  answer: string;
  answerText: string;
  correct: boolean;
  source: string;
  atSeconds: number;
};
type CalculatorUsageSummary = {
  opens: number;
  buttonPresses: number;
  keyboardPresses: number;
  digitPresses: number;
  decimalPresses: number;
  backspaces: number;
  operators: number;
  memoryUses: number;
  memoryPlus: number;
  memoryMinus: number;
  memoryRecall: number;
  memoryClear: number;
  pauses: number;
  pauseThresholdSeconds: number;
  avgInputGapMs: number;
  fastestInputGapMs: number;
  buttonAvgGapMs: number;
  keyboardAvgGapMs: number;
};
type ShortcutUsageSummary = {
  total: number;
  answerKeys: number;
  navigation: number;
  calculator: number;
  flag: number;
  labels: string[];
};
type RegionActivitySummary = {
  snapshots: number;
  totalSwitches: number;
  stimulusQuestionFlips: number;
  questionAnswerFlips: number;
  stimulusAnswerFlips: number;
  stimulusRevisits: number;
  questionRevisits: number;
  answerRevisits: number;
  stimulusSeconds: number;
  questionSeconds: number;
  answerSeconds: number;
  trackingRecorded: boolean;
};
type InterfaceUsageSummary = {
  reviewOpens: number;
  navigatorOpens: number;
  explanationToggles: number;
  colourSchemeChanges: number;
  nextClicks: number;
  previousClicks: number;
  flagToggles: number;
  questionJumps: number;
  endBankClicks: number;
};
type PracticeQuestionSummary = {
  questionId: string;
  questionIndex: number;
  section: UCATSection;
  subtype: UCATSubtypeId;
  subtypeLabel: string;
  questionText: string;
  explanation: string;
  answered: boolean;
  correct: boolean;
  partial: boolean;
  scorePoints: number;
  maxScore: number;
  resultStatus: PracticeAnswerStatus;
  questionTags: UCATQuestionTag[];
  issueTags: UCATSjtIssueTag[];
  issueLabels: string[];
  flagged: boolean;
  selectedAnswer: PracticeAnswer | null;
  correctAnswer: PracticeAnswer;
  selectedAnswerText: string;
  correctAnswerText: string;
  firstAnswerText: string;
  answerPath: AnswerPathEntry[];
  answerSelections: number;
  totalSeconds: number;
  visits: number;
  answerSwitches: number;
  changedToCorrect: boolean;
  changedFromCorrect: boolean;
  everCorrect: boolean;
  everWrong: boolean;
  firstAnsweredAtMs: number | null;
  answeredAtMs: number | null;
  calculator: CalculatorUsageSummary;
  shortcuts: ShortcutUsageSummary;
  regionActivity: RegionActivitySummary;
  otherData: InterfaceUsageSummary;
  trackingEventCount: number;
};
type PracticeSessionSummary = {
  section: UCATSection;
  sectionTitle: string;
  mockId?: MockId | null;
  mockScope?: MockStartScope | null;
  mockLabel?: string | null;
  startedAt: string;
  completedAt: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctQuestions: number;
  accuracy: number;
  scorePoints: number;
  maxScore: number;
  totalSeconds: number;
  avgSecondsPerQuestion: number;
  timed: boolean;
  setSeconds: number;
  secondsRemaining: number;
  trackingMode: TrackingMode;
  trackingEventCount: number;
  flaggedQuestions: number;
  answerSwitches: number;
  changedQuestions: number;
  answerEdits: number;
  changedToCorrect: number;
  changedFromCorrect: number;
  timingBySubtype: TimingBySubtype[];
  calculator: CalculatorUsageSummary;
  shortcuts: ShortcutUsageSummary;
  regionActivity: RegionActivitySummary;
  otherData: InterfaceUsageSummary;
  questions: PracticeQuestionSummary[];
};
type SavedPracticeSet = {
  id: string;
  summary: PracticeSessionSummary;
  completedAt: string;
  source: string | null;
};
type CompletedQuestionRow = {
  question_id: string | null;
  section: string | null;
};
type SavedPracticeSessionRow = {
  id: string;
  summary: unknown;
  completed_at: string | null;
  created_at: string | null;
  source: string | null;
};
type MockScoreRecord = {
  value: number;
  display: string;
  completedAt: string;
  accuracy: number;
};
type MockScoreMatrix = Record<
  MockId,
  Partial<Record<UCATSection, MockScoreRecord>>
>;
type MockScoreSessionRow = {
  summary: unknown;
  completed_at: string | null;
  source: string | null;
};

const QUESTION_TARGETS = [5, 10, 15] as const;
const MINUTE_TARGETS = [5, 10, 15] as const;
const FREE_QR_DIAGNOSTIC_QUESTION_COUNT = 14;
const FREE_QR_DIAGNOSTIC_SECONDS = 10 * 60;
const FREE_QR_DIAGNOSTIC_SOURCE = "free_qr_diagnostic";
const FULL_SECTION_DIAGNOSTIC_SOURCE = "full_mock_section_diagnostic";
const SUBSET_DIAGNOSTIC_SOURCE = "subset_mock_diagnostic";
const FULL_MOCK_TARGETS: Record<UCATSection, number> = {
  vr: 44,
  dm: 35,
  qr: 36,
  sjt: 69,
};
const FULL_MOCK_SECTION_SECONDS: Record<UCATSection, number> = {
  vr: 22 * 60,
  dm: 37 * 60,
  qr: 26 * 60,
  sjt: 26 * 60,
};
const FULL_MOCK_SECTION_ORDER: UCATSection[] = ["vr", "dm", "qr", "sjt"];
const SECTION_MOCK_SHORT_SECONDS = 15 * 60;
const DEFAULT_MOCK_ID: MockId = "mock-a";
const MOCK_LIBRARY: Array<{
  id: MockId;
  label: string;
  title: string;
  description: string;
  focus: string;
  badge: string;
}> = [
  {
    id: "mock-a",
    label: "Mock 1",
    title: "Baseline set",
    description:
      "A balanced first run for setting a starting point across the four UCAT sections.",
    focus: "Mixed difficulty",
    badge: "First pass",
  },
  {
    id: "mock-b",
    label: "Mock 2",
    title: "Timing set",
    description:
      "A fresh sitting for checking whether timing and accuracy are moving together.",
    focus: "Timing pressure",
    badge: "Next pass",
  },
  {
    id: "mock-c",
    label: "Mock 3",
    title: "Review set",
    description:
      "A later check-in for comparing pace, accuracy and flagging decisions.",
    focus: "Final review",
    badge: "Review",
  },
];
const QUESTION_TRACKING_ZONES: QuestionTrackingZone[] = [
  "stimulus",
  "question",
  "answers",
];

function nowMs() {
  return Date.now();
}

function scrollToQuestionTop() {
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  });
}

function clampQuestionCount(value: number, available: number) {
  if (available <= 0) return 0;
  return Math.max(1, Math.min(available, value));
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatReadableDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (seconds === 0) return `${minutes} minutes`;
  return `${minutes} minutes ${seconds} seconds`;
}

function normaliseDiagnosticMode(value?: string | null): DiagnosticMode | null {
  if (
    value === "free-qr" ||
    value === "full" ||
    value === "full-mock" ||
    value === "section-mock" ||
    value === "full-section" ||
    value === "subset"
  ) {
    return value;
  }

  return null;
}

function normaliseMockId(value?: string | null): MockId {
  return MOCK_LIBRARY.some((mock) => mock.id === value)
    ? (value as MockId)
    : DEFAULT_MOCK_ID;
}

function getMockDefinition(mockId: MockId) {
  return MOCK_LIBRARY.find((mock) => mock.id === mockId) ?? MOCK_LIBRARY[0];
}

function getMockIndex(mockId: MockId) {
  return Math.max(0, MOCK_LIBRARY.findIndex((mock) => mock.id === mockId));
}

function isMockId(value: unknown): value is MockId {
  return MOCK_LIBRARY.some((mock) => mock.id === value);
}

function withMockQuery(path: string, mockId: MockId) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}mock=${mockId}`;
}

function getMockOrderedQuestions(
  questions: UCATQuestion[],
  section: UCATSection,
  mockId: MockId
) {
  if (questions.length === 0) return questions;

  const standardisedQuestions = [...questions].sort((a, b) =>
    a.id.localeCompare(b.id)
  );
  const target = Math.min(FULL_MOCK_TARGETS[section], standardisedQuestions.length);
  const start = (getMockIndex(mockId) * target) % standardisedQuestions.length;
  return [
    ...standardisedQuestions.slice(start),
    ...standardisedQuestions.slice(0, start),
  ];
}

function getOfficialSectionSeconds(section: UCATSection, questionCount: number) {
  const target = FULL_MOCK_TARGETS[section];
  if (questionCount >= target) return FULL_MOCK_SECTION_SECONDS[section];

  return Math.max(
    60,
    Math.round(FULL_MOCK_SECTION_SECONDS[section] * (questionCount / target))
  );
}

function getPracticeSource(diagnosticMode: DiagnosticMode | null) {
  if (diagnosticMode === "free-qr") return FREE_QR_DIAGNOSTIC_SOURCE;
  if (diagnosticMode === "full-section") return FULL_SECTION_DIAGNOSTIC_SOURCE;
  if (diagnosticMode === "subset") return SUBSET_DIAGNOSTIC_SOURCE;

  return "question_bank";
}

function createEmptyMockScoreMatrix(): MockScoreMatrix {
  return MOCK_LIBRARY.reduce((matrix, mock) => {
    matrix[mock.id] = {};
    return matrix;
  }, {} as MockScoreMatrix);
}

function normaliseSummaryMockId(summary: PracticeSessionSummary): MockId {
  return isMockId(summary.mockId) ? summary.mockId : DEFAULT_MOCK_ID;
}

function getSectionScoreRecord(summary: PracticeSessionSummary): MockScoreRecord {
  const score = getDiagnosticSectionScore(summary);
  const completedAt = summary.completedAt;

  if (summary.section === "sjt") {
    const band = score.metadata.sjtBand ?? getSjtBand(summary.scorePoints, summary.maxScore);
    return {
      value: band,
      display: `Band ${band}`,
      completedAt,
      accuracy: summary.accuracy,
    };
  }

  const scaledScore =
    score.metadata.scaledScore ??
    getEstimatedScaledScore(summary.scorePoints, summary.maxScore);
  return {
    value: scaledScore,
    display: String(scaledScore),
    completedAt,
    accuracy: summary.accuracy,
  };
}

function buildMockScoreMatrix(
  rows: MockScoreSessionRow[],
  scope: Extract<MockStartScope, "full-mock" | "subtest"> = "full-mock"
): MockScoreMatrix {
  const matrix = createEmptyMockScoreMatrix();

  rows.forEach((row) => {
    if (
      row.source !== FULL_SECTION_DIAGNOSTIC_SOURCE ||
      !row.summary ||
      typeof row.summary !== "object" ||
      Array.isArray(row.summary)
    ) {
      return;
    }

    const summary = row.summary as PracticeSessionSummary;
    if (!FULL_MOCK_SECTION_ORDER.includes(summary.section)) return;
    if (summary.mockScope) {
      if (summary.mockScope !== scope) return;
    } else if (scope !== "full-mock") {
      return;
    }

    const mockId = normaliseSummaryMockId(summary);
    const section = summary.section;
    const current = matrix[mockId][section];
    const completedAt = summary.completedAt ?? row.completed_at ?? "";

    if (
      current &&
      completedAt &&
      current.completedAt &&
      new Date(current.completedAt).getTime() > new Date(completedAt).getTime()
    ) {
      return;
    }

    matrix[mockId][section] = {
      ...getSectionScoreRecord({ ...summary, completedAt }),
      completedAt,
    };
  });

  return matrix;
}

function normaliseSavedPracticeSet(
  row: SavedPracticeSessionRow,
  section: UCATSection
): SavedPracticeSet | null {
  if (
    !row.summary ||
    typeof row.summary !== "object" ||
    Array.isArray(row.summary)
  ) {
    return null;
  }

  const summary = row.summary as PracticeSessionSummary;
  if (summary.section !== section || !Array.isArray(summary.questions)) {
    return null;
  }

  return {
    id: row.id,
    summary,
    completedAt: row.completed_at ?? row.created_at ?? summary.completedAt,
    source: row.source,
  };
}

function formatSavedSetDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Saved set";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDiagnosticTitle(diagnosticMode: DiagnosticMode | null) {
  if (diagnosticMode === "free-qr") return "Free QR diagnostic";
  if (diagnosticMode === "full-section") return "Mock diagnostic";
  if (diagnosticMode === "subset") return "Custom diagnostic";

  return "Practice set";
}

function formatMarkValue(value: number) {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function formatMarkScore(points: number, maxPoints: number) {
  const markWord = maxPoints === 1 ? "mark" : "marks";
  return `${formatMarkValue(points)}/${formatMarkValue(maxPoints)} ${markWord}`;
}

function normaliseMinuteTarget(value: number | string) {
  const minutes = typeof value === "number" ? value : Number(value);
  return Number.isFinite(minutes) ? Math.max(1, minutes) : 1;
}

function minutesToSeconds(minutes: number) {
  return Math.max(60, Math.round(minutes * 60));
}

function sameOrder(first: string[], second: string[]) {
  return (
    first.length === second.length &&
    first.every((item, index) => item === second[index])
  );
}

function isPracticeAnswerMap(answer?: PracticeAnswer): answer is PracticeAnswerMap {
  return typeof answer === "object" && answer !== null && !Array.isArray(answer);
}

function isUCATSingleSelectQuestion(
  question: UCATQuestion
): question is UCATSingleQuestion {
  return !question.questionType || question.questionType === "single";
}

function getDragOrder(question: UCATQuestion, savedAnswer?: PracticeAnswer) {
  if (!isUCATDragOrderQuestion(question)) return [];
  return Array.isArray(savedAnswer)
    ? savedAnswer
    : question.dragItems.map((item) => item.id);
}

function getAnswerText(question: UCATQuestion, answer?: PracticeAnswer) {
  if (isUCATDragOrderQuestion(question)) {
    const order = getDragOrder(question, answer);
    return order.length > 0 ? "Ordered response" : "No response";
  }

  if (isUCATDragCategoryQuestion(question)) {
    if (!isPracticeAnswerMap(answer)) return "No answer";

    const categoryLookup = new Map(
      question.categories.map((category) => [category.id, category.label])
    );
    const placements = question.categoryItems.filter((item) => answer[item.id]);

    if (placements.length === 0) return "No answer";

    return placements
      .map(
        (item) =>
          `${item.text}: ${categoryLookup.get(answer[item.id]) ?? answer[item.id]}`
      )
      .join(" | ");
  }

  if (isUCATYesNoQuestion(question)) {
    if (!isPracticeAnswerMap(answer)) return "No answer";

    const answeredCount = question.yesNoStatements.filter(
      (statement) => answer[statement.id]
    ).length;

    if (answeredCount === 0) return "No answer";

    return answeredCount === question.yesNoStatements.length
      ? "All Yes/No statements answered"
      : `${answeredCount}/${question.yesNoStatements.length} statements answered`;
  }

  if (isUCATMostLeastQuestion(question)) {
    return isPracticeAnswerMap(answer) ? "Most/least response" : "No answer";
  }

  return isUCATSingleSelectQuestion(question) && typeof answer === "string"
    ? question.options.find((option) => option.key === answer)?.text ?? answer
    : "No answer";
}

function getDragCategoryPlacementScore(question: UCATQuestion, answer?: PracticeAnswer) {
  if (!isUCATDragCategoryQuestion(question) || !isPracticeAnswerMap(answer)) {
    return { placedCount: 0, correctCount: 0, totalCount: 0 };
  }

  const categoryIds = new Set(question.categories.map((category) => category.id));
  const totalCount = question.categoryItems.length;
  const placedCount = question.categoryItems.filter((item) =>
    categoryIds.has(answer[item.id])
  ).length;
  const correctCount = question.categoryItems.filter(
    (item) => answer[item.id] === item.answerCategory
  ).length;

  return { placedCount, correctCount, totalCount };
}

function getYesNoStatementScore(question: UCATQuestion, answer?: PracticeAnswer) {
  if (!isUCATYesNoQuestion(question) || !isPracticeAnswerMap(answer)) {
    return { answeredCount: 0, correctCount: 0, totalCount: 0 };
  }

  const totalCount = question.yesNoStatements.length;
  const answeredCount = question.yesNoStatements.filter((statement) =>
    ["Yes", "No"].includes(answer[statement.id])
  ).length;
  const correctCount = question.yesNoStatements.filter(
    (statement) => answer[statement.id] === statement.answer
  ).length;

  return { answeredCount, correctCount, totalCount };
}

function makeAnswerScore(
  status: PracticeAnswerStatus,
  points: number,
  feedback: string,
  maxPoints = 1
): PracticeAnswerScore {
  return { points, maxPoints, status, feedback };
}

function isSameSjtScaleSide(answer: UCATOptionKey, correctAnswer: UCATOptionKey) {
  return (
    (["A", "B"].includes(answer) && ["A", "B"].includes(correctAnswer)) ||
    (["C", "D"].includes(answer) && ["C", "D"].includes(correctAnswer))
  );
}

function isSjtPartialCreditAnswer(
  question: UCATQuestion,
  answer?: PracticeAnswer
) {
  return (
    question.section === "sjt" &&
    isUCATSingleSelectQuestion(question) &&
    typeof answer === "string" &&
    answer !== question.answer &&
    isSameSjtScaleSide(answer as UCATOptionKey, question.answer)
  );
}

function getAnswerScore(question: UCATQuestion, answer?: PracticeAnswer) {
  if (isUCATDragOrderQuestion(question)) {
    if (!Array.isArray(answer) || answer.length !== question.answerOrder.length) {
      return makeAnswerScore("unanswered", 0, "No answer selected");
    }

    return sameOrder(answer, question.answerOrder)
      ? makeAnswerScore("correct", 1, "Full mark awarded")
      : makeAnswerScore("incorrect", 0, "Incorrect order");
  }

  if (isUCATDragCategoryQuestion(question)) {
    const { placedCount, correctCount, totalCount } =
      getDragCategoryPlacementScore(question, answer);
    const wrongCount = totalCount - correctCount;

    if (totalCount === 0 || placedCount === 0) {
      return makeAnswerScore("unanswered", 0, "No answer selected");
    }

    if (correctCount === totalCount && placedCount === totalCount) {
      return makeAnswerScore(
        "correct",
        1,
        `${correctCount}/${totalCount} items correctly categorised`
      );
    }

    if (placedCount === totalCount && wrongCount === 1) {
      return makeAnswerScore(
        "partial",
        0.5,
        `${correctCount}/${totalCount} items correctly categorised`
      );
    }

    return makeAnswerScore(
      "incorrect",
      0,
      `${correctCount}/${totalCount} items correctly categorised`
    );
  }

  if (isUCATYesNoQuestion(question)) {
    const { answeredCount, correctCount, totalCount } = getYesNoStatementScore(
      question,
      answer
    );
    const wrongCount = totalCount - correctCount;

    if (totalCount === 0 || answeredCount < totalCount) {
      return makeAnswerScore("unanswered", 0, "Not all statements answered");
    }

    if (correctCount === totalCount) {
      return makeAnswerScore("correct", 1, "Full mark awarded");
    }

    if (wrongCount === 1) {
      return makeAnswerScore(
        "partial",
        0.5,
        `${correctCount}/${totalCount} statements correct`
      );
    }

    return makeAnswerScore(
      "incorrect",
      0,
      `${correctCount}/${totalCount} statements correct`
    );
  }

  if (isUCATMostLeastQuestion(question)) {
    if (!isAnswered(question, answer)) {
      return makeAnswerScore("unanswered", 0, "No complete response selected");
    }

    return isPracticeAnswerMap(answer) &&
      Object.entries(question.answerSlots).every(
        ([slot, itemId]) => answer[slot] === itemId
      )
      ? makeAnswerScore("correct", 1, "Full mark awarded")
      : makeAnswerScore("incorrect", 0, "Incorrect most/least response");
  }

  if (!isUCATSingleSelectQuestion(question) || typeof answer !== "string") {
    return makeAnswerScore("unanswered", 0, "No answer selected");
  }

  if (answer === question.answer) {
    return makeAnswerScore("correct", 1, "Full mark awarded");
  }

  if (isSjtPartialCreditAnswer(question, answer)) {
    return makeAnswerScore("partial", 0.5, "Half mark awarded");
  }

  return makeAnswerScore("incorrect", 0, "Incorrect answer");
}

function isAnswerCorrect(question: UCATQuestion, answer?: PracticeAnswer) {
  return getAnswerScore(question, answer).status === "correct";
}

function isAnswered(question: UCATQuestion, answer?: PracticeAnswer) {
  if (isUCATDragOrderQuestion(question)) {
    return Array.isArray(answer) && answer.length === question.answerOrder.length;
  }

  if (isUCATDragCategoryQuestion(question)) {
    return getDragCategoryPlacementScore(question, answer).placedCount > 0;
  }

  if (isUCATYesNoQuestion(question)) {
    return (
      isPracticeAnswerMap(answer) &&
      question.yesNoStatements.every((statement) =>
        ["Yes", "No"].includes(answer[statement.id])
      )
    );
  }

  if (isUCATMostLeastQuestion(question)) {
    return (
      isPracticeAnswerMap(answer) &&
      Object.keys(question.answerSlots).every((slot) => answer[slot])
    );
  }

  return isUCATSingleSelectQuestion(question) && typeof answer === "string";
}

function getCorrectAnswerPayload(question: UCATQuestion): PracticeAnswer {
  if (isUCATDragOrderQuestion(question)) return question.answerOrder;

  if (isUCATDragCategoryQuestion(question)) {
    return Object.fromEntries(
      question.categoryItems.map((item) => [item.id, item.answerCategory])
    );
  }

  if (isUCATYesNoQuestion(question)) {
    return Object.fromEntries(
      question.yesNoStatements.map((statement) => [statement.id, statement.answer])
    );
  }

  if (isUCATMostLeastQuestion(question)) return question.answerSlots;

  return question.answer;
}

function getCorrectAnswerText(question: UCATQuestion) {
  if (isUCATDragOrderQuestion(question)) {
    const itemLookup = new Map(question.dragItems.map((item) => [item.id, item.text]));
    return question.answerOrder
      .map((itemId, index) => `${index + 1}. ${itemLookup.get(itemId) ?? itemId}`)
      .join(" ");
  }

  if (isUCATDragCategoryQuestion(question)) {
    return question.categories
      .map((category) => {
        const items = question.categoryItems
          .filter((item) => item.answerCategory === category.id)
          .map((item) => item.text);
        return `${category.label}: ${items.join("; ")}`;
      })
      .join(" ");
  }

  if (isUCATYesNoQuestion(question)) {
    return question.yesNoStatements
      .map((statement, index) => `${index + 1}. ${statement.answer}`)
      .join(" ");
  }

  if (isUCATMostLeastQuestion(question)) {
    return Object.entries(question.answerSlots)
      .map(([slot, itemId]) => `${slot}: ${itemId}`)
      .join(" ");
  }

  return getAnswerText(question, question.answer);
}

function payloadNumber(event: TrackingEvent, key: string) {
  const value = event.payload?.[key];
  return typeof value === "number" ? value : 0;
}

function payloadString(event: TrackingEvent, key: string) {
  const value = event.payload?.[key];
  return typeof value === "string" ? value : "";
}

function payloadBoolean(event: TrackingEvent, key: string) {
  const value = event.payload?.[key];
  return typeof value === "boolean" ? value : false;
}

function averageGapMs(events: TrackingEvent[]) {
  if (events.length < 2) return 0;

  const gaps = events
    .slice(1)
    .map((event, index) => event.at - events[index].at)
    .filter((gap) => gap >= 0);

  if (gaps.length === 0) return 0;
  return Math.round(gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length);
}

function fastestGapMs(events: TrackingEvent[]) {
  if (events.length < 2) return 0;

  const gaps = events
    .slice(1)
    .map((event, index) => event.at - events[index].at)
    .filter((gap) => gap >= 0);

  return gaps.length > 0 ? Math.min(...gaps) : 0;
}

function isCalculatorInputEvent(event: TrackingEvent) {
  return [
    "digit",
    "decimal",
    "operator",
    "backspace",
    "memory_plus",
    "memory_minus",
    "memory_recall",
    "memory_clear",
  ].includes(payloadString(event, "action"));
}

function summariseCalculatorUsage(events: TrackingEvent[]): CalculatorUsageSummary {
  const calculatorEvents = events.filter((event) => event.type === "calculator");
  const inputEvents = calculatorEvents.filter(isCalculatorInputEvent);
  const buttonInputEvents = inputEvents.filter(
    (event) => payloadString(event, "source") === "button"
  );
  const keyboardInputEvents = inputEvents.filter(
    (event) => payloadString(event, "source") === "keyboard"
  );
  const pauseThresholdMs = 3000;
  let pauses = 0;

  inputEvents.forEach((event, index) => {
    const previous = inputEvents[index - 1];
    if (previous && event.at - previous.at >= pauseThresholdMs) {
      pauses += 1;
    }
  });

  return {
    opens: calculatorEvents.filter(
      (event) => payloadString(event, "action") === "open"
    ).length,
    buttonPresses: buttonInputEvents.length,
    keyboardPresses: keyboardInputEvents.length,
    digitPresses: calculatorEvents.filter(
      (event) => payloadString(event, "action") === "digit"
    ).length,
    decimalPresses: calculatorEvents.filter(
      (event) => payloadString(event, "action") === "decimal"
    ).length,
    backspaces: calculatorEvents.filter(
      (event) => payloadString(event, "action") === "backspace"
    ).length,
    operators: calculatorEvents.filter(
      (event) => payloadString(event, "action") === "operator"
    ).length,
    memoryUses: calculatorEvents.filter((event) =>
      payloadString(event, "action").startsWith("memory_")
    ).length,
    memoryPlus: calculatorEvents.filter(
      (event) => payloadString(event, "action") === "memory_plus"
    ).length,
    memoryMinus: calculatorEvents.filter(
      (event) => payloadString(event, "action") === "memory_minus"
    ).length,
    memoryRecall: calculatorEvents.filter(
      (event) => payloadString(event, "action") === "memory_recall"
    ).length,
    memoryClear: calculatorEvents.filter(
      (event) => payloadString(event, "action") === "memory_clear"
    ).length,
    pauses,
    pauseThresholdSeconds: pauseThresholdMs / 1000,
    avgInputGapMs: averageGapMs(inputEvents),
    fastestInputGapMs: fastestGapMs(inputEvents),
    buttonAvgGapMs: averageGapMs(buttonInputEvents),
    keyboardAvgGapMs: averageGapMs(keyboardInputEvents),
  };
}

function summariseShortcutUsage(events: TrackingEvent[]): ShortcutUsageSummary {
  const shortcutEvents = events.filter((event) => event.type === "shortcut");
  const labels = Array.from(
    new Set(
      shortcutEvents
        .map((event) => payloadString(event, "shortcut"))
        .filter(Boolean)
    )
  );

  return {
    total: shortcutEvents.length,
    answerKeys: shortcutEvents.filter(
      (event) => payloadString(event, "action") === "answer"
    ).length,
    navigation: shortcutEvents.filter((event) =>
      ["next_question", "previous_question"].includes(
        payloadString(event, "action")
      )
    ).length,
    calculator: shortcutEvents.filter(
      (event) => payloadString(event, "action") === "calculator"
    ).length,
    flag: shortcutEvents.filter(
      (event) => payloadString(event, "action") === "flag"
    ).length,
    labels,
  };
}

function summariseRegionActivity(events: TrackingEvent[]): RegionActivitySummary {
  return events
    .filter((event) => event.type === "attention_snapshot")
    .reduce<RegionActivitySummary>(
      (acc, event) => ({
        snapshots: acc.snapshots + 1,
        totalSwitches: acc.totalSwitches + payloadNumber(event, "switches"),
        stimulusQuestionFlips:
          acc.stimulusQuestionFlips +
          payloadNumber(event, "stimulusQuestionFlips"),
        questionAnswerFlips:
          acc.questionAnswerFlips + payloadNumber(event, "questionAnswerFlips"),
        stimulusAnswerFlips:
          acc.stimulusAnswerFlips + payloadNumber(event, "stimulusAnswerFlips"),
        stimulusRevisits:
          acc.stimulusRevisits + payloadNumber(event, "stimulusRevisits"),
        questionRevisits:
          acc.questionRevisits + payloadNumber(event, "questionRevisits"),
        answerRevisits:
          acc.answerRevisits + payloadNumber(event, "answerRevisits"),
        stimulusSeconds:
          acc.stimulusSeconds +
          Math.round(payloadNumber(event, "stimulusMs") / 1000),
        questionSeconds:
          acc.questionSeconds +
          Math.round(payloadNumber(event, "questionMs") / 1000),
        answerSeconds:
          acc.answerSeconds +
          Math.round(payloadNumber(event, "answersMs") / 1000),
        trackingRecorded:
          acc.trackingRecorded || event.payload?.dataReceived === true,
      }),
      {
        snapshots: 0,
        totalSwitches: 0,
        stimulusQuestionFlips: 0,
        questionAnswerFlips: 0,
        stimulusAnswerFlips: 0,
        stimulusRevisits: 0,
        questionRevisits: 0,
        answerRevisits: 0,
        stimulusSeconds: 0,
        questionSeconds: 0,
        answerSeconds: 0,
        trackingRecorded: false,
      }
    );
}

function summariseInterfaceUsage(events: TrackingEvent[]): InterfaceUsageSummary {
  return {
    reviewOpens: events.filter((event) => event.type === "review_open").length,
    navigatorOpens: events.filter(
      (event) =>
        event.type === "navigator_toggle" && event.payload?.open === true
    ).length,
    explanationToggles: events.filter((event) => event.type === "explain_toggle")
      .length,
    colourSchemeChanges: events.filter(
      (event) => event.type === "colour_scheme_change"
    ).length,
    nextClicks: events.filter((event) => event.type === "next_question").length,
    previousClicks: events.filter((event) => event.type === "previous_question")
      .length,
    flagToggles: events.filter((event) => event.type === "flag_toggle").length,
    questionJumps: events.filter((event) => event.type === "go_to_question")
      .length,
    endBankClicks: events.filter((event) => event.type === "end_bank").length,
  };
}

function buildQuestionSummary({
  question,
  index,
  answer,
  flagged,
  timing,
  events,
}: {
  question: UCATQuestion;
  index: number;
  answer?: PracticeAnswer;
  flagged: boolean;
  timing?: QuestionTiming;
  events: TrackingEvent[];
}): PracticeQuestionSummary {
  const selectedAnswer = answer ?? null;
  const answerScore = getAnswerScore(question, answer);
  const answered = isAnswered(question, answer);
  const correct = answerScore.status === "correct";
  const answerEvents = events.filter((event) => event.type === "answer_select");
  const dragEvents = events.filter((event) => event.type === "drag_reorder");
  let previousAnswer = "";
  let answerSwitches = 0;

  answerEvents.forEach((event) => {
    const nextAnswer = isUCATDragCategoryQuestion(question)
      ? `${payloadString(event, "itemId")}:${payloadString(event, "answer")}`
      : payloadString(event, "answer");
    if (previousAnswer && nextAnswer && previousAnswer !== nextAnswer) {
      answerSwitches += 1;
    }
    previousAnswer = nextAnswer || previousAnswer;
  });

  const answerPath = [...answerEvents, ...dragEvents]
    .sort((first, second) => first.at - second.at)
    .map((event): AnswerPathEntry => {
      const source = payloadString(event, "source") || "drag";
      const atSeconds = Math.round(payloadNumber(event, "questionElapsedMs") / 1000);

      if (event.type === "drag_reorder") {
        const answerText = payloadString(event, "order") || "Ordered response";
        return {
          answer: "order",
          answerText,
          correct: payloadBoolean(event, "correct"),
          source,
          atSeconds,
        };
      }

      if (isUCATDragCategoryQuestion(question)) {
        const itemId = payloadString(event, "itemId");
        const categoryId = payloadString(event, "answer");
        const item = question.categoryItems.find(
          (categoryItem) => categoryItem.id === itemId
        );
        const category = question.categories.find(
          (categoryItem) => categoryItem.id === categoryId
        );

        return {
          answer: `${itemId}:${categoryId}`,
          answerText: `${item?.text ?? itemId}: ${
            category?.label ?? categoryId
          }`,
          correct: item?.answerCategory === categoryId,
          source,
          atSeconds,
        };
      }

      if (isUCATYesNoQuestion(question)) {
        const statementId = payloadString(event, "statementId");
        const selectedValue = payloadString(event, "answer");
        const statement = question.yesNoStatements.find(
          (item) => item.id === statementId
        );

        return {
          answer: `${statementId}:${selectedValue}`,
          answerText: `${statement?.text ?? statementId}: ${selectedValue}`,
          correct: statement?.answer === selectedValue,
          source,
          atSeconds,
        };
      }

      const answerKey = payloadString(event, "answer") as UCATOptionKey;
      return {
        answer: answerKey,
        answerText: getAnswerText(question, answerKey),
        correct:
          isUCATSingleSelectQuestion(question) && answerKey === question.answer,
        source,
        atSeconds,
      };
    });

  const firstAnswer = answerPath[0];
  const dragEdits = dragEvents.length;
  const everCorrect = answerPath.some((item) => item.correct) || correct;
  const everWrong = answerPath.some((item) => !item.correct);
  const startedWrong = firstAnswer ? !firstAnswer.correct : false;
  const startedCorrect = firstAnswer ? firstAnswer.correct : false;

  return {
    questionId: question.id,
    questionIndex: index,
    section: question.section,
    subtype: question.subtype,
    subtypeLabel: getUCATSubtypeMeta(question.subtype).label,
    questionText: question.question,
    explanation: question.explanation,
    answered,
    correct,
    partial: answerScore.status === "partial",
    scorePoints: answerScore.points,
    maxScore: answerScore.maxPoints,
    resultStatus: answerScore.status,
    questionTags: question.tags ?? [],
    issueTags: question.issueTags ?? [],
    issueLabels: (question.issueTags ?? []).map(getUCATSjtIssueLabel),
    flagged,
    selectedAnswer,
    correctAnswer: getCorrectAnswerPayload(question),
    selectedAnswerText: getAnswerText(question, answer),
    correctAnswerText: getCorrectAnswerText(question),
    firstAnswerText: firstAnswer?.answerText ?? "No answer selected",
    answerPath,
    answerSelections: answerEvents.length + dragEdits,
    totalSeconds: Math.round((timing?.totalMs ?? 0) / 1000),
    visits: timing?.visits ?? 0,
    answerSwitches: answerSwitches + dragEdits,
    changedToCorrect: startedWrong && correct,
    changedFromCorrect: startedCorrect && answered && !correct,
    everCorrect,
    everWrong,
    firstAnsweredAtMs:
      answerPath.length > 0 ? answerPath[0].atSeconds * 1000 : null,
    answeredAtMs: timing?.answeredAtMs ?? null,
    calculator: summariseCalculatorUsage(events),
    shortcuts: summariseShortcutUsage(events),
    regionActivity: summariseRegionActivity(events),
    otherData: summariseInterfaceUsage(events),
    trackingEventCount: events.length,
  };
}

function buildPracticeSessionSummary({
  section,
  sectionTitle,
  mockId = null,
  mockScope = null,
  mockLabel = null,
  questions,
  answers,
  flags,
  timings,
  events,
  startedAt,
  completedAt,
  timed,
  setSeconds,
  secondsRemaining,
  trackingMode,
}: {
  section: UCATSection;
  sectionTitle: string;
  mockId?: MockId | null;
  mockScope?: MockStartScope | null;
  mockLabel?: string | null;
  questions: UCATQuestion[];
  answers: Record<number, PracticeAnswer>;
  flags: Record<number, boolean>;
  timings: Record<string, QuestionTiming>;
  events: TrackingEvent[];
  startedAt: number;
  completedAt: number;
  timed: boolean;
  setSeconds: number;
  secondsRemaining: number;
  trackingMode: TrackingMode;
}): PracticeSessionSummary {
  const eventsByQuestion = new Map<number, TrackingEvent[]>();

  events.forEach((event) => {
    if (typeof event.questionIndex !== "number") return;
    eventsByQuestion.set(event.questionIndex, [
      ...(eventsByQuestion.get(event.questionIndex) ?? []),
      event,
    ]);
  });

  const questionSummaries = questions.map((question, index) =>
    buildQuestionSummary({
      question,
      index,
      answer: answers[index],
      flagged: Boolean(flags[index]),
      timing: timings[question.id],
      events: eventsByQuestion.get(index) ?? [],
    })
  );

  const correctQuestions = questionSummaries.filter((item) => item.correct).length;
  const answeredQuestions = questionSummaries.filter((item) => item.answered).length;
  const scorePoints = questionSummaries.reduce(
    (sum, item) => sum + item.scorePoints,
    0
  );
  const maxScore = questionSummaries.reduce((sum, item) => sum + item.maxScore, 0);
  const flaggedQuestions = questionSummaries.filter((item) => item.flagged).length;
  const answerSwitches = questionSummaries.reduce(
    (sum, item) => sum + item.answerSwitches,
    0
  );
  const changedQuestions = questionSummaries.filter(
    (item) => item.answerSwitches > 0
  ).length;
  const changedToCorrect = questionSummaries.filter(
    (item) => item.changedToCorrect
  ).length;
  const changedFromCorrect = questionSummaries.filter(
    (item) => item.changedFromCorrect
  ).length;
  const totalSeconds = Math.round(
    Object.values(timings).reduce((sum, item) => sum + item.totalMs, 0) / 1000
  );
  const accuracy =
    maxScore > 0 ? Math.round((scorePoints / maxScore) * 100) : 0;
  const avgSecondsPerQuestion =
    questions.length > 0 ? Math.round(totalSeconds / questions.length) : 0;

  const timingBySubtypeMap = new Map<UCATSubtypeId, TimingBySubtype>();
  questionSummaries.forEach((item) => {
    const current = timingBySubtypeMap.get(item.subtype) ?? {
      subtype: item.subtype,
      label: item.subtypeLabel,
      questions: 0,
      answered: 0,
      correct: 0,
      flagged: 0,
      visits: 0,
      totalSeconds: 0,
      avgSeconds: 0,
    };
    current.questions += 1;
    current.answered += item.answered ? 1 : 0;
    current.correct += item.correct ? 1 : 0;
    current.flagged += item.flagged ? 1 : 0;
    current.visits += item.visits;
    current.totalSeconds += item.totalSeconds;
    current.avgSeconds =
      current.questions > 0 ? Math.round(current.totalSeconds / current.questions) : 0;
    timingBySubtypeMap.set(item.subtype, current);
  });

  return {
    section,
    sectionTitle,
    mockId,
    mockScope,
    mockLabel,
    startedAt: new Date(startedAt).toISOString(),
    completedAt: new Date(completedAt).toISOString(),
    totalQuestions: questions.length,
    answeredQuestions,
    correctQuestions,
    accuracy,
    scorePoints,
    maxScore,
    totalSeconds,
    avgSecondsPerQuestion,
    timed,
    setSeconds,
    secondsRemaining,
    trackingMode,
    trackingEventCount: events.length,
    flaggedQuestions,
    answerSwitches,
    changedQuestions,
    answerEdits: questionSummaries.reduce(
      (sum, item) => sum + item.answerSwitches,
      0
    ),
    changedToCorrect,
    changedFromCorrect,
    timingBySubtype: Array.from(timingBySubtypeMap.values()),
    calculator: summariseCalculatorUsage(events),
    shortcuts: summariseShortcutUsage(events),
    regionActivity: summariseRegionActivity(events),
    otherData: summariseInterfaceUsage(events),
    questions: questionSummaries,
  };
}

function QuestionVisual({ visual }: { visual: UCATChartVisual }) {
  if (visual.type === "table") {
    return (
      <div className="mt-6 overflow-hidden rounded-sm border border-slate-300 bg-white">
        <div className="border-b border-slate-300 bg-slate-100 px-3 py-2 text-sm font-bold">
          {visual.title}
        </div>
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {visual.headers.map((header) => (
                <th key={header} className="border-b border-slate-200 px-3 py-2 font-bold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visual.rows.map((row) => (
              <tr key={row.join("-")}>
                {row.map((cell) => (
                  <td key={cell} className="border-b border-slate-100 px-3 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {visual.note && (
          <p className="px-3 py-2 text-xs font-semibold text-slate-600">
            {visual.note}
          </p>
        )}
      </div>
    );
  }

  if (visual.type === "set-diagram") {
    const width = 620;
    const height = 420;
    const shapePoints = (shape: (typeof visual.shapes)[number]) => {
      const { x, y, width: shapeWidth, height: shapeHeight } = shape;

      if (shape.shape === "triangle") {
        return `${x + shapeWidth / 2},${y} ${x + shapeWidth},${y + shapeHeight} ${x},${y + shapeHeight}`;
      }

      if (shape.shape === "diamond") {
        return `${x + shapeWidth / 2},${y} ${x + shapeWidth},${y + shapeHeight / 2} ${x + shapeWidth / 2},${y + shapeHeight} ${x},${y + shapeHeight / 2}`;
      }

      if (shape.shape === "hexagon") {
        return `${x + shapeWidth * 0.25},${y} ${x + shapeWidth * 0.75},${y} ${x + shapeWidth},${y + shapeHeight / 2} ${x + shapeWidth * 0.75},${y + shapeHeight} ${x + shapeWidth * 0.25},${y + shapeHeight} ${x},${y + shapeHeight / 2}`;
      }

      return `${x + shapeWidth / 2},${y} ${x + shapeWidth},${y + shapeHeight * 0.38} ${x + shapeWidth * 0.82},${y + shapeHeight} ${x + shapeWidth * 0.18},${y + shapeHeight} ${x},${y + shapeHeight * 0.38}`;
    };

    return (
      <div className="mt-6 rounded-sm border border-slate-300 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.08)]">
        <h3 className="text-center text-sm font-bold">{visual.title}</h3>
        <div className="mt-2 overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="min-w-[520px] text-slate-800"
            role="img"
            aria-label={visual.title}
          >
            {visual.shapes.map((shape) => {
              const centerX = shape.x + shape.width / 2;
              const centerY = shape.y + shape.height / 2;
              const transform = shape.rotation
                ? `rotate(${shape.rotation} ${centerX} ${centerY})`
                : undefined;

              if (shape.shape === "circle") {
                return (
                  <ellipse
                    key={shape.id}
                    cx={centerX}
                    cy={centerY}
                    rx={shape.width / 2}
                    ry={shape.height / 2}
                    transform={transform}
                    fill="rgba(255,255,255,0.45)"
                    stroke="#111827"
                    strokeWidth="2"
                  />
                );
              }

              if (shape.shape === "rectangle") {
                return (
                  <rect
                    key={shape.id}
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    transform={transform}
                    fill="rgba(255,255,255,0.45)"
                    stroke="#111827"
                    strokeWidth="2"
                  />
                );
              }

              return (
                <polygon
                  key={shape.id}
                  points={shapePoints(shape)}
                  transform={transform}
                  fill="rgba(255,255,255,0.45)"
                  stroke="#111827"
                  strokeWidth="2"
                />
              );
            })}
            {visual.regionLabels.map((label) => (
              <text
                key={label.id}
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="17"
                fontWeight="700"
                fill="#111827"
              >
                {label.text}
              </text>
            ))}
          </svg>
        </div>
        {visual.note && (
          <p className="mt-2 text-xs font-semibold text-slate-600">{visual.note}</p>
        )}
        {visual.legend && (
          <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-700 sm:grid-cols-2">
            {visual.legend.map((item) => (
              <div
                key={`${item.shape}-${item.label}`}
                className="flex items-center justify-between border-b border-slate-200 px-1 py-1"
              >
                <span>{item.label}</span>
                <span className="capitalize">{item.shape}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const width = 560;
  const height = 330;
  const left = 66;
  const right = 36;
  const top = 42;
  const bottom = 66;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const valueToY = (value: number) =>
    top + chartHeight - (value / visual.max) * chartHeight;
  const tickCount = 10;
  const ticks = Array.from(
    { length: tickCount + 1 },
    (_, index) => (visual.max / tickCount) * index
  );
  const majorTicks = ticks.filter((_, index) => index % 2 === 0);
  const entries: Array<{ label: string; value: number }> =
    visual.type === "bar"
      ? visual.categories
      : visual.type === "line"
        ? visual.points
        : visual.groups.flatMap((group) =>
            group.values.map((value, index) => ({
              label: `${group.label} - ${visual.seriesLabels[index]}`,
              value,
            }))
          );

  const linePoints =
    visual.type === "line"
      ? visual.points.map((point, index) => {
          const x =
            left +
            (visual.points.length === 1
              ? chartWidth / 2
              : (index / (visual.points.length - 1)) * chartWidth);
          return { ...point, x, y: valueToY(point.value) };
        })
      : [];

  return (
    <div className="mt-6 rounded-sm border border-slate-300 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.08)]">
      <h3 className="text-center text-sm font-bold">{visual.title}</h3>
      <div className="mt-2 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[460px] text-slate-800"
          role="img"
          aria-label={visual.title}
        >
          <rect
            x={left}
            y={top}
            width={chartWidth}
            height={chartHeight}
            fill="#fbfbfb"
            stroke="#d4d4d4"
            strokeWidth="1"
          />
          {ticks.map((tick) => {
            const y = valueToY(tick);
            const major = majorTicks.includes(tick);
            return (
              <g key={tick}>
                <line
                  x1={left}
                  y1={y}
                  x2={left + chartWidth}
                  y2={y}
                  stroke={major ? "#9ca3af" : "#e5e7eb"}
                  strokeWidth={major ? "1.1" : "0.7"}
                />
                {major && (
                  <text
                    x={left - 12}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="13"
                    fill="#27272a"
                  >
                    {Math.round(tick)}
                  </text>
                )}
              </g>
            );
          })}
          {Array.from({ length: 10 }, (_, index) => {
            const x = left + (index / 10) * chartWidth;
            return (
              <line
                key={x}
                x1={x}
                y1={top}
                x2={x}
                y2={top + chartHeight}
                stroke="#eeeeee"
                strokeWidth="0.7"
              />
            );
          })}
          <line
            x1={left}
            y1={top + chartHeight}
            x2={left + chartWidth}
            y2={top + chartHeight}
            stroke="#111827"
            strokeWidth="1.8"
          />
          <line
            x1={left}
            y1={top}
            x2={left}
            y2={top + chartHeight}
            stroke="#111827"
            strokeWidth="1.8"
          />
          <text
            x={22}
            y={top + chartHeight / 2}
            transform={`rotate(-90 22 ${top + chartHeight / 2})`}
            textAnchor="middle"
            fontSize="14"
            fontWeight="700"
            fill="#27272a"
          >
            {visual.yLabel}
          </text>

          {visual.type === "bar" &&
            visual.categories.map((category, index) => {
              const gap = 22;
              const barWidth =
                (chartWidth - gap * (visual.categories.length + 1)) /
                visual.categories.length;
              const x = left + gap + index * (barWidth + gap);
              const y = valueToY(category.value);
              const barHeight = top + chartHeight - y;
              return (
                <g key={category.label}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill="#8a8a8a"
                    stroke="#1f2937"
                    strokeWidth="1.2"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 7}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="700"
                    fill="#111827"
                  >
                    {category.value}
                  </text>
                  <text
                    x={x + barWidth / 2}
                    y={top + chartHeight + 22}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="700"
                    fill="#27272a"
                  >
                    {category.label}
                  </text>
                </g>
              );
            })}

          {visual.type === "grouped-bar" &&
            visual.groups.map((group, groupIndex) => {
              const groupGap = 24;
              const seriesCount = Math.max(1, visual.seriesLabels.length);
              const groupWidth =
                (chartWidth - groupGap * (visual.groups.length + 1)) /
                visual.groups.length;
              const barGap = 4;
              const barWidth =
                (groupWidth - barGap * (seriesCount - 1)) / seriesCount;
              const x = left + groupGap + groupIndex * (groupWidth + groupGap);

              return (
                <g key={group.label}>
                  {group.values.map((value, valueIndex) => {
                    const barX = x + valueIndex * (barWidth + barGap);
                    const y = valueToY(value);
                    const barHeight = top + chartHeight - y;
                    return (
                      <rect
                        key={`${group.label}-${visual.seriesLabels[valueIndex]}`}
                        x={barX}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        fill={valueIndex % 2 === 0 ? "#8a8a8a" : "#c4c4c4"}
                        stroke="#1f2937"
                        strokeWidth="1.2"
                      />
                    );
                  })}
                  <text
                    x={x + groupWidth / 2}
                    y={top + chartHeight + 22}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="700"
                    fill="#27272a"
                  >
                    {group.label}
                  </text>
                </g>
              );
            })}

          {visual.type === "line" && (
            <>
              <polyline
                points={linePoints.map((point) => `${point.x},${point.y}`).join(" ")}
                fill="none"
                stroke="#3f3f46"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {linePoints.map((point) => (
                <g key={point.label}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="5"
                    fill="#f8fafc"
                    stroke="#111827"
                    strokeWidth="2"
                  />
                  <text
                    x={point.x}
                    y={point.y - 10}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="700"
                    fill="#111827"
                  >
                    {point.value}
                  </text>
                  <text
                    x={point.x}
                    y={top + chartHeight + 22}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="700"
                    fill="#27272a"
                  >
                    {point.label}
                  </text>
                </g>
              ))}
            </>
          )}
        </svg>
      </div>
      {visual.note && (
        <p className="mt-2 text-xs font-semibold text-slate-600">{visual.note}</p>
      )}
      <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-700 sm:grid-cols-2">
        {entries.map((entry) => (
          <div
            key={entry.label}
            className="flex items-center justify-between border-b border-slate-200 px-1 py-1"
          >
            <span>{entry.label}</span>
            <span>{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHub() {
  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 py-8 text-[#111827]">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/phloemai/practice"
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to practice
        </Link>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase tracking-widest text-blue-700">
            PhloemAI UCAT question bank
          </p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">
            Choose a PhloemAI section to practice
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
            Pick a UCAT section, then choose mixed practice or target specific
            question types before starting a timed or untimed set.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {UCAT_SECTIONS.map((section) => (
              <Link
                key={section.slug}
                href={`/phloemai/question-bank/${section.slug}`}
                className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-blue-400 hover:bg-blue-50"
              >
                <span className="inline-flex rounded-lg bg-blue-600 px-3 py-1 text-sm font-black text-white">
                  {section.code}
                </span>
                <h2 className="mt-4 text-lg font-black text-slate-950">
                  {section.bankTitle}
                </h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                  {section.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-blue-700">
                  Start section
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrackingCalibrationScreen({
  status,
  calibPhase,
  calibCountdown,
}: {
  status: "enabling" | "calibrating";
  calibPhase: number;
  calibCountdown: number;
}) {
  const phase = CALIB_PHASES[calibPhase] ?? CALIB_PHASES[0];

  if (status === "enabling") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 text-white">
        <div className="rounded-xl border border-white/10 bg-white/5 px-8 py-6 text-center shadow-2xl">
          <Eye className="mx-auto h-8 w-8 text-blue-300" aria-hidden="true" />
          <p className="mt-4 text-lg font-black">Loading eye tracking</p>
          <p className="mt-2 text-sm font-semibold text-slate-300">
            Allow camera access, then keep your head still for calibration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950">
      <div className="absolute left-0 right-0 top-6 flex flex-col items-center gap-3">
        <p className="text-lg font-black text-white">Eye tracking calibration</p>
        <p className="text-sm font-semibold text-slate-300">
          Look at the dot - <span className="text-blue-300">{phase.label}</span>
        </p>
        <div className="flex gap-2">
          {CALIB_PHASES.map((item, index) => (
            <div
              key={item.label}
              className={`h-2.5 w-2.5 rounded-full ${
                index < calibPhase
                  ? "bg-blue-600"
                  : index === calibPhase
                    ? "bg-white"
                    : "bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>

      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${phase.x}%`, top: `${phase.y}%` }}
      >
        <div className="relative flex items-center justify-center">
          <div className="absolute h-20 w-20 animate-ping rounded-full border border-blue-500/30" />
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 shadow-md">
            <div className="h-2.5 w-2.5 rounded-full bg-slate-950" />
          </div>
        </div>
        <div className="mt-4 text-center text-4xl font-black tabular-nums text-blue-300">
          {calibCountdown > 0 ? calibCountdown : "OK"}
        </div>
      </div>
    </div>
  );
}

function SectionSetup({
  section,
  selectedSubtypeIds,
  questionCount,
  availableCount,
  completedQuestionIds,
  savedPracticeSets,
  progressLoading,
  lengthMode,
  questionTarget,
  minuteTarget,
  customMinutes,
  timed,
  onSelectMixed,
  onToggleSubtype,
  onLengthModeChange,
  onQuestionTargetChange,
  onMinuteTargetChange,
  onCustomMinutesChange,
  onTimedChange,
  trackingMode,
  trackingRingVisible,
  trackingError,
  trackingStarting,
  onTrackingModeChange,
  onTrackingRingChange,
  onStart,
  onReviewSavedSet,
  diagnosticMode,
  reviewMode,
  mock,
  backHref,
  backLabel,
}: {
  section: UCATSection;
  diagnosticMode?: DiagnosticMode | null;
  backHref?: string;
  backLabel?: string;
  selectedSubtypeIds: UCATSubtypeId[];
  questionCount: number;
  availableCount: number;
  completedQuestionIds: Set<string>;
  savedPracticeSets: SavedPracticeSet[];
  progressLoading: boolean;
  lengthMode: SessionLengthMode;
  questionTarget: number;
  minuteTarget: number | "custom";
  customMinutes: string;
  timed: boolean;
  onSelectMixed: () => void;
  onToggleSubtype: (subtype: UCATSubtypeId) => void;
  onLengthModeChange: (mode: SessionLengthMode) => void;
  onQuestionTargetChange: (count: number) => void;
  onMinuteTargetChange: (minutes: number | "custom") => void;
  onCustomMinutesChange: (minutes: string) => void;
  onTimedChange: (timed: boolean) => void;
  trackingMode: TrackingMode;
  trackingRingVisible: boolean;
  trackingError: boolean;
  trackingStarting: boolean;
  onTrackingModeChange: (mode: TrackingMode) => void;
  onTrackingRingChange: (visible: boolean) => void;
  onStart: () => void;
  onReviewSavedSet: (set: SavedPracticeSet) => void;
  reviewMode?: boolean;
  mock?: (typeof MOCK_LIBRARY)[number];
}) {
  const meta = getUCATSectionMeta(section);
  const subtypes = UCAT_SUBTYPES[section];
  const sectionQuestionCount = UCAT_QUESTION_BANK[section].length;
  const completedCount = UCAT_QUESTION_BANK[section].filter((question) =>
    completedQuestionIds.has(question.id)
  ).length;
  const remainingQuestionCount = Math.max(0, sectionQuestionCount - completedCount);
  const mixedSelected = selectedSubtypeIds.length === 0;
  const selectedMinutes =
    minuteTarget === "custom"
      ? normaliseMinuteTarget(customMinutes)
      : minuteTarget;
  const setTime =
    lengthMode === "minutes"
      ? minutesToSeconds(selectedMinutes)
      : questionCount * meta.secondsPerQuestion;

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 py-8 text-[#111827]">
      <div className="mx-auto max-w-5xl">
        <Link
          href={diagnosticMode ? backHref ?? "/phloemai/diagnostic" : "/phloemai/practice"}
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {diagnosticMode ? backLabel ?? "Back to diagnostics" : "Back to practice"}
        </Link>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="inline-flex rounded-lg bg-blue-600 px-3 py-1 text-sm font-black text-white">
                {meta.code}
              </span>
              <h1 className="mt-4 text-3xl font-black text-slate-950">
                {meta.bankTitle}
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
                {meta.description}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">
              {progressLoading
                ? "Loading progress..."
                : `${questionCount} of ${availableCount} uncompleted questions`}
            </div>
          </div>

          {!diagnosticMode && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-600">
              {progressLoading
                ? "Checking your completed questions before building the next set."
                : reviewMode && savedPracticeSets.length > 0
                  ? "Review mode: open a completed set below. New practice only uses questions you have not completed yet."
                : `${completedCount} completed, ${remainingQuestionCount} left in ${meta.code}. Completed questions will not appear again.`}
            </div>
          )}

          {diagnosticMode === "subset" && (
            <MockStartBriefing
              section={section}
              questionCount={questionCount}
              seconds={setTime}
              scope="diagnostic"
              mock={mock}
            />
          )}

          {!diagnosticMode && savedPracticeSets.length > 0 && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">
                    Completed sets
                  </h2>
                  <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                    You can review completed sets, but their questions are locked out of new practice.
                  </p>
                </div>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {savedPracticeSets.slice(0, 6).map((set) => (
                  <button
                    key={set.id}
                    type="button"
                    onClick={() => onReviewSavedSet(set)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-left hover:border-blue-300 hover:bg-blue-50"
                  >
                    <p className="text-sm font-black text-slate-900">
                      {formatSavedSetDate(set.completedAt)}
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {set.summary.correctQuestions}/{set.summary.totalQuestions} correct - {set.summary.accuracy}%
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7">
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">
              Question types
            </h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={onSelectMixed}
                aria-pressed={mixedSelected}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  mixedSelected
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-black">Mixed (all)</span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-500">
                    {diagnosticMode ? sectionQuestionCount : availableCount}
                  </span>
                </div>
                <p className="mt-2 text-xs font-bold leading-5 text-slate-500">
                  Use every question type in this section.
                </p>
              </button>

              {subtypes.map((subtype) => {
                const active = selectedSubtypeIds.includes(subtype.id);
                const count = UCAT_QUESTION_BANK[section].filter(
                  (question) =>
                    question.subtype === subtype.id &&
                    (diagnosticMode || !completedQuestionIds.has(question.id))
                ).length;
                return (
                  <button
                    key={subtype.id}
                    type="button"
                    onClick={() => onToggleSubtype(subtype.id)}
                    aria-pressed={active}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      active
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-black">{subtype.label}</span>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black text-slate-500">
                        {count}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-bold leading-5 text-slate-500">
                      {subtype.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-7">
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">
              Set length
            </h2>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <button
                  type="button"
                  onClick={() => onLengthModeChange("questions")}
                  aria-pressed={lengthMode === "questions"}
                  className={`inline-flex rounded-lg px-3 py-1 text-xs font-black ${
                    lengthMode === "questions"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Number of questions
                </button>
                <div className="mt-3 flex flex-wrap gap-2">
                  {QUESTION_TARGETS.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => {
                        onLengthModeChange("questions");
                        onQuestionTargetChange(count);
                      }}
                      className={`h-10 rounded-lg border px-4 text-sm font-black ${
                        lengthMode === "questions" && questionTarget === count
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-700 hover:border-blue-300"
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs font-bold leading-5 text-slate-500">
                  If fewer questions are available for your selected types, the
                  closest available set is used.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <button
                  type="button"
                  onClick={() => onLengthModeChange("minutes")}
                  aria-pressed={lengthMode === "minutes"}
                  className={`inline-flex rounded-lg px-3 py-1 text-xs font-black ${
                    lengthMode === "minutes"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Time target
                </button>
                <div className="mt-3 flex flex-wrap gap-2">
                  {MINUTE_TARGETS.map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() => {
                        onLengthModeChange("minutes");
                        onMinuteTargetChange(minutes);
                      }}
                      className={`h-10 rounded-lg border px-4 text-sm font-black ${
                        lengthMode === "minutes" && minuteTarget === minutes
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-700 hover:border-blue-300"
                      }`}
                    >
                      {minutes} min
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      onLengthModeChange("minutes");
                      onMinuteTargetChange("custom");
                    }}
                    className={`h-10 rounded-lg border px-4 text-sm font-black ${
                      lengthMode === "minutes" && minuteTarget === "custom"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-700 hover:border-blue-300"
                    }`}
                  >
                    Custom
                  </button>
                </div>
                {lengthMode === "minutes" && minuteTarget === "custom" && (
                  <label className="mt-3 block">
                    <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Minutes
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={customMinutes}
                      onChange={(event) => onCustomMinutesChange(event.target.value)}
                      className="mt-1 h-10 w-32 rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-blue-500"
                    />
                  </label>
                )}
                <p className="mt-3 text-xs font-bold leading-5 text-slate-500">
                  Timer stays exact. The official section pace only chooses the
                  closest question count.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7">
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">
              Timing
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onTimedChange(false)}
                disabled={lengthMode === "minutes"}
                aria-pressed={!timed}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                  !timed
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <Clock3 className="h-5 w-5" aria-hidden="true" />
                <div>
                  <p className="text-sm font-black">Untimed</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Accuracy-first practice.
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => onTimedChange(true)}
                aria-pressed={timed}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                  timed
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                }`}
              >
                <Timer className="h-5 w-5" aria-hidden="true" />
                <div>
                  <p className="text-sm font-black">Timed</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {formatDuration(setTime)} for this set.
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-7">
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">
              Attention tracking
            </h2>
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              {[
                {
                  mode: "mouse" as const,
                  title: "Mouse tracking",
                  meta: "Recommended",
                  icon: MousePointer2,
                },
                {
                  mode: "eye" as const,
                  title: "Experimental eye tracking",
                  meta: "Camera",
                  icon: Eye,
                },
                {
                  mode: "none" as const,
                  title: "Off",
                  meta: "No tracking",
                  icon: XCircle,
                },
              ].map((item) => {
                const Icon = item.icon;
                const active = trackingMode === item.mode;
                return (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() => onTrackingModeChange(item.mode)}
                    aria-pressed={active}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                      active
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-black">{item.title}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {item.meta}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            <label className="mt-3 flex w-fit items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700">
              <input
                type="checkbox"
                checked={trackingRingVisible}
                onChange={(event) => onTrackingRingChange(event.target.checked)}
                disabled={trackingMode === "none"}
                className="h-4 w-4"
              />
              Show tracking ring
            </label>
            {trackingError && trackingMode === "eye" && (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700">
                Eye tracking could not start. Mouse tracking is still available.
              </p>
            )}
          </div>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-900">
            <p className="font-black uppercase tracking-wide">
              Data and AI notice
            </p>
            <p className="mt-2">
              When you mark a set, PhloemAI can save answers, timings, answer
              switches, flags, calculator usage, keyboard shortcuts, navigation
              activity and optional attention summaries for feedback. Mouse and
              eye tracking are optional; webcam video is not stored. AI feedback
              is educational support only and does not guarantee exam or
              admissions outcomes.
            </p>
            <div className="mt-2 flex flex-wrap gap-3 font-black">
              <Link href="/privacy-policy" className="text-blue-700 underline">
                Privacy Policy
              </Link>
              <Link href="/phloemai-disclaimer" className="text-blue-700 underline">
                AI/Data Disclaimer
              </Link>
            </div>
          </div>

          <button
            type="button"
            onClick={onStart}
            disabled={progressLoading || questionCount === 0 || trackingStarting}
            className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 text-sm font-black text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            {trackingStarting
              ? "Starting..."
              : diagnosticMode
                ? "Start diagnostic"
                : questionCount === 0
                  ? "No uncompleted questions left"
                  : "Start practice"}
          </button>
        </section>
      </div>
    </div>
  );
}

function getAvailableMockQuestionCount(section: UCATSection) {
  return Math.min(FULL_MOCK_TARGETS[section], UCAT_QUESTION_BANK[section].length);
}

function useMockScoreMatrix(
  scope: Extract<MockStartScope, "full-mock" | "subtest">
) {
  const [scoreMatrix, setScoreMatrix] = useState<MockScoreMatrix>(() =>
    createEmptyMockScoreMatrix()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadScores() {
      setLoading(true);

      try {
        if (!hasSupabaseConfig()) {
          if (mounted) setScoreMatrix(createEmptyMockScoreMatrix());
          return;
        }

        const supabase = createSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (!user) {
          setScoreMatrix(createEmptyMockScoreMatrix());
          return;
        }

        const { data, error } = await supabase
          .from("practice_sessions")
          .select("summary,completed_at,source")
          .eq("user_id", user.id)
          .eq("source", FULL_SECTION_DIAGNOSTIC_SOURCE)
          .order("completed_at", { ascending: false })
          .limit(250);

        if (error) throw error;
        if (mounted) {
          setScoreMatrix(
            buildMockScoreMatrix((data ?? []) as MockScoreSessionRow[], scope)
          );
        }
      } catch (error) {
        console.error("Failed to load full mock score history", error);
        if (mounted) setScoreMatrix(createEmptyMockScoreMatrix());
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadScores();

    return () => {
      mounted = false;
    };
  }, [scope]);

  return { scoreMatrix, loading };
}

function useFullMockScoreMatrix() {
  return useMockScoreMatrix("full-mock");
}

function MockSetPicker({
  selectedMockId,
  baseHref,
  compact = false,
}: {
  selectedMockId: MockId;
  baseHref: string;
  compact?: boolean;
}) {
  return (
    <div className={`grid gap-2.5 ${compact ? "md:grid-cols-3" : "lg:grid-cols-3"}`}>
      {MOCK_LIBRARY.map((mock) => {
        const active = mock.id === selectedMockId;
        return (
          <Link
            key={mock.id}
            href={withMockQuery(baseHref, mock.id)}
            className={`rounded-lg border p-3 transition-colors ${
              active
                ? "border-blue-500 bg-blue-50 text-blue-800"
                : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-black">{mock.label}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {mock.badge}
              </span>
            </div>
            <p className="mt-1.5 text-xs font-bold leading-5 text-slate-500">
              {mock.focus}
            </p>
          </Link>
        );
      })}
    </div>
  );
}

function PremiumDiagnosticChooser({ mockId }: { mockId: MockId }) {
  const totalTarget = FULL_MOCK_SECTION_ORDER.reduce(
    (total, section) => total + FULL_MOCK_TARGETS[section],
    0
  );
  const selectedMock = getMockDefinition(mockId);

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 py-8 text-[#111827]">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/phloemai/diagnostic"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to diagnostics
        </Link>

        <section className="mt-7 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
              Mock library
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">
              Choose a mock
            </h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              Pick the paper first, then sit it as a full sequence, a diagnostic
              section or a single subtest sprint.
            </p>
          </div>

          <div className="mt-7">
            <MockSetPicker
              selectedMockId={mockId}
              baseHref="/phloemai/mocks/full"
            />
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
              Selected paper
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950">
              {selectedMock.label}: {selectedMock.title}
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              {selectedMock.description}
            </p>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {[
              {
                label: "Full mock",
                title: "Whole UCAT sequence",
                text: `VR, DM, QR and SJT in order, ${totalTarget} questions in total.`,
                href: withMockQuery("/phloemai/mocks/full", mockId),
                badgeClass: "bg-slate-950 text-white",
              },
              {
                label: "Diagnostic mock",
                title: "Choose a diagnostic section",
                text:
                  "Run one section with scaled scoring, issue detection and the same pre-start briefing.",
                href: withMockQuery("/phloemai/question-bank?diagnostic=subset", mockId),
                badgeClass: "bg-blue-600 text-white",
              },
              {
                label: "Subtest mock",
                title: "One timed subtest",
                text:
                  "Pick VR, DM, QR or SJT, then use standard timing or the 15-minute sprint.",
                href: withMockQuery("/phloemai/mocks/subtest", mockId),
                badgeClass: "bg-white text-blue-700 ring-1 ring-blue-200",
              },
            ].map((option) => (
              <Link
                key={option.label}
                href={option.href}
                className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/60"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span
                      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${option.badgeClass}`}
                    >
                      {option.label}
                    </span>
                    <h3 className="mt-4 text-lg font-black text-slate-950">
                      {option.title}
                    </h3>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      {option.text}
                    </p>
                  </div>
                  <ArrowRight
                    className="h-5 w-5 shrink-0 text-blue-600 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function MockStatusTabs({
  value,
  onChange,
}: {
  value: MockFilter;
  onChange: (value: MockFilter) => void;
}) {
  const tabs: Array<{ value: MockFilter; label: string }> = [
    { value: "all", label: "All" },
    { value: "continue", label: "Continue" },
    { value: "attempted", label: "Attempted" },
    { value: "unattempted", label: "Unattempted" },
  ];

  return (
    <div className="flex flex-wrap gap-5 border-b border-slate-200 text-xs font-bold text-slate-600">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          aria-pressed={value === tab.value}
          className={`h-9 border-b-2 ${
            value === tab.value
              ? "border-blue-600 text-slate-950"
              : "border-transparent hover:text-slate-900"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function getMockMetricLabel(metric: MockScoreMetric) {
  return metric === "overall" ? "Overall" : getUCATSectionMeta(metric).code;
}

function getMockMetricPoint(
  scoreMatrix: MockScoreMatrix,
  mockId: MockId,
  metric: MockScoreMetric
): MockScoreRecord | null {
  const sectionScores = scoreMatrix[mockId] ?? {};

  if (metric !== "overall") {
    return sectionScores[metric] ?? null;
  }

  const scaledSections = (["vr", "dm", "qr"] as UCATSection[])
    .map((section) => sectionScores[section])
    .filter((record): record is MockScoreRecord => Boolean(record));

  if (scaledSections.length === 0) return null;

  const total = scaledSections.reduce((sum, record) => sum + record.value, 0);
  const latestCompletedAt = scaledSections
    .map((record) => record.completedAt)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

  return {
    value: total,
    display: String(total),
    completedAt: latestCompletedAt,
    accuracy: Math.round(
      scaledSections.reduce((sum, record) => sum + record.accuracy, 0) /
        scaledSections.length
    ),
  };
}

function MockStartPanel({
  selectedMock,
}: {
  selectedMock: (typeof MOCK_LIBRARY)[number];
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
        Standardised paper
      </p>
      <h3 className="mt-1 text-lg font-black text-slate-950">
        Start {selectedMock.label}
      </h3>
      <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">
        Start the standardised paper with VR, then continue through DM, QR and
        SJT.
      </p>
      <Link
        href={withMockQuery("/phloemai/mocks/full/vr", selectedMock.id)}
        className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-md bg-blue-600 px-4 text-xs font-black text-white shadow-sm transition-colors hover:bg-blue-700"
      >
        Start {selectedMock.label}
      </Link>
    </div>
  );
}

function MockScoreGraph({
  selectedMock,
  metric,
  scoreMatrix,
  loading,
}: {
  selectedMock: (typeof MOCK_LIBRARY)[number];
  metric: MockScoreMetric;
  scoreMatrix: MockScoreMatrix;
  loading: boolean;
}) {
  const activeIndex = Math.max(0, getMockIndex(selectedMock.id));
  const isSjt = metric === "sjt";
  const isOverall = metric === "overall";
  const axisLabels = isSjt
    ? ["Band 1", "Band 2", "Band 3", "Band 4"]
    : isOverall
      ? ["2,700", "2,100", "1,500", "900", "0"]
      : ["900", "700", "500", "300", "0"];
  const chartWidth = 420;
  const chartHeight = 190;
  const left = 34;
  const right = 392;
  const top = 18;
  const bottom = 150;
  const maxValue = isOverall ? 2700 : 900;
  const points = MOCK_LIBRARY.map((mock, index) => {
    const score = getMockMetricPoint(scoreMatrix, mock.id, metric);
    const x =
      MOCK_LIBRARY.length === 1
        ? (left + right) / 2
        : left + ((right - left) / (MOCK_LIBRARY.length - 1)) * index;
    const y = score
      ? isSjt
        ? top + ((score.value - 1) / 3) * (bottom - top)
        : bottom - (Math.min(score.value, maxValue) / maxValue) * (bottom - top)
      : null;

    return { mock, score, x, y };
  });
  const plottedPoints = points.filter(
    (point): point is typeof point & { y: number; score: MockScoreRecord } =>
      typeof point.y === "number" && Boolean(point.score)
  );
  const linePoints = plottedPoints
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
  const hasScores = plottedPoints.length > 0;
  const selectedScore = getMockMetricPoint(scoreMatrix, selectedMock.id, metric);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
            {getMockMetricLabel(metric)} score by full mock
          </p>
          <h3 className="mt-1 text-base font-black text-slate-950">
            {selectedScore
              ? `${selectedMock.label}: ${selectedScore.display}`
              : `${selectedMock.label}: no saved score yet`}
          </h3>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
            {isOverall
              ? "Overall is the saved VR + DM + QR scaled total. SJT is shown separately by band."
              : "Each point comes from the latest saved timed section attempt for that mock."}
          </p>
        </div>
        {loading && (
          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-slate-500">
            Loading scores
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[64px_1fr]">
        <div className="flex h-[190px] flex-col justify-between text-right text-[11px] font-bold text-slate-500">
          {axisLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="relative h-[210px]">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = top + ratio * (bottom - top);
              return (
                <line
                  key={ratio}
                  x1={left}
                  x2={right}
                  y1={y}
                  y2={y}
                  stroke="#dbe4ef"
                  strokeWidth="1"
                />
              );
            })}
            <line
              x1={left}
              x2={left}
              y1={top}
              y2={bottom}
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            <line
              x1={left}
              x2={right}
              y1={bottom}
              y2={bottom}
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            {linePoints && plottedPoints.length > 1 && (
              <polyline
                points={linePoints}
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {points.map((point, index) => {
              const active = index === activeIndex;
              return (
                <g key={point.mock.id}>
                  <circle
                    cx={point.x}
                    cy={point.y ?? bottom}
                    r={active ? 6 : 4.5}
                    fill={point.score ? (active ? "#2563eb" : "#93c5fd") : "#e2e8f0"}
                    stroke={active ? "#1d4ed8" : "#cbd5e1"}
                    strokeWidth={active ? 2 : 1}
                  />
                </g>
              );
            })}
          </svg>
          <div className="absolute inset-x-0 bottom-0 grid grid-cols-3 text-center text-[11px] font-black text-slate-600">
            {points.map((point) => (
              <div key={point.mock.id}>
                <p>{point.mock.label}</p>
                <p className="mt-1 text-[10px] font-bold text-slate-400">
                  {point.score?.display ?? "-"}
                </p>
              </div>
            ))}
          </div>
          {!hasScores && !loading && (
            <div className="absolute inset-x-8 top-14 rounded-lg border border-dashed border-slate-300 bg-white/80 px-4 py-5 text-center text-xs font-bold text-slate-500">
              Complete and save a full-mock section to plot your first score.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FullMockPerformancePanel({
  selectedMock,
}: {
  selectedMock: (typeof MOCK_LIBRARY)[number];
}) {
  const [selectedMetric, setSelectedMetric] =
    useState<MockScoreMetric>("overall");
  const { scoreMatrix, loading } = useFullMockScoreMatrix();
  const metrics: MockScoreMetric[] = ["overall", ...FULL_MOCK_SECTION_ORDER];

  return (
    <section className="mt-4">
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-black text-slate-950">
          Score History
        </h2>
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 text-xs font-black text-slate-600">
          {metrics.map((metric) => (
            <button
              key={metric}
              type="button"
              onClick={() => setSelectedMetric(metric)}
              aria-pressed={selectedMetric === metric}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                selectedMetric === metric
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700"
              }`}
            >
              {getMockMetricLabel(metric)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[220px_1fr]">
        <MockStartPanel selectedMock={selectedMock} />
        <MockScoreGraph
          selectedMock={selectedMock}
          metric={selectedMetric}
          scoreMatrix={scoreMatrix}
          loading={loading}
        />
      </div>
    </section>
  );
}

function FullMockDiagnosticOverview({ mockId }: { mockId: MockId }) {
  const [mockFilter, setMockFilter] = useState<MockFilter>("all");
  const selectedMock = getMockDefinition(mockId);
  const totalTarget = FULL_MOCK_SECTION_ORDER.reduce(
    (total, section) => total + FULL_MOCK_TARGETS[section],
    0
  );
  const visibleMocks =
    mockFilter === "continue" || mockFilter === "attempted"
      ? []
      : MOCK_LIBRARY;

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 text-[#111827]">
      <main className="mx-auto max-w-6xl rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-950">Full Mocks</h1>
          <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-500">
            Pick a mock, open a section, and keep the score view tidy as attempts build up.
          </p>
        </div>

        <FullMockPerformancePanel selectedMock={selectedMock} />

        <div className="mt-5">
          <MockStatusTabs value={mockFilter} onChange={setMockFilter} />
        </div>

        <div className="mt-3 space-y-2.5">
          {visibleMocks.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-xs font-bold text-slate-500">
              No full mocks in this filter yet.
            </div>
          ) : visibleMocks.map((mock) => {
            const index = MOCK_LIBRARY.findIndex((item) => item.id === mock.id);
            const active = mock.id === selectedMock.id;
            return (
              <article
                key={mock.id}
                className={`grid gap-3 rounded-md border p-4 transition-colors md:grid-cols-[1fr_auto] md:items-center ${
                  active
                    ? "border-blue-200 bg-blue-50/40"
                    : "border-slate-200 bg-white hover:border-blue-200"
                }`}
              >
                <div>
                  <h2 className="text-sm font-black text-slate-950">
                    Mock {index + 1}
                  </h2>
                  <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-500">
                    {totalTarget} questions across VR, DM, QR and SJT. Start with any section.
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {FULL_MOCK_SECTION_ORDER.map((section) => {
                      const meta = getUCATSectionMeta(section);
                      return (
                        <Link
                          key={section}
                          href={withMockQuery(
                            `/phloemai/mocks/full/${section}`,
                            mock.id
                          )}
                          className="inline-flex h-7 items-center justify-center rounded-md border border-slate-200 bg-white px-2.5 text-xs font-black text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700"
                        >
                          {meta.code}
                        </Link>
                      );
                    })}
                  </div>
                </div>
                <Link
                  href={withMockQuery("/phloemai/mocks/full/vr", mock.id)}
                  className="inline-flex h-9 items-center justify-center rounded-md border border-blue-500 px-5 text-xs font-black text-blue-700 transition-colors hover:bg-blue-600 hover:text-white"
                >
                  {active ? "Continue" : "Start"}
                </Link>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function SubtestMockOverview({ mockId }: { mockId: MockId }) {
  const [activeSection, setActiveSection] = useState<UCATSection>("vr");
  const [mockFilter, setMockFilter] = useState<MockFilter>("all");
  const selectedMock = getMockDefinition(mockId);
  const activeMeta = getUCATSectionMeta(activeSection);
  const { scoreMatrix, loading: scoreLoading } = useMockScoreMatrix("subtest");
  const visibleMocks =
    mockFilter === "continue" || mockFilter === "attempted"
      ? []
      : MOCK_LIBRARY;

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 text-[#111827]">
      <main className="mx-auto max-w-6xl rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-950">Subtest Mocks</h1>
          <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-500">
            Choose one section at a time, then start a compact timed set.
          </p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[180px_1fr]">
          <aside className="space-y-1">
            {UCAT_SECTIONS.map((section) => {
              const active = section.slug === activeSection;
              const Icon = section.slug === "sjt" ? BadgeCheck : BarChart3;
              return (
                <button
                  key={section.slug}
                  type="button"
                  onClick={() => setActiveSection(section.slug)}
                  className={`relative grid w-full grid-cols-[22px_1fr] gap-2.5 rounded-md px-3 py-3 text-left transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-800"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  {active && (
                    <span className="absolute right-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-blue-600" />
                  )}
                  <Icon className="mt-0.5 h-4 w-4" aria-hidden="true" />
                  <span>
                    <span className="block text-xs font-black">
                      {section.code}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-bold text-slate-500">
                      {section.title}
                    </span>
                  </span>
                </button>
              );
            })}
          </aside>

          <section>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-black text-slate-950">
                {activeMeta.title}
              </h2>
              <Link
                href={withMockQuery(
                  `/phloemai/mocks/subtest/${activeSection}`,
                  selectedMock.id
                )}
                className="inline-flex h-9 w-fit items-center justify-center rounded-md bg-blue-600 px-4 text-xs font-black text-white transition-colors hover:bg-blue-700"
              >
                Start {activeMeta.code}
              </Link>
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-black text-slate-950">
                Score History
              </h3>
              <div className="mt-3">
                <MockScoreGraph
                  selectedMock={selectedMock}
                  metric={activeSection}
                  scoreMatrix={scoreMatrix}
                  loading={scoreLoading}
                />
              </div>
            </div>

            <div className="mt-5">
              <MockStatusTabs value={mockFilter} onChange={setMockFilter} />
            </div>

            <div className="mt-3 space-y-2.5">
              {visibleMocks.length === 0 ? (
                <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-xs font-bold text-slate-500">
                  No {activeMeta.code} subtest mocks in this filter yet.
                </div>
              ) : visibleMocks.map((mock) => {
                const index = MOCK_LIBRARY.findIndex((item) => item.id === mock.id);
                const active = mock.id === selectedMock.id;
                return (
                  <article
                    key={mock.id}
                    className={`grid gap-3 rounded-md border p-4 transition-colors md:grid-cols-[1fr_auto] md:items-center ${
                      active
                        ? "border-blue-200 bg-blue-50/40"
                        : "border-slate-200 bg-white hover:border-blue-200"
                    }`}
                  >
                    <div>
                      <h3 className="text-sm font-black text-slate-950">
                        Mock {index + 1}
                      </h3>
                      <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-500">
                        {activeMeta.code} timed set for {activeMeta.title}.
                      </p>
                    </div>
                    <Link
                      href={withMockQuery(
                        `/phloemai/mocks/subtest/${activeSection}`,
                        mock.id
                      )}
                      className="inline-flex h-9 items-center justify-center rounded-md border border-blue-500 px-5 text-xs font-black text-blue-700 transition-colors hover:bg-blue-600 hover:text-white"
                    >
                      {active ? "Continue" : "Start"}
                    </Link>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function DiagnosticModeChooser({
  mode,
  mockId,
}: {
  mode: Extract<DiagnosticMode, "section-mock" | "subset">;
  mockId: MockId;
}) {
  const isSectionMock = mode === "section-mock";
  const selectedMock = getMockDefinition(mockId);
  const title = isSectionMock ? "Choose a subtest mock" : "Custom diagnostic";
  const description = isSectionMock
    ? "Pick a paper, then choose one UCAT section to run under timed mock conditions."
    : "Use the same mock list, choose a section, then select the question types you want to diagnose.";
  const pickerBaseHref = isSectionMock
    ? "/phloemai/mocks/subtest"
    : "/phloemai/question-bank?diagnostic=subset";

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 py-8 text-[#111827]">
      <div className="mx-auto max-w-5xl">
        <Link
          href={isSectionMock ? "/phloemai/mocks/full" : "/phloemai/diagnostic"}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {isSectionMock ? "Back to mock library" : "Back to diagnostics"}
        </Link>

        <section className="mt-7 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                {isSectionMock ? "Subtest mock" : "Custom"}
              </p>
              <h1 className="mt-2 text-3xl font-black text-slate-950">
                {title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
                {description}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Selected paper
              </p>
              <p className="mt-1 text-sm font-black text-slate-950">
                {selectedMock.label}: {selectedMock.focus}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <MockSetPicker
              selectedMockId={mockId}
              baseHref={pickerBaseHref}
              compact
            />
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {UCAT_SECTIONS.map((section) => {
              const available = UCAT_QUESTION_BANK[section.slug].length;
              const target = isSectionMock
                ? getAvailableMockQuestionCount(section.slug)
                : available;
              const officialTarget = FULL_MOCK_TARGETS[section.slug];
              const href = `/phloemai/question-bank/${section.slug}?diagnostic=${
                isSectionMock ? "full-section" : "subset"
              }`;
              const Icon = section.slug === "sjt" ? BadgeCheck : BarChart3;

              return (
                <Link
                  key={section.slug}
                  href={
                    isSectionMock
                      ? withMockQuery(
                          `/phloemai/mocks/subtest/${section.slug}`,
                          mockId
                        )
                      : withMockQuery(href, mockId)
                  }
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/60"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <div>
                        <span className="inline-flex rounded-md bg-blue-600 px-2 py-1 text-xs font-bold text-white">
                          {section.code}
                        </span>
                        <h2 className="mt-3 text-lg font-black">
                          {section.title}
                        </h2>
                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                          {isSectionMock
                            ? `${officialTarget} question target${target < officialTarget ? `, ${target} available now` : ""}.`
                            : `Choose one or more question types from ${selectedMock.label}.`}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0 text-blue-600" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function getSectionBriefing(section: UCATSection) {
  if (section === "vr") {
    return {
      heading: "Verbal Reasoning notes",
      intro:
        "You will read short passages and answer questions using only what is supported by the text.",
      bullets: [
        "Some items ask whether a statement follows from the passage; others ask for the best supported option.",
        "Do not use outside knowledge if it conflicts with the wording in front of you.",
        "Unanswered questions are treated as incorrect when the section is marked.",
      ],
    };
  }

  if (section === "dm") {
    return {
      heading: "Decision Making notes",
      intro:
        "Questions may use text, tables, simple charts or logic conditions. Read each prompt carefully before answering.",
      bullets: [
        "Some questions have one best option; others ask you to judge several statements one by one.",
        "Assume each standalone question has all the information needed unless it clearly refers to shared data.",
        "There is no guessing penalty, so make a selection before moving on whenever you can.",
      ],
    };
  }

  if (section === "qr") {
    return {
      heading: "Quantitative Reasoning notes",
      intro:
        "You will solve numerical problems using the information shown in the question, table or chart.",
      bullets: [
        "Use the calculator when it saves time, but estimate where the answer choices make that faster.",
        "Check units and labels before committing to multi-step calculations.",
        "Every blank answer is marked as incorrect at the end of the section.",
      ],
    };
  }

  return {
    heading: "Situational Judgement notes",
    intro:
      "You will judge professional scenarios and choose the response that best matches safe, respectful practice.",
    bullets: [
      "Some questions ask how appropriate an action is; others ask how important a consideration is.",
      "Answer as a medical or dental applicant acting within your role, not as a qualified clinician.",
      "Use the information given in the scenario and avoid adding assumptions that are not stated.",
    ],
  };
}

function MockStartBriefing({
  section,
  questionCount,
  seconds,
  scope,
  mock,
}: {
  section: UCATSection;
  questionCount: number;
  seconds: number;
  scope: MockStartScope;
  mock?: (typeof MOCK_LIBRARY)[number];
}) {
  const meta = getUCATSectionMeta(section);
  const briefing = getSectionBriefing(section);
  const baseScopeLabel =
    scope === "full-mock"
      ? "Full mock section"
      : scope === "subtest"
        ? "Subtest mock"
        : scope === "free"
          ? "Free diagnostic"
          : "Diagnostic";
  const scopeLabel = mock ? `${mock.label} / ${baseScopeLabel}` : baseScopeLabel;

  return (
    <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-blue-700">
            Before you start
          </p>
          <h2 className="mt-2 text-xl font-black text-slate-950">
            {briefing.heading}
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
            {scope === "full-mock"
              ? `${mock?.label ?? "This mock"} continues with ${meta.title}. Read this screen first; the section timer starts only after you press Start.`
              : `${mock ? `${mock.label}: ` : ""}${briefing.intro}`}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs font-black text-slate-700 sm:min-w-[22rem]">
          {[
            ["Mode", scopeLabel],
            ["Questions", String(questionCount)],
            ["Time", formatReadableDuration(seconds)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-1 text-slate-950">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-black text-slate-950">
            {briefing.intro}
          </p>
          <ul className="mt-3 space-y-2 text-sm font-semibold leading-6 text-slate-600">
            {briefing.bullets.map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-950">
          <p className="font-black uppercase tracking-wide">
            Timing reminder
          </p>
          <p className="mt-2">
            The clock keeps running once the section begins. You can use Help,
            flagging and calculator controls during the attempt, but they do not
            pause the timer.
          </p>
        </div>
      </div>
    </div>
  );
}

function FixedDiagnosticStartScreen({
  title,
  subtitle,
  section,
  questionCount,
  seconds,
  timingMode,
  onTimingModeChange,
  backHref = "/phloemai/diagnostic",
  backLabel = "Back to diagnostics",
  lockedNotice,
  loading,
  showAiCredit,
  mock,
  scope = "diagnostic",
  onStart,
}: {
  title: string;
  subtitle: string;
  section: UCATSection;
  questionCount: number;
  seconds: number;
  timingMode?: SectionMockTimingMode;
  onTimingModeChange?: (mode: SectionMockTimingMode) => void;
  backHref?: string;
  backLabel?: string;
  lockedNotice?: string;
  loading?: boolean;
  showAiCredit?: boolean;
  mock?: (typeof MOCK_LIBRARY)[number];
  scope?: MockStartScope;
  onStart: () => void;
}) {
  const meta = getUCATSectionMeta(section);
  const showTimingOptions = Boolean(timingMode && onTimingModeChange);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef3fb] via-[#f5f8fc] to-white px-4 py-10 text-[#111827]">
      <div className="mx-auto max-w-4xl">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Link>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
          <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50 via-white to-white px-7 pb-7 pt-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="inline-flex rounded-md bg-blue-600 px-3 py-1 text-sm font-black tracking-wide text-white shadow-sm">
                  {meta.code}
                </span>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  {title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
                  {subtitle}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-right text-sm font-black text-slate-900 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                  Length
                </p>
                <p className="mt-1 text-lg">
                  {questionCount} questions
                </p>
                <p className="text-xs font-bold text-slate-500">
                  {formatDuration(seconds)}
                </p>
              </div>
            </div>
          </div>

          <div className="px-7 pt-6">
            <div className={`grid gap-3 ${showAiCredit ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}>
              {[
                ["Mode", scope === "full-mock" ? "Full mock" : scope === "subtest" ? "Subtest mock" : "Timed diagnostic"],
                ["Report", "Issues + study plan"],
                ["Scoring", section === "sjt" ? "Band 1-4" : "300-900 estimate"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                >
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-900">
                    {value}
                  </p>
                </div>
              ))}
              {showAiCredit && (
                <div className="rounded-lg border border-violet-200 bg-violet-50 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-violet-700">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    AI feedback
                  </p>
                  <p className="mt-1 text-sm font-black text-violet-900">
                    1 free credit
                  </p>
                </div>
              )}
            </div>

            <MockStartBriefing
              section={section}
              questionCount={questionCount}
              seconds={seconds}
              scope={scope}
              mock={mock}
            />
          </div>

          <div className="px-7 pb-7">

          {showTimingOptions && (
            <div className="mt-6">
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">
                Timing
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {([
                  {
                    mode: "official",
                    label: "Official section timing",
                    helper: `${formatReadableDuration(
                      getOfficialSectionSeconds(section, questionCount)
                    )} for this section.`,
                    badge: "Recommended",
                  },
                  {
                    mode: "short",
                    label: "15-minute subset mock",
                    helper:
                      "Short sprint for a quick read. Not recommended for your baseline.",
                    badge: "Not recommended",
                  },
                ] as const).map((option) => {
                  const active = timingMode === option.mode;
                  return (
                    <button
                      key={option.mode}
                      type="button"
                      onClick={() => onTimingModeChange?.(option.mode)}
                      aria-pressed={active}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        active
                          ? "border-blue-500 bg-blue-50 text-blue-800"
                          : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black">{option.label}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            option.mode === "official"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {option.badge}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">
                        {option.helper}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {lockedNotice && (
            <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-black leading-6 text-amber-900">
              {lockedNotice}
            </p>
          )}

          <button
            type="button"
            onClick={onStart}
            disabled={loading}
            className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 text-sm font-black text-white shadow-md shadow-blue-100 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            {loading ? "Checking..." : "Start diagnostic"}
          </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function formatMsAsSeconds(ms: number | null) {
  if (!ms || ms <= 0) return "Not captured";
  return `${Math.round(ms / 1000)}s`;
}

function formatAnswerChoiceTiming(item: PracticeQuestionSummary) {
  const firstChoice = formatMsAsSeconds(item.firstAnsweredAtMs);
  const finalChoice = formatMsAsSeconds(item.answeredAtMs);

  if (firstChoice === "Not captured" && finalChoice === "Not captured") {
    return "Not captured";
  }

  if (firstChoice === finalChoice || item.answerSwitches === 0) {
    return `Chosen at ${finalChoice}`;
  }

  return `First choice at ${firstChoice}; final choice at ${finalChoice}`;
}

function formatInputGap(ms: number) {
  if (ms <= 0) return "Not enough inputs";
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function formatAnswerPath(item: PracticeQuestionSummary) {
  if (item.answerPath.length === 0) return "No answer selected";

  return item.answerPath
    .map((entry) => {
      const status = entry.correct ? "correct" : "wrong";
      return `${entry.answer || entry.answerText} (${status}, ${entry.source}, ${entry.atSeconds}s)`;
    })
    .join(" -> ");
}

function DataPoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-300 bg-white px-3 py-2 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
    </div>
  );
}

type VisibleDataPoint = {
  label: string;
  value: string;
  show: boolean;
};

function QuestionDataCollectedPanel({
  item,
  compact = false,
}: {
  item: PracticeQuestionSummary;
  compact?: boolean;
}) {
  const memoryTotal =
    item.calculator.memoryRecall +
    item.calculator.memoryClear +
    item.calculator.memoryMinus +
    item.calculator.memoryPlus;
  const regionTime = `${item.regionActivity.stimulusSeconds}s stimulus, ${item.regionActivity.questionSeconds}s question, ${item.regionActivity.answerSeconds}s answers`;
  const shortcutLabels =
    item.shortcuts.labels.length > 0 ? item.shortcuts.labels.join(", ") : "None";
  const hasCalculatorInput =
    item.calculator.keyboardPresses > 0 || item.calculator.buttonPresses > 0;
  const hasCalculatorActions =
    item.calculator.digitPresses > 0 ||
    item.calculator.operators > 0 ||
    item.calculator.backspaces > 0;
  const hasRegionTime =
    item.regionActivity.stimulusSeconds > 0 ||
    item.regionActivity.questionSeconds > 0 ||
    item.regionActivity.answerSeconds > 0;
  const hasInterfaceEvents =
    item.otherData.explanationToggles > 0 ||
    item.otherData.flagToggles > 0 ||
    item.otherData.navigatorOpens > 0 ||
    item.otherData.reviewOpens > 0 ||
    item.otherData.colourSchemeChanges > 0;
  const dataPoints: VisibleDataPoint[] = [
    {
      label: "Timing",
      value: `${item.totalSeconds}s total, ${item.visits} visit${item.visits === 1 ? "" : "s"}`,
      show: item.totalSeconds > 0 || item.visits > 0,
    },
    {
      label: "Answer choice timing",
      value: formatAnswerChoiceTiming(item),
      show: item.firstAnsweredAtMs !== null || item.answeredAtMs !== null,
    },
    {
      label: "Answer path",
      value: formatAnswerPath(item),
      show: item.answerPath.length > 0,
    },
    {
      label: "Answer changes",
      value: `${item.answerSwitches} switch${item.answerSwitches === 1 ? "" : "es"}; ${item.changedFromCorrect ? "right to wrong" : item.changedToCorrect ? "wrong to right" : "no correctness flip"}`,
      show: item.answerSwitches > 0 || item.changedFromCorrect || item.changedToCorrect,
    },
    {
      label: "Region flips",
      value: `${item.regionActivity.totalSwitches} switches; ${item.regionActivity.questionAnswerFlips} Q/answer flips`,
      show:
        item.regionActivity.totalSwitches > 0 ||
        item.regionActivity.questionAnswerFlips > 0 ||
        item.regionActivity.stimulusQuestionFlips > 0 ||
        item.regionActivity.stimulusAnswerFlips > 0,
    },
    {
      label: "Region time",
      value: regionTime,
      show: hasRegionTime,
    },
    {
      label: "Calculator input",
      value: `${item.calculator.keyboardPresses} keyboard, ${item.calculator.buttonPresses} button`,
      show: hasCalculatorInput,
    },
    {
      label: "Calculator speed",
      value: `Avg ${formatInputGap(item.calculator.avgInputGapMs)}, fastest ${formatInputGap(item.calculator.fastestInputGapMs)}`,
      show: item.calculator.avgInputGapMs > 0 || item.calculator.fastestInputGapMs > 0,
    },
    {
      label: "Memory buttons",
      value: `${memoryTotal} total: MRC ${item.calculator.memoryRecall + item.calculator.memoryClear}, M- ${item.calculator.memoryMinus}, M+ ${item.calculator.memoryPlus}`,
      show: memoryTotal > 0,
    },
    {
      label: "Calculator actions",
      value: `${item.calculator.digitPresses} digits, ${item.calculator.operators} operators, ${item.calculator.backspaces} backspaces`,
      show: hasCalculatorActions,
    },
    {
      label: "Shortcuts",
      value: `${item.shortcuts.total} events: ${shortcutLabels}`,
      show: item.shortcuts.total > 0,
    },
    {
      label: "Interface",
      value: `${item.otherData.explanationToggles} explain toggles, ${item.otherData.flagToggles} flag toggles`,
      show: hasInterfaceEvents,
    },
  ];
  const visibleDataPoints = dataPoints.filter((point) => point.show);

  if (visibleDataPoints.length === 0) return null;

  return (
    <div className="mt-4 rounded-md border border-slate-300 bg-slate-100 p-4">
      <h3 className="text-sm font-black text-slate-900">Data collected:</h3>
      <div
        className={`mt-3 grid gap-3 ${
          compact ? "sm:grid-cols-2" : "md:grid-cols-3"
        }`}
      >
        {visibleDataPoints.map((point) => (
          <DataPoint key={point.label} label={point.label} value={point.value} />
        ))}
      </div>
    </div>
  );
}

function SessionDataCollectedPanel({ summary }: { summary: PracticeSessionSummary }) {
  const memoryTotal =
    summary.calculator.memoryRecall +
    summary.calculator.memoryClear +
    summary.calculator.memoryMinus +
    summary.calculator.memoryPlus;
  const hasCalculatorInput =
    summary.calculator.keyboardPresses > 0 || summary.calculator.buttonPresses > 0;
  const hasCalculatorSpeed =
    summary.calculator.buttonAvgGapMs > 0 ||
    summary.calculator.keyboardAvgGapMs > 0 ||
    summary.calculator.avgInputGapMs > 0;
  const hasRegionActivity =
    summary.regionActivity.totalSwitches > 0 ||
    summary.regionActivity.snapshots > 0 ||
    summary.regionActivity.stimulusSeconds > 0 ||
    summary.regionActivity.questionSeconds > 0 ||
    summary.regionActivity.answerSeconds > 0;
  const hasInterfaceActivity =
    summary.shortcuts.total > 0 ||
    summary.otherData.reviewOpens > 0 ||
    summary.otherData.navigatorOpens > 0 ||
    summary.otherData.explanationToggles > 0 ||
    summary.otherData.flagToggles > 0 ||
    summary.otherData.colourSchemeChanges > 0;
  const shortcutLabels =
    summary.shortcuts.labels.length > 0
      ? summary.shortcuts.labels.join(", ")
      : "None used";

  const sections = [
    {
      title: "Timing",
      points: [
        {
          label: "Total time",
          value: formatDuration(summary.totalSeconds),
          show: summary.totalSeconds > 0,
        },
        {
          label: "Average per question",
          value: `${summary.avgSecondsPerQuestion}s`,
          show: summary.avgSecondsPerQuestion > 0,
        },
        {
          label: "Timed mode",
          value: formatDuration(summary.setSeconds),
          show: summary.timed,
        },
        {
          label: "Time remaining",
          value: formatDuration(summary.secondsRemaining),
          show: summary.timed,
        },
      ],
    },
    {
      title: "Answer Behaviour",
      points: [
        {
          label: "Answered",
          value: `${summary.answeredQuestions}/${summary.totalQuestions}`,
          show: summary.answeredQuestions > 0,
        },
        {
          label: "Answer switches",
          value: String(summary.answerSwitches),
          show: summary.answerSwitches > 0,
        },
        {
          label: "Wrong to right",
          value: String(summary.changedToCorrect),
          show: summary.changedToCorrect > 0,
        },
        {
          label: "Right to wrong",
          value: String(summary.changedFromCorrect),
          show: summary.changedFromCorrect > 0,
        },
      ],
    },
    {
      title: "Attention Regions",
      points: [
        {
          label: "Tracking mode",
          value: summary.trackingMode,
          show: summary.trackingMode !== "none" && hasRegionActivity,
        },
        {
          label: "Region switches",
          value: String(summary.regionActivity.totalSwitches),
          show: summary.regionActivity.totalSwitches > 0,
        },
        {
          label: "Stimulus/question flips",
          value: String(summary.regionActivity.stimulusQuestionFlips),
          show: summary.regionActivity.stimulusQuestionFlips > 0,
        },
        {
          label: "Question/answer flips",
          value: String(summary.regionActivity.questionAnswerFlips),
          show: summary.regionActivity.questionAnswerFlips > 0,
        },
        {
          label: "Stimulus/answer flips",
          value: String(summary.regionActivity.stimulusAnswerFlips),
          show: summary.regionActivity.stimulusAnswerFlips > 0,
        },
        {
          label: "Region time",
          value: `${summary.regionActivity.stimulusSeconds}s stimulus, ${summary.regionActivity.questionSeconds}s question, ${summary.regionActivity.answerSeconds}s answers`,
          show:
            summary.regionActivity.stimulusSeconds > 0 ||
            summary.regionActivity.questionSeconds > 0 ||
            summary.regionActivity.answerSeconds > 0,
        },
      ],
    },
    {
      title: "Calculator",
      points: [
        {
          label: "Opens",
          value: String(summary.calculator.opens),
          show: summary.calculator.opens > 0,
        },
        {
          label: "Input source",
          value: `${summary.calculator.keyboardPresses} keyboard, ${summary.calculator.buttonPresses} button`,
          show: hasCalculatorInput,
        },
        {
          label: "Button speed",
          value: `Avg ${formatInputGap(summary.calculator.buttonAvgGapMs)}`,
          show: summary.calculator.buttonAvgGapMs > 0,
        },
        {
          label: "Keyboard speed",
          value: `Avg ${formatInputGap(summary.calculator.keyboardAvgGapMs)}`,
          show: summary.calculator.keyboardAvgGapMs > 0,
        },
        {
          label: "Average input gap",
          value: formatInputGap(summary.calculator.avgInputGapMs),
          show: hasCalculatorSpeed,
        },
        {
          label: "Operators",
          value: String(summary.calculator.operators),
          show: summary.calculator.operators > 0,
        },
        {
          label: "Memory button usage",
          value: `${memoryTotal} total: MRC ${summary.calculator.memoryRecall + summary.calculator.memoryClear}, M- ${summary.calculator.memoryMinus}, M+ ${summary.calculator.memoryPlus}`,
          show: memoryTotal > 0,
        },
        {
          label: "Calculation pauses",
          value: `${summary.calculator.pauses} pauses over ${summary.calculator.pauseThresholdSeconds}s`,
          show: summary.calculator.pauses > 0,
        },
      ],
    },
    {
      title: "Shortcuts And Interface",
      points: [
        {
          label: "Shortcut events",
          value: String(summary.shortcuts.total),
          show: summary.shortcuts.total > 0,
        },
        {
          label: "Shortcut labels",
          value: shortcutLabels,
          show: summary.shortcuts.labels.length > 0,
        },
        {
          label: "Answer keys",
          value: String(summary.shortcuts.answerKeys),
          show: summary.shortcuts.answerKeys > 0,
        },
        {
          label: "Navigation shortcuts",
          value: String(summary.shortcuts.navigation),
          show: summary.shortcuts.navigation > 0,
        },
        {
          label: "Review opens",
          value: String(summary.otherData.reviewOpens),
          show: summary.otherData.reviewOpens > 0,
        },
        {
          label: "Navigator opens",
          value: String(summary.otherData.navigatorOpens),
          show: summary.otherData.navigatorOpens > 0,
        },
        {
          label: "Explanation toggles",
          value: String(summary.otherData.explanationToggles),
          show: summary.otherData.explanationToggles > 0,
        },
        {
          label: "Flag toggles",
          value: String(summary.otherData.flagToggles),
          show: summary.otherData.flagToggles > 0,
        },
        {
          label: "Colour changes",
          value: String(summary.otherData.colourSchemeChanges),
          show: summary.otherData.colourSchemeChanges > 0,
        },
      ],
    },
  ].map((section) => ({
    ...section,
    points: section.points.filter((point) => point.show),
  })).filter((section) => section.points.length > 0);

  if (!hasInterfaceActivity && sections.length === 0) return null;

  return (
    <section className="rounded-md border border-slate-400 bg-white p-5 shadow-md">
      <h2 className="text-lg font-black">Whole set data collected</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {sections.map((section) => (
          <div key={section.title} className="rounded-md border border-slate-300 bg-slate-100 p-4">
            <h3 className="text-sm font-black text-slate-900">{section.title}</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {section.points.map((point) => (
                <DataPoint
                  key={point.label}
                  label={point.label}
                  value={point.value}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

type MarkedIssueDetail = {
  label: string;
  cause: string;
  evidence: string[];
  fix: string;
  studyFixes?: string[];
};

type MarkedSessionInsights = {
  issues: MarkedIssueDetail[];
  strengths: string[];
};

type WeakSubtypeSignal = {
  rule: SubtypeWeaknessRule;
  label: string;
};

type StudyPlanTask = {
  id: string;
  label: string;
  fix: string;
};

const TARGETED_DRILL_SETS = 5;
const TARGETED_DRILL_MINUTES = 7;
const CALCULATOR_SPEED_TRAINER_FIX = "15 minutes of calculator speed trainer.";
const CALCULATOR_HEAVY_DRILL_FIX =
  "Complete 5 x 7-minute calculator-heavy QR drill sets until they feel controlled at pace.";
const CONFIDENCE_RULE_FIX =
  "Use the confidence rule: only change an answer when you can name new evidence.";
const FLAGGING_TRAINER_FIX =
  "Use the flagging trainer to spot hard questions sooner.";

function joinHumanList(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function formatDrillTargetPct(pct: number) {
  const roundedPct = Math.ceil(pct / 5) * 5;

  return Number.isInteger(roundedPct) ? String(roundedPct) : roundedPct.toFixed(1);
}

function nextMarkPctFromRule(rule: SubtypeWeaknessRule) {
  if (typeof rule.minorAtOrBelowPct !== "number") return null;

  const match = rule.minorText.match(/(\d+)\/(\d+)/);
  if (!match) return null;

  const score = Number(match[1]);
  const maxScore = Number(match[2]);
  if (!Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore <= 0) {
    return null;
  }

  const weaknessPct = (score / maxScore) * 100;
  if (Math.abs(weaknessPct - rule.minorAtOrBelowPct) > 1) return null;

  return ((score + 1) / maxScore) * 100;
}

function drillTargetText(rule: SubtypeWeaknessRule) {
  if (rule.subtype === "qr-calculator-strategy") return "85% or above";

  if (typeof rule.minorBelowPct === "number") {
    return `${formatDrillTargetPct(rule.minorBelowPct)}% or above`;
  }

  if (typeof rule.minorAtOrBelowPct === "number") {
    const nextMarkPct = nextMarkPctFromRule(rule);
    if (nextMarkPct !== null) {
      return `${formatDrillTargetPct(nextMarkPct)}% or above`;
    }

    return `above ${formatDrillTargetPct(rule.minorAtOrBelowPct)}%`;
  }

  const fallbackPct =
    rule.majorAtOrBelowPct ?? rule.repeatMajorAtOrBelowPct ?? 70;
  return `above ${formatDrillTargetPct(fallbackPct)}%`;
}

function formatSubtypeTargetList(weakSubtypes: WeakSubtypeSignal[]) {
  return joinHumanList(
    weakSubtypes.map((item) => `${item.label}: ${drillTargetText(item.rule)}`)
  );
}

function buildSubtypeDrillFix(weakSubtypes: WeakSubtypeSignal[]) {
  if (weakSubtypes.length === 1) {
    const item = weakSubtypes[0];
    return `Complete ${TARGETED_DRILL_SETS} x ${TARGETED_DRILL_MINUTES}-minute ${item.label} drill sets until you are consistently ${drillTargetText(item.rule)}.`;
  }

  return `Complete ${TARGETED_DRILL_SETS} x ${TARGETED_DRILL_MINUTES}-minute drill sets for each weak type: ${formatSubtypeTargetList(weakSubtypes)}.`;
}

function expectedPacingSpread(summary: PracticeSessionSummary) {
  const timedQuestions = summary.questions.filter(
    (question) => question.totalSeconds > 0
  );
  if (timedQuestions.length < 2) return false;

  const maxQuestionTime = Math.max(
    ...timedQuestions.map((question) => question.totalSeconds)
  );
  const minQuestionTime = Math.min(
    ...timedQuestions.map((question) => question.totalSeconds)
  );
  const slowQuestions = timedQuestions.filter(
    (question) => question.totalSeconds === maxQuestionTime
  );
  const fastQuestions = timedQuestions.filter(
    (question) => question.totalSeconds === minQuestionTime
  );
  const slowWasExpected = slowQuestions.some((question) =>
    question.questionTags.some((tag) =>
      ["hard", "time-consuming", "multi-step", "calculator-heavy"].includes(tag)
    )
  );
  const fastWasExpected = fastQuestions.some((question) =>
    question.questionTags.some((tag) => ["easy", "quick"].includes(tag))
  );

  return slowWasExpected && fastWasExpected;
}

function buildStudyPlanTasks(issues: MarkedIssueDetail[]) {
  const seen = new Set<string>();
  const tasks: StudyPlanTask[] = [];

  issues.forEach((issue) => {
    const fixes = issue.studyFixes ?? [issue.fix];
    fixes.forEach((fix) => {
      const normalisedFix = fix.trim();
      if (!normalisedFix || seen.has(normalisedFix)) return;
      seen.add(normalisedFix);
      tasks.push({
        id: `${issue.label}-${tasks.length}`,
        label: issue.label,
        fix: normalisedFix,
      });
    });
  });

  return tasks;
}

function getEstimatedScaledScore(points: number, maxPoints: number) {
  if (maxPoints <= 0) return 300;

  const pct = Math.max(0, Math.min(1, points / maxPoints));
  return Math.max(300, Math.min(900, Math.round((300 + pct * 600) / 10) * 10));
}

function getSjtBand(points: number, maxPoints: number) {
  if (maxPoints <= 0) return 4;

  const pct = (points / maxPoints) * 100;
  if (pct >= 75) return 1;
  if (pct >= 60) return 2;
  if (pct >= 40) return 3;
  return 4;
}

function getDiagnosticSectionScore(
  summary: PracticeSessionSummary
): DiagnosticSectionScore {
  const rawScore = summary.scorePoints;
  const maxScore = summary.maxScore;
  const accuracy = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;

  if (summary.section === "sjt") {
    const band = getSjtBand(rawScore, maxScore);
    return {
      label: "SJT band",
      value: `Band ${band}`,
      helper: "Estimated from your partial-credit SJT score.",
      metadata: {
        rawScore,
        maxScore,
        accuracy,
        scaledScore: null,
        sjtBand: band,
      },
    };
  }

  const scaledScore = getEstimatedScaledScore(rawScore, maxScore);
  return {
    label: "Estimated scaled score",
    value: String(scaledScore),
    helper: "Approximate 300-900 scaling from this diagnostic set.",
    metadata: {
      rawScore,
      maxScore,
      accuracy,
      scaledScore,
      sjtBand: null,
    },
  };
}

function buildSubtypeWeaknessIssue(
  summary: PracticeSessionSummary
): MarkedIssueDetail | null {
  const weakSubtypes = SUBTYPE_WEAKNESS_RULES.filter(
    (rule) => rule.section === summary.section
  ).flatMap((rule) => {
    const questions = summary.questions.filter(
      (question) => question.subtype === rule.subtype
    );
    const maxScore = questions.reduce((sum, question) => sum + question.maxScore, 0);

    if (questions.length === 0 || maxScore === 0) return [];

    const scorePoints = questions.reduce(
      (sum, question) => sum + question.scorePoints,
      0
    );
    const pct = (scorePoints / maxScore) * 100;
    const severity = getSubtypeWeaknessSeverity(rule, pct);

    if (!severity) return [];

    return [
      {
        rule,
        severity,
        label: rule.label,
        questionCount: questions.length,
        scorePoints,
        maxScore,
        pct: Math.round(pct),
      },
    ];
  });

  if (weakSubtypes.length === 0) return null;

  const typeList = weakSubtypes.map((item) => item.label).join(", ");
  const fix = buildSubtypeDrillFix(weakSubtypes);

  return {
    label: "Specific question type weakness(es) detected",
    cause: `Your losses are concentrated in ${typeList}. Borderline signals are treated as minor, while repeated clearly-below-borderline signals should become major diagnostic issues.`,
    evidence: weakSubtypes.map(
      (item) =>
        `${item.label}: ${formatMarkScore(item.scorePoints, item.maxScore)} (${item.pct}%) from ${item.questionCount} question${item.questionCount === 1 ? "" : "s"}; ${item.severity} weakness signal; usual benchmark ${item.rule.expectedMarkText}; ${item.rule.minorText}. ${item.rule.repeatMajorText}`
    ),
    fix,
    studyFixes: weakSubtypes.map((item) => buildSubtypeDrillFix([item])),
  };
}

function buildQrTimingWeaknessIssue(
  summary: PracticeSessionSummary
): MarkedIssueDetail | null {
  if (summary.section !== "qr") return null;

  const calculatorHeavyQuestions = summary.questions.filter((question) =>
    question.questionTags.includes("calculator-heavy")
  );
  const timedQuestions = calculatorHeavyQuestions.filter(
    (question) => question.totalSeconds > 0
  );

  if (timedQuestions.length === 0) return null;

  const slowThresholdSeconds = 70;
  const verySlowThresholdSeconds = 90;
  const avgSeconds = Math.round(
    timedQuestions.reduce((sum, question) => sum + question.totalSeconds, 0) /
      timedQuestions.length
  );
  const slowCount = timedQuestions.filter(
    (question) => question.totalSeconds >= slowThresholdSeconds
  ).length;
  const verySlowCount = timedQuestions.filter(
    (question) => question.totalSeconds >= verySlowThresholdSeconds
  ).length;
  const keyboardGapSamples = timedQuestions
    .map((question) => question.calculator.keyboardAvgGapMs)
    .filter((gap) => gap > 0);
  const avgKeyboardGap =
    keyboardGapSamples.length > 0
      ? Math.round(
          keyboardGapSamples.reduce((sum, gap) => sum + gap, 0) /
            keyboardGapSamples.length
        )
      : 0;
  const timingWeakness =
    (timedQuestions.length >= 2 && avgSeconds >= slowThresholdSeconds) ||
    verySlowCount >= 2 ||
    (timedQuestions.length === 1 &&
      timedQuestions[0].totalSeconds >= verySlowThresholdSeconds + 10);

  if (!timingWeakness) return null;

  const evidence = [
    `Calculator-heavy QR averaged ${avgSeconds}s; target is under ${slowThresholdSeconds}s, with strong QR aiming closer to 40-60s where possible.`,
    `${slowCount}/${timedQuestions.length} calculator-heavy question${timedQuestions.length === 1 ? "" : "s"} took ${slowThresholdSeconds}s or more.`,
    `${verySlowCount}/${timedQuestions.length} took ${verySlowThresholdSeconds}s or more.`,
  ];

  if (avgKeyboardGap > 0) {
    evidence.push(
      `Average keyboard-calculator input gap was ${avgKeyboardGap}ms; if typing speed is already strong, the bottleneck is likely setup, expression planning or re-entry.`
    );
  }

  return {
    label: "Calculator-heavy QR timing weakness detected",
    cause:
      "Calculator-heavy QR questions are taking too long relative to the section pace. This usually points to setup, calculation planning, re-entry or choosing calculation when estimation would be faster.",
    evidence,
    fix: CALCULATOR_HEAVY_DRILL_FIX,
    studyFixes: [CALCULATOR_HEAVY_DRILL_FIX],
  };
}

function buildSjtIssueTagWeaknessIssue(
  summary: PracticeSessionSummary
): MarkedIssueDetail | null {
  if (summary.section !== "sjt") return null;

  const issueMap = new Map<
    UCATSjtIssueTag,
    { scorePoints: number; maxScore: number; questions: number }
  >();

  summary.questions.forEach((question) => {
    question.issueTags.forEach((issueTag) => {
      const current = issueMap.get(issueTag) ?? {
        scorePoints: 0,
        maxScore: 0,
        questions: 0,
      };
      current.scorePoints += question.scorePoints;
      current.maxScore += question.maxScore;
      current.questions += 1;
      issueMap.set(issueTag, current);
    });
  });

  const weakThemes = Array.from(issueMap.entries()).flatMap(
    ([issueTag, item]) => {
      if (item.questions < 2 || item.maxScore <= 0) return [];

      const pct = (item.scorePoints / item.maxScore) * 100;
      if (pct > 70) return [];

      return [
        {
          issueTag,
          label: getUCATSjtIssueLabel(issueTag),
          scorePoints: item.scorePoints,
          maxScore: item.maxScore,
          questions: item.questions,
          pct: Math.round(pct),
          severity: pct <= 50 ? "major" : "minor",
        },
      ];
    }
  );

  if (weakThemes.length === 0) return null;

  const themeList = weakThemes.map((item) => item.label).join(", ");
  const fix = `Drill similar SJT scenarios for ${themeList}.`;

  return {
    label: "SJT judgement theme weakness(es) detected",
    cause: `Your SJT losses cluster around ${themeList}. Timing is not being treated as the issue here; this is about judgement themes.`,
    evidence: weakThemes.map(
      (item) =>
        `${item.label}: ${formatMarkScore(item.scorePoints, item.maxScore)} (${item.pct}%) across ${item.questions} tagged question${item.questions === 1 ? "" : "s"}; ${item.severity} theme signal.`
    ),
    fix,
    studyFixes: weakThemes.map(
      (theme) => `Drill similar SJT scenarios for ${theme.label}.`
    ),
  };
}

function buildMarkedSessionInsights(
  summary: PracticeSessionSummary
): MarkedSessionInsights {
  const memoryTotal =
    summary.calculator.memoryRecall +
    summary.calculator.memoryClear +
    summary.calculator.memoryMinus +
    summary.calculator.memoryPlus;
  const totalVisits = summary.questions.reduce(
    (sum, question) => sum + question.visits,
    0
  );
  const questionTimes = summary.questions
    .map((question) => question.totalSeconds)
    .filter((seconds) => seconds > 0);
  const maxQuestionTime = questionTimes.length > 0 ? Math.max(...questionTimes) : 0;
  const minQuestionTime = questionTimes.length > 0 ? Math.min(...questionTimes) : 0;
  const incorrectQuestions = summary.totalQuestions - summary.correctQuestions;
  const issues: MarkedIssueDetail[] = [];
  const addIssue = (
    label: string,
    cause: string,
    evidence: string[],
    fix: string,
    studyFixes?: string[]
  ) => {
    issues.push({
      label,
      cause,
      evidence,
      fix,
      studyFixes: studyFixes ?? (fix ? [fix] : []),
    });
  };
  const subtypeWeaknessIssue = buildSubtypeWeaknessIssue(summary);
  const qrTimingWeaknessIssue = buildQrTimingWeaknessIssue(summary);
  const sjtIssueTagWeaknessIssue = buildSjtIssueTagWeaknessIssue(summary);

  if (subtypeWeaknessIssue) {
    issues.push(subtypeWeaknessIssue);
  }
  if (qrTimingWeaknessIssue) {
    issues.push(qrTimingWeaknessIssue);
  }
  if (sjtIssueTagWeaknessIssue) {
    issues.push(sjtIssueTagWeaknessIssue);
  }

  if (summary.calculator.opens > 0) {
    const calculatorCauses: string[] = [];
    const calculatorEvidence = [
      `${summary.calculator.opens} calculator open${summary.calculator.opens === 1 ? "" : "s"}`,
      `${summary.calculator.pauses} pause${summary.calculator.pauses === 1 ? "" : "s"} over ${summary.calculator.pauseThresholdSeconds}s`,
      `${summary.calculator.backspaces} backspace${summary.calculator.backspaces === 1 ? "" : "s"}`,
      `${memoryTotal} memory-button use${memoryTotal === 1 ? "" : "s"}`,
      `${summary.calculator.keyboardPresses} keyboard input${summary.calculator.keyboardPresses === 1 ? "" : "s"}, ${summary.calculator.buttonPresses} button input${summary.calculator.buttonPresses === 1 ? "" : "s"}`,
    ];
    const calculatorStudyFixes: string[] = [];
    const hasMultiCalculation =
      summary.calculator.operators >= 4 ||
      summary.questions.some(
        (question) =>
          question.questionTags.includes("calculator-heavy") &&
          question.calculator.operators >= 3
      );
    const enteredMostlyWithButtons =
      summary.calculator.buttonPresses >= 3 &&
      summary.calculator.buttonPresses > summary.calculator.keyboardPresses;

    if (hasMultiCalculation && memoryTotal === 0) {
      calculatorCauses.push("Calculator memory buttons not used effectively");
      calculatorStudyFixes.push(CALCULATOR_SPEED_TRAINER_FIX);
    }
    if (enteredMostlyWithButtons) {
      calculatorCauses.push(
        "Calculator entered with mouse/buttons instead of keyboard"
      );
      calculatorStudyFixes.push(CALCULATOR_SPEED_TRAINER_FIX);
    }
    if (summary.calculator.backspaces > 0) {
      calculatorCauses.push("Calculator re-entry/backspace/clearing issue");
      calculatorStudyFixes.push(CALCULATOR_SPEED_TRAINER_FIX);
    }
    if (summary.calculator.pauses > 0) {
      calculatorCauses.push("Calculator setup hesitation before calculation");
      calculatorStudyFixes.push(CALCULATOR_HEAVY_DRILL_FIX);
    }

    if (calculatorCauses.length > 0) {
      const fix =
        calculatorStudyFixes.includes(CALCULATOR_HEAVY_DRILL_FIX) &&
        calculatorStudyFixes.includes(CALCULATOR_SPEED_TRAINER_FIX)
          ? `${CALCULATOR_SPEED_TRAINER_FIX} ${CALCULATOR_HEAVY_DRILL_FIX}`
          : calculatorStudyFixes[0] ?? "";

      addIssue(
        "Inefficient calculator use detected",
        `Specific cause${calculatorCauses.length === 1 ? "" : "s"}: ${joinHumanList(calculatorCauses)}.`,
        calculatorEvidence,
        fix,
        calculatorStudyFixes
      );
    }
  }

  if (summary.shortcuts.total < Math.max(2, Math.floor(summary.answeredQuestions / 2))) {
    const singleChoiceAnswered = summary.questions.filter(
      (question) => typeof question.selectedAnswer === "string"
    ).length;
    const keyboardCauses: string[] = [];

    if (singleChoiceAnswered > 0 && summary.shortcuts.answerKeys === 0) {
      keyboardCauses.push("Answer keyboard shortcuts not used");
    }
    if (
      summary.shortcuts.navigation === 0 &&
      summary.otherData.nextClicks + summary.otherData.previousClicks > 0
    ) {
      keyboardCauses.push("Navigation shortcuts not used");
    }
    if (
      (summary.calculator.opens > 0 && summary.shortcuts.calculator === 0) ||
      (summary.otherData.flagToggles > 0 && summary.shortcuts.flag === 0)
    ) {
      keyboardCauses.push("Calculator/flag shortcuts not used");
    }

    addIssue(
      "Ineffective keyboard use detected",
      keyboardCauses.length > 0
        ? `Specific cause${keyboardCauses.length === 1 ? "" : "s"}: ${joinHumanList(keyboardCauses)}.`
        : "Most question movement or selection is happening manually rather than through shortcuts.",
      [
        `${summary.shortcuts.total} shortcut event${summary.shortcuts.total === 1 ? "" : "s"}`,
        `${summary.shortcuts.answerKeys} answer-key selection${summary.shortcuts.answerKeys === 1 ? "" : "s"}`,
        `${summary.shortcuts.navigation} navigation shortcut${summary.shortcuts.navigation === 1 ? "" : "s"}`,
      ],
      "Shortcut usage is being pointed out only; no study task added.",
      []
    );
  }

  if (summary.section !== "sjt") {
    const ranOutNearEnd =
      summary.timed &&
      summary.secondsRemaining <= Math.max(10, summary.setSeconds * 0.1);
    const spentTooLongOnTimeSink =
      maxQuestionTime > Math.max(30, summary.avgSecondsPerQuestion * 2);
    const timeCauses: string[] = [];
    const timeStudyFixes: string[] = [];

    if (ranOutNearEnd) {
      timeCauses.push("Running out of time near the end");
      timeStudyFixes.push(
        `Complete ${TARGETED_DRILL_SETS} x ${TARGETED_DRILL_MINUTES}-minute timed drill sets to build speed.`
      );
    }
    if (spentTooLongOnTimeSink) {
      timeCauses.push("Spending too long on individual time-sink questions");
      timeStudyFixes.push(FLAGGING_TRAINER_FIX);
    }

    if (timeCauses.length > 0) {
      const fix = joinHumanList(timeStudyFixes);

      addIssue(
        "Time management issue detected",
        `Specific cause${timeCauses.length === 1 ? "" : "s"}: ${joinHumanList(timeCauses)}.`,
        [
          `${summary.avgSecondsPerQuestion}s average per question`,
          `${formatDuration(summary.secondsRemaining)} remaining`,
          `${maxQuestionTime}s slowest question`,
        ],
        fix,
        timeStudyFixes
      );
    }
  }

  if (summary.answerSwitches > 0 || summary.changedFromCorrect > 0) {
    const answerCauses: string[] = [];
    const answerStudyFixes: string[] = [];
    const tooManyChanges =
      summary.answerSwitches >= Math.max(2, Math.ceil(summary.totalQuestions * 0.2));

    if (tooManyChanges) {
      answerCauses.push("Changing answers too often");
      answerStudyFixes.push(CONFIDENCE_RULE_FIX);
    }
    if (summary.changedFromCorrect > 0) {
      answerCauses.push("Changing correct answers to incorrect answers");
      answerStudyFixes.push(CONFIDENCE_RULE_FIX);
    }
    if (answerCauses.length === 0) {
      answerCauses.push("Second-guessing without new evidence");
    }

    addIssue(
      "Answer uncertainty detected",
      `Specific cause${answerCauses.length === 1 ? "" : "s"}: ${joinHumanList(answerCauses)}.`,
      [
        `${summary.answerSwitches} answer switch${summary.answerSwitches === 1 ? "" : "es"}`,
        `${summary.changedFromCorrect} changed from correct`,
        `${summary.changedToCorrect} changed to correct`,
      ],
      answerStudyFixes[0] ?? "Second-guessing is being pointed out only; no study task added.",
      answerStudyFixes
    );
  }

  if (summary.otherData.reviewOpens > 0 || summary.otherData.navigatorOpens > 0) {
    const reviewCauses = ["Review opened without clear priority order"];

    if (summary.flaggedQuestions > 0) {
      reviewCauses.push("Reviewing flagged questions inefficiently");
    }
    if (summary.answeredQuestions < summary.totalQuestions) {
      reviewCauses.push("Not reviewing unanswered questions first");
    }

    addIssue(
      "Review strategy issue detected",
      `Specific cause${reviewCauses.length === 1 ? "" : "s"}: ${joinHumanList(reviewCauses)}.`,
      [
        `${summary.otherData.reviewOpens} review open${summary.otherData.reviewOpens === 1 ? "" : "s"}`,
        `${summary.otherData.navigatorOpens} navigator open${summary.otherData.navigatorOpens === 1 ? "" : "s"}`,
        `${summary.flaggedQuestions} flagged question${summary.flaggedQuestions === 1 ? "" : "s"}`,
      ],
      "Review order is being pointed out only; no study task added.",
      []
    );
  }

  if (
    (summary.flaggedQuestions === 0 && incorrectQuestions > 0) ||
    summary.flaggedQuestions > Math.ceil(summary.totalQuestions * 0.4) ||
    summary.otherData.flagToggles > Math.max(2, summary.flaggedQuestions)
  ) {
    const flagCauses: string[] = [];

    if (summary.flaggedQuestions === 0 && incorrectQuestions > 0) {
      flagCauses.push("No flags used despite incorrect/missed questions");
    }
    if (summary.flaggedQuestions > Math.ceil(summary.totalQuestions * 0.4)) {
      flagCauses.push("Too many questions flagged");
    }
    if (summary.otherData.flagToggles > Math.max(2, summary.flaggedQuestions)) {
      flagCauses.push("Repeated flag toggling");
    }

    addIssue(
      "Flagging issue detected",
      `Specific cause${flagCauses.length === 1 ? "" : "s"}: ${joinHumanList(flagCauses)}.`,
      [
        `${summary.flaggedQuestions} flag${summary.flaggedQuestions === 1 ? "" : "s"}`,
        `${incorrectQuestions} incorrect or missed question${incorrectQuestions === 1 ? "" : "s"}`,
        `${summary.otherData.flagToggles} flag toggle${summary.otherData.flagToggles === 1 ? "" : "s"}`,
      ],
      "Flagging pattern is being pointed out only; no study task added.",
      []
    );
  }

  if (totalVisits > summary.totalQuestions + 1 || summary.otherData.questionJumps > 0) {
    const navigationCauses: string[] = [];

    if (totalVisits > summary.totalQuestions + 1) {
      navigationCauses.push("Excessive question revisits");
    }
    if (summary.otherData.questionJumps > 0) {
      navigationCauses.push("Jumping around without a review strategy");
    }

    addIssue(
      "Navigation issue detected",
      `Specific cause${navigationCauses.length === 1 ? "" : "s"}: ${joinHumanList(navigationCauses)}.`,
      [
        `${totalVisits} total question visit${totalVisits === 1 ? "" : "s"}`,
        `${summary.otherData.questionJumps} question jump${summary.otherData.questionJumps === 1 ? "" : "s"}`,
        `${summary.otherData.nextClicks + summary.otherData.previousClicks} manual next/previous action${summary.otherData.nextClicks + summary.otherData.previousClicks === 1 ? "" : "s"}`,
      ],
      "Navigation pattern is being pointed out only; no study task added.",
      []
    );
  }

  if (
    summary.regionActivity.totalSwitches > 0 ||
    summary.regionActivity.stimulusRevisits > 0 ||
    summary.regionActivity.questionAnswerFlips > 0
  ) {
    const readingCauses: string[] = [];

    if (summary.regionActivity.totalSwitches > 0) {
      readingCauses.push("Repeatedly switching between passage/stem/options");
    }
    if (summary.regionActivity.stimulusRevisits > 0) {
      readingCauses.push("Re-reading stimulus too often");
    }
    if (summary.regionActivity.questionAnswerFlips > 0) {
      readingCauses.push("Losing time between question and answer choices");
    }

    addIssue(
      "Reading strategy issue detected",
      `Specific cause${readingCauses.length === 1 ? "" : "s"}: ${joinHumanList(readingCauses)}.`,
      [
        `${summary.regionActivity.totalSwitches} region switch${summary.regionActivity.totalSwitches === 1 ? "" : "es"}`,
        `${summary.regionActivity.stimulusRevisits} stimulus revisit${summary.regionActivity.stimulusRevisits === 1 ? "" : "s"}`,
        `${summary.regionActivity.questionAnswerFlips} question/answer flip${summary.regionActivity.questionAnswerFlips === 1 ? "" : "s"}`,
      ],
      "Reading pattern is being pointed out only; no study task added.",
      []
    );
  }

  if (
    summary.section !== "sjt" &&
    maxQuestionTime - minQuestionTime >
      Math.max(25, summary.avgSecondsPerQuestion * 2) &&
    !expectedPacingSpread(summary)
  ) {
    addIssue(
      "Pacing issue detected",
      "Time distribution is uneven across questions.",
      [
        `${maxQuestionTime}s slowest question`,
        `${minQuestionTime}s fastest question`,
        `${summary.avgSecondsPerQuestion}s average per question`,
      ],
      "Uneven pacing is being pointed out only; no study task added.",
      []
    );
  }

  const strengths = [
    "Full question set marked",
    `${summary.answeredQuestions}/${summary.totalQuestions} questions answered`,
    summary.trackingEventCount > 0
      ? "Question behaviour data captured"
      : "Core answer and timing data captured",
  ];

  if (summary.correctQuestions > 0) {
    strengths.push(`${summary.correctQuestions} correct answer${summary.correctQuestions === 1 ? "" : "s"} banked`);
  }
  if (summary.answerSwitches === 0) {
    strengths.push("Stable answer selection");
  }
  if (summary.changedToCorrect > summary.changedFromCorrect) {
    strengths.push("Answer changes helped more than they hurt");
  }
  if (summary.shortcuts.total > 0) {
    strengths.push("Shortcut usage recorded");
  }

  return {
    issues:
      issues.length > 0
        ? issues
        : [
            {
              label: "No major issue signal detected from this set",
              cause: "The marked set did not trigger a strong issue rule.",
              evidence: [
                `${summary.answeredQuestions}/${summary.totalQuestions} answered`,
                `${summary.accuracy}% accuracy`,
              ],
              fix: "Keep building volume, then compare the next marked set for a clearer pattern.",
            },
          ],
    strengths,
  };
}

type DataSourceMode = "diagnostic" | "practice";
type SectionFilter = "all" | UCATSection;

function MarkedSessionInsightsPanel({
  insights,
  isPremium,
  checkoutLoading,
  checkoutError,
  onUpgrade,
  sourceSection,
  isDiagnosticSession,
}: {
  insights: MarkedSessionInsights;
  isPremium: boolean;
  checkoutLoading: boolean;
  checkoutError: string | null;
  onUpgrade: () => void | Promise<void>;
  sourceSection: UCATSection;
  isDiagnosticSession: boolean;
}) {
  const locked = !isPremium;
  const [issuesExpanded, setIssuesExpanded] = useState(false);
  const [dataSource, setDataSource] = useState<DataSourceMode>("diagnostic");
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>("all");

  const dataMatches =
    dataSource === "diagnostic" ? isDiagnosticSession : !isDiagnosticSession;
  const sectionMatches =
    sectionFilter === "all" || sectionFilter === sourceSection;
  const visibleIssues = dataMatches && sectionMatches ? insights.issues : [];
  const visibleStrengths =
    dataMatches && sectionMatches ? insights.strengths : [];
  const studyPlanTasks = buildStudyPlanTasks(visibleIssues).slice(0, 4);
  const sectionTabs: Array<{ id: SectionFilter; label: string }> = [
    { id: "all", label: "All" },
    { id: "vr", label: "VR" },
    { id: "dm", label: "DM" },
    { id: "qr", label: "QR" },
    { id: "sjt", label: "SJT" },
  ];

  const emptyMessage =
    !dataMatches
      ? dataSource === "practice"
        ? "No practice question data yet. Run a practice set to populate this view."
        : "No diagnostic data yet. Complete a diagnostic to populate this view."
      : !sectionMatches
        ? `No ${sectionFilter.toUpperCase()} data in this set. Run a ${sectionFilter.toUpperCase()} session to see issues here.`
        : null;

  return (
    <section className="rounded-lg border border-slate-500 bg-slate-950 p-5 text-white shadow-xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-black">
            Issues, strengths and study plan
          </h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-300">
            Generated after marking the full question set. Free shows the
            detected labels; premium unlocks precise causes, evidence and study tasks.
          </p>
        </div>
        {!locked && (
          <Link
            href="/phloemai/report"
            className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-400 px-4 text-xs font-black text-emerald-950 hover:bg-emerald-300"
          >
            Detailed analysis unlocked
          </Link>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="tablist"
          aria-label="Data source"
          className="inline-flex w-fit rounded-md border border-slate-700 bg-slate-900 p-1"
        >
          {(["diagnostic", "practice"] as const).map((mode) => {
            const active = dataSource === mode;
            return (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setDataSource(mode)}
                className={`rounded-sm px-4 py-1.5 text-xs font-black uppercase tracking-wide transition-colors ${
                  active
                    ? "bg-white text-slate-900"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {mode === "diagnostic" ? "Diagnostic" : "Practice"}
              </button>
            );
          })}
        </div>
        <div
          role="tablist"
          aria-label="Section"
          className="inline-flex w-fit flex-wrap gap-1 rounded-md border border-slate-700 bg-slate-900 p-1"
        >
          {sectionTabs.map((tab) => {
            const active = sectionFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSectionFilter(tab.id)}
                className={`rounded-sm px-3 py-1.5 text-xs font-black uppercase tracking-wide transition-colors ${
                  active
                    ? "bg-white text-slate-900"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {checkoutError && (
        <p className="mt-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs font-black text-red-700">
          {checkoutError}
        </p>
      )}
      {emptyMessage && (
        <p className="mt-4 rounded-md border border-slate-600 bg-slate-900 px-3 py-3 text-xs font-bold text-slate-300">
          {emptyMessage}
        </p>
      )}
      <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_0.9fr_1fr]">
        <div className="rounded-lg border border-red-200 bg-white p-4 text-slate-950 shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-black">Issues detected</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {visibleIssues.length} signal
                  {visibleIssues.length === 1 ? "" : "s"} found
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIssuesExpanded((current) => !current)}
              disabled={visibleIssues.length === 0}
              className="shrink-0 rounded-md bg-red-600 px-4 py-2 text-xs font-black text-white shadow-md shadow-red-100 transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {issuesExpanded ? "Hide details" : "Show detailed breakdown"}
            </button>
          </div>

          <ul className="mt-4 space-y-2">
            {visibleIssues.length === 0 ? (
              <li className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold leading-5 text-slate-500">
                No issues for the current filter.
              </li>
            ) : (
              visibleIssues.map((issue) => (
                <li
                  key={issue.label}
                  className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-black leading-6 text-slate-900"
                >
                  {issue.label}
                </li>
              ))
            )}
          </ul>

          {issuesExpanded && visibleIssues.length > 0 && (
            <div className="mt-4 space-y-3">
              {visibleIssues.map((issue) => (
                <div
                  key={issue.label}
                  className="rounded-md border border-slate-200 bg-slate-50 p-3"
                >
                  <p className="text-sm font-black leading-6 text-slate-900">
                    {issue.label}
                  </p>
                  <div className="relative mt-3 overflow-hidden rounded-md border border-red-100 bg-red-50 p-3">
                    {locked && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 text-center backdrop-blur-[2px]">
                        <LockKeyhole
                          className="h-5 w-5 text-red-600"
                          aria-hidden="true"
                        />
                        <p className="mt-2 text-xs font-black text-slate-900">
                          Specific issue locked
                        </p>
                      </div>
                    )}
                    <div className={locked ? "select-none blur-[3px]" : ""}>
                      <p className="text-xs font-black uppercase tracking-wide text-red-700">
                        Main cause
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-700">
                        {issue.cause}
                      </p>
                      <p className="mt-3 text-xs font-black uppercase tracking-wide text-red-700">
                        Evidence
                      </p>
                      <ul className="mt-1 space-y-1 text-xs font-semibold leading-5 text-slate-700">
                        {issue.evidence.map((item) => (
                          <li key={item}>- {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {locked && (
            <button
              type="button"
              onClick={onUpgrade}
              disabled={checkoutLoading}
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md bg-blue-600 px-4 text-xs font-black text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {checkoutLoading ? "Opening..." : "Upgrade to unlock and find out more"}
            </button>
          )}
        </div>

        <div className="rounded-lg border border-emerald-200 bg-white p-4 text-slate-950 shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
              <CheckCircle className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-black">Strengths detected</h3>
          </div>
          <ul className="mt-4 space-y-2 text-sm font-semibold leading-6 text-slate-700">
            {visibleStrengths.length === 0 ? (
              <li className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                No strengths for the current filter.
              </li>
            ) : (
              visibleStrengths.slice(0, 6).map((item) => (
                <li key={item}>- {item}</li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-lg border border-blue-200 bg-white p-4 text-slate-950 shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-100 text-blue-700">
              <Target className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-black">Personalised study plan</h3>
          </div>
          {locked ? (
            <div className="mt-4 rounded-md border border-dashed border-blue-200 bg-blue-50 p-4">
              <LockKeyhole className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <p className="mt-3 text-sm font-black text-slate-900">
                Detailed study tasks are locked.
              </p>
              <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">
                Upgrade to reveal the exact drills and review rules generated
                from this marked set.
              </p>
            </div>
          ) : (
            <>
              {studyPlanTasks.length > 0 ? (
                <ol className="mt-4 space-y-2">
                  {studyPlanTasks.map((task, index) => (
                    <li
                      key={task.id}
                      className="grid grid-cols-[28px_1fr] gap-3 rounded-md border border-blue-100 bg-white p-3 shadow-sm"
                    >
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                        {index + 1}
                      </span>
                      <p className="text-xs font-black leading-5 text-slate-800">
                        {task.fix}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-4 rounded-md border border-blue-100 bg-blue-50 p-3 text-xs font-semibold leading-5 text-slate-700">
                  No extra study task from this set. Use the unlocked issue
                  detail as behaviour feedback for the next attempt.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function ReviewScreen({
  sectionTitle,
  questions,
  answers,
  flags,
  trackingEventCount,
  timings,
  onGoToQuestion,
  onMark,
}: {
  sectionTitle: string;
  questions: UCATQuestion[];
  answers: Record<number, PracticeAnswer>;
  flags: Record<number, boolean>;
  trackingEventCount: number;
  timings: Record<string, QuestionTiming>;
  onGoToQuestion: (index: number) => void;
  onMark: () => void;
}) {
  const answeredCount = questions.filter((question, index) =>
    isAnswered(question, answers[index])
  ).length;
  const flaggedCount = Object.values(flags).filter(Boolean).length;
  const totalSeconds = Math.round(
    Object.values(timings).reduce((sum, item) => sum + item.totalMs, 0) / 1000
  );

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <header className="flex min-h-14 items-center justify-between bg-[#0078a8] px-3 py-2 text-white">
        <h1 className="text-lg font-semibold sm:text-2xl">{sectionTitle}</h1>
        <button
          type="button"
          onClick={onMark}
          className="rounded-sm bg-white px-4 py-1.5 text-sm font-bold text-[#0078a8] hover:bg-slate-100"
        >
          Mark
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-6">
        <h2 className="text-2xl font-bold">Review</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {[
            ["Answered", `${answeredCount}/${questions.length}`],
            ["Flagged", String(flaggedCount)],
            ["Events tracked", String(trackingEventCount)],
            ["Time tracked", formatDuration(totalSeconds)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-sm border border-slate-300 bg-slate-50 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {label}
              </p>
              <p className="mt-1 text-xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-sm border border-slate-300">
          {questions.map((question, index) => {
            const answered = isAnswered(question, answers[index]);
            const timing = timings[question.id];
            return (
              <button
                key={question.id}
                type="button"
                onClick={() => onGoToQuestion(index)}
                className="grid w-full gap-3 border-b border-slate-200 px-4 py-3 text-left last:border-b-0 hover:bg-blue-50 sm:grid-cols-[80px_1fr_120px_110px]"
              >
                <span className="text-sm font-bold">Q{index + 1}</span>
                <span>
                  <span className="block text-sm font-bold">
                    {getUCATSubtypeMeta(question.subtype).label}
                  </span>
                  <span className="mt-1 block truncate text-xs font-semibold text-slate-500">
                    {getAnswerText(question, answers[index])}
                  </span>
                </span>
                <span
                  className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${
                    answered
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {answered ? "Answered" : "Incomplete"}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {flags[index] ? "Flagged" : ""}
                  {timing ? ` ${formatDuration(Math.round(timing.totalMs / 1000))}` : ""}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onMark}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-sm bg-[#0078a8] px-8 text-base font-bold text-white hover:bg-[#00618a]"
        >
          Mark
        </button>
      </main>
    </div>
  );
}

function MarkedReviewScreen({
  sectionTitle,
  summary,
  saveState,
  isPremium,
  diagnosticMode,
  aiFeedbackState,
  checkoutLoading,
  checkoutError,
  onUpgrade,
  onReviewAnswers,
  onNewSet,
  onRequestAiFeedback,
}: {
  sectionTitle: string;
  summary: PracticeSessionSummary;
  saveState: SaveState;
  isPremium: boolean;
  diagnosticMode?: DiagnosticMode | null;
  aiFeedbackState?: DiagnosticAiFeedbackState | null;
  checkoutLoading: boolean;
  checkoutError: string | null;
  onUpgrade: () => void | Promise<void>;
  onReviewAnswers: () => void;
  onNewSet?: () => void;
  onRequestAiFeedback?: () => void | Promise<void>;
}) {
  const saveClass =
    saveState.status === "saved"
      ? "bg-emerald-50 text-emerald-700"
      : saveState.status === "error"
        ? "bg-red-50 text-red-700"
        : saveState.status === "saving"
          ? "bg-blue-50 text-blue-700"
          : "bg-slate-100 text-slate-600";
  const insights = buildMarkedSessionInsights(summary);
  const diagnosticScore = getDiagnosticSectionScore(summary);
  const isDiagnostic = Boolean(diagnosticMode);
  const analysisUnlocked = isPremium || diagnosticMode === "free-qr";
  const aiCreditLabel =
    aiFeedbackState?.credits === 1
      ? "1 AI diagnostic credit"
      : `${aiFeedbackState?.credits ?? 0} AI diagnostic credits`;

  return (
    <div className="min-h-screen bg-[#e7edf7] font-sans text-[#111827]">
      <header className="bg-[#0078a8] px-4 py-4 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-blue-100">
              Marked review
            </p>
            <h1 className="mt-1 text-2xl font-black">{sectionTitle}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onReviewAnswers}
              className="inline-flex h-10 items-center justify-center rounded-sm bg-white px-4 text-sm font-black text-[#0078a8] hover:bg-blue-50"
            >
              Review answers
            </button>
            <button
              type="button"
              onClick={onNewSet}
              disabled={!onNewSet}
              className="inline-flex h-10 items-center justify-center rounded-sm border border-white/50 px-4 text-sm font-black text-white hover:bg-white/10"
            >
              {onNewSet ? "New set" : "Diagnostic locked"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-5 py-6">
        <section className="rounded-md border border-slate-400 bg-white p-5 shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-black">Review</h2>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                Score {formatMarkScore(summary.scorePoints, summary.maxScore)} -
                {summary.correctQuestions}/{summary.totalQuestions} fully correct -
                {summary.answeredQuestions}/{summary.totalQuestions} answered -
                {summary.accuracy}% accuracy
              </p>
            </div>
            <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${saveClass}`}>
              {saveState.message}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {[
              ["Score", formatMarkScore(summary.scorePoints, summary.maxScore)],
              [diagnosticScore.label, diagnosticScore.value],
              ["Accuracy", `${summary.accuracy}%`],
              ["Avg time", `${summary.avgSecondsPerQuestion}s`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-slate-300 bg-slate-100 p-3 shadow-sm">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-2xl font-black">{value}</p>
              </div>
            ))}
          </div>
          {isDiagnostic && (
            <p className="mt-3 text-xs font-bold leading-5 text-slate-500">
              {diagnosticScore.helper}
            </p>
          )}
        </section>

        {isDiagnostic && aiFeedbackState && onRequestAiFeedback && (
          aiFeedbackState.text ? (
            <section className="rounded-md border border-violet-200 bg-white p-5 shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-violet-100 text-violet-700">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-black">AI feedback</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Generated from this diagnostic and shown before the issue breakdown.
                  </p>
                </div>
              </div>
              <ExpandableAiFeedback
                text={aiFeedbackState.text}
                className="mt-4 text-sm leading-6 text-slate-800"
                paragraphClassName="whitespace-pre-wrap"
                buttonClassName="mt-4 text-sm font-black text-violet-700 hover:text-violet-800"
              />
            </section>
          ) : (
            <section className="rounded-md border border-violet-200 bg-white p-5 shadow-md">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-violet-100 text-violet-700">
                    <Sparkles className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black">{aiCreditLabel}</h2>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                      Use a credit to generate personalised written feedback
                      from this diagnostic.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void onRequestAiFeedback?.()}
                  disabled={
                    aiFeedbackState.requesting ||
                    aiFeedbackState.credits <= 0
                  }
                  className="inline-flex h-11 items-center justify-center rounded-md bg-violet-600 px-5 text-sm font-black text-white shadow-md shadow-violet-100 hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {aiFeedbackState.requesting
                    ? "Generating..."
                    : aiFeedbackState.credits <= 0
                      ? "No credit remaining"
                      : "Use AI diagnostic credit"}
                </button>
              </div>
              {aiFeedbackState.message && (
                <p className="mt-4 rounded-md border border-violet-100 bg-violet-50 px-3 py-2 text-xs font-black leading-5 text-violet-800">
                  {aiFeedbackState.message}
                </p>
              )}
            </section>
          )
        )}

        <MarkedSessionInsightsPanel
          insights={insights}
          isPremium={analysisUnlocked}
          checkoutLoading={checkoutLoading}
          checkoutError={checkoutError}
          onUpgrade={onUpgrade}
          sourceSection={summary.section as UCATSection}
          isDiagnosticSession={isDiagnostic}
        />

        <section className="rounded-md border border-slate-400 bg-white p-5 shadow-lg">
          <h2 className="text-lg font-black">Question-by-question review</h2>
          <div className="mt-4 space-y-4">
            {summary.questions.map((item) => (
              <article
                key={item.questionId}
                className="rounded-md border border-slate-400 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Q{item.questionIndex + 1} - {item.subtypeLabel}
                    </p>
                    <h3 className="mt-1 text-base font-black text-slate-950">
                      {item.questionText}
                    </h3>
                    <p className="mt-2 text-sm font-semibold text-slate-600">
                      Your answer: {item.selectedAnswerText}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      Correct: {item.correctAnswerText}
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-700">
                      Score: {formatMarkScore(item.scorePoints, item.maxScore)}
                    </p>
                    {item.issueLabels.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.issueLabels.map((label) => (
                          <span
                            key={label}
                            className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-slate-600"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span
                    className={`w-fit rounded-full px-2.5 py-1 text-xs font-black ${
                      item.resultStatus === "correct"
                        ? "bg-emerald-50 text-emerald-700"
                        : item.resultStatus === "partial"
                          ? "bg-yellow-50 text-yellow-700"
                        : item.resultStatus === "incorrect"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {item.resultStatus === "correct"
                      ? "Correct"
                      : item.resultStatus === "partial"
                        ? "Half mark"
                        : item.resultStatus === "incorrect"
                          ? "Incorrect"
                          : "Unanswered"}
                  </span>
                </div>
                <div className="mt-4 rounded-md border border-slate-300 bg-slate-100 p-4">
                  <p className="text-sm font-black text-slate-900">
                    Explanation
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                    {item.explanation}
                  </p>
                </div>
                <QuestionDataCollectedPanel item={item} />
              </article>
            ))}
          </div>
        </section>

        <SessionDataCollectedPanel summary={summary} />

        <section className="rounded-md border border-slate-400 bg-white p-5 shadow-md">
          <h2 className="text-lg font-black">Question-type timing</h2>
          <div className="mt-5 overflow-hidden rounded-md border border-slate-300">
            <div className="grid grid-cols-[1fr_70px_80px_80px_80px] bg-slate-200 px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-700">
              <span>Question type</span>
              <span>Qs</span>
              <span>Avg</span>
              <span>Flags</span>
              <span>Correct</span>
            </div>
            {summary.timingBySubtype.map((item) => (
              <div
                key={item.subtype}
                className="grid grid-cols-[1fr_70px_80px_80px_80px] border-t border-slate-100 px-3 py-2 text-sm font-semibold"
              >
                <span>{item.label}</span>
                <span>{item.questions}</span>
                <span>{item.avgSeconds}s</span>
                <span>{item.flagged}</span>
                <span>{item.correct}/{item.questions}</span>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

export function UCATQuestionBankClient({
  section,
  diagnosticMode,
  mockId,
  reviewMode = false,
  backHref,
  backLabel,
}: {
  section?: string;
  diagnosticMode?: string | null;
  mockId?: string | null;
  reviewMode?: boolean;
  backHref?: string;
  backLabel?: string;
}) {
  const validSection = section && isUCATSection(section) ? section : null;
  const validDiagnosticMode = normaliseDiagnosticMode(diagnosticMode);
  const validMockId = normaliseMockId(mockId);

  if (!validSection && validDiagnosticMode === "full") {
    return <PremiumDiagnosticChooser mockId={validMockId} />;
  }

  if (!validSection && validDiagnosticMode === "full-mock") {
    return <FullMockDiagnosticOverview mockId={validMockId} />;
  }

  if (!validSection && validDiagnosticMode === "section-mock") {
    return <SubtestMockOverview mockId={validMockId} />;
  }

  if (!validSection && validDiagnosticMode === "subset") {
    return <DiagnosticModeChooser mode="subset" mockId={validMockId} />;
  }

  if (!validSection) {
    return <SectionHub />;
  }

  return (
    <UCATQuestionBankSection
      key={`${validSection}-${validDiagnosticMode ?? "practice"}-${validMockId}-${reviewMode ? "review" : "new"}`}
      section={validSection}
      diagnosticMode={validDiagnosticMode}
      mockId={validMockId}
      reviewMode={reviewMode}
      backHref={backHref}
      backLabel={backLabel}
    />
  );
}

function UCATQuestionBankSection({
  section: validSection,
  diagnosticMode,
  mockId,
  reviewMode,
  backHref,
  backLabel,
}: {
  section: UCATSection;
  diagnosticMode: DiagnosticMode | null;
  mockId: MockId;
  reviewMode: boolean;
  backHref?: string;
  backLabel?: string;
}) {
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<UCATOptionKey | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<Record<number, PracticeAnswer>>({});
  const [flags, setFlags] = useState<Record<number, boolean>>({});
  const [dragOrder, setDragOrder] = useState<string[]>([]);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(
    null
  );
  const [draggedYesNoValue, setDraggedYesNoValue] =
    useState<UCATYesNoValue | null>(null);
  const [selectedSubtypeIds, setSelectedSubtypeIds] = useState<UCATSubtypeId[]>(
    []
  );
  const [lengthMode, setLengthMode] = useState<SessionLengthMode>("questions");
  const [questionTarget, setQuestionTarget] = useState<number>(5);
  const [minuteTarget, setMinuteTarget] = useState<number | "custom">(5);
  const [customMinutes, setCustomMinutes] = useState("8");
  const [sectionMockTiming, setSectionMockTiming] =
    useState<SectionMockTimingMode>("official");
  const [timed, setTimed] = useState(false);
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<PracticePhase>("practice");
  const [sessionQuestions, setSessionQuestions] = useState<UCATQuestion[]>([]);
  const [sessionTimed, setSessionTimed] = useState(false);
  const [sessionDurationSeconds, setSessionDurationSeconds] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcStored, setCalcStored] = useState<number | null>(null);
  const [calcOperator, setCalcOperator] = useState<string | null>(null);
  const [calcWaiting, setCalcWaiting] = useState(false);
  const [calcMemory, setCalcMemory] = useState(0);
  const [lastMrcAt, setLastMrcAt] = useState(0);
  const [trackingEventCount, setTrackingEventCount] = useState(0);
  const [trackingEventsSnapshot, setTrackingEventsSnapshot] = useState<
    TrackingEvent[]
  >([]);
  const [sessionStartedAt, setSessionStartedAt] = useState(0);
  const [trackingModeChoice, setTrackingModeChoice] =
    useState<TrackingMode>("mouse");
  const [timingSnapshot, setTimingSnapshot] = useState<
    Record<string, QuestionTiming>
  >({});
  const [markedSummary, setMarkedSummary] =
    useState<PracticeSessionSummary | null>(null);
  const [unseenContentOpen, setUnseenContentOpen] = useState(false);
  const [questionScrollSeen, setQuestionScrollSeen] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>({
    status: "idle",
    message: "Not saved yet",
  });
  const [isPremium, setIsPremium] = useState(false);
  const [freeDiagnosticLoading, setFreeDiagnosticLoading] = useState(
    diagnosticMode === "free-qr"
  );
  const [savedDiagnosticAttempt, setSavedDiagnosticAttempt] =
    useState<SavedDiagnosticAttempt | null>(null);
  const [aiFeedbackState, setAiFeedbackState] =
    useState<DiagnosticAiFeedbackState | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [completedQuestionIds, setCompletedQuestionIds] = useState<Set<string>>(
    () => new Set()
  );
  const [savedPracticeSets, setSavedPracticeSets] = useState<SavedPracticeSet[]>(
    []
  );
  const [questionProgressLoading, setQuestionProgressLoading] = useState(
    !diagnosticMode
  );
  const trackingEventsRef = useRef<TrackingEvent[]>([]);
  const questionTimingRef = useRef<Record<string, QuestionTiming>>({});
  const questionStartedAtRef = useRef(0);
  const sessionStartedAtRef = useRef(0);
  const phaseRef = useRef<PracticePhase>("practice");
  const markedSummaryRef = useRef<PracticeSessionSummary | null>(null);
  const markedInsightsHistoryActiveRef = useRef(false);
  const appRootRef = useRef<HTMLDivElement>(null);
  const stimulusRegionRef = useRef<HTMLElement>(null);
  const questionRegionRef = useRef<HTMLDivElement>(null);
  const answersRegionRef = useRef<HTMLDivElement>(null);
  const zoneElements = useMemo(
    () => ({
      stimulus: stimulusRegionRef,
      question: questionRegionRef,
      answers: answersRegionRef,
    }),
    []
  );
  const attentionTracker = useAttentionTracker<QuestionTrackingZone>({
    zoneIds: QUESTION_TRACKING_ZONES,
    zoneElements,
    isActive: started && phase === "practice",
    profiles: {
      eye: {
        fuzzyPaddingRatio: 0.1,
        fuzzyMinPaddingPx: 28,
        intentScoreThreshold: 0.14,
        minRegionDwellMs: 350,
      },
      mouse: {
        fuzzyPaddingRatio: 0.025,
        fuzzyMinPaddingPx: 6,
        intentScoreThreshold: 0.06,
        minRegionDwellMs: 60,
      },
    },
  });
  const resetAttentionTracker = attentionTracker.resetTracker;

  useEffect(() => {
    scrollToQuestionTop();
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (!started || phase !== "practice") {
      setQuestionScrollSeen(true);
      setUnseenContentOpen(false);
      return;
    }

    let frameId = 0;

    const updateScrollSeen = () => {
      const documentElement = document.documentElement;
      const pageHeight = Math.max(
        documentElement.scrollHeight,
        document.body.scrollHeight
      );
      const scrollBottom = window.scrollY + window.innerHeight;
      const needsScroll = pageHeight - window.innerHeight > 48;

      if (!needsScroll || scrollBottom >= pageHeight - 64) {
        setQuestionScrollSeen(true);
      }
    };

    setQuestionScrollSeen(false);
    setUnseenContentOpen(false);
    frameId = window.requestAnimationFrame(updateScrollSeen);
    window.addEventListener("scroll", updateScrollSeen, { passive: true });
    window.addEventListener("resize", updateScrollSeen);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", updateScrollSeen);
      window.removeEventListener("resize", updateScrollSeen);
    };
  }, [started, phase, questionIndex]);

  useEffect(() => {
    markedSummaryRef.current = markedSummary;
  }, [markedSummary]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as
        | { phloemaiQuestionBankView?: string }
        | null;

      if (
        state?.phloemaiQuestionBankView === "marked-insights" &&
        markedSummaryRef.current
      ) {
        markedInsightsHistoryActiveRef.current = true;
        phaseRef.current = "marked";
        setNavigatorOpen(false);
        setPhase("marked");
        scrollToQuestionTop();
        return;
      }

      if (phaseRef.current === "marked" && markedSummaryRef.current) {
        markedInsightsHistoryActiveRef.current = false;
        phaseRef.current = "marked-review";
        setNavigatorOpen(false);
        setRevealed(true);
        setPhase("marked-review");
        scrollToQuestionTop();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!hasSupabaseConfig()) return;

    let mounted = true;

    async function loadPlan() {
      const supabase = createSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted || !user) {
        if (mounted) setIsPremium(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("current_plan")
        .eq("id", user.id)
        .maybeSingle();

      if (mounted) {
        setIsPremium(data?.current_plan === "premium");
      }
    }

    void loadPlan();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (diagnosticMode) {
      setCompletedQuestionIds(new Set());
      setSavedPracticeSets([]);
      setQuestionProgressLoading(false);
      return;
    }

    let mounted = true;

    async function loadQuestionProgress() {
      setQuestionProgressLoading(true);

      try {
        if (!hasSupabaseConfig()) {
          if (mounted) {
            setCompletedQuestionIds(new Set());
            setSavedPracticeSets([]);
          }
          return;
        }

        const supabase = createSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (!user) {
          setCompletedQuestionIds(new Set());
          setSavedPracticeSets([]);
          return;
        }

        const sectionValues = [validSection, validSection.toUpperCase()];

        const { data: questionRows, error: questionError } = await supabase
          .from("practice_question_attempts")
          .select("question_id,section")
          .eq("user_id", user.id)
          .in("section", sectionValues)
          .limit(5000);

        if (questionError) throw questionError;

        const { data: sessionRows, error: sessionError } = await supabase
          .from("practice_sessions")
          .select("id,summary,completed_at,created_at,source")
          .eq("user_id", user.id)
          .in("section", sectionValues)
          .order("completed_at", { ascending: false })
          .limit(50);

        if (sessionError) throw sessionError;

        if (!mounted) return;

        const completedIds = new Set(
          ((questionRows ?? []) as CompletedQuestionRow[])
            .map((row) => row.question_id)
            .filter((questionId): questionId is string => Boolean(questionId))
        );
        const savedSets = ((sessionRows ?? []) as SavedPracticeSessionRow[])
          .map((row) => normaliseSavedPracticeSet(row, validSection))
          .filter((set): set is SavedPracticeSet => Boolean(set));

        setCompletedQuestionIds(completedIds);
        setSavedPracticeSets(savedSets);
      } catch (error) {
        console.error("Failed to load question progress", error);
        if (mounted) {
          setCompletedQuestionIds(new Set());
          setSavedPracticeSets([]);
        }
      } finally {
        if (mounted) setQuestionProgressLoading(false);
      }
    }

    void loadQuestionProgress();

    return () => {
      mounted = false;
    };
  }, [diagnosticMode, validSection]);

  const baseSectionQuestions = useMemo(
    () => UCAT_QUESTION_BANK[validSection],
    [validSection]
  );

  const sectionQuestions = useMemo(() => {
    if (diagnosticMode === "full-section" || diagnosticMode === "subset") {
      return getMockOrderedQuestions(baseSectionQuestions, validSection, mockId);
    }

    return baseSectionQuestions;
  }, [baseSectionQuestions, diagnosticMode, mockId, validSection]);

  const uncompletedSectionQuestions = useMemo(() => {
    if (diagnosticMode) return sectionQuestions;

    return sectionQuestions.filter(
      (question) => !completedQuestionIds.has(question.id)
    );
  }, [completedQuestionIds, diagnosticMode, sectionQuestions]);

  const availableQuestions = useMemo(() => {
    if (selectedSubtypeIds.length === 0) return uncompletedSectionQuestions;
    return uncompletedSectionQuestions.filter((question) =>
      selectedSubtypeIds.includes(question.subtype)
    );
  }, [selectedSubtypeIds, uncompletedSectionQuestions]);

  const fixedDiagnosticQuestions = useMemo(() => {
    if (diagnosticMode === "free-qr") {
      return sectionQuestions.slice(0, FREE_QR_DIAGNOSTIC_QUESTION_COUNT);
    }

    if (diagnosticMode === "full-section") {
      return sectionQuestions.slice(
        0,
        Math.min(FULL_MOCK_TARGETS[validSection], sectionQuestions.length)
      );
    }

    return null;
  }, [diagnosticMode, sectionQuestions, validSection]);

  const meta = getUCATSectionMeta(validSection);
  const selectedMock = getMockDefinition(mockId);
  const fixedDiagnosticScope: MockStartScope =
    diagnosticMode === "free-qr"
      ? "free"
      : backHref?.includes("/full-mock") || backHref?.includes("/mocks/full")
        ? "full-mock"
        : diagnosticMode
          ? "subtest"
          : "diagnostic";
  const selectedMinutes =
    minuteTarget === "custom"
      ? normaliseMinuteTarget(customMinutes)
      : minuteTarget;
  const selectedMinuteSeconds = minutesToSeconds(selectedMinutes);
  const desiredQuestionCount =
    lengthMode === "minutes"
      ? Math.max(1, Math.round(selectedMinuteSeconds / meta.secondsPerQuestion))
      : questionTarget;
  const setupQuestionCount = clampQuestionCount(
    fixedDiagnosticQuestions?.length ?? desiredQuestionCount,
    fixedDiagnosticQuestions?.length ?? availableQuestions.length
  );
  const setupTimeSeconds =
    diagnosticMode === "free-qr"
      ? FREE_QR_DIAGNOSTIC_SECONDS
      : fixedDiagnosticQuestions
        ? diagnosticMode === "full-section" && sectionMockTiming === "short"
          ? SECTION_MOCK_SHORT_SECONDS
          : diagnosticMode === "full-section"
            ? getOfficialSectionSeconds(
                validSection,
                fixedDiagnosticQuestions.length
              )
            : fixedDiagnosticQuestions.length * meta.secondsPerQuestion
        : lengthMode === "minutes"
          ? selectedMinuteSeconds
          : setupQuestionCount * meta.secondsPerQuestion;
  const questions = started
    ? sessionQuestions
    : fixedDiagnosticQuestions ?? availableQuestions;

  const currentQuestionForTracking = questions[questionIndex];

  useEffect(() => {
    if (diagnosticMode !== "free-qr") return;

    let mounted = true;

    async function loadSavedFreeDiagnostic() {
      setFreeDiagnosticLoading(true);

      if (!hasSupabaseConfig()) {
        if (mounted) {
          setFreeDiagnosticLoading(false);
          setAiFeedbackState({
            requested: false,
            status: "Sign in required",
            credits: 0,
            message: "Create or log in to your account to use the free diagnostic.",
            requesting: false,
            text: null,
          });
        }
        return;
      }

      try {
        const supabase = createSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (!user) {
          setSavedDiagnosticAttempt(null);
          setAiFeedbackState({
            requested: false,
            status: "Sign in required",
            credits: 0,
            message: "Create or log in to your account to use the free diagnostic.",
            requesting: false,
            text: null,
          });
          setFreeDiagnosticLoading(false);
          return;
        }

        const { data: profileRow } = await supabase
          .from("profiles")
          .select("diagnostic_credits")
          .eq("id", user.id)
          .maybeSingle();

        const credits =
          typeof profileRow?.diagnostic_credits === "number"
            ? profileRow.diagnostic_credits
            : 1;

        const { data: practiceRow } = await supabase
          .from("practice_sessions")
          .select("summary")
          .eq("user_id", user.id)
          .eq("source", FREE_QR_DIAGNOSTIC_SOURCE)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const { data: attemptRow } = await supabase
          .from("diagnostic_attempts")
          .select("id,ai_feedback,ai_feedback_requested_at,ai_feedback_status,metadata")
          .eq("user_id", user.id)
          .eq("source", FREE_QR_DIAGNOSTIC_SOURCE)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!mounted) return;

        const metadata =
          attemptRow?.metadata &&
          typeof attemptRow.metadata === "object" &&
          !Array.isArray(attemptRow.metadata)
            ? (attemptRow.metadata as Record<string, unknown>)
            : {};
        const aiStatus =
          typeof attemptRow?.ai_feedback_status === "string"
            ? attemptRow.ai_feedback_status
            : typeof metadata.aiFeedbackStatus === "string"
            ? metadata.aiFeedbackStatus
            : attemptRow?.ai_feedback_requested_at
              ? "queued_no_api_key"
              : "not_requested";
        const requestedAt =
          typeof attemptRow?.ai_feedback_requested_at === "string"
            ? attemptRow.ai_feedback_requested_at
            : null;
        const savedSummary =
          practiceRow?.summary &&
          typeof practiceRow.summary === "object" &&
          !Array.isArray(practiceRow.summary)
            ? (practiceRow.summary as PracticeSessionSummary)
            : null;
        const savedFeedbackText =
          typeof metadata.aiFeedbackText === "string"
            ? metadata.aiFeedbackText
            : typeof attemptRow?.ai_feedback === "string"
              ? attemptRow.ai_feedback
            : null;

        setAiFeedbackState({
          requested: Boolean(requestedAt),
          status: requestedAt
            ? savedFeedbackText
              ? "Feedback ready"
              : aiStatus
            : "Ready",
          credits: requestedAt ? 0 : credits,
          message: requestedAt && !savedFeedbackText
            ? "AI feedback request saved. Set ANTHROPIC_API_KEY to generate."
            : null,
          requesting: false,
          text: savedFeedbackText,
        });

        setSavedDiagnosticAttempt(
          savedSummary
            ? {
                summary: savedSummary,
                attemptId:
                  typeof attemptRow?.id === "string" ? attemptRow.id : null,
                aiFeedbackRequestedAt: requestedAt,
                aiFeedbackStatus: aiStatus,
                aiFeedbackText: savedFeedbackText,
                credits,
              }
            : null
        );
      } finally {
        if (mounted) setFreeDiagnosticLoading(false);
      }
    }

    void loadSavedFreeDiagnostic();

    return () => {
      mounted = false;
    };
  }, [diagnosticMode]);

  const recordEvent = (type: string, payload?: TrackingPayload) => {
    trackingEventsRef.current.push({
      at: nowMs(),
      type,
      questionId: currentQuestionForTracking?.id,
      questionIndex: started ? questionIndex : undefined,
      payload,
    });
    setTrackingEventCount(trackingEventsRef.current.length);
    setTrackingEventsSnapshot([...trackingEventsRef.current]);
  };

  const liveSummary = useMemo(() => {
    if (!started || questions.length === 0) return null;

    const completedAt = nowMs();
    return buildPracticeSessionSummary({
      section: validSection,
      sectionTitle: meta.bankTitle,
      mockId: diagnosticMode ? mockId : null,
      mockScope: diagnosticMode ? fixedDiagnosticScope : null,
      mockLabel: diagnosticMode ? selectedMock.label : null,
      questions,
      answers,
      flags,
      timings: timingSnapshot,
      events: trackingEventsSnapshot,
      startedAt: sessionStartedAt || completedAt,
      completedAt,
      timed: sessionTimed,
      setSeconds: sessionDurationSeconds,
      secondsRemaining: timeRemaining,
      trackingMode: attentionTracker.trackingMode,
    });
  }, [
    answers,
    attentionTracker.trackingMode,
    flags,
    meta.bankTitle,
    diagnosticMode,
    fixedDiagnosticScope,
    mockId,
    questions,
    selectedMock.label,
    sessionDurationSeconds,
    sessionTimed,
    sessionStartedAt,
    started,
    timeRemaining,
    timingSnapshot,
    trackingEventsSnapshot,
    validSection,
  ]);

  const persistPracticeSummary = async (
    summary: PracticeSessionSummary,
    events: TrackingEvent[]
  ) => {
    if (!hasSupabaseConfig()) {
      setSaveState({
        status: "skipped",
        message: "Supabase not configured",
      });
      return;
    }

    setSaveState({ status: "saving", message: "Saving session..." });

    try {
      const supabase = createSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSaveState({
          status: "skipped",
          message: "Sign in to save this session",
        });
        return;
      }

      const source = getPracticeSource(diagnosticMode);
      const { data: sessionRow, error: sessionError } = await supabase
        .from("practice_sessions")
        .insert({
          user_id: user.id,
          section: summary.section,
          source,
          total_questions: summary.totalQuestions,
          answered_questions: summary.answeredQuestions,
          correct_questions: summary.correctQuestions,
          accuracy: summary.accuracy,
          total_seconds: summary.totalSeconds,
          avg_seconds_per_question: summary.avgSecondsPerQuestion,
          tracking_mode: summary.trackingMode,
          summary,
          raw_events: events,
          started_at: summary.startedAt,
          completed_at: summary.completedAt,
        })
        .select("id")
        .single();

      if (sessionError) throw sessionError;

      const sessionId =
        typeof sessionRow?.id === "string" ? sessionRow.id : null;
      if (!sessionId) throw new Error("Supabase did not return a session id.");

      const questionRows = summary.questions.map((item) => ({
        session_id: sessionId,
        user_id: user.id,
        question_id: item.questionId,
        question_index: item.questionIndex,
        section: item.section,
        subtype: item.subtype,
        answered: item.answered,
        correct: item.correct,
        flagged: item.flagged,
        selected_answer: item.selectedAnswer,
        correct_answer: item.correctAnswer,
        total_seconds: item.totalSeconds,
        visits: item.visits,
        answered_at_ms: item.answeredAtMs,
        answer_switches: item.answerSwitches,
        metadata: {
          subtypeLabel: item.subtypeLabel,
          questionText: item.questionText,
          partial: item.partial,
          scorePoints: item.scorePoints,
          maxScore: item.maxScore,
          resultStatus: item.resultStatus,
          questionTags: item.questionTags,
          issueTags: item.issueTags,
          issueLabels: item.issueLabels,
          selectedAnswerText: item.selectedAnswerText,
          correctAnswerText: item.correctAnswerText,
          firstAnswerText: item.firstAnswerText,
          answerPath: item.answerPath,
          answerSelections: item.answerSelections,
          changedToCorrect: item.changedToCorrect,
          changedFromCorrect: item.changedFromCorrect,
          everCorrect: item.everCorrect,
          everWrong: item.everWrong,
          firstAnsweredAtMs: item.firstAnsweredAtMs,
          calculator: item.calculator,
          shortcuts: item.shortcuts,
          regionActivity: item.regionActivity,
          otherData: item.otherData,
          trackingEventCount: item.trackingEventCount,
        },
      }));

      const { error: questionError } = await supabase
        .from("practice_question_attempts")
        .insert(questionRows);

      if (questionError) throw questionError;

      if (diagnosticMode) {
        const scoreSummary = getDiagnosticSectionScore(summary);
        const insights = buildMarkedSessionInsights(summary);
        const studyPlanTasks = buildStudyPlanTasks(insights.issues);
        const { data: profileRow } = await supabase
          .from("profiles")
          .select("diagnostic_credits")
          .eq("id", user.id)
          .maybeSingle();
        const diagnosticCredits =
          typeof profileRow?.diagnostic_credits === "number"
            ? profileRow.diagnostic_credits
            : 1;
        const aiFeedbackStatus =
          diagnosticCredits > 0 ? "credit_available" : "not_requested";
        const attemptMetadata = {
          diagnosticMode,
          mockId,
          mockScope: fixedDiagnosticScope,
          mockLabel: selectedMock.label,
          sourceSessionId: sessionId,
          summary,
          insights,
          studyPlanTasks,
          sectionScore: scoreSummary.metadata,
          aiFeedbackCreditAvailable: diagnosticCredits > 0,
          aiFeedbackRequested: false,
          aiFeedbackStatus,
        };
        const { data: attemptRow, error: attemptError } = await supabase
          .from("diagnostic_attempts")
          .insert({
            user_id: user.id,
            source,
            total_questions: summary.totalQuestions,
            accuracy: summary.accuracy,
            avg_seconds_per_question: summary.avgSecondsPerQuestion,
            ai_feedback_status: aiFeedbackStatus,
            metadata: attemptMetadata,
            started_at: summary.startedAt,
            completed_at: summary.completedAt,
          })
          .select("id")
          .single();

        if (attemptError) throw attemptError;

        const attemptId =
          typeof attemptRow?.id === "string" ? attemptRow.id : null;
        if (!attemptId) {
          throw new Error("Supabase did not return a diagnostic attempt id.");
        }

        const { error: sectionError } = await supabase
          .from("diagnostic_sections")
          .insert({
            attempt_id: attemptId,
            user_id: user.id,
            section: summary.section.toUpperCase(),
            score: summary.accuracy,
            accuracy: summary.accuracy,
            avg_seconds_per_question: summary.avgSecondsPerQuestion,
            notes: `${scoreSummary.label}: ${scoreSummary.value}`,
          });

        if (sectionError) throw sectionError;

        setSavedDiagnosticAttempt({
          summary,
          attemptId,
          aiFeedbackRequestedAt: null,
          aiFeedbackStatus,
          aiFeedbackText: null,
          credits: diagnosticCredits,
        });
        setAiFeedbackState({
          requested: false,
          status: diagnosticCredits > 0 ? "Ready" : "No credit remaining",
          credits: diagnosticCredits,
          message:
            diagnosticCredits > 0
              ? null
              : "No diagnostic AI feedback credits remaining.",
          requesting: false,
          text: null,
        });
      }

      setSaveState({ status: "saved", message: "Saved to Supabase" });
    } catch (error) {
      setSaveState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not save this session",
      });
    }
  };

  const handleUpgrade = async () => {
    if (!hasSupabaseConfig()) {
      window.location.assign("/phloemai/dashboard");
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (response.status === 401) {
        window.location.assign("/phloemai/dashboard");
        return;
      }

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Could not start checkout.");
      }

      window.location.assign(data.url);
      window.setTimeout(() => setCheckoutLoading(false), 8000);
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : "Could not start checkout."
      );
      setCheckoutLoading(false);
    }
  };

  const requestDiagnosticAiFeedback = async () => {
    if (!savedDiagnosticAttempt?.attemptId || !hasSupabaseConfig()) {
      setAiFeedbackState((current) =>
        current
          ? {
              ...current,
              message: "Diagnostic attempt is not saved yet.",
            }
          : current
      );
      return;
    }

    setAiFeedbackState((current) =>
      current ? { ...current, requesting: true, message: null } : current
    );

    try {
      const supabase = createSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Sign in to request AI feedback.");

      const { data: profileRow } = await supabase
        .from("profiles")
        .select("diagnostic_credits")
        .eq("id", user.id)
        .maybeSingle();
      const credits =
        typeof profileRow?.diagnostic_credits === "number"
          ? profileRow.diagnostic_credits
          : 1;

      if (credits <= 0) {
        throw new Error("No diagnostic AI feedback credit remaining.");
      }

      const summary = savedDiagnosticAttempt.summary;
      const insights = buildMarkedSessionInsights(summary);

      const aiResponse = await fetch("/api/ai/diagnostic-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: summary.section,
          accuracy: summary.accuracy,
          scorePoints: summary.scorePoints,
          maxScore: summary.maxScore,
          answeredQuestions: summary.answeredQuestions,
          totalQuestions: summary.totalQuestions,
          avgSecondsPerQuestion: summary.avgSecondsPerQuestion,
          issues: insights.issues,
          strengths: insights.strengths,
          questionTimings: summary.timingBySubtype.map((t) => ({
            label: t.label,
            avgSeconds: t.avgSeconds,
            correct: t.correct,
            questions: t.questions,
          })),
        }),
      });

      const aiPayload = (await aiResponse.json()) as {
        feedback?: string;
        error?: string;
      };

      const aiOk = aiResponse.ok && Boolean(aiPayload.feedback);
      const aiText = aiOk ? aiPayload.feedback ?? null : null;
      const aiStatus = aiOk
        ? "ready"
        : aiResponse.status === 503
          ? "queued_no_api_key"
          : "error";
      const aiMessage = aiOk
        ? null
        : aiPayload.error ?? "AI feedback could not be generated.";

      const requestedAt = new Date().toISOString();
      const nextMetadata: Record<string, unknown> = {
        aiFeedbackRequested: true,
        aiFeedbackStatus: aiStatus,
        aiFeedbackRequestedAt: requestedAt,
      };
      if (aiText) nextMetadata.aiFeedbackText = aiText;
      const { data: attemptBefore } = await supabase
        .from("diagnostic_attempts")
        .select("metadata")
        .eq("id", savedDiagnosticAttempt.attemptId)
        .eq("user_id", user.id)
        .maybeSingle();
      const currentMetadata =
        attemptBefore?.metadata &&
        typeof attemptBefore.metadata === "object" &&
        !Array.isArray(attemptBefore.metadata)
          ? (attemptBefore.metadata as Record<string, unknown>)
          : {};

      const { error: attemptError } = await supabase
        .from("diagnostic_attempts")
        .update({
          ai_feedback_requested_at: requestedAt,
          ai_feedback_status: aiStatus,
          ...(aiText ? { ai_feedback: aiText } : {}),
          metadata: {
            ...currentMetadata,
            ...(savedDiagnosticAttempt.summary
              ? {
                  summary: savedDiagnosticAttempt.summary,
                }
              : {}),
            ...nextMetadata,
          },
        })
        .eq("id", savedDiagnosticAttempt.attemptId)
        .eq("user_id", user.id);

      if (attemptError) throw attemptError;

      if (aiOk) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ diagnostic_credits: Math.max(0, credits - 1) })
          .eq("id", user.id);

        if (profileError) throw profileError;
      }

      setSavedDiagnosticAttempt((current) =>
        current
          ? {
              ...current,
              aiFeedbackRequestedAt: requestedAt,
              aiFeedbackStatus: aiStatus,
              aiFeedbackText: aiText,
              credits: aiOk ? Math.max(0, credits - 1) : credits,
            }
          : current
      );
      setAiFeedbackState({
        requested: true,
        status: aiOk ? "Feedback ready" : aiStatus,
        credits: aiOk ? Math.max(0, credits - 1) : credits,
        message: aiMessage,
        requesting: false,
        text: aiText,
      });
    } catch (error) {
      setAiFeedbackState((current) =>
        current
          ? {
              ...current,
              requesting: false,
              message:
                error instanceof Error
                  ? error.message
                  : "Could not save AI feedback request.",
            }
          : current
      );
    }
  };

  const beginQuestionTiming = (question: UCATQuestion) => {
    const existing = questionTimingRef.current[question.id];
    questionTimingRef.current[question.id] = {
      questionId: question.id,
      visits: (existing?.visits ?? 0) + 1,
      totalMs: existing?.totalMs ?? 0,
      answeredAtMs: existing?.answeredAtMs,
    };
    questionStartedAtRef.current = nowMs();
    setTimingSnapshot({ ...questionTimingRef.current });
  };

  const commitQuestionTiming = () => {
    const activeQuestion = questions[questionIndex];
    if (!activeQuestion) return;

    const elapsed = Math.max(0, nowMs() - questionStartedAtRef.current);
    const existing = questionTimingRef.current[activeQuestion.id] ?? {
      questionId: activeQuestion.id,
      visits: 0,
      totalMs: 0,
    };
    questionTimingRef.current[activeQuestion.id] = {
      ...existing,
      totalMs: existing.totalMs + elapsed,
    };
    questionStartedAtRef.current = nowMs();
    setTimingSnapshot({ ...questionTimingRef.current });
  };

  const getActiveQuestionElapsedMs = () => {
    const activeQuestion = questions[questionIndex];
    if (!activeQuestion) return 0;

    const existing = questionTimingRef.current[activeQuestion.id];
    return (
      (existing?.totalMs ?? 0) +
      Math.max(0, nowMs() - questionStartedAtRef.current)
    );
  };

  const markActiveQuestionAnswered = () => {
    const activeQuestion = questions[questionIndex];
    if (!activeQuestion) return 0;

    const answeredAtMs = getActiveQuestionElapsedMs();
    const existing = questionTimingRef.current[activeQuestion.id];
    questionTimingRef.current[activeQuestion.id] = {
      questionId: activeQuestion.id,
      visits: existing?.visits ?? 1,
      totalMs: existing?.totalMs ?? 0,
      answeredAtMs,
    };
    setTimingSnapshot({ ...questionTimingRef.current });
    return answeredAtMs;
  };

  const commitAttentionSnapshot = (reason: string) => {
    if (attentionTracker.trackingMode === "none") return;

    const zoneTimes = attentionTracker.finishAttempt(nowMs(), {
      keepTracking: true,
    });
    const snapshot = attentionTracker.getSnapshot();
    const stimulusQuestionFlips = snapshot.regionTransitions.filter(
      ({ from, to }) =>
        (from === "stimulus" && to === "question") ||
        (from === "question" && to === "stimulus")
    ).length;
    const questionAnswerFlips = snapshot.regionTransitions.filter(
      ({ from, to }) =>
        (from === "question" && to === "answers") ||
        (from === "answers" && to === "question")
    ).length;
    const stimulusAnswerFlips = snapshot.regionTransitions.filter(
      ({ from, to }) =>
        (from === "stimulus" && to === "answers") ||
        (from === "answers" && to === "stimulus")
    ).length;
    recordEvent("attention_snapshot", {
      reason,
      mode: snapshot.trackingMode,
      dataReceived: snapshot.dataReceived,
      switches: snapshot.regionSwitchCount,
      stimulusMs: Math.round(zoneTimes.stimulus),
      questionMs: Math.round(zoneTimes.question),
      answersMs: Math.round(zoneTimes.answers),
      stimulusQuestionFlips,
      questionAnswerFlips,
      stimulusAnswerFlips,
      stimulusRevisits: snapshot.regionTransitions.filter(
        ({ to }) => to === "stimulus"
      ).length,
      questionRevisits: snapshot.regionTransitions.filter(
        ({ to }) => to === "question"
      ).length,
      answerRevisits: snapshot.regionTransitions.filter(
        ({ to }) => to === "answers"
      ).length,
    });
  };

  useEffect(() => {
    if (!started || !sessionTimed) return;

    const intervalId = window.setInterval(() => {
      setTimeRemaining((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [started, sessionTimed]);

  useEffect(() => {
    if (started && phase !== "review") {
      appRootRef.current?.focus();
    }
  }, [started, phase, questionIndex]);

  useEffect(
    () => () => {
      resetAttentionTracker();
    },
    [resetAttentionTracker]
  );

  const toggleSubtype = (subtype: UCATSubtypeId) => {
    recordEvent("setup_subtype_toggle", { subtype });
    setSelectedSubtypeIds((current) =>
      current.includes(subtype)
        ? current.filter((item) => item !== subtype)
        : [...current, subtype]
    );
  };

  const beginPracticeSession = (activeTrackingMode: TrackingMode) => {
    const nextQuestions =
      fixedDiagnosticQuestions ?? availableQuestions.slice(0, setupQuestionCount);
    if (nextQuestions.length === 0) return;
    const isFixedDiagnostic = Boolean(fixedDiagnosticQuestions);
    const nextTimed = isFixedDiagnostic || lengthMode === "minutes" || timed;

    scrollToQuestionTop();
    setNavigatorOpen(false);
    setQuestionIndex(0);
    setSelected(null);
    setRevealed(false);
    setAnswers({});
    setFlags({});
    setPhase("practice");
    setSessionQuestions(nextQuestions);
    setDragOrder(getDragOrder(nextQuestions[0]));
    setSessionTimed(nextTimed);
    setSessionDurationSeconds(setupTimeSeconds);
    setTimeRemaining(setupTimeSeconds);
    setMarkedSummary(null);
    markedSummaryRef.current = null;
    markedInsightsHistoryActiveRef.current = false;
    setSaveState({ status: "idle", message: "Not saved yet" });
    trackingEventsRef.current = [];
    setTrackingEventsSnapshot([]);
    questionTimingRef.current = {};
    const startedAt = nowMs();
    sessionStartedAtRef.current = startedAt;
    setSessionStartedAt(startedAt);
    setTimingSnapshot({});
    setTrackingEventCount(0);
    setStarted(true);
    beginQuestionTiming(nextQuestions[0]);
    attentionTracker.resetAttempt(nowMs());
    recordEvent(diagnosticMode ? "start_diagnostic" : "start_practice", {
      section: validSection,
      diagnosticMode,
      mockId: diagnosticMode ? mockId : null,
      questionCount: nextQuestions.length,
      lengthMode,
      sectionMockTiming:
        diagnosticMode === "full-section" ? sectionMockTiming : null,
      timed: nextTimed,
      seconds: setupTimeSeconds,
      requestedMinutes: lengthMode === "minutes" ? selectedMinutes : null,
      trackingMode: activeTrackingMode,
      trackingRing: attentionTracker.showRing,
    });
  };

  const startPractice = () => {
    if (questionProgressLoading || setupQuestionCount === 0) return;

    if (trackingModeChoice === "eye") {
      void attentionTracker.startEyeTracking(() => beginPracticeSession("eye"));
      return;
    }

    if (trackingModeChoice === "mouse") {
      attentionTracker.startMouseTracking();
      beginPracticeSession("mouse");
      return;
    }

    attentionTracker.startPracticeOnly();
    beginPracticeSession("none");
  };

  if (!started && attentionTracker.eyeStatus !== "idle") {
    return (
      <TrackingCalibrationScreen
        status={attentionTracker.eyeStatus}
        calibPhase={attentionTracker.calibPhase}
        calibCountdown={attentionTracker.calibCountdown}
      />
    );
  }

  if (!started && diagnosticMode === "free-qr" && savedDiagnosticAttempt) {
    return (
      <MarkedReviewScreen
        sectionTitle="Free QR diagnostic"
        summary={savedDiagnosticAttempt.summary}
        saveState={{ status: "saved", message: "Saved diagnostic report" }}
        isPremium={true}
        diagnosticMode={diagnosticMode}
        aiFeedbackState={aiFeedbackState}
        checkoutLoading={checkoutLoading}
        checkoutError={checkoutError}
        onUpgrade={handleUpgrade}
        onReviewAnswers={() => {
          const restoredQuestions = savedDiagnosticAttempt.summary.questions
            .map((item) =>
              sectionQuestions.find((question) => question.id === item.questionId)
            )
            .filter((question): question is UCATQuestion => Boolean(question));
          const restoredAnswers: Record<number, PracticeAnswer> = {};
          const restoredFlags: Record<number, boolean> = {};

          savedDiagnosticAttempt.summary.questions.forEach((item, index) => {
            if (item.selectedAnswer) restoredAnswers[index] = item.selectedAnswer;
            if (item.flagged) restoredFlags[index] = true;
          });

          setMarkedSummary(savedDiagnosticAttempt.summary);
          markedSummaryRef.current = savedDiagnosticAttempt.summary;
          setQuestionIndex(0);
          setAnswers(restoredAnswers);
          setFlags(restoredFlags);
          setSessionQuestions(restoredQuestions);
          setStarted(true);
          setRevealed(true);
          phaseRef.current = "marked-review";
          setPhase("marked-review");
          scrollToQuestionTop();
        }}
        onRequestAiFeedback={requestDiagnosticAiFeedback}
      />
    );
  }

  if (!started && diagnosticMode === "free-qr" && aiFeedbackState?.credits === 0) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] px-4 py-8 text-[#111827]">
        <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-black">Free diagnostic unavailable</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
            {aiFeedbackState.message ??
              "Create or log in to your account to use the free diagnostic."}
          </p>
          <Link
            href="/phloemai/dashboard"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-black text-white hover:bg-blue-700"
          >
            Go to account
          </Link>
        </div>
      </div>
    );
  }

  if (!started && fixedDiagnosticQuestions) {
    return (
      <FixedDiagnosticStartScreen
        title={
          diagnosticMode === "free-qr"
            ? "Free QR diagnostic"
            : `${selectedMock.label}: ${meta.title}`
        }
        subtitle={
          diagnosticMode === "free-qr"
            ? "A fixed 10-minute QR diagnostic with 14 questions. Complete it to save your first report."
            : fixedDiagnosticScope === "full-mock"
              ? `This is the ${meta.title} section from ${selectedMock.label}. Read the briefing, then start the timed section when you are ready.`
              : `A timed ${meta.title} subtest from ${selectedMock.label}. Your result includes estimated scoring and issue detection.`
        }
        section={validSection}
        questionCount={fixedDiagnosticQuestions.length}
        seconds={setupTimeSeconds}
        backHref={backHref}
        backLabel={backLabel}
        timingMode={
          diagnosticMode === "full-section" ? sectionMockTiming : undefined
        }
        onTimingModeChange={
          diagnosticMode === "full-section"
            ? (mode) => {
                setSectionMockTiming(mode);
                recordEvent("setup_section_mock_timing", { mode });
              }
            : undefined
        }
        lockedNotice={
          diagnosticMode === "free-qr"
            ? "Once completed, this report is saved to your account and shown again instead of allowing a reattempt."
            : undefined
        }
        loading={freeDiagnosticLoading}
        showAiCredit={diagnosticMode === "free-qr"}
        mock={diagnosticMode === "free-qr" ? undefined : selectedMock}
        scope={fixedDiagnosticScope}
        onStart={startPractice}
      />
    );
  }

  if (!started) {
    return (
      <SectionSetup
        section={validSection}
        diagnosticMode={diagnosticMode}
        backHref={backHref}
        backLabel={backLabel}
        reviewMode={reviewMode}
        selectedSubtypeIds={selectedSubtypeIds}
        questionCount={setupQuestionCount}
        availableCount={availableQuestions.length}
        completedQuestionIds={completedQuestionIds}
        savedPracticeSets={savedPracticeSets}
        progressLoading={questionProgressLoading}
        lengthMode={lengthMode}
        questionTarget={questionTarget}
        minuteTarget={minuteTarget}
        customMinutes={customMinutes}
        timed={lengthMode === "minutes" ? true : timed}
        onSelectMixed={() => {
          setSelectedSubtypeIds([]);
          recordEvent("setup_mixed_selected");
        }}
        onToggleSubtype={toggleSubtype}
        onLengthModeChange={(mode) => {
          setLengthMode(mode);
          if (mode === "minutes") setTimed(true);
          recordEvent("setup_length_mode", { mode });
        }}
        onQuestionTargetChange={(count) => {
          setQuestionTarget(count);
          recordEvent("setup_question_target", { count });
        }}
        onMinuteTargetChange={(minutes) => {
          setMinuteTarget(minutes);
          setTimed(true);
          recordEvent("setup_minute_target", {
            minutes: minutes === "custom" ? "custom" : minutes,
          });
        }}
        onCustomMinutesChange={(minutes) => {
          setCustomMinutes(minutes);
          setLengthMode("minutes");
          setMinuteTarget("custom");
          setTimed(true);
          recordEvent("setup_custom_minutes", { minutes });
        }}
        onTimedChange={(nextTimed) => {
          setTimed(nextTimed);
          recordEvent("setup_timed_toggle", { timed: nextTimed });
        }}
        trackingMode={trackingModeChoice}
        trackingRingVisible={attentionTracker.showRing}
        trackingError={attentionTracker.error}
        trackingStarting={attentionTracker.eyeStatus !== "idle"}
        onTrackingModeChange={(mode) => {
          setTrackingModeChoice(mode);
          recordEvent("setup_tracking_mode", { mode });
          if (mode === "none") attentionTracker.startPracticeOnly();
        }}
        onTrackingRingChange={(visible) => {
          attentionTracker.setShowRing(visible);
          recordEvent("setup_tracking_ring", { visible });
        }}
        onStart={startPractice}
        onReviewSavedSet={reviewSavedPracticeSet}
        mock={diagnosticMode ? selectedMock : undefined}
      />
    );
  }

  const question = questions[questionIndex];
  const savedAnswer = answers[questionIndex];
  const selectedAnswer =
    selected ?? (typeof savedAnswer === "string" ? savedAnswer : null);
  const isDragQuestion = isUCATDragOrderQuestion(question);
  const isDragCategoryQuestion = isUCATDragCategoryQuestion(question);
  const isYesNoQuestion = isUCATYesNoQuestion(question);
  const isSingleQuestion = isUCATSingleSelectQuestion(question);
  const dragCategoryAnswer =
    isDragCategoryQuestion && isPracticeAnswerMap(savedAnswer) ? savedAnswer : {};
  const yesNoAnswer =
    isYesNoQuestion && isPracticeAnswerMap(savedAnswer) ? savedAnswer : {};
  const currentAnswerForScore = isDragQuestion ? dragOrder : savedAnswer;
  const currentAnswerScore = getAnswerScore(question, currentAnswerForScore);
  const isCorrect = currentAnswerScore.status === "correct";
  const isPartial = currentAnswerScore.status === "partial";
  const usesClassicDropLayout = isDragCategoryQuestion || isYesNoQuestion;
  const isSjtDropLayout =
    isDragCategoryQuestion && question.section === "sjt";

  const chooseAnswer = (key: UCATOptionKey, source: "click" | "keyboard" = "click") => {
    if (phase !== "practice" || !isSingleQuestion) return;

    const previousAnswer = answers[questionIndex];
    const previousAnswerKey =
      typeof previousAnswer === "string" ? previousAnswer : null;
    const questionElapsedMs = markActiveQuestionAnswered();
    const correctAnswerKey = question.answer;
    setSelected(key);
    setAnswers((current) => ({ ...current, [questionIndex]: key }));
    recordEvent("answer_select", {
      answer: key,
      source,
      previousAnswer: previousAnswerKey,
      correct: correctAnswerKey ? key === correctAnswerKey : false,
      previousCorrect:
        previousAnswerKey && correctAnswerKey
          ? previousAnswerKey === correctAnswerKey
          : null,
      questionElapsedMs,
    });
    setRevealed(false);
  };

  const chooseYesNoAnswer = (
    statementId: string,
    value: UCATYesNoValue,
    source: "click" | "keyboard" | "drag" = "click"
  ) => {
    if (phase !== "practice" || !isYesNoQuestion) return;

    const previousAnswer = answers[questionIndex];
    const previousAnswerMap = isPracticeAnswerMap(previousAnswer)
      ? previousAnswer
      : {};
    const previousValue = previousAnswerMap[statementId] ?? null;
    const statement = question.yesNoStatements.find(
      (item) => item.id === statementId
    );
    const questionElapsedMs = markActiveQuestionAnswered();
    const nextAnswer = { ...previousAnswerMap, [statementId]: value };

    setAnswers((current) => ({ ...current, [questionIndex]: nextAnswer }));
    recordEvent("answer_select", {
      answer: value,
      statementId,
      source,
      previousAnswer: previousValue,
      correct: statement ? value === statement.answer : false,
      previousCorrect:
        previousValue && statement ? previousValue === statement.answer : null,
      questionElapsedMs,
    });
    setRevealed(false);
  };

  const chooseDragCategoryAnswer = (
    itemId: string,
    categoryId: string,
    source: "click" | "drag" = "click"
  ) => {
    if (phase !== "practice" || !isDragCategoryQuestion) return;

    const previousAnswer = answers[questionIndex];
    const previousAnswerMap = isPracticeAnswerMap(previousAnswer)
      ? previousAnswer
      : {};
    const previousCategory = previousAnswerMap[itemId] ?? null;
    const item = question.categoryItems.find(
      (categoryItem) => categoryItem.id === itemId
    );
    const questionElapsedMs = markActiveQuestionAnswered();
    const nextAnswer = { ...previousAnswerMap, [itemId]: categoryId };

    setAnswers((current) => ({ ...current, [questionIndex]: nextAnswer }));
    recordEvent("answer_select", {
      answer: categoryId,
      itemId,
      source,
      previousAnswer: previousCategory,
      correct: item ? categoryId === item.answerCategory : false,
      previousCorrect:
        previousCategory && item ? previousCategory === item.answerCategory : null,
      questionElapsedMs,
    });
    setRevealed(false);
  };

  const chooseNextDragCategoryAnswer = (
    itemId: string,
    selectedCategory?: string
  ) => {
    if (!isDragCategoryQuestion || question.categories.length === 0) return;

    const currentIndex = selectedCategory
      ? question.categories.findIndex((category) => category.id === selectedCategory)
      : -1;
    const nextCategory =
      question.categories[(currentIndex + 1) % question.categories.length];

    if (nextCategory) chooseDragCategoryAnswer(itemId, nextCategory.id);
  };

  const chooseNextYesNoAnswer = (
    statementId: string,
    currentAnswer?: UCATYesNoValue
  ) => {
    chooseYesNoAnswer(statementId, currentAnswer === "Yes" ? "No" : "Yes");
  };

  const hasUnseenScrollableContent = () => {
    if (phase !== "practice" || questionScrollSeen) return false;

    const documentElement = document.documentElement;
    const pageHeight = Math.max(
      documentElement.scrollHeight,
      document.body.scrollHeight
    );

    return pageHeight - window.innerHeight > 48;
  };

  const guardScrollableContentBeforeLeaving = (
    source: "next" | "previous" | "navigator" | "review"
  ) => {
    if (!hasUnseenScrollableContent()) return true;

    setUnseenContentOpen(true);
    recordEvent("unseen_content_prompt", {
      source,
      question: questionIndex + 1,
    });
    return false;
  };

  const goToQuestion = (index: number) => {
    scrollToQuestionTop();
    commitQuestionTiming();
    commitAttentionSnapshot("leave_question");
    const nextAnswer = answers[index];
    setQuestionIndex(index);
    setSelected(typeof nextAnswer === "string" ? nextAnswer : null);
    setDragOrder(getDragOrder(questions[index], nextAnswer));
    setRevealed(false);
    setNavigatorOpen(false);
    beginQuestionTiming(questions[index]);
    attentionTracker.resetAttempt(nowMs());
    recordEvent("go_to_question", { index: index + 1 });
  };

  const requestGoToQuestion = (index: number) => {
    if (index === questionIndex) {
      setNavigatorOpen(false);
      return;
    }

    if (!guardScrollableContentBeforeLeaving("navigator")) return;
    goToQuestion(index);
  };

  const moveDragItem = (fromIndex: number, toIndex: number) => {
    if (!isDragQuestion || fromIndex === toIndex || phase !== "practice") return;

    const next = [...dragOrder];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    const questionElapsedMs = markActiveQuestionAnswered();
    setDragOrder(next);
    setAnswers((answerState) => ({ ...answerState, [questionIndex]: next }));
    recordEvent("drag_reorder", {
      from: fromIndex + 1,
      to: toIndex + 1,
      order: next.join(" > "),
      correct: sameOrder(next, question.answerOrder),
      questionElapsedMs,
    });
    setRevealed(false);
  };

  const nextQuestion = () => {
    const nextIndex = Math.min(questionIndex + 1, questions.length - 1);
    if (nextIndex === questionIndex) return;
    if (!guardScrollableContentBeforeLeaving("next")) return;
    recordEvent("next_question", { to: nextIndex + 1 });
    goToQuestion(nextIndex);
  };

  const previousQuestion = () => {
    const nextIndex = Math.max(questionIndex - 1, 0);
    if (nextIndex === questionIndex) return;
    if (!guardScrollableContentBeforeLeaving("previous")) return;
    recordEvent("previous_question", { to: nextIndex + 1 });
    goToQuestion(nextIndex);
  };

  const toggleFlag = (source: "button" | "keyboard" = "button") => {
    if (phase !== "practice") return;

    setFlags((current) => {
      const next = !current[questionIndex];
      recordEvent("flag_toggle", { flagged: next, source });
      return { ...current, [questionIndex]: next };
    });
  };

  const showMarkedInsights = () => {
    if (
      typeof window !== "undefined" &&
      !markedInsightsHistoryActiveRef.current
    ) {
      window.history.pushState(
        { phloemaiQuestionBankView: "marked-insights" },
        "",
        window.location.href
      );
      markedInsightsHistoryActiveRef.current = true;
    }

    phaseRef.current = "marked";
    setNavigatorOpen(false);
    setPhase("marked");
    scrollToQuestionTop();
  };

  const reviewMarkedAnswers = () => {
    const shouldStepBack =
      typeof window !== "undefined" && markedInsightsHistoryActiveRef.current;
    markedInsightsHistoryActiveRef.current = false;
    phaseRef.current = "marked-review";
    setNavigatorOpen(false);
    setRevealed(true);
    setPhase("marked-review");
    scrollToQuestionTop();

    if (shouldStepBack) {
      window.setTimeout(() => window.history.back(), 0);
    }
  };

  function reviewSavedPracticeSet(set: SavedPracticeSet) {
    const restoredQuestions: UCATQuestion[] = [];
    const restoredAnswers: Record<number, PracticeAnswer> = {};
    const restoredFlags: Record<number, boolean> = {};

    set.summary.questions.forEach((item) => {
      const restoredQuestion = sectionQuestions.find(
        (question) => question.id === item.questionId
      );
      if (!restoredQuestion) return;

      const nextIndex = restoredQuestions.length;
      restoredQuestions.push(restoredQuestion);
      if (item.selectedAnswer) restoredAnswers[nextIndex] = item.selectedAnswer;
      if (item.flagged) restoredFlags[nextIndex] = true;
    });

    if (restoredQuestions.length === 0) return;

    commitQuestionTiming();
    attentionTracker.resetTracker();
    markedInsightsHistoryActiveRef.current = false;
    markedSummaryRef.current = set.summary;
    setMarkedSummary(set.summary);
    setSessionQuestions(restoredQuestions);
    setAnswers(restoredAnswers);
    setFlags(restoredFlags);
    setQuestionIndex(0);
    setSelected(
      typeof restoredAnswers[0] === "string"
        ? (restoredAnswers[0] as UCATOptionKey)
        : null
    );
    setDragOrder(getDragOrder(restoredQuestions[0], restoredAnswers[0]));
    setRevealed(true);
    setNavigatorOpen(false);
    setStarted(true);
    phaseRef.current = "marked";
    setPhase("marked");
    scrollToQuestionTop();
  }

  const openReview = () => {
    if (!guardScrollableContentBeforeLeaving("review")) return;

    scrollToQuestionTop();
    commitQuestionTiming();
    commitAttentionSnapshot("open_review");
    setNavigatorOpen(false);
    setPhase("review");
    recordEvent("review_open", {
      answered: questions.filter((item, index) => isAnswered(item, answers[index]))
        .length,
      total: questions.length,
    });
  };

  const markPractice = () => {
    scrollToQuestionTop();
    commitQuestionTiming();
    commitAttentionSnapshot("mark_practice");
    const completedAt = nowMs();
    recordEvent("mark_practice", {
      correct: questions.filter((item, index) => isAnswerCorrect(item, answers[index]))
        .length,
      total: questions.length,
    });
    const finalEvents = [...trackingEventsRef.current];
    const finalTimings = { ...questionTimingRef.current };
    const summary = buildPracticeSessionSummary({
      section: validSection,
      sectionTitle: meta.bankTitle,
      mockId: diagnosticMode ? mockId : null,
      mockScope: diagnosticMode ? fixedDiagnosticScope : null,
      mockLabel: diagnosticMode ? selectedMock.label : null,
      questions,
      answers,
      flags,
      timings: finalTimings,
      events: finalEvents,
      startedAt: sessionStartedAtRef.current || completedAt,
      completedAt,
      timed: sessionTimed,
      setSeconds: sessionDurationSeconds,
      secondsRemaining: timeRemaining,
      trackingMode: attentionTracker.trackingMode,
    });
    setQuestionIndex(0);
    setSelected(typeof answers[0] === "string" ? answers[0] : null);
    setDragOrder(getDragOrder(questions[0], answers[0]));
    setRevealed(true);
    markedSummaryRef.current = summary;
    setMarkedSummary(summary);
    if (!diagnosticMode) {
      setCompletedQuestionIds((current) => {
        const next = new Set(current);
        summary.questions.forEach((item) => next.add(item.questionId));
        return next;
      });
      setSavedPracticeSets((current) => [
        {
          id: `local-${summary.completedAt}`,
          summary,
          completedAt: summary.completedAt,
          source: "question_bank",
        },
        ...current,
      ]);
    }
    if (diagnosticMode) {
      phaseRef.current = "diagnostic-complete";
      setNavigatorOpen(false);
      setPhase("diagnostic-complete");
    } else {
      showMarkedInsights();
    }
    beginQuestionTiming(questions[0]);
    void persistPracticeSummary(summary, finalEvents);
  };

  const dragItemLookup = isDragQuestion
    ? new Map(question.dragItems.map((item) => [item.id, item.text]))
    : new Map<string, string>();
  const correctOrderText = isDragQuestion
    ? question.answerOrder
        .map((itemId, index) => `${index + 1}. ${dragItemLookup.get(itemId)}`)
        .join(" ")
    : "";
  const currentQuestionSummary =
    markedSummary?.questions[questionIndex] ??
    liveSummary?.questions[questionIndex] ??
    null;

  const reviewingMarkedAnswers = phase === "marked-review";
  const answerRevealed = revealed || reviewingMarkedAnswers;
  const supportsCalculator = true;
  const calcValue = Number(calcDisplay) || 0;

  const recordCalculator = (
    action: string,
    value?: string,
    source: "button" | "keyboard" = "button"
  ) => {
    recordEvent("calculator", { action, value: value ?? null, source });
  };

  const resetCalculator = (source: "button" | "keyboard" = "button") => {
    setCalcDisplay("0");
    setCalcStored(null);
    setCalcOperator(null);
    setCalcWaiting(false);
    recordCalculator("clear", undefined, source);
  };

  const calculate = (stored: number, current: number, operator: string) => {
    if (operator === "+") return stored + current;
    if (operator === "-") return stored - current;
    if (operator === "*") return stored * current;
    if (operator === "/") return current === 0 ? 0 : stored / current;
    return current;
  };

  const commitCalcOperation = (
    nextOperator?: string,
    source: "button" | "keyboard" = "button"
  ) => {
    const current = Number(calcDisplay) || 0;
    if (calcStored === null || calcOperator === null) {
      setCalcStored(current);
    } else {
      const result = calculate(calcStored, current, calcOperator);
      setCalcDisplay(String(Number(result.toFixed(8))));
      setCalcStored(result);
    }
    setCalcOperator(nextOperator ?? null);
    setCalcWaiting(true);
    recordCalculator("operator", nextOperator ?? "=", source);
  };

  const inputCalcDigit = (
    digit: string,
    source: "button" | "keyboard" = "button"
  ) => {
    setCalcDisplay((current) =>
      calcWaiting || current === "0" ? digit : `${current}${digit}`
    );
    setCalcWaiting(false);
    recordCalculator("digit", digit, source);
  };

  const inputCalcDecimal = (source: "button" | "keyboard" = "button") => {
    setCalcDisplay((current) =>
      calcWaiting ? "0." : current.includes(".") ? current : `${current}.`
    );
    setCalcWaiting(false);
    recordCalculator("decimal", undefined, source);
  };

  const memoryRecallClear = (source: "button" | "keyboard" = "button") => {
    const now = nowMs();
    if (now - lastMrcAt < 700) {
      setCalcMemory(0);
      setCalcDisplay("0");
      setLastMrcAt(0);
      recordCalculator("memory_clear", undefined, source);
      return;
    }

    setCalcDisplay(String(calcMemory));
    setCalcWaiting(true);
    setLastMrcAt(now);
    recordCalculator("memory_recall", undefined, source);
  };

  const memoryAdd = (
    sign: 1 | -1,
    source: "button" | "keyboard" = "button"
  ) => {
    setCalcMemory((current) => current + sign * calcValue);
    setCalcWaiting(true);
    recordCalculator(sign === 1 ? "memory_plus" : "memory_minus", undefined, source);
  };

  const toggleCalculator = (source: "button" | "keyboard" = "button") => {
    if (!supportsCalculator) return;
    setCalculatorOpen((current) => !current);
    recordCalculator(calculatorOpen ? "close" : "open", undefined, source);
  };

  const handlePracticeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const key = event.key.toLowerCase();

    if (event.altKey) {
      if (key === "n") {
        event.preventDefault();
        recordEvent("shortcut", { shortcut: "Alt+N", action: "next_question" });
        nextQuestion();
        return;
      }
      if (key === "p") {
        event.preventDefault();
        recordEvent("shortcut", { shortcut: "Alt+P", action: "previous_question" });
        previousQuestion();
        return;
      }
      if (key === "c") {
        event.preventDefault();
        recordEvent("shortcut", { shortcut: "Alt+C", action: "calculator" });
        toggleCalculator("keyboard");
        return;
      }
      if (key === "f") {
        event.preventDefault();
        recordEvent("shortcut", { shortcut: "Alt+F", action: "flag" });
        toggleFlag("keyboard");
        return;
      }
    }

    if (phase !== "practice") return;

    if (calculatorOpen && supportsCalculator) {
      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        inputCalcDigit(event.key, "keyboard");
        return;
      }
      if (event.key === ".") {
        event.preventDefault();
        inputCalcDecimal("keyboard");
        return;
      }
      if (["+", "-", "*", "/"].includes(event.key)) {
        event.preventDefault();
        commitCalcOperation(event.key, "keyboard");
        return;
      }
      if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        commitCalcOperation(undefined, "keyboard");
        return;
      }
      if (event.key === "Backspace") {
        event.preventDefault();
        setCalcDisplay("0");
        setCalcWaiting(false);
        recordCalculator("backspace", undefined, "keyboard");
        return;
      }
      if (key === "m") {
        event.preventDefault();
        memoryAdd(-1, "keyboard");
        return;
      }
      if (key === "p") {
        event.preventDefault();
        memoryAdd(1, "keyboard");
        return;
      }
      if (key === "c") {
        event.preventDefault();
        memoryRecallClear("keyboard");
        return;
      }
    }

    if (isSingleQuestion && ["a", "b", "c", "d", "e"].includes(key)) {
      const optionKey = key.toUpperCase() as UCATOptionKey;
      if (question.options.some((option) => option.key === optionKey)) {
        event.preventDefault();
        recordEvent("shortcut", { shortcut: optionKey, action: "answer" });
        chooseAnswer(optionKey, "keyboard");
      }
    }
  };

  if (phase === "review") {
    return (
      <ReviewScreen
        sectionTitle={meta.bankTitle}
        questions={questions}
        answers={answers}
        flags={flags}
        trackingEventCount={trackingEventCount}
        timings={timingSnapshot}
        onGoToQuestion={(index) => {
          setPhase(markedSummary ? "marked-review" : "practice");
          goToQuestion(index);
        }}
        onMark={markPractice}
      />
    );
  }

  if (phase === "diagnostic-complete" && markedSummary) {
    const completionScore = getDiagnosticSectionScore(markedSummary);
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#eef3fb] via-[#f5f8fc] to-white px-4 py-12 text-[#111827]">
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 px-7 pb-8 pt-8 text-white">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <CheckCircle className="h-7 w-7" aria-hidden="true" />
              </div>
              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Diagnostic complete
              </h1>
              <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-emerald-50">
                {diagnosticMode === "free-qr"
                  ? "Your free QR diagnostic has been saved to your account."
                  : "Your diagnostic has been saved."}
              </p>
            </div>
            <div className="px-7 py-6">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Score", formatMarkScore(markedSummary.scorePoints, markedSummary.maxScore)],
                  [completionScore.label, completionScore.value],
                  ["Accuracy", `${markedSummary.accuracy}%`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                  >
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      {label}
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-900">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={showMarkedInsights}
                className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 text-sm font-black text-white shadow-md shadow-blue-100 transition-colors hover:bg-blue-700"
              >
                Open diagnostic report
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <p className="mt-3 text-center text-xs font-semibold text-slate-500">
                Review issues, strengths and a personalised study plan.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "marked" && markedSummary) {
    return (
      <MarkedReviewScreen
        sectionTitle={
          diagnosticMode
            ? `${getDiagnosticTitle(diagnosticMode)} - ${meta.title}`
            : meta.bankTitle
        }
        summary={markedSummary}
        saveState={saveState}
        isPremium={isPremium || diagnosticMode === "free-qr"}
        diagnosticMode={diagnosticMode}
        aiFeedbackState={aiFeedbackState}
        checkoutLoading={checkoutLoading}
        checkoutError={checkoutError}
        onUpgrade={handleUpgrade}
        onReviewAnswers={reviewMarkedAnswers}
        onNewSet={
          diagnosticMode === "free-qr"
            ? undefined
            : () => {
                commitQuestionTiming();
                attentionTracker.resetTracker();
                markedSummaryRef.current = null;
                markedInsightsHistoryActiveRef.current = false;
                setStarted(false);
                setPhase("practice");
                setMarkedSummary(null);
                setSaveState({ status: "idle", message: "Not saved yet" });
              }
        }
        onRequestAiFeedback={requestDiagnosticAiFeedback}
      />
    );
  }

  return (
    <div
      ref={appRootRef}
      className="min-h-screen bg-white font-sans text-black"
      tabIndex={-1}
      onKeyDown={handlePracticeKeyDown}
    >
      {attentionTracker.trackingActive &&
        attentionTracker.showRing &&
        attentionTracker.pointer &&
        phase === "practice" && (
          <div
            className="pointer-events-none fixed z-50 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue-500/80 shadow-[0_0_0_8px_rgba(37,99,235,0.12)]"
            style={{
              left: attentionTracker.pointer.x,
              top: attentionTracker.pointer.y,
            }}
            aria-hidden="true"
          />
        )}
      <header className="flex min-h-14 items-center justify-between bg-[#0078a8] px-3 py-2 text-white">
        <div className="flex items-center gap-3">
          <Link
            href={diagnosticMode ? backHref ?? "/phloemai/diagnostic" : "/phloemai/practice"}
            aria-label={diagnosticMode ? backLabel ?? "Back to diagnostics" : "Back to practice"}
            className="rounded-sm p-1 hover:bg-white/15"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <h1 className="text-lg font-semibold sm:text-2xl">
            {diagnosticMode ? getDiagnosticTitle(diagnosticMode) : meta.bankTitle}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-sm bg-[#00618a] px-3 py-1 text-sm font-semibold sm:inline-flex">
            {attentionTracker.trackingMode === "mouse"
              ? "Mouse tracking"
              : attentionTracker.trackingMode === "eye"
                ? "Eye tracking"
                : "No tracking"}
          </span>
          {attentionTracker.trackingMode !== "none" && (
            <label className="hidden items-center gap-1 rounded-sm bg-[#00618a] px-2 py-1 text-xs font-bold sm:inline-flex">
              <input
                type="checkbox"
                checked={attentionTracker.showRing}
                onChange={(event) =>
                  attentionTracker.setShowRing(event.target.checked)
                }
                className="h-3.5 w-3.5"
              />
              Ring
            </label>
          )}
          <div
            className="rounded-sm bg-[#00618a] px-3 py-1 text-sm font-semibold"
            title={sessionTimed ? `Set time: ${formatDuration(sessionDurationSeconds)}` : undefined}
          >
            {sessionTimed ? formatDuration(timeRemaining) : "Untimed"}
          </div>
          <div className="rounded-sm bg-[#00618a] px-3 py-1 text-sm font-semibold">
            {questionIndex + 1} of {questions.length}
          </div>
        </div>
      </header>

      <div className="flex min-h-9 items-center justify-between gap-3 border-b border-slate-400 bg-[#477dbc] px-2 text-white">
        <div className="flex items-center gap-4">
          {supportsCalculator && (
            <button
              type="button"
              onClick={() => toggleCalculator()}
              className="inline-flex items-center gap-1 text-sm font-semibold hover:underline sm:text-base"
            >
              <Calculator className="h-5 w-5" aria-hidden="true" />
              Calculator
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setRevealed((current) => !current);
              recordEvent("explain_toggle", { revealed: !revealed });
            }}
            disabled={phase !== "practice"}
            className="inline-flex items-center gap-1 text-sm font-semibold hover:underline disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
          >
            <HelpCircle className="h-5 w-5" aria-hidden="true" />
            {answerRevealed ? "Hide Answer" : "Explain Answer"}
          </button>
          <button
            type="button"
            onClick={() => toggleFlag()}
            disabled={phase !== "practice"}
            className={`inline-flex items-center gap-1 text-sm font-semibold hover:underline sm:text-base ${
              flags[questionIndex] ? "text-amber-200" : ""
            } disabled:cursor-not-allowed disabled:opacity-70`}
          >
            <Flag className="h-5 w-5" aria-hidden="true" />
            Flag for review
          </button>
        </div>
        <select
          aria-label="Colour scheme"
          className="h-8 rounded-none border border-[#1c4e7d] bg-[#477dbc] px-2 text-sm font-semibold text-white"
          defaultValue="default"
          onChange={(event) =>
            recordEvent("colour_scheme_change", { scheme: event.target.value })
          }
        >
          <option value="default">Colour Scheme</option>
          <option value="high-contrast">High Contrast</option>
        </select>
      </div>

      {calculatorOpen && supportsCalculator && (
        <div className="fixed left-4 top-28 z-30 w-64 rounded-sm border border-slate-700 bg-[#f3f4f6] p-3 text-black shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-bold">Calculator</p>
            <button
              type="button"
              onClick={() => toggleCalculator()}
              className="rounded-sm px-2 text-sm font-bold hover:bg-slate-200"
            >
              x
            </button>
          </div>
          <div className="mb-2 rounded-sm border border-slate-500 bg-white px-2 py-2 text-right font-mono text-2xl">
            {calcDisplay}
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-sm font-bold">
            <button type="button" onClick={() => memoryRecallClear()} className="rounded-sm border border-slate-400 bg-white py-2 hover:bg-slate-100">
              MRC
            </button>
            <button type="button" onClick={() => memoryAdd(-1)} className="rounded-sm border border-slate-400 bg-white py-2 hover:bg-slate-100">
              M-
            </button>
            <button type="button" onClick={() => memoryAdd(1)} className="rounded-sm border border-slate-400 bg-white py-2 hover:bg-slate-100">
              M+
            </button>
            <button type="button" onClick={() => resetCalculator()} className="rounded-sm border border-slate-400 bg-white py-2 hover:bg-slate-100">
              CE
            </button>
            {["7", "8", "9"].map((digit) => (
              <button key={digit} type="button" onClick={() => inputCalcDigit(digit)} className="rounded-sm border border-slate-400 bg-white py-2 hover:bg-slate-100">
                {digit}
              </button>
            ))}
            <button type="button" onClick={() => commitCalcOperation("/")} className="rounded-sm border border-slate-400 bg-white py-2 hover:bg-slate-100">
              /
            </button>
            {["4", "5", "6"].map((digit) => (
              <button key={digit} type="button" onClick={() => inputCalcDigit(digit)} className="rounded-sm border border-slate-400 bg-white py-2 hover:bg-slate-100">
                {digit}
              </button>
            ))}
            <button type="button" onClick={() => commitCalcOperation("*")} className="rounded-sm border border-slate-400 bg-white py-2 hover:bg-slate-100">
              *
            </button>
            {["1", "2", "3"].map((digit) => (
              <button key={digit} type="button" onClick={() => inputCalcDigit(digit)} className="rounded-sm border border-slate-400 bg-white py-2 hover:bg-slate-100">
                {digit}
              </button>
            ))}
            <button type="button" onClick={() => commitCalcOperation("-")} className="rounded-sm border border-slate-400 bg-white py-2 hover:bg-slate-100">
              -
            </button>
            <button type="button" onClick={() => inputCalcDigit("0")} className="rounded-sm border border-slate-400 bg-white py-2 hover:bg-slate-100">
              0
            </button>
            <button type="button" onClick={() => inputCalcDecimal()} className="rounded-sm border border-slate-400 bg-white py-2 hover:bg-slate-100">
              .
            </button>
            <button type="button" onClick={() => commitCalcOperation()} className="rounded-sm border border-slate-400 bg-white py-2 hover:bg-slate-100">
              =
            </button>
            <button type="button" onClick={() => commitCalcOperation("+")} className="rounded-sm border border-slate-400 bg-white py-2 hover:bg-slate-100">
              +
            </button>
          </div>
          <p className="mt-2 text-[11px] font-semibold leading-4 text-slate-600">
            Shortcuts: Alt+C opens, / divides, * multiplies, M = M-, P = M+,
            C recalls MRC, double C clears memory, Backspace clears entry.
          </p>
        </div>
      )}

      <main
        className={
          usesClassicDropLayout
            ? "min-h-[calc(100vh-132px)] pb-16"
            : "grid min-h-[calc(100vh-132px)] grid-cols-1 pb-16 md:grid-cols-[3fr_2fr]"
        }
      >
        <section
          ref={stimulusRegionRef}
          className={
            usesClassicDropLayout
              ? "px-5 pt-5"
              : "border-b-[8px] border-[#0078a8] px-7 py-7 md:min-h-[calc(100vh-132px)] md:border-b-0 md:border-r-[10px]"
          }
        >
          <h2 className="sr-only">{question.leftTitle ?? "Information"}</h2>
          <div
            className={
              usesClassicDropLayout
                ? "max-w-[1100px] space-y-3 text-[20px] leading-[28px] text-black"
                : "max-w-none space-y-7 text-[22px] leading-[28px] text-black"
            }
          >
            {question.stimulus.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {question.visual && <QuestionVisual visual={question.visual} />}
          </div>
        </section>

        <section className={usesClassicDropLayout ? "px-5 py-3" : "px-7 py-7"}>
          <div ref={questionRegionRef}>
            <p
              className={
                usesClassicDropLayout
                  ? "max-w-[900px] text-[20px] leading-[28px] text-black"
                  : "text-[22px] leading-[28px] text-black"
              }
            >
              {question.question}
            </p>
          </div>

          {isDragQuestion ? (
            <div ref={answersRegionRef} className="mt-6">
              <p className="rounded-sm border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold leading-6 text-slate-700">
                {question.instruction}
              </p>
              <div className="mt-4 space-y-3">
                {dragOrder.map((itemId, index) => {
                  const itemText = dragItemLookup.get(itemId) ?? itemId;
                  const correctSlot =
                    answerRevealed && question.answerOrder[index] === itemId;
                  const wrongSlot =
                    answerRevealed && question.answerOrder[index] !== itemId;

                  return (
                    <div
                      key={itemId}
                      draggable={phase === "practice"}
                      onDragStart={() => setDraggedItemId(itemId)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (!draggedItemId) return;
                        moveDragItem(
                          dragOrder.indexOf(draggedItemId),
                          dragOrder.indexOf(itemId)
                        );
                        setDraggedItemId(null);
                      }}
                      className={`grid cursor-grab grid-cols-[34px_32px_1fr] items-center gap-3 rounded-sm border px-3 py-3 text-sm leading-6 active:cursor-grabbing sm:text-base ${
                        correctSlot
                          ? "border-emerald-500 bg-emerald-50"
                          : wrongSlot
                            ? "border-amber-400 bg-amber-50"
                            : "border-slate-300 bg-white hover:border-slate-500"
                      }`}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-sm border border-slate-300 bg-slate-100 text-sm font-bold">
                        {index + 1}
                      </span>
                      <GripVertical className="h-5 w-5 text-slate-500" aria-hidden="true" />
                      <span>{itemText}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : isDragCategoryQuestion ? (
            <div
              ref={answersRegionRef}
              className={
                isSjtDropLayout ? "mt-4 max-w-[900px]" : "mt-12 max-w-[1180px]"
              }
            >
              <div
                className={
                  isSjtDropLayout
                    ? "flex items-start gap-4 text-[15px] leading-[18px] text-black max-lg:flex-col"
                    : "flex items-start gap-[14px] text-[22px] leading-[26px] text-black max-xl:flex-col"
                }
              >
                <div
                  className={
                    isSjtDropLayout
                      ? "min-w-0 flex-1 space-y-3"
                      : "w-[960px] max-w-full space-y-5"
                  }
                >
                  {question.categoryItems.map((item) => {
                    const selectedCategory = dragCategoryAnswer[item.id];
                    const selectedCategoryLabel =
                      question.categories.find(
                        (category) => category.id === selectedCategory
                      )?.label ?? "";
                    const correct =
                      answerRevealed &&
                      selectedCategory === item.answerCategory;
                    const wrong =
                      answerRevealed &&
                      Boolean(selectedCategory) &&
                      selectedCategory !== item.answerCategory;
                    const missed = answerRevealed && !selectedCategory;

                    return (
                      <div
                        key={item.id}
                        className={`grid ${
                          isSjtDropLayout
                            ? "gap-3 sm:grid-cols-[minmax(0,1fr)_98px]"
                            : "gap-[18px] sm:grid-cols-[minmax(0,793px)_150px]"
                        }`}
                      >
                        <div
                          className={`flex min-h-[44px] items-center justify-center border px-3 py-2 text-center ${
                            isSjtDropLayout ? "min-h-[66px]" : "min-h-[84px]"
                          } ${
                            correct
                              ? "border-emerald-700 bg-emerald-50"
                              : wrong || missed
                                ? "border-red-700 bg-red-50"
                                : "border-black bg-white"
                          }`}
                        >
                          {item.text}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            chooseNextDragCategoryAnswer(
                              item.id,
                              selectedCategory
                            )
                          }
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => {
                            if (draggedCategoryId) {
                              chooseDragCategoryAnswer(
                                item.id,
                                draggedCategoryId,
                                "drag"
                              );
                            }
                            setDraggedCategoryId(null);
                          }}
                          disabled={phase !== "practice"}
                          aria-label={`Drop answer for ${item.text}`}
                          className={`flex min-h-[44px] w-full items-center justify-center border px-2 text-center font-normal ${
                            isSjtDropLayout
                              ? "min-h-[66px] bg-[#b9b1b1] text-[14px] leading-[16px]"
                              : "min-h-[84px] bg-[#b9b1b1] text-[20px] leading-[24px]"
                          } ${
                            correct
                              ? "border-emerald-700 text-emerald-900"
                              : wrong || missed
                                ? "border-red-700 text-red-900"
                                : "border-black text-black"
                          } disabled:cursor-not-allowed`}
                        >
                          {selectedCategoryLabel ? (
                            selectedCategoryLabel
                          ) : (
                            <span className="sr-only">Drop answer here</span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div
                  className={
                    isSjtDropLayout
                      ? "w-[128px] shrink-0 border border-black bg-white p-3 max-lg:w-full"
                      : "mt-[75px] w-[180px] shrink-0 border border-black bg-[#d9d9d9] p-[14px] max-xl:mt-0 max-xl:w-full"
                  }
                >
                  <div className={isSjtDropLayout ? "space-y-3" : "space-y-[18px]"}>
                    {question.categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        draggable={phase === "practice"}
                        onDragStart={() => setDraggedCategoryId(category.id)}
                        onDragEnd={() => setDraggedCategoryId(null)}
                        disabled={phase !== "practice"}
                        className={`flex w-full cursor-grab items-center justify-center border border-black bg-white px-2 text-center font-normal text-black active:cursor-grabbing disabled:cursor-not-allowed ${
                          isSjtDropLayout
                            ? "min-h-[68px] text-[15px] leading-[18px]"
                            : "min-h-[84px] text-[22px] leading-[26px]"
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : isYesNoQuestion ? (
            <div ref={answersRegionRef} className="mt-12 max-w-[1180px]">
              <div className="flex items-start gap-[14px] text-[22px] leading-[26px] text-black max-xl:flex-col">
                <div className="w-[960px] max-w-full space-y-5">
                  {question.yesNoStatements.map((statement) => {
                    const currentAnswer = yesNoAnswer[statement.id] as
                      | UCATYesNoValue
                      | undefined;
                    const correct =
                      answerRevealed && currentAnswer === statement.answer;
                    const wrong =
                      answerRevealed &&
                      Boolean(currentAnswer) &&
                      currentAnswer !== statement.answer;
                    const missed = answerRevealed && !currentAnswer;

                    return (
                      <div
                        key={statement.id}
                        className="grid gap-[18px] sm:grid-cols-[minmax(0,793px)_150px]"
                      >
                        <div
                          className={`flex min-h-[84px] items-center justify-center border px-5 py-3 text-center ${
                            correct
                              ? "border-emerald-700 bg-emerald-50"
                              : wrong || missed
                                ? "border-red-700 bg-red-50"
                                : "border-black bg-white"
                          }`}
                        >
                          {statement.text}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            chooseNextYesNoAnswer(statement.id, currentAnswer)
                          }
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => {
                            if (draggedYesNoValue) {
                              chooseYesNoAnswer(
                                statement.id,
                                draggedYesNoValue,
                                "drag"
                              );
                            }
                            setDraggedYesNoValue(null);
                          }}
                          disabled={phase !== "practice"}
                          aria-label={`Drop Yes or No for ${statement.text}`}
                          className={`flex min-h-[84px] w-full items-center justify-center border bg-[#b9b1b1] px-2 text-center text-[22px] font-normal leading-[26px] ${
                            correct
                              ? "border-emerald-700 text-emerald-900"
                              : wrong || missed
                                ? "border-red-700 text-red-900"
                                : "border-black text-black"
                          } disabled:cursor-not-allowed`}
                        >
                          {currentAnswer ? (
                            currentAnswer
                          ) : (
                            <span className="sr-only">Drop answer here</span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-[75px] w-[180px] shrink-0 border border-black bg-[#d9d9d9] p-[14px] max-xl:mt-0 max-xl:w-full">
                  <div className="space-y-[18px]">
                    {(["Yes", "No"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        draggable={phase === "practice"}
                        onDragStart={() => setDraggedYesNoValue(value)}
                        onDragEnd={() => setDraggedYesNoValue(null)}
                        disabled={phase !== "practice"}
                        className="flex min-h-[84px] w-full cursor-grab items-center justify-center border border-black bg-white px-2 text-center text-[22px] font-normal leading-[26px] text-black active:cursor-grabbing disabled:cursor-not-allowed"
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : isSingleQuestion ? (
            <div ref={answersRegionRef} className="mt-8 space-y-8">
              {question.options.map((option) => {
                const checked = selectedAnswer === option.key;
                const correct = answerRevealed && option.key === question.answer;
                const partial =
                  answerRevealed &&
                  checked &&
                  isSjtPartialCreditAnswer(question, option.key);
                const wrong = answerRevealed && checked && option.key !== question.answer;

                return (
                  <label
                    key={option.key}
                    className={`grid cursor-pointer grid-cols-[24px_56px_1fr] items-start gap-2 text-[22px] leading-[28px] text-black transition-colors ${
                      correct
                        ? "text-emerald-700"
                        : partial
                        ? "text-yellow-700"
                        : wrong
                          ? "text-red-700"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      checked={checked}
                      onChange={() => chooseAnswer(option.key)}
                      disabled={phase !== "practice"}
                      className="mt-1.5 h-4 w-4 accent-[#0078a8]"
                    />
                    <span className="font-normal">{option.key}.</span>
                    <span>{option.text}</span>
                  </label>
                );
              })}
            </div>
          ) : null}

          {answerRevealed && (
            <div
              className={`mt-8 rounded-sm border p-4 ${
                isCorrect
                  ? "border-emerald-300 bg-emerald-50"
                  : isPartial
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-red-300 bg-red-50"
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-bold">
                {isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                ) : isPartial ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-700" aria-hidden="true" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
                )}
                {isCorrect
                  ? "Full mark awarded"
                  : isPartial
                    ? currentAnswerScore.feedback
                    : currentAnswerScore.status === "unanswered"
                      ? "No answer selected"
                      : "Not quite"}
              </div>
              <p className="mt-2 text-sm font-black text-slate-900">
                {formatMarkScore(
                  currentAnswerScore.points,
                  currentAnswerScore.maxPoints
                )}
              </p>
              {isDragQuestion && (
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-800">
                  Correct order: {correctOrderText}
                </p>
              )}
              {isDragCategoryQuestion && (
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-800">
                  Correct categories: {getCorrectAnswerText(question)}
                </p>
              )}
              {isYesNoQuestion && (
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-800">
                  Correct Yes/No answers: {getCorrectAnswerText(question)}
                </p>
              )}
              {isSingleQuestion && (
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-800">
                  Correct answer: {question.answer}
                </p>
              )}
              <p className="mt-3 text-sm leading-6 text-slate-800">
                {question.explanation}
              </p>
              {currentQuestionSummary && (
                <QuestionDataCollectedPanel
                  item={currentQuestionSummary}
                  compact
                />
              )}
            </div>
          )}
        </section>
      </main>

      {unseenContentOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 px-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="unseen-content-title"
        >
          <div className="w-[min(860px,calc(100vw-2rem))] bg-[#0078a8] text-white shadow-2xl">
            <div
              id="unseen-content-title"
              className="border-b border-white/80 px-4 py-3 text-2xl leading-8"
            >
              Unseen Content
            </div>
            <div className="flex items-start gap-5 px-10 py-7 text-2xl leading-8">
              <Info className="mt-1 h-11 w-11 shrink-0" aria-hidden="true" />
              <p>
                You have not viewed the full question yet. Scroll through all
                visible content before moving on.
              </p>
            </div>
            <div className="pb-5 text-center">
              <button
                type="button"
                onClick={() => setUnseenContentOpen(false)}
                className="border border-white px-5 py-1 text-2xl leading-8 hover:bg-white/10"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {navigatorOpen && (
        <div className="fixed inset-x-3 bottom-14 z-10 rounded-sm border border-slate-500 bg-white p-4 shadow-xl md:left-auto md:right-4 md:w-80">
          <h2 className="text-sm font-bold uppercase tracking-wide">
            Navigator
          </h2>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {questions.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => requestGoToQuestion(index)}
                className={`h-10 rounded-sm border text-sm font-bold ${
                  index === questionIndex
                    ? "border-[#0078a8] bg-[#0078a8] text-white"
                    : flags[index]
                      ? "border-amber-400 bg-amber-50 text-amber-700"
                      : answers[index]
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                        : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      <footer className="fixed inset-x-0 bottom-0 flex h-10 items-center justify-between border-t-2 border-white bg-[#0078a8] text-white">
        <button
          type="button"
          onClick={() => {
            commitQuestionTiming();
            commitAttentionSnapshot("end_bank");
            recordEvent("end_bank");
            attentionTracker.resetTracker();
            markedSummaryRef.current = null;
            markedInsightsHistoryActiveRef.current = false;
            setMarkedSummary(null);
            setPhase("practice");
            setStarted(false);
          }}
          className="flex h-full items-center border-r-2 border-white px-3 text-lg font-semibold hover:bg-[#00618a]"
        >
          End Bank
        </button>
        <div className="flex h-full items-center">
          <button
            type="button"
            onClick={markedSummary ? showMarkedInsights : openReview}
            className="h-full border-l-2 border-white px-4 text-lg font-semibold hover:bg-[#00618a]"
          >
            {markedSummary ? "Summary" : "Review"}
          </button>
          {questionIndex > 0 && (
            <button
              type="button"
              onClick={previousQuestion}
              className="flex h-full items-center gap-1 border-l-2 border-white px-4 text-lg font-semibold hover:bg-[#00618a]"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              Previous
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setNavigatorOpen((current) => !current);
              recordEvent("navigator_toggle", { open: !navigatorOpen });
            }}
            className="flex h-full items-center gap-2 border-l-2 border-white px-4 text-lg font-semibold hover:bg-[#00618a]"
          >
            <ListChecks className="h-5 w-5" aria-hidden="true" />
            Navigator
          </button>
          <button
            type="button"
            onClick={nextQuestion}
            disabled={questionIndex === questions.length - 1}
            className="flex h-full items-center gap-1 border-l-2 border-white px-4 text-lg font-semibold hover:bg-[#00618a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </footer>
    </div>
  );
}
