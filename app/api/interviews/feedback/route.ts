import { randomUUID } from "node:crypto";
import { assessInterview } from "@/utils/interviews/gemini";
import { databaseError, InterviewError, interviewContext, interviewFailure, interviewJson, readInterviewBody, toInterviewAttempt, validId } from "@/utils/interviews/server";

export const maxDuration = 45;
export async function POST(request: Request) {
  try {
    const body = await readInterviewBody(request);
    const { user, admin } = await interviewContext();
    if (!validId(body.attemptId)) throw new InterviewError("Invalid interview ID");
    const { data: row, error } = await admin.from("interview_attempts").select("*").eq("id", body.attemptId).eq("user_id", user.id).maybeSingle();
    if (error) databaseError(error);
    if (!row) throw new InterviewError("Interview not found", 404);
    if (row.status === "completed") return interviewJson({ attempt: toInterviewAttempt(row) });
    if (!process.env.GEMINI_API_KEY) throw new InterviewError("AI feedback is not configured yet. Your answers are saved.", 503);
    const attempt = toInterviewAttempt(row);
    if (attempt.answers.map((a) => a.answer).join(" ").trim().split(/\s+/).filter(Boolean).length < 20) throw new InterviewError("Save at least 20 words before requesting feedback.");
    if (Date.now() < Date.parse(attempt.startedAt) + attempt.preparationSeconds * 1000) throw new InterviewError("Preparation is still running.", 409);
    const token = randomUUID();
    const { data: claimed, error: claimError } = await admin.rpc("claim_interview_grading", { p_user: user.id, p_attempt: row.id, p_token: token });
    if (claimError) databaseError(claimError);
    if (claimed.status === "completed") return interviewJson({ attempt: toInterviewAttempt(claimed) });
    try {
      const snapshot = toInterviewAttempt(claimed);
      const feedback = await assessInterview(snapshot.title, snapshot.answers);
      const { data, error: saveError } = await admin.from("interview_attempts").update({ status: "completed", feedback, score: feedback.score, completed_at: new Date().toISOString(), last_error: null }).eq("id", row.id).eq("user_id", user.id).eq("grading_token", token).eq("status", "grading").select().maybeSingle();
      if (saveError) databaseError(saveError);
      if (!data) throw new InterviewError("A newer feedback request is running. Refresh to see its result.", 409);
      return interviewJson({ attempt: toInterviewAttempt(data) });
    } catch (providerError) {
      await admin.from("interview_attempts").update({ status: "failed", last_error: "feedback_unavailable" }).eq("id", row.id).eq("grading_token", token).eq("status", "grading");
      throw new InterviewError(providerError instanceof Error && providerError.name !== "TimeoutError" ? providerError.message : "Feedback timed out. Your answers are saved; please retry.", 503);
    }
  } catch (error) { return interviewFailure(error); }
}
