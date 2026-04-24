import Link from "next/link";

const keyIdeas = [
  {
    title: "Gateway courses are not shortcuts",
    text: "Gateway and foundation courses still require strong commitment and academic performance. They exist to support widening participation students.",
  },
  {
    title: "Eligibility criteria matter",
    text: "Most gateway programmes require specific eligibility, such as attending certain schools or meeting widening participation criteria.",
  },
  {
    title: "They can lead to the same degree",
    text: "Gateway routes often lead into the same medicine or dentistry degrees as standard entry courses.",
  },
];

const eligibilityExamples = [
  "Widening participation eligibility",
  "Attending specific eligible schools",
  "Living in areas of lower university participation",
  "Being first in family to attend university",
  "Meeting contextual criteria set by universities",
];

export default function GatewayGuidePage() {
  return (
    <main className="bg-white px-6 pb-20 pt-10">

      <div className="mx-auto max-w-4xl">

        <Link
          href="/resources"
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          ← Back to resources
        </Link>

        <header className="mt-10 border-b border-gray-200 pb-10">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Alternative Pathways
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Gateway & Foundation Courses Guide
          </h1>

          <p className="mt-5 text-lg leading-8 text-gray-700">
            Gateway and foundation courses offer alternative routes into
            medicine and dentistry for students who meet widening participation criteria.
          </p>

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-6 py-5">

            <p className="text-sm font-semibold text-blue-700">
              Unsure whether gateway courses apply to you?
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-700">
              I help students understand eligibility requirements,
              alternative pathways, and realistic application strategies.
            </p>

            <Link
              href="/contact"
              className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Get personalised advice
            </Link>

          </div>

        </header>

        <section className="border-b border-gray-200 py-10">

          <h2 className="text-2xl font-bold text-gray-900">
            What gateway courses are for
          </h2>

          <div className="mt-5 space-y-5 text-base leading-8 text-gray-700">

            <p>
              Gateway courses are designed to support students from
              underrepresented backgrounds who show strong potential.
            </p>

            <p>
              They provide additional academic preparation before entering
              standard medicine or dentistry programmes.
            </p>

          </div>

        </section>

        <section className="border-b border-gray-200 py-10">

          <h2 className="text-2xl font-bold text-gray-900">
            What matters most
          </h2>

          <div className="mt-6 grid gap-5">

            {keyIdeas.map((item) => (
              <div key={item.title} className="border-l-4 border-blue-600 pl-5">

                <h3 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>

                <p className="mt-2 text-base leading-7 text-gray-700">
                  {item.text}
                </p>

              </div>
            ))}

          </div>

        </section>

        <section className="py-10">

          <h2 className="text-2xl font-bold text-gray-900">
            Common eligibility factors
          </h2>

          <ul className="mt-5 space-y-3 text-base leading-7 text-gray-700">

            {eligibilityExamples.map((item) => (
              <li key={item} className="flex gap-3">

                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-600" />

                <span>{item}</span>

              </li>
            ))}

          </ul>

        </section>

      </div>

    </main>
  );
}
