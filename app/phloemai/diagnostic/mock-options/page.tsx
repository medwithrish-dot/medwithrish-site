import { getPhloemEntitlements } from "@/utils/phloemai/premium-access";
import { PremiumDiagnosticLock } from "../../_components/PremiumDiagnosticLock";
import { UCATQuestionBankClient } from "../../_components/UCATQuestionBankClient";

export default async function Page() {
  const { isPremium } = await getPhloemEntitlements();
  if (!isPremium) return <PremiumDiagnosticLock />;
  return <UCATQuestionBankClient diagnosticMode="full" />;
}
