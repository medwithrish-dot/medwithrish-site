import { getPhloemEntitlements } from "@/utils/phloemai/premium-access";
import { PremiumDiagnosticLock } from "../../../_components/PremiumDiagnosticLock";
import { UCATQuestionBankClient } from "../../../_components/UCATQuestionBankClient";
import { UCAT_SECTIONS } from "../../../_lib/ucatQuestionBank";

type FullMockSectionSearchParams = {
  mock?: string | string[];
  set?: string | string[];
};

function getMockId(searchParams: FullMockSectionSearchParams) {
  return Array.isArray(searchParams.mock)
    ? searchParams.mock[0]
    : searchParams.mock;
}

function getPracticeSetId(searchParams: FullMockSectionSearchParams) {
  return Array.isArray(searchParams.set)
    ? searchParams.set[0]
    : searchParams.set;
}

function withMockBackHref(mockId?: string) {
  return mockId
    ? `/phloemai/mocks/full?mock=${encodeURIComponent(mockId)}`
    : "/phloemai/mocks/full";
}

export function generateStaticParams() {
  return UCAT_SECTIONS.map((section) => ({ section: section.slug }));
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<FullMockSectionSearchParams>;
}) {
  const { section } = await params;
  const resolvedSearchParams = await searchParams;
  const mockId = getMockId(resolvedSearchParams);
  const { isPremium } = await getPhloemEntitlements();

  if (!isPremium) {
    return (
      <PremiumDiagnosticLock
        backHref={withMockBackHref(mockId)}
        backLabel="Back to full mocks"
      />
    );
  }

  return (
    <UCATQuestionBankClient
      section={section}
      diagnosticMode="full-section"
      mockId={mockId}
      practiceSetId={getPracticeSetId(resolvedSearchParams)}
      backHref={withMockBackHref(mockId)}
      backLabel="Back to full mocks"
    />
  );
}
