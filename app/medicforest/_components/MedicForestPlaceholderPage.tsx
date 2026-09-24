import Link from "next/link";
import { ArrowRight, Clock3, Sparkles } from "lucide-react";
import { MedicForestLandingShell } from "../ucat/_components/MedicForestLandingShell";

type MedicForestPlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function MedicForestPlaceholderPage({
  eyebrow,
  title,
  description,
}: MedicForestPlaceholderPageProps) {
  return (
    <MedicForestLandingShell>
      <div className="flex min-h-screen items-center bg-[#f7faf9] px-5 py-16 text-[#123a3c] sm:px-8">
        <section className="mx-auto w-full max-w-3xl rounded-3xl border border-[#d7e3e1] bg-white p-7 shadow-sm sm:p-10 lg:p-14">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f3f2] text-[#08787b]">
            <Clock3 className="h-5 w-5" aria-hidden="true" />
          </span>

          <p className="mt-7 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#08787b]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#536d72] sm:text-lg">
            {description}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#6b7f83]">
            This part of MedicForest is still being prepared. For now, you can
            explore Forest, our free UCAT question bank and AI tutor.
          </p>

          <Link
            href="/medicforest/ucat"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#08787b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#06666a]"
          >
            Meet Forest
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </MedicForestLandingShell>
  );
}
