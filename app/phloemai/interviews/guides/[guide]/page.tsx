import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { InterviewShell } from "../../_components/InterviewShell";
import { findInterviewGuide, interviewGuides } from "../../_data/interviewGuides";

type Props = { params: Promise<{ guide: string }> };

export function generateStaticParams() {
  return interviewGuides.map((guide) => ({ guide: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = findInterviewGuide((await params).guide);
  return { title: `${guide?.title ?? "Guide"} | PhloemAI`, description: guide?.summary };
}

export default async function InterviewGuidePage({ params }: Props) {
  const guide = findInterviewGuide((await params).guide);
  if (!guide) notFound();
  const related = interviewGuides.filter((item) => item.slug !== guide.slug && item.category === guide.category).slice(0, 3);
  const questionBankHref = `/phloemai/interviews/question-bank?category=${encodeURIComponent(guide.category)}`;

  return (
    <InterviewShell title={guide.title} subtitle={guide.summary} eyebrow={guide.category} activeLabel="Guides">
      <Link href="/phloemai/interviews/guides" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#08787b]"><ArrowLeft size={15} aria-hidden="true" /> Back to the guide library</Link>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_290px]">
        <article className="rounded-2xl border border-[#dce6e5] bg-white p-6 sm:p-9">
          <div className="max-w-3xl space-y-8">
            {guide.sections.map((section) => <section key={section.title}><h2 className="text-xl font-bold text-[#173d36]">{section.title}</h2><p className="mt-3 whitespace-pre-line text-[15px] leading-8 text-[#405d58]">{section.text}</p></section>)}
            <section className="rounded-xl border border-[#dce6df] bg-[#f7f9f5] p-5"><h2 className="text-sm font-bold text-[#315248]">Common pitfalls</h2><p className="mt-2 text-sm leading-7 text-[#526b63]">{guide.avoid}</p></section>
            {guide.sources.length > 0 && <section className="border-t border-[#e2ebe7] pt-6"><h2 className="text-sm font-bold text-[#315248]">Official sources and further reading</h2><p className="mt-2 text-xs leading-6 text-[#61746e]">Reviewed {guide.reviewedAt}. Check the linked guidance for changes before discussing current policy or law.</p><ul className="mt-3 space-y-3">{guide.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[#08787b] underline decoration-[#c4dcd6] underline-offset-4 hover:decoration-[#08787b]">{source.title}<ExternalLink size={13} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a></li>)}</ul></section>}
          </div>
        </article>
        <aside className="space-y-5">
          <section className="rounded-2xl border border-[#cde0d7] bg-[#f1f7f2] p-5"><p className="text-[10px] font-bold uppercase tracking-widest text-[#5a7e68]">Try it yourself</p><h2 className="mt-3 text-base font-bold leading-7 text-[#214637]">{guide.practiceQuestion}</h2><p className="mt-3 text-sm leading-6 text-[#597266]">Try answering aloud, then choose one thing to improve.</p><Link href={guide.station ? `/phloemai/interviews/ai-interviews?station=${guide.station}` : questionBankHref} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#08787b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#06686b]">{guide.station ? "Practise this station" : "Open question bank"}<ArrowRight size={14} aria-hidden="true" /></Link></section>
          {related.length > 0 && <section className="rounded-2xl border border-[#dce6e5] bg-white p-5"><h2 className="text-sm font-bold text-[#315248]">Keep reading</h2><ul className="mt-4 space-y-4">{related.map((item) => <li key={item.slug}><Link href={`/phloemai/interviews/guides/${item.slug}`} className="text-sm leading-6 text-[#08787b] hover:underline">{item.title}</Link></li>)}</ul></section>}
        </aside>
      </div>
    </InterviewShell>
  );
}
