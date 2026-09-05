import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock3, ExternalLink, Users } from "lucide-react";
import { InterviewShell } from "../../_components/InterviewShell";
import { findInterviewUniversity, interviewUniversities, universityTimingSummary, UNIVERSITY_SOURCES_CHECKED } from "../../_data/universities";

export function generateStaticParams() {
  return interviewUniversities.map(({ slug }) => ({ university: slug }));
}

type UniversityPageProps = { params: Promise<{ university: string }> };

export async function generateMetadata({ params }: UniversityPageProps): Promise<Metadata> {
  const entry = findInterviewUniversity((await params).university);
  return { title: `${entry?.name ?? "University"} Interview | PhloemAI` };
}

export default async function Page({ params }: UniversityPageProps) {
  const entry = findInterviewUniversity((await params).university);
  if (!entry) notFound();
  const totalSeconds = entry.stationCount * (entry.stationSeconds + entry.preparationSeconds) + Math.max(0, entry.stationCount - 1) * entry.breakSeconds;

  return (
    <InterviewShell title={entry.name} subtitle="A focused rehearsal for your next step into medicine. Read the format notes below, then practise answering under time pressure." activeLabel="Universities" eyebrow="University interview practice">
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl bg-[#042724] p-6 text-white sm:p-8">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-[#a9eee7]">{entry.format === "Unconfirmed" ? "General practice" : entry.format}</span>
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-[#a9eee7]">{entry.timingStatus === "published" ? "Reported timing" : "Practice preset"}</span>
          </div>
          <h2 className="mt-6 text-2xl font-bold sm:text-3xl">Make your preparation personal.</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[#c2d8d5]">{entry.timingNote}</p>
          <Link href={`/phloemai/interviews/ai-interviews?university=${entry.slug}`} className="mt-7 inline-flex items-center gap-3 rounded-xl bg-[#159a9d] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0f8588]">Start rehearsal <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </section>
        <section className="rounded-2xl border border-[#d8e0e6] bg-white p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#08787b]"><Clock3 className="h-4 w-4" aria-hidden="true" /> Your practice timing</div>
          <p className="mt-5 text-2xl font-bold text-[#042724]">{universityTimingSummary(entry)}</p>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-[#4a6370]">Preparation per block</dt><dd className="font-semibold">{entry.preparationSeconds ? `${entry.preparationSeconds} seconds` : "None added"}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-[#4a6370]">Between blocks</dt><dd className="font-semibold">{entry.breakSeconds ? `${entry.breakSeconds} seconds` : "No extra interval"}</dd></div>
            <div className="flex justify-between gap-4 border-t border-[#edf1f2] pt-4"><dt className="text-[#4a6370]">Full rehearsal</dt><dd className="font-semibold">About {Math.ceil(totalSeconds / 60)} minutes</dd></div>
          </dl>
          <p className="mt-5 text-xs leading-5 text-[#4a6370]">Your interview invitation sets the final format and timing. This practice does not include registration, tours or separate tests.</p>
        </section>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Link href="/phloemai/interviews/ai-interviews?station=why-medicine" className="rounded-2xl border border-[#bcdedb] bg-[#e3f5f2] p-6 transition-colors hover:bg-white"><p className="text-xs font-bold uppercase tracking-wider text-[#08787b]">Free for everyone</p><h2 className="mt-3 text-lg font-bold">Why medicine?</h2><p className="mt-2 text-sm leading-6 text-[#314956]">Start with your motivation. Get feedback and choose whether to share your result on the leaderboard.</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#08787b]">Start free station <ArrowRight className="h-4 w-4" aria-hidden="true" /></span></Link>
        <Link href="/phloemai/interviews/groups" className="rounded-2xl border border-[#d8e0e6] bg-white p-6 transition-colors hover:border-[#159a9d]"><Users className="h-5 w-5 text-[#08787b]" aria-hidden="true" /><h2 className="mt-3 text-lg font-bold">Bring your study group</h2><p className="mt-2 text-sm leading-6 text-[#314956]">Work through a station with friends, read each other’s responses and build your confidence together.</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#08787b]">Open Groups <ArrowRight className="h-4 w-4" aria-hidden="true" /></span></Link>
        <section className="rounded-2xl border border-[#d8e0e6] bg-white p-6"><p className="text-xs font-bold uppercase tracking-wider text-[#08787b]">Check the details</p><h2 className="mt-3 text-lg font-bold">Sources &amp; admissions</h2><p className="mt-2 text-sm leading-6 text-[#314956]">Checked {UNIVERSITY_SOURCES_CHECKED}. Follow official admissions guidance for your application route.</p><a href={entry.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#08787b]">{entry.sourceUrl.includes("theukcatpeople.co.uk") ? "TheUKCATPeople guide" : "Format source"}<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a><a href={entry.officialUrl} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-2 text-sm font-bold text-[#08787b]">University website <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a></section>
      </div>
      <Link href="/phloemai/interviews/universities" className="mt-6 inline-flex text-sm font-bold text-[#08787b]">Browse all universities</Link>
    </InterviewShell>
  );
}
