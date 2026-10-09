"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { medicForestPublicHref } from "@/utils/medicforest/public-navigation";
import { useVisiblePathname } from "./useVisiblePathname";

// Keep links on the current host's route form. Going through an absolute
// canonical redirect forces a document navigation and loses the current page.
export default function MedicForestLink({ href, ...props }: ComponentProps<typeof Link>) {
  const pathname = useVisiblePathname();
  const destination = typeof href === "string"
    ? medicForestPublicHref(pathname, href)
    : { ...href, pathname: href.pathname ? medicForestPublicHref(pathname, href.pathname) : href.pathname };
  return <Link href={destination} {...props} />;
}
