import { UCATReportPage } from "../_components/PhloemAIClient";

type ReportSearchParams = {
  attempt?: string | string[];
  report?: string | string[];
  mock?: string | string[];
};

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<ReportSearchParams>;
}) {
  const params = await searchParams;
  const initialReportId =
    getFirstParam(params.attempt) ?? getFirstParam(params.report) ?? null;
  const initialMockId = getFirstParam(params.mock) ?? null;

  return (
    <UCATReportPage
      initialReportId={initialReportId || null}
      initialMockId={initialMockId || null}
    />
  );
}
