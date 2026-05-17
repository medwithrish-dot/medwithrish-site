import { redirect } from "next/navigation";

type FullMockSearchParams = {
  mock?: string | string[];
};

function getMockId(searchParams: FullMockSearchParams) {
  return Array.isArray(searchParams.mock)
    ? searchParams.mock[0]
    : searchParams.mock;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<FullMockSearchParams>;
}) {
  const mockId = getMockId(await searchParams);
  redirect(
    mockId
      ? `/phloemai/mocks/full?mock=${encodeURIComponent(mockId)}`
      : "/phloemai/mocks/full"
  );
}
