"use client";

import Link from "@/app/medicforest/_components/MedicForestLink";

export default function InterviewError({ error, retry }: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 text-[#123c39]">
      <section className="rounded-2xl border border-[#dce6e5] bg-white p-8">
        <h1 className="text-2xl font-bold">Your interview page could not load</h1>
        <p className="mt-4 text-sm leading-7 text-[#526b72]">
          Please try again shortly. If you were answering a station, reopen the same interview
          in this browser to recover any available draft. Keep this browser?s saved data.
        </p>
        {error.digest && <p className="mt-3 text-xs text-[#526b72]">Support reference: {error.digest}</p>}
        <div className="mt-6 flex flex-wrap gap-4">
          <button type="button" onClick={retry} className="rounded-xl bg-[#08787b] px-5 py-3 text-sm font-bold text-white">Try again</button>
          <Link href="/medicforest/interview/dashboard" className="rounded-xl border border-[#dce6e5] px-5 py-3 text-sm font-bold">Open dashboard</Link>
        </div>
      </section>
    </main>
  );
}
