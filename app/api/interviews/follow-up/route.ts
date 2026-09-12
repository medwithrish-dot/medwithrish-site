import { followUpsEnabled } from "@/app/phloemai/interviews/_lib/station-flow";
import { findInterviewStation } from "@/app/phloemai/interviews/_data/interview-stations";
import { generateInterviewFollowUp, interviewAiConfigured } from "@/utils/interviews/gemini";
import { existingFollowUp, followUpClaimMask, practiceFollowUp } from "@/utils/interviews/follow-up";
import { databaseError, InterviewError, interviewContext, interviewFailure, interviewJson, readInterviewBody, toInterviewAttempt, validId } from "@/utils/interviews/server";

export const maxDuration = 25;

export async function POST(request: Request) {
  try {
    const body = await readInterviewBody(request);
    const { user, admin } = await interviewContext();
    if (!validId(body.attemptId) || typeof body.question !== "string" || body.question.length > 500) throw new InterviewError("Choose a valid interview question");

    const loadAttempt = async () => {
      const { data, error } = await admin.from("interview_attempts").select("*").eq("id", body.attemptId).eq("user_id", user.id).maybeSingle();
      if (error) databaseError(error);
      if (!data) throw new InterviewError("Interview not found", 404);
      return data;
    };
    let row = await loadAttempt();
    const station = findInterviewStation(row.station_slug);
    if (!station) throw new InterviewError("Station not found", 404);
    if (!followUpsEnabled(station.slug)) throw new InterviewError("Follow-ups are not enabled for this station.", 403);
    const originals: readonly string[] = station.questions;
    const questionNumber = originals.indexOf(body.question);
    if (questionNumber < 0 || !row.questions.includes(body.question)) throw new InterviewError("Follow-ups are available once for each main question");
    const question = body.question;
    const reply = (saved: Record<string, unknown>, followUp: string, source: "ai" | "practice" | "saved") => {
      const attempt = toInterviewAttempt(saved);
      return interviewJson({ attempt, followUp, questionIndex: attempt.questions.indexOf(followUp), source });
    };
    const validateWindow = (current: typeof row) => {
      if (current.status !== "in_progress") throw new InterviewError("This station is already submitted.", 409);
      const readyAt = Date.parse(current.started_at) + Number(current.preparation_seconds) * 1000;
      const endsAt = readyAt + Number(current.station_seconds) * 1000;
      if (!Number.isFinite(readyAt) || !Number.isFinite(endsAt)) throw new InterviewError("The interview timing could not be checked.", 409);
      if (Date.now() < readyAt) throw new InterviewError("Preparation is still running.", 409);
      if (Date.now() >= endsAt) throw new InterviewError("The answer window has closed. Submit your saved answers for feedback.", 409);
    };
    validateWindow(row);
    const existing = existingFollowUp(row.questions, question, originals);
    if (existing) return reply(row, existing, "saved");

    const snapshot = toInterviewAttempt(row);
    const answer = snapshot.answers.find((saved) => saved.question === question)?.answer.trim() ?? "";
    if (answer.split(/\s+/).filter(Boolean).length < 20) throw new InterviewError("Save at least 20 words in this answer before asking a follow-up.");
    if (answer.length > 8000 || snapshot.answers.reduce((sum, saved) => sum + saved.answer.length, 0) > 18000) throw new InterviewError("Please shorten your answer before asking a follow-up.");

    // Atomically reserve one provider call per original question. The daily/monthly
    // attempt quotas therefore also bound AI usage; retries cannot spend more quota.
    const mask = followUpClaimMask(row.last_error);
    const bit = 1 << questionNumber;
    if (mask & bit) throw new InterviewError("A follow-up is already being prepared for this answer. Continue with the next question if it is unavailable.", 409);
    let claim = admin.from("interview_attempts").update({ last_error: `ai_followup:${mask | bit}` }).eq("id", row.id).eq("user_id", user.id).eq("status", "in_progress");
    claim = row.last_error == null ? claim.is("last_error", null) : claim.eq("last_error", row.last_error);
    const { data: claimed, error: claimError } = await claim.select("id").maybeSingle();
    if (claimError) databaseError(claimError);
    if (!claimed) throw new InterviewError("Another interview update is running. Please try again.", 409);

    let source: "ai" | "practice" = "practice";
    let followUp = practiceFollowUp(answer, questionNumber);
    if (interviewAiConfigured()) {
      try {
        followUp = await generateInterviewFollowUp({ title: station.title, theme: station.theme, question, answer, previousAnswers: snapshot.answers.filter((saved) => saved.question !== question), existingQuestions: snapshot.questions });
        source = "ai";
      } catch {
        // No automatic provider/model retry, billing upgrade or second AI request.
        // The UI labels this local fallback as a practice prompt.
      }
    }

    // Merge independent follow-ups without overwriting other questions or answers.
    // Always reload: autosaves may have advanced while the model was responding.
    for (let retry = 0; retry < 3; retry += 1) {
      row = await loadAttempt();
      validateWindow(row);
      const saved = existingFollowUp(row.questions, question, originals);
      if (saved) return reply(row, saved, "saved");
      const questions = [...row.questions];
      if (questions.length >= originals.length * 2 || questions.includes(followUp)) throw new InterviewError("Continue with the remaining interview questions.", 409);
      questions.splice(questions.indexOf(question) + 1, 0, followUp);
      const { data, error } = await admin.from("interview_attempts").update({ questions }).eq("id", row.id).eq("user_id", user.id).eq("status", "in_progress").eq("questions", JSON.stringify(row.questions)).select().maybeSingle();
      if (error) databaseError(error);
      if (data) return reply(data, followUp, source);
    }
    throw new InterviewError("Your interview changed while the follow-up was being saved. Refresh to continue.", 409);
  } catch (error) { return interviewFailure(error); }
}
