import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Trophy, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "UCAT Groups | PhloemAI",
  description: "Community practice groups for PhloemAI UCAT preparation.",
};

const groupCards = [
  {
    title: "VR practice group",
    description: "Daily verbal reasoning timing and review sessions.",
    href: "/phloemai/practice",
  },
  {
    title: "Diagnostic review group",
    description: "Turn diagnostic feedback into a short weekly plan.",
    href: "/phloemai/report",
  },
  {
    title: "Med Interviews group",
    description: "Switch into interview prep groups and MMI practice.",
    href: "/phloemai/interviews/groups",
  },
] as const;

export default function Page() {
  return (
    <main className="phloem-dashboard-compact min-h-screen bg-[#eef1f3] px-5 py-7 text-[#071923] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/phloemai/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#08787b] hover:text-[#042724]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </Link>

        <section className="mt-6 rounded-xl border border-[#cfe0df] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#08787b]">
                Community
              </p>
              <h1 className="mt-2 text-2xl font-bold text-[#071923]">
                UCAT Groups
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#314956]">
                Peer practice rooms for question review, diagnostic planning and
                interview prep crossover.
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#cfe0df] bg-[#edf7f6] text-[#08787b]">
              <Users className="h-7 w-7" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-3">
          {groupCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="min-h-[180px] rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-sm transition-colors hover:border-[#159a9d] hover:bg-[#f7fbfb]"
            >
              <h2 className="text-base font-bold text-[#071923]">
                {card.title}
              </h2>
              <p className="mt-3 text-sm font-medium leading-6 text-[#314956]">
                {card.description}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#08787b]">
                Open group
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2">
          <Link
            href="/resources"
            className="flex items-center justify-between rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-sm transition-colors hover:border-[#159a9d]"
          >
            <span className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-[#08787b]" aria-hidden="true" />
              <span className="text-sm font-bold text-[#071923]">Guides</span>
            </span>
            <ArrowRight className="h-4 w-4 text-[#4a6370]" aria-hidden="true" />
          </Link>
          <Link
            href="/phloemai/interviews/leaderboard"
            className="flex items-center justify-between rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-sm transition-colors hover:border-[#159a9d]"
          >
            <span className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-[#08787b]" aria-hidden="true" />
              <span className="text-sm font-bold text-[#071923]">
                Interview leaderboard
              </span>
            </span>
            <ArrowRight className="h-4 w-4 text-[#4a6370]" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </main>
  );
}
