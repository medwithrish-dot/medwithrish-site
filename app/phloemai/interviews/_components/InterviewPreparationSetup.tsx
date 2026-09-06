"use client";

import Link from "next/link";
import { useId, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, Check, ChevronDown, GraduationCap, Loader2, Plus, Search, Settings2, Target, X } from "lucide-react";
import { interviewUniversities } from "../_data/universities";
import { THEME_LABELS, type InterviewTheme, type PreparationProfile } from "@/utils/interviews/dashboard-analytics";

export type InterviewPreparationSetupProps = {
  initialProfile: PreparationProfile | null;
  signedIn: boolean;
  available: boolean;
  variant?: "full" | "compact";
};

const experiences = [
  { id: "starting", label: "Finding my feet", description: "I’m getting to know interview practice." },
  { id: "practising", label: "Building a routine", description: "I’ve started and want to improve." },
  { id: "polishing", label: "Fine-tuning", description: "I’m refining my answers and delivery." },
] as const;

const themes: InterviewTheme[] = ["motivation", "reflection", "ethics", "teamwork", "nhs", "hot-topics", "analysis"];
const schoolNames = new Map(interviewUniversities.map((university) => [university.slug, university.name]));
const field = "w-full min-w-0 rounded-xl border border-[#d4dfe1] bg-white px-3.5 py-2.5 text-sm text-[#123a3c] outline-none transition focus:border-[#08787b] focus:ring-2 focus:ring-[#08787b]/15 disabled:cursor-not-allowed disabled:bg-[#f4f7f7] disabled:opacity-60";
const primary = "inline-flex items-center justify-center gap-2 rounded-xl bg-[#08787b] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#065d60] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08787b] disabled:cursor-not-allowed disabled:opacity-50";

function emptyProfile(): PreparationProfile {
  return { experience: "starting", focusThemes: [], weeklyTarget: 3, targets: [], updatedAt: null };
}

function copyProfile(profile: PreparationProfile | null): PreparationProfile {
  return profile ? { ...profile, focusThemes: [...profile.focusThemes], targets: profile.targets.map((target) => ({ ...target })) } : emptyProfile();
}

function searchText(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f’']/g, "").replace(/-/g, " ");
}

function formattedDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "2000-01-01" || value > "2099-12-31") return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function InterviewPreparationSetup({ initialProfile, signedIn, available, variant = "full" }: InterviewPreparationSetupProps) {
  const router = useRouter();
  const uniqueId = useId();
  const editorId = `${uniqueId}-editor`;
  const searchRef = useRef<HTMLInputElement>(null);
  const savingRef = useRef(false);
  const [expanded, setExpanded] = useState(!initialProfile && variant === "full");
  const [savedProfile, setSavedProfile] = useState(initialProfile);
  const [draft, setDraft] = useState(() => copyProfile(initialProfile));
  const [query, setQuery] = useState("");
  const [showAllUniversities, setShowAllUniversities] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);

  const canSave = signedIn && available && !sessionExpired;
  const targetSlugs = new Set(draft.targets.map((target) => target.universitySlug));
  const matches = interviewUniversities.filter((university) => !targetSlugs.has(university.slug) && searchText(`${university.name} ${university.slug}`).includes(searchText(query.trim())));
  const visibleUniversities = showAllUniversities || query.trim() ? matches : matches.slice(0, 5);
  const savedExperience = experiences.find((experience) => experience.id === savedProfile?.experience);
  const knownDateCount = savedProfile?.targets.filter((target) => target.interviewDate !== null).length || 0;

  function openEditor() {
    setExpanded(true);
    setError("");
    setNotice("");
  }

  function cancelEditing() {
    setDraft(copyProfile(savedProfile));
    setQuery("");
    setExpanded(false);
    setError("");
  }

  function addUniversity(universitySlug: string) {
    if (draft.targets.length >= 10 || targetSlugs.has(universitySlug)) return;
    setDraft((current) => current.targets.length >= 10 || current.targets.some((target) => target.universitySlug === universitySlug)
      ? current
      : { ...current, targets: [...current.targets, { universitySlug, interviewDate: null }] });
    setQuery("");
    setShowAllUniversities(false);
    setNotice(`${schoolNames.get(universitySlug)} added to your draft. Save your plan when you’re ready.`);
    searchRef.current?.focus();
  }

  function changeDate(universitySlug: string, date: string | null) {
    setDraft((current) => ({ ...current, targets: current.targets.map((target) => target.universitySlug === universitySlug ? { ...target, interviewDate: date } : target) }));
    setNotice("");
  }

  function toggleTheme(theme: InterviewTheme) {
    setDraft((current) => ({ ...current, focusThemes: current.focusThemes.includes(theme) ? current.focusThemes.filter((value) => value !== theme) : current.focusThemes.length < 3 ? [...current.focusThemes, theme] : current.focusThemes }));
    setNotice("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingRef.current || !canSave) return;
    setError("");
    setNotice("");
    if (draft.targets.length > 10 || new Set(draft.targets.map((target) => target.universitySlug)).size !== draft.targets.length) {
      setError("Choose up to 10 different universities."); return;
    }
    const invalidTarget = draft.targets.find((target) => !schoolNames.has(target.universitySlug) || (target.interviewDate !== null && !validDate(target.interviewDate)));
    if (invalidTarget) { setError("Check your interview dates. Leave a date blank if it is not confirmed."); return; }
    if (!Number.isInteger(draft.weeklyTarget) || draft.weeklyTarget < 1 || draft.weeklyTarget > 14 || draft.focusThemes.length > 3) {
      setError("Choose 1–14 stations per week and up to three focus areas."); return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      const response = await fetch("/api/interviews/preparation", {
        method: "PUT", cache: "no-store", signal: AbortSignal.timeout(15_000), headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experience: draft.experience, focusThemes: draft.focusThemes,
          weeklyTarget: draft.weeklyTarget, targets: draft.targets,
        }),
      });
      const result = await response.json().catch(() => null) as { profile?: PreparationProfile; error?: string } | null;
      if (!response.ok) {
        if (response.status === 401) setSessionExpired(true);
        throw new Error(result?.error || "Your plan could not be saved. Your changes are still here; please try again.");
      }
      if (!result?.profile) throw new Error("We could not confirm your saved plan. Your changes are still here; please try again.");
      setSavedProfile(result.profile);
      setDraft(copyProfile(result.profile));
      setExpanded(false);
      setNotice("Your preparation plan is saved. Your dashboard is updating.");
      startRefresh(() => router.refresh());
    } catch (cause) {
      setError(cause instanceof Error && cause.name !== "TimeoutError" ? cause.message : "Saving took longer than expected. Your changes are still here; please try again.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return <section id="preparation-setup" className={`overflow-hidden rounded-2xl border shadow-sm ${savedProfile ? "border-[#d5e2e1] bg-white" : "border-[#c1dcd5] bg-[#f8fcfa]"}`} aria-labelledby={`${uniqueId}-title`}>
    <div className={`flex flex-col gap-4 ${variant === "compact" ? "p-5" : "p-5 sm:p-6"} sm:flex-row sm:items-start sm:justify-between`}>
      <div className="flex min-w-0 gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#cde5dc] bg-[#e6f3eb] text-[#08787b]" aria-hidden="true"><Settings2 size={21} /></span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6e8a79]">Your preparation, your pace</p>
          <h2 id={`${uniqueId}-title`} className="mt-1 text-lg font-bold tracking-tight text-[#123a3c]">{savedProfile ? "Your preparation plan" : "Make this dashboard yours."}</h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#536d72]">{savedProfile ? "Keep your universities, interview dates and weekly routine up to date." : "Choose your universities and a routine that fits. You can add interview dates whenever you know them."}</p>
          {savedProfile && !expanded && <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-[#43625d]">
            <span className="inline-flex items-center gap-1.5"><GraduationCap size={14} aria-hidden="true" />{savedProfile.targets.length} {savedProfile.targets.length === 1 ? "university" : "universities"}</span>
            <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} aria-hidden="true" />{knownDateCount ? `${knownDateCount} ${knownDateCount === 1 ? "date" : "dates"} added` : "Dates to be confirmed"}</span>
            <span className="inline-flex items-center gap-1.5"><Target size={14} aria-hidden="true" />{savedProfile.weeklyTarget} {savedProfile.weeklyTarget === 1 ? "station" : "stations"} / week</span>
          </div>}
        </div>
      </div>
      {signedIn && <button type="button" aria-expanded={expanded} aria-controls={editorId} disabled={saving} onClick={() => expanded ? cancelEditing() : openEditor()} className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[#cdded8] bg-white px-4 py-2.5 text-xs font-bold text-[#08787b] hover:bg-[#edf7f3] disabled:opacity-50">
        {expanded ? (savedProfile ? "Cancel editing" : "Set up later") : savedProfile ? "Edit plan" : "Set up my plan"}<ChevronDown size={15} className={expanded ? "rotate-180" : ""} aria-hidden="true" />
      </button>}
    </div>

    {!signedIn && <div className="border-t border-[#deebe5] px-5 py-4 sm:px-6"><p className="text-sm leading-6 text-[#536d72]">Sign in to keep your university choices and preparation plan in your account.</p><div className="mt-3 flex flex-wrap items-center gap-4"><Link href="/phloemai/account" className={primary}>Sign in / create account <ArrowRight size={15} aria-hidden="true" /></Link><Link href="/phloemai/interviews/ai-interviews" className="text-xs font-bold text-[#08787b] hover:underline">Explore the free station</Link></div></div>}

    {signedIn && !available && <div role="status" className="mx-5 mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900 sm:mx-6"><p>Saving preparation plans is not available yet. You can keep practising and return to add your targets once setup is complete.</p><button type="button" disabled={refreshing} onClick={() => startRefresh(() => router.refresh())} className="mt-2 inline-flex items-center gap-2 font-bold underline disabled:opacity-50">{refreshing && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}{refreshing ? "Checking…" : "Try again"}</button></div>}
    {notice && signedIn && <p role="status" className="mx-5 mb-4 flex items-start gap-2 rounded-xl bg-[#edf7ef] px-3.5 py-3 text-xs leading-5 text-[#296242] sm:mx-6"><Check size={15} className="mt-0.5 shrink-0" aria-hidden="true" />{notice}</p>}
    {error && <div role="alert" className="mx-5 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800 sm:mx-6">{error}{sessionExpired && <p className="mt-2"><Link href="/phloemai/account" className="font-bold underline">Sign in again</Link>, then return to finish setting up your plan.</p>}</div>}

    {savedProfile && !expanded && signedIn && variant === "full" && savedProfile.targets.length > 0 && <div className="flex flex-wrap gap-2 border-t border-[#edf1ef] px-5 py-4 sm:px-6">
      {savedProfile.targets.map((target) => <button type="button" key={target.universitySlug} onClick={openEditor} className="rounded-xl border border-[#deebe5] bg-[#f7faf8] px-3 py-2 text-left text-xs transition hover:border-[#8ebdac]">
        <span className="block font-bold text-[#315451]">{schoolNames.get(target.universitySlug) || target.universitySlug}</span><span className="mt-1 block text-[#738882]">{target.interviewDate ? formattedDate(target.interviewDate) : "Date unknown"}</span>
      </button>)}
    </div>}

    {expanded && signedIn && <form id={editorId} onSubmit={save} className="border-t border-[#deebe5]">
      <fieldset disabled={saving || !canSave} className="min-w-0 space-y-7 px-5 py-6 sm:px-6">
        <legend className="sr-only">Your interview preparation preferences</legend>
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="flex items-center gap-2 text-sm font-bold text-[#123a3c]"><GraduationCap size={17} className="text-[#08787b]" aria-hidden="true" /> Your universities</h3><span className="text-xs text-[#738882]">{draft.targets.length} / 10 selected</span></div>
          <p id={`${uniqueId}-university-help`} className="mt-2 text-xs leading-5 text-[#6a8180]">Add the places you’re preparing for. Dates are optional, and you can change or remove any choice later.</p>
          {draft.targets.length > 0 && <div className="mt-4 grid gap-3 2xl:grid-cols-2">
            {draft.targets.map((target) => <div key={target.universitySlug} className="min-w-0 rounded-xl border border-[#dce8e2] bg-white p-3.5">
              <div className="flex items-start justify-between gap-2"><p className="pt-1 text-sm font-bold leading-5 text-[#254b47]">{schoolNames.get(target.universitySlug) || target.universitySlug}</p><button type="button" onClick={() => { setDraft((current) => ({ ...current, targets: current.targets.filter((entry) => entry.universitySlug !== target.universitySlug) })); setNotice(""); }} className="shrink-0 rounded-lg p-1.5 text-[#738882] hover:bg-red-50 hover:text-red-700" aria-label={`Remove ${schoolNames.get(target.universitySlug)}`}><X size={16} aria-hidden="true" /></button></div>
              <label htmlFor={`${uniqueId}-${target.universitySlug}-date`} className="mb-1.5 mt-3 block text-[11px] font-semibold text-[#6a8180]">Interview date <span className="font-normal">(optional)</span></label>
              <div className="flex min-w-0 flex-wrap items-center gap-2"><input id={`${uniqueId}-${target.universitySlug}-date`} type="date" value={target.interviewDate ?? ""} min="2000-01-01" max="2099-12-31" onChange={(event) => changeDate(target.universitySlug, event.target.value || null)} className={`${field} max-w-[220px] flex-1`} />{target.interviewDate ? <button type="button" onClick={() => changeDate(target.universitySlug, null)} className="shrink-0 rounded-lg px-2 py-2 text-[11px] font-semibold text-[#58736b] hover:bg-[#edf7f3]" aria-label={`Clear interview date for ${schoolNames.get(target.universitySlug)}`}>Clear date</button> : <span className="text-[11px] text-[#84958f]">Date unknown is fine</span>}</div>
            </div>)}
          </div>}
          {draft.targets.length < 10 && <div className="mt-4 rounded-xl border border-[#dce8e2] bg-white p-3">
            <label className="relative block" htmlFor={`${uniqueId}-university-search`}><span className="sr-only">Search universities to add</span><Search size={16} className="pointer-events-none absolute left-3.5 top-3 text-[#789085]" aria-hidden="true" /><input ref={searchRef} id={`${uniqueId}-university-search`} value={query} onChange={(event) => { setQuery(event.target.value); setShowAllUniversities(false); }} onKeyDown={(event) => { if (event.key === "Enter") event.preventDefault(); }} placeholder="Search a university or medical school" autoComplete="off" className={`${field} pl-10`} aria-describedby={`${uniqueId}-university-help`} /></label>
            <div className="mt-2 max-h-52 overflow-y-auto" aria-label="Available universities">
              {visibleUniversities.map((university) => <button type="button" key={university.slug} onClick={() => addUniversity(university.slug)} className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-[#355852] hover:bg-[#eef7f1] focus-visible:bg-[#eef7f1]" aria-label={`Add ${university.name}`}><span className="font-semibold">{university.name}</span><Plus size={15} className="shrink-0 text-[#08787b]" aria-hidden="true" /></button>)}
              {matches.length === 0 && <p className="px-3 py-4 text-xs leading-5 text-[#738882]">No universities match. Try a different name.</p>}
            </div>
            {!query.trim() && matches.length > 5 && !showAllUniversities && <button type="button" onClick={() => setShowAllUniversities(true)} className="mt-2 w-full border-t border-[#edf1ef] px-3 pt-3 text-center text-xs font-bold text-[#08787b] hover:underline">Browse all {matches.length} remaining universities</button>}
          </div>}
        </div>

        <fieldset className="min-w-0"><legend className="text-sm font-bold text-[#123a3c]">Where are you with preparation?</legend><p className="mt-2 text-xs leading-5 text-[#6a8180]">Choose what feels closest. You can update this as you go.</p><div className="mt-3 grid gap-2 sm:grid-cols-3">
          {experiences.map((experience) => <label key={experience.id} className={`relative cursor-pointer rounded-xl border p-3.5 transition has-focus-visible:ring-2 has-focus-visible:ring-[#08787b]/30 ${draft.experience === experience.id ? "border-[#83b49c] bg-[#eaf5ee]" : "border-[#dce5e1] bg-white hover:border-[#9cbaa8]"}`}><input type="radio" name={`${uniqueId}-experience`} value={experience.id} checked={draft.experience === experience.id} onChange={() => { setDraft((current) => ({ ...current, experience: experience.id })); setNotice(""); }} className="sr-only" /><span className="flex items-center justify-between gap-2 text-xs font-bold text-[#315b4e]">{experience.label}{draft.experience === experience.id && <Check size={14} aria-hidden="true" />}</span><span className="mt-1.5 block text-[11px] leading-5 text-[#738579]">{experience.description}</span></label>)}
        </div></fieldset>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_220px]">
          <fieldset className="min-w-0"><legend className="text-sm font-bold text-[#123a3c]">What would you like to work on?</legend><p id={`${uniqueId}-theme-help`} className="mt-2 text-xs leading-5 text-[#6a8180]">Choose up to three areas, or leave this open for now.</p><div className="mt-3 flex flex-wrap gap-2" aria-describedby={`${uniqueId}-theme-help`}>
            {themes.map((theme) => { const chosen = draft.focusThemes.includes(theme); return <button key={theme} type="button" aria-pressed={chosen} disabled={!chosen && draft.focusThemes.length >= 3} onClick={() => toggleTheme(theme)} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${chosen ? "border-[#83b49c] bg-[#eaf5ee] text-[#315b4e]" : "border-[#dce5e1] bg-white text-[#637b70] hover:border-[#9cbaa8]"}`}>{chosen && <Check size={12} aria-hidden="true" />}{THEME_LABELS[theme]}</button>; })}
          </div><p className="mt-2 text-[10px] text-[#84958f]">{draft.focusThemes.length} of 3 selected</p></fieldset>
          <div className="rounded-xl border border-[#dce8e2] bg-white p-4"><label htmlFor={`${uniqueId}-weekly-target`} className="flex items-center gap-2 text-xs font-bold text-[#315451]"><Target size={15} className="text-[#08787b]" aria-hidden="true" /> Your weekly aim</label><select id={`${uniqueId}-weekly-target`} value={draft.weeklyTarget} onChange={(event) => { setDraft((current) => ({ ...current, weeklyTarget: Number(event.target.value) })); setNotice(""); }} className={`${field} mt-3`}>{Array.from({ length: 14 }, (_, index) => index + 1).map((goal) => <option key={goal} value={goal}>{goal} {goal === 1 ? "station" : "stations"} per week</option>)}</select><p className="mt-2 text-[11px] leading-5 text-[#738882]">Start with a pace you can keep. This is a personal target you can adjust.</p></div>
        </div>
      </fieldset>
      <div className="flex flex-col-reverse gap-3 border-t border-[#deebe5] bg-white/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><p className="text-[11px] leading-5 text-[#738882]">{savedProfile ? `${savedExperience?.label || "Your plan"} · Changes save to your account.` : "Optional setup. You can practise now and return to this later."}</p><button type="button" disabled={saving} onClick={cancelEditing} className="mt-1 text-[11px] font-semibold text-[#58736b] underline disabled:opacity-50">{savedProfile ? "Cancel changes" : "Skip for now"}</button></div><button type="submit" disabled={saving || !canSave} className={primary}>{saving ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Check size={15} aria-hidden="true" />}{saving ? "Saving your plan…" : "Save my preparation plan"}</button></div>
    </form>}
  </section>;
}

export default InterviewPreparationSetup;
