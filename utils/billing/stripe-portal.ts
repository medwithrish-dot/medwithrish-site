import type Stripe from "stripe";

export async function createCustomerPortalSession(
  stripe: Stripe,
  customerId: string,
  returnUrl: string
): Promise<string> {
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return portalSession.url;
}
