import type Stripe from "stripe";
import { getPremiumPriceConfig } from "@/utils/billing/billing-config";

function getPriceProductId(price: Stripe.Price): string {
  return typeof price.product === "string" ? price.product : price.product.id;
}

function priceIsUsableForSubscription(
  price: Stripe.Price,
  productId: string
): boolean {
  return price.active && Boolean(price.recurring) && getPriceProductId(price) === productId;
}

export async function resolvePremiumPriceId(stripe: Stripe): Promise<string> {
  const { priceId, productId } = getPremiumPriceConfig();

  const price = await stripe.prices.retrieve(priceId);

  if (!price.active || !price.recurring) {
    throw new Error(`Stripe price ${priceId} must be active and recurring.`);
  }

  if (productId && !priceIsUsableForSubscription(price, productId)) {
    throw new Error(
      `Stripe price ${priceId} must be attached to product ${productId}.`
    );
  }

  return price.id;
}
