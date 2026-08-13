import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  Check,
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
      className={`flex h-12 w-full items-center gap-4 rounded-xl px-4 text-sm font-semibold transition-colors ${
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
    <div className="relative h-[140px] w-[140px] shrink-0">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(#159a9d 0deg 281deg, #d8e7e7 281deg 360deg)",
        }}
      />
      <div className="absolute inset-[10px] flex flex-col items-center justify-center rounded-full bg-white">
        <span className="text-[34px] font-bold leading-none text-[#071923]">
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
    <main className="phloem-dashboard-compact min-h-screen bg-[#eef1f3] text-[#071923]">
      <div className="grid min-h-screen lg:grid-cols-[230px_1fr]">
        <aside className="hidden border-r border-[#093f3a] bg-[#042724] px-4 py-5 text-slate-100 lg:block">
          <Link
            href="/phloemai/dashboard"
            className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-[#0b3431] px-2.5 py-2.5 text-left shadow-sm transition-colors hover:border-teal-300/40 hover:bg-[#123f3b] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#123f3b] text-xs font-bold text-white">
              MWR
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-lg font-bold text-white">
                Phloem<span className="text-[#8be5df]">AI</span>
              </span>
              <span className="mt-0.5 block truncate text-xs font-semibold text-slate-300">
                Interview Prep
              </span>
            </span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0f4a45] text-[#86e6e1] ring-1 ring-white/10 transition-colors group-hover:bg-[#1aa0a5] group-hover:text-white">
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Link>

          <nav className="mt-8 space-y-2">
            <div>
              <SidebarLink icon={Home} label="Dashboard" active />
            </div>
          </nav>

          <div className="mt-8 space-y-8">
            {sidebarSections.map((section) => (
              <div key={section.label}>
                <p className="px-4 text-xs font-bold uppercase tracking-wide text-slate-500">
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
          </div>

          <div className="mt-8 space-y-2">
            <SidebarLink icon={Settings} label="Settings" />
            <SidebarLink icon={ShieldQuestion} label="Help & Support" />
          </div>

          <div className="mt-8 rounded-xl border border-white/10 bg-[#082f2c] p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#123f3b] text-[#8be5df]">
              <Mic className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-sm font-bold text-white">
              Interview practice
            </h2>
            <p className="mt-3 text-sm font-medium leading-6 text-slate-300">
              MMI, panel, ethics and motivation prep in one dashboard.
            </p>
          </div>
        </aside>

        <section className="min-w-0 px-5 py-7 sm:px-6 lg:px-6 lg:py-5">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold leading-tight text-[#071923]">
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
                className="relative flex h-10 w-10 items-center justify-center rounded-lg text-[#071923] transition-colors hover:bg-white"
              >
                <span className="absolute right-2 top-1.5 h-2.5 w-2.5 rounded-full bg-[#159a9d]" />
                <Bell className="h-5 w-5" aria-hidden="true" />
              </button>
              <Link
                href="#"
                className="flex h-10 min-w-[260px] items-center justify-between rounded-lg border border-[#d8e0e6] bg-white px-4 text-sm font-semibold text-[#071923] shadow-sm transition-colors hover:border-[#159a9d]"
              >
                <span className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-[#e07a2f]" aria-hidden="true" />
                  18 days to Manchester interview
                </span>
                <ChevronRight className="h-4 w-4 text-[#4a6370]" aria-hidden="true" />
              </Link>
            </div>
          </header>

          <section className="mt-5 grid min-h-[184px] gap-5 rounded-xl border border-[#cfe0df] bg-white p-5 shadow-sm lg:grid-cols-[150px_1px_minmax(0,1fr)] lg:items-center">
            <div className="flex justify-center lg:justify-start">
              <ProgressRing />
            </div>
            <div className="hidden h-[132px] w-px bg-[#d8e0e6] lg:block" />
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#071923]">
                You&apos;re making great progress!
              </h2>
              <p className="mt-2 text-sm font-medium text-[#314956]">
                Keep practising your weaker areas to boost your score.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="grid min-w-0 grid-cols-[38px_minmax(0,1fr)] items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#cfe0df] bg-[#edf7f6] text-[#08787b] shadow-sm">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-lg font-bold text-[#071923]">
                          {stat.value}
                        </span>
                        <span className="mt-0.5 block text-xs font-medium leading-5 text-[#4a6370]">
                          {stat.label}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-4 xl:grid-cols-3">
            <article className="min-h-[254px] rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-sm">
              <PanelTitle title="Your next best action" />
              <div className="mt-5 flex gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#cfe0df] bg-[#edf7f6] text-[#08787b] shadow-sm">
                  <ShieldQuestion className="h-7 w-7" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[#071923]">
                    Ethics - Confidentiality
                  </h3>
                  <p className="mt-2 max-w-[290px] text-sm font-medium leading-6 text-[#314956]">
                    You&apos;ve been weaker on ethics scenario questions. Let&apos;s
                    improve that.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
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
                className="mt-5 flex h-10 items-center justify-center gap-3 rounded-lg bg-[#159a9d] px-4 text-sm font-bold text-white transition-colors hover:bg-[#08787b]"
              >
                Start AI Station
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>

            <article className="min-h-[254px] rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-sm">
              <PanelTitle title="Your interviews" />
              <div className="mt-5 overflow-hidden rounded-lg border border-[#d8e0e6]">
                {interviews.map((interview, index) => (
                  <Link
                    href="#"
                    key={interview.name}
                    className={`grid grid-cols-[36px_minmax(0,1fr)_78px_16px] items-center gap-3 bg-white px-3 py-3 transition-colors hover:bg-[#f4f8f8] ${
                      index === interviews.length - 1 ? "" : "border-b border-[#e4eaee]"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${interview.colour} text-xs font-bold text-white`}
                    >
                      {interview.name.slice(0, 2)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-[#071923]">
                        {interview.name}
                      </span>
                      <span className="mt-1 block text-xs font-medium text-[#4a6370]">
                        {interview.meta}
                      </span>
                    </span>
                    <span className="text-xs font-medium leading-4 text-[#4a6370]">
                      Ready:{" "}
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

            <article className="min-h-[254px] rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-sm">
              <PanelTitle title="Today's plan" action="1 / 3 done" />
              <div className="mt-5 overflow-hidden rounded-lg border border-[#d8e0e6]">
                {plan.map((item, index) => (
                  <Link
                    href="#"
                    key={item.label}
                    className={`grid grid-cols-[26px_minmax(0,1fr)_72px_14px] items-center gap-3 bg-white px-3 py-3 transition-colors hover:bg-[#f4f8f8] ${
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
                    <span className="truncate text-sm font-medium text-[#071923]">
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

            <article className="min-h-[250px] rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-sm">
              <PanelTitle title="Strengths & weaknesses" />
              <div className="mt-5 space-y-2.5">
                {strengths.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="grid grid-cols-[24px_minmax(86px,1fr)_86px_34px] items-center gap-2"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#edf7f6] text-[#08787b]">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="truncate text-sm font-medium text-[#071923]">
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

            <article className="min-h-[250px] rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-sm">
              <PanelTitle title="Recent performance" action="View all" />
              <div className="mt-5 space-y-4">
                {performance.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      href="#"
                      key={item.label}
                      className="grid grid-cols-[34px_minmax(0,1fr)_42px] items-center gap-3 rounded-lg transition-colors hover:bg-[#f4f8f8]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf7f6] text-[#08787b]">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-[#071923]">
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

            <article className="flex min-h-[250px] flex-col rounded-xl border border-[#cfe0df] bg-[#f7fbfb] p-5 text-center shadow-sm">
              <PanelTitle title="Weekly insight" />
              <div className="flex flex-1 flex-col items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#cfe0df] bg-white text-[#08787b] shadow-sm">
                  <BarChart3 className="h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-bold text-[#071923]">
                  You improved by 6%
                </h3>
                <p className="mt-3 max-w-[260px] text-sm font-medium leading-6 text-[#314956]">
                  Great job. Your consistency is paying off.
                </p>
                <Link
                  href="#"
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-[#9bcac8] bg-white px-5 text-sm font-bold text-[#08787b] transition-colors hover:border-[#159a9d] hover:bg-[#edf7f6]"
                >
                  See full report
                </Link>
              </div>
            </article>
          </section>
        </section>
      </div>
    </main>
  );
}
