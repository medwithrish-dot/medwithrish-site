import { getPhloemEntitlements } from "@/utils/phloemai/premium-access";
import { PremiumDiagnosticLock } from "../../_components/PremiumDiagnosticLock";
import { UCATQuestionBankClient } from "../../_components/UCATQuestionBankClient";
import { UCAT_SECTIONS } from "../../_lib/ucatQuestionBank";

type QuestionBankSectionSearchParams = {
  diagnostic?: string | string[];
  review?: string | string[];
  set?: string | string[];
  mock?: string | string[];
};

function getDiagnosticMode(searchParams: QuestionBankSectionSearchParams) {
  const value = Array.isArray(searchParams.diagnostic)
    ? searchParams.diagnostic[0]
    : searchParams.diagnostic;

  return value;
}

function getReviewMode(searchParams: QuestionBankSectionSearchParams) {
  const value = Array.isArray(searchParams.review)
    ? searchParams.review[0]
    : searchParams.review;

  return value === "sets";
}

function getMockId(searchParams: QuestionBankSectionSearchParams) {
  const value = Array.isArray(searchParams.mock)
    ? searchParams.mock[0]
    : searchParams.mock;

  return value;
}

function getPracticeSetId(searchParams: QuestionBankSectionSearchParams) {
  const value = Array.isArray(searchParams.set)
    ? searchParams.set[0]
    : searchParams.set;

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

function withMockQuery(path: string, mockId?: string) {
  if (!mockId) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}mock=${encodeURIComponent(mockId)}`;
}

function getBackHref(searchParams: QuestionBankSectionSearchParams) {
  const diagnosticMode = getDiagnosticMode(searchParams);
  const mockId = getMockId(searchParams);

  if (diagnosticMode === "subset") {
    return withMockQuery("/phloemai/question-bank?diagnostic=subset", mockId);
  }

  if (diagnosticMode === "full-section") {
    return withMockQuery("/phloemai/mocks/full", mockId);
  }

  return undefined;
}

function getBackLabel(searchParams: QuestionBankSectionSearchParams) {
  const diagnosticMode = getDiagnosticMode(searchParams);

  if (diagnosticMode === "subset") return "Back to custom diagnostic";
  if (diagnosticMode === "full-section") return "Back to diagnostic mock";

  return undefined;
}

export function generateStaticParams() {
  return UCAT_SECTIONS.map((section) => ({ section: section.slug }));
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<QuestionBankSectionSearchParams>;
}) {
  const { section } = await params;
  const resolvedSearchParams = await searchParams;
  const diagnosticMode = getDiagnosticMode(resolvedSearchParams);
  const backHref = getBackHref(resolvedSearchParams);
  const backLabel = getBackLabel(resolvedSearchParams);

  if (isPremiumDiagnosticMode(diagnosticMode)) {
    const { isPremium } = await getPhloemEntitlements();
    if (!isPremium) {
      return (
        <PremiumDiagnosticLock
          backHref={backHref ?? "/phloemai/diagnostic"}
          backLabel={backLabel ?? "Back to diagnostics"}
          description="Random question-bank diagnostic mocks are Premium. The free QR diagnostic stays available from the diagnostic page."
        />
      );
    }
  }

  return (
    <UCATQuestionBankClient
      section={section}
      diagnosticMode={diagnosticMode}
      reviewMode={getReviewMode(resolvedSearchParams)}
      practiceSetId={getPracticeSetId(resolvedSearchParams)}
      mockId={getMockId(resolvedSearchParams)}
      backHref={backHref}
      backLabel={backLabel}
    />
  );
}
