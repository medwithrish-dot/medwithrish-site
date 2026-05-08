import { UCATQuestionBankClient } from "../../_components/UCATQuestionBankClient";
import { UCAT_SECTIONS } from "../../_lib/ucatQuestionBank";

type QuestionBankSectionSearchParams = {
  diagnostic?: string | string[];
};

function getDiagnosticMode(searchParams: QuestionBankSectionSearchParams) {
  const value = Array.isArray(searchParams.diagnostic)
    ? searchParams.diagnostic[0]
    : searchParams.diagnostic;

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
  return (
    <UCATQuestionBankClient
      section={section}
      diagnosticMode={getDiagnosticMode(await searchParams)}
    />
  );
}
