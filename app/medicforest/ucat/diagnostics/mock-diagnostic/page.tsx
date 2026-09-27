import { getMedicForestEntitlements } from "@/utils/medicforest/premium-access";
import { redirect } from "next/navigation";
import { PremiumDiagnosticLock } from "../../_components/PremiumDiagnosticLock";

type MockDiagnosticSearchParams = {
  mock?: string | string[];
};

function getMockId(searchParams: MockDiagnosticSearchParams) {
  return Array.isArray(searchParams.mock)
    ? searchParams.mock[0]
    : searchParams.mock;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<MockDiagnosticSearchParams>;
}) {
  const { isPremium } = await getMedicForestEntitlements();
  if (!isPremium) {
    return (
      <PremiumDiagnosticLock
        backHref="/medicforest/ucat/diagnostic"
        description="Random question-bank diagnostic mocks are Premium. The free QR diagnostic is still available from the diagnostic page."
      />
    );
  }

  const mockId = getMockId(await searchParams);
  redirect(
    mockId
      ? `/medicforest/ucat/mocks/full?mock=${encodeURIComponent(mockId)}`
      : "/medicforest/ucat/mocks/full"
  );
}
