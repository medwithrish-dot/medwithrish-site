import Link from "@/app/medicforest/_components/MedicForestLink";
import { DENTISTRY_GUIDES } from "../_data/dentistry-guides";

export function DentistryGuideViews({ slug }: { slug?: string }) {
  const guide = DENTISTRY_GUIDES.find(item => item.slug === slug);
  if (guide) return <article className="max-w-3xl rounded-2xl border border-[#d7e3e1] bg-white p-6 sm:p-8">
    <h2 className="text-2xl font-bold">{guide.title}</h2>
    <p className="mt-4 leading-7 text-[#526b72]">{guide.summary}</p>
    {guide.sections.map(section => <section key={section.title} className="mt-7"><h3 className="text-lg font-bold">{section.title}</h3>{section.paragraphs.map(paragraph => <p key={paragraph} className="mt-3 leading-7 text-[#526b72]">{paragraph}</p>)}</section>)}
    <div className="mt-8 border-t border-[#d7e3e1] pt-5"><h3 className="font-bold">Further reading</h3><ul className="mt-3 space-y-2">{guide.sources.map(source => <li key={source.url}><a className="text-[#08787b] underline" href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul></div>
  </article>;
  return <div className="grid gap-5 md:grid-cols-2">{DENTISTRY_GUIDES.map(item => <Link key={item.slug} href={`/medicforest/interview/guides/${item.slug}`} className="rounded-2xl border border-[#d7e3e1] bg-white p-6 hover:bg-[#edf7f6]"><h2 className="text-lg font-bold">{item.title}</h2><p className="mt-3 text-sm leading-6 text-[#526b72]">{item.summary}</p><span className="mt-5 inline-block text-sm font-bold text-[#08787b]">Read guide →</span></Link>)}</div>;
}
