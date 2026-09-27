import { getPathwayProgress, savePathwayProgress } from "@/utils/interviews/pathway-service";
import { interviewFailure, interviewJson, readInterviewBody } from "@/utils/interviews/server";

export async function GET() {
  try {
    return interviewJson(await getPathwayProgress());
  } catch (error) {
    return interviewFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await readInterviewBody(request);
    return interviewJson(await savePathwayProgress(body));
  } catch (error) {
    return interviewFailure(error);
  }
}
