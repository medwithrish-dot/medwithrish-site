import { getPhloemEntitlements } from "@/utils/phloemai/premium-access";
import { PremiumDiagnosticLock } from "../../../_components/PremiumDiagnosticLock";
import { UCATQuestionBankClient } from "../../../_components/UCATQuestionBankClient";
import { UCAT_SECTIONS } from "../../../_lib/ucatQuestionBank";

type SprintSearchParams = {
  mock?: string | string[];
};

function getMockId(searchParams: SprintSearchParams) {
  return Array.isArray(searchParams.mock)
    ? searchParams.mock[0]
    : searchParams.mock;
}

export function generateStaticParams() {
  return UCAT_SECTIONS.map((section) => ({ section: section.slug }));
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<SprintSearchParams>;
}) {
  const { section } = await params;
  const mockId = getMockId(await searchParams);
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
      diagnosticMode="sprint"
      mockId={mockId}
      backHref="/phloemai/mocks/full"
      backLabel="Back to mocks"
    />
  );
}
