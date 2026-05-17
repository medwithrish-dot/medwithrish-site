import { redirect } from "next/navigation";

type MocksSearchParams = {
  mock?: string | string[];
};

function getMockId(searchParams: MocksSearchParams) {
  return Array.isArray(searchParams.mock)
    ? searchParams.mock[0]
    : searchParams.mock;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<MocksSearchParams>;
}) {
  const mockId = getMockId(await searchParams);
  redirect(
    mockId
      ? `/phloemai/mocks/full?mock=${encodeURIComponent(mockId)}`
      : "/phloemai/mocks/full"
  );
}
