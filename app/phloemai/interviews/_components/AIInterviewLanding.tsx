import Link from "next/link";
import { ArrowUpRight, Mic } from "lucide-react";
import { UniversityCatalogue } from "../universities/UniversityCatalogue";

export function AIInterviewLanding() {
  return (
    <>
      <Link
        href="/phloemai/interviews/ai-interviews?station=why-medicine"
        className="flex items-center gap-4 rounded-2xl border border-[#bcdedb] bg-[#e3f5f2] p-5 transition-colors hover:bg-white sm:p-6"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#08787b] text-white">
          <Mic className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="flex-1">
          <span className="block text-xs font-bold uppercase tracking-wider text-[#08787b]">
            Free for everyone
          </span>
          <span className="mt-1 block text-lg font-bold">
            Start with Why medicine?
          </span>
          <span className="mt-1 block text-sm leading-6 text-[#314956]">
            Practise your motivation, get feedback, and choose whether to join
            the leaderboard.
          </span>
        </span>
        <ArrowUpRight
          className="h-5 w-5 shrink-0 text-[#08787b]"
          aria-hidden="true"
        />
      </Link>
      <UniversityCatalogue mode="practice" />
    </>
  );
}
