import Link from "next/link";
import Reveal from "./Reveal";

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_8%_12%,rgba(219,234,254,0.7),transparent_28rem),radial-gradient(circle_at_92%_70%,rgba(237,233,254,0.65),transparent_32rem),linear-gradient(145deg,#f8fbff_0%,#f5f7fd_50%,#faf8ff_100%)] px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/resources"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Resources
        </Link>

        <Reveal className="mt-6">
        <div className="rounded-[2rem] border border-blue-100 bg-white/95 p-8 shadow-[0_16px_50px_rgba(37,99,235,0.07)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            {eyebrow}
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">
            {title}
          </h1>

          <p className="mt-4 text-base leading-8 text-gray-600 md:text-lg">
            {intro}
          </p>

          {ctaLabel && ctaHref && (
            <div className="mt-6">
              <Link
                href={ctaHref}
                className="inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {ctaLabel}
              </Link>
            </div>
          )}
        </div>
        </Reveal>

        <div className="mt-8 space-y-6">
          {sections.map((section, index) => (
            <Reveal key={section.title} delay={(index % 3) * 70}>
            <section
              className="rounded-[1.5rem] border border-gray-200/90 bg-white/95 p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-900">
                {section.title}
              </h2>

              <ul className="mt-4 space-y-3 text-gray-600">
                {section.points.map((point) => (
                  <li key={point} className="leading-7">
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
  );
}
