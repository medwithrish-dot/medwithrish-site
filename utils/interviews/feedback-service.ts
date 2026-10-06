import "server-only";
import { InterviewAiBusyError, interviewProviderLoad } from "./provider-load";
import { randomUUID } from "node:crypto";
import type { InterviewAttempt } from "@/app/medicforest/interview/_lib/interview-types";
import { assessInterview, interviewAiConfigured } from "@/utils/interviews/openai";
import { databaseError, InterviewError, interviewContext, toInterviewAttempt, validId } from "@/utils/interviews/server";

type FeedbackClaim = {
  status: unknown;
  last_error: unknown;
  completed_at: unknown;
};

function requireSubmittedAttempt(row: FeedbackClaim) {
  const retryable = row.status === "failed" && ["awaiting_feedback", "feedback_unavailable"].includes(String(row.last_error));
  if ((!retryable && row.status !== "grading") || !row.completed_at) {
    throw new InterviewError("Finish the station before requesting feedback.", 409);
  }
}

function feedbackFailureMessage(error: unknown) {
  if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
    return "Feedback timed out. Your answers are saved; please retry.";
  }
  return "Feedback could not be generated. Your answers are saved; please retry.";
}

export async function generateInterviewFeedback(attemptId: unknown): Promise<InterviewAttempt> {
  const { user, admin } = await interviewContext();
  if (!validId(attemptId)) throw new InterviewError("Invalid Med interview ID");
  const { data: row, error } = await admin.from("interview_attempts").select("*").eq("id", attemptId).eq("user_id", user.id).maybeSingle();
  if (error) databaseError(error);
  if (!row) throw new InterviewError("Med Interview not found", 404);
  if (row.status === "completed") return toInterviewAttempt(row);
  requireSubmittedAttempt(row);
  if (!interviewAiConfigured()) throw new InterviewError("Free AI feedback is not enabled yet. Your answers are saved.", 503);

  const attempt = toInterviewAttempt(row);
  if (attempt.answers.map((answer) => answer.answer).join(" ").trim().split(/\s+/).filter(Boolean).length < 20) {
    throw new InterviewError("Save at least 20 words before requesting feedback.");
  }
  if (Date.now() < Date.parse(attempt.startedAt) + attempt.preparationSeconds * 1000) {
    throw new InterviewError("Preparation is still running.", 409);
  }

  // Reject a known cooldown before requesting another grading claim.
  try { interviewProviderLoad.assertAvailable(); }
  catch (error) {
    if (error instanceof InterviewAiBusyError) throw new InterviewError(error.message, 503);
    throw error;
  }
  const token = randomUUID();
  const { data: claimed, error: claimError } = await admin.rpc("claim_interview_grading", { p_user: user.id, p_attempt: row.id, p_token: token });
  if (claimError) databaseError(claimError);
  if (!claimed) throw new InterviewError("Feedback could not be started. Please retry.", 503);
  if (claimed.status === "completed") return toInterviewAttempt(claimed);

  const snapshot = toInterviewAttempt(claimed);
  const releaseClaim = async () => {
    const { error: releaseError } = await admin.from("interview_attempts")
      .update({ status: "failed", last_error: "feedback_unavailable" })
      .eq("id", row.id).eq("user_id", user.id).eq("grading_token", token).eq("status", "grading");
    if (releaseError) databaseError(releaseError);
  };

  let feedback: NonNullable<InterviewAttempt["feedback"]>;
  try {
    feedback = await assessInterview(snapshot.title, snapshot.answers, snapshot.questions.map((question, index) => ({ question, id: snapshot.questionIds?.[index] })));
  } catch (providerError) {
    await releaseClaim();
    throw new InterviewError(feedbackFailureMessage(providerError), 503);
  }

  const { data, error: saveError } = await admin.from("interview_attempts")
    .update({ status: "completed", feedback, score: feedback.score, completed_at: snapshot.completedAt ?? new Date().toISOString(), last_error: null })
    .eq("id", row.id).eq("user_id", user.id).eq("grading_token", token).eq("status", "grading").select().maybeSingle();
  if (saveError) {
    await releaseClaim();
    databaseError(saveError);
  }
  if (!data) throw new InterviewError("A newer feedback request is running. Refresh to see its result.", 409);
  return toInterviewAttempt(data);
}
