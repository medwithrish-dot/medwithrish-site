"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { requestFeatureAccess, type FeatureTier } from "@/utils/medicforest/feature-access";

export function FeatureActionLink({ tier = "free", feature, ...props }: ComponentProps<typeof Link> & { tier?: FeatureTier; feature: string }) {
  return <Link {...props} onClick={(event) => {
    if (!requestFeatureAccess(tier, feature, false, typeof props.href === "string" ? props.href : undefined)) event.preventDefault();
    else props.onClick?.(event);
  }} />;
}
