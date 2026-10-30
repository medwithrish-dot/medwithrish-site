"use client";

import Link from "@/app/medicforest/_components/MedicForestLink";
import { requestFeatureAccess } from "@/utils/medicforest/feature-access";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Award, Check, Loader2, Trophy, Users } from "lucide-react";
import { publicNameError } from "@/utils/interviews/public-name";

type Entry = { rank: number; display_name: string; score: number; completed_at: string | null; is_you: boolean; is_benchmark?: boolean };
type Board = { entries: Entry[]; preference: { display_name: string; leaderboard_opt_in: boolean } | null; bestScore: number | null };

// Reopen public rankings here. Challenge results and sharing preferences keep
// being saved through the existing services while this display is paused.
const PUBLIC_RANKINGS_OPEN = false;

async function fetchBoard(signal?: AbortSignal): Promise<Board> {
  const response = await fetch("/api/interviews/leaderboard", { cache: "no-store", signal });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Could not load the leaderboard");
  return data;
}

export function InterviewLeaderboard({ challengeDestination = null }: { challengeDestination?: string | null } = {}) {
  const [board, setBoard] = useState<Board | null>(null);
  const [name, setName] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const applyBoard = useCallback((data: Board) => {
    setBoard(data); setName(data.preference?.display_name ?? ""); setOptIn(data.preference?.leaderboard_opt_in ?? false); setError("");
  }, []);
  const load = useCallback(async () => {
    try {
      applyBoard(await fetchBoard());
      return true;
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load the leaderboard"); return false; }
    finally { setLoading(false); }
  }, [applyBoard]);
  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;
    void fetchBoard(controller.signal).then((data) => { if (mounted) applyBoard(data); }).catch((err) => { if (mounted) setError(err instanceof Error ? err.message : "Could not load the leaderboard"); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; controller.abort(); };
  }, [applyBoard]);

  async function save() {
    if (!board?.preference) return;
    const nameError = publicNameError(name);
    if (nameError) { setError(nameError); setSaved(false); return; }
    setSaving(true); setSaved(false); setError("");
    try {
      const response = await fetch("/api/interviews/leaderboard", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName: name, optIn }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save preferences");
      if (await load()) setSaved(true);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save preferences"); }
    finally { setSaving(false); }
  }

  return <div className="space-y-6">
    <section className="rounded-2xl bg-[#042724] p-6 text-white sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs font-semibold text-[#9ce8dd]">Try the AI Med interview for free</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Beat Medwithrish’s score of 96%</h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-teal-50/75">Answer the Why Medicine? station, get personal AI feedback and see how you compare.</p>
          <Link href={challengeDestination ?? "/medicforest/interview/ai-interviews?station=why-medicine"} onClick={(event) => { if (!challengeDestination && !requestFeatureAccess("trial", "Why Medicine? practice")) event.preventDefault(); }} className="mt-5 inline-flex items-center gap-3 rounded-xl bg-[#b9f4db] px-5 py-3 text-sm font-bold text-[#042724] hover:bg-white">{challengeDestination ? challengeDestination.includes("/reports/") ? "Review your answer" : "Resume your attempt" : "Try the free AI Med interview"} <ArrowRight size={17} /></Link>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:min-w-48"><Award className="mb-4 text-[#b9f4db]" size={30} /><p className="text-xs font-semibold uppercase tracking-wider text-teal-100/70">Your personal best</p><p className="mt-2 text-5xl font-bold tabular-nums">{board?.bestScore != null ? `${board.bestScore}%` : "-"}</p><p className="mt-3 text-xs text-teal-100/70">{board?.bestScore != null ? "Free Why medicine? station" : board && !board.preference ? "Sign in to see your score" : "Your first attempt starts here"}</p></div>
      </div>
    </section>
    {error && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">{error}<div className="mt-3 flex gap-5"><button onClick={() => void load()} className="font-bold underline">Try again</button><Link href="/medicforest/account" className="font-bold underline">Sign in / account</Link></div></div>}
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="self-start overflow-hidden rounded-2xl border border-[#dbe5e5] bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-[#e9eeee] p-6"><div><h2 className="text-lg font-bold">The leaderboard</h2><p className="mt-1 text-xs text-[#62777e]">{PUBLIC_RANKINGS_OPEN ? "Best score per person · top 100 · all time" : "Public rankings are temporarily paused"}</p></div>{PUBLIC_RANKINGS_OPEN ? <Users size={22} className="shrink-0 text-[#159a9d]" /> : <span className="rounded-full bg-[#edf7f6] px-3 py-1 text-xs font-semibold text-[#08787b]">Paused</span>}</div>
        {!PUBLIC_RANKINGS_OPEN ? <div className="p-6 sm:p-8">
          <h3 className="text-xl font-bold text-[#173d36]">The challenge is still open</h3>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[#62777e]">Take on the Why Medicine? challenge and get your personal AI feedback. Your scores are still saved as usual. Participant scores will be displayed when the public leaderboard reopens.</p>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#dce8df] bg-[#f6faf6] p-5">
            <div className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><Trophy size={22} aria-hidden="true" /></span><div><p className="font-bold text-[#173d36]">Medwithrish</p><p className="mt-1 text-xs font-medium text-[#62777e]">Your benchmark to beat</p></div></div>
            <p className="text-3xl font-bold tabular-nums text-[#08787b]">96%</p>
          </div>
        </div> : loading ? <div role="status" className="flex items-center justify-center gap-3 p-14 text-sm text-[#62777e]"><Loader2 className="animate-spin" size={18} /> Loading scores…</div> : !board ? <div className="px-6 py-16 text-center text-sm text-[#62777e]">Scores are currently unavailable. Use Try again above.</div> : !board.entries.length ? <div className="px-6 py-16 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf7f6]"><Trophy className="text-[#159a9d]" size={28} /></div><h3 className="mt-5 font-bold">A fresh start for everyone</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#62777e]">Complete the free station and choose to share your score. Only real, completed AI feedback appears here.</p></div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-[#f8fafa] text-xs uppercase tracking-wide text-[#62777e]"><tr><th className="px-5 py-3">Rank</th><th className="px-5 py-3">Candidate</th><th className="px-5 py-3 text-right">Best score</th></tr></thead><tbody>{board.entries.map((entry) => <tr key={entry.rank} className={`border-t border-[#edf1f1] ${entry.is_you ? "bg-[#edf7f6]" : ""}`}><td className="px-5 py-5"><span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg font-bold ${entry.rank === 1 ? "bg-amber-100 text-amber-700" : entry.rank <= 3 ? "bg-teal-50 text-teal-700" : "text-[#62777e]"}`}>{entry.rank}</span></td><td className="px-5 py-5 font-semibold">{entry.display_name}{entry.is_benchmark && <span className="ml-2 rounded-full bg-amber-100 px-2 py-1 text-[10px] text-amber-800">BENCHMARK</span>}{entry.is_you && <span className="ml-2 rounded-full bg-teal-100 px-2 py-1 text-[10px] text-teal-800">YOU</span>}</td><td className="px-5 py-5 text-right text-lg font-bold tabular-nums text-[#08787b]">{entry.score}%</td></tr>)}</tbody></table></div>}
      </section>
      <aside className="space-y-5">
        {board && !board.preference ? <section className="rounded-2xl border border-[#dbe5e5] bg-white p-6"><h2 className="font-bold">Your place, your choice</h2><p className="mt-2 text-sm leading-6 text-[#62777e]">{PUBLIC_RANKINGS_OPEN ? "Everyone can view opted-in scores. Sign in to see your personal best and choose whether to share it." : "Sign in to see your personal best and choose whether to show your score when public rankings reopen."}</p><Link href="/medicforest/account" onClick={(event) => { if (!requestFeatureAccess("free", "Leaderboard preferences")) event.preventDefault(); }} className="mt-5 inline-flex rounded-xl bg-[#08787b] px-4 py-3 text-sm font-bold text-white hover:bg-[#042724]">Sign in to manage your score</Link></section> : <section className="rounded-2xl border border-[#dbe5e5] bg-white p-6"><h2 className="font-bold">Your place, your choice</h2><p className="mt-2 text-sm leading-6 text-[#62777e]">{PUBLIC_RANKINGS_OPEN ? "Share a nickname and your best score. Your answers and email stay private." : "Save your nickname and sharing preference for when public rankings reopen. Your answers and email stay private."}</p><label className="mt-5 block text-xs font-bold" htmlFor="leaderboard-name">Public nickname</label><input id="leaderboard-name" value={name} maxLength={32} onChange={(event) => { setName(event.target.value); setSaved(false); }} className="mt-2 w-full rounded-xl border border-[#dbe5e5] px-3 py-3 text-sm outline-none focus:border-[#159a9d]" disabled={!board} /><label className="mt-4 flex items-start gap-3 text-sm leading-6"><input type="checkbox" checked={optIn} onChange={(event) => { setOptIn(event.target.checked); setSaved(false); }} disabled={!board} className="mt-1 h-4 w-4 accent-teal-700" />{PUBLIC_RANKINGS_OPEN ? "Show my best score on this leaderboard" : "Show my best score when the leaderboard reopens"}</label><button onClick={() => void save()} disabled={saving || !board} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#08787b] px-4 py-3 text-sm font-bold text-white hover:bg-[#042724] disabled:opacity-50">{saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}{saving ? "Saving…" : saved ? "Preferences saved" : "Save preferences"}</button></section>}
        <section className="rounded-2xl bg-[#e3efee] p-6"><h2 className="font-bold">How your score works</h2><p className="mt-3 text-sm leading-6 text-[#415b61]">Your score is the average of five marking areas, up to 99%. We compare attempts marked in the same way. Repeating the station never adds bonus points.</p><p className="mt-3 text-xs leading-5 text-[#62777e]">This is an AI practice score, not an admissions prediction. Equal scores are ordered by the earliest completion. Spoken and typed answers are marked in the same way.</p></section>
      </aside>
    </div>
  </div>;
}
