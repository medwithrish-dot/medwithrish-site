import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FREE_QUESTION_FEEDBACK_USED } from "@/app/medicforest/interview/_lib/question-feedback";
import { databaseError, InterviewError } from "./server";

type CreditAttempt = {
  id: string;
  circuit_id: string;
  feedback?: unknown;
};

/**
 * Free question feedback already uses (user_id, user_id, station 0) as its
 * durable lifetime slot. A free Why Medicine attempt claims that same unique
 * slot before grading, so concurrent requests cannot spend the allowance twice.
 */
export async function readFreeInterviewFeedbackCredit(admin: SupabaseClient, userId: string) {
  const [slot, whyMedicine] = await Promise.all([
    admin.from("interview_attempts").select("id,circuit_id,feedback")
      .eq("user_id", userId).eq("circuit_id", userId).eq("station_index", 0).maybeSingle(),
    admin.from("interview_attempts").select("id,circuit_id,feedback")
      .eq("user_id", userId).eq("mode", "free").eq("station_slug", "why-medicine").limit(1).maybeSingle(),
  ]);
  if (slot.error) databaseError(slot.error);
  if (whyMedicine.error) databaseError(whyMedicine.error);
  const legacyWhyMedicine = whyMedicine.data as CreditAttempt | null;
  return {
    slot: slot.data as CreditAttempt | null,
    legacyWhyMedicine: legacyWhyMedicine?.feedback ? legacyWhyMedicine : null,
    freeUsed: Boolean(slot.data || legacyWhyMedicine?.feedback),
  };
}

export async function claimWhyMedicineFeedbackCredit(admin: SupabaseClient, userId: string, attemptId: string) {
  const credit = await readFreeInterviewFeedbackCredit(admin, userId);
  if (credit.legacyWhyMedicine && credit.legacyWhyMedicine.id !== attemptId) {
    throw new InterviewError(FREE_QUESTION_FEEDBACK_USED, 403);
  }
  if (credit.slot) {
    if (credit.slot.id === attemptId) return;
    throw new InterviewError(FREE_QUESTION_FEEDBACK_USED, 403);
  }

  const { data, error } = await admin.from("interview_attempts")
    .update({ circuit_id: userId })
    .eq("id", attemptId).eq("user_id", userId)
    .select("id").maybeSingle();
  if (error?.code === "23505") throw new InterviewError(FREE_QUESTION_FEEDBACK_USED, 403);
  if (error) databaseError(error);
  if (!data) throw new InterviewError("Your AI feedback credit could not be reserved. Please retry.", 503);
}
