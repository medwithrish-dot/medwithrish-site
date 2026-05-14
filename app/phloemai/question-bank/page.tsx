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

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<QuestionBankSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <UCATQuestionBankClient
      diagnosticMode={getDiagnosticMode(resolvedSearchParams)}
      mockId={getMockId(resolvedSearchParams)}
    />
  );
}
