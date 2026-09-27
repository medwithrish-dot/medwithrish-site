"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

const subscribe = () => () => {};

export function useVisiblePathname() {
  const pathname = usePathname();
  // Static pages can be served through host rewrites. Prefixed links work on
  // both hosts before hydration; then the browser path selects clean links.
  return useSyncExternalStore(subscribe, () => pathname, () => "/medicforest");
}
