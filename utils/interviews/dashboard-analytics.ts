import type { InterviewAttempt } from "@/app/phloemai/interviews/_lib/interview-types";
import { findInterviewStation, interviewStations } from "@/app/phloemai/interviews/_data/interview-stations";
import { findInterviewUniversity } from "@/app/phloemai/interviews/_data/universities";

export const INTERVIEW_THEMES = ["motivation", "reflection", "ethics", "teamwork", "nhs", "hot-topics", "analysis"] as const;
export type InterviewTheme = (typeof INTERVIEW_THEMES)[number];
export const THEME_LABELS: Record<InterviewTheme, string> = {
  motivation: "Motivation", reflection: "Reflection", ethics: "Ethics", teamwork: "Teamwork",
  nhs: "NHS knowledge", "hot-topics": "Hot topics", analysis: "Data & analysis",
};

export type PreparationProfile = {
  experience: "starting" | "practising" | "polishing";
  focusThemes: InterviewTheme[];
  weeklyTarget: number;
  targets: { universitySlug: string; interviewDate: string | null }[];
  updatedAt: string | null;
};

export type ThemeAnalytics = {
  theme: InterviewTheme;
  label: string;
  averageScore: number | null;
  sampleSize: number;
  attemptCount: number;
};
export type DashboardTask = {
  id: string;
  title: string;
  description: string;
  kind: "station" | "guide" | "review";
  theme: InterviewTheme;
  stationSlug: string | null;
  href: string;
  minutes: number;
  completed: boolean;
};
export type DashboardTarget = {
  universitySlug: string;
  name: string;
  interviewDate: string | null;
  daysUntil: number | null;
  dateStatus: "unset" | "upcoming" | "today" | "past";
  averageScore: number | null;
  sampleSize: number;
  completedCount: number;
  href: string;
};
export type DashboardAnalytics = {
  today: string;
  stats: {
    completedCount: number;
    scoredCount: number;
    averageScore: number | null;
    recentAverage: number | null;
    recentSampleSize: number;
    bestFreeScore: number | null;
    practiceSeconds: number;
    practiceMinutes: number;
    practiceTimeEstimated: boolean;
    weekCompleted: number;
    weeklyTarget: number;
  };
  themes: ThemeAnalytics[];
  strengths: ThemeAnalytics[];
  weaknesses: ThemeAnalytics[];
  targets: DashboardTarget[];
  todayPlan: DashboardTask[];
  nextAction: {
    title: string;
    description: string;
    href: string;
    reason: "resume" | "interview-soon" | "weakness" | "focus" | "first-station";
  };
  recentPerformance: {
    id: string;
    title: string;
    score: number;
    completedAt: string;
    theme: InterviewTheme | null;
    universitySlug: string | null;
    href: string;
  }[];
  weeklyInsight: {
    currentAverage: number | null;
    previousAverage: number | null;
    currentCount: number;
    previousCount: number;
    changePoints: number | null;
    message: string;
  };
  latestFeedback: string | null;
};

const DAY_MS = 86_400_000;
const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit",
});
const stationThemes: Record<string, InterviewTheme> = {
  Motivation: "motivation", Reflection: "reflection", Ethics: "ethics", Teamwork: "teamwork",
  "NHS knowledge": "nhs", "Hot topics": "hot-topics", Analysis: "analysis",
};

/** A London calendar date; invalid input is rejected rather than silently becoming today. */
export function londonDate(date: Date | string): string {
  const value = date instanceof Date ? date : new Date(date);
  if (!Number.isFinite(value.getTime())) throw new RangeError("Invalid interview date");
  const parts = formatter.formatToParts(value);
  const part = (name: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === name)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function calendarOrdinal(date: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const parsed = Date.parse(`${date}T00:00:00.000Z`);
  if (!Number.isFinite(parsed) || new Date(parsed).toISOString().slice(0, 10) !== date) return null;
  return parsed / DAY_MS;
}

function scoreOf(attempt: InterviewAttempt): number | null {
  const score = attempt.feedback?.score;
  // Bad records must not create invented perfect scores or poison averages.
  return typeof score === "number" && Number.isFinite(score) && score >= 0 && score <= 99 ? score : null;
}

function average(values: readonly number[]) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
}

export function interviewTheme(attempt: Pick<InterviewAttempt, "stationSlug" | "mode">): InterviewTheme | null {
  const station = findInterviewStation(attempt.stationSlug);
  return station ? stationThemes[station.theme] ?? null : attempt.mode === "free" ? "motivation" : null;
}

function themeAnalytics(completed: readonly InterviewAttempt[]): ThemeAnalytics[] {
  return INTERVIEW_THEMES.map((theme) => {
    const matching = completed.filter((attempt) => interviewTheme(attempt) === theme);
    const scores = matching.map(scoreOf).filter((score): score is number => score !== null).slice(0, 5);
    return { theme, label: THEME_LABELS[theme], averageScore: average(scores), sampleSize: scores.length, attemptCount: matching.length };
  });
}

function comparativeThemes(themes: readonly ThemeAnalytics[]) {
  const ranked = themes.filter((theme) => theme.sampleSize >= 2 && theme.averageScore !== null)
    .sort((a, b) => b.averageScore! - a.averageScore! || a.theme.localeCompare(b.theme));
  if (ranked.length < 2 || ranked[0].averageScore === ranked[ranked.length - 1].averageScore) {
    return { strengths: [] as ThemeAnalytics[], weaknesses: [] as ThemeAnalytics[] };
  }
  const count = Math.min(2, Math.floor(ranked.length / 2));
  return { strengths: ranked.slice(0, count), weaknesses: ranked.slice(-count).reverse() };
}

function boundedDuration(attempt: InterviewAttempt) {
  const start = Date.parse(attempt.startedAt);
  const end = Date.parse(attempt.completedAt ?? "");
  const submitted = Date.parse((attempt as InterviewAttempt & { answerSubmittedAt?: string | null }).answerSubmittedAt ?? "");
  const hasSubmission = Number.isFinite(submitted) && submitted >= start && submitted <= end;
  const stationSeconds = Number.isFinite(attempt.stationSeconds) ? Math.max(0, Math.min(1800, attempt.stationSeconds)) : 0;
  const preparationSeconds = Number.isFinite(attempt.preparationSeconds) ? Math.max(0, attempt.preparationSeconds) : 0;
  const duration = Number.isFinite(start) && Number.isFinite(end)
    ? Math.min(stationSeconds, Math.max(0, ((hasSubmission ? submitted : end) - start) / 1000 - preparationSeconds))
    : 0;
  return { seconds: Math.floor(duration), estimated: !hasSubmission };
}

function stationFor(theme: InterviewTheme, day: number) {
  const options = interviewStations.filter((station) => stationThemes[station.theme] === theme);
  return options[((day % options.length) + options.length) % options.length] ?? interviewStations[0];
}

function stationHref(slug: string) {
  return `/phloemai/interviews/ai-interviews?station=${encodeURIComponent(slug)}`;
}

/**
 * Derives only facts present in the supplied history. Callers with paginated
 * history may replace all-time stats with database aggregates; trend windows
 * and theme samples remain explicitly recent and never predict admission.
 */
export function deriveDashboard(
  attempts: readonly InterviewAttempt[],
  profile: PreparationProfile | null,
  now: string,
  isPremium: boolean,
  completedTaskIds: readonly string[] = [],
): DashboardAnalytics {
  const today = londonDate(now);
  const todayOrdinal = calendarOrdinal(today)!;
  const nowMs = Date.parse(now);
  // Reject future/invalid completions and repeated rows before calculating evidence.
  const unique = [...new Map(attempts.map((attempt) => [attempt.id, attempt])).values()];
  const completed = unique.filter((attempt) => attempt.status === "completed" && attempt.completedAt !== null
    && Number.isFinite(Date.parse(attempt.completedAt)) && Date.parse(attempt.completedAt) <= nowMs)
    .sort((a, b) => Date.parse(b.completedAt!) - Date.parse(a.completedAt!) || a.id.localeCompare(b.id));
  const scored = completed.filter((attempt) => scoreOf(attempt) !== null);
  const dayOf = (attempt: InterviewAttempt) => calendarOrdinal(londonDate(attempt.completedAt!))!;
  const currentWeek = completed.filter((attempt) => dayOf(attempt) >= todayOrdinal - 6);
  const previousWeek = completed.filter((attempt) => dayOf(attempt) >= todayOrdinal - 13 && dayOf(attempt) < todayOrdinal - 6);
  const currentScores = currentWeek.map(scoreOf).filter((score): score is number => score !== null);
  const previousScores = previousWeek.map(scoreOf).filter((score): score is number => score !== null);
  const currentAverage = average(currentScores);
  const previousAverage = average(previousScores);
  // Subtract unrounded means, then round once, to avoid a rounding-induced trend.
  const changePoints = currentScores.length >= 2 && previousScores.length >= 2
    ? Math.round(currentScores.reduce((a, b) => a + b, 0) / currentScores.length - previousScores.reduce((a, b) => a + b, 0) / previousScores.length)
    : null;
  const weeklyMessage = changePoints === null
    ? "Complete at least two scored stations in each seven-day period to compare your average feedback."
    : changePoints === 0
      ? "Your average feedback score is unchanged across the two seven-day periods. Different stations can produce different scores."
      : `Your average feedback score is ${Math.abs(changePoints)} percentage ${Math.abs(changePoints) === 1 ? "point" : "points"} ${changePoints > 0 ? "higher" : "lower"} than the previous seven days. The stations in each period may differ.`;
  const themes = themeAnalytics(completed);
  const { strengths, weaknesses } = comparativeThemes(themes);
  const targets: DashboardTarget[] = [];
  for (const target of profile?.targets ?? []) {
    const university = findInterviewUniversity(target.universitySlug);
    if (!university || targets.some((item) => item.universitySlug === university.slug)) continue;
    const dateOrdinal = target.interviewDate ? calendarOrdinal(target.interviewDate) : null;
    const daysUntil = dateOrdinal === null ? null : dateOrdinal - todayOrdinal;
    const matching = completed.filter((attempt) => findInterviewUniversity(attempt.universitySlug)?.slug === university.slug);
    const scores = matching.map(scoreOf).filter((score): score is number => score !== null).slice(0, 5);
    targets.push({
      universitySlug: university.slug, name: university.name,
      interviewDate: dateOrdinal === null ? null : target.interviewDate,
      daysUntil,
      dateStatus: daysUntil === null ? "unset" : daysUntil < 0 ? "past" : daysUntil === 0 ? "today" : "upcoming",
      averageScore: average(scores), sampleSize: scores.length, completedCount: matching.length,
      href: `/phloemai/interviews/universities/${university.slug}`,
    });
    if (targets.length === 10) break;
  }
  targets.sort((a, b) => {
    const group = (target: DashboardTarget) => target.daysUntil === null ? 2 : target.daysUntil < 0 ? 1 : 0;
    return group(a) - group(b) || (a.daysUntil ?? 0) - (b.daysUntil ?? 0) || a.name.localeCompare(b.name);
  });

  // Today's activity never changes the selected tasks. Only completed work from
  // before London's midnight informs the plan; finishing a task checks it off.
  const previousDays = completed.filter((attempt) => dayOf(attempt) < todayOrdinal);
  const planningWeaknesses = comparativeThemes(themeAnalytics(previousDays)).weaknesses.map((item) => item.theme);
  const focusThemes = [...new Set((profile?.focusThemes ?? []).filter((theme) => INTERVIEW_THEMES.includes(theme)))].slice(0, 3);
  const weeklyTarget = Number.isFinite(profile?.weeklyTarget) ? Math.min(14, Math.max(1, Math.round(profile!.weeklyTarget))) : 3;
  const preferred: InterviewTheme[] = profile?.experience === "starting"
    ? ["motivation", ...focusThemes, ...planningWeaknesses, "reflection", "ethics"]
    : [...planningWeaknesses, ...focusThemes, "motivation", "reflection", "ethics"];
  const planThemes = [...new Set(preferred)].slice(0, 3);
  const todayCompleted = completed.filter((attempt) => dayOf(attempt) === todayOrdinal);
  const manualCompleted = new Set(completedTaskIds);
  const stationTask = (theme: InterviewTheme, forceFree = false): DashboardTask => {
    const station = forceFree ? interviewStations[0] : stationFor(theme, todayOrdinal);
    const id = `${today}:station:${station.slug}`;
    return {
      id, title: station.title,
      description: forceFree ? "Practise your motivation in the free station." : `Give ${THEME_LABELS[theme].toLowerCase()} focused practice with one timed answer.`,
      kind: "station", theme, stationSlug: station.slug, href: stationHref(station.slug), minutes: 8,
      completed: todayCompleted.some((attempt) => findInterviewStation(attempt.stationSlug)?.slug === station.slug || (forceFree && attempt.mode === "free")),
    };
  };
  const guideTheme = planThemes.find((theme) => theme !== "motivation") ?? "reflection";
  const lastReport = previousDays.find((attempt) => scoreOf(attempt) !== null);
  const guideId = `${today}:guide:${guideTheme}`;
  const reviewId = `${today}:review:${lastReport?.id ?? "personal-reflection"}`;
  const guideTask: DashboardTask = { id: guideId, title: "Read an interview preparation guide", description: `Choose one idea to apply to ${THEME_LABELS[guideTheme].toLowerCase()} questions.`, kind: "guide", theme: guideTheme, stationSlug: null, href: "/phloemai/interviews/guides", minutes: 5, completed: manualCompleted.has(guideId) };
  const reviewTask: DashboardTask = { id: reviewId, title: lastReport ? "Reflect on your latest feedback" : "Reflect on one caring experience", description: lastReport ? "Choose one specific change for your next attempt." : "Write down what happened, what you learnt, and how it affected your understanding of care.", kind: "review", theme: lastReport ? interviewTheme(lastReport) ?? "reflection" : "reflection", stationSlug: null, href: lastReport ? `/phloemai/interviews/reports/${lastReport.id}` : "/phloemai/interviews/question-bank", minutes: 5, completed: manualCompleted.has(reviewId) };
  const dailyStationCount = isPremium && weeklyTarget >= 8 ? 2 : 1;
  const todayPlan: DashboardTask[] = [
    ...(isPremium ? planThemes.slice(0, dailyStationCount).map((theme) => stationTask(theme)) : [stationTask("motivation", true)]),
    ...(dailyStationCount === 1 ? [guideTask] : []),
    reviewTask,
  ];

  const active = unique.filter((attempt) => (attempt.status === "in_progress" || attempt.status === "grading")
    && Number.isFinite(Date.parse(attempt.startedAt)) && Date.parse(attempt.startedAt) <= nowMs
    && (attempt.status === "grading" || Date.parse(attempt.startedAt) + (Math.max(0, attempt.preparationSeconds) + Math.max(0, attempt.stationSeconds)) * 1000 > nowMs)
    && (isPremium || attempt.mode === "free"))
    .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt) || a.id.localeCompare(b.id))[0];
  const soon = targets.find((target) => target.daysUntil !== null && target.daysUntil >= 0 && target.daysUntil <= 14);
  const suggestedTheme = weaknesses[0]?.theme ?? focusThemes[0] ?? "motivation";
  const suggestedStation = stationFor(suggestedTheme, todayOrdinal);
  let nextAction: DashboardAnalytics["nextAction"];
  if (active) {
    nextAction = active.status === "grading"
      ? { title: "Check your interview feedback", description: `Your ${active.title} feedback is being prepared. Return to check its progress.`, href: `/phloemai/interviews/ai-interviews?attempt=${active.id}`, reason: "resume" }
      : { title: "Return to your interview", description: `Continue ${active.title} and review your saved answers.`, href: `/phloemai/interviews/ai-interviews?attempt=${active.id}`, reason: "resume" };
  } else if (!completed.length) {
    nextAction = { title: "Start with Why medicine?", description: "Get your first feedback, then choose one thing to improve.", href: stationHref("why-medicine"), reason: "first-station" };
  } else if (soon && isPremium) {
    nextAction = { title: `Practise for ${soon.name}`, description: soon.daysUntil === 0 ? "Your interview date is today. Use a short, familiar rehearsal if it would help." : `Your interview is in ${soon.daysUntil} ${soon.daysUntil === 1 ? "day" : "days"}. Check its format and plan a focused rehearsal.`, href: `/phloemai/interviews/ai-interviews?university=${soon.universitySlug}`, reason: "interview-soon" };
  } else if (!isPremium) {
    nextAction = { title: "Develop your Why medicine? answer", description: "Return to the free station and apply one idea from your feedback.", href: stationHref("why-medicine"), reason: "focus" };
  } else {
    nextAction = { title: `Focus on ${THEME_LABELS[suggestedTheme].toLowerCase()}`, description: weaknesses[0] ? `Your recent ${THEME_LABELS[suggestedTheme].toLowerCase()} average is lower than your other sampled themes. Try one station and reflect on the feedback.` : "Build practice around the theme you selected and a specific example from your experience.", href: stationHref(suggestedStation.slug), reason: weaknesses[0] ? "weakness" : "focus" };
  }
  const recentScores = scored.slice(0, 5).map((attempt) => scoreOf(attempt)!);
  const freeScores = scored.filter((attempt) => attempt.mode === "free").map((attempt) => scoreOf(attempt)!);
  const durations = completed.map(boundedDuration);
  const practiceSeconds = durations.reduce((sum, duration) => sum + duration.seconds, 0);
  const latestImprovement = scored[0]?.feedback?.improvements?.[0];
  return {
    today,
    stats: {
      completedCount: completed.length, scoredCount: scored.length,
      averageScore: average(scored.map((attempt) => scoreOf(attempt)!)),
      recentAverage: average(recentScores), recentSampleSize: recentScores.length,
      bestFreeScore: freeScores.length ? Math.max(...freeScores) : null,
      practiceSeconds, practiceMinutes: Math.round(practiceSeconds / 60), practiceTimeEstimated: durations.some((duration) => duration.estimated),
      weekCompleted: currentWeek.length, weeklyTarget,
    },
    themes, strengths, weaknesses, targets, todayPlan, nextAction,
    recentPerformance: scored.slice(0, 5).map((attempt) => ({
      id: attempt.id, title: attempt.title, score: scoreOf(attempt)!, completedAt: attempt.completedAt!,
      theme: interviewTheme(attempt), universitySlug: findInterviewUniversity(attempt.universitySlug)?.slug ?? null,
      href: `/phloemai/interviews/reports/${attempt.id}`,
    })),
    weeklyInsight: { currentAverage, previousAverage, currentCount: currentScores.length, previousCount: previousScores.length, changePoints, message: weeklyMessage },
    latestFeedback: typeof latestImprovement === "string" ? latestImprovement : null,
  };
}
