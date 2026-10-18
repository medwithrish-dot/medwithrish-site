import "server-only";
import { createClient } from "@/utils/supabase/server";
import { getMedicForestEntitlements } from "@/utils/medicforest/premium-access";
import { databaseError } from "./server";

// Query the lifetime trial directly; a paginated history can omit older answers.
export async function freeChallengeDestination() {
  const { userId, isPremium } = await getMedicForestEntitlements();
  if (!userId || isPremium) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("interview_attempts")
    .select("id,status").eq("user_id", userId).eq("mode", "free")
    .order("started_at", { ascending: true }).limit(1).maybeSingle();
  if (error) databaseError(error);
  if (!data) return null;
  return data.status === "in_progress"
    ? `/medicforest/interview/ai-interviews?attempt=${encodeURIComponent(data.id)}`
    : `/medicforest/interview/reports/${encodeURIComponent(data.id)}`;
}
