import { revalidatePath } from "next/cache";
import { PATHWAY_STORAGE_DATE, PATHWAY_TASK_IDS, changePathwayTask, sanitisePathwayProgress } from "@/utils/interviews/pathway";
import { databaseError, InterviewError, interviewContext, interviewFailure, interviewJson, readInterviewBody } from "@/utils/interviews/server";

async function readProgress(admin: Awaited<ReturnType<typeof interviewContext>>["admin"], userId: string) {
  const { data, error } = await admin.from("interview_dashboard_tasks").select("task_id").eq("user_id", userId).eq("date", PATHWAY_STORAGE_DATE).in("task_id", PATHWAY_TASK_IDS);
  if (error) databaseError(error);
  return sanitisePathwayProgress(data?.map((task) => task.task_id));
}

export async function GET() {
  try {
    const { user, admin } = await interviewContext();
    return interviewJson({ userId: user.id, completedTaskIds: await readProgress(admin, user.id) });
  } catch (error) { return interviewFailure(error); }
}

export async function POST(request: Request) {
  try {
    const body = await readInterviewBody(request);
    const { user, admin } = await interviewContext();
    if (body.expectedUserId !== user.id) throw new InterviewError("Your account has changed. Refresh to load its pathway.", 409);
    const current = await readProgress(admin, user.id);
    let change: ReturnType<typeof changePathwayTask>;
    try { change = changePathwayTask(current, body.taskId, body.completed); }
    catch (error) { throw new InterviewError(error instanceof Error ? error.message : "Choose a task from your station pathway."); }
    const result = body.completed
      ? await admin.from("interview_dashboard_tasks").upsert({ user_id: user.id, task_id: body.taskId, date: PATHWAY_STORAGE_DATE, completed_at: new Date().toISOString() })
      : await admin.from("interview_dashboard_tasks").delete().eq("user_id", user.id).eq("date", PATHWAY_STORAGE_DATE).in("task_id", change.removeIds);
    if (result.error) databaseError(result.error);
    revalidatePath("/phloemai/interviews/plan");
    return interviewJson({ userId: user.id, completedTaskIds: await readProgress(admin, user.id) });
  } catch (error) { return interviewFailure(error); }
}
