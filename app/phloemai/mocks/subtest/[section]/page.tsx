import { getPhloemEntitlements } from "@/utils/phloemai/premium-access";
import { PremiumDiagnosticLock } from "../../../_components/PremiumDiagnosticLock";
import { UCATQuestionBankClient } from "../../../_components/UCATQuestionBankClient";
import { UCAT_SECTIONS } from "../../../_lib/ucatQuestionBank";

type SubtestSearchParams = {
  mock?: string | string[];
  set?: string | string[];
};

function getMockId(searchParams: SubtestSearchParams) {
  return Array.isArray(searchParams.mock)
    ? searchParams.mock[0]
    : searchParams.mock;
}

function getPracticeSetId(searchParams: SubtestSearchParams) {
  return Array.isArray(searchParams.set)
    ? searchParams.set[0]
    : searchParams.set;
}

export function generateStaticParams() {
  return UCAT_SECTIONS.map((section) => ({ section: section.slug }));
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<SubtestSearchParams>;
}) {
  const { section } = await params;
  const resolvedSearchParams = await searchParams;
  const mockId = getMockId(resolvedSearchParams);
  const { isPremium } = await getPhloemEntitlements();

  if (!isPremium) {
    return (
      <PremiumDiagnosticLock
        backHref="/phloemai/mocks/full"
        backLabel="Back to mocks"
      />
    );
  }

  return (
    <UCATQuestionBankClient
      section={section}
      diagnosticMode="full-section"
      mockId={mockId}
      practiceSetId={getPracticeSetId(resolvedSearchParams)}
      backHref="/phloemai/mocks/full"
      backLabel="Back to mocks"
    />
  );
}
