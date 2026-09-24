"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Search, X } from "lucide-react";
import { interviewGuideCategories, interviewGuides, searchInterviewGuides } from "../_data/interviewGuides";

export function InterviewGuides() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All topics");
  const results = searchInterviewGuides(query, category);
  const filtering = query.trim().length > 0 || category !== "All topics";

  function clearFilters() {
    setQuery("");
    setCategory("All topics");
  }

  return (
    <div className="space-y-8">
      <section aria-label="Search the guide library" className="rounded-2xl border border-[#d7e3e2] bg-white p-5 sm:p-6">
        <div className="grid items-end gap-4 md:grid-cols-[1fr_260px]">
          <div>
            <label htmlFor="interview-guide-search" className="mb-2 block text-sm font-semibold text-[#244b48]">Find a guide</label>
            <div className="relative">
              <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-3.5 text-[#64807e]" />
              <input id="interview-guide-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Why Medicine, Bawa-Garba, consent or AI…" className="w-full rounded-xl border border-[#ccdcda] bg-[#f7faf9] py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-[#08787b] focus:ring-2 focus:ring-[#08787b]/15" />
            </div>
          </div>
          <div>
            <label htmlFor="interview-guide-category" className="mb-2 block text-sm font-semibold text-[#244b48]">Topic</label>
            <select id="interview-guide-category" value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-xl border border-[#ccdcda] bg-white px-3 py-3 text-sm outline-none focus:border-[#08787b] focus:ring-2 focus:ring-[#08787b]/15">
              <option>All topics</option>
              {interviewGuideCategories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-3 flex min-h-6 items-center justify-between gap-3 text-xs text-[#58716f]">
          <p role="status" aria-live="polite">{filtering ? `${results.length} ${results.length === 1 ? "guide" : "guides"} found` : `${interviewGuides.length} guides across every question-bank topic`}</p>
          {filtering && <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 rounded px-2 py-1 font-semibold text-[#08787b] hover:bg-[#eef7f5]"><X size={13} aria-hidden="true" /> Clear filters</button>}
        </div>
      </section>

      {!filtering && <section aria-labelledby="featured-guides-heading">
        <div className="mb-4 flex items-center gap-2"><BookOpen size={18} aria-hidden="true" className="text-[#08787b]" /><h2 id="featured-guides-heading" className="text-lg font-bold text-[#183d39]">Featured guides</h2></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {interviewGuides.filter((item) => item.featured).map((item) => (
            <Link key={item.slug} href={`/medicforest/interview/guides/${item.slug}`} className="group flex flex-col rounded-2xl border border-[#cfe0d9] bg-[#f3f8f2] p-5 transition-colors hover:border-[#74a49c] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#08787b]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#587a69]">{item.category.split(" & ")[0]}</p>
              <h3 className="mt-3 text-base font-bold leading-6 text-[#143b32]">{item.title}</h3>
              <p className="mb-5 mt-2 text-sm leading-6 text-[#526e64]">{item.summary}</p>
              <span className="mt-auto inline-flex items-center gap-2 text-xs font-bold text-[#08787b]">Read guide <ArrowRight size={14} aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
      </section>}

      <section aria-labelledby="all-guides-heading">
        <h2 id="all-guides-heading" className="mb-4 text-lg font-bold text-[#183d39]">{filtering ? "Search results" : "Explore the library"}</h2>
        {results.length ? <div className="grid gap-3 lg:grid-cols-2">
          {results.map((item) => (
            <Link key={item.slug} href={`/medicforest/interview/guides/${item.slug}`} className="group flex items-center justify-between gap-4 rounded-xl border border-[#dce6e5] bg-white p-5 transition-colors hover:border-[#8bb8b1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08787b]">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#64817d]">{item.category}</p>
                <h3 className="mt-1.5 text-base font-bold text-[#183d39] group-hover:text-[#08787b]">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-[#5a706f]">{item.summary}</p>
              </div>
              <ArrowRight size={17} aria-hidden="true" className="shrink-0 text-[#648c86]" />
            </Link>
          ))}
        </div> : <div className="rounded-2xl border border-dashed border-[#b8d0cb] bg-white px-6 py-12 text-center">
          <h3 className="font-semibold text-[#244b48]">No guides match those filters</h3>
          <p className="mt-2 text-sm text-[#58716f]">Try a shorter search, such as “ethics”, or explore all topics.</p>
          <button type="button" onClick={clearFilters} className="mt-5 rounded-lg bg-[#08787b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#06666a]">Show all guides</button>
        </div>}
      </section>
    </div>
  );
}
