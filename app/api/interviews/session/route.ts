import { randomUUID } from "node:crypto";
import { findInterviewUniversity } from "@/app/phloemai/interviews/_data/universities";
import { findInterviewStation, interviewStations } from "@/app/phloemai/interviews/_data/interview-stations";
import { databaseError, InterviewError, interviewContext, interviewFailure, interviewJson, readInterviewBody, toInterviewAttempt, validId } from "@/utils/interviews/server";

export async function GET(request: Request) {
  try {
    const { user, admin, isPremium } = await interviewContext();
    const id = new URL(request.url).searchParams.get("attempt");
    if (id && !validId(id)) throw new InterviewError("Invalid interview ID");
    let query = admin.from("interview_attempts").select("*").eq("user_id", user.id);
    query = id ? query.eq("id", id) : query.in("status", ["in_progress", "grading"]).order("started_at", { ascending: false }).limit(1);
    const { data, error } = await query.maybeSingle();
    if (error) databaseError(error);
    if (id && !data) throw new InterviewError("Interview not found", 404);
    return interviewJson({ attempt: data ? toInterviewAttempt(data) : null, configured: Boolean(process.env.GEMINI_API_KEY), isPremium });
  } catch (error) { return interviewFailure(error); }
}

function configuredLimit(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 && value <= 1000 ? value : fallback;
}

export async function POST(request: Request) {
  try {
    const body = await readInterviewBody(request);
    const { user, admin, isPremium } = await interviewContext();
    const mode = body.mode;
    if (!["free", "university", "station", "reference"].includes(String(mode))) throw new InterviewError("Choose an interview mode");
    if (mode !== "free" && !isPremium) throw new InterviewError("University circuits and additional stations require Premium. The Why medicine? station is free.", 403);
    const university = typeof body.universitySlug === "string" ? findInterviewUniversity(body.universitySlug) : undefined;
    if (mode === "university" && !university) throw new InterviewError("Choose a university");
    const index = body.stationIndex === undefined ? 0 : Number(body.stationIndex);
    const circuitMode = mode === "university" || mode === "reference";
    const defaultCount = mode === "university" ? Math.min(20, university!.stationCount) : mode === "reference" ? 5 : 1;
    let count = defaultCount;
    if (body.stationCount !== undefined) {
      if (typeof body.stationCount !== "number" || !Number.isInteger(body.stationCount) || body.stationCount < 1 || body.stationCount > interviewStations.length || (!circuitMode && body.stationCount !== 1)) throw new InterviewError("Choose between one and nine stations");
      count = body.stationCount;
    }
    if (!Number.isInteger(index) || index < 0 || index >= 20 || (!circuitMode && index !== 0)) throw new InterviewError("Invalid station number");
    if (body.circuitId !== undefined && !validId(body.circuitId)) throw new InterviewError("Invalid circuit ID");
    const circuitId = typeof body.circuitId === "string" ? body.circuitId : randomUUID();
    if (index > 0) {
      if (!body.circuitId) throw new InterviewError("Start your circuit with the first station");
      const { data: previous, error } = await admin.from("interview_attempts").select("*").eq("user_id", user.id).eq("circuit_id", circuitId).eq("station_index", index - 1).maybeSingle();
      if (error) databaseError(error);
      if (!previous || previous.status !== "completed" || previous.mode !== mode || previous.university_slug !== (mode === "university" ? university!.slug : null)) throw new InterviewError("Complete the previous station first", 409);
      count = previous.station_count;
      if (body.stationCount !== undefined && body.stationCount !== count) throw new InterviewError("The number of stations cannot change during a circuit", 409);
      if (Date.now() < Date.parse(previous.completed_at) + previous.break_seconds * 1000) throw new InterviewError("Your break is still running. The next station will be ready shortly.", 409);
    }
    if (index >= count) throw new InterviewError("This circuit has no more stations", 409);
    const station = mode === "free" ? interviewStations[0] : mode === "station" || (circuitMode && body.stationSlug !== undefined) ? findInterviewStation(String(body.stationSlug ?? "")) : interviewStations[index % interviewStations.length];
    if (!station) throw new InterviewError("Station not found", 404);
    const payload = {
      mode, university_slug: mode === "university" ? university!.slug : null, station_slug: station.slug,
      title: station.title, circuit_id: circuitId, station_index: index, station_count: count,
      preparation_seconds: mode === "university" ? university!.preparationSeconds : mode === "reference" ? 0 : 60,
      station_seconds: mode === "university" ? university!.stationSeconds : 480,
      break_seconds: circuitMode ? (mode === "university" ? university!.breakSeconds : 120) : 0,
      questions: [...station.questions],
    };
    const { data, error } = await admin.rpc("reserve_interview_attempt", {
      p_user: user.id, p_payload: payload,
      p_daily: isPremium ? configuredLimit("INTERVIEW_PREMIUM_DAILY_LIMIT", 20) : configuredLimit("INTERVIEW_FREE_DAILY_LIMIT", 2),
      p_monthly: isPremium ? configuredLimit("INTERVIEW_PREMIUM_MONTHLY_LIMIT", 300) : configuredLimit("INTERVIEW_FREE_MONTHLY_LIMIT", 30),
    });
    if (error) databaseError(error);
    return interviewJson({ attempt: toInterviewAttempt(data), isPremium, configured: Boolean(process.env.GEMINI_API_KEY) });
  } catch (error) { return interviewFailure(error); }
}

export async function PATCH(request: Request) {
  try {
    const body = await readInterviewBody(request);
    const { user, admin } = await interviewContext();
    if (!validId(body.attemptId) || !Array.isArray(body.answers)) throw new InterviewError("Invalid interview answers");
    const { data: row, error } = await admin.from("interview_attempts").select("*").eq("user_id", user.id).eq("id", body.attemptId).maybeSingle();
    if (error) databaseError(error);
    if (!row) throw new InterviewError("Interview not found", 404);
    if (row.status !== "in_progress") throw new InterviewError("This station is already submitted. Your saved answers are locked.", 409);
    // Short transport grace allows an in-flight final autosave, never extra practice time.
    if (Date.now() > Date.parse(row.started_at) + (row.preparation_seconds + row.station_seconds + 30) * 1000) throw new InterviewError("The answer window has closed. Submit your last saved answers for feedback.", 409);
    if (body.answers.length > row.questions.length) throw new InterviewError("Too many answers");
    const seen = new Set<string>();
    const answers = body.answers.map((value: unknown) => {
      if (!value || typeof value !== "object") throw new InterviewError("Invalid answer");
      const answer = value as Record<string, unknown>;
      if (typeof answer.question !== "string" || !row.questions.includes(answer.question) || seen.has(answer.question) || typeof answer.answer !== "string" || answer.answer.length > 8000) throw new InterviewError("Invalid answer or answer too long");
      seen.add(answer.question);
      return { question: answer.question, answer: answer.answer.trim() };
    });
    if (answers.reduce((sum, answer) => sum + answer.answer.length, 0) > 18000) throw new InterviewError("Please keep the station transcript under 18,000 characters");
    const metrics: Record<string, number> = {};
    if (body.metrics && typeof body.metrics === "object") {
      for (const key of ["wordCount", "fillerCount", "repetitionCount"]) {
        const value = (body.metrics as Record<string, unknown>)[key];
        if (typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 10000) metrics[key] = value;
      }
    }
    const { data, error: saveError } = await admin.from("interview_attempts").update({ answers, metrics }).eq("id", row.id).eq("user_id", user.id).eq("status", "in_progress").select().maybeSingle();
    if (saveError) databaseError(saveError);
    if (!data) throw new InterviewError("Feedback has started; answers are now locked.", 409);
    return interviewJson({ attempt: toInterviewAttempt(data) });
  } catch (error) { return interviewFailure(error); }
}

export async function DELETE(request: Request) {
  try {
    const body = await readInterviewBody(request);
    const { user, admin } = await interviewContext();
    if (!validId(body.attemptId)) throw new InterviewError("Invalid interview ID");
    const { data, error } = await admin.from("interview_attempts").update({ status: "failed", last_error: "abandoned" }).eq("user_id", user.id).eq("id", body.attemptId).eq("status", "in_progress").select("id").maybeSingle();
    if (error) databaseError(error);
    if (!data) throw new InterviewError("Only an active station can be ended", 409);
    return interviewJson({ ended: true });
  } catch (error) { return interviewFailure(error); }
}
