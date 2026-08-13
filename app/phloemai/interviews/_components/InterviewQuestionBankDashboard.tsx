import Link from "next/link";
import {
  BarChart3,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock,
  FileText,
  Flame,
  GraduationCap,
  Grid3X3,
  Home,
  Landmark,
  MessageCircle,
  Mic,
  RotateCw,
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
    count: "150+",
    done: "48 / 150 done",
    percent: 32,
    icon: User,
    colour: "#0f9b7d",
    bg: "bg-[#e7f7f2]",
    href: "/phloemai/interviews/stations/motivation-question",
  },
  {
    title: "Communication & Teamwork",
    description: "Working in teams, resolving conflicts, leadership",
    count: "180+",
    done: "50 / 180 done",
    percent: 28,
    icon: Users,
    colour: "#2477ef",
    bg: "bg-[#eaf2ff]",
    href: "/phloemai/interviews/stations/teamwork-group-discussion",
  },
  {
    title: "Ethics & Professionalism",
    description: "Confidentiality, consent, values and dilemmas",
    count: "220+",
    done: "55 / 220 done",
    percent: 25,
    icon: Scale,
    colour: "#ea5a1d",
    bg: "bg-[#fff0e7]",
    href: "/phloemai/interviews/stations/ethics-confidentiality",
  },
  {
    title: "NHS & Healthcare",
    description: "NHS structure, challenges, policies and priorities",
    count: "160+",
    done: "61 / 160 done",
    percent: 38,
    icon: ShieldCheck,
    colour: "#0f9b61",
    bg: "bg-[#e8f8ef]",
    href: "/phloemai/interviews/stations/nhs-waiting-lists",
  },
  {
    title: "Hot Topics",
    description: "Current events, health policy, global issues",
    count: "200+",
    done: "60 / 200 done",
    percent: 30,
    icon: Flame,
    colour: "#7c4dde",
    bg: "bg-[#f1ecff]",
    href: "/phloemai/interviews/stations/nhs-waiting-lists",
  },
  {
    title: "Data & Analysis",
    description: "Graphs, statistics, research evidence",
    count: "120+",
    done: "32 / 120 done",
    percent: 27,
    icon: BarChart3,
    colour: "#169dad",
    bg: "bg-[#e8f8fb]",
    href: "/phloemai/interviews/question-bank",
  },
  {
    title: "Role Play & MMI Tasks",
    description: "Scenario based tasks, role plays and stations",
    count: "100+",
    done: "24 / 100 done",
    percent: 24,
    icon: MessageCircle,
    colour: "#e9487f",
    bg: "bg-[#ffe9f0]",
    href: "/phloemai/interviews/ai-interviews",
  },
  {
    title: "Curveballs & Quick-Fire",
    description: "Unexpected questions, rapid fire challenges",
    count: "80+",
    done: "16 / 80 done",
    percent: 20,
    icon: Zap,
    colour: "#f59e0b",
    bg: "bg-[#fff4db]",
    href: "/phloemai/interviews/question-bank",
  },
] as const;

const summaryItems = [
  {
    title: "Real interview questions",
    text: "Curated from actual interviews and applicants",
    icon: ShieldCheck,
    colour: "text-[#0d7774]",
  },
  {
    title: "Regularly updated",
    text: "New questions added weekly",
    icon: RotateCw,
    colour: "text-[#119a61]",
  },
  {
    title: "Built for med school applicants",
    text: "Designed by experts, trusted by thousands",
    icon: GraduationCap,
    colour: "text-[#6b3fd5]",
  },
] as const;

function MedMaxLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0c5d57] text-xl font-black text-[#62e7df]">
        M
      </div>
      <div>
        <p className="text-xl font-black leading-6 text-white">MedMax</p>
        <p className="mt-1 text-sm font-medium text-slate-200">Med Interviews</p>
      </div>
    </div>
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
                      item.active
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

      <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-4">
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
      </div>
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

function CategoryCard({ category }: { category: (typeof categories)[number] }) {
  const Icon = category.icon;

  return (
    <Link
      href={category.href}
      className="min-h-[176px] rounded-xl border border-[#d9e2e7] bg-white p-5 shadow-sm transition-colors hover:border-[#159a9d] hover:bg-[#fbfdfd]"
    >
      <div className="grid grid-cols-[62px_minmax(0,1fr)] gap-4">
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
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_52px] items-end gap-4">
        <div>
          <p
            className="text-2xl font-black leading-none"
            style={{ color: category.colour }}
          >
            {category.count}
          </p>
          <p className="mt-1 text-xs font-semibold text-[#314956]">questions</p>
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#e7edf0] text-xs font-black"
          style={{ color: category.colour }}
        >
          {category.percent}%
        </div>
      </div>

      <div className="mt-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-[#e3eaee]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${category.percent}%`,
              backgroundColor: category.colour,
            }}
          />
        </div>
        <p className="mt-2 text-xs font-medium text-[#314956]">
          {category.done}
        </p>
      </div>
    </Link>
  );
}

export function InterviewQuestionBankDashboard() {
  return (
    <main className="phloem-dashboard-compact min-h-screen bg-[#f5f8fa] text-[#071923]">
      <div className="grid min-h-screen lg:grid-cols-[250px_1fr]">
        <Sidebar />

        <section className="min-w-0">
          <header className="flex h-16 items-center justify-end border-b border-[#dfe7ec] bg-white px-6">
            <div className="flex items-center gap-5">
              <Bell className="h-5 w-5 text-[#071923]" aria-hidden="true" />
              <div className="flex items-center gap-3">
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
              </div>
            </div>
          </header>

          <div className="px-5 py-8 sm:px-7 lg:px-10">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-[#071923]">
                  Question Bank
                </h1>
                <p className="mt-2 text-sm font-medium text-[#4a6370]">
                  Explore 1000+ interview questions across 8 categories.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="flex h-12 min-w-0 items-center gap-3 rounded-lg border border-[#d4dee6] bg-white px-4 shadow-sm sm:w-[380px]">
                  <Search className="h-5 w-5 shrink-0 text-[#4a6370]" aria-hidden="true" />
                  <input
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#071923] outline-none placeholder:text-[#8091a0]"
                    placeholder="Search questions, topics or keywords..."
                  />
                </label>
                <Link
                  href="/phloemai/interviews/stations/ethics-confidentiality"
                  className="flex h-12 items-center justify-center gap-3 rounded-lg border border-[#159a9d] bg-white px-5 text-sm font-black text-[#08787b] shadow-sm transition-colors hover:bg-[#edf7f6]"
                >
                  <Shuffle className="h-5 w-5" aria-hidden="true" />
                  Random Question
                </Link>
              </div>
            </div>

            <section className="mt-7 rounded-xl border border-[#d9e2e7] bg-white p-6 shadow-sm">
              <div className="grid gap-6 xl:grid-cols-[120px_minmax(260px,1fr)_1px_1.7fr] xl:items-center">
                <ProgressRing percent={26} colour="#159a9d" />
                <div>
                  <h2 className="text-base font-black text-[#071923]">
                    Overall Progress
                  </h2>
                  <p className="mt-2 text-sm font-medium text-[#314956]">
                    312 / 1210 completed
                  </p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e3eaee]">
                    <div className="h-full w-[26%] rounded-full bg-[#159a9d]" />
                  </div>
                  <p className="mt-3 text-xs font-medium text-[#314956]">
                    898 questions remaining
                  </p>
                </div>
                <div className="hidden h-24 w-px bg-[#d9e2e7] xl:block" />
                <div className="grid gap-4 sm:grid-cols-4">
                  {[
                    { label: "Categories", value: "8", icon: Grid3X3 },
                    { label: "Total Questions", value: "1210+", icon: FileText },
                    { label: "Completed", value: "312", icon: CheckCircle2 },
                    { label: "Remaining", value: "898", icon: Clock },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-center gap-3">
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

            <section className="mt-5 grid gap-4 xl:grid-cols-4">
              {categories.map((category) => (
                <CategoryCard key={category.title} category={category} />
              ))}
            </section>

            <section className="mt-5 rounded-xl border border-[#cfe0df] bg-[#f3fbfb] p-5 shadow-sm">
              <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr_1fr_1.2fr] xl:divide-x xl:divide-[#d5e4e4]">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0d7774] text-white">
                    <BookOpen className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-3xl font-black leading-none text-[#071923]">
                      1000+
                    </p>
                    <p className="mt-2 text-sm font-medium text-[#08787b]">
                      questions across 8 categories
                    </p>
                  </div>
                </div>

                {summaryItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex items-center gap-4 xl:px-7"
                    >
                      <Icon className={`h-8 w-8 shrink-0 ${item.colour}`} aria-hidden="true" />
                      <div>
                        <p className="text-sm font-black text-[#071923]">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs font-medium leading-5 text-[#314956]">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
