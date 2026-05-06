"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  createClient as createSupabaseClient,
  hasSupabaseConfig,
} from "@/utils/supabase/client";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calculator,
  CheckCircle,
  Clock3,
  Eye,
  Flag,
  GripVertical,
  HelpCircle,
  ListChecks,
  LockKeyhole,
  MousePointer2,
  Play,
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
  getUCATSubtypeMeta,
  isUCATSection,
  isUCATDragOrderQuestion,
  UCAT_QUESTION_BANK,
  UCAT_SECTIONS,
  UCAT_SUBTYPES,
  type UCATChartVisual,
  type UCATOptionKey,
  type UCATQuestion,
  type UCATSection,
  type UCATSubtypeId,
} from "../_lib/ucatQuestionBank";

type PracticeAnswer = UCATOptionKey | string[];
type SessionLengthMode = "questions" | "minutes";
type PracticePhase = "practice" | "review" | "marked";
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
  startedAt: string;
  completedAt: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctQuestions: number;
  accuracy: number;
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

const QUESTION_TARGETS = [5, 10, 15] as const;
const MINUTE_TARGETS = [5, 10, 15] as const;
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

  return typeof answer === "string"
    ? question.options.find((option) => option.key === answer)?.text ?? answer
    : "No answer";
}

function isAnswerCorrect(question: UCATQuestion, answer?: PracticeAnswer) {
  if (isUCATDragOrderQuestion(question)) {
    return sameOrder(getDragOrder(question, answer), question.answerOrder);
  }

  return typeof answer === "string" && answer === question.answer;
}

function isAnswered(question: UCATQuestion, answer?: PracticeAnswer) {
  if (isUCATDragOrderQuestion(question)) {
    return Array.isArray(answer) && answer.length === question.answerOrder.length;
  }

  return typeof answer === "string";
}

function getCorrectAnswerPayload(question: UCATQuestion): PracticeAnswer {
  return isUCATDragOrderQuestion(question)
    ? question.answerOrder
    : question.answer;
}

function getCorrectAnswerText(question: UCATQuestion) {
  if (isUCATDragOrderQuestion(question)) {
    const itemLookup = new Map(question.dragItems.map((item) => [item.id, item.text]));
    return question.answerOrder
      .map((itemId, index) => `${index + 1}. ${itemLookup.get(itemId) ?? itemId}`)
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
  const answered = isAnswered(question, answer);
  const correct = isAnswerCorrect(question, answer);
  const answerEvents = events.filter((event) => event.type === "answer_select");
  const dragEvents = events.filter((event) => event.type === "drag_reorder");
  let previousAnswer = "";
  let answerSwitches = 0;

  answerEvents.forEach((event) => {
    const nextAnswer = payloadString(event, "answer");
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

      const answerKey = payloadString(event, "answer") as UCATOptionKey;
      return {
        answer: answerKey,
        answerText: getAnswerText(question, answerKey),
        correct: !isUCATDragOrderQuestion(question) && answerKey === question.answer,
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
    questions.length > 0 ? Math.round((correctQuestions / questions.length) * 100) : 0;
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
    startedAt: new Date(startedAt).toISOString(),
    completedAt: new Date(completedAt).toISOString(),
    totalQuestions: questions.length,
    answeredQuestions,
    correctQuestions,
    accuracy,
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
  const entries =
    visual.type === "bar" ? visual.categories : visual.points;

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
}: {
  section: UCATSection;
  selectedSubtypeIds: UCATSubtypeId[];
  questionCount: number;
  availableCount: number;
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
}) {
  const meta = getUCATSectionMeta(section);
  const subtypes = UCAT_SUBTYPES[section];
  const allQuestionCount = UCAT_QUESTION_BANK[section].length;
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
          href="/phloemai/practice"
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to practice
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
              {questionCount} of {availableCount} questions
            </div>
          </div>

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
                    {allQuestionCount}
                  </span>
                </div>
                <p className="mt-2 text-xs font-bold leading-5 text-slate-500">
                  Use every question type in this section.
                </p>
              </button>

              {subtypes.map((subtype) => {
                const active = selectedSubtypeIds.includes(subtype.id);
                const count = UCAT_QUESTION_BANK[section].filter(
                  (question) => question.subtype === subtype.id
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
            disabled={questionCount === 0 || trackingStarting}
            className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 text-sm font-black text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            {trackingStarting ? "Starting..." : "Start practice"}
          </button>
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
    <div className="rounded-sm border border-slate-200 bg-white px-3 py-2">
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
    <div className="mt-4 rounded-sm border border-slate-200 bg-slate-50 p-4">
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
    <section className="rounded-sm border border-slate-300 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black">Whole set data collected</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {sections.map((section) => (
          <div key={section.title} className="rounded-sm border border-slate-200 bg-slate-50 p-4">
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
  onNewSet,
}: {
  sectionTitle: string;
  summary: PracticeSessionSummary;
  saveState: SaveState;
  onNewSet: () => void;
}) {
  const saveClass =
    saveState.status === "saved"
      ? "bg-emerald-50 text-emerald-700"
      : saveState.status === "error"
        ? "bg-red-50 text-red-700"
        : saveState.status === "saving"
          ? "bg-blue-50 text-blue-700"
          : "bg-slate-100 text-slate-600";

  return (
    <div className="min-h-screen bg-[#f6f8fb] font-sans text-[#111827]">
      <header className="bg-[#0078a8] px-4 py-4 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-blue-100">
              Marked review
            </p>
            <h1 className="mt-1 text-2xl font-black">{sectionTitle}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/phloemai/diagnostic"
              className="inline-flex h-10 items-center justify-center rounded-sm bg-white px-4 text-sm font-black text-[#0078a8] hover:bg-slate-100"
            >
              Check practice impact
            </Link>
            <button
              type="button"
              onClick={onNewSet}
              className="inline-flex h-10 items-center justify-center rounded-sm border border-white/50 px-4 text-sm font-black text-white hover:bg-white/10"
            >
              New set
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-5 py-6">
        <section className="rounded-sm border border-slate-300 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-black">Review</h2>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                {summary.correctQuestions}/{summary.totalQuestions} correct -
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
              ["Accuracy", `${summary.accuracy}%`],
              ["Avg time", `${summary.avgSecondsPerQuestion}s`],
              ["Flags", String(summary.flaggedQuestions)],
              ["Answer switches", String(summary.answerSwitches)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-sm border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-2xl font-black">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {summary.questions.map((item) => (
              <article
                key={item.questionId}
                className="rounded-sm border border-slate-300 bg-white p-4"
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
                  </div>
                  <span
                    className={`w-fit rounded-full px-2.5 py-1 text-xs font-black ${
                      item.correct
                        ? "bg-emerald-50 text-emerald-700"
                        : item.answered
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {item.correct ? "Correct" : item.answered ? "Incorrect" : "Unanswered"}
                  </span>
                </div>
                <div className="mt-4 rounded-sm border border-slate-200 bg-slate-50 p-4">
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

        <section className="rounded-sm border border-slate-300 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black">Question-type timing</h2>
          <div className="mt-5 overflow-hidden rounded-sm border border-slate-200">
            <div className="grid grid-cols-[1fr_70px_80px_80px_80px] bg-slate-100 px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-600">
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

        <div className="grid gap-5 lg:grid-cols-3">
          <section className="rounded-sm border border-slate-300 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />
              <h2 className="text-lg font-black">Issues</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm font-semibold text-slate-700">
              <li>Timing pattern needs review.</li>
              <li>Answer uncertainty detected.</li>
              <li>Calculator strategy may be limiting speed.</li>
            </ul>
            <p className="mt-5 rounded-sm bg-amber-50 px-3 py-2 text-xs font-black text-amber-800">
              Want to know more? Upgrade to find out.
            </p>
          </section>

          <section className="rounded-sm border border-slate-300 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              <h2 className="text-lg font-black">Strengths</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm font-semibold text-slate-700">
              <li>Practice set completed and marked.</li>
              <li>Enough telemetry was captured for analysis.</li>
              <li>Review data is ready for pattern mapping.</li>
            </ul>
            <p className="mt-5 rounded-sm bg-amber-50 px-3 py-2 text-xs font-black text-amber-800">
              Want to know more? Upgrade to find out.
            </p>
          </section>

          <section className="rounded-sm border border-slate-300 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <h2 className="text-lg font-black">Personalised study plan</h2>
            </div>
            <div className="mt-4 rounded-sm border border-dashed border-slate-300 bg-slate-50 p-4">
              <LockKeyhole className="h-5 w-5 text-slate-500" aria-hidden="true" />
              <p className="mt-3 text-sm font-black text-slate-800">
                Premium will turn these data points into exact fixes and drills.
              </p>
              <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                For now this stays locked while the rule mapping is being built.
              </p>
            </div>
            <Link
              href="/phloemai/diagnostic"
              className="mt-4 inline-flex h-9 items-center justify-center rounded-sm bg-blue-600 px-4 text-xs font-black text-white hover:bg-blue-700"
            >
              Check practice impact
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}

export function UCATQuestionBankClient({ section }: { section?: string }) {
  const validSection = section && isUCATSection(section) ? section : null;

  if (!validSection) {
    return <SectionHub />;
  }

  return <UCATQuestionBankSection key={validSection} section={validSection} />;
}

function UCATQuestionBankSection({ section: validSection }: { section: UCATSection }) {
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<UCATOptionKey | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<Record<number, PracticeAnswer>>({});
  const [flags, setFlags] = useState<Record<number, boolean>>({});
  const [dragOrder, setDragOrder] = useState<string[]>([]);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [selectedSubtypeIds, setSelectedSubtypeIds] = useState<UCATSubtypeId[]>(
    []
  );
  const [lengthMode, setLengthMode] = useState<SessionLengthMode>("questions");
  const [questionTarget, setQuestionTarget] = useState<number>(5);
  const [minuteTarget, setMinuteTarget] = useState<number | "custom">(5);
  const [customMinutes, setCustomMinutes] = useState("8");
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
  const [saveState, setSaveState] = useState<SaveState>({
    status: "idle",
    message: "Not saved yet",
  });
  const trackingEventsRef = useRef<TrackingEvent[]>([]);
  const questionTimingRef = useRef<Record<string, QuestionTiming>>({});
  const questionStartedAtRef = useRef(0);
  const sessionStartedAtRef = useRef(0);
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

  const sectionQuestions = useMemo(
    () => UCAT_QUESTION_BANK[validSection],
    [validSection]
  );

  const availableQuestions = useMemo(() => {
    if (selectedSubtypeIds.length === 0) return sectionQuestions;
    return sectionQuestions.filter((question) =>
      selectedSubtypeIds.includes(question.subtype)
    );
  }, [sectionQuestions, selectedSubtypeIds]);

  const meta = getUCATSectionMeta(validSection);
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
    desiredQuestionCount,
    availableQuestions.length
  );
  const setupTimeSeconds =
    lengthMode === "minutes"
      ? selectedMinuteSeconds
      : setupQuestionCount * meta.secondsPerQuestion;
  const questions = started ? sessionQuestions : availableQuestions;

  const currentQuestionForTracking = questions[questionIndex];

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
    questions,
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

      const { data: sessionRow, error: sessionError } = await supabase
        .from("practice_sessions")
        .insert({
          user_id: user.id,
          section: summary.section,
          source: "question_bank",
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
    const nextQuestions = availableQuestions.slice(0, setupQuestionCount);
    if (nextQuestions.length === 0) return;

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
    setSessionTimed(lengthMode === "minutes" || timed);
    setSessionDurationSeconds(setupTimeSeconds);
    setTimeRemaining(setupTimeSeconds);
    setMarkedSummary(null);
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
    recordEvent("start_practice", {
      section: validSection,
      questionCount: nextQuestions.length,
      lengthMode,
      timed: lengthMode === "minutes" || timed,
      seconds: setupTimeSeconds,
      requestedMinutes: lengthMode === "minutes" ? selectedMinutes : null,
      trackingMode: activeTrackingMode,
      trackingRing: attentionTracker.showRing,
    });
  };

  const startPractice = () => {
    if (setupQuestionCount === 0) return;

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

  if (!started) {
    return (
      <SectionSetup
        section={validSection}
        selectedSubtypeIds={selectedSubtypeIds}
        questionCount={setupQuestionCount}
        availableCount={availableQuestions.length}
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
      />
    );
  }

  const question = questions[questionIndex];
  const subtype = getUCATSubtypeMeta(question.subtype);
  const savedAnswer = answers[questionIndex];
  const selectedAnswer =
    selected ?? (typeof savedAnswer === "string" ? savedAnswer : null);
  const isDragQuestion = isUCATDragOrderQuestion(question);
  const isCorrect = isDragQuestion
    ? sameOrder(dragOrder, question.answerOrder)
    : selectedAnswer === question.answer;

  const chooseAnswer = (key: UCATOptionKey, source: "click" | "keyboard" = "click") => {
    if (phase === "marked") return;

    const previousAnswer = answers[questionIndex];
    const previousAnswerKey =
      typeof previousAnswer === "string" ? previousAnswer : null;
    const questionElapsedMs = markActiveQuestionAnswered();
    const correctAnswerKey = isUCATDragOrderQuestion(question)
      ? null
      : question.answer;
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

  const moveDragItem = (fromIndex: number, toIndex: number) => {
    if (!isDragQuestion || fromIndex === toIndex || phase === "marked") return;

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
    recordEvent("next_question", { to: nextIndex + 1 });
    goToQuestion(nextIndex);
  };

  const previousQuestion = () => {
    const nextIndex = Math.max(questionIndex - 1, 0);
    recordEvent("previous_question", { to: nextIndex + 1 });
    goToQuestion(nextIndex);
  };

  const toggleFlag = (source: "button" | "keyboard" = "button") => {
    setFlags((current) => {
      const next = !current[questionIndex];
      recordEvent("flag_toggle", { flagged: next, source });
      return { ...current, [questionIndex]: next };
    });
  };

  const openReview = () => {
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
    setMarkedSummary(summary);
    setPhase("marked");
    setQuestionIndex(0);
    setSelected(typeof answers[0] === "string" ? answers[0] : null);
    setDragOrder(getDragOrder(questions[0], answers[0]));
    setRevealed(true);
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
    liveSummary?.questions[questionIndex] ?? null;

  const answerRevealed = revealed || phase === "marked";
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
        setCalcDisplay((current) =>
          current.length > 1 ? current.slice(0, -1) : "0"
        );
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

    if (!isDragQuestion && ["a", "b", "c", "d"].includes(key)) {
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
          setPhase("practice");
          goToQuestion(index);
        }}
        onMark={markPractice}
      />
    );
  }

  if (phase === "marked" && markedSummary) {
    return (
      <MarkedReviewScreen
        sectionTitle={meta.bankTitle}
        summary={markedSummary}
        saveState={saveState}
        onNewSet={() => {
          commitQuestionTiming();
          attentionTracker.resetTracker();
          setStarted(false);
          setPhase("practice");
          setMarkedSummary(null);
          setSaveState({ status: "idle", message: "Not saved yet" });
        }}
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
            href="/phloemai/practice"
            aria-label="Back to practice"
            className="rounded-sm p-1 hover:bg-white/15"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <h1 className="text-lg font-semibold sm:text-2xl">{meta.bankTitle}</h1>
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
            disabled={phase === "marked"}
            className="inline-flex items-center gap-1 text-sm font-semibold hover:underline disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
          >
            <HelpCircle className="h-5 w-5" aria-hidden="true" />
            {answerRevealed ? "Hide Answer" : "Explain Answer"}
          </button>
          <button
            type="button"
            onClick={() => toggleFlag()}
            className={`inline-flex items-center gap-1 text-sm font-semibold hover:underline sm:text-base ${
              flags[questionIndex] ? "text-amber-200" : ""
            }`}
          >
            <Flag className="h-5 w-5" aria-hidden="true" />
            Flag for review
          </button>
          <span className="hidden rounded-sm bg-white/15 px-2 py-1 text-xs font-bold sm:inline-flex">
            {subtype.label}
          </span>
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
            C recalls MRC and double C clears memory.
          </p>
        </div>
      )}

      <main className="grid min-h-[calc(100vh-132px)] grid-cols-1 pb-16 md:grid-cols-[1.15fr_0.85fr]">
        <section
          ref={stimulusRegionRef}
          className="border-r-[6px] border-[#0078a8] px-5 py-5 md:min-h-[calc(100vh-132px)]"
        >
          <h2 className="sr-only">{question.leftTitle ?? "Information"}</h2>
          <div className="max-w-4xl space-y-5 text-base leading-6 sm:text-lg">
            {question.stimulus.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {question.visual && <QuestionVisual visual={question.visual} />}
          </div>
        </section>

        <section className="px-6 py-5">
          <div ref={questionRegionRef}>
            <p className="mb-3 inline-flex rounded-sm bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
              {subtype.label}
            </p>
            <p className="text-base leading-6 sm:text-lg">{question.question}</p>
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
                      draggable={phase !== "marked"}
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
          ) : (
            <div ref={answersRegionRef} className="mt-6 space-y-5">
              {question.options.map((option) => {
                const checked = selectedAnswer === option.key;
                const correct = answerRevealed && option.key === question.answer;
                const wrong = answerRevealed && checked && option.key !== question.answer;

                return (
                  <label
                    key={option.key}
                    className={`grid cursor-pointer grid-cols-[24px_44px_1fr] items-start gap-3 rounded-sm border px-3 py-2 text-base leading-6 sm:text-lg ${
                      correct
                        ? "border-emerald-500 bg-emerald-50"
                        : wrong
                          ? "border-red-500 bg-red-50"
                          : "border-transparent hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      checked={checked}
                      onChange={() => chooseAnswer(option.key)}
                      disabled={phase === "marked"}
                      className="mt-1 h-4 w-4"
                    />
                    <span className="font-semibold">{option.key}.</span>
                    <span>{option.text}</span>
                  </label>
                );
              })}
            </div>
          )}

          {answerRevealed && (
            <div
              className={`mt-8 rounded-sm border p-4 ${
                isCorrect
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-amber-300 bg-amber-50"
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-bold">
                {isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                ) : (
                  <XCircle className="h-5 w-5 text-amber-600" aria-hidden="true" />
                )}
                {isDragQuestion
                  ? "Correct order"
                  : `Correct answer: ${question.answer}`}
              </div>
              {isDragQuestion && (
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-800">
                  {correctOrderText}
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
                onClick={() => goToQuestion(index)}
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
            setMarkedSummary(null);
            setStarted(false);
          }}
          className="flex h-full items-center border-r-2 border-white px-3 text-lg font-semibold hover:bg-[#00618a]"
        >
          End Bank
        </button>
        <div className="flex h-full items-center">
          <button
            type="button"
            onClick={openReview}
            className="h-full border-l-2 border-white px-4 text-lg font-semibold hover:bg-[#00618a]"
          >
            Review
          </button>
          <button
            type="button"
            onClick={previousQuestion}
            disabled={questionIndex === 0}
            className="h-full border-l-2 border-white px-4 text-lg font-semibold hover:bg-[#00618a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
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
