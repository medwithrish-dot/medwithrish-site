"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock3, Mic, Search } from "lucide-react";
import styles from "../_components/AIInterviewLanding.module.css";
import { interviewUniversities, universityTimingSummary, UNIVERSITY_SOURCES_CHECKED } from "../_data/universities";

type UniversityCatalogueMode = "practice" | "reference";

export function UniversityCatalogue({ mode = "reference" }: { mode?: UniversityCatalogueMode }) {
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState("All");
  const practiceMode = mode === "practice";
  const normalized = query.trim().toLowerCase().replace(/[’']/g, "");
  const visible = interviewUniversities.filter((entry) => {
    const searchable = `${entry.name} ${entry.slug} ${entry.timingNote}`.toLowerCase().replace(/[’']/g, "");
    return searchable.includes(normalized) && (format === "All" || entry.format === format);
  });

  if (practiceMode) return (
    <section className={styles.catalogue} aria-labelledby="university-heading">
      <div className={styles.catalogueHeading}>
        <h2 id="university-heading">Find your medical school</h2>
        <p>Your university. Your next practice session.</p>
      </div>
      <div className={styles.filters}>
        <label className={styles.search}>
          <span className="sr-only">Search universities</span>
          <Search size={18} aria-hidden="true" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search university or medical school..." />
        </label>
        <select aria-label="Interview format" value={format} onChange={(event) => setFormat(event.target.value)}>
          <option value="All">All interview formats</option>
          <option value="MMI">MMI</option>
          <option value="Panel">Panel</option>
          <option value="Mixed">Mixed / group assessment</option>
          <option value="Unconfirmed">Awarding body / general practice</option>
        </select>
      </div>
      <div className={styles.results}>
        <span role="status">{visible.length} {visible.length === 1 ? "practice option" : "practice options"}</span>
        {(query || format !== "All") && <button type="button" onClick={() => { setQuery(""); setFormat("All"); }}>Clear filters</button>}
      </div>
      {visible.length === 0 ? <p className={styles.empty}>No medical schools match your search. Try another name or clear your filters.</p> : (
        <div className={styles.cards}>
          {visible.map((entry) => (
            <article key={entry.slug} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.monogram} aria-hidden="true">{entry.name.replace(/University of |University|of /g, "").trim().split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase()}</span>
                <div><h3><Link href={`/phloemai/interviews/universities/${entry.slug}`}>{entry.name}</Link></h3><span className={styles.format}>{entry.format === "Unconfirmed" ? "General practice" : entry.format === "Mixed" ? "Mixed / group" : entry.format}</span></div>
              </div>
              <p className={styles.timing}><Clock3 size={16} aria-hidden="true" />{universityTimingSummary(entry)}</p>
              <p className={styles.preparation}>{entry.preparationSeconds > 0 ? `${entry.preparationSeconds}s preparation per block` : "No separate preparation timer"}{entry.breakSeconds > 0 ? ` · ${entry.breakSeconds}s intervals` : ""}</p>
              <div className={styles.cardFooter}>
                <Link href={`/phloemai/interviews/ai-interviews?university=${entry.slug}`} className={styles.primaryAction} aria-label={`Start AI interview for ${entry.name}`}><Mic size={16} aria-hidden="true" />Start AI interview<ArrowRight size={16} aria-hidden="true" /></Link>
                <div className={styles.details}><span>{entry.timingStatus === "published" ? "Reported timing" : "Practice preset"}</span><Link href={`/phloemai/interviews/universities/${entry.slug}`} aria-label={`View format and sources for ${entry.name}`}>Format &amp; sources</Link></div>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className={styles.sourceNote}>Practice presets may include estimated timings. Always follow your university invitation. Sources checked {UNIVERSITY_SOURCES_CHECKED}.</p>
    </section>
  );

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
                {practiceMode ? (
                  <>
                    <Link href={`/phloemai/interviews/ai-interviews?university=${entry.slug}`} className="inline-flex items-center gap-2 rounded-lg bg-[#08787b] px-3 py-2 text-sm font-bold text-white hover:bg-[#065f61]">Start AI interview <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                    <Link href={`/phloemai/interviews/universities/${entry.slug}`} className="text-xs font-bold text-[#08787b]">Format &amp; sources</Link>
                  </>
                ) : (
                  <>
                    <Link href={`/phloemai/interviews/universities/${entry.slug}`} className="inline-flex items-center gap-2 rounded-lg bg-[#08787b] px-3 py-2 text-sm font-bold text-white hover:bg-[#065f61]">View details <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                    <Link href={`/phloemai/interviews/ai-interviews?university=${entry.slug}`} className="text-xs font-bold text-[#08787b]">Practise</Link>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
