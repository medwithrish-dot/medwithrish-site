import Link from "next/link";

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
    <main className="bg-[#f7fafe] px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/resources"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Resources
        </Link>

        <div className="mt-6 rounded-[2rem] border border-blue-100 bg-white p-8 shadow-sm">
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

        <div className="mt-8 space-y-6">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[1.5rem] border border-gray-200 bg-white p-6 shadow-sm"
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
          ))}
        </div>
      </div>
    </main>
  );
}