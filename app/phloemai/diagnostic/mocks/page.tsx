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
      ? `/phloemai/diagnostics/mock-diagnostic?mock=${encodeURIComponent(mockId)}`
      : "/phloemai/diagnostics/mock-diagnostic"
  );
}
