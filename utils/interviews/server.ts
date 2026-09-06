import "server-only";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import type { InterviewAttempt } from "@/app/phloemai/interviews/_lib/interview-types";

export class InterviewError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export async function interviewContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new InterviewError("Sign in to save your interview and receive feedback.", 401);
  const admin = createAdminClient();
  const { data, error } = await admin.from("profiles").select("current_plan").eq("id", user.id).maybeSingle();
  if (error) throw new InterviewError("Your account could not be loaded. Please retry.", 503);
  return { user, supabase, admin, isPremium: data?.current_plan === "premium" };
}
export function interviewJson(data: object, status = 200) {
  return Response.json({ ...data, serverNow: new Date().toISOString() }, { status, headers: { "Cache-Control": "private, no-store" } });
}
export function interviewFailure(error: unknown) {
  if (error instanceof InterviewError) return interviewJson({ error: error.message }, error.status);
  return interviewJson({ error: "Interview services are temporarily unavailable. Your saved work is safe; please retry." }, 503);
}
export function databaseError(error: { code?: string; message: string }) {
  if (error.code === "42P01" || error.code === "PGRST202" || error.code === "PGRST205") throw new InterviewError("Interview storage is being set up. Please try again once setup is complete.", 503);
  if (error.code === "P0001") throw new InterviewError(error.message, /limit reached/i.test(error.message) ? 429 : 409);
  throw new InterviewError("Your interview could not be saved. Please retry.", 503);
}
export async function readInterviewBody(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new InterviewError("Invalid request origin", 403);
  if (Number(request.headers.get("content-length") ?? 0) > 45000) throw new InterviewError("Answer is too long", 413);
  if (!request.headers.get("content-type")?.includes("application/json")) throw new InterviewError("A JSON request is required", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new InterviewError("A request body is required");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 45000) { await reader.cancel(); throw new InterviewError("Answer is too long", 413); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  const text = new TextDecoder().decode(bytes);
  try {
    const body = JSON.parse(text);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return body as Record<string, unknown>;
  } catch { throw new InterviewError("Invalid request", 400); }
}
export function validId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
export function toInterviewAttempt(row: Record<string, unknown>): InterviewAttempt {
  const completedAt = row.completed_at as string | null;
  return {
    id: row.id as string, mode: row.mode as InterviewAttempt["mode"], universitySlug: row.university_slug as string | null,
    stationSlug: row.station_slug as string, title: row.title as string, status: row.status as InterviewAttempt["status"],
    startedAt: row.started_at as string, completedAt, answerSubmittedAt: row.answer_submitted_at as string | null | undefined, preparationSeconds: Number(row.preparation_seconds), stationSeconds: Number(row.station_seconds),
    breakSeconds: Number(row.break_seconds), stationIndex: Number(row.station_index), stationCount: Number(row.station_count),
    questions: row.questions as string[], answers: row.answers as InterviewAttempt["answers"], metrics: (row.metrics ?? {}) as Record<string, number>,
    feedback: row.feedback as InterviewAttempt["feedback"], circuitId: row.circuit_id as string,
    nextAvailableAt: completedAt ? new Date(Date.parse(completedAt) + Number(row.break_seconds) * 1000).toISOString() : null,
  };
}
