export type CheckoutReturnArea = "ucat" | "interviews";

export function getBillingReturnPath(
  siteUrl: string,
  area: CheckoutReturnArea,
  destination: "checkout" | "portal"
) {
  if (area === "interviews") {
    return new URL(siteUrl).hostname === "medicforest.com"
      ? "/pricing"
      : "/medicforest/pricing";
  }

  return destination === "portal"
    ? "/medicforest/account"
    : "/medicforest/ucat/dashboard";
}
