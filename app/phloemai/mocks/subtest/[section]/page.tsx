import { getPhloemEntitlements } from "@/utils/phloemai/premium-access";
import { PremiumDiagnosticLock } from "../../../_components/PremiumDiagnosticLock";
import { UCATQuestionBankClient } from "../../../_components/UCATQuestionBankClient";
import { UCAT_SECTIONS } from "../../../_lib/ucatQuestionBank";

type SubtestMockSectionSearchParams = {
  mock?: string | string[];
};

function getMockId(searchParams: SubtestMockSectionSearchParams) {
  return Array.isArray(searchParams.mock)
    ? searchParams.mock[0]
    : searchParams.mock;
}

function withMockBackHref(mockId?: string) {
  return mockId
    ? `/phloemai/mocks/subtest?mock=${encodeURIComponent(mockId)}`
    : "/phloemai/mocks/subtest";
}

export function generateStaticParams() {
  return UCAT_SECTIONS.map((section) => ({ section: section.slug }));
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<SubtestMockSectionSearchParams>;
}) {
  const { section } = await params;
  const mockId = getMockId(await searchParams);
  const { isPremium } = await getPhloemEntitlements();

  if (!isPremium) {
    return (
      <PremiumDiagnosticLock
        backHref={withMockBackHref(mockId)}
        backLabel="Back to subtest mocks"
      />
    );
  }

  return (
    <UCATQuestionBankClient
      section={section}
      diagnosticMode="full-section"
      mockId={mockId}
      backHref={withMockBackHref(mockId)}
      backLabel="Back to subtest mocks"
    />
  );
}
