export function medicForestPublicHref(pathname: string, href: string) {
  const prefixedPath = pathname === "/medicforest" || pathname.startsWith("/medicforest/");
  if (!prefixedPath || href.startsWith("/medicforest")) {
    return href;
  }

  return href === "/" ? "/medicforest" : `/medicforest${href}`;
}
