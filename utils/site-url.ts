const localOriginPattern = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/;

function getConfiguredSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredUrl) {
    let url: URL;
    try {
      url = new URL(configuredUrl);
    } catch {
      throw new Error("NEXT_PUBLIC_SITE_URL must be an absolute HTTP(S) URL.");
    }
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username || url.password || url.search || url.hash ||
      url.pathname !== "/"
    ) {
      throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTP(S) origin without a path, credentials, query or fragment.");
    }
    return url.origin;
  }
  return null;
}

export function getPublicSiteUrl() {
  return getConfiguredSiteUrl() ?? "https://www.medwithrish.com";
}

export function getRequiredSiteUrl(request: Request) {
  const configuredUrl = getConfiguredSiteUrl();
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
