import type Stripe from "stripe";
import { createStripeClient } from "@/utils/stripe";
import { syncStripeSubscription } from "@/utils/stripe-subscriptions";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return Response.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET." },
      { status: 500 }
    );
  }

  const stripe = createStripeClient();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing Stripe signature." }, { status: 400 });
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
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      if (session.mode === "subscription" && subscriptionId) {
        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        await syncStripeSubscription(subscription);
      }
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await syncStripeSubscription(event.data.object as Stripe.Subscription);
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not sync subscription.",
      },
      { status: 500 }
    );
  }
}
