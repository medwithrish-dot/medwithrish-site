import type Stripe from "stripe";
import { createAdminClient } from "@/utils/supabase/admin";
import { createStripeClient } from "@/utils/billing/stripe-client";
import {
  ensureBillingProfile,
  findBillingProfile,
  findManageableSubscription,
  type AdminSupabase,
} from "@/utils/billing/billing-repository";
import { findOrCreateStripeCustomer, customerExists } from "@/utils/billing/stripe-customers";
import { resolvePremiumPriceId } from "@/utils/billing/stripe-prices";
import { createCustomerPortalSession } from "@/utils/billing/stripe-portal";
import { createPremiumCheckoutSession } from "@/utils/billing/stripe-checkout";
import {
  billingActionStatuses,
  paidSubscriptionStatuses,
  syncStripeSubscription,
} from "@/utils/billing/stripe-subscriptions";
import {
  BillingConflictError,
  BillingForbiddenError,
  BillingNotFoundError,
  InvalidRequestError,
} from "@/utils/billing/billing-errors";

export interface AuthenticatedUser {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}

export type CheckoutSessionOutcome =
  | { kind: "checkout"; url: string }
  | { kind: "portal"; url: string };

export async function preparePremiumCheckout({
  user,
  siteUrl,
  stripe: providedStripe,
  admin: providedAdmin,
}: {
  user: AuthenticatedUser;
  siteUrl: string;
  stripe?: Stripe;
  admin?: AdminSupabase;
}): Promise<CheckoutSessionOutcome> {
  const admin = providedAdmin ?? createAdminClient();
  const stripe = providedStripe ?? createStripeClient();

  const profile = await ensureBillingProfile(admin, user);

  const existingSubscription = await findManageableSubscription(
    admin,
    user.id,
    billingActionStatuses
  );

  if (profile.current_plan === "premium") {
    if (profile.stripe_customer_id) {
      const portalUrl = await createCustomerPortalSession(
        stripe,
        profile.stripe_customer_id,
        `${siteUrl}/medicforest/account`
      );
      return { kind: "portal", url: portalUrl };
    }

    throw new BillingConflictError(
      "This account already has Premium. Manual Premium accounts do not have Stripe billing to manage."
    );
  }

  if (existingSubscription) {
    const customerIdForPortal =
      typeof existingSubscription.stripe_customer_id === "string"
        ? existingSubscription.stripe_customer_id
        : profile.stripe_customer_id;

    if (customerIdForPortal) {
      const portalUrl = await createCustomerPortalSession(
        stripe,
        customerIdForPortal,
        `${siteUrl}/medicforest/account`
      );
      return { kind: "portal", url: portalUrl };
    }

    const status = existingSubscription.status;
    const activeText = paidSubscriptionStatuses.includes(
      status as (typeof paidSubscriptionStatuses)[number]
    )
      ? "active Premium subscription"
      : "subscription that needs billing action";

    throw new BillingConflictError(
      `This account already has an ${activeText}. Manage billing from account settings.`
    );
  }

  const customerId = await findOrCreateStripeCustomer(stripe, admin, {
    userId: user.id,
    email: user.email ?? undefined,
    fullName: profile.full_name,
    existingCustomerId: profile.stripe_customer_id,
  });

  const priceId = await resolvePremiumPriceId(stripe);

  const checkoutUrl = await createPremiumCheckoutSession(stripe, {
    customerId,
    userId: user.id,
    priceId,
    siteUrl,
  });

  return { kind: "checkout", url: checkoutUrl };
}

export async function openCustomerPortal({
  user,
  siteUrl,
  stripe: providedStripe,
  admin: providedAdmin,
}: {
  user: AuthenticatedUser;
  siteUrl: string;
  stripe?: Stripe;
  admin?: AdminSupabase;
}): Promise<{ url: string }> {
  const admin = providedAdmin ?? createAdminClient();
  const stripe = providedStripe ?? createStripeClient();

  const profile = await findBillingProfile(admin, user.id);

  if (!profile?.stripe_customer_id) {
    throw new BillingNotFoundError("No Stripe customer found for this account.");
  }

  if (!profile.stripe_subscription_id || profile.subscription_status === "manual") {
    throw new BillingConflictError(
      "This account has manual Premium access, so there is no Stripe billing portal to manage."
    );
  }

  const manageableSubscription = await findManageableSubscription(
    admin,
    user.id,
    billingActionStatuses,
    {
      customerId: profile.stripe_customer_id,
      subscriptionId: profile.stripe_subscription_id,
    }
  );

  if (!manageableSubscription) {
    throw new BillingConflictError(
      "No manageable Stripe subscription found for this account."
    );
  }

  const isCustomerValid = await customerExists(stripe, profile.stripe_customer_id);
  if (!isCustomerValid) {
    throw new BillingConflictError(
      "This account is linked to an old Stripe test customer. Start a live checkout first."
    );
  }

  const portalUrl = await createCustomerPortalSession(
    stripe,
    profile.stripe_customer_id,
    `${siteUrl}/medicforest/account`
  );

  return { url: portalUrl };
}

export async function synchronizeCheckoutSession({
  user,
  sessionId,
  stripe: providedStripe,
  admin: providedAdmin,
}: {
  user: AuthenticatedUser;
  sessionId: unknown;
  stripe?: Stripe;
  admin?: AdminSupabase;
}): Promise<{
  userId: string;
  currentPlan: "free" | "premium";
  status: string;
}> {
  if (
    typeof sessionId !== "string" ||
    !/^cs_[a-zA-Z0-9_]{1,240}$/.test(sessionId)
  ) {
    throw new InvalidRequestError("Invalid sessionId.");
  }

  const stripe = providedStripe ?? createStripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const checkoutUserId =
    session.client_reference_id ?? session.metadata?.supabase_user_id ?? null;

  if (checkoutUserId !== user.id) {
    throw new BillingForbiddenError(
      "Checkout session does not belong to this user."
    );
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (session.mode !== "subscription" || !subscriptionId) {
    throw new InvalidRequestError("Checkout session has no subscription.");
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return syncStripeSubscription(subscription, user.id, providedAdmin);
}
