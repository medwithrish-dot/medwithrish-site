"use client";

import { useEffect, useRef, useState } from "react";
import Link from "@/app/medicforest/_components/MedicForestLink";
import { ArrowRight, BookOpen, CheckCircle2, Clock3, Search, X } from "lucide-react";
import { filterSavedInterviews, filterSavedInterviewSource, groupSavedInterviews, savedInterviewHref, savedInterviewStatus, type SavedInterviewStatus, type SavedInterviewSummary } from "../_lib/saved-interviews";
import type { InterviewHistoryCursor } from "@/utils/interviews/history";

const PAGE_SIZE = 20;
const baseFieldClass = "w-full rounded-xl border border-[#ccdcda] bg-white py-3 text-sm outline-none focus:border-[#08787b] focus:ring-2 focus:ring-[#08787b]/15";
const fieldClass = `${baseFieldClass} px-3`;

export function SavedInterviewList({ attempts: initialAttempts, nextCursor = null }: { attempts: SavedInterviewSummary[]; nextCursor?: InterviewHistoryCursor | null }) {
  const [olderAttempts, setOlderAttempts] = useState<SavedInterviewSummary[]>([]);
  const [cursor, setCursor] = useState(nextCursor);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [olderError, setOlderError] = useState("");
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => () => { requestRef.current?.abort(); requestRef.current = null; }, []);
  const attempts = [...new Map([...initialAttempts, ...olderAttempts].map((attempt) => [attempt.id, attempt])).values()];
  const [source, setSource] = useState<"ai" | "question-bank">("ai");
  const sourceAttempts = filterSavedInterviewSource(attempts, source);
  const [query, setQuery] = useState("");
  const [university, setUniversity] = useState("all");
  const [status, setStatus] = useState<SavedInterviewStatus>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const filtered = filterSavedInterviews(groupSavedInterviews(sourceAttempts).toSorted((a, b) => Number(b.canResume) - Number(a.canResume)), query, university, status);
  const universities = Array.from(new Map(sourceAttempts.filter((attempt) => attempt.universitySlug).map((attempt) => [attempt.universitySlug!, attempt.universityName])).entries())
    .sort((a, b) => a[1].localeCompare(b[1], "en-GB"));
  const filtering = Boolean(query.trim()) || university !== "all" || status !== "all";

  async function loadOlder() {
    if (!cursor || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setLoadingOlder(true);
    setOlderError("");
    const timeout = window.setTimeout(() => controller.abort(), 20_000);
    try {
      const params = new URLSearchParams({ before: cursor.startedAt, beforeId: cursor.id });
      const response = await fetch(`/api/interviews/history?${params}`, { cache: "no-store", signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Older interviews could not be loaded. Please try again.");
      if (controller.signal.aborted) return;
      setOlderAttempts((previous) => [...previous, ...data.attempts]);
      setCursor(data.nextCursor);
      setVisibleCount((count) => count + PAGE_SIZE);
    } catch (failure) {
      if (requestRef.current === controller) setOlderError(failure instanceof Error && failure.name !== "AbortError" ? failure.message : "Loading older interviews took too long. Please try again.");
    } finally {
      window.clearTimeout(timeout);
      if (requestRef.current === controller) { requestRef.current = null; setLoadingOlder(false); }
    }
  }

  function clearFilters() {
    setQuery("");
    setUniversity("all");
    setStatus("all");
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <>
      <div className="border-b border-[#e6edec] px-5 py-4 sm:px-6">
        <div role="group" aria-label="Saved practice type" className="inline-flex gap-1 rounded-xl bg-[#edf3f1] p-1">
          {([['ai', 'AI interviews'], ['question-bank', 'Question bank']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={source === value} onClick={() => { setSource(value); clearFilters(); }} className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${source === value ? 'bg-white text-[#08787b] shadow-sm' : 'text-[#58716f] hover:text-[#08787b]'}`}>{label}</button>)}
        </div>
      </div>
      <div className="border-b border-[#e6edec] bg-[#f7faf9] p-5 sm:p-6">
        <div className={`grid items-end gap-4 ${source === "ai" ? "lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,.8fr)]" : "sm:grid-cols-[minmax(0,1.4fr)_minmax(0,.8fr)]"}`}>
          <div>
            <label htmlFor="saved-interview-search" className="mb-2 block text-xs font-bold text-[#244b48]">{source === "ai" ? "Find an AI interview" : "Find a question"}</label>
            <div className="relative">
              <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64807e]" />
              <input id="saved-interview-search" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(PAGE_SIZE); }} placeholder={source === "ai" ? "Search station or university" : "Search your saved questions"} className={`${baseFieldClass} pl-10 pr-3`} />
            </div>
          </div>
          {source === "ai" && <div>
            <label htmlFor="saved-interview-university" className="mb-2 block text-xs font-bold text-[#244b48]">University</label>
            <select id="saved-interview-university" value={university} onChange={(event) => { setUniversity(event.target.value); setVisibleCount(PAGE_SIZE); }} className={fieldClass}>
              <option value="all">All universities</option>
              {attempts.some((attempt) => !attempt.universitySlug) && <option value="general">General practice</option>}
              {universities.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}
            </select>
          </div>}
          <div>
            <label htmlFor="saved-interview-status" className="mb-2 block text-xs font-bold text-[#244b48]">Status</label>
            <select id="saved-interview-status" value={status} onChange={(event) => { setStatus(event.target.value as SavedInterviewStatus); setVisibleCount(PAGE_SIZE); }} className={fieldClass}>
              <option value="all">All attempts</option>
              <option value="feedback">Feedback ready</option>
              <option value="saved">Needs feedback</option>
              {source === "ai" && <option value="in_progress">In progress / paused</option>}
            </select>
          </div>
        </div>
        <div className="mt-4 flex min-h-6 flex-wrap items-center justify-between gap-2 text-xs text-[#58716f]">
          <p role="status" aria-live="polite">{filtered.length} {source === "ai" ? filtered.length === 1 ? "interview" : "interviews" : filtered.length === 1 ? "answer" : "answers"}{filtering ? " found" : " saved"} · {source === "ai" ? "In progress first, then most recent" : "Most recent first"}</p>
          {filtering && <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 rounded px-2 py-1 font-semibold text-[#08787b] hover:bg-[#e6f1ee]"><X size={13} aria-hidden="true" /> Clear filters</button>}
        </div>
      </div>

      {filtered.length ? <div className="divide-y divide-[#edf1f1]">
        {filtered.slice(0, visibleCount).map((attempt) => <Link key={attempt.id} href={savedInterviewHref(attempt)} className="group flex items-center gap-3 px-5 py-5 transition-colors hover:bg-[#f7faf9] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#08787b] sm:gap-4 sm:px-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf7f6] text-[#08787b]" aria-hidden="true">
            {attempt.feedbackScore !== null ? <CheckCircle2 size={20} /> : attempt.canResume ? <Clock3 size={20} /> : <BookOpen size={20} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold text-[#58716f]">{attempt.universityName}</span>
            <span className="mt-1 block font-semibold text-[#183d39] group-hover:text-[#08787b]">{attempt.title}</span>
            {attempt.stationTitles && <span className="mt-1 block text-xs leading-5 text-[#526b72]">{attempt.stationTitles.join(" / ")}</span>}
            <span className="mt-1.5 block text-xs leading-5 text-[#62777e]">{savedInterviewStatus(attempt)}<span className="mx-1.5" aria-hidden="true">·</span>{attempt.startedAtLabel}</span>
          </span>
          <span className="flex shrink-0 flex-col items-end gap-1.5 text-[#08787b]">
            {attempt.feedbackScore !== null && <><span className="font-bold">{attempt.feedbackScore}%</span>{attempt.savedStationCount && <span className="text-[11px] text-[#62777e]">{attempt.feedbackCount} of {attempt.savedStationCount} marked</span>}</>}
            <span className="flex items-center gap-1.5 text-xs font-bold"><span>{attempt.canResume ? "Resume interview" : "Review"}</span><ArrowRight size={16} aria-hidden="true" /></span>
          </span>
        </Link>)}
      </div> : <div className="px-6 py-12 text-center">
        <Search className="mx-auto text-[#9bb4b1]" size={28} aria-hidden="true" />
        <h3 className="mt-4 font-bold text-[#183d39]">{sourceAttempts.length ? "No saved answers match these filters" : source === "ai" ? "No AI interviews saved yet" : "No question bank feedback saved yet"}</h3>
        <p className="mt-2 text-sm text-[#62777e]">Try another search, or clear the filters to see your saved attempts.</p>
        <button type="button" onClick={clearFilters} className="mt-5 rounded-lg border border-[#ccdcda] px-4 py-2 text-sm font-bold text-[#08787b] hover:bg-[#f7faf9]">Clear filters</button>
      </div>}

      {filtered.length > visibleCount && <div className="border-t border-[#e6edec] px-6 py-5 text-center"><button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="rounded-xl border border-[#ccdcda] px-5 py-3 text-sm font-bold text-[#08787b] hover:bg-[#f7faf9]">Show more interviews ({filtered.length - visibleCount} remaining)</button></div>}
      {(cursor || olderError) && <div className="border-t border-[#e6edec] px-6 py-5 text-center">
        <p className="text-xs leading-5 text-[#62777e]">Filters search the interviews loaded so far. Load older interviews to search further back.</p>
        {olderError && <p role="alert" className="mt-3 text-sm text-amber-900">{olderError}</p>}
        {cursor && <button type="button" disabled={loadingOlder} onClick={() => void loadOlder()} className="mt-3 rounded-xl border border-[#ccdcda] px-5 py-3 text-sm font-bold text-[#08787b] hover:bg-[#f7faf9] disabled:opacity-50">{loadingOlder ? "Loading older interviews…" : "Load older interviews"}</button>}
      </div>}
    </>
  );
}
