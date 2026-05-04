import { UCATQuestionBankClient } from "../../_components/UCATQuestionBankClient";
import { UCAT_SECTIONS } from "../../_lib/ucatQuestionBank";

export function generateStaticParams() {
  return UCAT_SECTIONS.map((section) => ({ section: section.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return <UCATQuestionBankClient section={section} />;
}
