"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock3,
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
  UCAT_QUESTION_BANK,
  UCAT_SECTIONS,
  UCAT_SUBTYPES,
  type UCATChartVisual,
  type UCATOptionKey,
  type UCATSection,
  type UCATSubtypeId,
} from "../_lib/ucatQuestionBank";

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
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

  const width = 420;
  const height = 240;
  const left = 46;
  const right = 22;
  const top = 34;
  const bottom = 54;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const valueToY = (value: number) =>
    top + chartHeight - (value / visual.max) * chartHeight;
  const ticks = [0, visual.max / 2, visual.max];
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
    <div className="mt-6 rounded-sm border border-slate-300 bg-white p-3">
      <h3 className="text-sm font-bold">{visual.title}</h3>
      <div className="mt-2 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[360px] text-slate-800"
          role="img"
          aria-label={visual.title}
        >
          <line
            x1={left}
            y1={top + chartHeight}
            x2={left + chartWidth}
            y2={top + chartHeight}
            stroke="#334155"
            strokeWidth="1.5"
          />
          <line
            x1={left}
            y1={top}
            x2={left}
            y2={top + chartHeight}
            stroke="#334155"
            strokeWidth="1.5"
          />
          {ticks.map((tick) => {
            const y = valueToY(tick);
            return (
              <g key={tick}>
                <line
                  x1={left}
                  y1={y}
                  x2={left + chartWidth}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
                <text
                  x={left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#475569"
                >
                  {Math.round(tick)}
                </text>
              </g>
            );
          })}
          <text
            x={18}
            y={top + chartHeight / 2}
            transform={`rotate(-90 18 ${top + chartHeight / 2})`}
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill="#334155"
          >
            {visual.yLabel}
          </text>

          {visual.type === "bar" &&
            visual.categories.map((category, index) => {
              const gap = 16;
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
                    rx="4"
                    fill="#2563eb"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 7}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="700"
                    fill="#0f172a"
                  >
                    {category.value}
                  </text>
                  <text
                    x={x + barWidth / 2}
                    y={top + chartHeight + 22}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="700"
                    fill="#334155"
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
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {linePoints.map((point) => (
                <g key={point.label}>
                  <circle cx={point.x} cy={point.y} r="5" fill="#2563eb" />
                  <text
                    x={point.x}
                    y={point.y - 10}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="700"
                    fill="#0f172a"
                  >
                    {point.value}
                  </text>
                  <text
                    x={point.x}
                    y={top + chartHeight + 22}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="700"
                    fill="#334155"
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
            className="flex items-center justify-between rounded-sm bg-slate-50 px-2 py-1"
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
  timed,
  questionCount,
  onSelectMixed,
  onToggleSubtype,
  onTimedChange,
  onStart,
}: {
  section: UCATSection;
  selectedSubtypeIds: UCATSubtypeId[];
  timed: boolean;
  questionCount: number;
  onSelectMixed: () => void;
  onToggleSubtype: (subtype: UCATSubtypeId) => void;
  onTimedChange: (timed: boolean) => void;
  onStart: () => void;
}) {
  const meta = getUCATSectionMeta(section);
  const subtypes = UCAT_SUBTYPES[section];
  const allQuestionCount = UCAT_QUESTION_BANK[section].length;
  const mixedSelected = selectedSubtypeIds.length === 0;
  const setTime = questionCount * meta.secondsPerQuestion;

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
              {questionCount} questions
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
              Timing
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onTimedChange(false)}
                aria-pressed={!timed}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                  !timed
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                }`}
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
  const [answers, setAnswers] = useState<Record<number, UCATOptionKey>>({});
  const [selectedSubtypeIds, setSelectedSubtypeIds] = useState<UCATSubtypeId[]>(
    []
  );
  const [timed, setTimed] = useState(false);
  const [started, setStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const sectionQuestions = useMemo(
    () => UCAT_QUESTION_BANK[validSection],
    [validSection]
  );

  const questions = useMemo(() => {
    if (selectedSubtypeIds.length === 0) return sectionQuestions;
    return sectionQuestions.filter((question) =>
      selectedSubtypeIds.includes(question.subtype)
    );
  }, [sectionQuestions, selectedSubtypeIds]);

  useEffect(() => {
    if (!started || !timed) return;

    const intervalId = window.setInterval(() => {
      setTimeRemaining((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [started, timed]);

  const meta = getUCATSectionMeta(validSection);

  const toggleSubtype = (subtype: UCATSubtypeId) => {
    setSelectedSubtypeIds((current) =>
      current.includes(subtype)
        ? current.filter((item) => item !== subtype)
        : [...current, subtype]
    );
  };

  const startPractice = () => {
    setNavigatorOpen(false);
    setQuestionIndex(0);
    setSelected(null);
    setRevealed(false);
    setAnswers({});
    setTimeRemaining(questions.length * meta.secondsPerQuestion);
    setStarted(true);
  };

  if (!started) {
    return (
      <SectionSetup
        section={validSection}
        selectedSubtypeIds={selectedSubtypeIds}
        timed={timed}
        questionCount={questions.length}
        onSelectMixed={() => setSelectedSubtypeIds([])}
        onToggleSubtype={toggleSubtype}
        onTimedChange={setTimed}
        onStart={startPractice}
      />
    );
  }

  const question = questions[questionIndex];
  const subtype = getUCATSubtypeMeta(question.subtype);
  const selectedAnswer = selected ?? answers[questionIndex] ?? null;
  const isCorrect = selectedAnswer === question.answer;

  const chooseAnswer = (key: UCATOptionKey) => {
    setSelected(key);
    setAnswers((current) => ({ ...current, [questionIndex]: key }));
    setRevealed(false);
  };

  const goToQuestion = (index: number) => {
    setQuestionIndex(index);
    setSelected(answers[index] ?? null);
    setRevealed(false);
    setNavigatorOpen(false);
  };

  const nextQuestion = () => {
    const nextIndex = Math.min(questionIndex + 1, questions.length - 1);
    goToQuestion(nextIndex);
  };

  const previousQuestion = () => {
    const nextIndex = Math.max(questionIndex - 1, 0);
    goToQuestion(nextIndex);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-black">
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
          <button
            type="button"
            onClick={() => setRevealed((current) => !current)}
            className="inline-flex items-center gap-1 text-sm font-semibold hover:underline sm:text-base"
          >
            <HelpCircle className="h-5 w-5" aria-hidden="true" />
            {revealed ? "Hide Answer" : "Explain Answer"}
          </button>
          <span className="hidden rounded-sm bg-white/15 px-2 py-1 text-xs font-bold sm:inline-flex">
            {subtype.label}
          </span>
        </div>
        <select
          aria-label="Colour scheme"
          className="h-8 rounded-none border border-[#1c4e7d] bg-[#477dbc] px-2 text-sm font-semibold text-white"
          defaultValue="default"
        >
          <option value="default">Colour Scheme</option>
          <option value="high-contrast">High Contrast</option>
        </select>
      </div>

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

          <div className="mt-6 space-y-5">
            {question.options.map((option) => {
              const checked = selectedAnswer === option.key;
              const correct = revealed && option.key === question.answer;
              const wrong = revealed && checked && option.key !== question.answer;

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
                    className="mt-1 h-4 w-4"
                  />
                  <span className="font-semibold">{option.key}.</span>
                  <span>{option.text}</span>
                </label>
              );
            })}
          </div>

          {revealed && (
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
                Correct answer: {question.answer}
              </div>
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
          onClick={() => setStarted(false)}
          className="flex h-full items-center border-r-2 border-white px-3 text-lg font-semibold hover:bg-[#00618a]"
        >
          End Bank
        </button>
        <div className="flex h-full items-center">
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
            onClick={() => setNavigatorOpen((current) => !current)}
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
