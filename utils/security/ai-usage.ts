import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { databaseError, InterviewError } from "@/utils/interviews/server";

/** Database-backed, per-account protection; shared school/Wi-Fi IPs are not identities. */
export async function requireAiUsage(admin: SupabaseClient, userId: string, kind: "generation" | "speech") {
  const { data, error } = await admin.rpc("consume_interview_ai_usage", { p_user: userId, p_kind: kind });
  if (error) databaseError(error);
  if (data !== true) throw new InterviewError("AI requests are arriving too quickly. Your answers are saved; please wait a little before retrying.", 429);
}
