const localOriginPattern = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/;

export function getRequiredSiteUrl(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredUrl?.startsWith("http")) {
    return configuredUrl.replace(/\/$/, "");
  }

  const requestOrigin = request.headers.get("origin")?.trim();
  if (requestOrigin && localOriginPattern.test(requestOrigin)) {
    return requestOrigin.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  throw new Error("Missing NEXT_PUBLIC_SITE_URL.");
}
