import { getPhloemEntitlements } from "@/utils/phloemai/premium-access";
import { PremiumDiagnosticLock } from "../../_components/PremiumDiagnosticLock";
import { UCATQuestionBankClient } from "../../_components/UCATQuestionBankClient";

type SubsetMockSearchParams = {
  mock?: string | string[];
};

function getMockId(searchParams: SubsetMockSearchParams) {
  return Array.isArray(searchParams.mock)
    ? searchParams.mock[0]
    : searchParams.mock;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SubsetMockSearchParams>;
}) {
  const { isPremium } = await getPhloemEntitlements();
  if (!isPremium) return <PremiumDiagnosticLock />;
  return (
    <UCATQuestionBankClient
      diagnosticMode="section-mock"
      mockId={getMockId(await searchParams)}
    />
  );
}
