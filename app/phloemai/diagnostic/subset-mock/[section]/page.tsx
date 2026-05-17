import { redirect } from "next/navigation";
import { UCAT_SECTIONS } from "../../../_lib/ucatQuestionBank";

type SubsetMockSectionSearchParams = {
  mock?: string | string[];
};

function getMockId(searchParams: SubsetMockSectionSearchParams) {
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
  searchParams: Promise<SubsetMockSectionSearchParams>;
}) {
  const { section } = await params;
  const mockId = getMockId(await searchParams);
  redirect(
    mockId
      ? `/phloemai/mocks/subtest/${section}?mock=${encodeURIComponent(mockId)}`
      : `/phloemai/mocks/subtest/${section}`
  );
}
