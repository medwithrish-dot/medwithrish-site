import type Stripe from "stripe";
import { syncStripeSubscription } from "@/utils/billing/stripe-subscriptions";
import type { AdminSupabase } from "@/utils/billing/billing-repository";

export async function dispatchStripeWebhookEvent({
  event,
  stripe,
  admin,
}: {
  event: Stripe.Event;
  stripe: Stripe;
  admin?: AdminSupabase;
}): Promise<{ received: true }> {
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.mode === "subscription") {
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await syncStripeSubscription(subscription, undefined, admin);
      }
    }
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    // Stripe may deliver events out of order; retrieve the authoritative state from the provider.
    const subscription = await stripe.subscriptions.retrieve(event.data.object.id);
    await syncStripeSubscription(subscription, undefined, admin);
  }

  return { received: true };
}
