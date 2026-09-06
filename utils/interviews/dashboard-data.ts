import "server-only";
import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import { toInterviewAttempt } from "./server";
import { deriveDashboard, londonDate, type PreparationProfile } from "./dashboard-analytics";
import type { InterviewAttempt } from "@/app/phloemai/interviews/_lib/interview-types";

export function preparationFromRow(row: Record<string, unknown> | null): PreparationProfile | null {
  if (!row) return null;
  return {
    experience: row.experience as PreparationProfile["experience"],
    focusThemes: row.focus_themes as PreparationProfile["focusThemes"],
    weeklyTarget: Number(row.weekly_target),
    targets: row.targets as PreparationProfile["targets"],
    updatedAt: row.updated_at as string,
  };
}

export const getInterviewDashboardData = cache(async () => {
  const now = new Date().toISOString();
  let attempts: InterviewAttempt[] = [];
  let profile: PreparationProfile | null = null;
  let signedIn = false;
  let isPremium = false;
  let available = false;
  let message: string | null = null;
  let completedTasks: string[] = [];
  let totals: Record<string, number | boolean | null> | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      message = "Sign in to save your university choices, interview dates and preparation plan.";
    } else {
      signedIn = true;
      const [settings, plan, tasks, allTime] = await Promise.all([
        supabase.from("interview_preparation_profiles").select("experience,focus_themes,weekly_target,targets,updated_at").eq("user_id", user.id).maybeSingle(),
        supabase.from("profiles").select("current_plan").eq("id", user.id).maybeSingle(),
        supabase.from("interview_dashboard_tasks").select("task_id").eq("user_id", user.id).eq("date", londonDate(now)),
        supabase.rpc("interview_dashboard_totals"),
      ]);
      isPremium = plan.data?.current_plan === "premium";
      available = !settings.error && !tasks.error && !allTime.error;
      profile = preparationFromRow(settings.data);
      completedTasks = (tasks.data ?? []).map((task) => task.task_id);
      totals = allTime.data;
      if (!available) message = "Your saved interview results are shown below. Personal plans and dates will be available once dashboard storage is ready.";

      // No answer text or microphone metrics are transferred for a dashboard view.
      // A bounded recent history supplies details; the RPC supplies exact lifetime totals.
      const columns = "id,mode,university_slug,station_slug,title,status,circuit_id,station_index,station_count,preparation_seconds,station_seconds,break_seconds,feedback,started_at,completed_at";
      const history = await supabase.from("interview_attempts").select(`${columns}${available ? ",answer_submitted_at" : ""}`).eq("user_id", user.id).order("started_at", { ascending: false }).order("id", { ascending: false }).limit(500);
      if (history.error) message = "Your interview history could not be loaded. Please try again shortly.";
      else attempts = (history.data ?? []).map((row) => toInterviewAttempt({ ...(row as unknown as Record<string, unknown>), questions: [], answers: [], metrics: {} }));
    }
  } catch {
    message = "Your dashboard could not be loaded right now. Please try again shortly.";
  }
  const analytics = deriveDashboard(attempts, profile, now, isPremium, completedTasks);
  if (totals) {
    analytics.stats.completedCount = Number(totals.completedCount ?? 0);
    analytics.stats.scoredCount = Number(totals.scoredCount ?? 0);
    analytics.stats.averageScore = typeof totals.averageScore === "number" ? totals.averageScore : null;
    analytics.stats.bestFreeScore = typeof totals.bestFreeScore === "number" ? totals.bestFreeScore : null;
    analytics.stats.practiceSeconds = Number(totals.practiceSeconds ?? 0);
    analytics.stats.practiceMinutes = Math.round(analytics.stats.practiceSeconds / 60);
    analytics.stats.practiceTimeEstimated = Boolean(totals.practiceTimeEstimated);
  }
  return { attempts, profile, analytics, signedIn, isPremium, available, message, historyLimited: Number(totals?.attemptCount ?? 0) > 500 };
});
