import { revalidatePath } from "next/cache";
import { getInterviewDashboardData } from "@/utils/interviews/dashboard-data";
import { databaseError, InterviewError, interviewContext, interviewFailure, interviewJson, readInterviewBody } from "@/utils/interviews/server";

export async function POST(request: Request) {
  try {
    const body = await readInterviewBody(request);
    const { user, admin } = await interviewContext();
    if (typeof body.taskId !== "string" || body.taskId.length > 160 || typeof body.completed !== "boolean") throw new InterviewError("Choose a task from today's plan.");
    const { analytics, available } = await getInterviewDashboardData();
    if (!available) throw new InterviewError("Your practice plan is not available yet. Please try again shortly.", 503);
    const task = analytics.todayPlan.find((entry) => entry.id === body.taskId);
    if (!task || task.kind === "station") throw new InterviewError("Interview tasks are completed automatically when your station feedback is saved.");
    if (task.kind === "review" && task.href.startsWith("/phloemai/interviews/reports/") && !analytics.recentPerformance.length) throw new InterviewError("Complete an interview first so you have feedback to review.");
    const result = body.completed
      ? await admin.from("interview_dashboard_tasks").upsert({ user_id: user.id, task_id: task.id, date: analytics.today, completed_at: new Date().toISOString() })
      : await admin.from("interview_dashboard_tasks").delete().eq("user_id", user.id).eq("task_id", task.id).eq("date", analytics.today);
    if (result.error) databaseError(result.error);
    revalidatePath("/phloemai/interviews");
    revalidatePath("/phloemai/interviews/plan");
    return interviewJson({ taskId: task.id, completed: body.completed });
  } catch (error) { return interviewFailure(error); }
}
