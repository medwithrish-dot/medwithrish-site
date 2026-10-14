import { interviewHistory, savedInterviewSummaries } from "@/utils/interviews/history";
import { InterviewError, interviewFailure, interviewJson, validId } from "@/utils/interviews/server";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const before = params.get("before");
    const beforeId = params.get("beforeId");
    if ((before !== null || beforeId !== null) && (!before || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.test(before) || !Number.isFinite(Date.parse(before)) || !validId(beforeId))) throw new InterviewError("Choose a valid saved interview page.", 400);
    const cursor = before && beforeId ? { startedAt: before, id: beforeId } : undefined;
    const history = await interviewHistory(cursor);
    if (history.message) throw new InterviewError(history.message, history.requiresSignIn ? 401 : 503);
    return interviewJson({ attempts: savedInterviewSummaries(history.attempts), nextCursor: history.nextCursor });
  } catch (error) { return interviewFailure(error); }
}
