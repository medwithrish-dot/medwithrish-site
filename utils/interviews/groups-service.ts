import "server-only";
import { createClient } from "@/utils/supabase/server";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const actions = new Set(["create", "join", "invite", "remove", "leave", "delete", "create_room", "start_room", "end_room", "answer", "message"]);

export class GroupError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

async function execute(action: string, groupId: string | null, payload: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new GroupError("Sign in to use study groups.", 401);

  // The authenticated RPC checks membership and locks mutations in one transaction.
  const { data, error } = await supabase.rpc("interview_groups_action", {
    p_action: action, p_group_id: groupId, p_payload: payload,
  });
  if (error?.code === "PGRST202" || error?.code === "42P01") {
    throw new GroupError("Study groups are not available yet. The database setup needs to be completed.", 503);
  }
  if (error?.code === "P0001") throw new GroupError(error.message);
  if (error?.code === "42501") throw new GroupError("This group is unavailable or you are no longer a member.", 403);
  if (error) {
    console.error("Interview group request failed", { code: error.code });
    throw new GroupError("We could not update your study group. Please try again.", 500);
  }
  return data;
}

export async function getStudyGroups(request: Request) {
  const params = new URL(request.url).searchParams;
  const groupId = params.get("groupId");
  const roomId = params.get("roomId");
  if ((groupId && !uuid.test(groupId)) || (roomId && !uuid.test(roomId)) || (roomId && !groupId)) {
    throw new GroupError("Invalid group or room.");
  }
  return execute(groupId ? "details" : "list", groupId, roomId ? { roomId } : {});
}

async function readGroupBody(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new GroupError("Invalid request origin.", 403);
  if (!request.headers.get("content-type")?.includes("application/json")) throw new GroupError("A JSON request is required.", 415);
  if (Number(request.headers.get("content-length") ?? 0) > 32_768) throw new GroupError("Your response is too long.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new GroupError("A request body is required.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 32_768) {
        await reader.cancel().catch(() => undefined);
        throw new GroupError("Your response is too long.", 413);
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const body: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new GroupError("Invalid request body.");
    return body as Record<string, unknown>;
  } catch (error) {
    if (error instanceof GroupError) throw error;
    throw new GroupError("Invalid request body.");
  }
}

export async function changeStudyGroup(request: Request) {
  const { action, groupId, ...payload } = await readGroupBody(request);
  if (typeof action !== "string" || !actions.has(action)) throw new GroupError("Unknown group action.");
  if (groupId !== undefined && groupId !== null && (typeof groupId !== "string" || !uuid.test(groupId))) {
    throw new GroupError("Invalid group.");
  }
  for (const key of ["roomId", "userId"]) {
    if (payload[key] !== undefined && (typeof payload[key] !== "string" || !uuid.test(payload[key] as string))) {
      throw new GroupError("Invalid member or room.");
    }
  }
  return execute(action, typeof groupId === "string" ? groupId : null, payload);
}
