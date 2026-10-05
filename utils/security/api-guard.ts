import { createHash } from "node:crypto";

type Bucket = { count: number; resetsAt: number };

// Bounded, instance-local protection. Configure the hosting WAF for distributed limits.
export function createApiRateLimiter(now = Date.now, maxBuckets = 10_000) {
  const buckets = new Map<string, Bucket>();
  return (key: string, limit: number) => {
    const time = now();
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetsAt <= time) {
      if (!bucket && buckets.size >= maxBuckets) {
        for (const [storedKey, value] of buckets) if (value.resetsAt <= time) buckets.delete(storedKey);
        if (buckets.size >= maxBuckets) return false;
      }
      bucket = { count: 0, resetsAt: time + 60_000 };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    return bucket.count <= limit;
  };
}

const allow = createApiRateLimiter();
const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

export function guardApiRequest(request: Request) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/")) return null;
  const fail = (error: string, status: number) => Response.json({ error }, {
    status, headers: { "Cache-Control": "private, no-store", ...(status === 429 ? { "Retry-After": "60" } : {}) },
  });
  const webhook = url.pathname === "/api/stripe/webhook";
  if (url.pathname === "/api/ai/diagnostic-feedback") return fail("UCAT is currently a work in progress.", 503);
  const maxBytes = webhook ? 256_000 : 45_000;
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > maxBytes)) return fail("Request body is too large.", 413);
  if (!webhook && !safeMethods.has(request.method)) {
    const origin = request.headers.get("origin");
    if ((origin && origin !== url.origin) || request.headers.get("sec-fetch-site") === "cross-site") return fail("Invalid request origin.", 403);
  }
  if (webhook) return null;
  const trustedIp = process.env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]
    : process.env.TRUST_PROXY_HEADERS === "true" ? request.headers.get("x-real-ip") : null;
  const identity = trustedIp?.trim() || "unidentified";
  const mutation = !safeMethods.has(request.method);
  const key = createHash("sha256").update(`${identity}:${mutation ? "write" : "read"}`).digest("hex");
  const limit = trustedIp ? mutation ? 60 : 180 : mutation ? 300 : 1200;
  if (!allow(key, limit)) return fail("Too many requests. Please wait a minute and retry.", 429);
  return null;
}
