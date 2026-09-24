import type { ReactNode } from "react";
import { getMedicForestEntitlements } from "@/utils/medicforest/premium-access";
import { PremiumLockCard } from "./PremiumLockCard";

type SecurePremiumGateProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  featureLabel?: string;
  buttonLabel?: string;
  className?: string;
};

export async function SecurePremiumGate({
  children,
  title,
  description,
  featureLabel,
  buttonLabel,
  className,
}: SecurePremiumGateProps) {
  const { isPremium } = await getMedicForestEntitlements();

  if (isPremium) return <>{children}</>;

  return (
    <PremiumLockCard
      title={title}
      description={description}
      featureLabel={featureLabel}
      buttonLabel={buttonLabel}
      className={className}
    />
  );
}
