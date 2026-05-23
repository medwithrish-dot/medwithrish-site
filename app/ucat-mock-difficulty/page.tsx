import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Send, Sheet } from "lucide-react";
import Navbar from "@/components/Navbar";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1_MhhGQyXX3o_qbL6-QFc1KZAj3XFXn2d-oiBvIuSFM4/edit?gid=9647191#gid=9647191";
const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScvWGoTQcElu1U8R1O_EqMHlyRuZ3T7gzXYrXhBsWj3AUyZPw/viewform?usp=header";

export const metadata: Metadata = {
  title: "Medify Mock Difficulty Spreadsheet | MedWithRish",
  description:
    "Open the MedWithRish Medify UCAT mock difficulty spreadsheet and submit your own scores.",
  alternates: {
    canonical: "/ucat-mock-difficulty",
  },
};

export default function UCATMockDifficultyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#f7fafe] px-6 py-10 text-slate-950">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/resources"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            Back to resources
          </Link>

          <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-50 text-blue-600">
              <Sheet className="h-6 w-6" />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              Free UCAT resource
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              Medify Mock Difficulty Spreadsheet
            </h1>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Open the shared spreadsheet to compare Medify mock difficulty,
              average VR, DM and QR scores, total score averages, and available
              SJT band data. It is designed as a quick reference while deciding
              which mocks felt easier or harder for other students.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href={SHEET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 text-base font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                <ExternalLink className="h-5 w-5" />
                Open spreadsheet
              </a>

              <a
                href={FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-5 text-base font-bold text-slate-800 transition hover:border-blue-300 hover:text-blue-700"
              >
                <Send className="h-5 w-5" />
                Submit your scores
              </a>
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-5">
            <h2 className="text-lg font-bold text-slate-950">
              What is in the spreadsheet?
            </h2>

            <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
              <p>
                The sheet lists each Medify mock alongside a difficulty label,
                average section scores, average total score and any available
                SJT band information.
              </p>

              <p>
                The averages update as more students submit scores, so use it
                as a guide rather than a fixed ranking. Your own UCAT progress
                still matters more than whether one mock is labelled easy or
                hard.
              </p>
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold text-slate-950">
              Related UCAT tools
            </h2>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/ucat-score-tracker"
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-bold text-slate-800 transition hover:border-blue-300 hover:text-blue-700"
              >
                Free UCAT Score Tracker
              </Link>

              <Link
                href="/ucat-timeline"
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-bold text-slate-800 transition hover:border-blue-300 hover:text-blue-700"
              >
                UCAT Prep Timeline
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
