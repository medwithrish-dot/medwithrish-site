"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock,
  FileText,
  Flame,
  Grid3X3,
  Home,
  Landmark,
  MessageCircle,
  Mic,
  Scale,
  Search,
  ShieldCheck,
  Shuffle,
  Trophy,
  User,
  Users,
  Zap,
} from "lucide-react";

const navSections = [
  {
    items: [
      { label: "Dashboard", icon: Home, href: "/phloemai/interviews" },
      { label: "AI Interviews", icon: Mic, href: "/phloemai/interviews/ai-interviews" },
      {
        label: "Question Bank",
        icon: ClipboardList,
        href: "/phloemai/interviews/question-bank",
        active: true,
      },
      { label: "Universities", icon: Landmark, href: "/phloemai/interviews/universities" },
      { label: "Guides", icon: BookOpen, href: "/phloemai/interviews/guides" },
    ],
  },
  {
    items: [
      { label: "Groups", icon: Users, href: "/phloemai/interviews/groups" },
      { label: "Leaderboard", icon: Trophy, href: "/phloemai/interviews/leaderboard" },
    ],
  },
  {
    items: [
      { label: "Progress", icon: BarChart3, href: "/phloemai/interviews/progress" },
      { label: "Reports", icon: FileText, href: "/phloemai/interviews/reports" },
    ],
  },
] as const;

const categories = [
  {
    title: "Personal & Motivation",
    description: "Why medicine, work experience, resilience",
    completed: 48,
    total: 150,
    icon: User,
    colour: "#0f9b7d",
    bg: "bg-[#e7f7f2]",
    href: "/phloemai/interviews/stations/motivation-question",
  },
  {
    title: "Communication & Teamwork",
    description: "Working in teams, resolving conflicts, leadership",
    completed: 50,
    total: 180,
    icon: Users,
    colour: "#2477ef",
    bg: "bg-[#eaf2ff]",
    href: "/phloemai/interviews/stations/teamwork-group-discussion",
  },
  {
    title: "Ethics & Professionalism",
    description: "Confidentiality, consent, values and dilemmas",
    completed: 55,
    total: 220,
    icon: Scale,
    colour: "#ea5a1d",
    bg: "bg-[#fff0e7]",
    href: "/phloemai/interviews/stations/ethics-confidentiality",
  },
  {
    title: "NHS & Healthcare",
    description: "NHS structure, challenges, policies and priorities",
    completed: 61,
    total: 160,
    icon: ShieldCheck,
    colour: "#0f9b61",
    bg: "bg-[#e8f8ef]",
    href: "/phloemai/interviews/stations/nhs-waiting-lists",
  },
  {
    title: "Hot Topics",
    description: "Current events, health policy, global issues",
    completed: 60,
    total: 200,
    icon: Flame,
    colour: "#7c4dde",
    bg: "bg-[#f1ecff]",
    href: "/phloemai/interviews/stations/nhs-waiting-lists",
  },
  {
    title: "Data & Analysis",
    description: "Graphs, statistics, research evidence",
    completed: 32,
    total: 120,
    icon: BarChart3,
    colour: "#169dad",
    bg: "bg-[#e8f8fb]",
    href: "/phloemai/interviews/stations/data-analysis",
  },
  {
    title: "Role Play & MMI Tasks",
    description: "Scenario based tasks, role plays and stations",
    completed: 24,
    total: 100,
    icon: MessageCircle,
    colour: "#e9487f",
    bg: "bg-[#ffe9f0]",
    href: "/phloemai/interviews/stations/role-play-mmi-tasks",
  },
  {
    title: "Curveballs & Quick-Fire",
    description: "Unexpected questions, rapid fire challenges",
    completed: 16,
    total: 80,
    icon: Zap,
    colour: "#f59e0b",
    bg: "bg-[#fff4db]",
    href: "/phloemai/interviews/stations/curveballs-quick-fire",
  },
] as const;

function MedMaxLogo() {
  return (
    <Link href="/phloemai/interviews" className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0c5d57] text-xl font-black text-[#62e7df]">
        M
      </div>
      <div>
        <p className="text-xl font-black leading-6 text-white">MedMax</p>
        <p className="mt-1 text-sm font-medium text-slate-200">Med Interviews</p>
      </div>
    </Link>
  );
}

function Sidebar() {
  return (
    <aside className="hidden min-h-screen bg-[#04332f] px-4 py-7 text-white lg:flex lg:flex-col">
      <MedMaxLogo />

      <nav className="mt-7 space-y-7">
        {navSections.map((section, index) => (
          <div
            key={index}
            className={`${index === 0 ? "border-t" : ""} border-white/10 pt-6`}
          >
            <div className="space-y-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex h-12 items-center gap-4 rounded-xl px-4 text-sm font-semibold transition-colors ${
                      "active" in item && item.active
                        ? "bg-[#0f817a] text-white shadow-sm"
                        : "text-slate-200 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <Link
        href="/phloemai/account"
        className="mt-auto block rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#96e7df] text-sm font-bold text-[#07534e]">
            RS
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">Rishoo S.</p>
            <p className="mt-1 truncate text-xs font-medium text-slate-300">
              Premium Plan
            </p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-200" aria-hidden="true" />
        </div>
      </Link>
    </aside>
  );
}

function ProgressRing({ percent, colour }: { percent: number; colour: string }) {
  return (
    <div className="relative h-28 w-28 shrink-0">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${colour} 0deg ${
            percent * 3.6
          }deg, #e7edf0 ${percent * 3.6}deg 360deg)`,
        }}
      />
      <div className="absolute inset-[10px] flex items-center justify-center rounded-full bg-white">
        <span className="text-2xl font-black text-[#071923]">{percent}%</span>
      </div>
    </div>
  );
}

function getPercent(completed: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

function MiniRing({
  percent,
  colour,
}: {
  percent: number;
  colour: string;
}) {
  return (
    <div className="relative h-12 w-12 shrink-0">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${colour} 0deg ${
            percent * 3.6
          }deg, #e7edf0 ${percent * 3.6}deg 360deg)`,
        }}
      />
      <div className="absolute inset-[5px] flex items-center justify-center rounded-full bg-white">
        <span className="text-xs font-black" style={{ color: colour }}>
          {percent}%
        </span>
      </div>
    </div>
  );
}

function CategoryCard({ category }: { category: (typeof categories)[number] }) {
  const Icon = category.icon;
  const percent = getPercent(category.completed, category.total);
  const remaining = category.total - category.completed;

  return (
    <Link
      href={category.href}
      className="group relative min-h-[204px] overflow-hidden rounded-xl border border-[#d9e2e7] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#159a9d] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#159a9d]/40"
    >
      <div
        className="absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity group-hover:opacity-100"
        style={{ backgroundColor: category.colour }}
      />

      <div className="grid grid-cols-[62px_minmax(0,1fr)_32px] gap-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full ${category.bg}`}
          style={{ color: category.colour }}
        >
          <Icon className="h-8 w-8" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-black text-[#071923]">
            {category.title}
          </h2>
          <p className="mt-2 min-h-10 text-xs font-medium leading-5 text-[#314956]">
            {category.description}
          </p>
        </div>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f1f6f8] text-[#4a6370] transition-colors group-hover:bg-[#e3f4f2] group-hover:text-[#08787b]"
          aria-hidden="true"
        >
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_52px] items-end gap-4">
        <div>
          <p
            className="text-2xl font-black leading-none"
            style={{ color: category.colour }}
          >
            {category.total}+
          </p>
          <p className="mt-1 text-xs font-semibold text-[#314956]">questions</p>
        </div>
        <MiniRing percent={percent} colour={category.colour} />
      </div>

      <div className="mt-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-[#e3eaee]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${percent}%`,
              backgroundColor: category.colour,
            }}
          />
        </div>
        <p className="mt-2 text-xs font-medium text-[#314956]">
          {category.completed} / {category.total} done - {remaining} left
        </p>
      </div>
    </Link>
  );
}

export function InterviewQuestionBankDashboard() {
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
    <main className="phloem-dashboard-compact min-h-screen bg-[#f5f8fa] text-[#071923]">
      <div className="grid min-h-screen lg:grid-cols-[250px_1fr]">
        <Sidebar />

        <section className="min-w-0">
          <header className="flex h-16 items-center justify-end border-b border-[#dfe7ec] bg-white px-6">
            <div className="flex items-center gap-5">
              <Link
                href="/phloemai/interviews/notifications"
                aria-label="Notifications"
                className="rounded-lg p-2 text-[#071923] transition-colors hover:bg-[#edf7f6] hover:text-[#08787b]"
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="/phloemai/account"
                className="flex items-center gap-3 rounded-xl px-2 py-1 transition-colors hover:bg-[#edf7f6]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c9f1ec] text-sm font-bold text-[#08787b]">
                  RS
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold leading-4 text-[#071923]">
                    Rishoo S.
                  </p>
                  <p className="mt-1 text-xs font-medium text-[#314956]">
                    Premium Plan
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-[#314956]" aria-hidden="true" />
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-[1540px] px-5 py-8 sm:px-7 lg:px-10">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-[#071923]">
                  Question Bank
                </h1>
                <p className="mt-2 text-sm font-medium text-[#4a6370]">
                  Explore {totals.total}+ interview questions across{" "}
                  {categories.length} categories.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex h-12 min-w-0 items-center gap-3 rounded-lg border border-[#d4dee6] bg-white px-4 shadow-sm sm:w-[380px]">
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
                  className="flex h-12 items-center justify-center gap-3 rounded-lg border border-[#159a9d] bg-white px-5 text-sm font-black text-[#08787b] shadow-sm transition-colors hover:bg-[#edf7f6]"
                >
                  <Shuffle className="h-5 w-5" aria-hidden="true" />
                  Random Question
                </button>
              </div>
            </div>

            <section className="mt-7 rounded-xl border border-[#d9e2e7] bg-white p-6 shadow-sm">
              <div className="grid gap-6 xl:grid-cols-[120px_minmax(260px,1fr)_1px_1.7fr] xl:items-center">
                <ProgressRing percent={overallPercent} colour="#159a9d" />
                <div>
                  <h2 className="text-base font-black text-[#071923]">
                    Overall Progress
                  </h2>
                  <p className="mt-2 text-sm font-medium text-[#314956]">
                    {totals.completed} / {totals.total} completed
                  </p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e3eaee]">
                    <div
                      className="h-full rounded-full bg-[#159a9d]"
                      style={{ width: `${overallPercent}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs font-medium text-[#314956]">
                    {remaining} questions remaining
                  </p>
                </div>
                <div className="hidden h-24 w-px bg-[#d9e2e7] xl:block" />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Categories", value: String(categories.length), icon: Grid3X3 },
                    { label: "Total Questions", value: `${totals.total}+`, icon: FileText },
                    { label: "Completed", value: String(totals.completed), icon: CheckCircle2 },
                    { label: "Remaining", value: String(remaining), icon: Clock },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-3 rounded-lg bg-[#f7fafb] p-3"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eef5f5] text-[#08787b]">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span>
                          <span className="block text-lg font-black text-[#071923]">
                            {item.value}
                          </span>
                          <span className="mt-1 block text-xs font-medium text-[#4a6370]">
                            {item.label}
                          </span>
                        </span>
                      </div>
                    );
                  })}
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

            <section className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
