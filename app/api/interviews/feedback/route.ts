import { generateInterviewFeedback } from "@/utils/interviews/feedback-service";
import { requireHumanRequest } from "@/utils/security/human-check";
import { interviewFailure, interviewJson, readInterviewBody } from "@/utils/interviews/server";

export const maxDuration = 45;

export async function POST(request: Request) {
  try {
    const body = await readInterviewBody(request);
    await requireHumanRequest();
    return interviewJson({ attempt: await generateInterviewFeedback(body.attemptId) });
  } catch (error) {
    return interviewFailure(error);
  }
}
