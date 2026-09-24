import { databaseError, interviewContext, interviewFailure, InterviewError, validId } from "@/utils/interviews/server";
import { synthesizeInterviewSpeech } from "@/utils/interviews/text-to-speech";
import { questionIdForText } from "@/utils/interviews/station-question-selection";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const attemptId = url.searchParams.get("attempt");
    const index = Number(url.searchParams.get("question"));
    const voice = url.searchParams.get("voice");
    if (!validId(attemptId) || !Number.isInteger(index) || index < 0 || !["female", "male"].includes(voice ?? "")) {
      throw new InterviewError("Invalid speech request");
    }
    const { user, admin } = await interviewContext();
    const { data, error } = await admin.from("interview_attempts").select("*").eq("id", attemptId).eq("user_id", user.id).maybeSingle();
    if (error) databaseError(error);
    if (!data) throw new InterviewError("Interview not found", 404);
    if (data.status !== "in_progress") throw new InterviewError("This interview has ended", 409);
    const questions = Array.isArray(data.questions) ? data.questions as string[] : [];
    const question = questions[index];
    if (!question || question.length > 500) throw new InterviewError("Interview question not found", 404);

    // Generated probes are inserted immediately after a saved bank question.
    // Fixed questions already have local MP3s and must not spend Cloud TTS quota.
    const lastError = typeof data.last_error === "string" ? data.last_error : "";
    const claimed = /^ai_followup:([1-7])$/.exec(lastError);
    const probableProbe = claimed && index > 0 && index < questions.length && !questionIdForText(question);
    if (!probableProbe) throw new InterviewError("Recorded audio is used for this question", 400);

    const audio = await synthesizeInterviewSpeech(question, voice as "female" | "male");
    const body = Uint8Array.from(audio).buffer;
    return new Response(body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.byteLength),
        "Cache-Control": "private, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return interviewFailure(error);
  }
}
