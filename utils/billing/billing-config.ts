export function getStripeSecretKey(): string {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }
  return secretKey;
}

export function getStripeWebhookSecret(): string {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET.");
  }
  return webhookSecret;
}

export function getPremiumPriceConfig(): { priceId: string; productId?: string } {
  const priceId = process.env.STRIPE_PREMIUM_PRICE_ID?.trim();
  const productId = process.env.STRIPE_PREMIUM_PRODUCT_ID?.trim();

  if (!priceId) {
    throw new Error("Missing STRIPE_PREMIUM_PRICE_ID.");
  }

  return {
    priceId,
    productId: productId || undefined,
  };
}
