const localOriginPattern = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/;

function getConfiguredOrigin(name: "NEXT_PUBLIC_SITE_URL" | "NEXT_PUBLIC_PRODUCT_SITE_URL") {
  const configuredUrl = process.env[name]?.trim();
  if (configuredUrl) {
    let url: URL;
    try {
      url = new URL(configuredUrl);
    } catch {
      throw new Error(`${name} must be an absolute HTTP(S) URL.`);
    }
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username || url.password || url.search || url.hash ||
      url.pathname !== "/"
    ) {
      throw new Error(`${name} must be an HTTP(S) origin without a path, credentials, query or fragment.`);
    }
    return url.origin;
  }
  return null;
}

export function getPublicSiteUrl() {
  return getConfiguredOrigin("NEXT_PUBLIC_SITE_URL") ?? "https://www.medwithrish.com";
}

export function getProductSiteUrl() {
  return getConfiguredOrigin("NEXT_PUBLIC_PRODUCT_SITE_URL") ?? "https://medicforest.com";
}

export function getRequiredSiteUrl(request: Request) {
  const configuredUrl = getConfiguredOrigin("NEXT_PUBLIC_SITE_URL");
  const productUrl = getProductSiteUrl();
  const requestUrl = new URL(request.url);

  // Product checkout and portal journeys should return to Medic Forest even
  // when it shares a deployment with the MedWithRish website.
  if (requestUrl.origin === productUrl) return productUrl;
  if (configuredUrl) return configuredUrl;

  const requestOrigin = request.headers.get("origin")?.trim();
  if (process.env.NODE_ENV !== "production" && requestOrigin && localOriginPattern.test(requestOrigin)) {
    return requestOrigin.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  throw new Error("Missing NEXT_PUBLIC_SITE_URL.");
}
