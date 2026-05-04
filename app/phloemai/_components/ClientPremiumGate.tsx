"use client";

import type { ReactNode } from "react";
import { PremiumLockCard } from "./PremiumLockCard";

type ClientPremiumGateProps = {
  isPremium: boolean;
  children: ReactNode;
  title?: string;
  description?: string;
  featureLabel?: string;
  buttonLabel?: string;
  className?: string;
  checkoutLoading?: boolean;
  onUpgrade?: () => void | Promise<void>;
};

export function ClientPremiumGate({
  isPremium,
  children,
  title,
  description,
  featureLabel,
  buttonLabel,
  className,
  checkoutLoading,
  onUpgrade,
}: ClientPremiumGateProps) {
  if (isPremium) return <>{children}</>;

  return (
    <PremiumLockCard
      title={title}
      description={description}
      featureLabel={featureLabel}
      buttonLabel={buttonLabel}
      className={className}
      checkoutLoading={checkoutLoading}
      onUpgrade={onUpgrade}
    />
  );
}
