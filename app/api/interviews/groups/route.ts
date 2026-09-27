import { changeStudyGroup, getStudyGroups, GroupError } from "@/utils/interviews/groups-service";

function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
}

function failure(error: unknown) {
  return json({ error: error instanceof GroupError ? error.message : "Study groups are temporarily unavailable. Please try again later." }, error instanceof GroupError ? error.status : 503);
}

export async function GET(request: Request) {
  try {
    return json(await getStudyGroups(request));
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  try {
    return json(await changeStudyGroup(request));
  } catch (error) {
    return failure(error);
  }
}
