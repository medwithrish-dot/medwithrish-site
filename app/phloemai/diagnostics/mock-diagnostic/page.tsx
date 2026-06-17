import { getPhloemEntitlements } from "@/utils/phloemai/premium-access";
import { redirect } from "next/navigation";
import { PremiumDiagnosticLock } from "../../_components/PremiumDiagnosticLock";

export default async function Page() {
  const { isPremium } = await getPhloemEntitlements();
  if (!isPremium) {
    return (
      <PremiumDiagnosticLock
        backHref="/phloemai/diagnostic"
        description="Random question-bank diagnostic mocks are Premium. The free QR diagnostic is still available from the diagnostic page."
      />
    );
  }

  redirect("/phloemai/mocks/full");
}
