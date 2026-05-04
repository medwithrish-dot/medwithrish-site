import type Stripe from "stripe";
import { createAdminClient } from "@/utils/supabase/admin";

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

export async function syncStripeSubscription(
  subscription: Stripe.Subscription,
  expectedUserId?: string
) {
  const admin = createAdminClient();
  const userId = await findUserIdForSubscription(subscription, admin);

  if (!userId) {
    throw new Error("Could not match Stripe subscription to a user.");
  }

  if (expectedUserId && userId !== expectedUserId) {
    throw new Error("Stripe subscription does not belong to this user.");
  }

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

  return {
    userId,
    currentPlan: isPaid ? "premium" : "free",
    status: subscription.status,
  };
}
