import type Stripe from "stripe";
import { getBillingReturnPath, type CheckoutReturnArea } from "@/utils/billing/return-destination";

export async function createPremiumCheckoutSession(
  stripe: Stripe,
  {
    customerId,
    userId,
    priceId,
    siteUrl,
    returnArea = "ucat",
  }: {
    customerId: string;
    userId: string;
    priceId: string;
    siteUrl: string;
    returnArea?: CheckoutReturnArea;
  }
): Promise<string> {
  const returnPath = getBillingReturnPath(siteUrl, returnArea, "checkout");
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
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  return session.url;
}
