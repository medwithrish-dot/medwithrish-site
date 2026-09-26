import { createClient as createServerSupabaseClient } from "@/utils/supabase/server";
import { synchronizeCheckoutSession } from "@/utils/billing/billing-service";
import { toBillingResponse } from "@/utils/billing/billing-errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json({ error: "Log in before syncing." }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid request body." }, { status: 400 });
    }

    const sessionId =
      body && typeof body === "object" && "sessionId" in body
        ? (body as { sessionId?: unknown }).sessionId
        : null;

    if (
      typeof sessionId !== "string" ||
      !/^cs_[a-zA-Z0-9_]{1,240}$/.test(sessionId)
    ) {
      return Response.json({ error: "Invalid sessionId." }, { status: 400 });
    }

    const outcome = await synchronizeCheckoutSession({ user, sessionId });
    return Response.json(outcome);
  } catch (error) {
    return toBillingResponse(error, "Could not sync checkout.");
  }
}
