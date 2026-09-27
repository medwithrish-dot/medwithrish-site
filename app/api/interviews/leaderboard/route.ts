import { getInterviewLeaderboard, saveInterviewLeaderboardPreference } from "@/utils/interviews/leaderboard-service";
import { interviewFailure, interviewJson, readInterviewBody } from "@/utils/interviews/server";

export async function GET() {
  try {
    return interviewJson(await getInterviewLeaderboard());
  } catch (error) {
    return interviewFailure(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await readInterviewBody(request);
    await saveInterviewLeaderboardPreference(body);
    return interviewJson({ saved: true });
  } catch (error) {
    return interviewFailure(error);
  }
}
