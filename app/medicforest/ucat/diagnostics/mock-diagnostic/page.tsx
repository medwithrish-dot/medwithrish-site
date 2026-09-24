import { getMedicForestEntitlements } from "@/utils/medicforest/premium-access";
import { redirect } from "next/navigation";
import { PremiumDiagnosticLock } from "../../_components/PremiumDiagnosticLock";

export default async function Page() {
  const { isPremium } = await getMedicForestEntitlements();
  if (!isPremium) {
    return (
      <PremiumDiagnosticLock
        backHref="/medicforest/ucat/diagnostic"
        description="Random question-bank diagnostic mocks are Premium. The free QR diagnostic is still available from the diagnostic page."
      />
    );
  }

  redirect("/medicforest/ucat/mocks/full");
}
