import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bookmark,
  Brain,
  Calculator,
  Clock3,
  Eye,
  Flag,
  Goal,
  MessageSquare,
  Target,
  Timer,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type UCATSectionCode = "VR" | "DM" | "QR" | "SJT";

export type DashboardDiagnosticIssue = {
  label: string;
  cause?: string;
  fix?: string;
  evidence?: string[];
  studyFixes?: string[];
};

export type DashboardDiagnosticTask = {
  id?: string;
  label?: string;
  fix: string;
};

export type StudyPlanDisplayTask = DashboardDiagnosticTask & {
  id: string;
  href: string;
  title: string;
  icon: LucideIcon;
  iconClass: string;
};

export type DashboardDiagnostic = {
  id: string;
  section: UCATSectionCode;
  source: string | null;
  diagnosticMode: string | null;
  mockId: string | null;
  mockScope: string | null;
  mockLabel: string | null;
  accuracy: number;
  scorePoints: number | null;
  maxScore: number | null;
  answeredQuestions: number | null;
  totalQuestions: number | null;
  avgSecondsPerQuestion: number | null;
  issues: DashboardDiagnosticIssue[];
  strengths: string[];
  studyPlanTasks: DashboardDiagnosticTask[];
  aiFeedbackText: string | null;
  aiFeedbackScope: string | null;
  aiFeedbackStatus: string | null;
  completedAt: string | null;
};

export type DiagnosticAttemptRow = {
  id?: string;
  accuracy?: number | null;
  completed_at?: string | null;
  ai_feedback?: string | null;
  ai_feedback_status?: string | null;
  metadata?: unknown;
  source?: string | null;
};

export type ReportIssueDefinition = {
  id: string;
  title: string;
  freeLabel: string;
  short: string;
  mainCause: string;
  evidence: string[];
  fix: string;
  icon: LucideIcon;
  iconClass: string;
};

export type ReportSectionFilter = "All" | UCATSectionCode;

export const FREE_QR_DIAGNOSTIC_SOURCE = "free_qr_diagnostic";
export const FULL_MOCK_SECTION_SOURCE = "full_mock_section_diagnostic";
export const FULL_MOCK_REPORT_SECTION_ORDER: UCATSectionCode[] = [
  "VR",
  "DM",
  "QR",
  "SJT",
];

export const AI_DIAGNOSTIC_CREDIT_INTERVAL_MS = 24 * 60 * 60 * 1000;

export const reportIssueDefinitions: ReportIssueDefinition[] = [
  {
    id: "calculator",
    title: "Inefficient calculator use",
    freeLabel: "Inefficient calculator use detected",
    short: "You may be losing time during calculation-heavy QR questions.",
    mainCause:
      "You pause mid-calculation, re-enter values after clearing, avoid memory buttons or use the calculator when estimation would be faster.",
    evidence: [
      "Calculator open rate and calculator-active time",
      "Repeated clears, re-entered values and operator/digit patterns",
      "Keyboard vs button input speed and memory button usage",
    ],
    fix: "15 minutes of calculator speed trainer.",
    icon: Calculator,
    iconClass: "bg-cyan-50 text-cyan-600",
  },
  {
    id: "shortcuts",
    title: "Ineffective keyboard use",
    freeLabel: "Ineffective keyboard use detected",
    short: "You may be spending extra time on manual clicks and transitions.",
    mainCause:
      "You rely on mouse navigation, mouse answer selection and manual calculator or flag controls instead of high-value keyboard shortcuts.",
    evidence: [
      "Answer-key usage compared with mouse selections",
      "Alt+N, Alt+P, Alt+C and Alt+F usage",
      "Transition delay after answering or flagging",
    ],
    fix: "Build shortcut habits for answers, next/previous, calculator and flagging.",
    icon: Zap,
    iconClass: "bg-violet-50 text-violet-600",
  },
  {
    id: "timing",
    title: "Time management issue",
    freeLabel: "Time management issue detected",
    short: "You may be over-investing time before locking in an answer.",
    mainCause:
      "You spend too long before first answer, get stuck on hard questions or lose time near the end of the set.",
    evidence: [
      "First-answer time and final-answer time",
      "Time spikes by subtype and question position",
      "Later-question speed changes and unanswered pressure",
    ],
    fix: "Use timed sets with hard-stop decisions and recovery drills.",
    icon: Clock3,
    iconClass: "bg-amber-50 text-amber-600",
  },
  {
    id: "answer-hesitation",
    title: "Answer uncertainty",
    freeLabel: "Answer uncertainty detected",
    short: "You may be second-guessing instead of using evidence to decide.",
    mainCause:
      "You switch repeatedly, delay between first and final answer or change correct answers to incorrect ones.",
    evidence: [
      "Answer switch count and first/final answer gap",
      "Changed-from-correct and changed-to-correct rate",
      "Review changes made without new evidence",
    ],
    fix: "Practise evidence-locking and answer-change rules.",
    icon: MessageSquare,
    iconClass: "bg-blue-50 text-blue-600",
  },
  {
    id: "review",
    title: "Review strategy issue",
    freeLabel: "Review strategy issue detected",
    short: "Your review time may not be going to the highest-value questions.",
    mainCause:
      "You review low-value questions, change correct answers, miss flagged questions or spend too long in the navigator.",
    evidence: [
      "Review opens and navigator time",
      "Flagged questions revisited or missed",
      "Answer changes made during review",
    ],
    fix: "Use a strict review order: flagged time-sinks, unanswered, then evidence-based changes only.",
    icon: Bookmark,
    iconClass: "bg-indigo-50 text-indigo-600",
  },
  {
    id: "flagging",
    title: "Flagging issue",
    freeLabel: "Flagging issue detected",
    short: "Your flags may not be separating time-sinks from safe questions.",
    mainCause:
      "You flag too many, flag too late, miss time-sink questions or flag easy items unnecessarily.",
    evidence: [
      "Flag toggles and flag timing",
      "Flagged question accuracy and review return rate",
      "Flags on easy, slow or already-finalised questions",
    ],
    fix: "Practise early flag decisions with a clear return threshold.",
    icon: Flag,
    iconClass: "bg-rose-50 text-rose-600",
  },
  {
    id: "navigation",
    title: "Navigation issue",
    freeLabel: "Navigation issue detected",
    short: "You may be losing time moving around the bank without a clear plan.",
    mainCause:
      "You revisit the same questions too often, overuse next/previous or jump around without a review strategy.",
    evidence: [
      "Question visits and repeated visits",
      "Navigator opens and question jumps",
      "Next/previous movement around finalised answers",
    ],
    fix: "Use a simple pass system: answer, flag, move; review only planned targets.",
    icon: BarChart3,
    iconClass: "bg-slate-100 text-slate-700",
  },
  {
    id: "reading",
    title: "Reading strategy issue",
    freeLabel: "Reading strategy issue detected",
    short: "You may be spending too long extracting the relevant information.",
    mainCause:
      "You spend too long in the stem or passage, revisit regions repeatedly or switch between passage and options too often.",
    evidence: [
      "Stimulus/question/answer region time",
      "Region switches and revisits",
      "First-answer delay after heavy reading",
    ],
    fix: "Practise question-first reading and key-information extraction drills.",
    icon: Eye,
    iconClass: "bg-cyan-50 text-cyan-600",
  },
  {
    id: "confidence",
    title: "Confidence judgement issue",
    freeLabel: "Confidence judgement issue detected",
    short: "Your sense of difficulty may not match your actual performance.",
    mainCause:
      "You underestimate or overestimate specific subtypes, spend too long on easy items or mark easy questions incorrectly.",
    evidence: [
      "Accuracy by labelled difficulty or confidence",
      "Time spent on questions marked easy",
      "Subtype-level overconfidence and underconfidence",
    ],
    fix: "Review miscalibrated questions and set confidence rules by subtype.",
    icon: Brain,
    iconClass: "bg-violet-50 text-violet-600",
  },
  {
    id: "pacing",
    title: "Pacing issue",
    freeLabel: "Pacing issue detected",
    short: "Your pace may be uneven across the bank.",
    mainCause:
      "You spend too long early, speed up too aggressively late or vary heavily between similar question types.",
    evidence: [
      "Time distribution across early, middle and final questions",
      "Speed changes by subtype and question position",
      "Accuracy drop after pace changes",
    ],
    fix: "Practise fixed-pace blocks with checkpoints every few questions.",
    icon: Timer,
    iconClass: "bg-blue-50 text-blue-600",
  },
  {
    id: "question-type",
    title: "Question-type weakness",
    freeLabel: "Question-type weakness detected",
    short: "Losses may be concentrated in a specific UCAT subtype.",
    mainCause:
      "Weakness is concentrated in a subtype such as QR percentages, DM syllogisms, VR inference or SJT appropriateness.",
    evidence: [
      "Accuracy by section and subtype",
      "Average time by subtype",
      "Repeated errors in the same question family",
    ],
    fix: "Prioritise the subtype causing the biggest score loss before broad practice.",
    icon: Target,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "rushing",
    title: "Rushing pattern",
    freeLabel: "Rushing pattern detected",
    short: "Fast answers may be costing avoidable marks.",
    mainCause:
      "You answer before enough information is read, skip key regions or make more errors in the final third.",
    evidence: [
      "Very short first-answer times",
      "Accuracy on fast responses",
      "Final-third error rate and skipped-region patterns",
    ],
    fix: "Use minimum-evidence checks before selecting an answer.",
    icon: AlertTriangle,
    iconClass: "bg-red-50 text-red-600",
  },
  {
    id: "overthinking",
    title: "Overthinking pattern",
    freeLabel: "Overthinking pattern detected",
    short: "You may be spending time after your first instinct is already right.",
    mainCause:
      "You keep revisiting, switch answers or spend too long after already selecting the correct answer.",
    evidence: [
      "Long total time despite correct first answer",
      "Answer switches after a correct first instinct",
      "Region revisits after answer selection",
    ],
    fix: "Practise lock-and-leave rules for evidence-backed first answers.",
    icon: Brain,
    iconClass: "bg-orange-50 text-orange-600",
  },
  {
    id: "consistency",
    title: "Consistency issue",
    freeLabel: "Consistency issue detected",
    short: "Performance may be unstable between similar questions.",
    mainCause:
      "Accuracy and timing vary heavily between similar question types or after longer questions.",
    evidence: [
      "Accuracy spread within the same subtype",
      "Timing variance across similar questions",
      "Performance dips after long questions",
    ],
    fix: "Use short repeated subtype sets until timing and accuracy stabilise.",
    icon: BarChart3,
    iconClass: "bg-indigo-50 text-indigo-600",
  },
  {
    id: "end-bank",
    title: "End-bank strategy issue",
    freeLabel: "End-bank strategy issue detected",
    short: "The final minutes may not be used well.",
    mainCause:
      "You end without reviewing flags, rush final questions, spend too long in review mode or leave changes too late.",
    evidence: [
      "End-bank clicks and final review time",
      "Flagged questions left unseen",
      "Late answer changes and final-third accuracy",
    ],
    fix: "Practise a final-two-minute review routine.",
    icon: Goal,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "tool-switching",
    title: "Tool-use issue",
    freeLabel: "Tool-use issue detected",
    short: "Switching tools may be interrupting question flow.",
    mainCause:
      "You lose time moving between calculator, navigator, question and answer areas.",
    evidence: [
      "Repeated calculator and navigator opens",
      "Slow return to the question after tool use",
      "Tool actions clustered inside one question",
    ],
    fix: "Practise deciding the tool before starting the question.",
    icon: Wrench,
    iconClass: "bg-slate-100 text-slate-700",
  },
  {
    id: "accuracy-under-time",
    title: "Timed accuracy issue",
    freeLabel: "Timed accuracy issue detected",
    short: "Accuracy may fall sharply when question time is compressed.",
    mainCause:
      "You can answer accurately with time available, but accuracy drops on compressed or later questions.",
    evidence: [
      "Accuracy by time band",
      "Later-question accuracy under pressure",
      "Hard subtype accuracy when paced tightly",
    ],
    fix: "Practise compressed-time sets after untimed accuracy is secure.",
    icon: Clock3,
    iconClass: "bg-amber-50 text-amber-600",
  },
  {
    id: "answer-change",
    title: "Answer-changing issue",
    freeLabel: "Answer-changing issue detected",
    short: "Answer changes may be reducing rather than improving accuracy.",
    mainCause:
      "You change correct answers after hesitation, during review or without new evidence.",
    evidence: [
      "Changed-from-correct rate",
      "Time before answer changes",
      "Review-mode changes without new information",
    ],
    fix: "Only change answers when you can name the new evidence.",
    icon: MessageSquare,
    iconClass: "bg-blue-50 text-blue-600",
  },
  {
    id: "subtype-priority",
    title: "Practice focus issue",
    freeLabel: "Practice focus issue detected",
    short: "Practice may be too broad for the weakness costing the most marks.",
    mainCause:
      "You spend too much time on low-yield subtypes or ignore the highest-impact weakness.",
    evidence: [
      "Subtype score-loss contribution",
      "Practice distribution by subtype",
      "High-impact weaknesses left under-practised",
    ],
    fix: "Build the next study block around the subtype causing the largest score loss.",
    icon: Target,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "fatigue",
    title: "Session fatigue pattern",
    freeLabel: "Session fatigue pattern detected",
    short: "Speed or accuracy may drop as the set goes on.",
    mainCause:
      "Accuracy, speed or decision quality drops later in the session after sustained work.",
    evidence: [
      "Accuracy and speed by question position",
      "Late-session answer switches and flagging",
      "Calculator pauses or revisits increasing over time",
    ],
    fix: "Practise longer sets with planned reset points.",
    icon: Activity,
    iconClass: "bg-violet-50 text-violet-600",
  },
];

export function normaliseIssueText(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function isActionableStudyFix(fix?: string | null): boolean {
  if (!fix) return false;
  const normalised = normaliseIssueText(fix);

  return (
    Boolean(normalised) &&
    !normalised.includes("each weak type") &&
    !normalised.includes("move on once each type") &&
    !normalised.includes("pointed out only") &&
    !normalised.includes("no study task added")
  );
}

export function getStudyPlanHref(fix: string, label?: string) {
  const text = `${fix} ${label ?? ""}`.toLowerCase();

  if (text.includes("calculator") || text.includes("multi-step")) {
    return "/medicforest/ucat/skills-trainers#calculator";
  }
  if (text.includes("flag")) {
    return "/medicforest/ucat/skills-trainers#flagging";
  }
  if (text.includes("sjt") || text.includes("judgement")) {
    return "/medicforest/ucat/question-bank/sjt";
  }
  if (text.includes("verbal") || text.includes("passage") || text.includes("reading")) {
    return "/medicforest/ucat/question-bank/vr";
  }
  if (text.includes("decision") || text.includes("syllogism") || text.includes("probability")) {
    return "/medicforest/ucat/question-bank/dm";
  }
  if (text.includes("qr") || text.includes("percentage") || text.includes("ratio")) {
    return "/medicforest/ucat/question-bank/qr";
  }

  return "/medicforest/ucat/practice";
}

export function getStudyPlanIcon(fix: string, label?: string) {
  const text = `${fix} ${label ?? ""}`.toLowerCase();

  if (text.includes("calculator") || text.includes("multi-step")) {
    return {
      icon: Calculator,
      iconClass: "bg-cyan-50 text-cyan-600",
      title: "Calculator speed",
    };
  }
  if (text.includes("flag")) {
    return {
      icon: Flag,
      iconClass: "bg-rose-50 text-rose-600",
      title: "Flagging judgement",
    };
  }
  if (text.includes("shortcut")) {
    return {
      icon: Zap,
      iconClass: "bg-violet-50 text-violet-600",
      title: "Shortcut habits",
    };
  }
  if (text.includes("timed") || text.includes("pace") || text.includes("speed")) {
    return {
      icon: Timer,
      iconClass: "bg-amber-50 text-amber-600",
      title: "Timed drill",
    };
  }

  return {
    icon: Target,
    iconClass: "bg-indigo-50 text-blue-600",
    title: label?.replace(" detected", "") ?? "Study task",
  };
}

export function getDiagnosticStudyPlanTasks(
  latestDiagnostic: DashboardDiagnostic | null
): StudyPlanDisplayTask[] {
  const seen = new Set<string>();
  const rawTasks: DashboardDiagnosticTask[] = [];

  latestDiagnostic?.studyPlanTasks.forEach((task) => {
    if (!isActionableStudyFix(task.fix)) return;
    rawTasks.push(task);
  });

  latestDiagnostic?.issues.forEach((issue, index) => {
    const fixes = issue.studyFixes?.length
      ? issue.studyFixes
      : issue.fix
        ? [issue.fix]
        : [];

    fixes.forEach((fix, fixIndex) => {
      if (!isActionableStudyFix(fix)) return;
      rawTasks.push({
        id: `${issue.label}-${index}-${fixIndex}`,
        label: issue.label,
        fix,
      });
    });
  });

  return rawTasks.flatMap((task, index) => {
    const fix = task.fix.trim();
    const key = normaliseIssueText(fix);
    if (!fix || seen.has(key)) return [];
    seen.add(key);
    const presentation = getStudyPlanIcon(fix, task.label);

    return [
      {
        ...task,
        id: task.id || `study-task-${index}`,
        label: task.label,
        fix,
        href: getStudyPlanHref(fix, task.label),
        ...presentation,
      },
    ];
  });
}

export function getActiveDiagnosticStudyPlanTasks(
  latestDiagnostic: DashboardDiagnostic | null,
  completedTaskIds: Set<string>,
  removedTaskIds: Set<string>
): StudyPlanDisplayTask[] {
  const hiddenTaskIds = new Set([...completedTaskIds, ...removedTaskIds]);

  return getDiagnosticStudyPlanTasks(latestDiagnostic).filter(
    (task) => !hiddenTaskIds.has(task.id)
  );
}

export function getDiagnosticReportStudyPlanTasks(
  diagnostics: DashboardDiagnostic[]
): StudyPlanDisplayTask[] {
  if (diagnostics.length <= 1) {
    return getDiagnosticStudyPlanTasks(diagnostics[0] ?? null);
  }

  const seen = new Set<string>();

  return diagnostics.flatMap((diagnostic) =>
    getDiagnosticStudyPlanTasks(diagnostic).flatMap((task) => {
      const key = normaliseIssueText(`${diagnostic.section} ${task.fix}`);
      if (seen.has(key)) return [];
      seen.add(key);

      return [
        {
          ...task,
          id: `${diagnostic.id}-${task.id}`,
          label: task.label
            ? `${diagnostic.section} - ${task.label}`
            : diagnostic.section,
        },
      ];
    })
  );
}

export function getActiveDiagnosticReportStudyPlanTasks(
  diagnostics: DashboardDiagnostic[],
  completedTaskIds: Set<string>,
  removedTaskIds: Set<string>
) {
  const hiddenTaskIds = new Set([...completedTaskIds, ...removedTaskIds]);

  return getDiagnosticReportStudyPlanTasks(diagnostics).filter(
    (task) => !hiddenTaskIds.has(task.id)
  );
}

export function formatDiagnosticReportDate(value: string | null) {
  if (!value) return "Date not saved";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not saved";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDigitalCountdown(totalMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(totalMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function getNextAiDiagnosticCreditAt(lastUsedAt?: string | null) {
  if (!lastUsedAt) return null;

  const lastUsedMs = Date.parse(lastUsedAt);
  if (!Number.isFinite(lastUsedMs)) return null;

  return new Date(lastUsedMs + AI_DIAGNOSTIC_CREDIT_INTERVAL_MS).toISOString();
}

export function getAiDiagnosticCreditDisplay({
  plan,
  diagnosticCredits,
  lastUsedAt,
  now,
}: {
  plan: string;
  diagnosticCredits: number;
  lastUsedAt?: string | null;
  now: number;
}) {
  const isPremiumPlan = plan.toLowerCase() === "premium";

  if (isPremiumPlan) {
    const nextAvailableAt = getNextAiDiagnosticCreditAt(lastUsedAt);
    const nextMs = nextAvailableAt ? Date.parse(nextAvailableAt) : Number.NaN;

    if (Number.isFinite(nextMs) && nextMs > now) {
      return {
        value: "0",
        status: `Available in ${formatDigitalCountdown(nextMs - now)}`,
        helper: "1 AI diagnostic credit refreshes every 24 hours.",
      };
    }

    return {
      value: "1/day",
      status: "Available",
      helper: "Premium includes 1 AI diagnostic credit every 24 hours.",
    };
  }

  return {
    value: String(Math.min(1, Math.max(0, diagnosticCredits))),
    status: diagnosticCredits > 0 ? "Available" : "No free credit remaining",
    helper: "Free accounts include 1 lifetime AI diagnostic credit.",
  };
}

export function getReportIssueDefinitionForLabel(label: string) {
  const normalised = normaliseIssueText(label);
  if (!normalised) return undefined;

  return reportIssueDefinitions.find((issue) => {
    const idWords = normaliseIssueText(issue.id);
    const titleWords = normaliseIssueText(issue.title);
    const freeWords = normaliseIssueText(issue.freeLabel);
    return (
      normalised.includes(idWords) ||
      normalised.includes(titleWords) ||
      freeWords.includes(normalised) ||
      normalised.includes(freeWords.replace(" detected", ""))
    );
  });
}

export function buildReportIssueCard(
  issue: DashboardDiagnosticIssue,
  index = 0
): ReportIssueDefinition {
  const definition = getReportIssueDefinitionForLabel(issue.label);

  return {
    id: definition?.id ?? `${issue.label}-${index}`,
    title: definition?.title ?? issue.label,
    freeLabel: issue.label,
    short:
      definition?.short ??
      issue.cause ??
      issue.fix ??
      "Detected from your latest diagnostic data.",
    mainCause:
      issue.cause ??
      definition?.mainCause ??
      "This issue was detected from your latest diagnostic data.",
    evidence:
      issue.evidence && issue.evidence.length > 0
        ? issue.evidence
        : definition?.evidence ?? ["Detected from the latest saved diagnostic."],
    fix:
      issue.fix ??
      definition?.fix ??
      "Review the linked feedback, then practise the matching question type.",
    icon: definition?.icon ?? AlertTriangle,
    iconClass: definition?.iconClass ?? "bg-red-50 text-red-600",
  };
}

export function normaliseDashboardDiagnostic(
  row: DiagnosticAttemptRow,
  index = 0
): DashboardDiagnostic {
  const asRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const asFiniteNumber = (value: unknown): number | null =>
    typeof value === "number" && Number.isFinite(value) ? value : null;
  const asStringArray = (value: unknown): string[] =>
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];

  const metadata = asRecord(row.metadata);
  const summary = asRecord(metadata.summary);
  const sectionRaw =
    typeof summary?.section === "string" ? summary.section.toUpperCase() : "QR";
  const section = (
    ["VR", "DM", "QR", "SJT"].includes(sectionRaw) ? sectionRaw : "QR"
  ) as UCATSectionCode;
  const insights = asRecord(metadata.insights);
  const issues: DashboardDiagnosticIssue[] = Array.isArray(insights.issues)
    ? insights.issues.flatMap((value) => {
        const issue = asRecord(value);
        if (typeof issue.label !== "string" || !issue.label.trim()) return [];
        return [{
          label: issue.label,
          cause: typeof issue.cause === "string" ? issue.cause : undefined,
          fix: typeof issue.fix === "string" ? issue.fix : undefined,
          evidence: asStringArray(issue.evidence),
          studyFixes: asStringArray(issue.studyFixes),
        }];
      })
    : [];
  const strengths = asStringArray(insights.strengths);
  const studyPlanTasks: DashboardDiagnosticTask[] =
    Array.isArray(metadata.studyPlanTasks)
      ? metadata.studyPlanTasks.flatMap((value) => {
          const task = asRecord(value);
          if (typeof task.fix !== "string" || !task.fix.trim()) return [];
          return [{
            fix: task.fix,
            id: typeof task.id === "string" ? task.id : undefined,
            label: typeof task.label === "string" ? task.label : undefined,
          }];
        })
      : [];
  const aiFeedbackText =
    typeof metadata.aiFeedbackText === "string"
      ? metadata.aiFeedbackText
      : typeof row.ai_feedback === "string"
        ? row.ai_feedback
        : null;
  const aiFeedbackStatus =
    typeof row.ai_feedback_status === "string"
      ? row.ai_feedback_status
      : typeof metadata.aiFeedbackStatus === "string"
        ? metadata.aiFeedbackStatus
        : null;
  const diagnosticMode =
    typeof metadata.diagnosticMode === "string" ? metadata.diagnosticMode : null;
  const mockId = typeof metadata.mockId === "string" ? metadata.mockId : null;
  const mockScope =
    typeof metadata.mockScope === "string" ? metadata.mockScope : null;
  const mockLabel =
    typeof metadata.mockLabel === "string" ? metadata.mockLabel : null;
  const aiFeedbackScope =
    typeof metadata.aiFeedbackScope === "string"
      ? metadata.aiFeedbackScope
      : null;
  const scorePoints = asFiniteNumber(summary.scorePoints);
  const maxScore = asFiniteNumber(summary.maxScore);
  const answeredQuestions = asFiniteNumber(summary.answeredQuestions);
  const totalQuestions = asFiniteNumber(summary.totalQuestions);
  const avgSecondsPerQuestion = asFiniteNumber(summary.avgSecondsPerQuestion);

  return {
    id: row.id ?? row.completed_at ?? `diagnostic-${index}`,
    section,
    source: typeof row.source === "string" ? row.source : null,
    diagnosticMode,
    mockId,
    mockScope,
    mockLabel,
    accuracy: asFiniteNumber(row.accuracy) ?? 0,
    scorePoints,
    maxScore,
    answeredQuestions,
    totalQuestions,
    avgSecondsPerQuestion,
    issues,
    strengths,
    studyPlanTasks,
    aiFeedbackText,
    aiFeedbackScope,
    aiFeedbackStatus,
    completedAt: typeof row.completed_at === "string" ? row.completed_at : null,
  };
}

export function isFreeQrDiagnostic(diagnostic: DashboardDiagnostic | null | undefined) {
  return (
    diagnostic?.source === FREE_QR_DIAGNOSTIC_SOURCE ||
    diagnostic?.diagnosticMode === "free-qr"
  );
}

export function isFullMockSectionDiagnostic(
  diagnostic: DashboardDiagnostic | null | undefined
) {
  return (
    diagnostic?.source === FULL_MOCK_SECTION_SOURCE &&
    diagnostic?.mockScope === "full-mock" &&
    Boolean(diagnostic.mockId)
  );
}

export function getFullMockReportDiagnostics(
  selectedDiagnostic: DashboardDiagnostic | null,
  diagnosticHistory: DashboardDiagnostic[]
) {
  if (!selectedDiagnostic) return [];
  if (!isFullMockSectionDiagnostic(selectedDiagnostic)) {
    return [selectedDiagnostic];
  }

  const diagnostics = diagnosticHistory.filter(
    (diagnostic) =>
      isFullMockSectionDiagnostic(diagnostic) &&
      diagnostic.mockId === selectedDiagnostic.mockId
  );

  const withSelected = diagnostics.some(
    (diagnostic) => diagnostic.id === selectedDiagnostic.id
  )
    ? diagnostics
    : [selectedDiagnostic, ...diagnostics];

  const bySection = new Map<UCATSectionCode, DashboardDiagnostic>();

  withSelected.forEach((diagnostic) => {
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

  return FULL_MOCK_REPORT_SECTION_ORDER.flatMap((section) => {
    const diagnostic = bySection.get(section);
    return diagnostic ? [diagnostic] : [];
  });
}

export function getCombinedDiagnosticAccuracy(diagnostics: DashboardDiagnostic[]) {
  let weightedAccuracy = 0;
  let totalWeight = 0;

  for (const diagnostic of diagnostics) {
    const hasScore =
      diagnostic.scorePoints !== null &&
      diagnostic.maxScore !== null &&
      Number.isFinite(diagnostic.scorePoints) &&
      Number.isFinite(diagnostic.maxScore) &&
      diagnostic.maxScore > 0;
    const weight = hasScore
      ? diagnostic.maxScore!
      : diagnostic.totalQuestions && diagnostic.totalQuestions > 0
        ? diagnostic.totalQuestions
        : 1;
    const accuracy = hasScore
      ? (diagnostic.scorePoints! / diagnostic.maxScore!) * 100
      : diagnostic.accuracy;

    if (!Number.isFinite(accuracy)) continue;
    weightedAccuracy += accuracy * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? Math.round(weightedAccuracy / totalWeight) : 0;
}

export function getCombinedDiagnosticAvgSeconds(diagnostics: DashboardDiagnostic[]) {
  let weightedSeconds = 0;
  let totalWeight = 0;

  for (const diagnostic of diagnostics) {
    const seconds = diagnostic.avgSecondsPerQuestion;
    if (seconds === null || !Number.isFinite(seconds) || seconds < 0) continue;
    const weight =
      diagnostic.totalQuestions && diagnostic.totalQuestions > 0
        ? diagnostic.totalQuestions
        : 1;
    weightedSeconds += seconds * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? Math.round(weightedSeconds / totalWeight) : 0;
}
