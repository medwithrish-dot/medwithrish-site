"use client";

import { requestFeatureAccess } from "@/utils/medicforest/feature-access";

import {
  hasPendingQuestionProgress,
  readBrowserQuestionProgress,
  writeBrowserQuestionProgress,
  mergeQuestionProgressSnapshots,
  readSupabaseQuestionProgress,
  writeSupabaseQuestionProgress,
  syncBrowserProgressToSupabase,
  type QuestionStatus,
  type QuestionStatusById,
  type SavedQuestionResponse,
} from "../_lib/question-bank-storage";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Grid3X3,
  Play,
  Search,
  Shuffle,
} from "lucide-react";
import { InterviewAccountControls } from "../InterviewAccountControls";
import {
  type InterviewQuestion,
  type InterviewQuestionSubcategory,
} from "../_data/interviewQuestionBank";

import { InterviewSidebar } from "./InterviewSidebar";
import { InterviewMobileNav } from "./InterviewMobileNav";

import { createClient as createSupabaseClient, hasSupabaseConfig } from "@/utils/supabase/client";

import {
  InterviewQuestionCategorySummary,
  SummaryStatItem,
  StatusFilter,
  ProgressStorage,
  defaultStatusFilter,
  categories,
  categoryTitleLines,
  subcategoryIcons,
  statusMeta,
  getPercent,
  buildQuestionBankUrl,
  resolveQuestionBankNavigationState,
  withQuestionStats,
  getSubcategoryQuestions,
  getSubcategoryStats,
  getQuestionSearchText,
  getFilterForQuestionStatus,
  scrollToTop,
} from "../_lib/question-bank-model";
import dynamic from "next/dynamic";
const QuestionPracticeView = dynamic(() => import("./QuestionPracticeView").then(module => module.QuestionPracticeView), { loading: () => <p role="status" className="p-6">Loading question practice?</p> });

function SummaryStat({ label, value, icon: Icon }: SummaryStatItem) {
  return (
    <div className="grid min-w-0 grid-cols-[40px_minmax(0,1fr)] items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#08787b] shadow-sm ring-1 ring-[#d8e7e7]">
        <Icon className="h-5 w-5" strokeWidth={2.35} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-black text-[#071923]">
          {value}
        </span>
        <span className="mt-1 block truncate text-xs font-medium text-[#5d707a]">
          {label}
        </span>
      </span>
    </div>
  );
}

function CategoryCard({
  category,
  onOpen,
}: {
  category: InterviewQuestionCategorySummary;
  onOpen: () => void;
}) {
  const Icon = category.icon;
  const percent = getPercent(category.completed, category.total);
  const remaining = category.total - category.completed;
  const visibleSubcategories = category.subcategories.slice(0, 3);
  const hiddenSubcategoryCount =
    category.subcategories.length - visibleSubcategories.length;
  const titleLines = categoryTitleLines[category.title];

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${category.title} Med interview questions`}
      className="group relative flex h-[276px] w-full flex-col overflow-hidden rounded-xl border border-white/80 bg-white p-5 pt-[22px] text-left shadow-[0_1px_3px_rgba(7,25,35,0.08)] transition-all hover:-translate-y-0.5 hover:border-white hover:shadow-[0_10px_24px_rgba(7,25,35,0.1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#159a9d]/40"
      style={{
        background: `linear-gradient(135deg, ${category.tint} 0%, rgba(255,255,255,0.92) 54%, #ffffff 100%)`,
      }}
    >
      <span
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: category.colour }}
        aria-hidden="true"
      />

      <div className="grid grid-cols-[52px_minmax(0,1fr)_32px] items-start gap-4">
        <div
          className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl text-white ring-1 ring-white/70 transition-transform duration-200 group-hover:scale-[1.04]"
          style={{
            background: `linear-gradient(135deg, ${category.colour} 0%, ${category.colour} 72%, #071923 150%)`,
            boxShadow: `0 14px 24px ${category.colour}26`,
          }}
        >
          <span
            className="absolute -right-3 -top-3 h-9 w-9 rounded-full bg-white/25"
            aria-hidden="true"
          />
          <span
            className="absolute -bottom-4 -left-4 h-11 w-11 rounded-full bg-white/10"
            aria-hidden="true"
          />
          <span
            className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25"
            aria-hidden="true"
          />
          <Icon
            className="relative h-7 w-7 drop-shadow-[0_1px_1px_rgba(0,0,0,0.16)]"
            strokeWidth={2.35}
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="min-h-12 text-base font-black leading-6 text-[#071923]">
            {titleLines.map((line) => (
              <span key={line} className="block whitespace-nowrap">
                {line}
              </span>
            ))}
          </h2>
          <p
            className="mt-1 text-[11px] font-black uppercase leading-4 tracking-[0.08em]"
            style={{ color: category.colour }}
          >
            {category.subcategories.length} subcategories
          </p>
        </div>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm ring-1 ring-white/65 transition-transform group-hover:translate-x-0.5"
          style={{
            backgroundColor: category.iconTint,
            color: category.colour,
          }}
          aria-hidden="true"
        >
          <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.45} />
        </span>
      </div>

      <ul className="mt-[14px] grid gap-1 text-[11px] font-medium leading-[0.95rem] text-[#405562]">
        {visibleSubcategories.map((subcategory) => (
          <li key={subcategory} className="grid grid-cols-[7px_minmax(0,1fr)] gap-2">
            <span
              className="mt-[0.42rem] h-1 w-1 rounded-full"
              style={{ backgroundColor: category.colour }}
              aria-hidden="true"
            />
            <span>{subcategory}</span>
          </li>
        ))}
        {hiddenSubcategoryCount > 0 && (
          <li className="pl-[15px] pt-0.5 text-[10px] font-semibold leading-4 text-[#748791]">
            +{hiddenSubcategoryCount} more
          </li>
        )}
      </ul>

      <div className="mt-auto pt-4">
        <p className="text-sm font-semibold text-[#526976]">
          {category.total} questions
        </p>
        <div className="mt-[12px] h-1.5 overflow-hidden rounded-full bg-[#dfe8ea]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${percent}%`,
              backgroundColor: category.colour,
            }}
          />
        </div>
        <div className="mt-[10px] flex items-center justify-between gap-3 text-xs font-medium text-[#5d707a]">
          <p>{category.completed} done / {remaining} left</p>
          <p>{percent}% complete</p>
        </div>
      </div>
    </button>
  );
}

function SubcategoryCard({
  category,
  title,
  index,
  isActive,
  onSelect,
}: {
  category: InterviewQuestionCategorySummary;
  title: InterviewQuestionSubcategory;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  const Icon = subcategoryIcons[index % subcategoryIcons.length];
  const stats = getSubcategoryStats(category, title);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className="flex min-h-[176px] w-[220px] shrink-0 flex-col rounded-xl border bg-white p-5 text-left shadow-[0_1px_3px_rgba(7,25,35,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(7,25,35,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#159a9d]/40"
      style={{
        borderColor: isActive ? category.colour : "#d8e0e6",
        boxShadow: isActive
          ? `0 10px 24px ${category.colour}18`
          : undefined,
      }}
    >
      <span
        className="flex h-11 w-11 items-center justify-center rounded-lg"
        style={{
          backgroundColor: category.iconTint,
          color: category.colour,
        }}
      >
        <Icon className="h-6 w-6" strokeWidth={2.25} aria-hidden="true" />
      </span>
      <span className="mt-5 block text-base font-black leading-5 text-[#071923]">
        {title}
      </span>
      <span className="mt-auto pt-4 text-xs font-medium leading-5 text-[#4a6370]">
        {stats.total} questions
        <br />
        {stats.completed} done
      </span>
      <span className="mt-3 grid grid-cols-[minmax(0,1fr)_34px] items-center gap-3">
        <span className="h-1.5 overflow-hidden rounded-full bg-[#e2eaee]">
          <span
            className="block h-full rounded-full"
            style={{
              width: `${stats.percent}%`,
              backgroundColor: category.colour,
            }}
          />
        </span>
        <span className="text-right text-xs font-semibold text-[#405562]">
          {stats.percent}%
        </span>
      </span>
    </button>
  );
}

function StatusIcon({ status }: { status: QuestionStatus }) {
  const meta = statusMeta[status];
  const Icon = meta.icon;

  return (
    <Icon
      className="h-5 w-5"
      strokeWidth={status === "not-attempted" ? 0 : 2.2}
      fill={status === "not-attempted" ? meta.colour : "none"}
      style={{ color: meta.colour }}
      aria-label={meta.label}
    />
  );
}

function QuestionBankCategoryView({
  category,
  selectedSubcategoryIndex,
  statusFilter,
  questionQuery,
  savedResponseQuestionIds,
  showPremiumCard,
  onBack,
  onSelectSubcategory,
  onStatusFilterChange,
  onQuestionQueryChange,
  onOpenQuestion,
}: {
  category: InterviewQuestionCategorySummary;
  selectedSubcategoryIndex: number;
  statusFilter: StatusFilter;
  questionQuery: string;
  savedResponseQuestionIds: ReadonlySet<string>;
  showPremiumCard: boolean;
  onBack: () => void;
  onSelectSubcategory: (index: number) => void;
  onStatusFilterChange: (filter: StatusFilter) => void;
  onQuestionQueryChange: (query: string) => void;
  onOpenQuestion: (question: InterviewQuestion) => void;
}) {
  const Icon = category.icon;
  const questionListRef = useRef<HTMLDivElement | null>(null);
  const scrollRestoreTimeoutRef = useRef<number | null>(null);
  const [temporaryListMinHeight, setTemporaryListMinHeight] =
    useState<number | null>(null);
  const percent = getPercent(category.completed, category.total);
  const selectedSubcategory =
    category.subcategories[selectedSubcategoryIndex] ??
    category.subcategories[0] ??
    "Motivation for Medicine";
  const selectedStats = getSubcategoryStats(category, selectedSubcategory);
  const questions = useMemo(
    () => getSubcategoryQuestions(category, selectedSubcategory),
    [category, selectedSubcategory]
  );
  const questionNumbers = useMemo(
    () =>
      new Map(
        questions.map((question, index) => [question.id, index + 1] as const)
      ),
    [questions]
  );
  const normalisedQuestionQuery = questionQuery.trim().toLowerCase();
  const filteredQuestions = questions.filter((question) => {
    const matchesStatus =
      (statusFilter === "answered" && question.status === "completed") ||
      (statusFilter === "unanswered" &&
        question.status === "not-attempted") ||
      (statusFilter === "review" && question.status === "review");
    const matchesQuery =
      !normalisedQuestionQuery ||
      getQuestionSearchText(question).includes(normalisedQuestionQuery);

    return matchesStatus && matchesQuery;
  });
  const savedResponseQuestions = questions.filter((question) =>
    savedResponseQuestionIds.has(question.id)
  );
  const firstSavedResponseQuestion = savedResponseQuestions[0] ?? null;
  const statusCounts = questions.reduce(
    (acc, question) => ({
      ...acc,
      [question.status]: acc[question.status] + 1,
    }),
    { completed: 0, review: 0, "not-attempted": 0 } satisfies Record<
      QuestionStatus,
      number
    >
  );
  const remaining = category.total - category.completed;

  const selectSubcategory = (index: number) => {
    onSelectSubcategory(index);
    onStatusFilterChange(defaultStatusFilter);
    onQuestionQueryChange("");
  };

  const handleStatusFilterChange = (filter: StatusFilter) => {
    if (filter === statusFilter) return;

    const scrollY = window.scrollY;
    const listHeight = questionListRef.current?.getBoundingClientRect().height;

    if (listHeight && listHeight > 0) {
      setTemporaryListMinHeight(listHeight);
    }

    onStatusFilterChange(filter);

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, behavior: "auto" });

      if (scrollRestoreTimeoutRef.current !== null) {
        window.clearTimeout(scrollRestoreTimeoutRef.current);
      }

      scrollRestoreTimeoutRef.current = window.setTimeout(() => {
        setTemporaryListMinHeight(null);
        window.requestAnimationFrame(() => {
          const maxScrollY = Math.max(
            0,
            document.documentElement.scrollHeight - window.innerHeight
          );

          window.scrollTo({
            top: Math.min(scrollY, maxScrollY),
            behavior: "auto",
          });
        });
      }, 120);
    });
  };

  const openRandomQuestion = () => {
    const nextSubcategoryIndex = Math.floor(
      Math.random() * category.subcategories.length
    );
    const nextSubcategory =
      category.subcategories[nextSubcategoryIndex] ?? category.subcategories[0];
    if (!nextSubcategory) return;
    const nextQuestions = getSubcategoryQuestions(category, nextSubcategory);
    const nextQuestion =
      nextQuestions[Math.floor(Math.random() * nextQuestions.length)] ??
      nextQuestions[0];

    if (nextQuestion) onOpenQuestion(nextQuestion);
  };

  const resumePractice = () => {
    const nextQuestion =
      questions.find((question) => question.status === "not-attempted") ??
      questions[0];

    if (nextQuestion) onOpenQuestion(nextQuestion);
  };

  const filterOptions = [
    { label: `Answered (${statusCounts.completed})`, value: "answered" },
    {
      label: `Unanswered (${statusCounts["not-attempted"]})`,
      value: "unanswered",
    },
    { label: `Review (${statusCounts.review})`, value: "review" },
  ] as const satisfies readonly { label: string; value: StatusFilter }[];

  useEffect(() => {
    return () => {
      if (scrollRestoreTimeoutRef.current !== null) {
        window.clearTimeout(scrollRestoreTimeoutRef.current);
      }
    };
  }, []);

  return (
    <main className="medicforest-dashboard-compact min-h-screen bg-[#eef1f3] text-[#071923] lg:fixed lg:inset-0 lg:h-auto lg:overflow-hidden">
      <InterviewMobileNav activeLabel="Question Bank" />
      <div className="grid min-h-screen lg:h-full lg:min-h-0 lg:grid-cols-[200px_1fr]">
        <InterviewSidebar
          activeLabel="Question Bank"
          showPremiumCard={showPremiumCard}
        />

        <section className="min-w-0 px-5 py-7 sm:px-6 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:px-8">
          <div className="mx-auto max-w-[1540px]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex w-fit items-center gap-2 text-sm font-bold text-[#08787b] transition-colors hover:text-[#042724]"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to all categories
              </button>
              <InterviewAccountControls />
            </div>

            <section className="mt-5 rounded-xl border border-[#d8e0e6] bg-white/90 p-5 shadow-[0_1px_3px_rgba(7,25,35,0.08)]">
              <div className="grid gap-5 lg:grid-cols-[88px_minmax(0,1fr)_auto] lg:items-center">
                <div
                  className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl text-white ring-1 ring-white/70"
                  style={{
                    background: `linear-gradient(135deg, ${category.colour} 0%, ${category.colour} 72%, #071923 150%)`,
                    boxShadow: `0 18px 30px ${category.colour}26`,
                  }}
                >
                  <span
                    className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-white/25"
                    aria-hidden="true"
                  />
                  <span
                    className="absolute -bottom-5 -left-5 h-14 w-14 rounded-full bg-white/10"
                    aria-hidden="true"
                  />
                  <Icon className="relative h-10 w-10" strokeWidth={2.3} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl font-black leading-tight text-[#071923] sm:text-3xl">
                    {category.title}
                  </h1>
                  <p className="mt-3 text-sm font-medium text-[#4a6370]">
                    {category.total} questions{" "}
                    <span className="mx-2 text-[#9babb4]">/</span>
                    {category.completed} done{" "}
                    <span className="mx-2 text-[#9babb4]">/</span>
                    {remaining} left{" "}
                    <span className="mx-2 text-[#9babb4]">/</span>
                    {percent}% complete
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                  <button
                    type="button"
                    onClick={openRandomQuestion}
                    className="inline-flex h-12 items-center justify-center gap-3 rounded-lg bg-[#06254a] px-5 text-sm font-black text-white shadow-sm transition-colors hover:bg-[#071923]"
                  >
                    <Shuffle className="h-5 w-5" aria-hidden="true" />
                    Random Question
                  </button>
                  <button
                    type="button"
                    onClick={resumePractice}
                    className="inline-flex h-12 items-center justify-center gap-3 rounded-lg border border-[#b8c8cf] bg-white px-5 text-sm font-black text-[#071923] shadow-sm transition-colors hover:border-[#08787b] hover:text-[#08787b]"
                  >
                    <Play className="h-5 w-5" aria-hidden="true" />
                    Resume Practice
                  </button>
                </div>
              </div>
            </section>

            <section className="mt-6">
              <h2 className="text-base font-black text-[#071923]">
                Subcategories ({category.subcategories.length})
              </h2>
              <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                {category.subcategories.map((subcategory, index) => (
                  <SubcategoryCard
                    key={subcategory}
                    category={category}
                    title={subcategory}
                    index={index}
                    isActive={index === selectedSubcategoryIndex}
                    onSelect={() => selectSubcategory(index)}
                  />
                ))}
              </div>
            </section>

            <section className="mt-6 border-t border-[#d8e0e6] pt-5">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,520px)_minmax(260px,330px)] lg:items-center lg:justify-between">
                <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-[#d8e0e6] bg-white">
                  {filterOptions.map((option) => {
                    const isActive = option.value === statusFilter;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleStatusFilterChange(option.value)}
                        aria-pressed={isActive}
                        className={`h-10 px-3 text-xs font-black transition-colors ${
                          isActive
                            ? "bg-[#06254a] text-white"
                            : "text-[#071923] hover:bg-[#f4f8f8]"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <label className="flex h-10 min-w-0 items-center gap-3 rounded-lg border border-[#d8e0e6] bg-white px-3">
                  <input
                    value={questionQuery}
                    onChange={(event) =>
                      onQuestionQueryChange(event.target.value)
                    }
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#071923] outline-none placeholder:text-[#8091a0]"
                    placeholder="Search questions..."
                  />
                  <Search className="h-5 w-5 shrink-0 text-[#071923]" aria-hidden="true" />
                </label>
              </div>

              {firstSavedResponseQuestion && (
                <div className="mt-4 grid gap-3 rounded-xl border border-[#b9dcda] bg-[#f1fbfa] p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.08em] text-[#08787b]">
                      Review
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#071923]">
                      {savedResponseQuestions.length === 1
                        ? "1 saved answer is ready to check."
                        : `${savedResponseQuestions.length} saved answers are ready to check.`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenQuestion(firstSavedResponseQuestion)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#159a9d] px-4 text-sm font-black text-white shadow-sm transition-colors hover:bg-[#08787b]"
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Check Saved Answer
                  </button>
                </div>
              )}

              <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
                <div
                  ref={questionListRef}
                  className="overflow-hidden rounded-xl border border-[#d8e0e6] bg-white shadow-[0_1px_3px_rgba(7,25,35,0.05)]"
                  style={{
                    minHeight: temporaryListMinHeight ?? undefined,
                  }}
                >
                  {filteredQuestions.map((question, index) => {
                    const hasSavedResponse = savedResponseQuestionIds.has(question.id);

                    return (
                      <button
                        key={question.id}
                        type="button"
                        onClick={() => onOpenQuestion(question)}
                        className={`grid min-h-[70px] w-full grid-cols-[40px_minmax(0,1fr)_32px_18px] items-center gap-4 bg-white px-5 py-3 text-left transition-colors hover:bg-[#f8fbfb] ${
                          index === filteredQuestions.length - 1
                            ? ""
                            : "border-b border-[#edf1f3]"
                        } ${hasSavedResponse ? "bg-[#fbfffe]" : ""}`}
                      >
                        <span className="text-sm font-medium text-[#526976]">
                          {String(
                            questionNumbers.get(question.id) ?? index + 1
                          ).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium leading-5 text-[#071923]">
                            {question.text}
                          </span>
                          <span className="mt-1 block truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-[#748791]">
                            {question.difficulty} / section{" "}
                            {question.sourceSection}
                            {question.sourceTopic
                              ? ` / ${question.sourceTopic}`
                              : ""}
                          </span>
                          {hasSavedResponse && (
                            <span className="mt-2 inline-flex items-center gap-2 rounded-md bg-[#e2f5ef] px-2 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#08787b]">
                              Review / Check saved answer
                            </span>
                          )}
                        </span>
                        <StatusIcon status={question.status} />
                        <ChevronRight className="h-4 w-4 text-[#4a6370]" aria-hidden="true" />
                      </button>
                    );
                  })}
                  {filteredQuestions.length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-sm font-black text-[#071923]">
                        No questions found
                      </p>
                      <p className="mt-2 text-sm font-medium text-[#4a6370]">
                        Try a different filter or search term.
                      </p>
                    </div>
                  )}
                </div>

                <aside className="space-y-4">
                  <section className="rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-[0_1px_3px_rgba(7,25,35,0.05)]">
                    <h2 className="text-sm font-black text-[#071923]">
                      Status
                    </h2>
                    <div className="mt-4 space-y-4">
                      {(
                        [
                          "completed",
                          "review",
                          "not-attempted",
                        ] as const satisfies readonly QuestionStatus[]
                      ).map((status) => (
                        <div
                          key={status}
                          className="grid grid-cols-[24px_minmax(0,1fr)_28px] items-center gap-3"
                        >
                          <StatusIcon status={status} />
                          <span className="text-xs font-medium text-[#4a6370]">
                            {statusMeta[status].label}
                          </span>
                          <span className="text-right text-xs font-black text-[#071923]">
                            {statusCounts[status]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section className="rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-[0_1px_3px_rgba(7,25,35,0.05)]">
                    <h2 className="text-sm font-black text-[#071923]">
                      Progress
                    </h2>
                    <p className="mt-3 text-sm font-medium leading-6 text-[#4a6370]">
                      {selectedStats.completed} done / {selectedStats.remaining} left
                    </p>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e2eaee]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${selectedStats.percent}%`,
                          backgroundColor: category.colour,
                        }}
                      />
                    </div>
                    <p className="mt-3 text-xs font-medium text-[#5d707a]">
                      {selectedStats.percent}% complete
                    </p>
                  </section>
                </aside>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

export function InterviewQuestionBankDashboard({
  showPremiumCard,
  initialCategoryTitle,
  initialSubcategoryIndex,
  initialQuestionId,
}: {
  showPremiumCard: boolean;
  initialCategoryTitle?: string;
  initialSubcategoryIndex?: number;
  initialQuestionId?: string;
}) {
  const [query, setQuery] = useState("");
  const [syncPending, setSyncPending] = useState(false);
  const supabaseReady = hasSupabaseConfig();
  const supabase = useMemo(
    () => (supabaseReady ? createSupabaseClient() : null),
    [supabaseReady]
  );
  const progressStorageRef = useRef<ProgressStorage>("browser");
  const progressUserRef = useRef<User | null>(null);
  const [progressOwnerKey, setProgressOwnerKey] = useState<string | null>(null);
  const [questionStatusById, setQuestionStatusById] =
    useState<QuestionStatusById>(() => new Map());
  const [savedResponsesByQuestionId, setSavedResponsesByQuestionId] = useState(
    () => new Map<string, SavedQuestionResponse>()
  );
  const categoriesWithStats = useMemo(
    () =>
      categories.map((category) =>
        withQuestionStats(category, questionStatusById)
      ),
    [questionStatusById]
  );
  const savedResponseQuestionIds = useMemo(
    () => new Set(savedResponsesByQuestionId.keys()),
    [savedResponsesByQuestionId]
  );
  const initialNavigationState = useMemo(
    () =>
      resolveQuestionBankNavigationState(categoriesWithStats, {
        categoryTitle: initialCategoryTitle,
        subcategoryIndex: initialSubcategoryIndex,
        questionId: initialQuestionId,
      }),
    [
      categoriesWithStats,
      initialCategoryTitle,
      initialQuestionId,
      initialSubcategoryIndex,
    ]
  );
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState<
    string | null
  >(initialNavigationState.selectedCategoryTitle);
  const [selectedSubcategoryIndex, setSelectedSubcategoryIndex] = useState(
    initialNavigationState.selectedSubcategoryIndex
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    initialNavigationState.statusFilter
  );
  const [questionQuery, setQuestionQuery] = useState("");
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(
    initialNavigationState.activeQuestionId
  );

  useEffect(() => {
    if (!supabase) {
      const timeoutId = window.setTimeout(() => {
        const localSnapshot = readBrowserQuestionProgress(null);
        progressStorageRef.current = "browser";
        progressUserRef.current = null;
        setProgressOwnerKey("guest");
        setQuestionStatusById(localSnapshot.statusById);
        setSavedResponsesByQuestionId(localSnapshot.savedResponsesByQuestionId);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }

    let isMounted = true;
    let loadVersion = 0;
    const client = supabase;

    async function loadProgressForUser(user: User | null) {
      if (!isMounted) return;
      const version = ++loadVersion;
      const userId = user?.id ?? null;
      const browserSnapshot = readBrowserQuestionProgress(userId);

      // Replace the displayed owner before any network work. An auth change also
      // remounts the practice view, stopping its recorder and clearing its answer.
      progressStorageRef.current = "browser";
      progressUserRef.current = user;
      setProgressOwnerKey(userId ?? "guest");
      setSyncPending(Boolean(userId && hasPendingQuestionProgress(userId)));
      setQuestionStatusById(browserSnapshot.statusById);
      setSavedResponsesByQuestionId(browserSnapshot.savedResponsesByQuestionId);
      if (!user) return;

      try {
        const remoteSnapshot = await readSupabaseQuestionProgress(client, user.id);
        if (!isMounted || version !== loadVersion) return;
        const mergedSnapshot = mergeQuestionProgressSnapshots(remoteSnapshot, readBrowserQuestionProgress(userId), userId);
        progressStorageRef.current = "supabase";
        setQuestionStatusById(mergedSnapshot.statusById);
        setSavedResponsesByQuestionId(mergedSnapshot.savedResponsesByQuestionId);
        void syncBrowserProgressToSupabase({
          supabase: client,
          userId: user.id,
          browserSnapshot,
          remoteSnapshot,
        }).then(() => {
          if (isMounted && version === loadVersion) setSyncPending(hasPendingQuestionProgress(userId));
        }).catch(() => {
          if (isMounted && version === loadVersion) setSyncPending(hasPendingQuestionProgress(userId));
        });
      } catch {
        // Keep this account's local snapshot. Never fall back to the guest store.
        if (!isMounted || version !== loadVersion) return;
        progressStorageRef.current = "browser";
      }
    }

    void client.auth.getSession().then(({ data }) => {
      if (loadVersion === 0) void loadProgressForUser(data.session?.user ?? null);
    }).catch(() => {
      // Auth failures must not expose legacy guest answers while identity is unknown.
      if (!isMounted || loadVersion !== 0) return;
      setProgressOwnerKey("unavailable");
    });

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      if (loadVersion === 0 || nextUser?.id !== progressUserRef.current?.id) {
        window.setTimeout(() => void loadProgressForUser(nextUser), 0);
      }
    });

    const retryPendingProgress = () => {
      const user = progressUserRef.current;
      if (user && !document.hidden && navigator.onLine && hasPendingQuestionProgress(user.id)) {
        void loadProgressForUser(user);
      }
    };
    const retryTimer = window.setInterval(retryPendingProgress, 30_000);
    window.addEventListener("online", retryPendingProgress);
    document.addEventListener("visibilitychange", retryPendingProgress);

    return () => {
      isMounted = false;
      loadVersion += 1;
      subscription.unsubscribe();
      window.clearInterval(retryTimer);
      window.removeEventListener("online", retryPendingProgress);
      document.removeEventListener("visibilitychange", retryPendingProgress);
    };
  }, [supabase]);

  const totals = useMemo(
    () =>
      categoriesWithStats.reduce(
        (acc, category) => ({
          total: acc.total + category.total,
          completed: acc.completed + category.completed,
        }),
        { total: 0, completed: 0 }
      ),
    [categoriesWithStats]
  );
  const overallPercent = getPercent(totals.completed, totals.total);
  const remaining = totals.total - totals.completed;
  const summaryStats = [
    {
      label: "Categories",
      value: String(categoriesWithStats.length),
      icon: Grid3X3,
    },
    { label: "Total Questions", value: String(totals.total), icon: FileText },
    { label: "Completed", value: String(totals.completed), icon: CheckCircle2 },
    { label: "Remaining", value: String(remaining), icon: Clock },
  ] satisfies readonly SummaryStatItem[];
  const normalisedQuery = query.trim().toLowerCase();
  const filteredCategories = useMemo(() => {
    if (!normalisedQuery) return categoriesWithStats;
    return categoriesWithStats.filter((category) =>
      [
        category.title,
        category.description,
        ...category.subcategories,
        ...category.questions.map((question) => getQuestionSearchText(question)),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalisedQuery)
    );
  }, [categoriesWithStats, normalisedQuery]);
  const selectedCategory = selectedCategoryTitle
    ? categoriesWithStats.find(
        (category) => category.title === selectedCategoryTitle
      )
    : undefined;
  const questionsWithProgress = useMemo(
    () => categoriesWithStats.flatMap((category) => category.questions),
    [categoriesWithStats]
  );
  const activeQuestion = activeQuestionId
    ? questionsWithProgress.find((question) => question.id === activeQuestionId)
    : undefined;
  const selectedSubcategory =
    selectedCategory?.subcategories[selectedSubcategoryIndex] ??
    selectedCategory?.subcategories[0];
  const activeQuestionNumber =
    selectedCategory && selectedSubcategory && activeQuestion
      ? Math.max(
          1,
          getSubcategoryQuestions(selectedCategory, selectedSubcategory).findIndex(
            (question) => question.id === activeQuestion.id
          ) + 1
        )
      : 1;

  const updateQuestionBankUrl = (
    nextState: {
      categoryTitle?: string | null;
      subcategoryIndex?: number;
      questionId?: string | null;
    },
    mode: "push" | "replace" = "push"
  ) => {
    if (typeof window === "undefined") return;

    const url = buildQuestionBankUrl(nextState);

    if (mode === "replace") {
      window.history.replaceState(null, "", url);
    } else {
      window.history.pushState(null, "", url);
    }
  };

  const resetQuestionState = () => {
    setStatusFilter(defaultStatusFilter);
    setQuestionQuery("");
    setActiveQuestionId(null);
  };

  const openCategory = (
    category: InterviewQuestionCategorySummary,
    mode: "push" | "replace" = "push"
  ) => {
    setSelectedCategoryTitle(category.title);
    setSelectedSubcategoryIndex(0);
    resetQuestionState();
    updateQuestionBankUrl(
      { categoryTitle: category.title, subcategoryIndex: 0 },
      mode
    );
    scrollToTop();
  };

  const selectSubcategory = (
    index: number,
    categoryTitle = selectedCategory?.title
  ) => {
    setSelectedSubcategoryIndex(index);
    resetQuestionState();
    updateQuestionBankUrl({ categoryTitle, subcategoryIndex: index });
  };

  const openQuestion = (
    question: InterviewQuestion,
    mode: "push" | "replace" = "push"
  ) => {
    const category = categoriesWithStats.find(
      (item) => item.title === question.category
    );
    if (!question || !category) return;
    if (!requestFeatureAccess("free", "Question bank practice", false, `${window.location.pathname}?question=${encodeURIComponent(question.id)}`)) return;
    const subcategoryIndex = Math.max(
      0,
      category.subcategories.findIndex(
        (subcategory) => subcategory === question.subcategory
      )
    );

    setSelectedCategoryTitle(category.title);
    setSelectedSubcategoryIndex(subcategoryIndex);
    setStatusFilter(getFilterForQuestionStatus(question.status));
    setQuestionQuery("");
    setActiveQuestionId(question.id);
    updateQuestionBankUrl(
      {
        categoryTitle: category.title,
        subcategoryIndex,
        questionId: question.id,
      },
      mode
    );
    scrollToTop();
  };

  const openRandomQuestion = () => {
    const question =
      questionsWithProgress[
        Math.floor(Math.random() * questionsWithProgress.length)
      ] ?? questionsWithProgress[0];

    if (question) openQuestion(question);
  };

  const persistQuestionProgress = useCallback(
    async (
      questionId: string,
      status: QuestionStatus,
      response?: SavedQuestionResponse
    ) => {
      const user = progressUserRef.current;

      if (!supabase || !user) {
        return false;
      }

      try {
        await writeSupabaseQuestionProgress({
          supabase,
          userId: user.id,
          questionId,
          status,
          response,
        });
        if (progressUserRef.current?.id === user.id) setSyncPending(hasPendingQuestionProgress(user.id));
        return true;
      } catch {
        if (progressUserRef.current?.id === user.id) setSyncPending(true);
        return false;
      }
    },
    [supabase]
  );

  const updateQuestionProgress = useCallback(
    (
      questionId: string,
      status: QuestionStatus,
      response?: SavedQuestionResponse
    ) => {
      const userId = progressUserRef.current?.id ?? null;
      setQuestionStatusById((current) => {
        const next = new Map(current);

        if (status === "not-attempted") {
          next.delete(questionId);
        } else {
          next.set(questionId, status);
        }

        return next;
      });
      setSavedResponsesByQuestionId((current) => {
        const next = new Map(current);

        if (status === "not-attempted") {
          next.delete(questionId);
        } else if (response) {
          next.set(questionId, response);
        }

        return next;
      });

      // Keep the edit before sending it so reloads recover in-flight requests.
      writeBrowserQuestionProgress(questionId, status, response, userId);
      void persistQuestionProgress(questionId, status, response);
    },
    [persistQuestionProgress]
  );

  const saveQuestionResponse = useCallback(
    (response: SavedQuestionResponse) => {
      updateQuestionProgress(response.questionId, "completed", response);
    },
    [updateQuestionProgress]
  );

  const resetQuestionCompletion = useCallback(
    (questionId: string) => {
      updateQuestionProgress(questionId, "not-attempted");
    },
    [updateQuestionProgress]
  );

  const updateQuestionStatus = useCallback(
    (questionId: string, status: QuestionStatus) => {
      updateQuestionProgress(
        questionId,
        status,
        savedResponsesByQuestionId.get(questionId)
      );
    },
    [savedResponsesByQuestionId, updateQuestionProgress]
  );

  const backToQuestionList = () => {
    setActiveQuestionId(null);
    updateQuestionBankUrl(
      {
        categoryTitle: selectedCategory?.title,
        subcategoryIndex: selectedSubcategoryIndex,
      },
      "replace"
    );
    scrollToTop();
  };

  const backToCategories = () => {
    setSelectedCategoryTitle(null);
    setSelectedSubcategoryIndex(0);
    resetQuestionState();
    updateQuestionBankUrl({}, "push");
    scrollToTop();
  };

  useEffect(() => {
    const applyUrlState = () => {
      const params = new URLSearchParams(window.location.search);
      const subcategoryParam = params.get("subcategory");
      const nextState = resolveQuestionBankNavigationState(
        categoriesWithStats,
        {
          categoryTitle: params.get("category"),
          subcategoryIndex:
            subcategoryParam === null ? null : Number(subcategoryParam),
          questionId: params.get("question"),
        }
      );

      setSelectedCategoryTitle(nextState.selectedCategoryTitle);
      setSelectedSubcategoryIndex(nextState.selectedSubcategoryIndex);
      setStatusFilter(nextState.statusFilter);
      setQuestionQuery("");
      setActiveQuestionId(nextState.activeQuestionId);
    };

    window.addEventListener("popstate", applyUrlState);

    return () => window.removeEventListener("popstate", applyUrlState);
  }, [categoriesWithStats]);

  function withSyncNotice(content: ReactNode) {
    return <>
      {syncPending && <p role="status" className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900 shadow-sm">
        Account saving is pending and will retry automatically. Keep this tab open. Browser recovery is available when saved data is allowed.
      </p>}
      {content}
    </>;
  }

  if (progressOwnerKey === null || progressOwnerKey === "unavailable") {
    return withSyncNotice(
      <main className="min-h-screen bg-[#eef1f3] text-[#071923]">
        <InterviewMobileNav activeLabel="Question Bank" />
        <div className="mx-auto max-w-xl px-6 py-16" role="status">
          <h1 className="text-2xl font-bold">Question Bank</h1>
          <p className="mt-4 text-sm text-[#4a6370]">{progressOwnerKey === null ? "Loading your question history..." : "We could not confirm your account. Reload the page to try again."}</p>
        </div>
      </main>
    );
  }

  if (selectedCategory && selectedSubcategory && activeQuestion && progressOwnerKey === "guest") {
    return <main className="min-h-screen bg-[#eef1f3] px-6 py-12 text-[#071923]">
      <InterviewMobileNav activeLabel="Question Bank" />
      <section className="mx-auto mt-8 max-w-xl rounded-xl bg-white p-6">
        <h1 className="text-2xl font-semibold">{activeQuestion.text}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Create a free account to practise this question and save your answer. You can keep exploring the question bank.</p>
        <button type="button" onClick={() => requestFeatureAccess("free", "Question bank practice")} className="mt-5 rounded-lg bg-[#08787b] px-5 py-3 text-sm font-semibold text-white">Sign up for free / log in</button>
        <button type="button" onClick={backToQuestionList} className="ml-4 text-sm font-semibold text-[#08787b]">Back to questions</button>
      </section>
    </main>;
  }

  if (selectedCategory && selectedSubcategory && activeQuestion) {
    return withSyncNotice(
      <QuestionPracticeView
        key={`${progressOwnerKey}:${activeQuestion.id}`}
        category={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        question={activeQuestion}
        questionNumber={activeQuestionNumber}
        showPremiumCard={showPremiumCard}
        initialSavedResponse={
          savedResponsesByQuestionId.get(activeQuestion.id) ?? null
        }
        onBackToQuestions={backToQuestionList}
        onQuestionResponseSaved={saveQuestionResponse}
        onQuestionReset={resetQuestionCompletion}
        onQuestionStatusChange={updateQuestionStatus}
      />
    );
  }

  if (selectedCategory) {
    return withSyncNotice(
      <QuestionBankCategoryView
        category={selectedCategory}
        selectedSubcategoryIndex={selectedSubcategoryIndex}
        statusFilter={statusFilter}
        questionQuery={questionQuery}
        savedResponseQuestionIds={savedResponseQuestionIds}
        showPremiumCard={showPremiumCard}
        onBack={backToCategories}
        onSelectSubcategory={(index) => selectSubcategory(index)}
        onStatusFilterChange={setStatusFilter}
        onQuestionQueryChange={setQuestionQuery}
        onOpenQuestion={openQuestion}
      />
    );
  }

  return withSyncNotice(
    <main className="medicforest-dashboard-compact min-h-screen bg-[#eef1f3] text-[#071923] lg:fixed lg:inset-0 lg:h-auto lg:overflow-hidden">
      <InterviewMobileNav activeLabel="Question Bank" />
      <div className="grid min-h-screen lg:h-full lg:min-h-0 lg:grid-cols-[200px_1fr]">
        <InterviewSidebar
          activeLabel="Question Bank"
          showPremiumCard={showPremiumCard}
        />

        <section className="min-w-0 px-5 py-7 sm:px-6 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:px-8">
          <div className="mx-auto max-w-[1540px]">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-[#071923]">
                  Question Bank
                </h1>
                <p className="mt-2 text-sm font-medium text-[#4a6370]">
                  Explore {totals.total}+ Med interview questions across{" "}
                  {categoriesWithStats.length} categories.
                </p>
              </div>
              <InterviewAccountControls />
            </header>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex h-12 min-w-0 items-center gap-3 rounded-lg bg-white/80 px-4 ring-1 ring-[#d8e2e6]/60 sm:w-[420px]">
                <Search className="h-5 w-5 shrink-0 text-[#4a6370]" aria-hidden="true" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#071923] outline-none placeholder:text-[#8091a0]"
                  placeholder="Search questions, topics or keywords..."
                />
              </label>
              <button
                type="button"
                onClick={openRandomQuestion}
                className="flex h-12 items-center justify-center gap-3 rounded-lg bg-[#edf7f6] px-5 text-sm font-black text-[#08787b] ring-1 ring-[#b9dcda]/60 transition-colors hover:bg-[#e2f2f0]"
              >
                <Shuffle className="h-5 w-5" aria-hidden="true" />
                Random Question
              </button>
            </div>

            <section className="mt-7 rounded-xl bg-white/80 p-[22px] shadow-[0_1px_3px_rgba(7,25,35,0.08)]">
              <div className="grid gap-[28px] xl:grid-cols-[minmax(280px,1fr)_1.4fr] xl:items-center">
                <div>
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="text-base font-black text-[#071923]">
                      Overall Progress
                    </h2>
                    <span className="text-2xl font-black text-[#071923]">
                      {overallPercent}%
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-[#314956]">
                    {totals.completed} / {totals.total} completed
                  </p>
                  <div className="mt-[18px] h-2 overflow-hidden rounded-full bg-[#dfe8ea]">
                    <div
                      className="h-full rounded-full bg-[#159a9d]"
                      style={{ width: `${overallPercent}%` }}
                    />
                  </div>
                  <p className="mt-[14px] text-xs font-medium text-[#5d707a]">
                    {remaining} questions remaining
                  </p>
                </div>
                <div className="grid gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
                  {summaryStats.map((item) => (
                    <SummaryStat
                      key={item.label}
                      label={item.label}
                      value={item.value}
                      icon={item.icon}
                    />
                  ))}
                </div>
              </div>
            </section>

            <div className="mt-5 flex items-center justify-between gap-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#08787b]">
                {normalisedQuery
                  ? `${filteredCategories.length} matching categories`
                  : "All categories"}
              </p>
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-xs font-bold text-[#4a6370] hover:text-[#08787b]"
                >
                  Clear search
                </button>
              )}
            </div>

            <section className="mt-3 grid gap-[18px] md:grid-cols-2 xl:grid-cols-4">
              {filteredCategories.map((category) => (
                <CategoryCard
                  key={category.title}
                  category={category}
                  onOpen={() => openCategory(category)}
                />
              ))}
              {filteredCategories.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#b9cbcf] bg-white p-8 text-center xl:col-span-4">
                  <p className="text-sm font-black text-[#071923]">
                    No categories found
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#4a6370]">
                    Try searching for ethics, teamwork, NHS, data or motivation.
                  </p>
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
