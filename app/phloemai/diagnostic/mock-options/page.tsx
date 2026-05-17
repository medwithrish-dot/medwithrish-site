import { redirect } from "next/navigation";

type MockOptionsSearchParams = {
  mock?: string | string[];
};

function getMockId(searchParams: MockOptionsSearchParams) {
  return Array.isArray(searchParams.mock)
    ? searchParams.mock[0]
    : searchParams.mock;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<MockOptionsSearchParams>;
}) {
  const mockId = getMockId(await searchParams);
  redirect(
    mockId
      ? `/phloemai/mocks/full?mock=${encodeURIComponent(mockId)}`
      : "/phloemai/mocks/full"
  );
}
