import Link from "next/link";
import Reveal from "./Reveal";
import Navbar from "./Navbar";

type GuideSection = {
  title: string;
  points: string[];
};

type GuidePageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: GuideSection[];
  ctaLabel?: string;
  ctaHref?: string;
};

export default function GuidePage({
  eyebrow,
  title,
  intro,
  sections,
  ctaLabel,
  ctaHref,
}: GuidePageProps) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen medwithrish-bg px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/resources"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to Resources
          </Link>

          <Reveal className="mt-6">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                {eyebrow}
              </p>

              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 md:text-4xl">
                {title}
              </h1>

              <p className="mt-4 text-sm leading-relaxed text-slate-600 md:text-base">
                {intro}
              </p>

              {ctaLabel && ctaHref && (
                <div className="mt-6">
                  <Link
                    href={ctaHref}
                    className="inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700"
                  >
                    {ctaLabel}
                  </Link>
                </div>
              )}
            </div>
          </Reveal>

          <div className="mt-8 space-y-5">
            {sections.map((section, index) => (
              <Reveal key={section.title} delay={(index % 3) * 70}>
                <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {section.title}
                  </h2>

                  <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                    {section.points.map((point) => (
                      <li key={point} className="leading-relaxed">
                        • {point}
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
