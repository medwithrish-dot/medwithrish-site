"use client";

import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  Drama,
  FileText,
  Flame,
  GraduationCap,
  Grid3X3,
  HeartHandshake,
  Lightbulb,
  MessagesSquare,
  Play,
  RefreshCw,
  Scale,
  Search,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Stethoscope,
  UserRound,
  UsersRound,
} from "lucide-react";
import { InterviewAccountControls } from "../InterviewAccountControls";
import {
  INTERVIEW_QUESTIONS,
  type InterviewQuestion,
  type InterviewQuestionCategoryTitle,
  type InterviewQuestionStatus,
  type InterviewQuestionSubcategory,
} from "../_data/interviewQuestionBank";
import { InterviewSidebar } from "./InterviewSidebar";

type InterviewQuestionCategory = {
  title: InterviewQuestionCategoryTitle;
  description: string;
  subcategories: readonly InterviewQuestionSubcategory[];
  icon: LucideIcon;
  colour: string;
  tint: string;
  iconTint: string;
};

type InterviewQuestionCategorySummary = InterviewQuestionCategory & {
  questions: readonly InterviewQuestion[];
  completed: number;
  total: number;
};

type SummaryStatItem = {
  label: string;
  value: string;
  icon: LucideIcon;
};

type QuestionStatus = InterviewQuestionStatus;
type StatusFilter = "answered" | "unanswered" | "review";

const defaultStatusFilter = "unanswered" satisfies StatusFilter;

const categories = [
  {
    title: "Personal & Motivation",
    description: "Work experience / resilience / motivation",
    subcategories: [
      "Motivation for Medicine",
      "Medical School & Course",
      "Work Experience & Reflection",
      "Personal Insight",
      "Strengths, Weaknesses & Resilience",
    ],
    icon: HeartHandshake,
    colour: "#0f9b7d",
    tint: "#f4fbf8",
    iconTint: "#e2f5ef",
  },
  {
    title: "Communication & Teamwork",
    description: "Teamwork / conflict / leadership",
    subcategories: [
      "Communication & Empathy",
      "Teamwork",
      "Leadership",
      "Conflict & Difficult Conversations",
      "Giving & Receiving Feedback",
      "Working in Healthcare Teams",
    ],
    icon: MessagesSquare,
    colour: "#2477ef",
    tint: "#f5f9ff",
    iconTint: "#e6f0ff",
  },
  {
    title: "Ethics & Professionalism",
    description: "Confidentiality / consent / dilemmas",
    subcategories: [
      "Core Medical Ethics",
      "Consent, Capacity & Confidentiality",
      "Safeguarding & Duty of Candour",
      "Professionalism & Professional Boundaries",
      "End-of-Life Care & Assisted Dying",
      "Organ Donation & Resource Allocation",
      "Ethical & Professional Scenarios",
      "Situational Judgement",
    ],
    icon: Scale,
    colour: "#ea5a1d",
    tint: "#fff8f3",
    iconTint: "#ffede3",
  },
  {
    title: "NHS & Healthcare",
    description: "NHS structure / policy / priorities",
    subcategories: [
      "NHS Structure & Challenges",
      "Role of a Doctor",
      "Health Inequalities",
      "Public Health",
      "Healthcare Policy & Funding",
      "Healthcare Resources & Priorities",
    ],
    icon: Stethoscope,
    colour: "#0f9b61",
    tint: "#f5fbf7",
    iconTint: "#e2f5ea",
  },
  {
    title: "Hot Topics & Current Affairs",
    description: "Current events / health policy / debate",
    subcategories: [
      "Current NHS Issues",
      "Technology, AI & Digital Health",
      "New Treatments & Innovation",
      "Public Health Debates",
      "Workforce Issues",
      "Ethics in the News",
    ],
    icon: Flame,
    colour: "#7c4dde",
    tint: "#faf7ff",
    iconTint: "#f0eaff",
  },
  {
    title: "Data, Research & Critical Thinking",
    description: "Graphs / statistics / evidence",
    subcategories: [
      "Data Interpretation",
      "Graphs & Trends",
      "Research & Evidence",
      "Critical Appraisal",
      "Article Analysis",
      "Critical Thinking",
    ],
    icon: ChartNoAxesColumnIncreasing,
    colour: "#169dad",
    tint: "#f4fbfc",
    iconTint: "#e3f5f8",
  },
  {
    title: "Practical MMI & Role Play",
    description: "Scenarios / empathy / stations",
    subcategories: [
      "Role Play",
      "Communication Tasks",
      "Group Discussion",
      "Group Tasks",
      "Prioritisation Stations",
      "Data Stations",
    ],
    icon: Drama,
    colour: "#e9487f",
    tint: "#fff6f9",
    iconTint: "#ffe6ef",
  },
  {
    title: "Curveballs & Quick-Fire",
    description: "Unexpected questions / rapid fire",
    subcategories: [
      "Personal Quick-Fire",
      "Creative Questions",
      "Hypotheticals",
      "Opinion Questions",
      "Unexpected Questions",
    ],
    icon: Sparkles,
    colour: "#f59e0b",
    tint: "#fffbf2",
    iconTint: "#fff1ce",
  },
] as const satisfies readonly InterviewQuestionCategory[];

const subcategoryIcons = [
  Lightbulb,
  GraduationCap,
  BriefcaseBusiness,
  UserRound,
  ShieldCheck,
  MessagesSquare,
  UsersRound,
  ChartNoAxesColumnIncreasing,
  FileText,
  Sparkles,
] as const satisfies readonly LucideIcon[];

const statusMeta = {
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    colour: "#0f9b7d",
  },
  review: {
    label: "Needs Review",
    icon: RefreshCw,
    colour: "#f59e0b",
  },
  "not-attempted": {
    label: "Not Attempted",
    icon: Circle,
    colour: "#b8c3ca",
  },
} as const satisfies Record<
  QuestionStatus,
  { label: string; icon: LucideIcon; colour: string }
>;

function getPercent(completed: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

function getCompletedCount(questions: readonly InterviewQuestion[]) {
  return questions.filter((question) => question.status === "completed").length;
}

function getCategoryQuestions(categoryTitle: InterviewQuestionCategoryTitle) {
  return INTERVIEW_QUESTIONS.filter(
    (question) => question.category === categoryTitle
  );
}

function withQuestionStats(
  category: InterviewQuestionCategory
): InterviewQuestionCategorySummary {
  const questions = getCategoryQuestions(category.title);

  return {
    ...category,
    questions,
    completed: getCompletedCount(questions),
    total: questions.length,
  };
}

function getSubcategoryQuestions(
  category: InterviewQuestionCategorySummary,
  subcategory: InterviewQuestionSubcategory
) {
  return category.questions.filter(
    (question) => question.subcategory === subcategory
  );
}

function getSubcategoryStats(
  category: InterviewQuestionCategorySummary,
  subcategory: InterviewQuestionSubcategory
) {
  const questions = getSubcategoryQuestions(category, subcategory);
  const completed = getCompletedCount(questions);
  const total = questions.length;

  return {
    total,
    completed,
    remaining: total - completed,
    percent: getPercent(completed, total),
  };
}

function getQuestionSearchText(question: InterviewQuestion) {
  return [
    question.text,
    question.category,
    question.subcategory,
    question.sourceSectionTitle,
    question.sourceTopic,
    question.difficulty,
    ...question.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getFilterForQuestionStatus(status: QuestionStatus): StatusFilter {
  if (status === "completed") return "answered";
  if (status === "review") return "review";
  return "unanswered";
}

function scrollToTop() {
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

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

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${category.title} interview questions`}
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
          <h2 className="text-base font-black leading-6 text-[#071923]">
            {category.title}
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
  spotlightQuestionId,
  showPremiumCard,
  onBack,
  onSelectSubcategory,
  onStatusFilterChange,
  onQuestionQueryChange,
  onSpotlightQuestion,
}: {
  category: InterviewQuestionCategorySummary;
  selectedSubcategoryIndex: number;
  statusFilter: StatusFilter;
  questionQuery: string;
  spotlightQuestionId: string | null;
  showPremiumCard: boolean;
  onBack: () => void;
  onSelectSubcategory: (index: number) => void;
  onStatusFilterChange: (filter: StatusFilter) => void;
  onQuestionQueryChange: (query: string) => void;
  onSpotlightQuestion: (questionId: string | null) => void;
}) {
  const Icon = category.icon;
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
    onSpotlightQuestion(null);
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

    onSelectSubcategory(nextSubcategoryIndex);
    onStatusFilterChange(
      nextQuestion
        ? getFilterForQuestionStatus(nextQuestion.status)
        : defaultStatusFilter
    );
    onQuestionQueryChange("");
    onSpotlightQuestion(nextQuestion?.id ?? null);
  };

  const resumePractice = () => {
    const nextQuestion =
      questions.find((question) => question.status === "not-attempted") ??
      questions[0];

    onStatusFilterChange(defaultStatusFilter);
    onQuestionQueryChange("");
    onSpotlightQuestion(nextQuestion?.id ?? null);
  };

  const filterOptions = [
    { label: "Answered", value: "answered" },
    { label: "Unanswered", value: "unanswered" },
    { label: "Review", value: "review" },
  ] as const satisfies readonly { label: string; value: StatusFilter }[];

  return (
    <main className="phloem-dashboard-compact min-h-screen bg-[#eef1f3] text-[#071923]">
      <div className="grid min-h-screen lg:grid-cols-[230px_1fr]">
        <InterviewSidebar
          activeLabel="Question Bank"
          showPremiumCard={showPremiumCard}
        />

        <section className="min-w-0 px-5 py-7 sm:px-6 lg:px-8">
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
                Subcategories
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
                        onClick={() => onStatusFilterChange(option.value)}
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

              <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
                <div className="overflow-hidden rounded-xl border border-[#d8e0e6] bg-white shadow-[0_1px_3px_rgba(7,25,35,0.05)]">
                  {filteredQuestions.map((question, index) => {
                    const isSpotlight = question.id === spotlightQuestionId;

                    return (
                      <button
                        key={question.id}
                        type="button"
                        onClick={() => onSpotlightQuestion(question.id)}
                        className={`grid min-h-[70px] w-full grid-cols-[40px_minmax(0,1fr)_32px_18px] items-center gap-4 px-5 py-3 text-left transition-colors ${
                          index === filteredQuestions.length - 1
                            ? ""
                            : "border-b border-[#edf1f3]"
                        } ${isSpotlight ? "bg-[#f1fbfa]" : "bg-white hover:bg-[#f8fbfb]"}`}
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
}: {
  showPremiumCard: boolean;
}) {
  const [query, setQuery] = useState("");
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState<
    string | null
  >(null);
  const [selectedSubcategoryIndex, setSelectedSubcategoryIndex] = useState(0);
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>(defaultStatusFilter);
  const [questionQuery, setQuestionQuery] = useState("");
  const [spotlightQuestionId, setSpotlightQuestionId] = useState<string | null>(
    null
  );
  const categoriesWithStats = useMemo(
    () => categories.map((category) => withQuestionStats(category)),
    []
  );
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

  const resetQuestionState = () => {
    setStatusFilter(defaultStatusFilter);
    setQuestionQuery("");
    setSpotlightQuestionId(null);
  };

  const openCategory = (category: InterviewQuestionCategorySummary) => {
    setSelectedCategoryTitle(category.title);
    setSelectedSubcategoryIndex(0);
    resetQuestionState();
    scrollToTop();
  };

  const openRandomQuestion = () => {
    const question =
      INTERVIEW_QUESTIONS[
        Math.floor(Math.random() * INTERVIEW_QUESTIONS.length)
      ] ?? INTERVIEW_QUESTIONS[0];
    const category = categoriesWithStats.find(
      (item) => item.title === question?.category
    );
    if (!question || !category) return;
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
    setSpotlightQuestionId(question.id);
    scrollToTop();
  };

  const backToCategories = () => {
    setSelectedCategoryTitle(null);
    setSelectedSubcategoryIndex(0);
    resetQuestionState();
    scrollToTop();
  };

  if (selectedCategory) {
    return (
      <QuestionBankCategoryView
        category={selectedCategory}
        selectedSubcategoryIndex={selectedSubcategoryIndex}
        statusFilter={statusFilter}
        questionQuery={questionQuery}
        spotlightQuestionId={spotlightQuestionId}
        showPremiumCard={showPremiumCard}
        onBack={backToCategories}
        onSelectSubcategory={setSelectedSubcategoryIndex}
        onStatusFilterChange={setStatusFilter}
        onQuestionQueryChange={setQuestionQuery}
        onSpotlightQuestion={setSpotlightQuestionId}
      />
    );
  }

  return (
    <main className="phloem-dashboard-compact min-h-screen bg-[#eef1f3] text-[#071923]">
      <div className="grid min-h-screen lg:grid-cols-[230px_1fr]">
        <InterviewSidebar
          activeLabel="Question Bank"
          showPremiumCard={showPremiumCard}
        />

        <section className="min-w-0 px-5 py-7 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1540px]">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-[#071923]">
                  Question Bank
                </h1>
                <p className="mt-2 text-sm font-medium text-[#4a6370]">
                  Explore {totals.total}+ interview questions across{" "}
                  {categoriesWithStats.length} categories.
                </p>
              </div>
              <InterviewAccountControls />
            </header>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row xl:justify-end">
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
