import "server-only";
import { createClient } from "@/utils/supabase/server";
import { toInterviewAttempt } from "./server";
import type { InterviewAttempt } from "@/app/medicforest/interview/_lib/interview-types";
import { interviewStations } from "@/app/medicforest/interview/_data/interview-stations";
import { interviewUniversities } from "@/app/medicforest/interview/_data/universities";
import { canResumeSavedInterview } from "@/app/medicforest/interview/_lib/saved-interviews";

export type InterviewHistoryCursor = { startedAt: string; id: string };
export const INTERVIEW_HISTORY_PAGE_SIZE = 300;
const universityNames = new Map(interviewUniversities.map((university) => [university.slug, university.name]));

export function savedInterviewSummaries(attempts: InterviewAttempt[], loadedAt = Date.now()) {
  return attempts.map((attempt) => ({
    id: attempt.id, circuitId: attempt.circuitId, stationIndex: attempt.stationIndex, stationCount: attempt.stationCount,
    title: interviewStations.find((station) => station.slug === attempt.stationSlug)?.title ?? attempt.title,
    stationSlug: attempt.stationSlug, universitySlug: attempt.universitySlug,
    universityName: attempt.universitySlug ? universityNames.get(attempt.universitySlug) ?? attempt.universitySlug.replaceAll("-", " ") : "General practice",
    status: attempt.status, canResume: canResumeSavedInterview(attempt, loadedAt), feedbackScore: attempt.feedback?.score ?? null,
    startedAtLabel: new Date(attempt.startedAt).toLocaleString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
  }));
}

export async function interviewHistory(cursor?: InterviewHistoryCursor): Promise<{ attempts: InterviewAttempt[]; message: string | null; signedIn: boolean; nextCursor: InterviewHistoryCursor | null; requiresSignIn?: boolean }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { attempts: [], signedIn: false, requiresSignIn: true, nextCursor: null, message: "Sign in to keep your interviews, feedback and progress together." };
    // History cards need only the score; load full feedback and transcripts for a report.
    let query = supabase.from("interview_attempts")
      .select("id,mode,university_slug,station_slug,title,status,last_error,circuit_id,station_index,station_count,preparation_seconds,station_seconds,break_seconds,feedback_score:feedback->score,started_at,completed_at,answer_submitted_at")
      .eq("user_id", user.id).order("started_at", { ascending: false }).order("id", { ascending: false }).limit(INTERVIEW_HISTORY_PAGE_SIZE + 1);
    if (cursor) query = query.or(`started_at.lt.${cursor.startedAt},and(started_at.eq.${cursor.startedAt},id.lt.${cursor.id})`);
    const { data, error } = await query;
    if (error) return { attempts: [], signedIn: true, nextCursor: null, message: "Your saved interviews could not be loaded. Please try again shortly." };
    const rows = (data ?? []).slice(0, INTERVIEW_HISTORY_PAGE_SIZE);
    const last = rows.at(-1);
    const nextCursor = (data?.length ?? 0) > INTERVIEW_HISTORY_PAGE_SIZE && last ? { startedAt: String(last.started_at), id: String(last.id) } : null;
    return { attempts: rows.map((row) => toInterviewAttempt({ ...row, feedback: typeof row.feedback_score === "number" ? { score: row.feedback_score } : null, questions: [], answers: [], metrics: {} })), signedIn: true, message: null, nextCursor };
  } catch { return { attempts: [], signedIn: false, nextCursor: null, message: "Med Interview services are temporarily unavailable. Please try again shortly." }; }
}
