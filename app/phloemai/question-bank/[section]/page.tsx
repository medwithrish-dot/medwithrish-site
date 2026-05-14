import { UCATQuestionBankClient } from "../../_components/UCATQuestionBankClient";
import { UCAT_SECTIONS } from "../../_lib/ucatQuestionBank";

type QuestionBankSectionSearchParams = {
  diagnostic?: string | string[];
  review?: string | string[];
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
  return (
    <UCATQuestionBankClient
      section={section}
      diagnosticMode={getDiagnosticMode(resolvedSearchParams)}
      reviewMode={getReviewMode(resolvedSearchParams)}
      mockId={getMockId(resolvedSearchParams)}
    />
  );
}
