import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  Flame,
  Home,
  Landmark,
  MessageSquare,
  Mic,
  Settings,
  ShieldQuestion,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Interview Prep Dashboard | PhloemAI",
  description:
    "A medicine and dentistry interview preparation dashboard for MMI practice, university tracking, question banks and interview readiness.",
  alternates: {
    canonical: "/phloemai/interviews",
  },
};

const sidebarSections = [
  {
    label: "Practice",
    items: [
      { label: "AI Interviews", icon: Mic },
      { label: "Question Bank", icon: ClipboardList },
      { label: "Universities", icon: Landmark },
    ],
  },
  {
    label: "Community",
    items: [
      { label: "Groups", icon: Users },
      { label: "Leaderboard", icon: Trophy },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Progress", icon: BarChart3 },
      { label: "Reports", icon: FileText },
    ],
  },
  {
    label: "Tools",
    items: [{ label: "Mic Check", icon: Mic }],
  },
] as const;

const stats = [
  { label: "Stations completed", value: "42", icon: ClipboardList },
  { label: "Average score", value: "71%", icon: BarChart3 },
  { label: "Practice time", value: "5h 32m", icon: Bell },
] as const;

const interviews = [
  {
    name: "Manchester",
    meta: "18 days remaining",
    score: "82%",
    colour: "bg-[#0f766e]",
  },
  {
    name: "Sheffield",
    meta: "32 days remaining",
    score: "71%",
    colour: "bg-[#159a9d]",
  },
  {
    name: "Birmingham",
    meta: "Date not set",
    score: "61%",
    colour: "bg-[#e07a2f]",
  },
] as const;

const plan = [
  { label: "Motivation question", status: "Completed", done: true },
  { label: "Ethics AI station", status: "8 mins", done: false },
  { label: "Hot topic: NHS waiting lists", status: "8 mins", done: false },
] as const;

const strengths = [
  { label: "Communication", value: 84, colour: "bg-[#129a72]", icon: MessageSquare },
  { label: "Motivation", value: 79, colour: "bg-[#129a72]", icon: Zap },
  { label: "Teamwork", value: 73, colour: "bg-[#159a9d]", icon: Users },
  { label: "Ethics", value: 72, colour: "bg-[#f59e0b]", icon: ShieldQuestion },
  { label: "NHS Knowledge", value: 68, colour: "bg-[#ef7a45]", icon: Building2 },
  { label: "Hot Topics", value: 62, colour: "bg-[#ef4444]", icon: Flame },
] as const;

const performance = [
  { label: "Manchester Mock #2", meta: "3 days ago", score: "78%", colour: "text-[#129a72]", icon: ClipboardList },
  { label: "Ethics - Resource Allocation", meta: "5 days ago", score: "72%", colour: "text-[#e07a2f]", icon: BookOpen },
  { label: "Motivation - Personal Why", meta: "1 week ago", score: "81%", colour: "text-[#129a72]", icon: MessageSquare },
  { label: "Teamwork - Group Discussion", meta: "1 week ago", score: "74%", colour: "text-[#129a72]", icon: Users },
] as const;

function SidebarLink({
  icon: Icon,
  label,
  active = false,
}: {
  icon: typeof Home;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href="#"
      className={`flex h-11 items-center gap-4 rounded-xl px-4 text-sm font-semibold transition-colors ${
        active
          ? "bg-[#123f3b] text-[#8be5df]"
          : "text-slate-300 hover:bg-[#0b3431] hover:text-white"
      }`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

function ProgressRing() {
  return (
    <div className="relative h-[154px] w-[154px] shrink-0">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(#159a9d 0deg 281deg, #d8e7e7 281deg 360deg)",
        }}
      />
      <div className="absolute inset-[10px] flex flex-col items-center justify-center rounded-full bg-white">
        <span className="text-[38px] font-bold leading-none text-[#071923]">
          78<span className="text-xl">%</span>
        </span>
        <span className="mt-2 text-xs font-semibold text-[#4a6370]">
          Overall readiness
        </span>
      </div>
    </div>
  );
}

function PanelTitle({
  title,
  action,
}: {
  title: string;
  action?: string;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <h2 className="text-xs font-bold uppercase tracking-[0.08em] text-[#08787b]">
        {title}
      </h2>
      {action && (
        <Link
          href="#"
          className="text-xs font-semibold text-[#08787b] hover:text-[#042724]"
        >
          {action}
        </Link>
      )}
    </div>
  );
}

export default function InterviewPrepDashboardPage() {
  return (
    <main className="min-h-screen bg-[#eef1f3] text-[#071923]">
      <div className="grid min-h-screen lg:grid-cols-[264px_1fr]">
        <aside className="hidden border-r border-[#093f3a] bg-[#042724] px-[18px] py-8 text-slate-100 lg:flex lg:flex-col">
          <Link
            href="/phloemai/dashboard"
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0b3431] px-4 py-3 transition-colors hover:border-teal-300/40 hover:bg-[#123f3b]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#123f3b] text-sm font-bold text-white">
              MWR
            </span>
            <span className="min-w-0">
              <span className="block text-xl font-bold text-white">
                Phloem<span className="text-[#8be5df]">AI</span>
              </span>
              <span className="block text-xs font-semibold text-slate-300">
                Interview Prep
              </span>
            </span>
          </Link>

          <nav className="mt-8 space-y-8">
            <div className="space-y-2">
              <SidebarLink icon={Home} label="Dashboard" active />
            </div>
            {sidebarSections.map((section) => (
              <div key={section.label}>
                <p className="px-4 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                  {section.label}
                </p>
                <div className="mt-3 space-y-2">
                  {section.items.map((item) => (
                    <SidebarLink
                      key={item.label}
                      icon={item.icon}
                      label={item.label}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-auto space-y-3 pt-8">
            <SidebarLink icon={Settings} label="Settings" />
            <SidebarLink icon={ShieldQuestion} label="Help & Support" />
            <div className="rounded-xl border border-white/10 bg-[#0b3431] px-4 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d6eeee] text-sm font-bold text-[#08787b]">
                  R
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-white">Rishoo</span>
                  <span className="block text-xs font-semibold text-[#8be5df]">
                    Premium Plan
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 text-slate-300" aria-hidden="true" />
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-[28px] font-bold leading-tight text-[#071923]">
                Good morning, Rishoo
              </h1>
              <p className="mt-2 text-sm font-medium text-[#314956]">
                Let&apos;s keep your interview prep on track.
              </p>
            </div>
            <div className="flex items-center gap-5">
              <button
                type="button"
                aria-label="Notifications"
                className="relative flex h-11 w-11 items-center justify-center rounded-xl text-[#071923] transition-colors hover:bg-white"
              >
                <span className="absolute right-2 top-1.5 h-2.5 w-2.5 rounded-full bg-[#159a9d]" />
                <Bell className="h-5 w-5" aria-hidden="true" />
              </button>
              <Link
                href="#"
                className="flex h-12 min-w-[306px] items-center justify-between rounded-xl border border-[#d8e0e6] bg-white px-5 text-sm font-semibold text-[#071923] shadow-sm transition-colors hover:border-[#159a9d]"
              >
                <span className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-[#e07a2f]" aria-hidden="true" />
                  18 days to Manchester interview
                </span>
                <ChevronRight className="h-4 w-4 text-[#4a6370]" aria-hidden="true" />
              </Link>
            </div>
          </header>

          <section className="mt-8 grid min-h-[212px] gap-8 rounded-xl border border-[#cfe0df] bg-white px-8 py-7 shadow-sm lg:grid-cols-[190px_1px_1fr_330px] lg:items-center">
            <div className="flex justify-center lg:justify-start">
              <ProgressRing />
            </div>
            <div className="hidden h-[154px] w-px bg-[#d8e0e6] lg:block" />
            <div>
              <h2 className="text-xl font-bold text-[#071923]">
                You&apos;re making great progress!
              </h2>
              <p className="mt-2 text-sm font-medium text-[#314956]">
                Keep practising your weaker areas to boost your score.
              </p>
              <div className="mt-7 grid gap-5 sm:grid-cols-3">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#cfe0df] bg-[#edf7f6] text-[#08787b] shadow-sm">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-xl font-bold text-[#071923]">
                          {stat.value}
                        </span>
                        <span className="mt-0.5 block max-w-[84px] text-xs font-medium leading-5 text-[#4a6370]">
                          {stat.label}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="hidden h-[156px] rounded-xl border border-[#d8e0e6] bg-[#f4f8f8] p-5 lg:block">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#08787b]">
                    Manchester MMI
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#071923]">
                    6 stations planned
                  </p>
                </div>
                <div className="grid grid-cols-6 items-end gap-2">
                  {[44, 58, 49, 72, 63, 86].map((height, index) => (
                    <span
                      key={index}
                      className="rounded-t-md bg-[#159a9d]/25"
                      style={{ height }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_1fr_1.08fr]">
            <article className="min-h-[313px] rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-sm">
              <PanelTitle title="Your next best action" />
              <div className="mt-8 flex gap-4">
                <span className="flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-2xl border border-[#cfe0df] bg-[#edf7f6] text-[#08787b] shadow-sm">
                  <ShieldQuestion className="h-8 w-8" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-[#071923]">
                    Ethics - Confidentiality
                  </h3>
                  <p className="mt-2 max-w-[290px] text-sm font-medium leading-6 text-[#314956]">
                    You&apos;ve been weaker on ethics scenario questions. Let&apos;s
                    improve that.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-2">
                    <span className="rounded-lg bg-[#edf7f6] px-3 py-2 text-xs font-semibold text-[#08787b]">
                      8 mins
                    </span>
                    <span className="rounded-lg bg-[#edf7f6] px-3 py-2 text-xs font-semibold text-[#08787b]">
                      AI Station
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href="#"
                className="mt-8 flex h-11 items-center justify-center gap-3 rounded-lg bg-[#159a9d] px-4 text-sm font-bold text-white transition-colors hover:bg-[#08787b]"
              >
                Start AI Station
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>

            <article className="min-h-[313px] rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-sm">
              <PanelTitle title="Your interviews" />
              <div className="mt-5 overflow-hidden rounded-xl border border-[#d8e0e6]">
                {interviews.map((interview, index) => (
                  <Link
                    href="#"
                    key={interview.name}
                    className={`grid grid-cols-[44px_1fr_auto_20px] items-center gap-3 bg-white px-4 py-3 transition-colors hover:bg-[#f4f8f8] ${
                      index === interviews.length - 1 ? "" : "border-b border-[#e4eaee]"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${interview.colour} text-xs font-bold text-white`}
                    >
                      {interview.name.slice(0, 2)}
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-[#071923]">
                        {interview.name}
                      </span>
                      <span className="mt-1 block text-xs font-medium text-[#4a6370]">
                        {interview.meta}
                      </span>
                    </span>
                    <span className="text-xs font-medium text-[#4a6370]">
                      Readiness:{" "}
                      <strong
                        className={
                          interview.score === "82%"
                            ? "text-[#129a72]"
                            : interview.score === "71%"
                              ? "text-[#e07a2f]"
                              : "text-[#e15b2f]"
                        }
                      >
                        {interview.score}
                      </strong>
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#4a6370]" aria-hidden="true" />
                  </Link>
                ))}
              </div>
              <Link
                href="#"
                className="mt-5 flex items-center justify-between text-sm font-bold text-[#08787b] hover:text-[#042724]"
              >
                View all universities
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>

            <article className="min-h-[313px] rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-sm">
              <PanelTitle title="Today's plan" action="1 / 3 done" />
              <div className="mt-5 overflow-hidden rounded-xl border border-[#d8e0e6]">
                {plan.map((item, index) => (
                  <Link
                    href="#"
                    key={item.label}
                    className={`grid grid-cols-[28px_1fr_auto_18px] items-center gap-3 bg-white px-4 py-4 transition-colors hover:bg-[#f4f8f8] ${
                      index === plan.length - 1 ? "" : "border-b border-[#e4eaee]"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                        item.done
                          ? "border-[#129a72] bg-[#129a72] text-white"
                          : "border-[#b8c8cf] bg-white text-transparent"
                      }`}
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-medium text-[#071923]">
                      {item.label}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        item.done ? "text-[#129a72]" : "text-[#4a6370]"
                      }`}
                    >
                      {item.status}
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#4a6370]" aria-hidden="true" />
                  </Link>
                ))}
              </div>
              <Link
                href="#"
                className="mt-5 flex items-center justify-between text-sm font-bold text-[#08787b] hover:text-[#042724]"
              >
                View full plan
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>

            <article className="min-h-[294px] rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-sm">
              <PanelTitle title="Strengths & weaknesses" />
              <div className="mt-5 space-y-3">
                {strengths.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="grid grid-cols-[28px_1fr_132px_38px] items-center gap-3"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#edf7f6] text-[#08787b]">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-medium text-[#071923]">
                        {item.label}
                      </span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-[#e3eaee]">
                        <span
                          className={`block h-full rounded-full ${item.colour}`}
                          style={{ width: `${item.value}%` }}
                        />
                      </span>
                      <span className="text-right text-sm font-bold text-[#071923]">
                        {item.value}%
                      </span>
                    </div>
                  );
                })}
              </div>
              <Link
                href="#"
                className="mt-6 flex items-center gap-3 text-sm font-bold text-[#08787b] hover:text-[#042724]"
              >
                View progress
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>

            <article className="min-h-[294px] rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-sm">
              <PanelTitle title="Recent performance" action="View all" />
              <div className="mt-5 space-y-4">
                {performance.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      href="#"
                      key={item.label}
                      className="grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-lg transition-colors hover:bg-[#f4f8f8]"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf7f6] text-[#08787b]">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-[#071923]">
                          {item.label}
                        </span>
                        <span className="mt-1 block text-xs font-medium text-[#4a6370]">
                          {item.meta}
                        </span>
                      </span>
                      <span className={`text-sm font-bold ${item.colour}`}>
                        {item.score}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </article>

            <article className="flex min-h-[294px] flex-col items-center justify-center rounded-xl border border-[#cfe0df] bg-[#f7fbfb] p-5 text-center shadow-sm">
              <PanelTitle title="Weekly insight" />
              <div className="mt-7 flex h-16 w-16 items-center justify-center rounded-full border border-[#cfe0df] bg-white text-[#08787b] shadow-sm">
                <BarChart3 className="h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-base font-bold text-[#071923]">
                You improved by 6%
              </h3>
              <p className="mt-3 max-w-[260px] text-sm font-medium leading-6 text-[#314956]">
                Great job. Your consistency is paying off.
              </p>
              <Link
                href="#"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-lg border border-[#9bcac8] bg-white px-6 text-sm font-bold text-[#08787b] transition-colors hover:border-[#159a9d] hover:bg-[#edf7f6]"
              >
                See full report
              </Link>
            </article>
          </section>
        </section>
      </div>
    </main>
  );
}
