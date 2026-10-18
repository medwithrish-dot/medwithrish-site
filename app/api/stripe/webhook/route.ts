import type Stripe from "stripe";
import { getStripeWebhookSecret } from "@/utils/billing/billing-config";
import { createStripeClient } from "@/utils/billing/stripe-client";
import { dispatchStripeWebhookEvent } from "@/utils/billing/webhooks/dispatch-stripe-event";
import { readLimitedText, RequestBodyError } from "@/utils/security/request-body";
import { processStripeEventOnce } from "@/utils/billing/webhooks/webhook-receipts";
import { logProviderFailure } from "@/utils/security/provider-failure";

export const runtime = "nodejs";
// Shorter than the receipt lease, so a crashed invocation cannot overlap recovery.
export const maxDuration = 60;

export async function POST(request: Request) {
  let webhookSecret: string;
  try {
    webhookSecret = getStripeWebhookSecret();
  } catch {
    return Response.json(
      { error: "Webhook service is temporarily unavailable." },
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
    const body = await readLimitedText(request, 256_000);
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    if (error instanceof RequestBodyError) return Response.json({ error: error.message }, { status: error.status });
    return Response.json(
      { error: "Invalid Stripe webhook signature or payload." },
      { status: 400 }
    );
  }

  try {
    const outcome = await processStripeEventOnce(event.id, () => dispatchStripeWebhookEvent({ event, stripe }));
    return Response.json(outcome);
  } catch (error) {
    logProviderFailure("stripe", "webhook", error);
    return Response.json(
      { error: "Could not process webhook." },
      { status: 503, headers: { "Retry-After": "30" } }
    );
  }
}
