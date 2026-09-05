import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const actions = new Set([
  "create", "join", "invite", "remove", "leave", "delete",
  "create_room", "start_room", "end_room", "answer", "message",
]);

function json(value: unknown, status = 200) {
  return NextResponse.json(value, { status, headers: { "Cache-Control": "no-store" } });
}

async function execute(action: string, groupId: string | null, payload: Record<string, unknown>) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return json({ error: "Sign in to use study groups." }, 401);

    // The RPC uses auth.uid(), checks membership, and locks mutations in one transaction.
    // Never accept a caller-supplied actor ID or bypass those checks with a service key.
    const { data, error } = await supabase.rpc("interview_groups_action", {
      p_action: action,
      p_group_id: groupId,
      p_payload: payload,
    });
    if (error) {
      if (error.code === "PGRST202" || error.code === "42P01") {
        return json({ error: "Study groups are not available yet. The database setup needs to be completed." }, 503);
      }
      if (error.code === "P0001") return json({ error: error.message }, 400);
      if (error.code === "42501") return json({ error: "This group is unavailable or you are no longer a member." }, 403);
      console.error("Interview group request failed", { code: error.code });
      return json({ error: "We could not update your study group. Please try again." }, 500);
    }
    return json(data);
  } catch {
    return json({ error: "Study groups are temporarily unavailable. Please try again later." }, 503);
  }
}

export async function GET(request: NextRequest) {
  const groupId = request.nextUrl.searchParams.get("groupId");
  const roomId = request.nextUrl.searchParams.get("roomId");
  if ((groupId && !uuid.test(groupId)) || (roomId && !uuid.test(roomId))) {
    return json({ error: "Invalid group or room." }, 400);
  }
  return execute(groupId ? "details" : "list", groupId, roomId ? { roomId } : {});
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return json({ error: "Invalid request origin." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ error: "A JSON request is required." }, 415);
  }
  // Bound actual bytes, including chunked requests, before parsing user text.
  const reader = request.body?.getReader();
  if (!reader) return json({ error: "A request body is required." }, 400);
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 32_768) {
      await reader.cancel();
      return json({ error: "Your response is too long." }, 413);
    }
    chunks.push(value);
  }
  let body: Record<string, unknown>;
  try {
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid body");
    body = parsed;
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }
  const { action, groupId, ...payload } = body;
  if (typeof action !== "string" || !actions.has(action)) return json({ error: "Unknown group action." }, 400);
  if (groupId !== undefined && groupId !== null && (typeof groupId !== "string" || !uuid.test(groupId))) {
    return json({ error: "Invalid group." }, 400);
  }
  for (const key of ["roomId", "userId"]) {
    if (payload[key] !== undefined && (typeof payload[key] !== "string" || !uuid.test(payload[key] as string))) {
      return json({ error: "Invalid member or room." }, 400);
    }
  }
  return execute(action, typeof groupId === "string" ? groupId : null, payload);
}
