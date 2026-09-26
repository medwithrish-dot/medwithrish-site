import { createAdminClient } from "@/utils/supabase/admin";

export type AdminSupabase = ReturnType<typeof createAdminClient>;

export interface BillingProfileRecord {
  id: string;
  current_plan: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  full_name: string | null;
  premium_since: string | null;
}

export interface BillingSubscriptionRecord {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string | null;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  updated_at?: string;
}

export async function findBillingProfile(
  admin: AdminSupabase,
  userId: string
): Promise<BillingProfileRecord | null> {
  const { data, error } = await admin
    .from("profiles")
    .select(
      "id,current_plan,stripe_customer_id,stripe_subscription_id,subscription_status,full_name,premium_since"
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as BillingProfileRecord | null;
}

export async function ensureBillingProfile(
  admin: AdminSupabase,
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }
): Promise<BillingProfileRecord> {
  const existing = await findBillingProfile(admin, user.id);
  if (existing) return existing;

  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "";

  const { data, error } = await admin
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email ?? null,
        full_name: fullName,
      },
      { onConflict: "id" }
    )
    .select(
      "id,current_plan,stripe_customer_id,stripe_subscription_id,subscription_status,full_name,premium_since"
    )
    .single();

  if (error) throw error;
  return data as BillingProfileRecord;
}

export async function updateProfileCustomerId(
  admin: AdminSupabase,
  userId: string,
  customerId: string
): Promise<void> {
  const { error } = await admin
    .from("profiles")
    .update({ stripe_customer_id: customerId })
    .eq("id", userId);

  if (error) throw error;
}

export async function findManageableSubscription(
  admin: AdminSupabase,
  userId: string,
  allowedStatuses: readonly string[],
  filters?: { customerId?: string; subscriptionId?: string }
): Promise<{ id: string; status: string; stripe_customer_id: string } | null> {
  let query = admin
    .from("subscriptions")
    .select("id,status,stripe_customer_id")
    .eq("user_id", userId)
    .in("status", allowedStatuses as string[]);

  if (filters?.customerId) {
    query = query.eq("stripe_customer_id", filters.customerId);
  }
  if (filters?.subscriptionId) {
    query = query.eq("stripe_subscription_id", filters.subscriptionId);
  }

  const { data, error } = await query.limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

export async function findUserIdByCustomerId(
  admin: AdminSupabase,
  customerId: string
): Promise<string | null> {
  const { data, error } = await admin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (error) throw error;
  return typeof data?.id === "string" ? data.id : null;
}

export async function upsertSubscriptionRecord(
  admin: AdminSupabase,
  subscription: {
    user_id: string;
    stripe_customer_id: string;
    stripe_subscription_id: string;
    stripe_price_id: string | null;
    status: string;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    updated_at: string;
  }
): Promise<void> {
  const { error } = await admin.from("subscriptions").upsert(subscription, {
    onConflict: "stripe_subscription_id",
  });

  if (error) throw error;
}

export async function findLatestActiveSubscription(
  admin: AdminSupabase,
  userId: string,
  paidStatuses: readonly string[]
): Promise<{
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: string;
  current_period_end: string | null;
} | null> {
  const { data, error } = await admin
    .from("subscriptions")
    .select("stripe_customer_id,stripe_subscription_id,status,current_period_end")
    .eq("user_id", userId)
    .in("status", paidStatuses as string[])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateProfileEntitlements(
  admin: AdminSupabase,
  profile: {
    id: string;
    current_plan: string;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    subscription_status: string;
    premium_since: string | null;
  }
): Promise<void> {
  const { error } = await admin.from("profiles").upsert(profile, {
    onConflict: "id",
  });

  if (error) throw error;
}
