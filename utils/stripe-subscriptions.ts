import type Stripe from "stripe";
import { createAdminClient } from "@/utils/supabase/admin";

const paidStatuses = new Set(["active", "trialing"]);
const paidStatusList = Array.from(paidStatuses);

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
  const currentPeriodEnd = getSubscriptionPeriodEnd(subscription);
  const syncedAt = new Date().toISOString();

  const { error: subscriptionError } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      status: subscription.status,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: syncedAt,
    },
    { onConflict: "stripe_subscription_id" }
  );

  if (subscriptionError) throw subscriptionError;

  const { data: activeSubscription, error: activeSubscriptionError } = await admin
    .from("subscriptions")
    .select(
      "stripe_customer_id,stripe_subscription_id,status,current_period_end"
    )
    .eq("user_id", userId)
    .in("status", paidStatusList)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeSubscriptionError) throw activeSubscriptionError;

  const { data: existingProfile, error: profileReadError } = await admin
    .from("profiles")
    .select(
      "current_plan,stripe_customer_id,stripe_subscription_id,subscription_status,premium_since"
    )
    .eq("id", userId)
    .maybeSingle();

  if (profileReadError) throw profileReadError;

  const hasManualPremium =
    existingProfile?.current_plan === "premium" &&
    (existingProfile.subscription_status === "manual" ||
      !existingProfile.stripe_subscription_id);

  const hasPaidSubscription = Boolean(activeSubscription);
  const currentPlan =
    hasPaidSubscription || hasManualPremium ? "premium" : "free";
  const profileCustomerId =
    activeSubscription?.stripe_customer_id ??
    existingProfile?.stripe_customer_id ??
    customerId;
  const profileSubscriptionId =
    activeSubscription?.stripe_subscription_id ??
    (hasManualPremium ? existingProfile?.stripe_subscription_id ?? null : subscription.id);
  const profileSubscriptionStatus =
    activeSubscription?.status ??
    (hasManualPremium
      ? existingProfile?.subscription_status ?? "manual"
      : subscription.status);
  const premiumSince =
    hasPaidSubscription || hasManualPremium
      ? existingProfile?.premium_since ?? syncedAt
      : null;

  const { error: profileWriteError } = await admin.from("profiles").upsert(
    {
      id: userId,
      current_plan: currentPlan,
      stripe_customer_id: profileCustomerId,
      stripe_subscription_id: profileSubscriptionId,
      subscription_status: profileSubscriptionStatus,
      premium_since: premiumSince,
    },
    { onConflict: "id" }
  );

  if (profileWriteError) throw profileWriteError;

  return {
    userId,
    currentPlan,
    status: profileSubscriptionStatus,
  };
}
