"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getAiDiagnosticCreditDisplay,
  getNextAiDiagnosticCreditAt,
} from "../_lib/ucatDiagnostics";

type CreditProps = {
  plan: string;
  diagnosticCredits: number;
  lastUsedAt?: string | null;
};

function useCreditDisplay({ plan, diagnosticCredits, lastUsedAt }: CreditProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const nextAvailableAt = getNextAiDiagnosticCreditAt(lastUsedAt);
    const nextAvailableMs = nextAvailableAt ? Date.parse(nextAvailableAt) : Number.NaN;
    if (plan.toLowerCase() !== "premium" || !Number.isFinite(nextAvailableMs) || nextAvailableMs <= Date.now()) return;

    const intervalId = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= nextAvailableMs) window.clearInterval(intervalId);
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [lastUsedAt, plan]);

  return getAiDiagnosticCreditDisplay({
    plan,
    diagnosticCredits,
    lastUsedAt,
    now,
  });
}

export function AiDiagnosticCreditSummary(props: CreditProps) {
  const creditDisplay = useCreditDisplay(props);
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">AI credit</p>
      <p className="mt-2 text-2xl font-black">{creditDisplay.value}</p>
      <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
        {creditDisplay.status}
      </p>
    </section>
  );
}

export function AiDiagnosticCreditDetails(props: CreditProps) {
  const creditDisplay = useCreditDisplay(props);
  const creditStatusClass =
    creditDisplay.status === "Available"
      ? "bg-emerald-50 text-emerald-700"
      : creditDisplay.status.startsWith("Available in")
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-600";

  return (
    <section className="rounded-xl border border-violet-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wide">
            Diagnostic AI credit
          </h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            Credit use is enforced on the server. This countdown updates locally.
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${creditStatusClass}`}>
          {creditDisplay.status}
        </span>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-[180px_1fr] sm:items-center">
        <div className="rounded-xl bg-violet-50 p-5 text-center">
          <p className="text-xs font-black uppercase tracking-wide text-violet-700">
            Credit
          </p>
          <p className="mt-2 text-4xl font-black text-violet-700">
            {creditDisplay.value}
          </p>
          <p className="mt-2 font-mono text-xs font-black text-violet-700">
            {creditDisplay.status}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold leading-6 text-slate-600">
            {creditDisplay.helper} AI feedback can only be generated from a
            saved diagnostic attempt owned by your logged-in account.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/medicforest/ucat/diagnostic"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-xs font-black text-white transition-colors hover:bg-blue-700"
            >
              Open diagnostics
            </Link>
            <Link
              href="/medicforest/ucat/report"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-blue-100 px-4 text-xs font-black text-blue-600 transition-colors hover:bg-blue-50"
            >
              View reports
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
