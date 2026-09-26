import type Stripe from "stripe";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  findBillingProfile,
  findLatestActiveSubscription,
  findUserIdByCustomerId,
  updateProfileEntitlements,
  upsertSubscriptionRecord,
  type AdminSupabase,
} from "@/utils/billing/billing-repository";

export const paidSubscriptionStatuses = ["active", "trialing"] as const;
export const billingActionStatuses = [
  "active",
  "trialing",
  "past_due",
  "unpaid",
  "incomplete",
  "paused",
] as const;

export function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): string | null {
  // Stripe moved billing periods to subscription items. Keep the legacy field
  // as a fallback for webhooks configured with an older API version.
  const value =
    subscription.items?.data?.[0]?.current_period_end ??
    (subscription as { current_period_end?: number }).current_period_end;

  return typeof value === "number"
    ? new Date(value * 1000).toISOString()
    : null;
}

export function getCustomerId(customer: Stripe.Subscription["customer"]): string {
  return typeof customer === "string" ? customer : customer.id;
}

export async function findUserIdForSubscription(
  subscription: Stripe.Subscription,
  admin: AdminSupabase
): Promise<string | null> {
  const metadataUserId = subscription.metadata?.supabase_user_id;
  if (metadataUserId) return metadataUserId;

  const customerId = getCustomerId(subscription.customer);
  return findUserIdByCustomerId(admin, customerId);
}

export async function syncStripeSubscription(
  subscription: Stripe.Subscription,
  expectedUserId?: string,
  adminClient?: AdminSupabase
): Promise<{
  userId: string;
  currentPlan: "free" | "premium";
  status: string;
}> {
  const admin = adminClient ?? createAdminClient();
  const userId = await findUserIdForSubscription(subscription, admin);

  if (!userId) {
    throw new Error("Could not match Stripe subscription to a user.");
  }

  if (expectedUserId && userId !== expectedUserId) {
    throw new Error("Stripe subscription does not belong to this user.");
  }

  const customerId = getCustomerId(subscription.customer);
  const priceId = subscription.items?.data?.[0]?.price?.id ?? null;
  const currentPeriodEnd = getSubscriptionPeriodEnd(subscription);
  const syncedAt = new Date().toISOString();

  await upsertSubscriptionRecord(admin, {
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    status: subscription.status,
    current_period_end: currentPeriodEnd,
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: syncedAt,
  });

  const activeSubscription = await findLatestActiveSubscription(
    admin,
    userId,
    paidSubscriptionStatuses
  );

  const existingProfile = await findBillingProfile(admin, userId);

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
    (hasManualPremium
      ? existingProfile?.stripe_subscription_id ?? null
      : subscription.id);

  const profileSubscriptionStatus =
    activeSubscription?.status ??
    (hasManualPremium
      ? existingProfile?.subscription_status ?? "manual"
      : subscription.status);

  const premiumSince =
    hasPaidSubscription || hasManualPremium
      ? existingProfile?.premium_since ?? syncedAt
      : null;

  await updateProfileEntitlements(admin, {
    id: userId,
    current_plan: currentPlan,
    stripe_customer_id: profileCustomerId,
    stripe_subscription_id: profileSubscriptionId,
    subscription_status: profileSubscriptionStatus,
    premium_since: premiumSince,
  });

  return {
    userId,
    currentPlan,
    status: profileSubscriptionStatus,
  };
}
