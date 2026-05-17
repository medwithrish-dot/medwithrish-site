import { getPhloemEntitlements } from "@/utils/phloemai/premium-access";
import { PremiumDiagnosticLock } from "../_components/PremiumDiagnosticLock";
import { UCATQuestionBankClient } from "../_components/UCATQuestionBankClient";

type MocksSearchParams = {
  mock?: string | string[];
};

function getMockId(searchParams: MocksSearchParams) {
  return Array.isArray(searchParams.mock)
    ? searchParams.mock[0]
    : searchParams.mock;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<MocksSearchParams>;
}) {
  const { isPremium } = await getPhloemEntitlements();
  if (!isPremium) return <PremiumDiagnosticLock backHref="/phloemai/practice" />;
  return (
    <UCATQuestionBankClient
      diagnosticMode="full-mock"
      mockId={getMockId(await searchParams)}
    />
  );
}
