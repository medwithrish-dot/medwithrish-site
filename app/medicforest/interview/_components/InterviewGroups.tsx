"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Clock3, Copy, Plus, RefreshCw, Users } from "lucide-react";
import type { GroupDetail, GroupList } from "@/utils/interviews/groups";

const panel = "rounded-2xl border border-[#d5e2e3] bg-white p-5 shadow-sm";
const input = "w-full rounded-lg border border-[#c6d6da] bg-white px-3 py-2.5 text-sm text-[#071923] outline-none focus:border-[#08787b] focus:ring-2 focus:ring-[#08787b]/15 disabled:opacity-60";
const button = "inline-flex items-center justify-center gap-2 rounded-lg bg-[#08787b] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#065e61] disabled:cursor-not-allowed disabled:opacity-50";
const secondary = "inline-flex items-center justify-center gap-2 rounded-lg border border-[#c6d6da] bg-white px-3 py-2 text-sm font-semibold text-[#314956] hover:bg-[#f1f8f8] disabled:cursor-not-allowed disabled:opacity-50";

class GroupRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function request<T>(query = "", body?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`/api/interviews/groups${query}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal,
  });
  const data = await response.json();
  if (!response.ok) throw new GroupRequestError(data.error || "Could not load your study groups.", response.status);
  return data as T;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function parseInvite(value: string) {
  const match = value.trim().match(/(?:#invite=|^)([a-f0-9]{32})(?:$|&)/i);
  return match ? match[1].toLowerCase() : value.trim().toLowerCase();
}

export function InterviewGroups() {
  const [list, setList] = useState<GroupList | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<GroupDetail | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [invite, setInvite] = useState<{ groupId: string; code: string; expiresAt: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [signedOut, setSignedOut] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState<{ action: string; userId?: string; name?: string } | null>(null);
  const detailSequence = useRef(0);
  const actionInFlight = useRef(false);

  const loadList = useCallback(async () => {
    const data = await request<GroupList>();
    setList(data);
    setSignedOut(false);
    setSelectedId((previous) => data.groups.some((group) => group.id === previous) ? previous : data.groups[0]?.id ?? null);
    return data;
  }, []);

  const loadDetail = useCallback(async (groupId: string, signal?: AbortSignal) => {
    const sequence = ++detailSequence.current;
    const params = new URLSearchParams({ groupId });
    const data = await request<GroupDetail>(`?${params}`, undefined, signal);
    if (sequence === detailSequence.current && !signal?.aborted) {
      setDetail(data);
    }
    return data;
  }, []);

  useEffect(() => {
    const token = parseInvite(window.location.hash.startsWith("#invite=") ? window.location.hash : "");
    let pendingInvite = token;
    if (token) {
      try { sessionStorage.setItem("interview-group-invite", token); } catch { /* Storage is optional. */ }
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    } else {
      try { pendingInvite = sessionStorage.getItem("interview-group-invite") || ""; } catch { /* Storage is optional. */ }
    }
    const initialLoad = setTimeout(() => {
      void loadList().then(() => setCode(pendingInvite)).catch((cause) => {
        setCode(pendingInvite);
        setSignedOut(cause instanceof GroupRequestError && cause.status === 401);
        setError(errorMessage(cause));
      });
    }, 0);
    return () => clearTimeout(initialLoad);
  }, [loadList]);

  useEffect(() => {
    if (!selectedId) return;
    const controller = new AbortController();
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let inFlight = false;
    let failures = 0;
    const refresh = async () => {
      if (controller.signal.aborted || inFlight) return;
      if (timeout) clearTimeout(timeout);
      if (document.hidden) { timeout = setTimeout(refresh, 15_000); return; }
      inFlight = true;
      let delay = 15_000;
      try {
        await loadDetail(selectedId, controller.signal);
        failures = 0;
      } catch (cause) {
        if (!controller.signal.aborted) {
          failures += 1;
          delay = Math.min(60_000, 15_000 * failures);
          setError(errorMessage(cause));
          if (cause instanceof GroupRequestError && (cause.status === 401 || cause.status === 403)) {
            setDetail(null);
            setSignedOut(cause.status === 401);
            void loadList().catch(() => undefined);
            return;
          }
        }
      } finally {
        inFlight = false;
      }
      if (!controller.signal.aborted) timeout = setTimeout(refresh, delay);
    };
    void refresh();
    const onVisible = () => { if (!document.hidden) void refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      controller.abort();
      detailSequence.current += 1;
      if (timeout) clearTimeout(timeout);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [selectedId, loadDetail, loadList]);

  const act = async (action: string, payload: Record<string, unknown> = {}) => {
    if (actionInFlight.current) return false;
    actionInFlight.current = true;
    setBusy(action);
    setError("");
    setNotice("");
    try {
      const result = await request<{ groupId?: string; roomId?: string; inviteCode?: string; expiresAt?: string }>("", {
        action, groupId: selectedId, ...payload,
      });
      if (result.inviteCode && result.groupId && result.expiresAt) {
        setInvite({ groupId: result.groupId, code: result.inviteCode, expiresAt: result.expiresAt });
        setCopied(false);
      }
      if (action === "create" || action === "join") {
        await loadList();
        setSelectedId(result.groupId ?? null);
        setName("");
        setCode("");
        try { sessionStorage.removeItem("interview-group-invite"); } catch { /* Storage is optional. */ }
        setNotice(action === "create" ? "Your group is ready. Share the invite with your friends." : "You joined the group.");
      } else if (action === "leave" || action === "delete") {
        setDetail(null);
        await loadList();
        setNotice(action === "delete" ? "The group was deleted." : "You left the group.");
      } else if (selectedId) {
        await loadDetail(selectedId);
        if (action === "remove") {
          setInvite(null);
          setNotice("Member removed. Generate a new invite if you want to invite someone else.");
        }
      }
      setConfirm(null);
      return true;
    } catch (cause) {
      setError(errorMessage(cause));
      if (cause instanceof GroupRequestError && cause.status === 401) setSignedOut(true);
      return false;
    } finally { setBusy(null); actionInFlight.current = false; }
  };

  const current = detail?.group.id === selectedId ? detail : null;
  const isOwner = current?.group.ownerId === current?.userId;
  const currentInvite = invite?.groupId === selectedId ? invite : null;

  return (
    <div className="space-y-5 text-[#071923]">
      <div className="relative overflow-hidden rounded-2xl bg-[#072f32] p-6 text-white sm:p-7">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full border-[30px] border-white/[0.035]" />
        <p className="relative text-[10px] font-bold uppercase tracking-[0.2em] text-[#8be5df]">Your interview study circle</p>
        <h2 className="relative mt-3 text-2xl font-bold tracking-tight">Practise with your people.</h2>
        <p className="relative mt-3 max-w-2xl text-sm leading-6 text-[#c8dddf]">Bring your friends into a private study group. Track question progress together, compare performance and help each other build confidence.</p>
        <div className="relative mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-4 text-xs font-semibold text-[#d2edeb]"><span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-[#8be5df]" aria-hidden="true" />Up to 12 members</span><span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#8be5df]" aria-hidden="true" />Track question practice</span></div>
      </div>

      <p className="px-1 text-xs leading-5 text-[#46646b]">When you create or join a group, members can see your account display name and best free Why medicine? score. Your individual interview transcripts stay private.</p>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}{signedOut && <p className="mt-2"><Link className="font-bold underline" href="/medicforest/account">Sign in or create an account</Link>, then return here to join your friends. Your invite is kept in this tab.</p>}</div>}
      {notice && <p role="status" className="rounded-xl bg-[#e5f5ef] p-3 text-sm text-[#075d4c]">{notice}</p>}

      {!signedOut && <div className="grid gap-4 md:grid-cols-2">
        <form className={panel} onSubmit={(event) => { event.preventDefault(); void act("create", { name }); }}>
          <h2 className="text-base font-bold">Create a study group</h2>
          <label htmlFor="study-group-name" className="mb-2 mt-4 block text-sm font-semibold">Group name</label>
          <input id="study-group-name" className={input} value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={60} placeholder="Your interview study circle" autoComplete="off" />
          <button className={`${button} mt-3`} disabled={!!busy || !list || name.trim().length < 2}><Plus className="h-4 w-4" aria-hidden="true" />{busy === "create" ? "Creating…" : "Create group"}</button>
        </form>
        <form className={panel} onSubmit={(event) => { event.preventDefault(); void act("join", { code: parseInvite(code) }); }}>
          <h2 className="text-base font-bold">Join your friends</h2>
          <label htmlFor="study-group-code" className="mb-2 mt-4 block text-sm font-semibold">Invite link or code</label>
          <input id="study-group-code" className={input} value={code} onChange={(event) => setCode(event.target.value)} required maxLength={300} placeholder="Paste your friend’s invite" autoComplete="off" spellCheck={false} />
          <button className={`${button} mt-3`} disabled={!!busy || !list || !code.trim()}>{busy === "join" ? "Joining…" : "Join group"}</button>
        </form>
      </div>}

      {!list && !error && <p role="status" className="p-5 text-sm text-slate-600">Loading your study groups…</p>}
      {!list && error && !signedOut && <button className={secondary} onClick={() => { setError(""); void loadList().catch((cause) => setError(errorMessage(cause))); }}><RefreshCw className="h-4 w-4" aria-hidden="true" />Try again</button>}
      {list && !signedOut && <div className="grid gap-5 xl:grid-cols-[250px_minmax(0,1fr)]">
        <aside className={`${panel} self-start`}>
          <h2 className="text-base font-bold">Your groups <span className="font-normal text-slate-500">({list.groups.length})</span></h2>
          {list.groups.length === 0 && <p className="mt-3 text-sm leading-6 text-slate-600">Create your first group or paste an invite to get started.</p>}
          <div className="mt-3 space-y-2">{list.groups.map((group) => <button key={group.id} disabled={!!busy} onClick={() => { setSelectedId(group.id); setConfirm(null); setNotice(""); setError(""); }} aria-pressed={group.id === selectedId} className={`w-full rounded-xl border p-3 text-left ${group.id === selectedId ? "border-[#08787b] bg-[#edf8f5]" : "border-slate-200 hover:bg-slate-50"}`}>
            <span className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#d8eeea] text-sm font-bold text-[#08787b]" aria-hidden="true">{group.name.slice(0, 1).toUpperCase()}</span><span className="block break-words text-sm font-bold">{group.name}</span></span>
            <span className="mt-2 block text-xs text-slate-600">{group.id === current?.group.id ? current.members.length : group.memberCount} members{group.ownerId === list.userId ? " · You host" : ""}</span>
          </button>)}</div>
        </aside>

        {selectedId && !current && <div className={panel} role="status">Loading group…</div>}
        {current && <div className="min-w-0 space-y-5">
          <section className={panel}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="break-words text-xl font-bold">{current.group.name}</h2><p className="mt-1 text-xs text-slate-600">{current.members.length}/12 members{isOwner ? " · You are the host" : ""}</p></div>
              <div className="flex flex-wrap gap-2">
                {isOwner && <button className={secondary} disabled={!!busy} onClick={() => void act("invite")}>{currentInvite ? "Replace invite" : "Generate invite"}</button>}
                <button className={`${secondary} text-red-700`} disabled={!!busy} onClick={() => setConfirm({ action: isOwner ? "delete" : "leave" })}>{isOwner ? "Delete group" : "Leave group"}</button>
              </div>
            </div>

            {currentInvite && <div className="mt-4 rounded-xl border border-[#badbd5] bg-[#f0faf6] p-4">
              <p className="text-sm font-bold">Invite your friends</p>
              <p className="mt-1 text-xs leading-5 text-[#46646b]">Anyone with this invite and an account can join. It expires {new Date(currentInvite.expiresAt).toLocaleDateString("en-GB")}. Replacing it invalidates the previous invite.</p>
              <div className="mt-3 flex flex-wrap items-center gap-2"><code className="min-w-0 break-all rounded bg-white px-2 py-1 text-xs">{currentInvite.code}</code><button className={secondary} onClick={async () => {
                try { await navigator.clipboard.writeText(`${window.location.origin}/medicforest/interview/groups#invite=${currentInvite.code}`); setCopied(true); }
                catch { setError("Could not copy automatically. Select and copy the invite code above."); }
              }}>{copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}{copied ? "Copied" : "Copy invite link"}</button></div>
            </div>}

            {confirm && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-900">{confirm.action === "delete" ? "Delete this group and all its records? This cannot be undone." : confirm.action === "leave" ? "Leave this group? You will need a valid invite to rejoin." : `Remove ${confirm.name || "this member"} from the group? Current invites will also expire.`}</p>
              <div className="mt-3 flex gap-2"><button className={`${button} bg-red-700 hover:bg-red-800`} disabled={!!busy} onClick={() => void act(confirm.action, confirm.userId ? { userId: confirm.userId } : {})}>Confirm {confirm.action}</button><button className={secondary} disabled={!!busy} onClick={() => setConfirm(null)}>Cancel</button></div>
            </div>}

            <div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs text-slate-500"><th className="pb-3 pr-3 font-semibold">Rank</th><th className="pb-3 pr-3 font-semibold">Study partner</th><th className="pb-3 pr-3 font-semibold">Questions completed</th><th className="pb-3 pr-3 font-semibold">Why medicine? best</th>{isOwner && <th className="pb-3 text-right font-semibold">Membership</th>}</tr></thead><tbody>
              {current.members.map((member) => <tr key={member.userId} className="border-b border-slate-100 last:border-0">
                <td className="py-4 pr-3"><span className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 font-bold tabular-nums ${member.rank === 1 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>#{member.rank}</span></td>
                <td className="py-4 pr-3"><div className="flex items-center gap-2.5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e5f3f0] text-xs font-bold text-[#08787b]" aria-hidden="true">{member.name.split(/\s+/).slice(0, 2).map((part) => part.slice(0, 1)).join("").toUpperCase()}</span><span className="min-w-0"><span className="block font-semibold">{member.name}{member.userId === current.userId && <span className="ml-1 font-normal text-slate-500">(you)</span>}</span>{member.userId === current.group.ownerId && <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wide text-[#08787b]">Group host</span>}</span></div></td>
                <td className="py-4 pr-3"><span className="font-bold tabular-nums text-[#08787b]">{member.questionsCompleted}</span></td>
                <td className="py-4 pr-3">{member.whyMedicineScore === null ? <span className="text-xs text-slate-500">No scored attempt yet</span> : <span className="rounded-lg bg-[#e8f6f0] px-2.5 py-1.5 text-sm font-bold tabular-nums text-[#08735b]">{Number(member.whyMedicineScore).toFixed(1)}%</span>}</td>
                {isOwner && <td className="py-4 text-right">{member.userId !== current.userId && <button disabled={!!busy} className="text-xs font-semibold text-red-700 underline" onClick={() => setConfirm({ action: "remove", userId: member.userId, name: member.name })}>Remove</button>}</td>}
              </tr>)}
            </tbody></table></div>
            <p className="mt-3 text-xs leading-5 text-slate-500">Rank is based on completed interview question-bank questions. Tied totals share a rank. Why medicine? shows each member’s best scored free AI station, capped at 99%.</p>
          </section>
        </div>}
      </div>}
    </div>
  );
}

export default InterviewGroups;
