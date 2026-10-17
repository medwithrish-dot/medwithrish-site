import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/utils/supabase/admin";
import { InterviewAiBusyError, interviewProviderLoad, providerCooldownSeconds } from "./provider-load";

// A feedback service reserves before claiming a grading try. Its nested provider
// call reuses that reservation; unrelated concurrent requests have separate stores.
const admission = new AsyncLocalStorage<{ startBy: number }>();
const sharedLimits = () => process.env.INTERVIEW_AI_SHARED_LIMITS === "true";
const RPC_TIMEOUT = 3000;

async function capacityRpc(name: string, args: Record<string, unknown>) {
  const { data, error } = await createAdminClient().rpc(name, args).abortSignal(AbortSignal.timeout(RPC_TIMEOUT));
  if (error) {
    console.error("interview_capacity_storage_failure", { operation: name, code: error.code });
    throw new InterviewAiBusyError();
  }
  return data;
}

export async function withInterviewProviderCapacity<T>(work: () => Promise<T>): Promise<T> {
  const current = admission.getStore();
  if (current) {
    // Never begin a provider call near the expiry of a shared lease.
    if (Date.now() >= current.startBy) throw new InterviewAiBusyError();
    return work();
  }
  const releaseLocal = interviewProviderLoad.acquire();
  const token = randomUUID();
  const shared = sharedLimits();
  const startBy = Date.now() + 45_000;
  let acquired = false;
  try {
    if (shared) {
      const result = await capacityRpc("acquire_interview_ai_capacity", { p_token: token });
      if (result?.admitted !== true) throw new InterviewAiBusyError(Number(result?.retry_after) || 15);
      acquired = true;
    }
    return await admission.run({ startBy }, work);
  } finally {
    releaseLocal();
    if (acquired) {
      // A failed release must not turn successfully saved feedback into an error.
      // Crashed workers and failed releases recover through the 90-second lease.
      try { await capacityRpc("release_interview_ai_capacity", { p_token: token }); }
      catch { console.error("interview_capacity_release_deferred"); }
    }
  }
}

export async function recordInterviewProviderFailure(status: number, retryAfter: string | null) {
  interviewProviderLoad.unavailable(status, retryAfter);
  if (!sharedLimits() || ![429, 503].includes(status)) return;
  try {
    await capacityRpc("pause_interview_ai_capacity", { p_seconds: providerCooldownSeconds(retryAfter) });
  } catch { console.error("interview_capacity_cooldown_not_shared"); }
}
