export type FeatureTier = "free" | "trial" | "premium";
export const FEATURE_ACCESS_EVENT = "medicforest:feature-access";

// UI convenience only. Every paid server operation independently verifies access.
export function requestFeatureAccess(tier: FeatureTier, label: string, deniedByServer = false, next?: string) {
  return window.dispatchEvent(new CustomEvent(FEATURE_ACCESS_EVENT, {
    cancelable: true, detail: { tier, label, deniedByServer, next },
  }));
}

export function featureAccessDecision(userId: string | null, isPremium: boolean, tier: FeatureTier, freeInterviewUsed = false) {
  if (tier === "premium" && !isPremium) return "premium";
  if (!userId) return "signup";
  if (tier === "trial" && freeInterviewUsed && !isPremium) return "premium";
  return "allowed";
}

export function safeInterviewReturnPath(value: unknown): string | null {
  if (typeof value !== "string" || value.includes("\\") || !/^\/(?:medicforest\/interview|interviews)(?:[/?]|$)/.test(value)) return null;
  const base = "https://medicforest.invalid";
  const url = new URL(value, base);
  if (url.origin !== base || !/^\/(?:medicforest\/interview|interviews)(?:\/|$)/.test(url.pathname)) return null;
  return url.pathname + url.search;
}
