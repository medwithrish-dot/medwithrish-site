import { getPhloemEntitlements } from "@/utils/phloemai/premium-access";
import { PremiumDiagnosticLock } from "../../_components/PremiumDiagnosticLock";
import { UCATMockDiagnosticPage } from "../../_components/PhloemAIClient";

export default async function Page() {
  const { isPremium } = await getPhloemEntitlements();
  if (!isPremium) {
    return (
      <PremiumDiagnosticLock
        backHref="/phloemai/diagnostic"
        description="Mock diagnostics, full mocks, subtest mocks and 15-minute sprints are Premium. The free QR diagnostic is still available from the diagnostic page."
      />
    );
  }

  return <UCATMockDiagnosticPage />;
}
