"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  ListChecks,
  XCircle,
} from "lucide-react";
import {
  getUCATSectionMeta,
  isUCATSection,
  UCAT_QUESTION_BANK,
  UCAT_SECTIONS,
  type UCATOptionKey,
} from "../_lib/ucatQuestionBank";

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
            These are starter questions in the same data shape we can scale up
            later. To add hundreds more, append question objects to
            `ucatQuestionBank.ts`.
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

export function UCATQuestionBankClient({ section }: { section?: string }) {
  const validSection = section && isUCATSection(section) ? section : null;
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<UCATOptionKey | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<Record<number, UCATOptionKey>>({});

  const questions = useMemo(
    () => (validSection ? UCAT_QUESTION_BANK[validSection] : []),
    [validSection]
  );

  if (!validSection) {
    return <SectionHub />;
  }

  const meta = getUCATSectionMeta(validSection);
  const question = questions[questionIndex];
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
        <div className="rounded-sm bg-[#00618a] px-3 py-1 text-sm font-semibold">
          {questionIndex + 1} of {questions.length}
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
          </div>
        </section>

        <section className="px-6 py-5">
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
        <Link
          href="/phloemai/practice"
          className="flex h-full items-center border-r-2 border-white px-3 text-lg font-semibold hover:bg-[#00618a]"
        >
          End Bank
        </Link>
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
