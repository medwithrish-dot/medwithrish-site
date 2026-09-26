"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";

export default function ReportsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-900 shadow-sm">
        <h2 className="text-xl font-bold">Could not load saved reports</h2>
        <p className="mt-2 text-sm text-red-700">
          There was a temporary problem loading your reports. Your saved sessions and transcripts remain intact.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-800"
          >
            <RotateCcw size={16} /> Try again
          </button>
          <Link
            href="/medicforest/interview/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-900 hover:bg-red-100"
          >
            <ArrowLeft size={16} /> Return to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
