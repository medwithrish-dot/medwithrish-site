import type Stripe from "stripe";
import { createHash } from "node:crypto";
import { getBillingReturnPath, type CheckoutReturnArea } from "@/utils/billing/return-destination";
import { billingActionStatuses } from "@/utils/billing/stripe-subscriptions";

export async function inspectPremiumCheckout(stripe: Stripe, customerId: string, userId: string) {
  let previousSessionId = "first";
  let openSessionUrl: string | null = null;
  // Include every page: an older open session must not be hidden by tutoring payments.
  for await (const session of stripe.checkout.sessions.list({ customer: customerId, limit: 100 })) {
    if (session.mode !== "subscription" ||
      (session.client_reference_id ?? session.metadata?.supabase_user_id) !== userId) continue;
    if (previousSessionId === "first") previousSessionId = session.id;
    if (session.status === "open" && session.url && !openSessionUrl) openSessionUrl = session.url;
  }

  // Read subscriptions AFTER sessions. If checkout completes during this read,
  // reuse its session or find the subscription even when our webhook is delayed.
  for await (const subscription of stripe.subscriptions.list({ customer: customerId, status: "all", limit: 100 })) {
    if (billingActionStatuses.includes(subscription.status as (typeof billingActionStatuses)[number])) {
      return { previousSessionId, openSessionUrl, subscription };
    }
  }
  return { previousSessionId, openSessionUrl, subscription: null };
}

export async function createPremiumCheckoutSession(
  stripe: Stripe,
  {
    customerId,
    userId,
    priceId,
    siteUrl,
    returnArea = "ucat",
    previousSessionId,
  }: {
    customerId: string;
    userId: string;
    priceId: string;
    siteUrl: string;
    returnArea?: CheckoutReturnArea;
    previousSessionId: string;
  }
): Promise<string> {
  const returnPath = getBillingReturnPath(siteUrl, returnArea, "checkout");
  // All tabs/instances share one key until the previous checkout becomes terminal.
  // Do not key by return area or price: those must not allow a second subscription.
  const idempotencyKey = `premium-checkout-${createHash("sha256").update(`${userId}:${customerId}:${previousSessionId}`).digest("hex")}`;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: userId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    consent_collection: {
      terms_of_service: "required",
    },
    custom_text: {
      terms_of_service_acceptance: {
        message: `I agree to the [Terms and Conditions](${siteUrl}/terms-and-conditions) and confirm I have read the [Privacy Policy](${siteUrl}/privacy-policy).`,
      },
    },
    success_url: `${siteUrl}${returnPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}${returnPath}?checkout=cancelled`,
    metadata: {
      supabase_user_id: userId,
    },
    subscription_data: {
      metadata: {
        supabase_user_id: userId,
      },
    },
  }, { idempotencyKey });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  return session.url;
}
