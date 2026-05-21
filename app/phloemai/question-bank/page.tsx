import { getPhloemEntitlements } from "@/utils/phloemai/premium-access";
import { PremiumDiagnosticLock } from "../_components/PremiumDiagnosticLock";
import { UCATQuestionBankClient } from "../_components/UCATQuestionBankClient";

type QuestionBankSearchParams = {
  diagnostic?: string | string[];
  mock?: string | string[];
};

function getDiagnosticMode(searchParams: QuestionBankSearchParams) {
  const value = Array.isArray(searchParams.diagnostic)
    ? searchParams.diagnostic[0]
    : searchParams.diagnostic;

  return value;
}

function getMockId(searchParams: QuestionBankSearchParams) {
  const value = Array.isArray(searchParams.mock)
    ? searchParams.mock[0]
    : searchParams.mock;

  return value;
}

function isPremiumDiagnosticMode(mode?: string | null) {
  return (
    mode === "full" ||
    mode === "full-mock" ||
    mode === "section-mock" ||
    mode === "full-section" ||
    mode === "subset"
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<QuestionBankSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const diagnosticMode = getDiagnosticMode(resolvedSearchParams);

  if (isPremiumDiagnosticMode(diagnosticMode)) {
    const { isPremium } = await getPhloemEntitlements();
    if (!isPremium) {
      return (
        <PremiumDiagnosticLock
          backHref="/phloemai/diagnostic"
          description="Mock diagnostics, full mocks, subtest mocks and 15-minute sprints are Premium. The free QR diagnostic stays available from the diagnostic page."
        />
      );
    }
  }

  return (
    <UCATQuestionBankClient
      diagnosticMode={diagnosticMode}
      mockId={getMockId(resolvedSearchParams)}
    />
  );
}
