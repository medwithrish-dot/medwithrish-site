import { generateInterviewFeedback } from "@/utils/interviews/feedback-service";
import { interviewFailure, interviewJson, readInterviewBody } from "@/utils/interviews/server";

export const maxDuration = 45;

export async function POST(request: Request) {
  try {
    const body = await readInterviewBody(request);
    return interviewJson({ attempt: await generateInterviewFeedback(body.attemptId) });
  } catch (error) {
    return interviewFailure(error);
  }
}
