"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  CheckCircle,
  Clock3,
  Flag,
  GripVertical,
  HelpCircle,
  ListChecks,
  Play,
  Timer,
  XCircle,
} from "lucide-react";
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

const QUESTION_TARGETS = [5, 10, 15] as const;
const MINUTE_TARGETS = [5, 10, 15] as const;

function nowMs() {
  return Date.now();
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
            UCAT question bank
          </p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">
            Choose a section to practise
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
                  {section.title}
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
  onStart: () => void;
}) {
  const meta = getUCATSectionMeta(section);
  const subtypes = UCAT_SUBTYPES[section];
  const allQuestionCount = UCAT_QUESTION_BANK[section].length;
  const mixedSelected = selectedSubtypeIds.length === 0;
  const selectedMinutes =
    minuteTarget === "custom"
      ? Number(customMinutes) || 1
      : minuteTarget;
  const setTime =
    lengthMode === "minutes"
      ? Math.max(1, Math.round(selectedMinutes * 60))
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
                {meta.title}
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
                  Uses the official section pace to choose the closest question
                  count for the minutes selected.
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

          <button
            type="button"
            onClick={onStart}
            disabled={questionCount === 0}
            className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 text-sm font-black text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            Start practice
          </button>
        </section>
      </div>
    </div>
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
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcStored, setCalcStored] = useState<number | null>(null);
  const [calcOperator, setCalcOperator] = useState<string | null>(null);
  const [calcWaiting, setCalcWaiting] = useState(false);
  const [calcMemory, setCalcMemory] = useState(0);
  const [lastMrcAt, setLastMrcAt] = useState(0);
  const [trackingEventCount, setTrackingEventCount] = useState(0);
  const [timingSnapshot, setTimingSnapshot] = useState<
    Record<string, QuestionTiming>
  >({});
  const trackingEventsRef = useRef<TrackingEvent[]>([]);
  const questionTimingRef = useRef<Record<string, QuestionTiming>>({});
  const questionStartedAtRef = useRef(0);
  const appRootRef = useRef<HTMLDivElement>(null);

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
    minuteTarget === "custom" ? Number(customMinutes) || 1 : minuteTarget;
  const desiredQuestionCount =
    lengthMode === "minutes"
      ? Math.max(1, Math.round((selectedMinutes * 60) / meta.secondsPerQuestion))
      : questionTarget;
  const setupQuestionCount = clampQuestionCount(
    desiredQuestionCount,
    availableQuestions.length
  );
  const setupTimeSeconds =
    lengthMode === "minutes"
      ? Math.max(1, Math.round(selectedMinutes * 60))
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

  useEffect(() => {
    if (!started || !timed) return;

    const intervalId = window.setInterval(() => {
      setTimeRemaining((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [started, timed]);

  useEffect(() => {
    if (started && phase !== "review") {
      appRootRef.current?.focus();
    }
  }, [started, phase, questionIndex]);

  const toggleSubtype = (subtype: UCATSubtypeId) => {
    recordEvent("setup_subtype_toggle", { subtype });
    setSelectedSubtypeIds((current) =>
      current.includes(subtype)
        ? current.filter((item) => item !== subtype)
        : [...current, subtype]
    );
  };

  const startPractice = () => {
    const nextQuestions = availableQuestions.slice(0, setupQuestionCount);
    if (nextQuestions.length === 0) return;

    setNavigatorOpen(false);
    setQuestionIndex(0);
    setSelected(null);
    setRevealed(false);
    setAnswers({});
    setFlags({});
    setPhase("practice");
    setSessionQuestions(nextQuestions);
    setDragOrder(getDragOrder(nextQuestions[0]));
    setTimeRemaining(setupTimeSeconds);
    trackingEventsRef.current = [];
    questionTimingRef.current = {};
    setTimingSnapshot({});
    setTrackingEventCount(0);
    setStarted(true);
    beginQuestionTiming(nextQuestions[0]);
    recordEvent("start_practice", {
      section: validSection,
      questionCount: nextQuestions.length,
      lengthMode,
      timed: lengthMode === "minutes" ? true : timed,
      seconds: setupTimeSeconds,
    });
  };

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
          recordEvent("setup_custom_minutes", { minutes });
        }}
        onTimedChange={(nextTimed) => {
          setTimed(nextTimed);
          recordEvent("setup_timed_toggle", { timed: nextTimed });
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

  const chooseAnswer = (key: UCATOptionKey) => {
    if (phase === "marked") return;

    setSelected(key);
    setAnswers((current) => ({ ...current, [questionIndex]: key }));
    const activeQuestion = questions[questionIndex];
    if (activeQuestion) {
      const existing = questionTimingRef.current[activeQuestion.id];
      questionTimingRef.current[activeQuestion.id] = {
        questionId: activeQuestion.id,
        visits: existing?.visits ?? 1,
        totalMs: existing?.totalMs ?? 0,
        answeredAtMs: nowMs(),
      };
      setTimingSnapshot({ ...questionTimingRef.current });
    }
    recordEvent("answer_select", { answer: key });
    setRevealed(false);
  };

  const goToQuestion = (index: number) => {
    commitQuestionTiming();
    const nextAnswer = answers[index];
    setQuestionIndex(index);
    setSelected(typeof nextAnswer === "string" ? nextAnswer : null);
    setDragOrder(getDragOrder(questions[index], nextAnswer));
    setRevealed(false);
    setNavigatorOpen(false);
    beginQuestionTiming(questions[index]);
    recordEvent("go_to_question", { index: index + 1 });
  };

  const moveDragItem = (fromIndex: number, toIndex: number) => {
    if (!isDragQuestion || fromIndex === toIndex || phase === "marked") return;

    const next = [...dragOrder];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setDragOrder(next);
    setAnswers((answerState) => ({ ...answerState, [questionIndex]: next }));
    const activeQuestion = questions[questionIndex];
    if (activeQuestion) {
      const existing = questionTimingRef.current[activeQuestion.id];
      questionTimingRef.current[activeQuestion.id] = {
        questionId: activeQuestion.id,
        visits: existing?.visits ?? 1,
        totalMs: existing?.totalMs ?? 0,
        answeredAtMs: nowMs(),
      };
      setTimingSnapshot({ ...questionTimingRef.current });
    }
    recordEvent("drag_reorder", { from: fromIndex + 1, to: toIndex + 1 });
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

  const toggleFlag = () => {
    setFlags((current) => {
      const next = !current[questionIndex];
      recordEvent("flag_toggle", { flagged: next });
      return { ...current, [questionIndex]: next };
    });
  };

  const openReview = () => {
    commitQuestionTiming();
    setNavigatorOpen(false);
    setPhase("review");
    recordEvent("review_open", {
      answered: questions.filter((item, index) => isAnswered(item, answers[index]))
        .length,
      total: questions.length,
    });
  };

  const markPractice = () => {
    commitQuestionTiming();
    setPhase("marked");
    setQuestionIndex(0);
    setSelected(typeof answers[0] === "string" ? answers[0] : null);
    setDragOrder(getDragOrder(questions[0], answers[0]));
    setRevealed(true);
    beginQuestionTiming(questions[0]);
    recordEvent("mark_practice", {
      correct: questions.filter((item, index) => isAnswerCorrect(item, answers[index]))
        .length,
      total: questions.length,
    });
  };

  const dragItemLookup = isDragQuestion
    ? new Map(question.dragItems.map((item) => [item.id, item.text]))
    : new Map<string, string>();
  const correctOrderText = isDragQuestion
    ? question.answerOrder
        .map((itemId, index) => `${index + 1}. ${dragItemLookup.get(itemId)}`)
        .join(" ")
    : "";

  const answerRevealed = revealed || phase === "marked";
  const supportsCalculator = validSection === "dm" || validSection === "qr";
  const calcValue = Number(calcDisplay) || 0;

  const recordCalculator = (action: string, value?: string) => {
    recordEvent("calculator", { action, value: value ?? null });
  };

  const resetCalculator = () => {
    setCalcDisplay("0");
    setCalcStored(null);
    setCalcOperator(null);
    setCalcWaiting(false);
    recordCalculator("clear");
  };

  const calculate = (stored: number, current: number, operator: string) => {
    if (operator === "+") return stored + current;
    if (operator === "-") return stored - current;
    if (operator === "*") return stored * current;
    if (operator === "/") return current === 0 ? 0 : stored / current;
    return current;
  };

  const commitCalcOperation = (nextOperator?: string) => {
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
    recordCalculator("operator", nextOperator ?? "=");
  };

  const inputCalcDigit = (digit: string) => {
    setCalcDisplay((current) =>
      calcWaiting || current === "0" ? digit : `${current}${digit}`
    );
    setCalcWaiting(false);
    recordCalculator("digit", digit);
  };

  const inputCalcDecimal = () => {
    setCalcDisplay((current) =>
      calcWaiting ? "0." : current.includes(".") ? current : `${current}.`
    );
    setCalcWaiting(false);
    recordCalculator("decimal");
  };

  const memoryRecallClear = () => {
    const now = nowMs();
    if (now - lastMrcAt < 700) {
      setCalcMemory(0);
      setCalcDisplay("0");
      setLastMrcAt(0);
      recordCalculator("memory_clear");
      return;
    }

    setCalcDisplay(String(calcMemory));
    setCalcWaiting(true);
    setLastMrcAt(now);
    recordCalculator("memory_recall");
  };

  const memoryAdd = (sign: 1 | -1) => {
    setCalcMemory((current) => current + sign * calcValue);
    setCalcWaiting(true);
    recordCalculator(sign === 1 ? "memory_plus" : "memory_minus");
  };

  const toggleCalculator = () => {
    if (!supportsCalculator) return;
    setCalculatorOpen((current) => !current);
    recordCalculator(calculatorOpen ? "close" : "open");
  };

  const handlePracticeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const key = event.key.toLowerCase();

    if (event.altKey) {
      if (key === "n") {
        event.preventDefault();
        nextQuestion();
        return;
      }
      if (key === "p") {
        event.preventDefault();
        previousQuestion();
        return;
      }
      if (key === "c") {
        event.preventDefault();
        toggleCalculator();
        return;
      }
      if (key === "f") {
        event.preventDefault();
        toggleFlag();
        return;
      }
    }

    if (phase !== "practice") return;

    if (calculatorOpen && supportsCalculator) {
      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        inputCalcDigit(event.key);
        return;
      }
      if (event.key === ".") {
        event.preventDefault();
        inputCalcDecimal();
        return;
      }
      if (["+", "-", "*", "/"].includes(event.key)) {
        event.preventDefault();
        commitCalcOperation(event.key);
        return;
      }
      if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        commitCalcOperation();
        return;
      }
      if (event.key === "Backspace") {
        event.preventDefault();
        setCalcDisplay((current) =>
          current.length > 1 ? current.slice(0, -1) : "0"
        );
        recordCalculator("backspace");
        return;
      }
      if (key === "m") {
        event.preventDefault();
        memoryAdd(-1);
        return;
      }
      if (key === "p") {
        event.preventDefault();
        memoryAdd(1);
        return;
      }
      if (key === "c") {
        event.preventDefault();
        memoryRecallClear();
        return;
      }
    }

    if (!isDragQuestion && ["a", "b", "c", "d"].includes(key)) {
      const optionKey = key.toUpperCase() as UCATOptionKey;
      if (question.options.some((option) => option.key === optionKey)) {
        event.preventDefault();
        chooseAnswer(optionKey);
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

  return (
    <div
      ref={appRootRef}
      className="min-h-screen bg-white font-sans text-black"
      tabIndex={-1}
      onKeyDown={handlePracticeKeyDown}
    >
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
          <div className="rounded-sm bg-[#00618a] px-3 py-1 text-sm font-semibold">
            {timed ? formatDuration(timeRemaining) : "Untimed"}
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
              onClick={toggleCalculator}
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
            onClick={toggleFlag}
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
              onClick={toggleCalculator}
              className="rounded-sm px-2 text-sm font-bold hover:bg-slate-200"
            >
              x
            </button>
          </div>
          <div className="mb-2 rounded-sm border border-slate-500 bg-white px-2 py-2 text-right font-mono text-2xl">
            {calcDisplay}
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-sm font-bold">
            <button type="button" onClick={memoryRecallClear} className="rounded-sm border border-slate-400 bg-white py-2 hover:bg-slate-100">
              MRC
            </button>
            <button type="button" onClick={() => memoryAdd(-1)} className="rounded-sm border border-slate-400 bg-white py-2 hover:bg-slate-100">
              M-
            </button>
            <button type="button" onClick={() => memoryAdd(1)} className="rounded-sm border border-slate-400 bg-white py-2 hover:bg-slate-100">
              M+
            </button>
            <button type="button" onClick={resetCalculator} className="rounded-sm border border-slate-400 bg-white py-2 hover:bg-slate-100">
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
            <button type="button" onClick={inputCalcDecimal} className="rounded-sm border border-slate-400 bg-white py-2 hover:bg-slate-100">
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

      <main className="grid min-h-[calc(100vh-132px)] grid-cols-1 md:grid-cols-[1.15fr_0.85fr]">
        <section className="border-r-[6px] border-[#0078a8] px-5 py-5 md:min-h-[calc(100vh-132px)]">
          <h2 className="sr-only">{question.leftTitle ?? "Information"}</h2>
          <div className="max-w-4xl space-y-5 text-base leading-6 sm:text-lg">
            {question.stimulus.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {question.visual && <QuestionVisual visual={question.visual} />}
          </div>
        </section>

        <section className="px-6 py-5">
          <p className="mb-3 inline-flex rounded-sm bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
            {subtype.label}
          </p>
          <p className="text-base leading-6 sm:text-lg">{question.question}</p>

          {isDragQuestion ? (
            <div className="mt-6">
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
            <div className="mt-6 space-y-5">
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
            recordEvent("end_bank");
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
