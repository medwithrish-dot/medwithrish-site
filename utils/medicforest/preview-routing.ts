export function isMedicForestHost(hostname: string | null) {
  const host = hostname?.trim().toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
  return host === "medicforest.com" || host === "www.medicforest.com";
}

export function previewPathname(pathname: string, productHost: boolean) {
  if (!productHost) return pathname;

  // Proxy runs before the host rewrites in next.config.ts.
  if (pathname === "/interviews") return "/medicforest/interviews";
  if (pathname.startsWith("/interviews/")) {
    return `/medicforest/interview${pathname.slice("/interviews".length)}`;
  }
  if (pathname === "/ucat" || pathname.startsWith("/ucat/")) {
    return `/medicforest${pathname}`;
  }

  return pathname;
}
