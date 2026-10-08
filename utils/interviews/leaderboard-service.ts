import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { publicNameError, safePublicName } from "./public-name";
import { InterviewError } from "./server";
import { INTERVIEW_RUBRIC_VERSION } from "./scoring";

type BoardRow = { rank: number; display_name: string; score: number; completed_at: string; is_you: boolean | null };
type Preference = { display_name: string; leaderboard_opt_in: boolean };
let publicClient: ReturnType<typeof createSupabaseClient> | null = null;

function publicEntries(rows: BoardRow[]) {
  return rows.map((entry) => ({ rank: entry.rank, display_name: safePublicName(entry.display_name), score: entry.score, completed_at: entry.completed_at, is_you: entry.is_you === true }));
}

/** Compatibility for installations without the versioned RPC. Never use the v1 board. */
async function readCompatibleLeaderboard(userId: string | null) {
  const admin = createAdminClient();
  const entries: BoardRow[] = [];
  const ranked = new Set<string>();
  const pageSize = 200;
  // Bound work per request. An exceptionally large unmigrated installation should
  // apply the scoring migration rather than silently publish an incomplete board.
  for (let page = 0; page < 10; page += 1) {
    const { data: attempts, error } = await admin.from("interview_attempts")
      .select("user_id,score,completed_at").eq("mode", "free").eq("station_slug", "why-medicine")
      .eq("status", "completed").eq("rubric_version", INTERVIEW_RUBRIC_VERSION)
      .not("score", "is", null).order("score", { ascending: false })
      .order("completed_at", { ascending: true }).order("id", { ascending: true })
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) readError();
    if (!attempts?.length) return entries;
    const users = [...new Set(attempts.map(row => row.user_id))];
    const { data: preferences, error: preferenceError } = await admin.from("interview_preferences")
      .select("user_id,display_name").eq("leaderboard_opt_in", true).in("user_id", users);
    if (preferenceError) readError();
    const names = new Map((preferences ?? []).map(row => [row.user_id, row.display_name]));
    for (const attempt of attempts) {
      if (ranked.has(attempt.user_id) || !names.has(attempt.user_id)) continue;
      ranked.add(attempt.user_id);
      entries.push({ rank: entries.length + 1, display_name: names.get(attempt.user_id)!, score: attempt.score, completed_at: attempt.completed_at, is_you: attempt.user_id === userId });
      if (entries.length === 100) return entries;
    }
    if (attempts.length < pageSize) return entries;
  }
  readError();
}

async function readLeaderboard(client: Pick<Awaited<ReturnType<typeof createClient>>, "rpc">, userId: string | null) {
  const board = await client.rpc("interview_leaderboard_v2");
  if (board.error?.code === "PGRST202" || board.error?.code === "42883") return readCompatibleLeaderboard(userId);
  if (board.error) readError();
  return (board.data ?? []) as BoardRow[];
}

function anonymousClient() {
  if (publicClient) return publicClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new InterviewError("The leaderboard is temporarily unavailable. Please retry.", 503);
  publicClient = createSupabaseClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  return publicClient;
}

function readError(): never {
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
  const boardRequest = readLeaderboard(boardClient, userId);

  if (!userId) {
    const board = await boardRequest;
    return {
      entries: publicEntries(board),
      preference: null,
      bestScore: null,
    };
  }

  const [board, preference, best] = await Promise.all([
    boardRequest,
    supabase.from("interview_preferences").select("display_name,leaderboard_opt_in").eq("user_id", userId).maybeSingle(),
    supabase.from("interview_attempts").select("score").eq("user_id", userId).eq("mode", "free").eq("station_slug", "why-medicine").eq("status", "completed").eq("rubric_version", INTERVIEW_RUBRIC_VERSION).not("score", "is", null).order("score", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (preference.error || best.error) readError();
  const savedPreference = (preference.data as Preference | null) ?? { display_name: `Candidate ${userId.slice(0, 6)}`, leaderboard_opt_in: false };
  return {
    entries: publicEntries(board),
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
