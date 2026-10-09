export function medicForestPublicHref(pathname: string, href: string) {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const prefixedPath = pathname === "/medicforest" || pathname.startsWith("/medicforest/");
  if (prefixedPath) {
    if (href === "/medicforest" || href.startsWith("/medicforest/")) return href;
    if (/^\/interviews(?:[?#]|$)/.test(href)) return `/medicforest${href}`;
    if (href.startsWith("/interviews/")) return `/medicforest/interview${href.slice("/interviews".length)}`;
    if (href === "/") return "/medicforest";
    if (/^\/(?:about|pricing|tutoring|resources|feedback|contact|access|account|ucat)(?:[/?#]|$)/.test(href)) return `/medicforest${href}`;
    // Shared legal pages and static assets remain at the site root.
    return href;
  }
  if (/^\/medicforest\/interview(?:[?#]|$)/.test(href)) return `/interviews/dashboard${href.slice("/medicforest/interview".length)}`;
  if (href.startsWith("/medicforest/interview/")) return `/interviews${href.slice("/medicforest/interview".length)}`;
  if (/^\/medicforest\/interviews(?:[/?#]|$)/.test(href)) return href.slice("/medicforest".length);
  if (href === "/medicforest") return "/";
  if (/^\/medicforest\/(?:about|pricing|tutoring|resources|feedback|contact|access|account|ucat)(?:[/?#]|$)/.test(href)) return href.slice("/medicforest".length);
  return href;
}
