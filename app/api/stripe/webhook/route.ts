import type Stripe from "stripe";
import { createStripeClient } from "@/utils/stripe";
import { createAdminClient } from "@/utils/supabase/admin";

export const runtime = "nodejs";

const paidStatuses = new Set(["active", "trialing"]);

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const value = (subscription as { current_period_end?: number })
    .current_period_end;

  return typeof value === "number"
    ? new Date(value * 1000).toISOString()
    : null;
}

function getCustomerId(customer: Stripe.Subscription["customer"]) {
  return typeof customer === "string" ? customer : customer.id;
}

async function findUserIdForSubscription(
  subscription: Stripe.Subscription,
  admin: ReturnType<typeof createAdminClient>
) {
  const metadataUserId = subscription.metadata?.supabase_user_id;

  if (metadataUserId) return metadataUserId;

  const customerId = getCustomerId(subscription.customer);
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  return typeof profile?.id === "string" ? profile.id : null;
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const admin = createAdminClient();
  const userId = await findUserIdForSubscription(subscription, admin);

  if (!userId) return;

  const customerId = getCustomerId(subscription.customer);
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const isPaid = paidStatuses.has(subscription.status);
  const currentPeriodEnd = getSubscriptionPeriodEnd(subscription);

  await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      status: subscription.status,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" }
  );

  await admin
    .from("profiles")
    .update({
      current_plan: isPaid ? "premium" : "free",
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      premium_since: isPaid ? new Date().toISOString() : null,
    })
    .eq("id", userId);
}

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
        await syncSubscription(subscription);
      }
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await syncSubscription(event.data.object as Stripe.Subscription);
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
