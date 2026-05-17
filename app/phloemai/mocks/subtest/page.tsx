import { getPhloemEntitlements } from "@/utils/phloemai/premium-access";
import { PremiumDiagnosticLock } from "../../_components/PremiumDiagnosticLock";
import { UCATQuestionBankClient } from "../../_components/UCATQuestionBankClient";

type SubtestMockSearchParams = {
  mock?: string | string[];
};

function getMockId(searchParams: SubtestMockSearchParams) {
  return Array.isArray(searchParams.mock)
    ? searchParams.mock[0]
    : searchParams.mock;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SubtestMockSearchParams>;
}) {
  const { isPremium } = await getPhloemEntitlements();
  if (!isPremium) return <PremiumDiagnosticLock backHref="/phloemai/practice" />;
  return (
    <UCATQuestionBankClient
      diagnosticMode="section-mock"
      mockId={getMockId(await searchParams)}
    />
  );
}
