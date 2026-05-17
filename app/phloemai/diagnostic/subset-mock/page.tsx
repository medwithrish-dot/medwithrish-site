import { redirect } from "next/navigation";

type SubsetMockSearchParams = {
  mock?: string | string[];
};

function getMockId(searchParams: SubsetMockSearchParams) {
  return Array.isArray(searchParams.mock)
    ? searchParams.mock[0]
    : searchParams.mock;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SubsetMockSearchParams>;
}) {
  const mockId = getMockId(await searchParams);
  redirect(
    mockId
      ? `/phloemai/mocks/subtest?mock=${encodeURIComponent(mockId)}`
      : "/phloemai/mocks/subtest"
  );
}
