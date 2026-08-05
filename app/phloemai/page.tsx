import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: {
    absolute: "PhloemAI - Stay Tuned",
  },
  description: "PhloemAI is currently a work in progress.",
  alternates: {
    canonical: "/phloemai",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f8fbff] px-6 py-10 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-bold text-cyan-700 shadow-sm">
          <Lock className="h-4 w-4" aria-hidden="true" />
          Work in progress
        </div>

        <h1 className="mt-8 text-4xl font-black tracking-normal text-slate-950 sm:text-6xl">
          PhloemAI is almost ready.
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          Stay tuned! The UCAT tutor is being polished behind the scenes and
          will open when it is ready.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to MedWithRish
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-cyan-300 hover:text-cyan-700"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            Contact
          </Link>
        </div>
      </div>
    </main>
  );
}
