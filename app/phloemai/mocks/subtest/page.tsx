import { getPhloemEntitlements } from "@/utils/phloemai/premium-access";
import { PremiumDiagnosticLock } from "../../_components/PremiumDiagnosticLock";
import { UCATQuestionBankClient } from "../../_components/UCATQuestionBankClient";

type SubtestMockSearchParams = {
  mock?: string | string[];
  timing?: string | string[];
};

function getMockId(searchParams: SubtestMockSearchParams) {
  return Array.isArray(searchParams.mock)
    ? searchParams.mock[0]
    : searchParams.mock;
}

function getSectionMockTiming(searchParams: SubtestMockSearchParams) {
  const value = Array.isArray(searchParams.timing)
    ? searchParams.timing[0]
    : searchParams.timing;

  return value === "short" ? value : undefined;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SubtestMockSearchParams>;
}) {
  const { isPremium } = await getPhloemEntitlements();
  if (!isPremium) return <PremiumDiagnosticLock backHref="/phloemai/practice" />;
  const resolvedSearchParams = await searchParams;
  return (
    <UCATQuestionBankClient
      diagnosticMode="section-mock"
      mockId={getMockId(resolvedSearchParams)}
      sectionMockTiming={getSectionMockTiming(resolvedSearchParams)}
    />
  );
}
