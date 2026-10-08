import type Stripe from "stripe";
import { getPremiumPriceConfig } from "@/utils/billing/billing-config";
import { MEDICFOREST_PREMIUM_MONTHLY_PRICE } from "@/utils/medicforest/premium-price";

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

  if (
    price.unit_amount !== MEDICFOREST_PREMIUM_MONTHLY_PRICE.amountMinor ||
    price.currency !== MEDICFOREST_PREMIUM_MONTHLY_PRICE.currency ||
    price.recurring.interval !== MEDICFOREST_PREMIUM_MONTHLY_PRICE.interval ||
    price.recurring.interval_count !== 1 ||
    price.billing_scheme !== "per_unit" ||
    price.recurring.usage_type !== "licensed"
  ) {
    throw new Error(`Stripe price ${priceId} does not match the advertised Premium monthly price.`);
  }

  if (productId && !priceIsUsableForSubscription(price, productId)) {
    throw new Error(
      `Stripe price ${priceId} must be attached to product ${productId}.`
    );
  }

  return price.id;
}
