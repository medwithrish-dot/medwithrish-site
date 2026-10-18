import "server-only";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/utils/supabase/admin";
import { logProviderFailure } from "@/utils/security/provider-failure";

export async function processStripeEventOnce(eventId: string, work: () => Promise<unknown>) {
  const admin = createAdminClient();
  const token = randomUUID();
  const { data, error } = await admin.rpc("claim_stripe_webhook", { p_event: eventId, p_token: token })
    .abortSignal(AbortSignal.timeout(3_000));
  if (error) throw error;
  if (data === "completed") return { received: true, duplicate: true };
  if (data !== "claimed") throw new Error("Webhook claim unavailable");
  try {
    await work();
  } catch (error) {
    // Failed work stays retryable. Subscription synchronisation uses idempotent upserts,
    // so a retry also repairs failures after only part of that work was committed.
    try {
      const result = await admin.rpc("finish_stripe_webhook", { p_event: eventId, p_token: token, p_success: false })
        .abortSignal(AbortSignal.timeout(3_000));
      if (result.error) throw result.error;
    } catch (releaseError) { logProviderFailure("supabase", "webhook_release", releaseError); }
    throw error;
  }
  const finished = await admin.rpc("finish_stripe_webhook", { p_event: eventId, p_token: token, p_success: true })
    .abortSignal(AbortSignal.timeout(3_000));
  if (finished.error || finished.data !== true) throw finished.error ?? new Error("Webhook completion unavailable");
  return { received: true };
}
