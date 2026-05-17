import { getPhloemEntitlements } from "@/utils/phloemai/premium-access";
import { PremiumDiagnosticLock } from "../../../_components/PremiumDiagnosticLock";
import { UCATQuestionBankClient } from "../../../_components/UCATQuestionBankClient";
import { UCAT_SECTIONS } from "../../../_lib/ucatQuestionBank";

type FullMockSectionSearchParams = {
  mock?: string | string[];
};

function getMockId(searchParams: FullMockSectionSearchParams) {
  return Array.isArray(searchParams.mock)
    ? searchParams.mock[0]
    : searchParams.mock;
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
  const mockId = getMockId(await searchParams);
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
      backHref={withMockBackHref(mockId)}
      backLabel="Back to full mocks"
    />
  );
}
