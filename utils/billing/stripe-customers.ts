import type Stripe from "stripe";
import { createHash } from "node:crypto";
import { type AdminSupabase, updateProfileCustomerId } from "@/utils/billing/billing-repository";

export async function customerExists(
  stripe: Stripe,
  customerId: string
): Promise<boolean> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return !customer.deleted;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "resource_missing"
    ) {
      return false;
    }
    // An outage is not evidence that the customer has been deleted.
    throw error;
  }
}

export async function findOrCreateStripeCustomer(
  stripe: Stripe,
  admin: AdminSupabase,
  {
    userId,
    email,
    fullName,
    existingCustomerId,
  }: {
    userId: string;
    email?: string;
    fullName?: string | null;
    existingCustomerId?: string | null;
  }
): Promise<string> {
  let customerId = existingCustomerId ?? null;

  if (customerId && !(await customerExists(stripe, customerId))) {
    customerId = null;
  }

  if (customerId) {
    return customerId;
  }

  const customer = await stripe.customers.create({
    email,
    name: fullName?.trim() ? fullName : undefined,
    metadata: {
      supabase_user_id: userId,
    },
  }, {
    // First-time requests must agree on a customer before they can share checkout.
    idempotencyKey: `billing-customer-${createHash("sha256").update(`${userId}:${existingCustomerId ?? "first"}`).digest("hex")}`,
  });

  await updateProfileCustomerId(admin, userId, customer.id);
  return customer.id;
}
