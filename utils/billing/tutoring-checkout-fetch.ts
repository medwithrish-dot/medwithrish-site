"use client";

const pending = new Map<string, { id: string; created: number }>();
const active = new Map<string, Promise<Response>>();

// Coalesce double clicks before asynchronous hashing/storage has completed.
export function tutoringCheckoutFetch(url: string, init: RequestInit): Promise<Response> {
  const key = `${url}:${String(init.body ?? "")}`;
  let work = active.get(key);
  if (!work) {
    work = performCheckout(url, init);
    active.set(key, work);
  }
  const current = work;
  return current.then(response => response.clone()).finally(() => {
    if (active.get(key) === current) active.delete(key);
  });
}

/** Reuse an intent after a lost response; a successful handoff ends that intent. */
async function performCheckout(url: string, init: RequestInit) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(init.body ?? "")));
  const key = `tutoring-checkout:${Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, "0")).join("")}`;
  let intent = pending.get(key);
  try {
    const stored = JSON.parse(sessionStorage.getItem(key) ?? "null");
    if (stored && typeof stored.id === "string" && typeof stored.created === "number" && stored.created <= Date.now()) intent = stored;
  } catch { /* Storage may be disabled; the in-memory intent still covers retries. */ }
  if (!intent || Date.now() - intent.created >= 23 * 60 * 60 * 1000) {
    intent = { id: crypto.randomUUID(), created: Date.now() };
  }
  pending.set(key, intent);
  try { sessionStorage.setItem(key, JSON.stringify(intent)); } catch { /* Optional persistence. */ }
  const headers = new Headers(init.headers);
  headers.set("Idempotency-Key", intent.id);
  const timeout = AbortSignal.timeout(20_000);
  const response = await fetch(url, { ...init, headers,
    signal: init.signal ? AbortSignal.any([init.signal, timeout]) : timeout });
  if (response.ok) {
    const result = await response.clone().json();
    if (result.configured && typeof result.url === "string") {
      if (pending.get(key)?.id === intent.id) pending.delete(key);
      try {
        if (JSON.parse(sessionStorage.getItem(key) ?? "null")?.id === intent.id) sessionStorage.removeItem(key);
      } catch { /* Optional persistence. */ }
    }
  }
  return response;
}
