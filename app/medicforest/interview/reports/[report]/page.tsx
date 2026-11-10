import { InterviewReport } from "../../_components/InterviewReport";
export const metadata = { title: "Your saved Med interview review | MedicForest", robots: { index: false, follow: true } };
export default async function Page({ params }: { params: Promise<{ report: string }> }) {
  return <InterviewReport report={(await params).report} />;
}
