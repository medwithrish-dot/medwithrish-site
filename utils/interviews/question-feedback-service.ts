import "server-only";
import { createHash } from "node:crypto";
import { INTERVIEW_QUESTIONS } from "@/app/medicforest/interview/_data/interviewQuestionBank";
import { getWordCount } from "@/app/medicforest/interview/_lib/question-bank-storage";
import { stripSpeechPauseMarkers } from "@/app/medicforest/interview/_lib/speech-delivery";
import { FREE_QUESTION_FEEDBACK_USED, QUESTION_BANK_FEEDBACK_STATION } from "@/app/medicforest/interview/_lib/question-feedback";
import { generateInterviewFeedback } from "./feedback-service";
import { interviewAiConfigured } from "./openai";
import { databaseError, InterviewError, interviewContext, toInterviewAttempt } from "./server";

function findQuestion(id: unknown) {
  const question = INTERVIEW_QUESTIONS.find((item) => item.id === id);
  if (!question) throw new InterviewError("Interview question not found", 404);
  return question;
}

export class QuestionFeedbackUpgradeRequired extends InterviewError {
  constructor() { super(FREE_QUESTION_FEEDBACK_USED, 403); }
}

// Reuse the protected saved-report table: its (user_id, circuit_id, station_index)
// unique constraint atomically reserves a single lifetime free report. Browser
// accounts have read access only, so resetting question progress cannot reset it.
function paidCircuitId(userId: string, questionId: string, answer: string) {
  const hex = createHash("sha256").update(JSON.stringify(["question-bank-feedback", userId, questionId, answer])).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export async function readQuestionFeedbackAccess(questionId: unknown) {
  const question = findQuestion(questionId);
  const { user, admin, isPremium } = await interviewContext();
  const [free, latest] = await Promise.all([
    admin.from("interview_attempts").select("id").eq("user_id", user.id)
      .eq("circuit_id", user.id).eq("station_index", 0).eq("station_slug", QUESTION_BANK_FEEDBACK_STATION).maybeSingle(),
    admin.from("interview_attempts").select("*").eq("user_id", user.id)
      .eq("station_slug", QUESTION_BANK_FEEDBACK_STATION).contains("questions", [question.text])
      .order("started_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (free.error) databaseError(free.error);
  if (latest.error) databaseError(latest.error);
  return { isPremium, freeUsed: Boolean(free.data), attempt: latest.data ? toInterviewAttempt(latest.data) : null };
}

export async function generateQuestionFeedback(questionId: unknown, rawAnswer: unknown) {
  const question = findQuestion(questionId);
  if (typeof rawAnswer !== "string" || rawAnswer.length > 30000) throw new InterviewError("Invalid saved answer");
  const answer = stripSpeechPauseMarkers(rawAnswer).trim();
  if (getWordCount(answer) < 20) throw new InterviewError("Write at least 20 words before generating AI feedback.");
  const { user, admin, isPremium } = await interviewContext();
  const circuitId = isPremium ? paidCircuitId(user.id, question.id, answer) : user.id;
  const lookup = () => admin.from("interview_attempts").select("*")
    .eq("user_id", user.id).eq("circuit_id", circuitId).eq("station_index", 0).maybeSingle();
  const { data: initialRow, error } = await lookup();
  if (error) databaseError(error);
  let row = initialRow;
  if (!row) {
    if (!interviewAiConfigured()) throw new InterviewError("AI feedback is currently unavailable. Your saved answer is safe; please try again later.", 503);
    const now = new Date().toISOString();
    const inserted = await admin.from("interview_attempts").insert({
      user_id: user.id, mode: "reference", station_slug: QUESTION_BANK_FEEDBACK_STATION,
      title: question.text, circuit_id: circuitId, station_index: 0, station_count: 1,
      preparation_seconds: 0, station_seconds: 60, break_seconds: 0,
      questions: [question.text], answers: [{ question: question.text, answer }],
      metrics: { wordCount: getWordCount(answer), questionBankFeedback: 1, freeQuestionBankFeedback: isPremium ? 0 : 1 },
      started_at: now, completed_at: now,
      status: "failed", last_error: "awaiting_feedback",
    }).select("*").maybeSingle();
    if (inserted.error && inserted.error.code !== "23505") databaseError(inserted.error);
    // A concurrent request may have reserved the free slot first.
    const existing = inserted.data ? inserted : await lookup();
    if (existing.error) databaseError(existing.error);
    row = existing.data;
  }
  if (!row) throw new InterviewError("Feedback could not be started. Please try again.", 503);
  const saved = toInterviewAttempt(row);
  const sameResponse = row.station_slug === QUESTION_BANK_FEEDBACK_STATION
    && saved.questions[0] === question.text && saved.answers[0]?.answer === answer;
  if (!sameResponse) {
    if (!isPremium) throw new QuestionFeedbackUpgradeRequired();
    throw new InterviewError("Saved feedback does not match this answer. Please retry.", 409);
  }
  const attempt = await generateInterviewFeedback(saved.id);
  return { attempt, isPremium, freeUsed: !isPremium };
}
