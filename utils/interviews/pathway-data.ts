import "server-only";
import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import { PATHWAY_STORAGE_DATE, PATHWAY_TASK_IDS, sanitisePathwayProgress } from "./pathway";

export const getInterviewPathwayData = cache(async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { userId: null, completedTaskIds: [], available: true, isPremium: false };
    const [tasks, profile] = await Promise.all([
      supabase.from("interview_dashboard_tasks").select("task_id").eq("user_id", user.id).eq("date", PATHWAY_STORAGE_DATE).in("task_id", PATHWAY_TASK_IDS),
      supabase.from("profiles").select("current_plan").eq("id", user.id).maybeSingle(),
    ]);
    return { userId: user.id, completedTaskIds: sanitisePathwayProgress(tasks.data?.map((task) => task.task_id)), available: !tasks.error, isPremium: profile.data?.current_plan === "premium" };
  } catch {
    return { userId: null, completedTaskIds: [], available: false, isPremium: false };
  }
});
