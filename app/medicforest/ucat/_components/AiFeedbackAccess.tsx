"use client";

import { useEffect, useRef, useState } from "react";

export const FREE_AI_FEEDBACK_USED_MESSAGE = "You've used your free AI feedback report. Upgrade to Premium for more personalised feedback.";

type Allowance = { plan?: "free" | "premium"; credits?: number; upgradeRequired?: boolean };

export function useAiFeedbackAccess(isPremium: boolean) {
  const [allowance, setAllowance] = useState<Allowance | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  useEffect(() => {
    let live = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/ai/diagnostic-feedback", { cache: "no-store" });
        if (!response.ok) return;
        const next = await response.json() as Allowance;
        if (live) setAllowance(next);
      } catch { /* Generation still checks the allowance on the server. */ }
    };
    const showUpgrade = () => setUpgradeOpen(true);
    window.addEventListener("ai-feedback-upgrade-required", showUpgrade);
    void refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("ai-feedback-allowance-changed", refresh);
    return () => {
      live = false;
      window.removeEventListener("ai-feedback-upgrade-required", showUpgrade);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("ai-feedback-allowance-changed", refresh);
    };
  }, [isPremium]);
  const exhausted = !isPremium && allowance?.plan === "free" && allowance.credits === 0;
  return {
    exhausted, upgradeOpen, closeUpgrade: () => setUpgradeOpen(false),
    checkAccess: (knownExhausted = false) => {
      if (!isPremium && (exhausted || knownExhausted)) { setUpgradeOpen(true); return false; }
      return true;
    },
    receive: (next: Allowance) => {
      if (typeof next.credits === "number" && next.plan) setAllowance(next);
      if (next.upgradeRequired) setUpgradeOpen(true);
      window.dispatchEvent(new Event("ai-feedback-allowance-changed"));
    },
  };
}

export function AiFeedbackUpgradeDialog({ open, onClose, onUpgrade, checkoutLoading = false }: {
  open: boolean; onClose: () => void; onUpgrade: () => void | Promise<void>; checkoutLoading?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  return <dialog ref={dialog} onCancel={onClose} onClose={onClose} aria-labelledby="ai-feedback-upgrade-title"
    className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-2xl border border-violet-100 bg-white p-6 text-slate-800 shadow-xl backdrop:bg-slate-900/50">
    <h2 id="ai-feedback-upgrade-title" className="text-xl font-black">Upgrade to Premium</h2>
    <p className="mt-3 text-sm leading-6">{FREE_AI_FEEDBACK_USED_MESSAGE}</p>
    <p className="mt-2 text-sm leading-6 text-slate-500">Premium includes one AI feedback report every 24 hours.</p>
    <div className="mt-6 flex justify-end gap-3">
      <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold">Maybe later</button>
      <button type="button" disabled={checkoutLoading} onClick={() => void onUpgrade()} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{checkoutLoading ? "Opening..." : "Upgrade to Premium"}</button>
    </div>
  </dialog>;
}
