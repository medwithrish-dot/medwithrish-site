import { notFound, redirect } from "next/navigation";
import { findInterviewStation } from "../../_data/interview-stations";

export default async function Page({ params }: { params: Promise<{ station: string }> }) {
  const { station } = await params;
  const selected = findInterviewStation(station);
  if (!selected) notFound();
  redirect(`/phloemai/interviews/ai-interviews?station=${selected.slug}`);
}
