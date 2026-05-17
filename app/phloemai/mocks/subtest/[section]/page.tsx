import { getPhloemEntitlements } from "@/utils/phloemai/premium-access";
import { PremiumDiagnosticLock } from "../../../_components/PremiumDiagnosticLock";
import { UCATQuestionBankClient } from "../../../_components/UCATQuestionBankClient";
import { UCAT_SECTIONS } from "../../../_lib/ucatQuestionBank";

type SubtestMockSectionSearchParams = {
  mock?: string | string[];
  timing?: string | string[];
};

function getMockId(searchParams: SubtestMockSectionSearchParams) {
  return Array.isArray(searchParams.mock)
    ? searchParams.mock[0]
    : searchParams.mock;
}

function getSectionMockTiming(searchParams: SubtestMockSectionSearchParams) {
  const value = Array.isArray(searchParams.timing)
    ? searchParams.timing[0]
    : searchParams.timing;

  return value === "short" ? value : undefined;
}

function withMockBackHref(mockId?: string, timing?: string) {
  const params = new URLSearchParams();
  if (mockId) params.set("mock", mockId);
  if (timing === "short") params.set("timing", timing);

  const query = params.toString();
  return query ? `/phloemai/mocks/subtest?${query}` : "/phloemai/mocks/subtest";
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
  const resolvedSearchParams = await searchParams;
  const mockId = getMockId(resolvedSearchParams);
  const sectionMockTiming = getSectionMockTiming(resolvedSearchParams);
  const backHref = withMockBackHref(mockId, sectionMockTiming);
  const backLabel =
    sectionMockTiming === "short"
      ? "Back to 15-minute sprints"
      : "Back to subtest mocks";
  const { isPremium } = await getPhloemEntitlements();

  if (!isPremium) {
    return (
      <PremiumDiagnosticLock
        backHref={backHref}
        backLabel={backLabel}
      />
    );
  }

  return (
    <UCATQuestionBankClient
      section={section}
      diagnosticMode="full-section"
      mockId={mockId}
      sectionMockTiming={sectionMockTiming}
      backHref={backHref}
      backLabel={backLabel}
    />
  );
}
