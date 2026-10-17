import { generateQuestionFeedback, readQuestionFeedbackAccess, QuestionFeedbackUpgradeRequired } from "@/utils/interviews/question-feedback-service";
import { interviewFailure, interviewJson, readInterviewBody } from "@/utils/interviews/server";
import { requireHumanRequest } from "@/utils/security/human-check";

export const maxDuration = 60;

export async function GET(request: Request) {
  try { return interviewJson(await readQuestionFeedbackAccess(new URL(request.url).searchParams.get("question"))); }
  catch (error) { return interviewFailure(error); }
}

export async function POST(request: Request) {
  try {
    const body = await readInterviewBody(request);
    await requireHumanRequest();
    return interviewJson(await generateQuestionFeedback(body.questionId, body.answer));
  } catch (error) {
    if (error instanceof QuestionFeedbackUpgradeRequired) return interviewJson({ error: error.message, upgradeRequired: true }, 403);
    return interviewFailure(error);
  }
}
