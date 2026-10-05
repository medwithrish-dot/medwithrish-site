"use client";

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createClient as createSupabaseClient,
  hasSupabaseConfig,
} from "@/utils/supabase/client";
import { ClientPremiumGate } from "./ClientPremiumGate";
import { ExpandableAiFeedback } from "./ExpandableAiFeedback";
import { MedicForestLandingShell } from "./MedicForestLandingShell";
import { MedicForestLogo as MedicForestBrandLogo } from "../../_components/MedicForestLogo";
import {
  type DashboardDiagnostic,
  type DashboardDiagnosticIssue,
  type DashboardDiagnosticTask,
  type DiagnosticAttemptRow,
  type ReportIssueDefinition,
  type ReportSectionFilter,
  type StudyPlanDisplayTask,
  AI_DIAGNOSTIC_CREDIT_INTERVAL_MS,
  FREE_QR_DIAGNOSTIC_SOURCE,
  FULL_MOCK_REPORT_SECTION_ORDER,
  FULL_MOCK_SECTION_SOURCE,
  buildReportIssueCard,
  formatDiagnosticReportDate,
  formatDigitalCountdown,
  getActiveDiagnosticReportStudyPlanTasks,
  getActiveDiagnosticStudyPlanTasks,
  getCombinedDiagnosticAccuracy,
  getCombinedDiagnosticAvgSeconds,
  getDiagnosticReportStudyPlanTasks,
  getDiagnosticStudyPlanTasks,
  getFullMockReportDiagnostics,
  getReportIssueDefinitionForLabel,
  getStudyPlanHref,
  getStudyPlanIcon,
  isActionableStudyFix,
  isFreeQrDiagnostic,
  isFullMockSectionDiagnostic,
  normaliseDashboardDiagnostic,
  normaliseIssueText,
  reportIssueDefinitions,
} from "../_lib/ucatDiagnostics";
import { UCATDiagnosticContent } from "./UCATDiagnosticContent";
import { UCATReportContent } from "./UCATReportContent";
import { ReportIssueSignalCard } from "./ReportIssueSignalCard";
import {
  AiDiagnosticCreditDetails,
  AiDiagnosticCreditSummary,
} from "./AiDiagnosticCredit";
import { getTrainerElapsedSeconds } from "../_lib/ucatTrainerClock";

export * from "../_lib/ucatDiagnostics";
export { UCATDiagnosticContent } from "./UCATDiagnosticContent";
export { UCATReportContent } from "./UCATReportContent";
export { ReportIssueSignalCard } from "./ReportIssueSignalCard";
import {
  UCAT_QUESTION_BANK,
  getUCATSubtypeMeta,
  type UCATQuestion,
  type UCATSection,
} from "../_lib/ucatQuestionBank";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Bookmark,
  BookOpen,
  Brain,
  Calculator,
  Check,
  CheckCircle,
  ChevronDown,
  ClipboardList,
  Clock3,
  Eye,
  Flag,
  Goal,
  Home,
  Info,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Trash2,
  UserRound,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────


type MedicForestProfile = {
  full_name: string | null;
  current_plan: string | null;
  diagnostic_credits?: number | null;
  ai_diagnostic_last_used_at?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_status?: string | null;
};

type AuthMode = "signup" | "login";
type DashboardView =
  | "dashboard"
  | "diagnostic"
  | "mock-diagnostic"
  | "practice"
  | "progress"
  | "skills-trainers"
  | "report"
  | "account";

type PremiumGateProps = {
  isPremium: boolean;
  checkoutLoading: boolean;
  onUpgrade: () => void | Promise<void>;
};
type ProgressSetFilter = "All" | "Incomplete" | "Completed";
type DashboardProgressSnapshotView = "accuracy" | "progress";
type UCATSectionCode = "VR" | "DM" | "QR" | "SJT";
type PracticeAttemptRow = {
  question_id: string | null;
  section: string | null;
  answered: boolean | null;
  correct: boolean | null;
  total_seconds: number | null;
  created_at: string | null;
  metadata?: unknown;
};
type PracticeSessionListRow = {
  id: string | null;
  section: string | null;
  source: string | null;
  total_questions: number | null;
  answered_questions: number | null;
  correct_questions: number | null;
  accuracy: number | string | null;
  summary: unknown;
  completed_at: string | null;
  created_at: string | null;
};
type PracticeStats = {
  sectionCompleted: Record<UCATSectionCode, number>;
  sectionAnswered: Record<UCATSectionCode, number>;
  sectionCorrect: Record<UCATSectionCode, number>;
  totalCompleted: number;
  totalAvailable: number;
  accuracy: number;
  avgSeconds: number;
  hasCompletedQuestions: boolean;
  questionCalendarDays: Array<{ day: number; questions: number }>;
  monthLabel: string;
};
type RecentPracticeSet = {
  id: string;
  sectionCode: UCATSectionCode;
  sectionSlug: string;
  title: string;
  completedAt: string | null;
  answeredQuestions: number;
  totalQuestions: number;
  correctQuestions: number;
  accuracy: number;
  isIncomplete: boolean;
  href: string;
};

const dashboardPageMeta: Record<
  DashboardView,
  { title: string; subtitle: string }
> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Let's keep your UCAT prep on track.",
  },
  diagnostic: {
    title: "Diagnostic Hub",
    subtitle:
      "Diagnostics identify what's holding your UCAT score back so you can focus with confidence.",
  },
  "mock-diagnostic": {
    title: "Mock Diagnostic",
    subtitle: "Choose the mock format you want to run today.",
  },
  practice: {
    title: "Practice",
    subtitle: "Target the tasks from your personalised study plan.",
  },
  progress: {
    title: "Progress",
    subtitle: "See whether your study plan is actually working.",
  },
  "skills-trainers": {
    title: "Skills Trainers",
    subtitle: "Build the calculator speed and flagging judgement that protect marks under time.",
  },
  report: {
    title: "Report",
    subtitle: "Expanded breakdown from your latest diagnostic.",
  },
  account: {
    title: "Account",
    subtitle: "Manage your profile, plan and subscription.",
  },
};

const dashboardNavItems = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/medicforest/ucat/dashboard",
    view: "dashboard",
  },
  {
    label: "Diagnostic",
    icon: Activity,
    href: "/medicforest/ucat/diagnostic",
    view: "diagnostic",
  },
  {
    label: "Practice",
    icon: Target,
    href: "/medicforest/ucat/practice",
    view: "practice",
  },
  {
    label: "Progress",
    icon: BarChart3,
    href: "/medicforest/ucat/progress",
    view: "progress",
  },
  {
    label: "Report",
    icon: Bookmark,
    href: "/medicforest/ucat/report",
    view: "report",
  },
] as const;

const medicforestAreaSwitchItems = [
  {
    label: "UCAT",
    eyebrow: "Current workspace",
    href: "/medicforest/ucat/dashboard",
    icon: Brain,
    current: true,
  },
  {
    label: "Med Interviews",
    eyebrow: "MMI and panel dashboard",
    href: "/interviews/dashboard",
    icon: MessageSquare,
    current: false,
  },
] as const;

function MedicForestAreaSwitcher({
  open,
  onOpen,
  onToggle,
  onClose,
  menuId,
  className = "",
}: {
  open: boolean;
  onOpen: () => void;
  onToggle: () => void;
  onClose: () => void;
  menuId: string;
  className?: string;
}) {
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (!closeTimerRef.current) return;
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const handleOpen = () => {
    clearCloseTimer();
    onOpen();
  };

  const handleCloseSoon = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      onClose();
      closeTimerRef.current = null;
    }, 180);
  };

  useEffect(() => clearCloseTimer, []);

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={handleOpen}
      onMouseLeave={handleCloseSoon}
    >
      <button
        type="button"
        onClick={() => {
          if (open) {
            handleOpen();
            return;
          }

          onToggle();
        }}
        onFocus={handleOpen}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
        aria-label="Switch MedWithRish area"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        title="Switch area"
        className="group flex w-full cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-[#0b3431] px-2 py-2 text-left shadow-sm transition-colors hover:border-teal-300/40 hover:bg-[#123f3b] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
      >
        <MedicForestBrandLogo className="h-8.5 w-[122px]" onDark />
        <span className="min-w-0 flex-1">
          <span className="mt-0.5 block truncate text-xs font-semibold text-slate-300">
            UCAT Tutor
          </span>
        </span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0f4a45] text-[#86e6e1] ring-1 ring-white/10 transition-colors group-hover:bg-[#1aa0a5] group-hover:text-white">
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </span>
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute left-0 z-30 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
        >
          {medicforestAreaSwitchItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                role="menuitem"
                aria-current={item.current ? "page" : undefined}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                  item.current
                    ? "bg-[#edf7f6] text-[#08787b]"
                    : "text-slate-700 hover:bg-[#f4f8f8] hover:text-[#08787b]"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    item.current ? "bg-white text-[#08787b]" : "bg-[#edf7f6] text-[#4a6370]"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block truncate text-xs font-bold text-slate-500">
                    {item.eyebrow}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

const sectionScores = [
  {
    code: "VR",
    score: 0,
    badgeClass: "bg-indigo-600 text-white",
    barClass: "bg-indigo-600",
  },
  {
    code: "DM",
    score: 0,
    badgeClass: "bg-blue-600 text-white",
    barClass: "bg-blue-600",
  },
  {
    code: "QR",
    score: 0,
    badgeClass: "bg-cyan-500 text-white",
    barClass: "bg-cyan-500",
  },
  {
    code: "SJT",
    score: 0,
    badgeClass: "bg-pink-500 text-white",
    barClass: "bg-pink-500",
  },
];

function createQuestionBankProgress() {
  return [
    {
      code: "VR",
      section: "vr",
      title: "MedicForest Verbal Reasoning",
      completed: 0,
      total: UCAT_QUESTION_BANK.vr.length,
      focus: "No questions completed yet",
      href: "/medicforest/ucat/question-bank/vr",
    },
    {
      code: "DM",
      section: "dm",
      title: "MedicForest Decision Making",
      completed: 0,
      total: UCAT_QUESTION_BANK.dm.length,
      focus: "No questions completed yet",
      href: "/medicforest/ucat/question-bank/dm",
    },
    {
      code: "QR",
      section: "qr",
      title: "MedicForest Quantitative Reasoning",
      completed: 0,
      total: UCAT_QUESTION_BANK.qr.length,
      focus: "No questions completed yet",
      href: "/medicforest/ucat/question-bank/qr",
    },
    {
      code: "SJT",
      section: "sjt",
      title: "MedicForest Situational Judgement",
      completed: 0,
      total: UCAT_QUESTION_BANK.sjt.length,
      focus: "No questions completed yet",
      href: "/medicforest/ucat/question-bank/sjt",
    },
  ] as const;
}

let questionBankProgressCache: ReturnType<typeof createQuestionBankProgress> | null = null;
function getQuestionBankProgressBase() {
  return (questionBankProgressCache ??= createQuestionBankProgress());
}

const dailyQuestionTarget = 200;
const sectionCodes: UCATSectionCode[] = ["VR", "DM", "QR", "SJT"];
let questionBankQuestionIdsCache: Record<UCATSectionCode, Set<string>> | null = null;
function getQuestionBankQuestionIds() {
  return (questionBankQuestionIdsCache ??= {
    VR: new Set(UCAT_QUESTION_BANK.vr.map((question) => question.id)),
    DM: new Set(UCAT_QUESTION_BANK.dm.map((question) => question.id)),
    QR: new Set(UCAT_QUESTION_BANK.qr.map((question) => question.id)),
    SJT: new Set(UCAT_QUESTION_BANK.sjt.map((question) => question.id)),
  });
}

function emptySectionCounts(): Record<UCATSectionCode, number> {
  return { VR: 0, DM: 0, QR: 0, SJT: 0 };
}

function getSectionTotal(code: UCATSectionCode) {
  return getQuestionBankProgressBase().find((item) => item.code === code)?.total ?? 0;
}

function getMonthShell() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return {
    year,
    month,
    monthLabel: now.toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    }),
    days: Array.from({ length: daysInMonth }, (_, index) => ({
      day: index + 1,
      questions: 0,
    })),
  };
}

function createEmptyPracticeStats(): PracticeStats {
  const monthShell = getMonthShell();
  return {
    sectionCompleted: emptySectionCounts(),
    sectionAnswered: emptySectionCounts(),
    sectionCorrect: emptySectionCounts(),
    totalCompleted: 0,
    totalAvailable: getQuestionBankProgressBase().reduce((sum, item) => sum + item.total, 0),
    accuracy: 0,
    avgSeconds: 0,
    hasCompletedQuestions: false,
    questionCalendarDays: monthShell.days,
    monthLabel: monthShell.monthLabel,
  };
}

function normaliseSectionCode(section: string | null): UCATSectionCode | null {
  const code = section?.toUpperCase();
  return sectionCodes.includes(code as UCATSectionCode)
    ? (code as UCATSectionCode)
    : null;
}

function isCompletedDiagnosticPracticeAttempt(row: PracticeAttemptRow) {
  const metadata =
    row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
      ? (row.metadata as Record<string, unknown>)
      : {};

  return metadata.completedInDiagnostic === true;
}

function getQuestionBankProgressItem(code: UCATSectionCode) {
  return getQuestionBankProgressBase().find((item) => item.code === code);
}

function getNumberValue(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }

  return fallback;
}

function getSummaryRecord(summary: unknown) {
  return summary && typeof summary === "object" && !Array.isArray(summary)
    ? (summary as Record<string, unknown>)
    : {};
}

function normaliseRecentPracticeSet(
  row: PracticeSessionListRow
): RecentPracticeSet | null {
  if (!row.id) return null;

  const summary = getSummaryRecord(row.summary);
  const section = normaliseSectionCode(
    typeof summary.section === "string" ? summary.section : row.section
  );

  if (!section) return null;

  const progressItem = getQuestionBankProgressItem(section);
  const totalQuestions = getNumberValue(
    summary.totalQuestions,
    row.total_questions ?? 0
  );
  const answeredQuestions = getNumberValue(
    summary.answeredQuestions,
    row.answered_questions ?? 0
  );
  const correctQuestions = getNumberValue(
    summary.correctQuestions,
    row.correct_questions ?? 0
  );
  const accuracy = Math.round(
    getNumberValue(summary.accuracy, getNumberValue(row.accuracy))
  );
  const completedAt =
    (typeof summary.completedAt === "string" ? summary.completedAt : null) ??
    row.completed_at ??
    row.created_at;
  const sectionSlug = section.toLowerCase();
  const finished = summary.finished !== false;

  return {
    id: row.id,
    sectionCode: section,
    sectionSlug,
    title:
      typeof summary.sectionTitle === "string"
        ? summary.sectionTitle
        : progressItem?.title ?? `${section} practice set`,
    completedAt,
    answeredQuestions,
    totalQuestions,
    correctQuestions,
    accuracy,
    isIncomplete:
      !finished || (totalQuestions > 0 && answeredQuestions < totalQuestions),
    href: `/medicforest/ucat/question-bank/${sectionSlug}?set=${encodeURIComponent(
      row.id
    )}`,
  };
}

function buildPracticeStats(rows: PracticeAttemptRow[]): PracticeStats {
  const monthShell = getMonthShell();
  const uniqueCompletedBySection: Record<UCATSectionCode, Set<string>> = {
    VR: new Set(),
    DM: new Set(),
    QR: new Set(),
    SJT: new Set(),
  };
  const sectionAnswered = emptySectionCounts();
  const sectionCorrect = emptySectionCounts();
  let answeredAttempts = 0;
  let correctAttempts = 0;
  let totalSeconds = 0;

  rows.forEach((row) => {
    const section = normaliseSectionCode(row.section);
    if (!section) return;

    const questionId = row.question_id;
    if (!questionId || !getQuestionBankQuestionIds()[section].has(questionId)) return;

    if (row.answered || isCompletedDiagnosticPracticeAttempt(row)) {
      uniqueCompletedBySection[section].add(questionId);
    }

    if (row.answered) {
      answeredAttempts += 1;
      sectionAnswered[section] += 1;
      if (row.correct) correctAttempts += 1;
      if (row.correct) sectionCorrect[section] += 1;
      totalSeconds += Math.max(0, row.total_seconds ?? 0);

      if (row.created_at) {
        const completedAt = new Date(row.created_at);
        if (
          completedAt.getFullYear() === monthShell.year &&
          completedAt.getMonth() === monthShell.month
        ) {
          const dayIndex = completedAt.getDate() - 1;
          if (monthShell.days[dayIndex]) {
            monthShell.days[dayIndex].questions += 1;
          }
        }
      }
    }
  });

  const sectionCompleted = emptySectionCounts();
  sectionCodes.forEach((code) => {
    sectionCompleted[code] = Math.min(
      getSectionTotal(code),
      uniqueCompletedBySection[code].size
    );
  });

  const totalCompleted = sectionCodes.reduce(
    (sum, code) => sum + sectionCompleted[code],
    0
  );
  const totalAvailable = getQuestionBankProgressBase().reduce(
    (sum, item) => sum + item.total,
    0
  );

  return {
    sectionCompleted,
    sectionAnswered,
    sectionCorrect,
    totalCompleted,
    totalAvailable,
    accuracy:
      answeredAttempts > 0 ? Math.round((correctAttempts / answeredAttempts) * 100) : 0,
    avgSeconds:
      answeredAttempts > 0 ? Math.round(totalSeconds / answeredAttempts) : 0,
    hasCompletedQuestions: totalCompleted > 0,
    questionCalendarDays: monthShell.days,
    monthLabel: monthShell.monthLabel,
  };
}

function getQuestionBankProgress(stats: PracticeStats) {
  return getQuestionBankProgressBase().map((item) => {
    const code = item.code as UCATSectionCode;
    const completed = stats.sectionCompleted[code];
    return {
      ...item,
      completed,
      focus:
        completed > 0
          ? `${completed} of ${item.total} questions completed`
          : item.focus,
    };
  });
}

function getSectionScores(stats: PracticeStats) {
  return sectionScores.map((section) => {
    const code = section.code as UCATSectionCode;
    const total = getSectionTotal(code);
    return {
      ...section,
      score: total > 0 ? Math.round((stats.sectionCompleted[code] / total) * 100) : 0,
      helper: `${stats.sectionCompleted[code]}/${total} done`,
    };
  });
}

function getSectionAccuracyScores(stats: PracticeStats) {
  return sectionScores.map((section) => {
    const code = section.code as UCATSectionCode;
    const answered = stats.sectionAnswered[code];
    const correct = stats.sectionCorrect[code];
    return {
      ...section,
      score: answered > 0 ? Math.round((correct / answered) * 100) : 0,
      helper: answered > 0 ? `${correct}/${answered} correct` : "No answers yet",
    };
  });
}

const approachSteps = [
  {
    title: "Diagnose",
    text: "Find the habits costing you marks",
    icon: Activity,
    iconClass: "bg-violet-100 text-indigo-600",
  },
  {
    title: "AI Feedback",
    text: "Understand why they happen",
    icon: MessageSquare,
    iconClass: "bg-blue-100 text-blue-600",
  },
  {
    title: "Study Plan",
    text: "Get personalised tasks to improve",
    icon: Wrench,
    iconClass: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Practice",
    text: "Complete tasks and build new habits",
    icon: Target,
    iconClass: "bg-indigo-100 text-indigo-600",
  },
  {
    title: "Progress",
    text: "Track improvement and keep refining",
    icon: BarChart3,
    iconClass: "bg-blue-100 text-blue-600",
  },
];


function getDisplayName(user: User | null, profile: MedicForestProfile | null) {
  const profileName = profile?.full_name?.trim();
  const metadataName =
    typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";
  const fallback = user?.email?.split("@")[0] ?? "Rish";
  return profileName || metadataName || fallback;
}

function getFirstName(user: User | null, profile: MedicForestProfile | null) {
  return getDisplayName(user, profile).split(" ")[0];
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}


function sectionStyle(code: string) {
  return (
    sectionScores.find((section) => section.code === code) ?? {
      code,
      score: 0,
      badgeClass: "bg-slate-100 text-slate-600",
      barClass: "bg-slate-400",
    }
  );
}

function DailyQuestionsChart({ practiceStats }: { practiceStats: PracticeStats }) {
  const recentDays = practiceStats.questionCalendarDays.slice(-7);
  const average = Math.round(
    recentDays.length > 0
      ? recentDays.reduce((sum, item) => sum + item.questions, 0) /
          recentDays.length
      : 0
  );
  const daysOnTarget = recentDays.filter(
    (item) => item.questions >= dailyQuestionTarget
  ).length;
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const blanks = Array.from({ length: startOffset }, (_, index) => index);
  const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const getHeatClass = (questions: number) => {
    if (questions <= 0) return "bg-slate-100 text-slate-400 border-slate-100";
    if (questions < 100) return "bg-emerald-100 text-emerald-700 border-emerald-100";
    if (questions < 160) return "bg-emerald-200 text-emerald-800 border-emerald-200";
    if (questions < dailyQuestionTarget)
      return "bg-emerald-400 text-white border-emerald-400";
    if (questions < 240) return "bg-emerald-600 text-white border-emerald-600";
    return "bg-emerald-800 text-white border-emerald-800";
  };

  return (
    <section className="self-start rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black uppercase tracking-wide">
              Questions done
            </h2>
            <Info className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </div>
          <p className="mt-1 text-xs font-bold text-slate-500">
            {practiceStats.monthLabel}
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
          {dailyQuestionTarget}/day target
        </span>
      </div>
      <div className="mt-4 grid gap-5 md:grid-cols-[340px_116px] md:items-start">
        <div className="max-w-[340px]">
          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-black text-slate-500">
            {weekdays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1.5">
            {blanks.map((blank) => (
              <div key={blank} className="aspect-square" />
            ))}
            {practiceStats.questionCalendarDays.map((item) => (
              <div key={item.day} className="group relative">
                <div
                  title={`${item.questions}/${dailyQuestionTarget} questions`}
                  aria-label={`May ${item.day}: ${item.questions} of ${dailyQuestionTarget} questions`}
                  className={`flex aspect-square min-h-8 items-center justify-center rounded-lg border text-xs font-black transition-transform hover:-translate-y-0.5 ${getHeatClass(
                    item.questions
                  )}`}
                >
                  {item.day}
                </div>
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-[11px] font-black text-white shadow-lg group-hover:block">
                  {item.questions}/{dailyQuestionTarget} questions
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 md:block md:space-y-3">
          <div>
            <p className="text-xs font-bold text-slate-400">7-day average</p>
            <p className="mt-1 text-xl font-black text-[#0b1143]">
              {average}/day
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">On target</p>
            <p className="mt-1 text-xl font-black text-emerald-700">
              {daysOnTarget}/7
            </p>
          </div>
          <div className="col-span-2 flex items-center gap-1.5 md:pt-1">
            {[0, 80, 130, 180, 220].map((questions) => (
              <span
                key={questions}
                className={`h-3 w-5 rounded ${getHeatClass(questions)
                  .split(" ")
                  .slice(0, 1)
                  .join(" ")}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ApproachBand({
  title,
  steps = approachSteps,
}: {
  title: string;
  steps?: typeof approachSteps;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-black uppercase tracking-wide">{title}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-5">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="relative flex gap-3 md:block">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${step.iconClass}`}
              >
                <Icon className="h-7 w-7" aria-hidden="true" />
              </div>
              <div className="md:mt-2">
                <h3 className="text-sm font-black text-blue-600">
                  {step.title}
                </h3>
                <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                  {step.text}
                </p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight
                  className="absolute right-3 top-5 hidden h-5 w-5 text-slate-400 md:block"
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RecentPracticeSetsPanel({
  sets,
  emptyTitle = "No practice sets saved yet.",
  emptyText = "Mark a question-bank set to add the first row.",
  onRemoveSet,
  onRemoveAllSets,
  removingSetId = null,
  removingAllSets = false,
  removeError = null,
}: {
  sets: RecentPracticeSet[];
  emptyTitle?: string;
  emptyText?: string;
  onRemoveSet?: (set: RecentPracticeSet) => void | Promise<void>;
  onRemoveAllSets?: (sets: RecentPracticeSet[]) => void | Promise<void>;
  removingSetId?: string | null;
  removingAllSets?: boolean;
  removeError?: string | null;
}) {
  const visibleBatchSize = 4;
  const [visibleCount, setVisibleCount] = useState(visibleBatchSize);
  const [removeModeEnabled, setRemoveModeEnabled] = useState(false);
  const orderedSets = [
    ...sets.filter((set) => set.isIncomplete),
    ...sets.filter((set) => !set.isIncomplete),
  ];
  const visibleSets = orderedSets.slice(0, visibleCount);
  const incompleteSets = visibleSets.filter((set) => set.isIncomplete);
  const completedSets = visibleSets.filter((set) => !set.isIncomplete);
  const remainingCount = Math.max(0, orderedSets.length - visibleSets.length);
  const canRemoveSets = Boolean(onRemoveSet);

  if (sets.length === 0) {
    return (
      <Link
        href="/medicforest/ucat/question-bank"
        className="block rounded-xl border border-slate-100 bg-slate-50 px-4 py-8 text-center transition-colors hover:border-blue-200 hover:bg-blue-50/70"
      >
        <p className="text-sm font-black text-slate-700">{emptyTitle}</p>
        <p className="mt-2 text-xs font-semibold text-slate-500">{emptyText}</p>
        <span className="mt-4 inline-flex items-center justify-center gap-2 text-xs font-black text-blue-600">
          Open question bank
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </Link>
    );
  }

  const renderSet = (set: RecentPracticeSet) => {
    const style = sectionStyle(set.sectionCode);
    const isRemoving = removingSetId === set.id;
    const answeredLabel = set.isIncomplete
      ? "In progress"
      : `${set.answeredQuestions}/${set.totalQuestions} answered`;
    const scoreLabel = set.isIncomplete
      ? `${set.answeredQuestions}/${set.totalQuestions} question${
          set.totalQuestions === 1 ? "" : "s"
        } complete`
      : set.answeredQuestions > 0
        ? `${set.correctQuestions}/${set.answeredQuestions} correct - ${set.accuracy}%`
        : "No answers yet";

    return (
      <div
        key={set.id}
        className="grid gap-3 border-t border-slate-100 px-3 py-3 transition-colors first:border-t-0 hover:bg-blue-50/70 sm:grid-cols-[minmax(0,1fr)_210px] sm:items-center"
      >
        <Link
          href={set.href}
          className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_120px] sm:items-center"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`rounded-lg px-3 py-2 text-xs font-black ${style.badgeClass}`}
            >
              {set.sectionCode}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-black">{set.title}</p>
              <p className="mt-1 text-xs font-bold text-slate-500">
                {answeredLabel}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-black">{scoreLabel}</p>
            <p className="text-xs font-bold text-slate-400">
              {formatDiagnosticReportDate(set.completedAt)}
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={set.href}
            className="inline-flex h-9 flex-1 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-black text-blue-600"
          >
            {set.isIncomplete ? "Continue" : "Review"}
          </Link>
          {onRemoveSet && removeModeEnabled && (
            <button
              type="button"
              title="Remove saved set"
              aria-label={`Remove saved ${set.title} set`}
              disabled={isRemoving || removingAllSets}
              onClick={() => void onRemoveSet(set)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-100 bg-white text-red-600 transition-colors hover:border-red-200 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
      {canRemoveSets && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-3 py-2">
          <button
            type="button"
            aria-pressed={removeModeEnabled}
            onClick={() => setRemoveModeEnabled((current) => !current)}
            className="inline-flex h-7 items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 text-[11px] font-black text-slate-500 transition-colors hover:border-red-200 hover:text-red-600"
          >
            <span
              className={`flex h-3.5 w-6 items-center rounded-full p-0.5 transition-colors ${
                removeModeEnabled ? "bg-red-500" : "bg-slate-200"
              }`}
              aria-hidden="true"
            >
              <span
                className={`h-2.5 w-2.5 rounded-full bg-white transition-transform ${
                  removeModeEnabled ? "translate-x-2.5" : ""
                }`}
              />
            </span>
            Remove
          </button>
          {removeModeEnabled && onRemoveAllSets && orderedSets.length > 0 && (
            <button
              type="button"
              disabled={removingAllSets}
              onClick={() => void onRemoveAllSets(orderedSets)}
              className="inline-flex h-7 items-center justify-center rounded-full border border-red-100 bg-white px-3 text-[11px] font-black text-red-600 transition-colors hover:border-red-200 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
            >
              Remove all
            </button>
          )}
        </div>
      )}
      {incompleteSets.length > 0 && (
        <div>
          <div className="bg-amber-50 px-3 py-2 text-xs font-black uppercase tracking-wide text-amber-700">
            Incomplete sets
          </div>
          {incompleteSets.map(renderSet)}
        </div>
      )}
      {completedSets.length > 0 && (
        <div>
          <div className="bg-slate-50 px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-500">
            Completed sets
          </div>
          {completedSets.map(renderSet)}
        </div>
      )}
      {remainingCount > 0 && (
        <div className="border-t border-slate-100 bg-slate-50 px-3 py-3 text-center">
          <button
            type="button"
            onClick={() =>
              setVisibleCount((current) =>
                Math.min(current + visibleBatchSize, orderedSets.length)
              )
            }
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-black text-blue-600 transition-colors hover:border-blue-200 hover:bg-blue-50"
          >
            Click for more ({remainingCount} left)
          </button>
        </div>
      )}
      {removeError && (
        <div className="border-t border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
          {removeError}
        </div>
      )}
    </div>
  );
}

function PracticeContent({
  latestDiagnostic,
  completedDashboardTaskIds,
  removedDashboardTaskIds,
  recentPracticeSets,
  isPremium,
  checkoutLoading,
  onUpgrade,
  onRemoveSet,
  onRemoveAllSets,
  removingPracticeSetId,
  removingAllPracticeSets,
  practiceSetRemoveError,
}: {
  latestDiagnostic: DashboardDiagnostic | null;
  completedDashboardTaskIds: Set<string>;
  removedDashboardTaskIds: Set<string>;
  recentPracticeSets: RecentPracticeSet[];
  isPremium: boolean;
  checkoutLoading: boolean;
  onUpgrade: () => void;
  onRemoveSet?: (set: RecentPracticeSet) => void | Promise<void>;
  onRemoveAllSets?: (sets: RecentPracticeSet[]) => void | Promise<void>;
  removingPracticeSetId?: string | null;
  removingAllPracticeSets?: boolean;
  practiceSetRemoveError?: string | null;
}) {
  const allStudyPlanTasks = getDiagnosticStudyPlanTasks(latestDiagnostic);
  const studyPlanTasks = getActiveDiagnosticStudyPlanTasks(
    latestDiagnostic,
    completedDashboardTaskIds,
    removedDashboardTaskIds
  );
  const recommendedTask = studyPlanTasks[0];
  const completedCurrentPlan = allStudyPlanTasks.length > 0 && !recommendedTask;
  const mockAndSkillCards = [
    {
      title: "Diagnostic mock",
      text: "Run a complete UCAT-style diagnostic from random uncompleted bank questions.",
      icon: Timer,
      iconClass: "bg-blue-100 text-blue-600",
      href: "/medicforest/ucat/mocks/full",
      cta: "Start mock",
    },
    {
      title: "Question bank",
      text: "Practise targeted section sets and keep completed questions moving.",
      icon: BarChart3,
      iconClass: "bg-violet-100 text-violet-600",
      href: "/medicforest/ucat/question-bank",
      cta: "Start set",
    },
    {
      title: "Review sets",
      text: "Revisit marked practice and diagnostic questions with feedback.",
      icon: AlertTriangle,
      iconClass: "bg-red-100 text-red-500",
      href: "/medicforest/ucat/question-bank",
      cta: "Review",
    },
    {
      title: "Calculator speed trainer",
      text: "Rapid QR-style calculator drills for typing speed, memory buttons and fewer clears.",
      icon: Calculator,
      iconClass: "bg-cyan-100 text-cyan-600",
      href: "/medicforest/ucat/skills-trainers#calculator",
      cta: "Train speed",
    },
    {
      title: "Flagging trainer",
      text: "Practise deciding which questions deserve a flag before they drain time.",
      icon: Flag,
      iconClass: "bg-rose-100 text-rose-600",
      href: "/medicforest/ucat/skills-trainers#flagging",
      cta: "Train flags",
    },
  ] as const;

  const practiceSections = [
    {
      code: "VR",
      title: "Verbal Reasoning",
      text: "Passage-based inference and comprehension.",
      href: "/medicforest/ucat/question-bank/vr",
      className: "bg-indigo-600 text-white",
    },
    {
      code: "DM",
      title: "Decision Making",
      text: "Logic, probability and argument evaluation.",
      href: "/medicforest/ucat/question-bank/dm",
      className: "bg-blue-600 text-white",
    },
    {
      code: "QR",
      title: "Quantitative Reasoning",
      text: "Short numerical problems and data interpretation.",
      href: "/medicforest/ucat/question-bank/qr",
      className: "bg-cyan-500 text-white",
    },
    {
      code: "SJT",
      title: "Situational Judgement",
      text: "Professional judgement and appropriate actions.",
      href: "/medicforest/ucat/question-bank/sjt",
      className: "bg-pink-500 text-white",
    },
  ];

  const emptySkillQueueHref = completedCurrentPlan
    ? "/medicforest/ucat/diagnostic/mock-options"
    : "/medicforest/ucat/question-bank";
  const emptySkillQueueLabel = completedCurrentPlan
    ? "Run another diagnostic"
    : "Start practice";

  return (
    <div className="space-y-5 px-6 py-5 lg:px-8">
      <ClientPremiumGate
        isPremium={isPremium}
        checkoutLoading={checkoutLoading}
        onUpgrade={onUpgrade}
        title="Unlock your personalised study plan"
        description="Premium turns diagnostic issues into exact drills, review rules and recommended next tasks."
        featureLabel="Premium study plan"
      >
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <Zap className="h-8 w-8" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wide">
                  Recommended from your study plan
                </h2>
                <h3 className="mt-6 text-lg font-black">
                  {recommendedTask?.title ??
                    (completedCurrentPlan
                      ? "Current study plan cleared"
                      : "No recommended task yet")}
                </h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                  {recommendedTask?.fix ??
                    (completedCurrentPlan
                      ? "Every task from your latest diagnostic has been ticked off."
                      : "Complete and mark practice questions to build a real task queue.")}
                </p>
              </div>
            </div>
            <Link
              href={recommendedTask?.href ?? "/medicforest/ucat/question-bank"}
              className="inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-8 text-sm font-black text-white transition-colors hover:bg-blue-700"
            >
              {recommendedTask ? "Start task" : "Start practice"}
            </Link>
          </div>
        </section>
      </ClientPremiumGate>

      <section className="relative overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/60 via-white to-slate-50 p-5 shadow-[0_14px_32px_rgba(37,99,235,0.08)] ring-1 ring-blue-50">
        <div
          className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500 via-cyan-400 to-indigo-500"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide">
              Start a section
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Four clean entry points for the current UCAT sections.
            </p>
          </div>
          <Link
            href="/medicforest/ucat/question-bank"
            className="inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700"
          >
            Open question bank
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {practiceSections.map((section) => (
            <Link
              key={section.code}
              href={section.href}
              className="rounded-xl border border-blue-100 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.10)] ring-1 ring-blue-50 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-[0_16px_34px_rgba(15,23,42,0.13)]"
            >
              <span
                className={`inline-flex rounded-lg px-3 py-1 text-sm font-black ${section.className}`}
              >
                {section.code}
              </span>
              <h3 className="mt-4 text-base font-black">{section.title}</h3>
              <p className="mt-2 min-h-12 text-xs font-bold leading-5 text-slate-500">
                {section.text}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-blue-600">
                Practice
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-black uppercase tracking-wide">
          Practice Mock tests + Skills
        </h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Use mocks for exam pressure, then skill trainers for the behaviours
          holding you back.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-5">
          {mockAndSkillCards.map((card) => {
            const Icon = card.icon;
            return (
            <Link
              href={card.href}
              key={card.title}
              className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-[0_8px_22px_rgba(15,23,42,0.07)] transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-[0_12px_28px_rgba(15,23,42,0.10)]"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconClass}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-sm font-black">{card.title}</h3>
              <p className="mt-2 min-h-10 text-xs font-bold leading-5 text-slate-500">
                {card.text}
              </p>
              <span className="mt-3 inline-flex items-center gap-2 text-xs font-black text-blue-600">
                {card.cta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          );
          })}
        </div>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_1.05fr]">
        <ClientPremiumGate
          isPremium={isPremium}
          checkoutLoading={checkoutLoading}
          onUpgrade={onUpgrade}
          title="Unlock targeted skill queue"
          description="Premium keeps the diagnostic study plan visible as exact tasks you can start from practice."
          featureLabel="Premium study plan"
        >
          <section className="self-start rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wide">
              Targeted skill queue
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Suggested next sets based on the patterns in your latest diagnostic.
            </p>
            <div className="mt-4 space-y-2">
              {studyPlanTasks.length === 0 ? (
                <Link
                  href={emptySkillQueueHref}
                  className="block rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center transition-colors hover:border-blue-200 hover:bg-blue-50/70"
                >
                  <p className="text-sm font-black text-slate-700">
                    {completedCurrentPlan
                      ? "Your current targeted queue is cleared."
                      : "Your targeted queue is empty."}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    {completedCurrentPlan
                      ? "Run another diagnostic when you want a fresh task queue."
                      : "Saved practice data will decide what belongs here."}
                  </p>
                  <span className="mt-4 inline-flex items-center justify-center gap-2 text-xs font-black text-blue-600">
                    {emptySkillQueueLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              ) : (
              studyPlanTasks.map((task) => {
                const Icon = task.icon;
                return (
                <Link
                  key={task.id}
                  href={task.href}
                  className="grid gap-4 rounded-xl border border-slate-100 px-3 py-3 transition-colors hover:border-blue-200 hover:bg-blue-50/70 sm:grid-cols-[64px_1fr_112px] sm:items-center"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white"
                    >
                      {latestDiagnostic?.section ?? "Task"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${task.iconClass}`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-black">{task.title}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {task.fix}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-black text-blue-600">
                    Start
                  </span>
                </Link>
              );
              }))}
            </div>
            <Link
              href="/medicforest/ucat/report"
              className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700"
            >
              View study plan report
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </ClientPremiumGate>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wide">
            Recent practice
          </h2>
          <div className="mt-4">
            <RecentPracticeSetsPanel
              sets={recentPracticeSets}
              onRemoveSet={onRemoveSet}
              onRemoveAllSets={onRemoveAllSets}
              removingSetId={removingPracticeSetId}
              removingAllSets={removingAllPracticeSets}
              removeError={practiceSetRemoveError}
            />
          </div>
          <Link
            href="/medicforest/ucat/progress"
            className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700"
          >
            View progress
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </div>

      <ApproachBand
        title="Practice turns your study plan into improvement"
        steps={[approachSteps[0], approachSteps[3], approachSteps[1], approachSteps[4]]}
      />
    </div>
  );
}

type CalculatorTrainerMode = "calibration" | "multi-step";
type CalculatorPromptNumberStatus =
  | "idle"
  | "active-correct"
  | "active-wrong"
  | "complete-correct"
  | "complete-wrong";
type CalculatorTrainerProblem = {
  prompt: string;
  answer: number;
  hint: string;
  targetSeconds: number;
};

const initialCalculatorProblem: CalculatorTrainerProblem = {
  prompt: "84 + 1327 - 496 + 58",
  answer: 973,
  hint: "Calibration target: 9 seconds.",
  targetSeconds: 9,
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createCalculatorProblem(
  mode: CalculatorTrainerMode
): CalculatorTrainerProblem {
  if (mode === "calibration") {
    const a = randomInt(25, 180);
    const b = randomInt(700, 4800);
    const c = randomInt(20, 190);
    const d = randomInt(350, 4200);

    return {
      prompt: `${a} + ${b} - ${d} + ${c}`,
      answer: a + b - d + c,
      hint: "Calibration target: 9 seconds.",
      targetSeconds: 9,
    };
  }

  const type = randomInt(1, 3);
  if (type === 1) {
    const a = randomInt(12, 39);
    const b = randomInt(14, 68);
    const c = randomInt(8, 27);
    const d = randomInt(18, 74);

    return {
      prompt: `${a} x ${b} + ${c} x ${d}`,
      answer: a * b + c * d,
      hint: "Two products, then one final add. Use M+ to bank a product if that feels cleaner.",
      targetSeconds: 16,
    };
  }
  if (type === 2) {
    const a = randomInt(18, 55);
    const b = randomInt(12, 45);
    const c = randomInt(6, 22);
    const d = randomInt(20, 85);

    return {
      prompt: `${a} x ${b} - ${c} x ${d}`,
      answer: a * b - c * d,
      hint: "Calculate both products first, then subtract the second from the first.",
      targetSeconds: 16,
    };
  }

  const a = randomInt(9, 34);
  const b = randomInt(15, 62);
  const c = randomInt(120, 680);
  const d = randomInt(7, 28);
  const e = randomInt(3, 16);

  return {
    prompt: `${a} x ${b} + ${c} - ${d} x ${e}`,
    answer: a * b + c - d * e,
    hint: "Handle the multiplications as separate chunks, then combine the add/subtract terms.",
    targetSeconds: 18,
  };
}

function isCloseNumber(input: string, answer: number) {
  const parsed = Number(input);
  if (!Number.isFinite(parsed)) return false;

  return Math.abs(parsed - answer) <= 0.05;
}

function getCalculatorPromptNumberText(token: string) {
  return token.match(/-?\d+(?:\.\d+)?/)?.[0] ?? null;
}

function getCalculatorPromptNumbers(prompt: string) {
  return prompt
    .split(" ")
    .map(getCalculatorPromptNumberText)
    .filter((token): token is string => Boolean(token));
}

function normaliseCalculatorProgressText(value: string) {
  const trimmed = value.trim();
  if (trimmed === "") return "";
  if (trimmed === "0" || trimmed === "0.") return trimmed;

  return trimmed.replace(/^(-?)0+(?=\d)/, "$1");
}

function getCalculatorPromptNumberClass(status?: CalculatorPromptNumberStatus) {
  if (status === "active-wrong" || status === "complete-wrong") {
    return "text-red-500";
  }

  if (status === "active-correct" || status === "complete-correct") {
    return "text-emerald-500";
  }

  return "text-slate-500";
}

type FlagTrainerSection = Extract<UCATSection, "vr" | "dm" | "qr">;
type FlagDifficulty = "easy" | "medium" | "hard";

const flagTrainerSections: Array<{
  code: UCATSectionCode;
  label: string;
  slug: FlagTrainerSection;
}> = [
  { code: "VR", label: "Verbal Reasoning", slug: "vr" },
  { code: "DM", label: "Decision Making", slug: "dm" },
  { code: "QR", label: "Quantitative Reasoning", slug: "qr" },
];

const calculatorButtonRows = [
  ["MRC", "M-", "M+", "CE"],
  ["7", "8", "9", "/"],
  ["4", "5", "6", "*"],
  ["1", "2", "3", "-"],
  ["0", ".", "=", "+"],
] as const;
const UCAT_CALCULATOR_MAX_DIGITS = 10;

function formatTrainerClock(seconds: number) {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  return `${Math.floor(wholeSeconds / 60)}:${String(wholeSeconds % 60).padStart(2, "0")}`;
}

function getCalculatorModeLabel(mode: CalculatorTrainerMode) {
  if (mode === "calibration") return "9-second calibration";
  return "Multi-step calculations";
}

function calculateTrainerValue(stored: number, current: number, operator: string) {
  if (operator === "+") return stored + current;
  if (operator === "-") return stored - current;
  if (operator === "*") return stored * current;
  if (operator === "/") return current === 0 ? 0 : stored / current;
  return current;
}

function countCalculatorDigits(display: string) {
  return display.replace(/\D/g, "").length;
}

function formatCalculatorDisplayValue(value: number) {
  if (!Number.isFinite(value)) return "Error";
  if (value === 0) return "0";

  const sign = value < 0 ? "-" : "";
  const absolute = Math.abs(value);
  const integerDigits = Math.floor(absolute).toString().length;

  if (integerDigits > UCAT_CALCULATOR_MAX_DIGITS) return "Error";

  const decimalPlaces = Math.max(0, UCAT_CALCULATOR_MAX_DIGITS - integerDigits);
  const rounded = Number(absolute.toFixed(decimalPlaces));
  const roundedIntegerDigits = Math.floor(rounded).toString().length;

  if (roundedIntegerDigits > UCAT_CALCULATOR_MAX_DIGITS) return "Error";

  return `${sign}${String(
    Number(rounded.toFixed(Math.max(0, UCAT_CALCULATOR_MAX_DIGITS - roundedIntegerDigits)))
  )}`;
}

function appendCalculatorDigit(display: string, digit: string, waiting: boolean) {
  if (waiting || display === "0" || display === "Error") return digit;
  if (countCalculatorDigits(display) >= UCAT_CALCULATOR_MAX_DIGITS) return display;
  return `${display}${digit}`;
}

function appendCalculatorDecimal(display: string, waiting: boolean) {
  if (waiting || display === "Error") return "0.";
  return display.includes(".") ? display : `${display}.`;
}

function getTrainerNowMs() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function getFlagDifficulty(question: UCATQuestion): FlagDifficulty {
  if (question.tags?.includes("hard")) return "hard";
  if (question.tags?.includes("medium")) return "medium";
  return "easy";
}

function formatTrainerTag(tag: string) {
  return tag
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getFlagTrainerQuestions(section: FlagTrainerSection) {
  const buckets: Record<FlagDifficulty, UCATQuestion[]> = {
    easy: [],
    medium: [],
    hard: [],
  };

  UCAT_QUESTION_BANK[section].forEach((question) => {
    buckets[getFlagDifficulty(question)].push(question);
  });

  const ordered: UCATQuestion[] = [];
  const maxLength = Math.max(
    buckets.easy.length,
    buckets.medium.length,
    buckets.hard.length
  );

  for (let index = 0; index < maxLength; index += 1) {
    const easy = buckets.easy[index];
    const medium = buckets.medium[index];
    const hard = buckets.hard[index];
    if (easy) ordered.push(easy);
    if (medium) ordered.push(medium);
    if (hard) ordered.push(hard);
  }

  return ordered;
}

function FlagTrainerVisual({ visual }: { visual?: UCATQuestion["visual"] }) {
  if (!visual) return null;

  if (visual.type === "table") {
    return (
      <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
        <div className="bg-slate-50 px-3 py-2 text-xs font-black text-slate-700">
          {visual.title}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-xs font-semibold text-slate-700">
            <thead className="bg-white text-slate-500">
              <tr>
                {visual.headers.map((header) => (
                  <th key={header} className="border-t border-slate-100 px-3 py-2">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visual.rows.map((row, rowIndex) => (
                <tr key={`${visual.title}-${rowIndex}`} className="odd:bg-slate-50/60">
                  {row.map((cell, cellIndex) => (
                    <td key={`${cell}-${cellIndex}`} className="border-t border-slate-100 px-3 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (visual.type === "bar" || visual.type === "line" || visual.type === "pie") {
    if (visual.type === "pie") {
      return (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-black text-slate-700">{visual.title}</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {visual.slices.map((slice) => (
              <div key={slice.label} className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                <span>{slice.label}</span>
                <span className="font-black text-slate-900">{slice.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    const points = visual.type === "bar" ? visual.categories : visual.points;
    return (
      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-black text-slate-700">{visual.title}</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {points.map((point) => (
            <div key={point.label} className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-xs font-semibold text-slate-600">
              <span>{point.label}</span>
              <span className="font-black text-slate-900">{point.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visual.type === "grouped-bar") {
    return (
      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-black text-slate-700">{visual.title}</p>
        <div className="mt-2 space-y-2">
          {visual.groups.map((group) => (
            <div key={group.label} className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-slate-600">
              <p className="font-black text-slate-900">{group.label}</p>
              <p className="mt-1">
                {group.values
                  .map((value, index) => `${visual.seriesLabels[index]}: ${value}`)
                  .join(" | ")}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-black text-slate-700">{visual.title}</p>
      <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">
        Set-based visual with {visual.shapes.length} shape regions and {visual.regionLabels.length} labels.
      </p>
    </div>
  );
}

function SkillsTrainersContent({
  latestDiagnostic,
}: {
  latestDiagnostic: DashboardDiagnostic | null;
}) {
  const studyPlanTasks = getDiagnosticStudyPlanTasks(latestDiagnostic);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calculatorMode, setCalculatorMode] =
    useState<CalculatorTrainerMode>("calibration");
  const [calculatorProblem, setCalculatorProblem] =
    useState<CalculatorTrainerProblem>(initialCalculatorProblem);
  const [calculatorRunning, setCalculatorRunning] = useState(false);
  const [calculatorElapsedSeconds, setCalculatorElapsedSeconds] = useState(0);
  const calculatorStartedAtRef = useRef<number | null>(null);
  const [calculatorCorrect, setCalculatorCorrect] = useState(0);
  const [calculatorTotal, setCalculatorTotal] = useState(0);
  const [calculatorFeedback, setCalculatorFeedback] = useState(
    "Open the trainer, then run the 9-second calibration."
  );
  const [calculatorInstructionsOpen, setCalculatorInstructionsOpen] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcStored, setCalcStored] = useState<number | null>(null);
  const [calcOperator, setCalcOperator] = useState<string | null>(null);
  const [calcWaiting, setCalcWaiting] = useState(false);
  const [calcMemory, setCalcMemory] = useState(0);
  const [lastMrcAt, setLastMrcAt] = useState(0);
  const lastCalculatorPromptRef = useRef(initialCalculatorProblem.prompt);
  const [calculatorNumberStatuses, setCalculatorNumberStatuses] = useState<
    CalculatorPromptNumberStatus[]
  >(() => getCalculatorPromptNumbers(initialCalculatorProblem.prompt).map(() => "idle"));
  const [calculatorActiveNumberIndex, setCalculatorActiveNumberIndex] = useState(0);
  const [flaggingOpen, setFlaggingOpen] = useState(false);
  const [flagSection, setFlagSection] = useState<FlagTrainerSection>("vr");
  const [flagIndex, setFlagIndex] = useState(0);
  const [flagCorrect, setFlagCorrect] = useState(0);
  const [flagTotal, setFlagTotal] = useState(0);
  const [flagChoice, setFlagChoice] = useState<boolean | null>(null);
  const flagTrainerQuestions = useMemo(
    () => getFlagTrainerQuestions(flagSection),
    [flagSection]
  );
  const currentFlagQuestion =
    flagTrainerQuestions.length > 0
      ? flagTrainerQuestions[flagIndex % flagTrainerQuestions.length]
      : null;
  const currentFlagDifficulty = currentFlagQuestion
    ? getFlagDifficulty(currentFlagQuestion)
    : "easy";
  const currentFlagShouldFlag = currentFlagDifficulty === "hard";
  const flagAnswered = flagChoice !== null;
  const flagWasCorrect = flagAnswered && flagChoice === currentFlagShouldFlag;
  const calculatorOverTarget =
    calculatorElapsedSeconds > calculatorProblem.targetSeconds;
  const calculatorPressurePct = Math.min(
    100,
    (calculatorElapsedSeconds / calculatorProblem.targetSeconds) * 100
  );
  const calculatorAccuracy =
    calculatorTotal > 0
      ? `${Math.round((calculatorCorrect / calculatorTotal) * 100)}%`
      : "-";
  const calculatorPromptTokens = calculatorProblem.prompt.split(" ");
  const calculatorPromptNumbers = useMemo(
    () => getCalculatorPromptNumbers(calculatorProblem.prompt),
    [calculatorProblem.prompt]
  );
  const calcValue = calcDisplay === "Error" ? 0 : Number(calcDisplay) || 0;

  const setCalculatorPromptNumberStatus = useCallback(
    (index: number, status: CalculatorPromptNumberStatus) => {
      setCalculatorNumberStatuses((current) => {
        if (index < 0 || index >= calculatorPromptNumbers.length) return current;

        const next = Array.from(
          { length: calculatorPromptNumbers.length },
          (_, itemIndex) => current[itemIndex] ?? "idle"
        );
        next[index] = status;
        return next;
      });
    },
    [calculatorPromptNumbers.length]
  );

  const resetCalculatorPromptProgress = useCallback(
    (problem: CalculatorTrainerProblem) => {
      setCalculatorNumberStatuses(
        getCalculatorPromptNumbers(problem.prompt).map(() => "idle")
      );
      setCalculatorActiveNumberIndex(0);
    },
    []
  );

  const clearActiveCalculatorPromptNumber = useCallback(() => {
    setCalculatorPromptNumberStatus(calculatorActiveNumberIndex, "idle");
  }, [calculatorActiveNumberIndex, setCalculatorPromptNumberStatus]);

  const updateCalculatorPromptProgress = useCallback(
    (display: string) => {
      const expected = calculatorPromptNumbers[calculatorActiveNumberIndex];
      if (!expected) return;

      const entered = normaliseCalculatorProgressText(display);
      const target = normaliseCalculatorProgressText(expected);
      const status = target.startsWith(entered)
        ? "active-correct"
        : "active-wrong";
      setCalculatorPromptNumberStatus(calculatorActiveNumberIndex, status);
    },
    [
      calculatorActiveNumberIndex,
      calculatorPromptNumbers,
      setCalculatorPromptNumberStatus,
    ]
  );

  const finaliseCalculatorPromptNumber = useCallback(
    (display = calcDisplay) => {
      const expected = calculatorPromptNumbers[calculatorActiveNumberIndex];
      if (!expected) return;

      const entered = normaliseCalculatorProgressText(display);
      const target = normaliseCalculatorProgressText(expected);
      setCalculatorPromptNumberStatus(
        calculatorActiveNumberIndex,
        entered === target ? "complete-correct" : "complete-wrong"
      );
      setCalculatorActiveNumberIndex((current) =>
        Math.min(current + 1, calculatorPromptNumbers.length)
      );
    },
    [
      calcDisplay,
      calculatorActiveNumberIndex,
      calculatorPromptNumbers,
      setCalculatorPromptNumberStatus,
    ]
  );

  const submitCalculatorTrainerDisplay = useCallback(() => {
    if (!calculatorRunning) return;

    if (!calcWaiting) {
      finaliseCalculatorPromptNumber(calcDisplay);
    }

    const elapsed = calculatorStartedAtRef.current === null
      ? calculatorElapsedSeconds
      : getTrainerElapsedSeconds(calculatorStartedAtRef.current, getTrainerNowMs());
    calculatorStartedAtRef.current = null;
    const correct = isCloseNumber(calcDisplay, calculatorProblem.answer);
    const onTarget = elapsed <= calculatorProblem.targetSeconds;
    setCalculatorTotal((current) => current + 1);
    setCalculatorCorrect((current) => current + (correct ? 1 : 0));
    setCalculatorFeedback(
      correct
        ? onTarget
          ? `Correct in ${elapsed.toFixed(1)}s. That is on target.`
          : `Correct in ${elapsed.toFixed(1)}s. Aim for ${calculatorProblem.targetSeconds}s next time.`
        : `Missed: ${calculatorProblem.answer}. Reset the entry pattern and go again.`
    );
    setCalculatorRunning(false);
    setCalculatorElapsedSeconds(elapsed);
  }, [
    calcDisplay,
    calcWaiting,
    calculatorElapsedSeconds,
    calculatorProblem.answer,
    calculatorProblem.targetSeconds,
    calculatorRunning,
    finaliseCalculatorPromptNumber,
  ]);

  useEffect(() => {
    if (!calculatorRunning) return;

    const timer = window.setInterval(() => {
      if (calculatorStartedAtRef.current !== null) {
        setCalculatorElapsedSeconds(
          getTrainerElapsedSeconds(calculatorStartedAtRef.current, getTrainerNowMs())
        );
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [calculatorRunning]);

  useEffect(() => {
    const handleCalculatorToggle = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        setCalculatorOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", handleCalculatorToggle);
    return () => window.removeEventListener("keydown", handleCalculatorToggle);
  }, []);

  useEffect(() => {
    if (!calculatorOpen) return;

    const handleCalculatorKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (event.altKey) return;

      if (!calculatorRunning) return;

      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        const nextDisplay = appendCalculatorDigit(calcDisplay, event.key, calcWaiting);
        setCalcDisplay(nextDisplay);
        setCalcWaiting(false);
        updateCalculatorPromptProgress(nextDisplay);
        return;
      }
      if (event.key === ".") {
        event.preventDefault();
        const nextDisplay = appendCalculatorDecimal(calcDisplay, calcWaiting);
        setCalcDisplay(nextDisplay);
        setCalcWaiting(false);
        updateCalculatorPromptProgress(nextDisplay);
        return;
      }
      if (["+", "-", "*", "/"].includes(event.key)) {
        event.preventDefault();
        const current = Number(calcDisplay) || 0;
        if (!calcWaiting) {
          finaliseCalculatorPromptNumber(calcDisplay);
        }
        if (calcStored === null || calcOperator === null) {
          setCalcStored(current);
        } else {
          const result = calculateTrainerValue(calcStored, current, calcOperator);
          const nextDisplay = formatCalculatorDisplayValue(result);
          setCalcDisplay(nextDisplay);
          setCalcStored(nextDisplay === "Error" ? null : Number(nextDisplay));
        }
        setCalcOperator(event.key);
        setCalcWaiting(true);
        return;
      }
      if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        if (event.key === "Enter") {
          submitCalculatorTrainerDisplay();
          return;
        }
        const current = Number(calcDisplay) || 0;
        if (!calcWaiting) {
          finaliseCalculatorPromptNumber(calcDisplay);
        }
        if (calcStored === null || calcOperator === null) {
          setCalcStored(current);
        } else {
          const result = calculateTrainerValue(calcStored, current, calcOperator);
          const nextDisplay = formatCalculatorDisplayValue(result);
          setCalcDisplay(nextDisplay);
          setCalcStored(nextDisplay === "Error" ? null : Number(nextDisplay));
        }
        setCalcOperator(null);
        setCalcWaiting(true);
        return;
      }
      if (event.key === "Backspace") {
        event.preventDefault();
        setCalcDisplay("0");
        setCalcWaiting(false);
        clearActiveCalculatorPromptNumber();
        return;
      }
      if (key === "m") {
        event.preventDefault();
        setCalcMemory((current) => current - calcValue);
        setCalcWaiting(true);
        return;
      }
      if (key === "p") {
        event.preventDefault();
        setCalcMemory((current) => current + calcValue);
        setCalcWaiting(true);
        return;
      }
      if (key === "c") {
        event.preventDefault();
        const now = getTrainerNowMs();
        if (now - lastMrcAt < 700) {
          setCalcMemory(0);
          setCalcDisplay("0");
          setLastMrcAt(0);
          return;
        }
        const nextDisplay = formatCalculatorDisplayValue(calcMemory);
        setCalcDisplay(nextDisplay);
        updateCalculatorPromptProgress(nextDisplay);
        setCalcWaiting(true);
        setLastMrcAt(now);
      }
    };

    window.addEventListener("keydown", handleCalculatorKeyDown);
    return () => window.removeEventListener("keydown", handleCalculatorKeyDown);
  }, [
    calculatorOpen,
    calculatorRunning,
    calcDisplay,
    calcStored,
    calcOperator,
    calcWaiting,
    calcValue,
    calcMemory,
    lastMrcAt,
    clearActiveCalculatorPromptNumber,
    finaliseCalculatorPromptNumber,
    submitCalculatorTrainerDisplay,
    updateCalculatorPromptProgress,
  ]);

  const resetTrainerCalculator = (problem = calculatorProblem) => {
    setCalcDisplay("0");
    setCalcStored(null);
    setCalcOperator(null);
    setCalcWaiting(false);
    resetCalculatorPromptProgress(problem);
  };

  const createFreshCalculatorProblem = (mode: CalculatorTrainerMode) => {
    let nextProblem = createCalculatorProblem(mode);

    for (
      let attempts = 0;
      attempts < 6 && nextProblem.prompt === lastCalculatorPromptRef.current;
      attempts += 1
    ) {
      nextProblem = createCalculatorProblem(mode);
    }

    lastCalculatorPromptRef.current = nextProblem.prompt;
    return nextProblem;
  };

  const clearTrainerCalculator = () => {
    resetTrainerCalculator();
  };

  const commitTrainerCalcOperation = (nextOperator?: string) => {
    const current = Number(calcDisplay) || 0;
    if (!calcWaiting) {
      finaliseCalculatorPromptNumber(calcDisplay);
    }
    if (calcStored === null || calcOperator === null) {
      setCalcStored(current);
    } else {
      const result = calculateTrainerValue(calcStored, current, calcOperator);
      const nextDisplay = formatCalculatorDisplayValue(result);
      setCalcDisplay(nextDisplay);
      setCalcStored(nextDisplay === "Error" ? null : Number(nextDisplay));
    }
    setCalcOperator(nextOperator ?? null);
    setCalcWaiting(true);
  };

  const inputTrainerCalcDigit = (digit: string) => {
    const nextDisplay = appendCalculatorDigit(calcDisplay, digit, calcWaiting);
    setCalcDisplay(nextDisplay);
    setCalcWaiting(false);
    updateCalculatorPromptProgress(nextDisplay);
  };

  const inputTrainerCalcDecimal = () => {
    const nextDisplay = appendCalculatorDecimal(calcDisplay, calcWaiting);
    setCalcDisplay(nextDisplay);
    setCalcWaiting(false);
    updateCalculatorPromptProgress(nextDisplay);
  };

  const memoryRecallClearTrainer = () => {
    const now = getTrainerNowMs();
    if (now - lastMrcAt < 700) {
      setCalcMemory(0);
      setCalcDisplay("0");
      setLastMrcAt(0);
      return;
    }

    const nextDisplay = formatCalculatorDisplayValue(calcMemory);
    setCalcDisplay(nextDisplay);
    setCalcWaiting(true);
    updateCalculatorPromptProgress(nextDisplay);
    setLastMrcAt(now);
  };

  const memoryAddTrainer = (sign: 1 | -1) => {
    setCalcMemory((current) => current + sign * calcValue);
    setCalcWaiting(true);
  };

  const pressTrainerCalculatorButton = (key: string) => {
    if (!calculatorRunning) return;

    if (/^[0-9]$/.test(key)) {
      inputTrainerCalcDigit(key);
      return;
    }
    if (key === ".") {
      inputTrainerCalcDecimal();
      return;
    }
    if (["+", "-", "*", "/"].includes(key)) {
      commitTrainerCalcOperation(key);
      return;
    }
    if (key === "=") {
      commitTrainerCalcOperation();
      return;
    }
    if (key === "CE") {
      clearTrainerCalculator();
      return;
    }
    if (key === "MRC") {
      memoryRecallClearTrainer();
      return;
    }
    if (key === "M-") {
      memoryAddTrainer(-1);
      return;
    }
    if (key === "M+") {
      memoryAddTrainer(1);
    }
  };

  const prepareCalculatorTrainer = (mode: CalculatorTrainerMode) => {
    const nextProblem = createFreshCalculatorProblem(mode);
    setCalculatorMode(mode);
    setCalculatorProblem(nextProblem);
    resetTrainerCalculator(nextProblem);
    setCalculatorRunning(false);
    calculatorStartedAtRef.current = null;
    setCalculatorElapsedSeconds(0);
    setCalculatorFeedback(
      mode === "calibration"
        ? "Ready for a fresh 9-second calibration calculation."
        : "Ready for a fresh multi-step calculation."
    );
  };

  const openCalculatorTrainer = () => {
    setFlaggingOpen(false);
    setCalculatorOpen(true);
    prepareCalculatorTrainer("calibration");
  };

  const startCalculatorTrainer = (mode = calculatorMode) => {
    const nextProblem = createFreshCalculatorProblem(mode);
    setCalculatorMode(mode);
    setCalculatorProblem(nextProblem);
    resetTrainerCalculator(nextProblem);
    calculatorStartedAtRef.current = getTrainerNowMs();
    setCalculatorRunning(true);
    setCalculatorElapsedSeconds(0);
    setCalculatorFeedback(`${getCalculatorModeLabel(mode)} running with a new calculation.`);
  };

  const finishCalculatorProblem = () => {
    submitCalculatorTrainerDisplay();
  };

  const chooseFlagSection = (section: FlagTrainerSection) => {
    setFlagSection(section);
    setFlagIndex(0);
    setFlagCorrect(0);
    setFlagTotal(0);
    setFlagChoice(null);
  };

  const openFlaggingTrainer = () => {
    setCalculatorOpen(false);
    setCalculatorRunning(false);
    calculatorStartedAtRef.current = null;
    setFlaggingOpen(true);
    setFlagChoice(null);
  };

  const chooseFlag = (shouldFlag: boolean) => {
    if (flagChoice !== null || !currentFlagQuestion) return;

    const correct = shouldFlag === currentFlagShouldFlag;
    setFlagChoice(shouldFlag);
    setFlagTotal((current) => current + 1);
    setFlagCorrect((current) => current + (correct ? 1 : 0));
  };

  const nextFlagScenario = () => {
    setFlagChoice(null);
    setFlagIndex((current) => current + 1);
  };

  return (
    <div className="space-y-5 px-6 py-5 lg:px-8">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide">
              Skills Trainers
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
              Short drills for the mechanics that show up inside your diagnostic fixes.
            </p>
          </div>
          <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
            {studyPlanTasks.length} linked study task{studyPlanTasks.length === 1 ? "" : "s"}
          </span>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <section
          id="calculator"
          className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${
            calculatorOpen ? "xl:col-span-2" : ""
          }`}
        >
          {!calculatorOpen ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <Calculator className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wide">
                    Calculator speed trainer
                  </h2>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Timed calculation using the same calculator and shortcuts as the question bank.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["Calibration", "9s"],
                  ["Mode", "Pressure"],
                  ["Input", "UCAT calculator"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-black text-slate-500">{label}</p>
                    <p className="mt-1 text-xl font-black text-slate-950">{value}</p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={openCalculatorTrainer}
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700"
              >
                Open trainer
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black text-slate-400">
                    Skills Trainers / Calculator Speed Trainer
                  </p>
                  <h2 className="mt-4 text-2xl font-black text-slate-950">
                    Calculator speed trainer
                  </h2>
                  <button
                    type="button"
                    onClick={() => setCalculatorInstructionsOpen((current) => !current)}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-black text-slate-700 hover:text-blue-600"
                  >
                    Instructions
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        calculatorInstructionsOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {calculatorInstructionsOpen && (
                    <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                      Start a pressure round, use the calculator exactly as you would in the question bank, then submit the displayed value. Keyboard shortcuts match the question calculator.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setCalculatorOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-xs font-black text-slate-600 hover:bg-slate-50"
                >
                  Back to trainers
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {(["calibration", "multi-step"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => prepareCalculatorTrainer(mode)}
                    className={`rounded-lg px-4 py-2 text-xs font-black ${
                      calculatorMode === mode
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    {getCalculatorModeLabel(mode)}
                  </button>
                ))}
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_280px]">
                <div className="min-h-[470px] rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-950">
                        Use the calculator to solve
                      </p>
                      <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 text-4xl font-black leading-none">
                        {calculatorPromptTokens.map((token, index) => {
                          const promptNumberIndex = calculatorPromptTokens
                            .slice(0, index + 1)
                            .filter((item) => getCalculatorPromptNumberText(item)).length - 1;
                          const isNumberToken = getCalculatorPromptNumberText(token) !== null;
                          const status = isNumberToken
                            ? calculatorNumberStatuses[promptNumberIndex]
                            : undefined;

                          return (
                            <span
                              key={`${token}-${index}`}
                              className={
                                isNumberToken
                                  ? getCalculatorPromptNumberClass(status)
                                  : ["+", "-", "x", "/"].includes(token)
                                    ? "text-slate-400"
                                    : "text-slate-500"
                              }
                            >
                              {token}
                            </span>
                          );
                        })}
                        <span className="text-slate-400">=</span>
                      </div>
                      <p className="mt-5 text-sm font-black text-slate-950">
                        Accuracy: {calculatorAccuracy}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
                      <p className="text-xs font-black text-slate-500">Target</p>
                      <p className="mt-1 text-2xl font-black text-slate-950">
                        {calculatorProblem.targetSeconds}s
                      </p>
                    </div>
                  </div>

                  <div className="mt-16 grid gap-4 lg:grid-cols-[1fr_160px] lg:items-end">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                        Time pressure
                      </p>
                      <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            calculatorOverTarget ? "bg-red-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${calculatorPressurePct}%` }}
                        />
                      </div>
                      <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                        {calculatorProblem.hint}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-500">Time</p>
                      <p className={`mt-1 text-2xl font-black ${calculatorOverTarget ? "text-red-600" : "text-slate-950"}`}>
                        {formatTrainerClock(calculatorElapsedSeconds)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {[
                      ["Correct", String(calculatorCorrect)],
                      ["Attempted", String(calculatorTotal)],
                      ["Mode", getCalculatorModeLabel(calculatorMode)],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-black text-slate-500">{label}</p>
                        <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-64">
                  <div className="w-64 rounded-sm border border-slate-700 bg-[#f3f4f6] p-3 text-black shadow-2xl">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-bold">Calculator</p>
                      <button
                        type="button"
                        onClick={() => {
                          setCalculatorRunning(false);
                          setCalculatorOpen(false);
                        }}
                        className="rounded-sm px-2 text-sm font-bold hover:bg-slate-200"
                      >
                        x
                      </button>
                    </div>
                    <div className="mb-2 rounded-sm border border-slate-500 bg-white px-2 py-2 text-right font-mono text-2xl">
                      {calcDisplay}
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 text-sm font-bold">
                      {calculatorButtonRows.flat().map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => pressTrainerCalculatorButton(key)}
                          disabled={!calculatorRunning}
                          className="rounded-sm border border-slate-400 bg-white py-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {key}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      calculatorRunning
                        ? finishCalculatorProblem()
                        : startCalculatorTrainer(calculatorMode)
                    }
                    className={`mt-4 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl px-5 text-base font-black text-white shadow-lg ring-4 transition-colors ${
                      calculatorRunning
                        ? "bg-emerald-600 shadow-emerald-100 ring-emerald-100 hover:bg-emerald-700"
                        : "bg-blue-600 shadow-blue-100 ring-blue-100 hover:bg-blue-700"
                    }`}
                  >
                    <Timer className="h-5 w-5" aria-hidden="true" />
                    {calculatorRunning
                      ? "Submit answer"
                      : calculatorTotal > 0
                        ? "Start next calculation"
                        : "Start trainer"}
                  </button>
                  <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-700">
                    {calculatorFeedback}
                  </p>
                </div>
              </div>
            </>
          )}
        </section>

        <section
          id="flagging"
          className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${
            flaggingOpen ? "xl:col-span-2" : ""
          }`}
        >
          {!flaggingOpen ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <Flag className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wide">
                    Flagging trainer
                  </h2>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Open question-style drills, then decide whether each question is hard enough to flag.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {flagTrainerSections.map((section) => (
                  <button
                    key={section.slug}
                    type="button"
                    onClick={() => chooseFlagSection(section.slug)}
                    className={`rounded-xl border p-3 text-left ${
                      flagSection === section.slug
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-rose-200"
                    }`}
                  >
                    <p className="text-sm font-black">{section.code}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {section.label}
                    </p>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={openFlaggingTrainer}
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-rose-600 px-5 text-sm font-black text-white hover:bg-rose-700"
              >
                Open questions
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black text-slate-400">
                    Skills Trainers / Flagging Trainer
                  </p>
                  <h2 className="mt-4 text-2xl font-black text-slate-950">
                    Question flagging trainer
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                    Read the question first, then decide whether it deserves a flag or should be answered now.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFlaggingOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-xs font-black text-slate-600 hover:bg-slate-50"
                >
                  Back to trainers
                </button>
              </div>
              <FlaggingTrainerPanel
                flagSection={flagSection}
                currentFlagQuestion={currentFlagQuestion}
                currentFlagDifficulty={currentFlagDifficulty}
                flagAnswered={flagAnswered}
                flagChoice={flagChoice}
                flagCorrect={flagCorrect}
                flagTotal={flagTotal}
                flagWasCorrect={flagWasCorrect}
                flagIndex={flagIndex}
                flagQuestionCount={flagTrainerQuestions.length}
                onChooseFlag={chooseFlag}
                onChooseSection={chooseFlagSection}
                onNext={nextFlagScenario}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function FlagTrainerQuestionDetails({
  question,
}: {
  question: UCATQuestion;
}) {
  const stimulusParagraphs =
    question.subtype === "dm-syllogisms"
      ? [question.stimulus.join(" ").replace(/\s+/g, " ").trim()].filter(Boolean)
      : question.stimulus;

  return (
    <div className="space-y-4">
      <div className="space-y-3 text-sm font-semibold leading-6 text-slate-700">
        {stimulusParagraphs.map((paragraph, index) => (
          <p key={`${index}-${paragraph}`}>{paragraph}</p>
        ))}
      </div>
      <FlagTrainerVisual visual={question.visual} />
      {"options" in question && (
        <div className="space-y-2">
          {question.options.map((option) => (
            <div
              key={option.key}
              className="grid grid-cols-[32px_1fr] gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold leading-6 text-slate-700"
            >
              <span className="font-black text-slate-950">{option.key}.</span>
              <span>{option.text}</span>
            </div>
          ))}
        </div>
      )}
      {"yesNoStatements" in question && (
        <div className="space-y-2">
          {question.yesNoStatements.map((statement, index) => (
            <div
              key={statement.id}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold leading-6 text-slate-700"
            >
              {index + 1}. {statement.text}
            </div>
          ))}
        </div>
      )}
      {"categoryItems" in question && (
        <div className="space-y-2">
          {question.categoryItems.map((item, index) => (
            <div
              key={item.id}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold leading-6 text-slate-700"
            >
              {index + 1}. {item.text}
            </div>
          ))}
        </div>
      )}
      {"dragItems" in question && (
        <div className="space-y-2">
          {question.dragItems.map((item, index) => (
            <div
              key={item.id}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold leading-6 text-slate-700"
            >
              {index + 1}. {item.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FlaggingTrainerPanel({
  flagSection,
  currentFlagQuestion,
  currentFlagDifficulty,
  flagAnswered,
  flagChoice,
  flagCorrect,
  flagTotal,
  flagWasCorrect,
  flagIndex,
  flagQuestionCount,
  onChooseFlag,
  onChooseSection,
  onNext,
}: {
  flagSection: FlagTrainerSection;
  currentFlagQuestion: UCATQuestion | null;
  currentFlagDifficulty: FlagDifficulty;
  flagAnswered: boolean;
  flagChoice: boolean | null;
  flagCorrect: number;
  flagTotal: number;
  flagWasCorrect: boolean;
  flagIndex: number;
  flagQuestionCount: number;
  onChooseFlag: (shouldFlag: boolean) => void;
  onChooseSection: (section: FlagTrainerSection) => void;
  onNext: () => void;
}) {
  const sectionCode =
    flagTrainerSections.find((section) => section.slug === flagSection)?.code ?? "VR";
  const style = sectionStyle(sectionCode);
  const shouldFlag = currentFlagDifficulty === "hard";
  const subtypeLabel = currentFlagQuestion
    ? getUCATSubtypeMeta(currentFlagQuestion.subtype).label
    : "";

  return (
    <div className="mt-5">
      <div className="flex flex-wrap gap-2">
        {flagTrainerSections.map((section) => {
          const active = flagSection === section.slug;
          return (
            <button
              key={section.slug}
              type="button"
              onClick={() => onChooseSection(section.slug)}
              className={`rounded-lg px-4 py-2 text-xs font-black ${
                active
                  ? style.badgeClass
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              {section.code}
            </button>
          );
        })}
      </div>

      {!currentFlagQuestion ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
          No tagged questions found for this section yet.
        </div>
      ) : (
        <>
          <article className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-lg px-3 py-1 text-xs font-black ${style.badgeClass}`}>
                  {sectionCode}
                </span>
                <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                  {subtypeLabel}
                </span>
              </div>
              <span className="text-xs font-black text-slate-500">
                {flagCorrect}/{flagTotal} correct
              </span>
            </div>

            <div className="mt-4 grid min-h-[560px] gap-4 xl:grid-cols-[1fr_0.78fr]">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Question {flagQuestionCount > 0 ? (flagIndex % flagQuestionCount) + 1 : 0} of {flagQuestionCount}
                </p>
                <h3 className="mt-3 text-base font-black text-slate-950">
                  {currentFlagQuestion.title}
                </h3>
                <div className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-wide text-rose-600">
                    Question
                  </p>
                  <p className="mt-2 text-lg font-black leading-7 text-slate-950">
                    {currentFlagQuestion.question}
                  </p>
                  {"instruction" in currentFlagQuestion && (
                    <p className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold leading-6 text-slate-600">
                      {currentFlagQuestion.instruction}
                    </p>
                  )}
                </div>
                <div className="mt-5 max-h-[330px] overflow-y-auto pr-2">
                  <FlagTrainerQuestionDetails question={currentFlagQuestion} />
                </div>
              </div>

              <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-5">
                <p className="text-xs font-black uppercase tracking-wide text-rose-600">
                  Hard or not hard?
                </p>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                  Decide whether this question is worth flagging under exam pressure.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => onChooseFlag(true)}
                    className="inline-flex min-h-12 items-center justify-center rounded-lg bg-rose-600 px-5 text-sm font-black text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    disabled={flagAnswered}
                  >
                    Tag as hard
                  </button>
                  <button
                    type="button"
                    onClick={() => onChooseFlag(false)}
                    className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                    disabled={flagAnswered}
                  >
                    Not hard
                  </button>
                </div>
                <p className="mt-4 text-xs font-semibold leading-5 text-slate-500">
                  Judge the question, not whether you know the answer right now.
                  Hard means it is likely to drain time under exam pressure.
                </p>
                {flagAnswered && (
                  <div
                    className={`mt-5 rounded-xl border p-4 text-sm font-semibold leading-6 ${
                      flagWasCorrect
                        ? "border-emerald-100 bg-emerald-50 text-emerald-900"
                        : "border-red-100 bg-red-50 text-red-900"
                    }`}
                  >
                    <p className="font-black">
                      {flagWasCorrect ? "Correct decision." : "Not quite."}
                    </p>
                    <p className="mt-1">
                      This was tagged {currentFlagDifficulty}.{" "}
                      {shouldFlag
                        ? "Hard-tagged questions should be flagged so you can bank easier marks first."
                        : "Easy and medium questions should usually be answered rather than parked."}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {currentFlagQuestion.tags?.map((tag) => (
                        <span key={tag} className="rounded-full bg-white/80 px-3 py-1 text-xs font-black">
                          {formatTrainerTag(tag)}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-xs font-semibold">
                      You chose: {flagChoice ? "tag as hard" : "not hard"}.
                    </p>
                    <button
                      type="button"
                      onClick={onNext}
                      className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-black text-white hover:bg-blue-700"
                    >
                      Next question
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </article>
        </>
      )}
    </div>
  );
}

function ProgressContent({
  isPremium,
  checkoutLoading,
  onUpgrade,
  practiceStats,
  recentPracticeSets,
  latestDiagnostic,
  completedDashboardTaskIds,
  removedDashboardTaskIds,
  onRemoveSet,
  onRemoveAllSets,
  removingPracticeSetId,
  removingAllPracticeSets,
  practiceSetRemoveError,
}: PremiumGateProps & {
  practiceStats: PracticeStats;
  recentPracticeSets: RecentPracticeSet[];
  latestDiagnostic: DashboardDiagnostic | null;
  completedDashboardTaskIds: Set<string>;
  removedDashboardTaskIds: Set<string>;
  onRemoveSet?: (set: RecentPracticeSet) => void | Promise<void>;
  onRemoveAllSets?: (sets: RecentPracticeSet[]) => void | Promise<void>;
  removingPracticeSetId?: string | null;
  removingAllPracticeSets?: boolean;
  practiceSetRemoveError?: string | null;
}) {
  const progressItems = getQuestionBankProgress(practiceStats);
  const bankCompleted = progressItems.reduce(
    (sum, item) => sum + item.completed,
    0
  );
  const bankTotal = progressItems.reduce((sum, item) => sum + item.total, 0);
  const bankPercent = bankTotal > 0 ? Math.round((bankCompleted / bankTotal) * 100) : 0;
  const studyPlanTasks = getDiagnosticStudyPlanTasks(latestDiagnostic);
  const completedOrClearedTaskIds = new Set([
    ...completedDashboardTaskIds,
    ...removedDashboardTaskIds,
  ]);
  const tickedStudyPlanTasks = studyPlanTasks.filter((task) =>
    completedOrClearedTaskIds.has(task.id)
  );
  const taskProgressPercent =
    studyPlanTasks.length > 0
      ? Math.round((tickedStudyPlanTasks.length / studyPlanTasks.length) * 100)
      : 0;
  const completedQuestionSetCount = recentPracticeSets.filter(
    (set) => !set.isIncomplete
  ).length;
  const incompleteQuestionSetCount = recentPracticeSets.filter(
    (set) => set.isIncomplete
  ).length;
  const [progressSetFilter, setProgressSetFilter] =
    useState<ProgressSetFilter>("All");
  const filteredRecentPracticeSets = recentPracticeSets.filter((set) => {
    if (progressSetFilter === "Incomplete") return set.isIncomplete;
    if (progressSetFilter === "Completed") return !set.isIncomplete;
    return true;
  });
  const progressSetFilterOptions: Array<{
    value: ProgressSetFilter;
    count: number;
  }> = [
    { value: "All", count: recentPracticeSets.length },
    { value: "Incomplete", count: incompleteQuestionSetCount },
    { value: "Completed", count: completedQuestionSetCount },
  ];
  const recentSetsEmptyTitle =
    progressSetFilter === "Incomplete"
      ? "No incomplete sets."
      : progressSetFilter === "Completed"
        ? "No completed sets yet."
        : "No practice sets saved yet.";
  const recentSetsEmptyText =
    progressSetFilter === "Incomplete"
      ? "Started sets you have not finished will appear here."
      : progressSetFilter === "Completed"
        ? "Mark a finished set to add it here."
        : "Start a question-bank set and mark it when you are ready.";
  const sectionImprovementItems = sectionCodes.flatMap((code) => {
    const answered = practiceStats.sectionAnswered[code];
    if (answered === 0) return [];
    const correct = practiceStats.sectionCorrect[code];
    return [
      {
        title: `${code} accuracy`,
        text: `${correct}/${answered} answered questions correct.`,
        href: `/medicforest/ucat/question-bank/${code.toLowerCase()}`,
      },
    ];
  });
  const recentImprovementItems = [
    ...tickedStudyPlanTasks.slice(0, 3).map((task) => ({
      title: task.title,
      text: task.fix,
      href: task.href,
    })),
    ...sectionImprovementItems,
  ].slice(0, 5);
  const progressStatCards = [
    {
      label: "Accuracy",
      value: practiceStats.hasCompletedQuestions
        ? `${practiceStats.accuracy}%`
        : "-",
      helper: practiceStats.hasCompletedQuestions
        ? "From saved question attempts"
        : "No saved practice yet",
    },
    {
      label: "Average time / question",
      value: practiceStats.hasCompletedQuestions
        ? `${practiceStats.avgSeconds}s`
        : "-",
      helper: practiceStats.hasCompletedQuestions
        ? "Across answered practice questions"
        : "No timed answers yet",
    },
    {
      label: "Study plan tasks",
      value:
        studyPlanTasks.length > 0
          ? `${tickedStudyPlanTasks.length}/${studyPlanTasks.length}`
          : "0/0",
      helper:
        studyPlanTasks.length > 0
          ? `${taskProgressPercent}% ticked off`
          : "Run a diagnostic to create tasks",
    },
  ];

  return (
    <div className="space-y-5 px-6 py-5 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-3">
        {progressStatCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black text-slate-700">{card.label}</p>
            <p className="mt-2 text-3xl font-black leading-none text-slate-400">
              {card.value}
            </p>
            <p className="mt-2 text-xs font-bold text-slate-400">
              {card.helper}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.08fr_0.9fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black">Recent sets</h2>
                <Info className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </div>
              <p className="mt-1 text-xs font-bold text-slate-500">
                {incompleteQuestionSetCount} incomplete, {completedQuestionSetCount} completed
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {progressSetFilterOptions.map((option) => {
                const active = progressSetFilter === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setProgressSetFilter(option.value)}
                    className={`inline-flex h-8 items-center gap-2 rounded-full px-4 text-xs font-black transition-colors ${
                      active
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    {option.value}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] ${
                        active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {option.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5">
            <RecentPracticeSetsPanel
              sets={filteredRecentPracticeSets}
              emptyTitle={recentSetsEmptyTitle}
              emptyText={recentSetsEmptyText}
              onRemoveSet={onRemoveSet}
              onRemoveAllSets={onRemoveAllSets}
              removingSetId={removingPracticeSetId}
              removingAllSets={removingAllPracticeSets}
              removeError={practiceSetRemoveError}
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black">Question bank progress</h2>
              <Info className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600">
              {bankPercent}%
            </span>
          </div>
          <p className="mt-2 text-xs font-bold text-slate-500">
            {bankCompleted} of {bankTotal} questions completed
          </p>
          <div className="mt-5 space-y-3">
            {progressItems.map((item) => {
              const style = sectionStyle(item.code);
              const percent =
                item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;
              const allCompleted = item.total > 0 && item.completed >= item.total;
              return (
                <div
                  key={item.code}
                  className="rounded-xl border border-slate-100 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-lg px-3 py-1 text-xs font-black ${style.badgeClass}`}
                      >
                        {item.code}
                      </span>
                      <div>
                        <h3 className="text-sm font-black">{item.title}</h3>
                        <p className="mt-1 text-xs font-bold text-slate-500">
                          {item.focus}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-500">
                      {item.completed}/{item.total}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-[1fr_44px] items-center gap-3">
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${style.barClass}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-right text-xs font-black text-[#0b1143]">
                      {percent}%
                    </span>
                  </div>
                  <Link
                    href={item.href}
                    className="mt-3 inline-flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700"
                  >
                    {allCompleted ? "Open bank" : "Resume bank"}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              );
            })}
          </div>
          <Link
            href="/medicforest/ucat/question-bank"
            className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700"
          >
            Open question bank
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ClientPremiumGate
          isPremium={isPremium}
          checkoutLoading={checkoutLoading}
          onUpgrade={onUpgrade}
          title="Unlock study plan progress"
          description="Premium shows the exact tasks improving, what still needs work and the actions driving score gains."
        >
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black">Study plan progress</h2>
                <Info className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                {taskProgressPercent}%
              </span>
            </div>
            <p className="mt-2 text-xs font-bold text-slate-500">
              {tickedStudyPlanTasks.length} of {studyPlanTasks.length} tasks ticked off.
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${taskProgressPercent}%` }}
              />
            </div>
            {tickedStudyPlanTasks.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm font-black text-slate-700">
                  No tasks ticked off yet.
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Tick tasks on the dashboard and they will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {tickedStudyPlanTasks.map((task) => {
                  const Icon = task.icon;
                  return (
                    <Link
                      key={task.id}
                      href={task.href}
                      className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${task.iconClass}`}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-slate-950">
                          {task.title}
                        </h3>
                        <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                          {task.fix}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
            <Link
              href="/medicforest/ucat/dashboard"
              className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700"
            >
              Back to dashboard tasks
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </ClientPremiumGate>

        <ClientPremiumGate
          isPremium={isPremium}
          checkoutLoading={checkoutLoading}
          onUpgrade={onUpgrade}
          title="Unlock improvement history"
          description="Premium keeps the full timeline of meaningful changes, timing shifts and section-level movement."
        >
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black">Recent improvements</h2>
                <Info className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600">
                {recentImprovementItems.length}
              </span>
            </div>
            {recentImprovementItems.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm font-black text-slate-700">
                  No completed tasks or saved answers yet.
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Tick off study-plan tasks or complete practice questions to populate this card.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {recentImprovementItems.map((item, index) => (
                  <Link
                    key={`${item.title}-${index}`}
                    href={item.href}
                    className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50/60"
                  >
                    <div>
                      <h3 className="text-sm font-black text-slate-950">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                        {item.text}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            )}
            <Link
              href="/medicforest/ucat/question-bank"
              className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700"
            >
              Open practice activity
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </ClientPremiumGate>
      </div>

      <ApproachBand title="The MedicForest approach" />
    </div>
  );
}

// ReportContent extracted to UCATReportContent.tsx


function AccountContent({
  displayName,
  plan,
  email,
  diagnosticCredits,
  aiDiagnosticLastUsedAt,
  hasStripeCustomer,
  checkoutLoading,
  practiceStats,
  recentPracticeSets,
  diagnosticHistory,
  onUpgrade,
  onLogout,
  onSaveDisplayName,
}: {
  displayName: string;
  plan: string;
  email: string;
  diagnosticCredits: number;
  aiDiagnosticLastUsedAt?: string | null;
  hasStripeCustomer: boolean;
  checkoutLoading: boolean;
  practiceStats: PracticeStats;
  recentPracticeSets: RecentPracticeSet[];
  diagnosticHistory: DashboardDiagnostic[];
  onUpgrade: () => void;
  onLogout: () => void;
  onSaveDisplayName: (name: string) => Promise<void>;
}) {
  const [nameDraft, setNameDraft] = useState(displayName);
  const [profileSaveState, setProfileSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [profileSaveMessage, setProfileSaveMessage] = useState<string | null>(
    null
  );
  const trimmedNameDraft = nameDraft.trim();
  const nameChanged = trimmedNameDraft.length > 0 && trimmedNameDraft !== displayName;
  const supportHref = `mailto:medwithrish@gmail.com?subject=${encodeURIComponent(
    "MedicForest account support"
  )}`;
  const dataRequestHref = `mailto:medwithrish@gmail.com?subject=${encodeURIComponent(
    "MedicForest account or data request"
  )}`;
  const savedDiagnosticsCount = diagnosticHistory.length;
  const completedSetsCount = recentPracticeSets.filter(
    (set) => !set.isIncomplete
  ).length;

  const handleProfileSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!nameChanged) return;

    setProfileSaveState("saving");
    setProfileSaveMessage(null);

    try {
      await onSaveDisplayName(trimmedNameDraft);
      setProfileSaveState("saved");
      setProfileSaveMessage("Display name saved.");
      setNameDraft(trimmedNameDraft);
    } catch (error) {
      setProfileSaveState("error");
      setProfileSaveMessage(
        error instanceof Error ? error.message : "Could not save display name."
      );
    }
  };

  return (
    <div className="space-y-5 px-6 py-5 lg:px-8">
      <section className="overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-blue-600 via-blue-700 to-slate-950 text-white shadow-sm">
        <div className="grid gap-5 p-6 lg:grid-cols-[1fr_360px] lg:items-center">
          <div className="flex gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-black ring-1 ring-white/20">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-blue-100">
                Account settings
              </p>
              <h2 className="mt-2 text-3xl font-black">{displayName}</h2>
              <p className="mt-1 text-sm font-semibold text-blue-100">{email}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black ring-1 ring-white/20">
                  {plan} plan
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black ring-1 ring-white/20">
                  {savedDiagnosticsCount} diagnostic{savedDiagnosticsCount === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <a
              href={supportHref}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-black text-blue-700 transition-colors hover:bg-blue-50"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              Contact support
            </a>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/25 px-4 text-sm font-black text-white transition-colors hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Log out
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Current plan
          </p>
          <p className="mt-2 text-2xl font-black">{plan}</p>
          <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
            {plan === "Premium" ? "Full access" : "Starter access"}
          </p>
        </section>
        <AiDiagnosticCreditSummary
          plan={plan}
          diagnosticCredits={diagnosticCredits}
          lastUsedAt={aiDiagnosticLastUsedAt}
        />
        {[
          [
            "Saved diagnostics",
            String(savedDiagnosticsCount),
            latestDiagnosticLabel(diagnosticHistory[0]),
          ],
          [
            "Practice sets",
            String(completedSetsCount),
            `${practiceStats.totalCompleted} questions saved`,
          ],
        ].map(([label, value, helper]) => (
          <section
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
              {label}
            </p>
            <p className="mt-2 text-2xl font-black">{value}</p>
            <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
              {helper}
            </p>
          </section>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide">
                Profile
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                Keep your display name tidy. Your email is your login and is not
                edited here.
              </p>
            </div>
            <UserRound className="h-5 w-5 text-blue-600" aria-hidden="true" />
          </div>

          <form onSubmit={handleProfileSave} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                Display name
              </span>
              <input
                value={nameDraft}
                onChange={(event) => {
                  setNameDraft(event.target.value);
                  setProfileSaveState("idle");
                  setProfileSaveMessage(null);
                }}
                maxLength={80}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                Email
              </span>
              <input
                value={email}
                readOnly
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-600"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={!nameChanged || profileSaveState === "saving"}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-black text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {profileSaveState === "saving" ? "Saving..." : "Save details"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setNameDraft(displayName);
                  setProfileSaveState("idle");
                  setProfileSaveMessage(null);
                }}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-5 text-sm font-black text-slate-700 transition-colors hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
            {profileSaveMessage && (
              <p
                className={`rounded-lg px-3 py-2 text-xs font-black ${
                  profileSaveState === "error"
                    ? "border border-red-100 bg-red-50 text-red-700"
                    : "border border-emerald-100 bg-emerald-50 text-emerald-700"
                }`}
              >
                {profileSaveMessage}
              </p>
            )}
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide">
                Subscription
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                Manage billing, compare plans or upgrade before checkout.
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-black ${
                plan === "Premium"
                  ? "bg-violet-50 text-violet-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {plan}
            </span>
          </div>
          <div className="mt-5 rounded-xl bg-indigo-50 p-5">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
              Current plan
            </p>
            <p className="mt-2 text-4xl font-black">{plan}</p>
            <ul className="mt-4 space-y-2 text-sm font-semibold leading-6 text-slate-700">
              {(plan === "Premium"
                ? [
                    "Random question-bank diagnostic mocks",
                    "Daily AI diagnostic credit",
                    "Deeper issue analysis and study-plan tasks",
                  ]
                : [
                    "Question bank and skills trainers",
                    "Free QR diagnostic with full report",
                    "1 lifetime AI diagnostic credit",
                  ]
              ).map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onUpgrade}
              disabled={checkoutLoading || (plan === "Premium" && !hasStripeCustomer)}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-black text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {plan === "Premium"
                ? hasStripeCustomer
                  ? checkoutLoading
                    ? "Opening..."
                    : "Manage subscription"
                  : "Premium active"
                : checkoutLoading
                  ? "Opening plans..."
                  : "View Premium plans"}
            </button>
            <Link
              href="/medicforest/pricing"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-blue-100 px-6 text-sm font-black text-blue-600 transition-colors hover:bg-blue-50"
            >
              Compare plans
            </Link>
          </div>
          {plan === "Premium" && !hasStripeCustomer && (
            <p className="mt-3 text-xs font-bold leading-5 text-slate-500">
              This account has manual Premium access, so there is no Stripe
              billing portal to manage.
            </p>
          )}
        </section>

        <AiDiagnosticCreditDetails
          plan={plan}
          diagnosticCredits={diagnosticCredits}
          lastUsedAt={aiDiagnosticLastUsedAt}
        />

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wide">
            Help and account actions
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <a
              href={supportHref}
              className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 transition-colors hover:bg-blue-50"
            >
              <Mail className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <h3 className="mt-3 text-sm font-black">Contact support</h3>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                Email medwithrish@gmail.com for billing, access or technical help.
              </p>
            </a>
            <a
              href={dataRequestHref}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-blue-50"
            >
              <ShieldCheck className="h-5 w-5 text-slate-600" aria-hidden="true" />
              <h3 className="mt-3 text-sm font-black">Data request</h3>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                Ask for account deletion, practice data help or privacy support.
              </p>
            </a>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              ["Terms", "/terms-and-conditions"],
              ["Privacy", "/privacy-policy"],
              ["AI/Data", "/medicforest-disclaimer"],
            ].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 text-xs font-black text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-600"
              >
                {label}
              </Link>
            ))}
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-100 px-5 text-sm font-black text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log out
          </button>
        </section>
      </div>
    </div>
  );
}

function latestDiagnosticLabel(diagnostic: DashboardDiagnostic | undefined) {
  if (!diagnostic) return "No reports yet";

  return `${diagnostic.section} ${diagnostic.accuracy}%`;
}

function DashboardSubpageContent({
  view,
  initialReportId,
  initialMockId,
  displayName,
  plan,
  email,
  isPremium,
  checkoutLoading,
  practiceStats,
  recentPracticeSets,
  latestDiagnostic,
  diagnosticHistory,
  completedDashboardTaskIds,
  removedDashboardTaskIds,
  diagnosticCredits,
  aiDiagnosticLastUsedAt,
  hasStripeCustomer,
  onUpgrade,
  onLogout,
  onSaveDisplayName,
  onRemoveSet,
  onRemoveAllSets,
  removingPracticeSetId,
  removingAllPracticeSets,
  practiceSetRemoveError,
}: {
  view: Exclude<DashboardView, "dashboard">;
  initialReportId?: string | null;
  initialMockId?: string | null;
  displayName: string;
  plan: string;
  email: string;
  isPremium: boolean;
  checkoutLoading: boolean;
  practiceStats: PracticeStats;
  recentPracticeSets: RecentPracticeSet[];
  latestDiagnostic: DashboardDiagnostic | null;
  diagnosticHistory: DashboardDiagnostic[];
  completedDashboardTaskIds: Set<string>;
  removedDashboardTaskIds: Set<string>;
  diagnosticCredits: number;
  aiDiagnosticLastUsedAt?: string | null;
  hasStripeCustomer: boolean;
  onUpgrade: () => void;
  onLogout: () => void;
  onSaveDisplayName: (name: string) => Promise<void>;
  onRemoveSet?: (set: RecentPracticeSet) => void | Promise<void>;
  onRemoveAllSets?: (sets: RecentPracticeSet[]) => void | Promise<void>;
  removingPracticeSetId?: string | null;
  removingAllPracticeSets?: boolean;
  practiceSetRemoveError?: string | null;
}) {
  const freeDiagnosticFeaturesUnlocked = isFreeQrDiagnostic(latestDiagnostic);
  const diagnosticStudyPlanUnlocked =
    isPremium || freeDiagnosticFeaturesUnlocked;

  if (view === "diagnostic" || view === "mock-diagnostic") {
    return (
      <UCATDiagnosticContent
        isPremium={isPremium}
        latestDiagnostic={latestDiagnostic}
        diagnosticHistory={diagnosticHistory}
        plan={plan}
        diagnosticCredits={diagnosticCredits}
        aiDiagnosticLastUsedAt={aiDiagnosticLastUsedAt}
      />
    );
  }
  if (view === "practice") {
    return (
      <PracticeContent
        latestDiagnostic={latestDiagnostic}
        completedDashboardTaskIds={completedDashboardTaskIds}
        removedDashboardTaskIds={removedDashboardTaskIds}
        recentPracticeSets={recentPracticeSets}
        isPremium={diagnosticStudyPlanUnlocked}
        checkoutLoading={checkoutLoading}
        onUpgrade={onUpgrade}
        onRemoveSet={onRemoveSet}
        onRemoveAllSets={onRemoveAllSets}
        removingPracticeSetId={removingPracticeSetId}
        removingAllPracticeSets={removingAllPracticeSets}
        practiceSetRemoveError={practiceSetRemoveError}
      />
    );
  }
  if (view === "skills-trainers") {
    return <SkillsTrainersContent latestDiagnostic={latestDiagnostic} />;
  }
  if (view === "progress") {
    return (
      <ProgressContent
        isPremium={diagnosticStudyPlanUnlocked}
        checkoutLoading={checkoutLoading}
        onUpgrade={onUpgrade}
        practiceStats={practiceStats}
        recentPracticeSets={recentPracticeSets}
        latestDiagnostic={latestDiagnostic}
        completedDashboardTaskIds={completedDashboardTaskIds}
        removedDashboardTaskIds={removedDashboardTaskIds}
        onRemoveSet={onRemoveSet}
        onRemoveAllSets={onRemoveAllSets}
        removingPracticeSetId={removingPracticeSetId}
        removingAllPracticeSets={removingAllPracticeSets}
        practiceSetRemoveError={practiceSetRemoveError}
      />
    );
  }
  if (view === "account") {
    return (
      <AccountContent
        displayName={displayName}
        plan={plan}
        email={email}
        diagnosticCredits={diagnosticCredits}
        aiDiagnosticLastUsedAt={aiDiagnosticLastUsedAt}
        hasStripeCustomer={hasStripeCustomer}
        checkoutLoading={checkoutLoading}
        practiceStats={practiceStats}
        recentPracticeSets={recentPracticeSets}
        diagnosticHistory={diagnosticHistory}
        onUpgrade={onUpgrade}
        onLogout={onLogout}
        onSaveDisplayName={onSaveDisplayName}
      />
    );
  }
  return (
    <UCATReportContent
      isPremium={isPremium}
      checkoutLoading={checkoutLoading}
      onUpgrade={onUpgrade}
      latestDiagnostic={latestDiagnostic}
      diagnosticHistory={diagnosticHistory}
      initialReportId={initialReportId}
      initialMockId={initialMockId}
      completedDashboardTaskIds={completedDashboardTaskIds}
      removedDashboardTaskIds={removedDashboardTaskIds}
    />
  );
}

function AuthPanel({
  mode,
  setMode,
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  legalAccepted,
  setLegalAccepted,
  submitting,
  message,
  error,
  onSubmit,
  presentation = "page",
}: {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  legalAccepted: boolean;
  setLegalAccepted: (value: boolean) => void;
  submitting: boolean;
  message: string | null;
  error: string | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  presentation?: "page" | "overlay";
}) {
  const authCard = (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${
        presentation === "overlay" ? "shadow-2xl shadow-slate-950/20" : ""
      }`}
    >
      <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
        {(["signup", "login"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMode(tab)}
            className={`h-10 rounded-lg text-sm font-black transition-colors ${
              mode === tab
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab === "signup" ? "Create Account" : "Log In"}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {mode === "signup" && (
          <label className="block">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">
              Full name
            </span>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-blue-500"
              placeholder="Rish"
              autoFocus={presentation === "overlay" && mode === "signup"}
              required
            />
          </label>
        )}

        <label className="block">
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-blue-500"
            placeholder="you@example.com"
            autoFocus={presentation === "overlay" && mode === "login"}
            required
          />
        </label>

        <label className="block">
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-blue-500"
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
        </label>

        {mode === "signup" && (
          <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={legalAccepted}
                onChange={(event) => setLegalAccepted(event.target.checked)}
                required
                className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300"
              />
              <span className="text-xs font-bold leading-5 text-slate-700">
                I agree to the{" "}
                <Link
                  href="/terms-and-conditions"
                  className="text-blue-700 underline"
                >
                  Terms and Conditions
                </Link>{" "}
                and confirm I have read the{" "}
                <Link href="/privacy-policy" className="text-blue-700 underline">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link
                  href="/medicforest-disclaimer"
                  className="text-blue-700 underline"
                >
                  AI/Data Disclaimer
                </Link>
                .
              </span>
            </label>
            <p className="text-xs font-semibold leading-5 text-slate-600">
              MedicForest collects practice telemetry such as answers, timing
              and calculator use to provide feedback. Do not enter sensitive medical or third-party personal
              data.
            </p>
          </div>
        )}

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {submitting
            ? "Working..."
            : mode === "signup"
              ? "Create Account"
              : "Log In"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );

  if (presentation === "overlay") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-4 text-[#0b1143] backdrop-blur-[2px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="medicforest-auth-gate-title"
      >
        <div className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-xl focus:outline-none">
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-white/40 bg-white/95 p-4 shadow-xl shadow-slate-950/10">
            <MedicForestBrandLogo className="h-10 w-[146px]" />
            <div>
              <h2 id="medicforest-auth-gate-title" className="text-lg font-black">
                Sign in to MedicForest
              </h2>
              <p className="text-xs font-bold text-slate-500">
                Create an account or log in to continue.
              </p>
            </div>
          </div>
          {authCard}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fbff] px-5 py-10 text-[#0b1143]">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1fr] lg:items-center">
        <div>
          <Link
            href="/medicforest"
            className="mb-8 inline-flex items-center gap-2 text-sm font-black text-slate-600 transition-colors hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to MedicForest
          </Link>

          <div className="flex items-center gap-3">
            <MedicForestBrandLogo className="h-12 w-[175px]" />
          </div>

          <h1 className="mt-10 max-w-xl text-4xl font-black leading-tight sm:text-5xl">
            Create your account to open the UCAT dashboard.
          </h1>
          <p className="mt-4 max-w-xl text-base font-medium leading-7 text-slate-600">
            Your account stores diagnostics, AI feedback, personalised study
            plan tasks and progress snapshots securely in Supabase.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["Diagnose", "Start with a timed UCAT snapshot."],
              ["Feedback", "See what is holding you back."],
              ["Fix", "Turn diagnosis into tasks."],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="text-sm font-black text-blue-600">{title}</p>
                <p className="mt-1 text-xs font-medium leading-5 text-slate-600">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {authCard}
      </div>
    </div>
  );
}

function getLatestPerSectionDiagnostics(
  diagnosticHistory: DashboardDiagnostic[]
): Map<UCATSectionCode, DashboardDiagnostic> {
  const bySection = new Map<UCATSectionCode, DashboardDiagnostic>();
  for (const d of diagnosticHistory) {
    const current = bySection.get(d.section);
    const currentTime = current?.completedAt
      ? new Date(current.completedAt).getTime()
      : 0;
    const nextTime = d.completedAt ? new Date(d.completedAt).getTime() : 0;
    if (!current || nextTime >= currentTime) bySection.set(d.section, d);
  }
  return bySection;
}

function getLatestCompletedFullMockDiagnostics(
  diagnosticHistory: DashboardDiagnostic[]
) {
  const byMockId = new Map<string, DashboardDiagnostic[]>();

  diagnosticHistory.forEach((diagnostic) => {
    if (!isFullMockSectionDiagnostic(diagnostic) || !diagnostic.mockId) return;
    const diagnostics = byMockId.get(diagnostic.mockId) ?? [];
    diagnostics.push(diagnostic);
    byMockId.set(diagnostic.mockId, diagnostics);
  });

  const completedMocks = [...byMockId.values()]
    .map((diagnostics) => {
      const bySection = new Map<UCATSectionCode, DashboardDiagnostic>();

      diagnostics.forEach((diagnostic) => {
        const current = bySection.get(diagnostic.section);
        const currentTime = current?.completedAt
          ? new Date(current.completedAt).getTime()
          : 0;
        const nextTime = diagnostic.completedAt
          ? new Date(diagnostic.completedAt).getTime()
          : 0;

        if (!current || nextTime >= currentTime) {
          bySection.set(diagnostic.section, diagnostic);
        }
      });

      const orderedDiagnostics = FULL_MOCK_REPORT_SECTION_ORDER.flatMap(
        (section) => {
          const diagnostic = bySection.get(section);
          return diagnostic ? [diagnostic] : [];
        }
      );

      const completedAtMs = Math.max(
        ...orderedDiagnostics.map((diagnostic) =>
          diagnostic.completedAt ? new Date(diagnostic.completedAt).getTime() : 0
        )
      );

      return {
        diagnostics: orderedDiagnostics,
        completedAtMs,
      };
    })
    .filter((mock) => mock.diagnostics.length === FULL_MOCK_REPORT_SECTION_ORDER.length)
    .sort((first, second) => second.completedAtMs - first.completedAtMs);

  return completedMocks[0]?.diagnostics ?? [];
}

function DashboardFeedbackPanel({
  latestDiagnostic,
  diagnosticHistory = [],
  practiceStats,
  isPremium,
  className = "",
}: {
  latestDiagnostic: DashboardDiagnostic | null;
  diagnosticHistory?: DashboardDiagnostic[];
  practiceStats: PracticeStats;
  isPremium: boolean;
  className?: string;
}) {
  const perSectionMap = useMemo(
    () => getLatestPerSectionDiagnostics(diagnosticHistory),
    [diagnosticHistory]
  );
  const [selectedSection, setSelectedSection] = useState<UCATSectionCode | null>(
    () => latestDiagnostic?.section ?? null
  );
  const [generatedFullMockFeedback, setGeneratedFullMockFeedback] = useState<
    string | null
  >(null);
  const [fullMockFeedbackRequesting, setFullMockFeedbackRequesting] =
    useState(false);
  const [fullMockFeedbackNotice, setFullMockFeedbackNotice] = useState<
    string | null
  >(null);
  const [fullMockFeedbackError, setFullMockFeedbackError] = useState<
    string | null
  >(null);

  // If a new latest diagnostic arrives (e.g. just completed a mock), sync selected section.
  const prevLatestRef = useRef<string | null>(null);
  useEffect(() => {
    if (latestDiagnostic?.id && latestDiagnostic.id !== prevLatestRef.current) {
      prevLatestRef.current = latestDiagnostic.id;
      setSelectedSection(latestDiagnostic.section);
    }
  }, [latestDiagnostic]);

  const hasDiagnostic = Boolean(latestDiagnostic);
  const activeDiagnostic = selectedSection
    ? (perSectionMap.get(selectedSection) ?? null)
    : latestDiagnostic;
  const completedFullMockDiagnostics = useMemo(
    () => getLatestCompletedFullMockDiagnostics(diagnosticHistory),
    [diagnosticHistory]
  );
  const completedFullMockPrimaryDiagnostic =
    completedFullMockDiagnostics[0] ?? null;
  const completedFullMockFeedbackText =
    generatedFullMockFeedback ??
    completedFullMockDiagnostics.find(
      (diagnostic) =>
        diagnostic.aiFeedbackScope === "full_mock" && diagnostic.aiFeedbackText
    )?.aiFeedbackText ??
    null;
  const completedFullMockReportHref = completedFullMockPrimaryDiagnostic?.mockId
    ? `/medicforest/ucat/report?mock=${encodeURIComponent(completedFullMockPrimaryDiagnostic.mockId)}`
    : completedFullMockPrimaryDiagnostic
      ? `/medicforest/ucat/report?attempt=${encodeURIComponent(completedFullMockPrimaryDiagnostic.id)}`
      : "/medicforest/ucat/report";
  const completedFullMockLabel =
    completedFullMockPrimaryDiagnostic?.mockLabel ?? "Full mock";
  const completedFullMockAccuracy =
    completedFullMockDiagnostics.length > 0
      ? getCombinedDiagnosticAccuracy(completedFullMockDiagnostics)
      : 0;
  const completedFullMockAvgSeconds =
    completedFullMockDiagnostics.length > 0
      ? getCombinedDiagnosticAvgSeconds(completedFullMockDiagnostics)
      : 0;
  const completedFullMockAiStatus = completedFullMockFeedbackText
    ? "Ready"
    : completedFullMockPrimaryDiagnostic?.aiFeedbackStatus === "queued_no_api_key"
      ? "Pending"
      : "Not requested";
  const aiText = activeDiagnostic?.aiFeedbackText ?? null;
  const aiStatusValue = aiText
    ? "Ready"
    : activeDiagnostic
      ? activeDiagnostic.aiFeedbackStatus === "queued_no_api_key"
        ? "Pending"
        : activeDiagnostic.aiFeedbackStatus === "ready"
          ? "Ready"
          : "Not requested"
      : "Pending";
  const diagnosticStatusValue = hasDiagnostic ? "Saved" : "Waiting";
  const diagnosticStatusClass = hasDiagnostic
    ? "bg-emerald-50 text-emerald-700"
    : "bg-blue-50 text-blue-600";
  const aiStatusClass = aiText
    ? "bg-emerald-50 text-emerald-700"
    : "bg-violet-50 text-violet-600";

  const sectionTabs: Array<{ code: UCATSectionCode; label: string }> = [
    { code: "VR", label: "Verbal Reasoning" },
    { code: "DM", label: "Decision Making" },
    { code: "QR", label: "Quantitative Reasoning" },
    { code: "SJT", label: "Situational Judgement" },
  ];
  const issues = activeDiagnostic?.issues ?? [];
  const strengths = activeDiagnostic?.strengths ?? [];
  const fixes = activeDiagnostic?.studyPlanTasks ?? [];
  const feedbackReportHref = activeDiagnostic
    ? `/medicforest/ucat/report?attempt=${encodeURIComponent(activeDiagnostic.id)}`
    : "/medicforest/ucat/report";
  const requestFullMockAiFeedback = async () => {
    if (!completedFullMockPrimaryDiagnostic) return;

    setFullMockFeedbackRequesting(true);
    setFullMockFeedbackNotice(null);
    setFullMockFeedbackError(null);

    try {
      const response = await fetch("/api/ai/diagnostic-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: completedFullMockPrimaryDiagnostic.id,
          attemptIds: completedFullMockDiagnostics.map(
            (diagnostic) => diagnostic.id
          ),
        }),
      });
      const payload = (await response.json()) as {
        feedback?: string;
        error?: string;
      };

      if (!response.ok || !payload.feedback) {
        throw new Error(
          payload.error ?? "Full mock AI feedback could not be generated."
        );
      }

      setGeneratedFullMockFeedback(payload.feedback);
      setFullMockFeedbackNotice(
        "Full mock AI feedback generated and saved across all four section reports."
      );
    } catch (error) {
      setFullMockFeedbackError(
        error instanceof Error
          ? error.message
          : "Full mock AI feedback could not be generated."
      );
    } finally {
      setFullMockFeedbackRequesting(false);
    }
  };

  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wider text-blue-600">
            MedicForest personalised feedback
          </p>
          <h2 className="mt-3 text-xl font-black">
            {hasDiagnostic
              ? "Diagnostic feedback"
              : "Diagnostic feedback pending"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
            {hasDiagnostic
              ? "Issues, strengths and fixes per UCAT section. Each tab shows the latest result for that section."
              : "Complete and mark a diagnostic so MedicForest can turn your timing, accuracy and answer behaviour into AI feedback."}
          </p>
        </div>
        {hasDiagnostic ? (
          <Link
            href={feedbackReportHref}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-black text-white transition-colors hover:bg-blue-700"
          >
            Open full report
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <Link
            href="/medicforest/ucat/diagnostic"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-black text-white transition-colors hover:bg-blue-700"
          >
            Run diagnostic
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["Diagnostic", diagnosticStatusValue, Activity, diagnosticStatusClass],
          [
            "Practice data",
            practiceStats.hasCompletedQuestions ? "Saved" : "Empty",
            BarChart3,
            practiceStats.hasCompletedQuestions
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-500",
          ],
          ["AI feedback", aiStatusValue, MessageSquare, aiStatusClass],
        ].map(([label, value, Icon, iconClass]) => (
          <div
            key={label as string}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <div className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass as string}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-700">
                  {label as string}
                </p>
                <p className="mt-0.5 text-xs font-bold text-slate-500">
                  {value as string}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasDiagnostic ? (
        <>
          {completedFullMockDiagnostics.length ===
            FULL_MOCK_REPORT_SECTION_ORDER.length && (
            <div className="mt-5 rounded-xl border border-violet-100 bg-violet-50/40 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles
                      className="h-4 w-4 text-violet-600"
                      aria-hidden="true"
                    />
                    <h3 className="text-xs font-black uppercase tracking-wide text-violet-700">
                      Full mock AI feedback
                    </h3>
                  </div>
                  <p className="mt-2 text-xs font-bold leading-5 text-slate-600">
                    {completedFullMockLabel} is complete across VR, DM, QR and
                    SJT. Generate one combined AI feedback report instead of
                    splitting feedback across section tabs.
                  </p>
                  <p className="mt-2 text-[11px] font-black text-slate-500">
                    {completedFullMockAccuracy}% overall accuracy ·{" "}
                    {completedFullMockAvgSeconds}s avg/question
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-black ${
                    completedFullMockFeedbackText
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-violet-100 text-violet-700"
                  }`}
                >
                  {completedFullMockAiStatus}
                </span>
              </div>

              {completedFullMockFeedbackText ? (
                <ExpandableAiFeedback
                  text={completedFullMockFeedbackText}
                  previewLength={380}
                  className="mt-3 text-xs font-semibold leading-5 text-slate-800"
                  paragraphClassName="whitespace-pre-wrap"
                  buttonClassName="mt-3 text-xs font-black text-violet-700 hover:text-violet-800"
                />
              ) : (
                <div className="mt-4 flex flex-col gap-3 rounded-lg border border-dashed border-violet-200 bg-white/70 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-semibold leading-5 text-slate-600">
                    Use one AI diagnostic credit to create a single full-mock
                    report from all four saved sections.
                  </p>
                  <button
                    type="button"
                    onClick={() => void requestFullMockAiFeedback()}
                    disabled={fullMockFeedbackRequesting}
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-black text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    {fullMockFeedbackRequesting
                      ? "Generating..."
                      : "Generate full mock AI"}
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Link
                  href={completedFullMockReportHref}
                  className="inline-flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700"
                >
                  Open full mock report
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                {fullMockFeedbackNotice && (
                  <p className="text-xs font-black text-emerald-700">
                    {fullMockFeedbackNotice}
                  </p>
                )}
                {fullMockFeedbackError && (
                  <p className="text-xs font-black text-red-700">
                    {fullMockFeedbackError}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Clickable section tabs - each reflects its own latest diagnostic */}
          <div className="mt-5 flex flex-wrap gap-1 rounded-md border border-slate-200 bg-slate-50 p-1">
            {sectionTabs.map((tab) => {
              const hasSectionData = perSectionMap.has(tab.code);
              const active = selectedSection === tab.code;
              return (
                <button
                  key={tab.code}
                  type="button"
                  onClick={() => setSelectedSection(tab.code)}
                  className={`rounded-sm px-3 py-1 text-xs font-black uppercase tracking-wide transition-colors ${
                    active
                      ? "bg-blue-600 text-white"
                      : hasSectionData
                        ? "text-slate-700 hover:bg-slate-200"
                        : "text-slate-400"
                  }`}
                >
                  {tab.code}
                  {hasSectionData && !active && (
                    <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>

          {activeDiagnostic ? (
            <>
              {/* Per-section AI feedback - collapsible */}
              {activeDiagnostic.aiFeedbackText && (
                <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50/40 p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-violet-600" aria-hidden="true" />
                    <h3 className="text-xs font-black uppercase tracking-wide text-violet-700">
                      {selectedSection} AI feedback
                    </h3>
                    <span className="ml-auto text-[11px] font-semibold text-slate-400">
                      {activeDiagnostic.completedAt
                        ? new Date(activeDiagnostic.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                        : ""}
                    </span>
                  </div>
                  <ExpandableAiFeedback
                    text={activeDiagnostic.aiFeedbackText}
                    previewLength={280}
                    className="mt-2 text-xs font-semibold leading-5 text-slate-800"
                    paragraphClassName="whitespace-pre-wrap"
                    buttonClassName="mt-3 text-xs font-black text-violet-700 hover:text-violet-800"
                  />
                </div>
              )}

              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                <div className="rounded-xl border border-red-100 bg-red-50/40 p-4">
                  <h3 className="text-xs font-black uppercase tracking-wide text-red-700">
                    Issues
                  </h3>
                  {issues.length === 0 ? (
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      No issues detected.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-1.5 text-xs font-bold leading-5 text-slate-800">
                      {issues.slice(0, 5).map((issue) => (
                        <li key={issue.label}>- {issue.label}</li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-4 border-t border-red-100 pt-3 text-[11px] font-semibold leading-4 text-slate-500">
                    For the exact specifics behind each issue, use{" "}
                    <Link
                      href={feedbackReportHref}
                      className="font-black text-red-600 hover:text-red-700"
                    >
                      Open full report
                    </Link>
                    .
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                  <h3 className="text-xs font-black uppercase tracking-wide text-emerald-700">
                    Strengths
                  </h3>
                  {strengths.length === 0 ? (
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      No strengths recorded.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-1.5 text-xs font-bold leading-5 text-slate-800">
                      {strengths.slice(0, 5).map((item) => (
                        <li key={item}>- {item}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                  <h3 className="text-xs font-black uppercase tracking-wide text-blue-700">
                    Fixes
                  </h3>
                  {fixes.length === 0 ? (
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      No fixes generated.
                    </p>
                  ) : !isPremium ? (
                    <div className="mt-2 rounded-lg border border-dashed border-blue-200 bg-white/70 p-3">
                      <LockKeyhole className="h-4 w-4 text-blue-600" aria-hidden="true" />
                      <p className="mt-2 text-xs font-black text-slate-800">
                        Personalised fixes are Premium.
                      </p>
                    </div>
                  ) : (
                    <ol className="mt-2 space-y-1.5 text-xs font-bold leading-5 text-slate-800">
                      {fixes.slice(0, 4).map((task, index) => (
                        <li key={task.id ?? index}>
                          {index + 1}. {task.fix}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>

              {/* Sections not yet diagnosed for this section */}
              {!activeDiagnostic.aiFeedbackText && (
                <p className="mt-3 text-xs font-semibold text-slate-500">
                  <Link
                    href={feedbackReportHref}
                    className="font-black text-violet-600 hover:text-violet-700"
                  >
                    Generate AI feedback
                  </Link>{" "}
                  for a written analysis with specific fixes for {selectedSection}.
                </p>
              )}
            </>
          ) : (
            <div className="mt-4 flex items-center justify-between rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-xs font-bold text-slate-500">
              <span>{selectedSection} - not yet diagnosed</span>
              <Link
                href="/medicforest/ucat/mocks/full"
                className="text-blue-600 hover:text-blue-700"
              >
                Start mock
              </Link>
            </div>
          )}

          {/* Remaining undiagnosed sections */}
          {sectionTabs
            .filter((tab) => tab.code !== selectedSection && !perSectionMap.has(tab.code))
            .map((tab) => (
              <div
                key={tab.code}
                className="mt-2 flex items-center justify-between rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500"
              >
                <span>{tab.code} - {tab.label} not yet diagnosed</span>
                <Link
                  href="/medicforest/ucat/mocks/full"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Start mock
                </Link>
              </div>
            ))}
        </>
      ) : (
        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-black text-blue-950">
                Section observations
              </h3>
              <p className="mt-1 text-xs font-bold leading-5 text-blue-700">
                Timing bottlenecks, changed-answer patterns and weak sections will appear here after a marked diagnostic.
              </p>
            </div>
            <Link
              href="/medicforest/ucat/report"
              className="inline-flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700"
            >
              Open full report
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

function MissingSupabaseConfig() {
  return (
    <div className="min-h-screen bg-[#f8fbff] px-5 py-10 text-[#0b1143]">
      <div className="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
        <Link
          href="/medicforest"
          className="mb-5 inline-flex items-center gap-2 text-sm font-black text-slate-600 transition-colors hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to MedicForest
        </Link>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <LockKeyhole className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-black">
          Add your Supabase keys to enable account creation.
        </h1>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
          Add these to `.env.local`, then restart the dev server:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs font-bold leading-6 text-slate-100">
{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...`}
        </pre>
      </div>
    </div>
  );
}

function UCATDashboard({
  view = "dashboard",
  initialReportId = null,
  initialMockId = null,
}: {
  view?: DashboardView;
  initialReportId?: string | null;
  initialMockId?: string | null;
}) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<MedicForestProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [areaSwitcherOpen, setAreaSwitcherOpen] = useState(false);
  const [progressSnapshotView, setProgressSnapshotView] =
    useState<DashboardProgressSnapshotView>("accuracy");
  const [completedDashboardTaskIds, setCompletedDashboardTaskIds] = useState<
    Set<string>
  >(() => new Set());
  const [removedDashboardTaskIds, setRemovedDashboardTaskIds] = useState<
    Set<string>
  >(() => new Set());
  const [practiceStats, setPracticeStats] = useState<PracticeStats>(() =>
    createEmptyPracticeStats()
  );
  const [recentPracticeSets, setRecentPracticeSets] = useState<
    RecentPracticeSet[]
  >([]);
  const [removingPracticeSetId, setRemovingPracticeSetId] = useState<string | null>(
    null
  );
  const [removingAllPracticeSets, setRemovingAllPracticeSets] = useState(false);
  const [practiceSetRemoveError, setPracticeSetRemoveError] = useState<
    string | null
  >(null);
  const [latestDiagnostic, setLatestDiagnostic] =
    useState<DashboardDiagnostic | null>(null);
  const [diagnosticHistory, setDiagnosticHistory] = useState<
    DashboardDiagnostic[]
  >([]);
  const supabaseReady = hasSupabaseConfig();
  const supabase = useMemo(
    () => (supabaseReady ? createSupabaseClient() : null),
    [supabaseReady]
  );
  const authGateActive = !loading && supabaseReady && (!session || !user);
  const pageMeta = dashboardPageMeta[view];
  const dashboardTaskStorageKey = latestDiagnostic?.completedAt
    ? `medicforest-dashboard-tasks:${latestDiagnostic.completedAt}`
    : "medicforest-dashboard-tasks:empty";
  const dashboardRemovedTaskStorageKey = `${dashboardTaskStorageKey}:removed`;

  useEffect(() => {
    if (!authGateActive) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [authGateActive]);

  useEffect(() => {
    const loadTaskState = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(dashboardTaskStorageKey);
        const taskIds = saved ? (JSON.parse(saved) as unknown) : [];
        setCompletedDashboardTaskIds(
          new Set(
            Array.isArray(taskIds)
              ? taskIds.filter((id) => typeof id === "string")
              : []
          )
        );
      } catch {
        setCompletedDashboardTaskIds(new Set());
      }

      try {
        const saved = window.localStorage.getItem(dashboardRemovedTaskStorageKey);
        const taskIds = saved ? (JSON.parse(saved) as unknown) : [];
        setRemovedDashboardTaskIds(
          new Set(
            Array.isArray(taskIds)
              ? taskIds.filter((id) => typeof id === "string")
              : []
          )
        );
      } catch {
        setRemovedDashboardTaskIds(new Set());
      }
    }, 0);

    return () => window.clearTimeout(loadTaskState);
  }, [dashboardTaskStorageKey, dashboardRemovedTaskStorageKey]);

  const toggleDashboardTask = useCallback(
    (taskId: string) => {
      setCompletedDashboardTaskIds((current) => {
        const next = new Set(current);
        if (next.has(taskId)) {
          next.delete(taskId);
        } else {
          next.add(taskId);
        }

        try {
          window.localStorage.setItem(
            dashboardTaskStorageKey,
            JSON.stringify(Array.from(next))
          );
        } catch {
          // Ignore private browsing or storage quota failures.
        }

        return next;
      });
    },
    [dashboardTaskStorageKey]
  );

  const removeDashboardTask = useCallback(
    (taskId: string) => {
      setRemovedDashboardTaskIds((current) => {
        const next = new Set(current);
        next.add(taskId);

        try {
          window.localStorage.setItem(
            dashboardRemovedTaskStorageKey,
            JSON.stringify(Array.from(next))
          );
        } catch {
          // Ignore private browsing or storage quota failures.
        }

        return next;
      });

      setCompletedDashboardTaskIds((current) => {
        const next = new Set(current);
        next.add(taskId);

        try {
          window.localStorage.setItem(
            dashboardTaskStorageKey,
            JSON.stringify(Array.from(next))
          );
        } catch {
          // Ignore private browsing or storage quota failures.
        }

        return next;
      });
    },
    [dashboardRemovedTaskStorageKey, dashboardTaskStorageKey]
  );

  const removePracticeSet = useCallback(
    async (set: RecentPracticeSet) => {
      if (!supabase || !user) {
        setPracticeSetRemoveError("Sign in again before removing saved sets.");
        return;
      }

      const confirmed = window.confirm(
        set.isIncomplete
          ? "Remove this saved incomplete set? You will not be able to continue it."
          : "Remove this marked practice set? This deletes it from your recent practice and saved progress."
      );

      if (!confirmed) return;

      setRemovingPracticeSetId(set.id);
      setPracticeSetRemoveError(null);

      const { error } = await supabase
        .from("practice_sessions")
        .delete()
        .eq("id", set.id)
        .eq("user_id", user.id)
        .eq("source", "question_bank");

      if (error) {
        setPracticeSetRemoveError(
          "Could not remove that set. Please try again in a moment."
        );
        setRemovingPracticeSetId(null);
        return;
      }

      setRecentPracticeSets((current) =>
        current.filter((practiceSet) => practiceSet.id !== set.id)
      );

      const { data, error: statsError } = await supabase
        .from("practice_question_attempts")
        .select("question_id,section,answered,correct,total_seconds,created_at,metadata")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1500);

      if (statsError) {
        setPracticeSetRemoveError(
          "Removed the set. Progress totals will refresh after reload."
        );
      } else {
        setPracticeStats(buildPracticeStats((data ?? []) as PracticeAttemptRow[]));
      }

      setRemovingPracticeSetId(null);
    },
    [supabase, user]
  );

  const removeAllPracticeSets = useCallback(
    async (setsToRemove: RecentPracticeSet[]) => {
      if (!supabase || !user) {
        setPracticeSetRemoveError("Sign in again before removing saved sets.");
        return;
      }

      const targetIds = Array.from(
        new Set(setsToRemove.map((set) => set.id).filter(Boolean))
      );
      if (targetIds.length === 0) return;

      const confirmed = window.confirm(
        `Remove all ${targetIds.length} saved practice set${
          targetIds.length === 1 ? "" : "s"
        }? This deletes them from your recent practice and saved progress.`
      );

      if (!confirmed) return;

      setRemovingAllPracticeSets(true);
      setPracticeSetRemoveError(null);

      const { error } = await supabase
        .from("practice_sessions")
        .delete()
        .eq("user_id", user.id)
        .eq("source", "question_bank")
        .in("id", targetIds);

      if (error) {
        setPracticeSetRemoveError(
          "Could not remove all sets. Please try again in a moment."
        );
        setRemovingAllPracticeSets(false);
        return;
      }

      const targetIdSet = new Set(targetIds);
      setRecentPracticeSets((current) =>
        current.filter((practiceSet) => !targetIdSet.has(practiceSet.id))
      );

      const { data, error: statsError } = await supabase
        .from("practice_question_attempts")
        .select("question_id,section,answered,correct,total_seconds,created_at,metadata")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1500);

      if (statsError) {
        setPracticeSetRemoveError(
          "Removed the sets. Progress totals will refresh after reload."
        );
      } else {
        setPracticeStats(buildPracticeStats((data ?? []) as PracticeAttemptRow[]));
      }

      setRemovingAllPracticeSets(false);
    },
    [supabase, user]
  );

  useEffect(() => {
    function resetCheckoutState() {
      setCheckoutLoading(false);
    }

    function resetWhenVisible() {
      if (document.visibilityState === "visible") {
        resetCheckoutState();
      }
    }

    window.addEventListener("pageshow", resetCheckoutState);
    window.addEventListener("focus", resetCheckoutState);
    document.addEventListener("visibilitychange", resetWhenVisible);

    return () => {
      window.removeEventListener("pageshow", resetCheckoutState);
      window.removeEventListener("focus", resetCheckoutState);
      document.removeEventListener("visibilitychange", resetWhenVisible);
    };
  }, []);

  useEffect(() => {
    if (!supabase) {
      const stopLoading = window.setTimeout(() => setLoading(false), 0);
      return () => window.clearTimeout(stopLoading);
    }

    const supabaseClient = supabase;
    let mounted = true;
    let authRevision = 0;
    let loadedUserId: string | null | undefined;
    let pendingLoad: Promise<void> | null = null;
    let loadGeneration = 0;

    async function loadProfile(nextUser: User, isCurrent: () => boolean) {
      const { data } = await supabaseClient
        .from("profiles")
        .select("full_name,current_plan,diagnostic_credits,ai_diagnostic_last_used_at,stripe_customer_id,stripe_subscription_id,subscription_status")
        .eq("id", nextUser.id)
        .maybeSingle();

      if (isCurrent()) {
        setProfile((data as MedicForestProfile | null) ?? null);
      }
    }

    async function loadPracticeStats(nextUser: User, isCurrent: () => boolean) {
      const { data, error } = await supabaseClient
        .from("practice_question_attempts")
        .select("question_id,section,answered,correct,total_seconds,created_at,metadata")
        .eq("user_id", nextUser.id)
        .order("created_at", { ascending: false })
        .limit(1500);

      if (!isCurrent()) return;

      if (error) {
        setPracticeStats(createEmptyPracticeStats());
        return;
      }

      setPracticeStats(buildPracticeStats((data ?? []) as PracticeAttemptRow[]));
    }

    async function loadRecentPracticeSets(nextUser: User, isCurrent: () => boolean) {
      const { data, error } = await supabaseClient
        .from("practice_sessions")
        .select(
          "id,section,source,total_questions,answered_questions,correct_questions,accuracy,summary,completed_at,created_at"
        )
        .eq("user_id", nextUser.id)
        .eq("source", "question_bank")
        .order("completed_at", { ascending: false })
        .limit(30);

      if (!isCurrent()) return;

      if (error) {
        setRecentPracticeSets([]);
        return;
      }

      const sets = ((data ?? []) as PracticeSessionListRow[])
        .map(normaliseRecentPracticeSet)
        .filter((set): set is RecentPracticeSet => Boolean(set))
        .sort((first, second) => {
          if (first.isIncomplete !== second.isIncomplete) {
            return first.isIncomplete ? -1 : 1;
          }

          return (
            new Date(second.completedAt ?? 0).getTime() -
            new Date(first.completedAt ?? 0).getTime()
          );
        });

      setRecentPracticeSets(sets);
    }

    async function loadDiagnosticHistory(nextUser: User, isCurrent: () => boolean) {
      const requestedReportId = view === "report" ? initialReportId : null;
      const diagnosticSelect =
        "id,accuracy,completed_at,ai_feedback,ai_feedback_status,metadata,source";
      const { data, error } = await supabaseClient
        .from("diagnostic_attempts")
        .select(diagnosticSelect)
        .eq("user_id", nextUser.id)
        .order("completed_at", { ascending: false })
        .limit(100);

      if (!isCurrent()) return;
      if (error || !data) {
        setLatestDiagnostic(null);
        setDiagnosticHistory([]);
        return;
      }

      let diagnosticRows = data as DiagnosticAttemptRow[];

      if (
        requestedReportId &&
        !diagnosticRows.some((row) => row.id === requestedReportId)
      ) {
        const { data: requestedReport, error: requestedReportError } =
          await supabaseClient
            .from("diagnostic_attempts")
            .select(diagnosticSelect)
            .eq("user_id", nextUser.id)
            .eq("id", requestedReportId)
            .maybeSingle();

        if (!isCurrent()) return;

        if (!requestedReportError && requestedReport) {
          diagnosticRows = [
            requestedReport as DiagnosticAttemptRow,
            ...diagnosticRows,
          ];
        }
      }

      const seenReportIds = new Set<string>();
      const history = diagnosticRows
        .map((row, index) => normaliseDashboardDiagnostic(row, index))
        .filter((report) => {
          if (seenReportIds.has(report.id)) return false;
          seenReportIds.add(report.id);
          return true;
        })
        .sort(
          (first, second) =>
            new Date(second.completedAt ?? 0).getTime() -
            new Date(first.completedAt ?? 0).getTime()
        );

      setDiagnosticHistory(history);
      setLatestDiagnostic(history[0] ?? null);
    }

    async function syncCheckoutIfNeeded(nextUser: User, isCurrent: () => boolean) {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");

      if (params.get("checkout") !== "success" || !sessionId) return;

      try {
        const response = await fetch("/api/stripe/sync-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(data.error ?? "Could not sync checkout.");
        }

        if (!isCurrent()) return;
        await loadProfile(nextUser, isCurrent);
        if (!isCurrent()) return;
        window.history.replaceState(null, "", window.location.pathname);
      } catch (error) {
        if (isCurrent()) {
          setCheckoutError(
            error instanceof Error
              ? `Payment succeeded, but plan sync failed: ${error.message}`
              : "Payment succeeded, but plan sync failed."
          );
        }
      }
    }

    async function exchangeEmailConfirmationCode() {
      const params = new URLSearchParams(window.location.search);
      const authCode = params.get("code");

      if (!authCode) return;

      const { error } =
        await supabaseClient.auth.exchangeCodeForSession(authCode);

      if (!mounted) return;

      if (error) {
        setAuthError(
          "That confirmation link could not be used. Please log in with your email and password."
        );
        return;
      }

      params.delete("code");
      const nextQuery = params.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${
          window.location.hash
        }`
      );
      setAuthMessage("Email confirmed. Opening your dashboard...");
    }

    function loadAccount(nextSession: Session | null, forceRefresh = false) {
      const nextUser = nextSession?.user ?? null;
      setSession(nextSession);
      setUser(nextUser);
      if (!forceRefresh && loadedUserId === (nextUser?.id ?? null)) {
        return pendingLoad ?? Promise.resolve();
      }

      const generation = ++loadGeneration;
      const isCurrent = () => mounted && generation === loadGeneration;
      loadedUserId = nextUser?.id ?? null;
      // Clear the previous account before any new account queries can settle.
      setProfile(null);
      setPracticeStats(createEmptyPracticeStats());
      setRecentPracticeSets([]);
      setLatestDiagnostic(null);
      setDiagnosticHistory([]);
      if (!nextUser) {
        setLoading(false);
        pendingLoad = null;
        return Promise.resolve();
      }

      setLoading(true);
      pendingLoad = (async () => {
        const results = await Promise.allSettled([
          loadProfile(nextUser, isCurrent),
          loadPracticeStats(nextUser, isCurrent),
          loadRecentPracticeSets(nextUser, isCurrent),
          loadDiagnosticHistory(nextUser, isCurrent),
        ]);
        if (!isCurrent()) return;
        if (results.some((result) => result.status === "rejected")) {
          setAuthError("Some account data could not be loaded. Please refresh to try again.");
        }
        await syncCheckoutIfNeeded(nextUser, isCurrent);
        if (isCurrent()) setLoading(false);
      })();
      return pendingLoad;
    }

    async function loadSession() {
      try {
        await exchangeEmailConfirmationCode();
        const revision = authRevision;
        const {
          data: { session: currentSession },
        } = await supabaseClient.auth.getSession();
        if (!mounted || revision !== authRevision) return;
        await loadAccount(currentSession);
      } catch {
        if (!mounted) return;
        setAuthError("Your account could not be loaded. Please refresh to try again.");
        setLoading(false);
      }
    }

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, nextSession) => {
      // getSession below handles the initial account load once.
      if (!mounted || event === "INITIAL_SESSION") return;
      authRevision += 1;
      void loadAccount(nextSession, event === "USER_UPDATED");
    });

    void loadSession();

    return () => {
      mounted = false;
      loadGeneration += 1;
      subscription.unsubscribe();
    };
  }, [initialReportId, supabase, view]);

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;

    setSubmitting(true);
    setAuthError(null);
    setAuthMessage(null);

    try {
      const trimmedEmail = email.trim().toLowerCase();

      if (!trimmedEmail) {
        setAuthError("Add your email address before continuing.");
        return;
      }

      if (authMode === "signup") {
        if (!legalAccepted) {
          setAuthError(
            "Please agree to the Terms and confirm you have read the Privacy Policy before creating an account."
          );
          return;
        }

        const trimmedName = fullName.trim();
        if (!trimmedName) {
          setAuthError("Add your full name before creating an account.");
          return;
        }

        const acceptedAt = new Date().toISOString();
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              full_name: trimmedName,
              legal_accepted_at: acceptedAt,
              terms_version: "2026-05-07",
              privacy_version: "2026-05-07",
              medicforest_disclaimer_version: "2026-05-07",
            },
            emailRedirectTo: `${window.location.origin}/medicforest/ucat/dashboard`,
          },
        });

        if (error) throw error;

        if (data.session) {
          setSession(data.session);
          setUser(data.user);
          setAuthMessage("Account created. Opening your dashboard...");
        } else {
          setAuthMessage(
            "Check your email to confirm your account. The dashboard opens automatically after confirmation."
          );
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) throw error;

        setSession(data.session);
        setUser(data.user);
        setAuthMessage("Logged in.");
      }
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setPracticeStats(createEmptyPracticeStats());
    setRecentPracticeSets([]);
    setLatestDiagnostic(null);
    setDiagnosticHistory([]);
  };

  const handleUpgrade = async () => {
    setCheckoutError(null);
    router.push("/medicforest/pricing");
  };

  const handleSubscriptionAction = async () => {
    if (profile?.current_plan !== "premium") {
      await handleUpgrade();
      return;
    }

    if (!hasStripeCustomer) {
      router.push("/medicforest/pricing");
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
      });
      const data = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Could not open billing portal.");
      }

      window.location.assign(data.url);
      window.setTimeout(() => setCheckoutLoading(false), 8000);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Could not open billing portal."
      );
      setCheckoutLoading(false);
    }
  };

  const handleProfileUpdate = async (nextDisplayName: string) => {
    if (!supabase || !user) {
      throw new Error("Sign in again before updating your profile.");
    }

    const trimmedName = nextDisplayName.trim();
    if (!trimmedName) {
      throw new Error("Add a display name before saving.");
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({ full_name: trimmedName })
      .eq("id", user.id)
      .select("full_name,current_plan,diagnostic_credits,ai_diagnostic_last_used_at,stripe_customer_id,stripe_subscription_id,subscription_status")
      .maybeSingle();

    if (error) throw error;

    const updatedProfile = data as MedicForestProfile | null;
    setProfile((current) => ({
      full_name: updatedProfile?.full_name ?? trimmedName,
      current_plan:
        updatedProfile?.current_plan ?? current?.current_plan ?? "free",
      diagnostic_credits:
        updatedProfile?.diagnostic_credits ??
        current?.diagnostic_credits ??
        1,
      ai_diagnostic_last_used_at:
        updatedProfile?.ai_diagnostic_last_used_at ??
        current?.ai_diagnostic_last_used_at ??
        null,
      stripe_customer_id:
        updatedProfile?.stripe_customer_id ?? current?.stripe_customer_id ?? null,
      stripe_subscription_id:
        updatedProfile?.stripe_subscription_id ??
        current?.stripe_subscription_id ??
        null,
      subscription_status:
        updatedProfile?.subscription_status ??
        current?.subscription_status ??
        null,
    }));
  };

  if (!supabaseReady) {
    return <MissingSupabaseConfig />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fbff] text-[#0b1143]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const isAuthenticated = Boolean(session && user);
  const displayName = isAuthenticated ? getDisplayName(user, profile) : "Guest";
  const firstName = isAuthenticated ? getFirstName(user, profile) : "Guest";
  const plan =
    isAuthenticated && profile?.current_plan === "premium" ? "Premium" : "Free";
  const hasStripeCustomer =
    typeof profile?.stripe_customer_id === "string" &&
    profile.stripe_customer_id.trim().length > 0 &&
    typeof profile?.stripe_subscription_id === "string" &&
    profile.stripe_subscription_id.trim().length > 0 &&
    profile.subscription_status !== "manual";
  const userEmail = user?.email ?? "";
  const diagnosticCredits =
    typeof profile?.diagnostic_credits === "number"
      ? profile.diagnostic_credits
      : 1;
  const aiDiagnosticLastUsedAt =
    typeof profile?.ai_diagnostic_last_used_at === "string"
      ? profile.ai_diagnostic_last_used_at
      : null;
  const dashboardSectionProgressScores = getSectionScores(practiceStats);
  const dashboardSectionAccuracyScores = getSectionAccuracyScores(practiceStats);
  const dashboardSectionScores =
    progressSnapshotView === "accuracy"
      ? dashboardSectionAccuracyScores
      : dashboardSectionProgressScores;
  const dashboardStudyPlanTasks = getDiagnosticStudyPlanTasks(latestDiagnostic);
  const dashboardDiagnosticFeaturesUnlocked =
    plan === "Premium" || isFreeQrDiagnostic(latestDiagnostic);
  const dashboardFeedbackExpanded = Boolean(latestDiagnostic?.aiFeedbackText);
  const visibleDashboardStudyPlanTasks = dashboardStudyPlanTasks.filter(
    (task) => !removedDashboardTaskIds.has(task.id)
  );
  const completedDashboardTaskCount = visibleDashboardStudyPlanTasks.filter((task) =>
    completedDashboardTaskIds.has(task.id)
  ).length;
  const dashboardTaskBadgeText =
    dashboardStudyPlanTasks.length === 0
      ? "Awaiting study plan"
      : visibleDashboardStudyPlanTasks.length === 0
        ? "Tasks cleared"
        : `${completedDashboardTaskCount}/${visibleDashboardStudyPlanTasks.length} done`;
  const progressSummaryText = practiceStats.hasCompletedQuestions
    ? "From saved question attempts"
    : "No completed questions yet";
  const bankProgressPercent =
    practiceStats.totalAvailable > 0
      ? Math.round((practiceStats.totalCompleted / practiceStats.totalAvailable) * 100)
      : 0;
  const headerBackHref =
    view === "dashboard" ? "/medicforest" : "/medicforest/ucat/dashboard";
  const headerBackLabel =
    view === "dashboard" ? "Back to MedicForest" : "Back to dashboard";
  const accountInitial = displayName.charAt(0).toUpperCase();
  const accountSupportHref = `mailto:medwithrish@gmail.com?subject=${encodeURIComponent(
    "MedicForest account support"
  )}`;

  return (
    <div className="medicforest-dashboard-compact min-h-screen bg-[#eef1f3] text-[#071923]">
      <div
        className="grid min-h-screen lg:grid-cols-[200px_1fr]"
        aria-hidden={authGateActive}
        inert={authGateActive ? true : undefined}
      >
        <aside className="hidden border-r border-[#093f3a] bg-[#042724] px-3 py-5 text-slate-100 lg:block">
          <MedicForestAreaSwitcher
            open={areaSwitcherOpen}
            onOpen={() => {
              setAreaSwitcherOpen(true);
              setAccountMenuOpen(false);
            }}
            onToggle={() => {
              setAreaSwitcherOpen((current) => !current);
              setAccountMenuOpen(false);
            }}
            onClose={() => setAreaSwitcherOpen(false)}
            menuId="medicforest-area-switcher"
          />

          <nav className="mt-8 space-y-1.5">
            {dashboardNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.view === view ||
                (item.view === "diagnostic" && view === "mock-diagnostic");
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[13px] font-semibold transition-colors ${
                    isActive
                      ? "bg-[#123f3b] text-[#89e4df] shadow-sm"
                      : "text-slate-300 hover:bg-[#0b3431] hover:text-white"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8">
            <p className="px-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              Community
            </p>
            <div className="mt-2.5 space-y-1.5">
              <Link
                href="/medicforest/ucat/groups"
                className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[13px] font-semibold text-slate-300 transition-colors hover:bg-[#0b3431] hover:text-white"
              >
                <Users className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                Groups
              </Link>
              <Link
                href="/resources"
                className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[13px] font-semibold text-slate-300 transition-colors hover:bg-[#0b3431] hover:text-white"
              >
                <BookOpen className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                Guides
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <p className="px-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              Skills Trainers
            </p>
            <Link
              href="/medicforest/ucat/skills-trainers"
              className={`mt-2.5 flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[13px] font-semibold transition-colors ${
                view === "skills-trainers"
                  ? "bg-[#123f3b] text-[#89e4df] shadow-sm"
                  : "text-slate-300 hover:bg-[#0b3431] hover:text-white"
              }`}
            >
              <Zap className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
              Calculator + Flags
            </Link>
          </div>

          {plan !== "Premium" && (
            <div className="mt-7 rounded-xl border border-white/10 bg-[#082f2c] p-3.5 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#123f3b] text-[#8be5df]">
                <BadgeCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="mt-3 text-xs font-bold text-white">
                Unlock Premium diagnostics
              </h2>
              <p className="mt-2 text-xs font-medium leading-5 text-slate-300">
                Go Premium for diagnostic mocks, deeper analytics and a daily
                AI diagnostic credit.
              </p>
              <Link
                href="/medicforest/pricing"
                className="mt-4 flex h-9 w-full items-center justify-center rounded-lg bg-[#1aa0a5] text-xs font-bold text-white transition-colors hover:bg-[#14888c]"
              >
                View Plans
              </Link>
              {checkoutError && (
                <p className="mt-3 text-xs font-bold leading-5 text-red-600">
                  {checkoutError}
                </p>
              )}
            </div>
          )}

          <div className="mt-5 rounded-xl border border-white/10 bg-[#082f2c] p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-400">Current plan</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-bold text-white">{plan}</span>
              {plan === "Premium" ? (
                <button
                  type="button"
                  onClick={handleSubscriptionAction}
                  className="text-sm font-bold text-[#89e4df] hover:text-white"
                >
                  {hasStripeCustomer ? "Manage" : "Manual access"}
                </button>
              ) : (
                <Link
                  href="/medicforest/pricing"
                  className="text-sm font-bold text-[#89e4df] hover:text-white"
                >
                  View plans
                </Link>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-white/10 bg-[#082f2c] p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Legal
            </p>
            <div className="mt-3 space-y-2 text-xs font-bold">
              <Link
                href="/terms-and-conditions"
                className="block text-slate-300 hover:text-white"
              >
                Terms and Conditions
              </Link>
              <Link
                href="/privacy-policy"
                className="block text-slate-300 hover:text-white"
              >
                Privacy Policy
              </Link>
              <Link
                href="/medicforest-disclaimer"
                className="block text-slate-300 hover:text-white"
              >
                AI/Data Disclaimer
              </Link>
            </div>
          </div>
        </aside>

        <main className="medicforest-dashboard-main min-w-0">
          <header className="border-b border-slate-200 bg-white px-6 py-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen((current) => !current);
                  setAccountMenuOpen(false);
                  setAreaSwitcherOpen(false);
                }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 lg:hidden"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="medicforest-mobile-menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
              <Link
                href={headerBackHref}
                aria-label={headerBackLabel}
                title={headerBackLabel}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </Link>

              {(view === "diagnostic" || view === "mock-diagnostic") && (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-blue-600">
                  <Activity className="h-7 w-7" aria-hidden="true" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black">
                  {view === "dashboard"
                    ? `${getGreeting()}, ${firstName}`
                    : pageMeta.title}
                </h1>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  {pageMeta.subtitle}
                </p>
              </div>
            </div>
              <div className="flex items-center gap-5">
              <button
                type="button"
                aria-label="Notifications"
                className="rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-blue-600"
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
              </button>
              <div className="h-8 w-px bg-slate-200" />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen((current) => !current);
                    setMobileMenuOpen(false);
                    setAreaSwitcherOpen(false);
                  }}
                  className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-1 transition-colors hover:border-blue-100 hover:bg-blue-50"
                  aria-expanded={accountMenuOpen}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-sm font-black text-blue-600">
                    {accountInitial}
                  </div>
                  <span className="hidden text-left sm:block">
                    <span className="block text-sm font-black leading-4">
                      {firstName}
                    </span>
                    <span className="mt-1 block text-[11px] font-black uppercase tracking-wide text-slate-400">
                      {plan} plan
                    </span>
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-500" aria-hidden="true" />
                </button>
                {accountMenuOpen && (
                  <div className="absolute right-0 z-20 mt-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                    <div className="bg-gradient-to-br from-blue-600 to-slate-950 p-4 text-white">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-lg font-black ring-1 ring-white/20">
                          {accountInitial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-black">
                            {displayName}
                          </p>
                          <p className="mt-1 truncate text-xs font-semibold text-blue-100">
                            {userEmail}
                          </p>
                          <span className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wide ring-1 ring-white/20">
                            {plan} plan
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/medicforest/account"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                      >
                        <UserRound className="h-4 w-4" aria-hidden="true" />
                        Account settings
                      </Link>
                      {plan === "Premium" ? (
                        hasStripeCustomer ? (
                          <button
                            type="button"
                            onClick={() => {
                              setAccountMenuOpen(false);
                              void handleSubscriptionAction();
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-black text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                          >
                            <Sparkles className="h-4 w-4" aria-hidden="true" />
                            Manage subscription
                          </button>
                        ) : (
                          <Link
                            href="/medicforest/account"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                          >
                            <Sparkles className="h-4 w-4" aria-hidden="true" />
                            Manual Premium access
                          </Link>
                        )
                      ) : (
                        <Link
                          href="/medicforest/pricing"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                        >
                          <Sparkles className="h-4 w-4" aria-hidden="true" />
                          View pricing
                        </Link>
                      )}
                      <Link
                        href="/medicforest/ucat/report"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                      >
                        <Bookmark className="h-4 w-4" aria-hidden="true" />
                        Open reports
                      </Link>
                      <Link
                        href="/medicforest/ucat/question-bank"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                      >
                        <Target className="h-4 w-4" aria-hidden="true" />
                        Open question bank
                      </Link>
                      <a
                        href={accountSupportHref}
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-black text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                      >
                        <Mail className="h-4 w-4" aria-hidden="true" />
                        Contact support
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          void handleLogout();
                        }}
                        className="mt-1 flex w-full items-center gap-3 rounded-lg border-t border-slate-100 px-3 py-2.5 text-left text-sm font-black text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-red-600"
                aria-label="Log out"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
              </button>
              </div>
            </div>

            {mobileMenuOpen && (
              <div
                id="medicforest-mobile-menu"
                className="mt-4 w-full rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:hidden"
              >
                <div className="mb-3 rounded-xl bg-slate-50 p-2">
                  <p className="px-3 pb-2 text-xs font-black uppercase tracking-wide text-slate-400">
                    Areas
                  </p>
                  <div className="grid gap-1">
                    {medicforestAreaSwitchItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-black transition-colors ${
                            item.current
                              ? "bg-white text-blue-600 shadow-sm"
                              : "text-slate-700 hover:bg-white hover:text-blue-600"
                          }`}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <nav className="grid gap-2" aria-label="Mobile MedicForest menu">
                  {dashboardNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.view === view ||
                      (item.view === "diagnostic" && view === "mock-diagnostic");

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-black transition-colors ${
                          isActive
                            ? "bg-indigo-50 text-blue-600"
                            : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                        }`}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                        {item.label}
                      </Link>
                    );
                  })}
                  <Link
                    href="/medicforest/ucat/skills-trainers"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-black transition-colors ${
                      view === "skills-trainers"
                        ? "bg-indigo-50 text-blue-600"
                        : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                    }`}
                  >
                    <Zap className="h-5 w-5" aria-hidden="true" />
                    Calculator + Flags
                  </Link>
                </nav>

                <div className="mt-3 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between gap-3 px-1">
                    <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Current plan
                    </span>
                    <span className="text-sm font-black">{plan}</span>
                  </div>
                  {plan === "Premium" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        void handleSubscriptionAction();
                      }}
                      disabled={checkoutLoading}
                      className="mt-3 flex h-10 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-black text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                      {hasStripeCustomer
                        ? checkoutLoading
                          ? "Opening..."
                          : "Manage Billing"
                        : "Premium active"}
                    </button>
                  ) : (
                    <Link
                      href="/medicforest/pricing"
                      onClick={() => setMobileMenuOpen(false)}
                      className="mt-3 flex h-10 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-black text-white transition-colors hover:bg-blue-700"
                    >
                      View Plans
                    </Link>
                  )}
                </div>

                <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 text-xs font-bold">
                  <Link
                    href="/terms-and-conditions"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                  >
                    Terms and Conditions
                  </Link>
                  <Link
                    href="/privacy-policy"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/medicforest-disclaimer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                  >
                    AI/Data Disclaimer
                  </Link>
                </div>
              </div>
            )}
          </header>

          {view === "dashboard" ? (
          <div className="grid gap-5 px-6 py-5 lg:grid-cols-[1.1fr_1fr] lg:px-8">
            <DashboardFeedbackPanel
              latestDiagnostic={latestDiagnostic}
              diagnosticHistory={diagnosticHistory}
              practiceStats={practiceStats}
              isPremium={dashboardDiagnosticFeaturesUnlocked}
              className={dashboardFeedbackExpanded ? "lg:col-span-2" : ""}
            />

            <ClientPremiumGate
              isPremium={dashboardDiagnosticFeaturesUnlocked}
              checkoutLoading={checkoutLoading}
              onUpgrade={handleSubscriptionAction}
              title="Unlock your personalised study plan"
              description="Premium turns saved diagnostic fixes into tasks on your dashboard."
              featureLabel="Premium study plan"
              className={dashboardFeedbackExpanded ? "lg:col-span-2" : "self-start"}
            >
            <section className={`self-start rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${dashboardFeedbackExpanded ? "lg:col-span-2" : ""}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wide">
                    Personalised Study Plan/Tasks
                  </h2>
                  <p className="mt-2 text-xs font-bold leading-5 text-[#2b414d]">
                    Every saved fix from your latest diagnostic becomes a task here.
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-black ${
                    dashboardStudyPlanTasks.length > 0
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {dashboardTaskBadgeText}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {dashboardStudyPlanTasks.length === 0 ? (
                  <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-blue-50 p-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        ["1", "Diagnostic", "Find the main score blocker"],
                        ["2", "Fixes", "Turn it into targeted tasks"],
                        ["3", "Improve", "Practise, review and track gains"],
                      ].map(([step, title, text]) => (
                        <div
                          key={title}
                          className="rounded-lg border border-white/80 bg-white/80 p-3 shadow-sm"
                        >
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                            {step}
                          </span>
                          <h3 className="mt-3 text-sm font-black">{title}</h3>
                          <p className="mt-1 text-xs font-bold leading-5 text-[#2b414d]">
                            {text}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs font-bold leading-5 text-slate-600">
                        Once feedback is generated, this becomes your
                        personalised study plan.
                      </p>
                      <Link
                        href="/medicforest/ucat/diagnostic"
                        className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 text-xs font-black text-white transition-colors hover:bg-amber-700"
                      >
                        Start diagnostic
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                ) : visibleDashboardStudyPlanTasks.length === 0 ? (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-xs font-bold leading-5 text-emerald-700">
                    Completed tasks have been cleared from this dashboard.
                  </div>
                ) : (
                visibleDashboardStudyPlanTasks.map((task) => {
                  const Icon = task.icon;
                  const completed = completedDashboardTaskIds.has(task.id);
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 rounded-xl border p-3 ${
                        completed
                          ? "border-emerald-100 bg-emerald-50/60"
                        : "border-slate-100 bg-white"
                      }`}
                    >
                      <div className="flex w-12 shrink-0 flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleDashboardTask(task.id)}
                          aria-pressed={completed}
                          aria-label={`${completed ? "Untick" : "Tick off"} ${task.title}`}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors ${
                            completed
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-slate-200 bg-white text-slate-300 hover:border-emerald-300 hover:text-emerald-500"
                          }`}
                        >
                          <Check className="h-5 w-5" aria-hidden="true" />
                        </button>
                        {completed && (
                          <button
                            type="button"
                            onClick={() => removeDashboardTask(task.id)}
                            className="text-[11px] font-black leading-none text-rose-500 transition-colors hover:text-rose-600"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${task.iconClass}`}
                      >
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3
                          className={`text-sm font-black ${
                            completed ? "text-slate-400 line-through" : ""
                          }`}
                        >
                          {task.title}
                        </h3>
                        <p
                          className={`mt-1 text-xs font-bold ${
                            completed ? "text-slate-400" : "text-[#263d48]"
                          }`}
                        >
                          {task.fix}
                        </p>
                      </div>
                      <Link
                        href={task.href}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-amber-300 bg-amber-50 px-5 text-sm font-black text-amber-700 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.18)] transition-colors hover:border-amber-400 hover:bg-amber-100 hover:text-amber-800"
                      >
                        Start
                      </Link>
                    </div>
                  );
                }))}
              </div>
              <Link
                href="/medicforest/ucat/practice"
                className="mt-5 inline-flex items-center gap-2 text-sm font-black text-amber-700 hover:text-amber-800"
              >
                View all tasks
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </section>
            </ClientPremiumGate>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black uppercase tracking-wide">
                    Progress snapshot
                  </h2>
                  <Info className="h-4 w-4 text-slate-400" aria-hidden="true" />
                </div>
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                  {(["accuracy", "progress"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setProgressSnapshotView(option)}
                      className={`rounded-md px-3 py-1.5 text-xs font-black capitalize transition-colors ${
                        progressSnapshotView === option
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-500 hover:text-blue-600"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {(progressSnapshotView === "accuracy"
                  ? [
                      [
                        "Accuracy",
                        practiceStats.hasCompletedQuestions
                          ? `${practiceStats.accuracy}%`
                          : "-",
                      ],
                      [
                        "Avg. time / question",
                        practiceStats.hasCompletedQuestions
                          ? `${practiceStats.avgSeconds}s`
                          : "-",
                      ],
                    ]
                  : [
                      [
                        "Questions completed",
                        `${practiceStats.totalCompleted}/${practiceStats.totalAvailable}`,
                      ],
                      ["Bank progress", `${bankProgressPercent}%`],
                    ]
                ).map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-black text-slate-700">{label}</p>
                    <p className="mt-2 text-3xl font-black leading-none text-slate-400">
                      {value}
                    </p>
                    <p className="mt-2 text-xs font-bold text-slate-400">
                      {progressSnapshotView === "accuracy"
                        ? progressSummaryText
                        : "From question-bank completion"}
                    </p>
                  </div>
                ))}
              </div>

              <h3 className="mt-7 text-sm font-black">
                {progressSnapshotView === "accuracy"
                  ? "Accuracy across sections"
                  : "Progress through sections"}
              </h3>
              <div className="mt-4 space-y-4">
                {dashboardSectionScores.map((section) => (
                  <div key={section.code} className="space-y-1">
                    <div className="grid grid-cols-[44px_1fr_42px] items-center gap-4">
                      <span
                        className={`rounded px-2 py-0.5 text-center text-xs font-black ${section.badgeClass}`}
                      >
                        {section.code}
                      </span>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full ${section.barClass}`}
                          style={{ width: `${section.score}%` }}
                        />
                      </div>
                      <span className="text-right text-sm font-black">
                        {section.score}%
                      </span>
                    </div>
                    <p className="pl-[60px] text-xs font-bold text-slate-400">
                      {section.helper}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <DailyQuestionsChart practiceStats={practiceStats} />

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="text-sm font-black uppercase tracking-wide">
                The MedicForest approach
              </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-5">
                {approachSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.title} className="relative flex gap-3 md:block">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${step.iconClass}`}
                      >
                        <Icon className="h-7 w-7" aria-hidden="true" />
                      </div>
                      <div className="md:mt-2">
                        <h3 className="text-sm font-black text-blue-600">
                          {step.title}
                        </h3>
                        <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                          {step.text}
                        </p>
                      </div>
                      {index < approachSteps.length - 1 && (
                        <ArrowRight
                          className="absolute right-3 top-5 hidden h-5 w-5 text-slate-400 md:block"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
          ) : (
            <DashboardSubpageContent
              view={view}
              initialReportId={initialReportId}
              initialMockId={initialMockId}
              displayName={displayName}
              plan={plan}
              email={userEmail}
              isPremium={plan === "Premium"}
              checkoutLoading={checkoutLoading}
              practiceStats={practiceStats}
              latestDiagnostic={latestDiagnostic}
              diagnosticHistory={diagnosticHistory}
              completedDashboardTaskIds={completedDashboardTaskIds}
              removedDashboardTaskIds={removedDashboardTaskIds}
              diagnosticCredits={diagnosticCredits}
              aiDiagnosticLastUsedAt={aiDiagnosticLastUsedAt}
              hasStripeCustomer={hasStripeCustomer}
              onUpgrade={handleSubscriptionAction}
              onLogout={handleLogout}
              onSaveDisplayName={handleProfileUpdate}
              onRemoveSet={removePracticeSet}
              onRemoveAllSets={removeAllPracticeSets}
              removingPracticeSetId={removingPracticeSetId}
              removingAllPracticeSets={removingAllPracticeSets}
              practiceSetRemoveError={practiceSetRemoveError}
              recentPracticeSets={recentPracticeSets}
            />
          )}
        </main>
      </div>
      {authGateActive && (
        <AuthPanel
          mode={authMode}
          setMode={setAuthMode}
          fullName={fullName}
          setFullName={setFullName}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          legalAccepted={legalAccepted}
          setLegalAccepted={setLegalAccepted}
          submitting={submitting}
          message={authMessage}
          error={authError}
          onSubmit={handleAuthSubmit}
          presentation="overlay"
        />
      )}
    </div>
  );
}


import { MedicForestLandingPage } from "@/app/medicforest/_components/MedicForestLandingClient";
export { MedicForestLandingPage };
export { MedicForestPricingPage } from "@/app/medicforest/pricing/_components/MedicForestPricingClient";

export function UCATDashboardPage() {
  return <UCATDashboard view="dashboard" />;
}

export function UCATDiagnosticPage() {
  return <UCATDashboard view="diagnostic" />;
}

export function UCATMockDiagnosticPage() {
  return <UCATDashboard view="mock-diagnostic" />;
}

export function UCATPracticePage() {
  return <UCATDashboard view="practice" />;
}

export function UCATProgressPage() {
  return <UCATDashboard view="progress" />;
}

export function UCATSkillsTrainersPage() {
  return <UCATDashboard view="skills-trainers" />;
}

export function UCATReportPage({
  initialReportId = null,
  initialMockId = null,
}: {
  initialReportId?: string | null;
  initialMockId?: string | null;
}) {
  return (
    <UCATDashboard
      view="report"
      initialReportId={initialReportId}
      initialMockId={initialMockId}
    />
  );
}

export function UCATAccountPage() {
  return <UCATDashboard view="account" />;
}

export default MedicForestLandingPage;
