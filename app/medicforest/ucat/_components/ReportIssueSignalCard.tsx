"use client";

import { LockKeyhole } from "lucide-react";
import type { ReportIssueDefinition } from "../_lib/ucatDiagnostics";

export type ReportIssueSignalCardProps = {
  issue: ReportIssueDefinition;
  isPremium: boolean;
  hasSignals: boolean;
  checkoutLoading: boolean;
  onUpgrade: () => void | Promise<void>;
};

export function ReportIssueSignalCard({
  issue,
  isPremium,
  hasSignals,
  checkoutLoading,
  onUpgrade,
}: ReportIssueSignalCardProps) {
  const Icon = issue.icon;
  const displayLabel = hasSignals
    ? issue.freeLabel
    : issue.freeLabel.replace(" detected", "").replace(" needs work", "");

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${issue.iconClass}`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-black">{displayLabel}</h2>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
              {issue.short}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
            hasSignals
              ? "bg-amber-50 text-amber-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {hasSignals ? "Detected" : "Pending"}
        </span>
      </div>
      <div className="relative mt-5 overflow-hidden rounded-xl border border-blue-100 bg-blue-50/50 p-4">
        {!isPremium && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 text-center backdrop-blur-[2px]">
            <LockKeyhole className="h-6 w-6 text-blue-600" aria-hidden="true" />
            <p className="mt-2 text-xs font-black text-slate-900">
              Specific analysis locked
            </p>
          </div>
        )}
        <div className={`space-y-4 ${!isPremium ? "select-none blur-[3px]" : ""}`}>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-blue-700">
              Main cause:
            </p>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
              {issue.mainCause}
            </p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-blue-700">
              Supporting evidence:
            </p>
            <ul className="mt-2 space-y-1 text-sm font-semibold leading-6 text-slate-700">
              {issue.evidence.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-blue-700">
              Study task:
            </p>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
              {issue.fix}
            </p>
          </div>
        </div>
      </div>
      {!isPremium && (
        <button
          type="button"
          onClick={onUpgrade}
          disabled={checkoutLoading}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-black text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {checkoutLoading ? "Opening..." : "View plans to unlock"}
        </button>
      )}
    </section>
  );
}
