import { UCATQuestionBankClient } from "../_components/UCATQuestionBankClient";

type QuestionBankSearchParams = {
  diagnostic?: string | string[];
};

function getDiagnosticMode(searchParams: QuestionBankSearchParams) {
  const value = Array.isArray(searchParams.diagnostic)
    ? searchParams.diagnostic[0]
    : searchParams.diagnostic;

  return value;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<QuestionBankSearchParams>;
}) {
  return (
    <UCATQuestionBankClient
      diagnosticMode={getDiagnosticMode(await searchParams)}
    />
  );
}
