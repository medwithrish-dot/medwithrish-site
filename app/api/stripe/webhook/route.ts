import type Stripe from "stripe";
import { createStripeClient } from "@/utils/billing/stripe-client";
import { dispatchStripeWebhookEvent } from "@/utils/billing/webhooks/dispatch-stripe-event";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!webhookSecret) {
    return Response.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let stripe: ReturnType<typeof createStripeClient>;
  try {
    stripe = createStripeClient();
  } catch {
    return Response.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Invalid Stripe webhook.",
      },
      { status: 400 }
    );
  }

  try {
    const outcome = await dispatchStripeWebhookEvent({ event, stripe });
    return Response.json(outcome);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not process webhook.",
      },
      { status: 500 }
    );
  }
}
