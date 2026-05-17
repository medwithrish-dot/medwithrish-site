import { redirect } from "next/navigation";
import { UCAT_SECTIONS } from "../../../_lib/ucatQuestionBank";

type FullMockSectionSearchParams = {
  mock?: string | string[];
};

function getMockId(searchParams: FullMockSectionSearchParams) {
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
  searchParams: Promise<FullMockSectionSearchParams>;
}) {
  const { section } = await params;
  const mockId = getMockId(await searchParams);
  redirect(
    mockId
      ? `/phloemai/mocks/full/${section}?mock=${encodeURIComponent(mockId)}`
      : `/phloemai/mocks/full/${section}`
  );
}
