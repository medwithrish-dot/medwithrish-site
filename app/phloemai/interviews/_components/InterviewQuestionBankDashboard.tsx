"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
  Clock,
  Drama,
  FileText,
  Flame,
  Grid3X3,
  HeartHandshake,
  MessagesSquare,
  Scale,
  Search,
  Shuffle,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { InterviewAccountControls } from "../InterviewAccountControls";
import { InterviewSidebar } from "./InterviewSidebar";

type InterviewQuestionCategory = {
  title: string;
  description: string;
  completed: number;
  total: number;
  icon: LucideIcon;
  colour: string;
  tint: string;
  iconTint: string;
  href: string;
};

type SummaryStatItem = {
  label: string;
  value: string;
  icon: LucideIcon;
};

const categories = [
  {
    title: "Personal & Motivation",
    description: "Work experience / resilience / motivation",
    completed: 48,
    total: 150,
    icon: HeartHandshake,
    colour: "#0f9b7d",
    tint: "#f4fbf8",
    iconTint: "#e2f5ef",
    href: "/phloemai/interviews/stations/motivation-question",
  },
  {
    title: "Communication & Teamwork",
    description: "Teamwork / conflict / leadership",
    completed: 50,
    total: 180,
    icon: MessagesSquare,
    colour: "#2477ef",
    tint: "#f5f9ff",
    iconTint: "#e6f0ff",
    href: "/phloemai/interviews/stations/teamwork-group-discussion",
  },
  {
    title: "Ethics & Professionalism",
    description: "Confidentiality / consent / dilemmas",
    completed: 55,
    total: 220,
    icon: Scale,
    colour: "#ea5a1d",
    tint: "#fff8f3",
    iconTint: "#ffede3",
    href: "/phloemai/interviews/stations/ethics-confidentiality",
  },
  {
    title: "NHS & Healthcare",
    description: "NHS structure / policy / priorities",
    completed: 61,
    total: 160,
    icon: Stethoscope,
    colour: "#0f9b61",
    tint: "#f5fbf7",
    iconTint: "#e2f5ea",
    href: "/phloemai/interviews/stations/nhs-waiting-lists",
  },
  {
    title: "Hot Topics",
    description: "Current events / health policy / debate",
    completed: 60,
    total: 200,
    icon: Flame,
    colour: "#7c4dde",
    tint: "#faf7ff",
    iconTint: "#f0eaff",
    href: "/phloemai/interviews/stations/nhs-waiting-lists",
  },
  {
    title: "Data & Analysis",
    description: "Graphs / statistics / evidence",
    completed: 32,
    total: 120,
    icon: ChartNoAxesColumnIncreasing,
    colour: "#169dad",
    tint: "#f4fbfc",
    iconTint: "#e3f5f8",
    href: "/phloemai/interviews/stations/data-analysis",
  },
  {
    title: "Role Play & MMI Tasks",
    description: "Scenarios / empathy / stations",
    completed: 24,
    total: 100,
    icon: Drama,
    colour: "#e9487f",
    tint: "#fff6f9",
    iconTint: "#ffe6ef",
    href: "/phloemai/interviews/stations/role-play-mmi-tasks",
  },
  {
    title: "Curveballs & Quick-Fire",
    description: "Unexpected questions / rapid fire",
    completed: 16,
    total: 80,
    icon: Sparkles,
    colour: "#f59e0b",
    tint: "#fffbf2",
    iconTint: "#fff1ce",
    href: "/phloemai/interviews/stations/curveballs-quick-fire",
  },
] as const satisfies readonly InterviewQuestionCategory[];

function getPercent(completed: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
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

function CategoryCard({ category }: { category: InterviewQuestionCategory }) {
  const Icon = category.icon;
  const percent = getPercent(category.completed, category.total);
  const remaining = category.total - category.completed;

  return (
    <Link
      href={category.href}
      aria-label={`Open ${category.title} interview questions`}
      className="group relative flex min-h-[226px] flex-col overflow-hidden rounded-xl border border-white/80 bg-white p-[22px] pt-6 shadow-[0_1px_3px_rgba(7,25,35,0.08)] transition-all hover:-translate-y-0.5 hover:border-white hover:shadow-[0_10px_24px_rgba(7,25,35,0.1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#159a9d]/40"
      style={{
        background: `linear-gradient(135deg, ${category.tint} 0%, rgba(255,255,255,0.92) 54%, #ffffff 100%)`,
      }}
    >
      <span
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: category.colour }}
        aria-hidden="true"
      />

      <div className="grid grid-cols-[56px_minmax(0,1fr)_32px] items-start gap-[18px]">
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
          <p className="mt-3 text-sm font-medium leading-6 text-[#4f6470]">
            {category.description}
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

      <div className="mt-auto pt-[28px]">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold text-[#526976]">
            {category.total} questions
          </p>
          <p
            className="rounded-full px-2.5 py-1 text-xs font-black"
            style={{
              backgroundColor: category.iconTint,
              color: category.colour,
            }}
          >
            {percent}% complete
          </p>
        </div>
        <div className="mt-[12px] h-1.5 overflow-hidden rounded-full bg-[#dfe8ea]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${percent}%`,
              backgroundColor: category.colour,
            }}
          />
        </div>
        <p className="mt-[14px] text-xs font-medium text-[#5d707a]">
          {category.completed} done / {remaining} left
        </p>
      </div>
    </Link>
  );
}

export function InterviewQuestionBankDashboard({
  showPremiumCard,
}: {
  showPremiumCard: boolean;
}) {
  const [query, setQuery] = useState("");
  const totals = useMemo(
    () =>
      categories.reduce(
        (acc, category) => ({
          total: acc.total + category.total,
          completed: acc.completed + category.completed,
        }),
        { total: 0, completed: 0 }
      ),
    []
  );
  const overallPercent = getPercent(totals.completed, totals.total);
  const remaining = totals.total - totals.completed;
  const summaryStats = [
    { label: "Categories", value: String(categories.length), icon: Grid3X3 },
    { label: "Total Questions", value: String(totals.total), icon: FileText },
    { label: "Completed", value: String(totals.completed), icon: CheckCircle2 },
    { label: "Remaining", value: String(remaining), icon: Clock },
  ] satisfies readonly SummaryStatItem[];
  const normalisedQuery = query.trim().toLowerCase();
  const filteredCategories = useMemo(() => {
    if (!normalisedQuery) return categories;
    return categories.filter((category) =>
      [category.title, category.description]
        .join(" ")
        .toLowerCase()
        .includes(normalisedQuery)
    );
  }, [normalisedQuery]);

  const openRandomQuestion = () => {
    const category =
      categories[Math.floor(Math.random() * categories.length)] ?? categories[0];
    window.location.assign(category.href);
  };

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
                  {categories.length} categories.
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
                <CategoryCard key={category.title} category={category} />
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
