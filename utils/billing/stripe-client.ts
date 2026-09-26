import Stripe from "stripe";
import { getStripeSecretKey } from "@/utils/billing/billing-config";

export function createStripeClient(): Stripe {
  const secretKey = getStripeSecretKey();
  return new Stripe(secretKey);
}
