import "server-only";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { createAdminClient } from "@/utils/supabase/admin";
import { logProviderFailure } from "./provider-failure";

export function trustedClientIp(request: Request): string | null {
  // Never trust a client-supplied X-Forwarded-For header.
  const raw = process.env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
    : process.env.TRUST_PROXY_HEADERS === "true" ? request.headers.get("x-real-ip")?.trim() : null;
  if (raw && isIP(raw)) {
    // URL canonicalisation prevents alternate IPv6 spellings from bypassing quotas.
    return isIP(raw) === 6 ? new URL(`http://[${raw}]/`).hostname : raw;
  }
  return process.env.NODE_ENV === "production" ? null : "local-development";
}

export function privateFingerprint(value: string) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Rate limit storage is unavailable");
  return createHmac("sha256", key).update(value).digest("hex");
}

export async function enforcePublicRateLimit(request: Request, scope: "feedback" | "tutoring-checkout"): Promise<Response | null> {
  try {
    const ip = trustedClientIp(request);
    if (!ip) throw new Error("Trusted client IP is unavailable");
    const { data, error } = await createAdminClient().rpc("consume_public_api_quota", {
      p_scope: scope, p_key: privateFingerprint(`${scope}:${ip}`),
    }).abortSignal(AbortSignal.timeout(3_000));
    if (error) throw error;
    if (data?.allowed === true) return null;
    if (data?.allowed !== false || !Number.isInteger(data.retry_after) || data.retry_after < 1) throw new Error("Invalid quota response");
    return Response.json({ error: scope === "feedback"
      ? "Feedback from this network has reached its hourly limit. Please try later or email us directly."
      : "Too many checkout requests from this network. Please wait and try again." }, {
      status: 429, headers: { "Retry-After": String(data.retry_after), "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    logProviderFailure("supabase", "public_api_quota", error);
    // Fail closed: a storage outage must not remove the email/payment abuse ceiling.
    return Response.json({ error: "This service is temporarily unavailable. Please try again shortly." }, {
      status: 503, headers: { "Retry-After": "30", "Cache-Control": "private, no-store" },
    });
  }
}
