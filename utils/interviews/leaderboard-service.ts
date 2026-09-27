import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { publicNameError, safePublicName } from "./public-name";
import { InterviewError } from "./server";

type BoardRow = { rank: number; display_name: string; score: number; completed_at: string; is_you: boolean | null };
type Preference = { display_name: string; leaderboard_opt_in: boolean };
let publicClient: ReturnType<typeof createSupabaseClient> | null = null;

function publicEntries(rows: BoardRow[]) {
  return rows.map((entry) => ({ ...entry, display_name: safePublicName(entry.display_name), is_you: entry.is_you === true }));
}

function anonymousClient() {
  if (publicClient) return publicClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new InterviewError("The leaderboard is temporarily unavailable. Please retry.", 503);
  publicClient = createSupabaseClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  return publicClient;
}

function readError() {
  throw new InterviewError("The leaderboard could not be loaded. Please retry.", 503);
}

export async function getInterviewLeaderboard() {
  const supabase = await createClient();
  let userId: string | null = null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch { /* Public scores remain available if account lookup fails. */ }
  const boardClient = userId ? supabase : anonymousClient();
  const boardRequest = boardClient.rpc("interview_leaderboard");

  if (!userId) {
    const board = await boardRequest;
    if (board.error) readError();
    return {
      entries: publicEntries((board.data ?? []) as BoardRow[]),
      preference: null,
      bestScore: null,
    };
  }

  const [board, preference, best] = await Promise.all([
    boardRequest,
    supabase.from("interview_preferences").select("display_name,leaderboard_opt_in").eq("user_id", userId).maybeSingle(),
    supabase.from("interview_attempts").select("score").eq("user_id", userId).eq("mode", "free").eq("station_slug", "why-medicine").eq("status", "completed").eq("rubric_version", "why-medicine-v1").not("score", "is", null).order("score", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (board.error || preference.error || best.error) readError();
  const savedPreference = (preference.data as Preference | null) ?? { display_name: `Candidate ${userId.slice(0, 6)}`, leaderboard_opt_in: false };
  return {
    entries: publicEntries((board.data ?? []) as BoardRow[]),
    preference: { ...savedPreference, display_name: safePublicName(savedPreference.display_name, `Candidate ${userId.slice(0, 6)}`) },
    bestScore: best.data?.score ?? null,
  };
}

export async function saveInterviewLeaderboardPreference(body: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new InterviewError("Sign in to save leaderboard preferences.", 401);
  if (typeof body.displayName !== "string" || typeof body.optIn !== "boolean") {
    throw new InterviewError("Enter a leaderboard name and sharing preference.");
  }
  const name = body.displayName.trim();
  const nameError = publicNameError(name);
  if (nameError) throw new InterviewError(nameError);
  const { error } = await createAdminClient().from("interview_preferences")
    .upsert({ user_id: user.id, display_name: name, leaderboard_opt_in: body.optIn, updated_at: new Date().toISOString() });
  if (error?.code === "23514") throw new InterviewError("Choose a nickname without profanity or offensive language.");
  if (error) throw new InterviewError("Your leaderboard preferences could not be saved. Please retry.", 503);
}
