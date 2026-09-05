"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Award, Check, Loader2, Trophy, Users } from "lucide-react";

type Entry = { rank: number; display_name: string; score: number; completed_at: string; is_you: boolean };
type Board = { entries: Entry[]; preference: { display_name: string; leaderboard_opt_in: boolean }; bestScore: number | null };

async function fetchBoard(): Promise<Board> {
  const response = await fetch("/api/interviews/leaderboard", { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Could not load the leaderboard");
  return data;
}

export function InterviewLeaderboard() {
  const [board, setBoard] = useState<Board | null>(null);
  const [name, setName] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const applyBoard = useCallback((data: Board) => {
    setBoard(data); setName(data.preference.display_name); setOptIn(data.preference.leaderboard_opt_in); setError("");
  }, []);
  const load = useCallback(async () => {
    try {
      applyBoard(await fetchBoard());
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load the leaderboard"); }
    finally { setLoading(false); }
  }, [applyBoard]);
  useEffect(() => {
    let mounted = true;
    void fetchBoard().then((data) => { if (mounted) applyBoard(data); }).catch((err) => { if (mounted) setError(err instanceof Error ? err.message : "Could not load the leaderboard"); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [applyBoard]);

  async function save() {
    setSaving(true); setSaved(false); setError("");
    try {
      const response = await fetch("/api/interviews/leaderboard", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName: name, optIn }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save preferences");
      await load(); setSaved(true);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save preferences"); }
    finally { setSaving(false); }
  }

  return <div className="space-y-6">
    <section className="relative overflow-hidden rounded-3xl bg-[#042724] p-7 text-white sm:p-9">
      <div className="absolute -right-12 -top-16 h-64 w-64 rounded-full border-[40px] border-white/5" aria-hidden="true" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div><span className="inline-flex items-center gap-2 rounded-full bg-[#1aa0a5]/20 px-3 py-1 text-xs font-bold text-[#9ce8dd]"><Trophy size={14} /> THE WHY MEDICINE? CHALLENGE</span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Find your voice.<br />See how you grow.</h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-teal-50/75">One free station. The same questions and scoring rules for everyone. Your best completed attempt earns your place.</p>
          <Link href="/phloemai/interviews/ai-interviews" className="mt-6 inline-flex items-center gap-3 rounded-xl bg-[#b9f4db] px-5 py-3 text-sm font-bold text-[#042724] hover:bg-white">Take the free station <ArrowRight size={17} /></Link>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:min-w-48"><Award className="mb-4 text-[#b9f4db]" size={30} /><p className="text-xs font-semibold uppercase tracking-wider text-teal-100/70">Your personal best</p><p className="mt-2 text-5xl font-bold tabular-nums">{board?.bestScore != null ? `${board.bestScore}%` : "—"}</p><p className="mt-3 text-xs text-teal-100/70">{board?.bestScore != null ? "Free Why medicine? station" : "Your first attempt starts here"}</p></div>
      </div>
    </section>
    {error && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">{error}<div className="mt-3 flex gap-5"><button onClick={() => void load()} className="font-bold underline">Try again</button><Link href="/phloemai/account" className="font-bold underline">Sign in / account</Link></div></div>}
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="overflow-hidden rounded-2xl border border-[#dbe5e5] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#e9eeee] p-6"><div><h2 className="text-lg font-bold">The leaderboard</h2><p className="mt-1 text-xs text-[#62777e]">Best score per person · top 100 · all time</p></div><Users size={22} className="text-[#159a9d]" /></div>
        {loading ? <div role="status" className="flex items-center justify-center gap-3 p-14 text-sm text-[#62777e]"><Loader2 className="animate-spin" size={18} /> Loading scores…</div> : !board?.entries.length ? <div className="px-6 py-16 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf7f6]"><Trophy className="text-[#159a9d]" size={28} /></div><h3 className="mt-5 font-bold">A fresh start for everyone</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#62777e]">Complete the free station and choose to share your score. Only real, completed AI feedback appears here.</p></div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-[#f8fafa] text-xs uppercase tracking-wide text-[#62777e]"><tr><th className="px-5 py-3">Rank</th><th className="px-5 py-3">Candidate</th><th className="px-5 py-3 text-right">Best score</th></tr></thead><tbody>{board.entries.map((entry) => <tr key={entry.rank} className={`border-t border-[#edf1f1] ${entry.is_you ? "bg-[#edf7f6]" : ""}`}><td className="px-5 py-5"><span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg font-bold ${entry.rank === 1 ? "bg-amber-100 text-amber-700" : entry.rank <= 3 ? "bg-teal-50 text-teal-700" : "text-[#62777e]"}`}>{entry.rank}</span></td><td className="px-5 py-5 font-semibold">{entry.display_name}{entry.is_you && <span className="ml-2 rounded-full bg-teal-100 px-2 py-1 text-[10px] text-teal-800">YOU</span>}</td><td className="px-5 py-5 text-right text-lg font-bold tabular-nums text-[#08787b]">{entry.score}%</td></tr>)}</tbody></table></div>}
      </section>
      <aside className="space-y-5">
        <section className="rounded-2xl border border-[#dbe5e5] bg-white p-6"><h2 className="font-bold">Your place, your choice</h2><p className="mt-2 text-sm leading-6 text-[#62777e]">Share a nickname and your best score. Your answers and email stay private.</p><label className="mt-5 block text-xs font-bold" htmlFor="leaderboard-name">Public nickname</label><input id="leaderboard-name" value={name} maxLength={32} onChange={(event) => { setName(event.target.value); setSaved(false); }} className="mt-2 w-full rounded-xl border border-[#dbe5e5] px-3 py-3 text-sm outline-none focus:border-[#159a9d]" disabled={!board} /><label className="mt-4 flex items-start gap-3 text-sm leading-6"><input type="checkbox" checked={optIn} onChange={(event) => { setOptIn(event.target.checked); setSaved(false); }} disabled={!board} className="mt-1 h-4 w-4 accent-teal-700" />Show my best score on this leaderboard</label><button onClick={() => void save()} disabled={saving || !board} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#08787b] px-4 py-3 text-sm font-bold text-white hover:bg-[#042724] disabled:opacity-50">{saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}{saving ? "Saving…" : saved ? "Preferences saved" : "Save preferences"}</button></section>
        <section className="rounded-2xl bg-[#e3efee] p-6"><h2 className="font-bold">Every point means more</h2><p className="mt-3 text-sm leading-6 text-[#415b61]">Scores stop at 99%. A fixed logarithmic scale makes each extra percentage point require more evidence in the rubric. Repeating the station never adds bonus points.</p><p className="mt-3 text-xs leading-5 text-[#62777e]">This is an AI practice score, not an admissions prediction. Equal scores are ordered by the earliest completion. Voice and typed answers use the same rubric.</p></section>
      </aside>
    </div>
  </div>;
}
