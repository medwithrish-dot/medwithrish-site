import { databaseError, InterviewError, interviewContext, interviewFailure, interviewJson, readInterviewBody } from "@/utils/interviews/server";
import { publicNameError, safePublicName } from "@/utils/interviews/public-name";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const admin = createAdminClient();
    const board = await (user ? supabase : admin).rpc("interview_leaderboard");
    if (board.error) databaseError(board.error);
    if (!user) return interviewJson({
      entries: (board.data ?? []).map((entry: { display_name: string }) => ({ ...entry, display_name: safePublicName(entry.display_name), is_you: false })),
      preference: null, bestScore: null,
    });
    const [preference, best] = await Promise.all([
      admin.from("interview_preferences").select("display_name,leaderboard_opt_in").eq("user_id", user.id).maybeSingle(),
      admin.from("interview_attempts").select("score").eq("user_id", user.id).eq("mode", "free").eq("station_slug", "why-medicine").eq("status", "completed").eq("rubric_version", "why-medicine-v1").order("score", { ascending: false }).limit(1).maybeSingle(),
    ]);
    if (preference.error) databaseError(preference.error);
    if (best.error) databaseError(best.error);
    const savedPreference = preference.data ?? { display_name: `Candidate ${user.id.slice(0, 6)}`, leaderboard_opt_in: false };
    return interviewJson({
      entries: (board.data ?? []).map((entry: { display_name: string }) => ({ ...entry, display_name: safePublicName(entry.display_name) })),
      preference: { ...savedPreference, display_name: safePublicName(savedPreference.display_name, `Candidate ${user.id.slice(0, 6)}`) },
      bestScore: best.data?.score ?? null,
    });
  } catch (error) { return interviewFailure(error); }
}

export async function PATCH(request: Request) {
  try {
    const body = await readInterviewBody(request);
    const { user, admin } = await interviewContext();
    if (typeof body.displayName !== "string" || typeof body.optIn !== "boolean") throw new InterviewError("Enter a leaderboard name and sharing preference");
    const name = body.displayName.trim();
    const nameError = publicNameError(name);
    if (nameError) throw new InterviewError(nameError);
    const { error } = await admin.from("interview_preferences").upsert({ user_id: user.id, display_name: name, leaderboard_opt_in: body.optIn, updated_at: new Date().toISOString() });
    if (error?.code === "23514") throw new InterviewError("Choose a nickname without profanity or offensive language.");
    if (error) databaseError(error);
    return interviewJson({ saved: true });
  } catch (error) { return interviewFailure(error); }
}
