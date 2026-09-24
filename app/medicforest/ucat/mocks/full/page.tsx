import { getMedicForestEntitlements } from "@/utils/medicforest/premium-access";
import { PremiumDiagnosticLock } from "../../_components/PremiumDiagnosticLock";
import { UCATQuestionBankClient } from "../../_components/UCATQuestionBankClient";

type FullMockSearchParams = {
  mock?: string | string[];
};

function getMockId(searchParams: FullMockSearchParams) {
  return Array.isArray(searchParams.mock)
    ? searchParams.mock[0]
    : searchParams.mock;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<FullMockSearchParams>;
}) {
  const { isPremium } = await getMedicForestEntitlements();
  if (!isPremium) return <PremiumDiagnosticLock backHref="/medicforest/ucat/practice" />;
  return (
    <UCATQuestionBankClient
      diagnosticMode="full-mock"
      mockId={getMockId(await searchParams)}
    />
  );
}
