import { createStripeClient } from "@/utils/stripe";
import { syncStripeSubscription } from "@/utils/stripe-subscriptions";
import { createClient as createServerSupabaseClient } from "@/utils/supabase/server";

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
    const sessionId = body && typeof body === "object" && "sessionId" in body
      ? body.sessionId
      : null;

    if (typeof sessionId !== "string" || !/^cs_[a-zA-Z0-9_]{1,240}$/.test(sessionId)) {
      return Response.json({ error: "Invalid sessionId." }, { status: 400 });
    }

    const stripe = createStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const checkoutUserId =
      session.client_reference_id ?? session.metadata?.supabase_user_id ?? null;

    if (checkoutUserId !== user.id) {
      return Response.json(
        { error: "Checkout session does not belong to this user." },
        { status: 403 }
      );
    }

    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

    if (session.mode !== "subscription" || !subscriptionId) {
      return Response.json(
        { error: "Checkout session has no subscription." },
        { status: 400 }
      );
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const result = await syncStripeSubscription(subscription, user.id);

    return Response.json(result);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not sync checkout.",
      },
      { status: 500 }
    );
  }
}
