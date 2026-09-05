"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { interviewUniversities, universityTimingSummary, UNIVERSITY_SOURCES_CHECKED } from "../_data/universities";

export function UniversityCatalogue() {
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState("All");
  const normalized = query.trim().toLowerCase().replace(/[’']/g, "");
  const visible = interviewUniversities.filter((entry) => {
    const searchable = `${entry.name} ${entry.slug} ${entry.timingNote}`.toLowerCase().replace(/[’']/g, "");
    return searchable.includes(normalized) && (format === "All" || entry.format === format);
  });

  return (
    <section className="mt-7">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search universities</span>
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-[#4a6370]" aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search university or medical school" className="w-full rounded-xl border border-[#cbd7dc] bg-white py-3 pl-12 pr-4 text-sm outline-none focus:border-[#08787b] focus:ring-2 focus:ring-[#08787b]/20" />
        </label>
        <label>
          <span className="sr-only">Interview format</span>
          <select value={format} onChange={(event) => setFormat(event.target.value)} className="w-full rounded-xl border border-[#cbd7dc] bg-white px-4 py-3 text-sm sm:w-auto">
            <option value="All">All formats</option>
            <option value="MMI">MMI</option>
            <option value="Panel">Panel</option>
            <option value="Mixed">Mixed / group assessment</option>
            <option value="Unconfirmed">Awarding body / general practice</option>
          </select>
        </label>
      </div>
      <p className="mt-3 text-xs leading-5 text-[#4a6370]">Sources checked {UNIVERSITY_SOURCES_CHECKED}. “Practice preset” includes estimates or adaptations. Your university invitation takes precedence.</p>
      <p className="mt-5 text-sm font-semibold text-[#314956]" role="status">{visible.length} {visible.length === 1 ? "entry" : "entries"}</p>
      {visible.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-[#d8e0e6] bg-white p-6">
          <p>No universities match these filters.</p>
          <button type="button" onClick={() => { setQuery(""); setFormat("All"); }} className="mt-3 font-bold text-[#08787b]">Clear filters</button>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((entry) => (
            <article key={entry.slug} className="flex flex-col rounded-2xl border border-[#d8e0e6] bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wide">
                <span className="rounded-full bg-[#edf7f6] px-2.5 py-1 text-[#08787b]">{entry.format === "Unconfirmed" ? "Awarding body" : entry.format}</span>
                <span className="rounded-full bg-[#f0f3f5] px-2.5 py-1 text-[#4a6370]">{entry.timingStatus === "published" ? "Reported timing" : "Practice preset"}</span>
              </div>
              <h2 className="mt-4 text-lg font-bold leading-6 text-[#042724]"><Link href={`/phloemai/interviews/universities/${entry.slug}`} className="hover:text-[#08787b]">{entry.name}</Link></h2>
              <p className="mt-4 text-sm font-semibold text-[#314956]">{universityTimingSummary(entry)}</p>
              <p className="mt-1 text-xs leading-5 text-[#4a6370]">
                {entry.preparationSeconds > 0 ? `${entry.preparationSeconds}s preparation per block` : "No separate preparation timer"}
                {entry.breakSeconds > 0 ? ` · ${entry.breakSeconds}s intervals` : " · no extra interval"}
              </p>
              <p className="mt-3 flex-1 text-xs leading-5 text-[#4a6370]">{entry.timingNote}</p>
              <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-[#edf1f2] pt-4">
                <Link href={`/phloemai/interviews/ai-interviews?university=${entry.slug}`} className="inline-flex items-center gap-2 rounded-lg bg-[#08787b] px-3 py-2 text-sm font-bold text-white hover:bg-[#065f61]">Practise <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                <Link href={`/phloemai/interviews/universities/${entry.slug}`} className="text-xs font-bold text-[#08787b]">Format &amp; sources</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
