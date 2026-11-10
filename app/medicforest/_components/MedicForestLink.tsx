"use client";

import Link from "next/link";
import { useInterviewPlatform } from "../interview/_lib/platform-context";
import type { ComponentProps } from "react";
import { medicForestPublicHref } from "@/utils/medicforest/public-navigation";
import { useVisiblePathname } from "./useVisiblePathname";

// Keep links on the current host's route form. Going through an absolute
// canonical redirect forces a document navigation and loses the current page.
export default function MedicForestLink({ href, ...props }: ComponentProps<typeof Link>) {
  const visible = useVisiblePathname();
  const platform = useInterviewPlatform();
  // The provider also scopes server-rendered links before the rewritten pathname hydrates.
  const pathname = platform === "dentistry" && visible === "/medicforest" ? "/medicforest/dentistry/interviews" : visible;
  const destination = typeof href === "string"
    ? medicForestPublicHref(pathname, href)
    : { ...href, pathname: href.pathname ? medicForestPublicHref(pathname, href.pathname) : href.pathname };
  return <Link href={destination} {...props} />;
}
