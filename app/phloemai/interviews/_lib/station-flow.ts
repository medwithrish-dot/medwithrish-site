// Owner-controlled allowlist. Add station slugs here only when explicitly selected.
// Shared with the API: client requests cannot enable a station's follow-ups.
export const FOLLOW_UP_STATIONS: readonly string[] = [];
export const followUpsEnabled = (slug: string) => FOLLOW_UP_STATIONS.includes(slug);

// A generous thinking interval for interview answers, followed by confirmation.
// This is a product default, not a scientifically validated interview threshold.
export const ANSWER_SILENCE_MS = 8_000;
export const DONE_PROMPT = "Done? Answer yes or no.";

export function parseDoneReply(text: string): { done: boolean; continuation: string } {
  const cleaned = text.trim().replace(/[.!?,]+$/g, "").trim();
  if (/^(?:yes|yeah|yep|yes please|yes i(?:'m| am) done|i(?:'m| am) done|that(?:'s| is) all)$/i.test(cleaned)) return { done: true, continuation: "" };
  if (/^(?:no|nope|not yet|no not yet)$/i.test(cleaned)) return { done: false, continuation: "" };
  // Continuing an answer is also a "no"; do not discard its content.
  return { done: false, continuation: text.trim().replace(/^(?:no|nope)[,.]?\s+/i, "") };
}
