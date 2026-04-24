import Link from "next/link";

const careers = [
  "Pharmacy",
  "Physician Associate",
  "Biomedical Science",
  "Dental Hygiene / Therapy",
  "Nursing",
  "Radiography",
  "Physiotherapy",
];

export default function RelatedCareersGuidePage() {
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
            Alternative Careers
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Related Healthcare Careers Guide
          </h1>

          <p className="mt-5 text-lg leading-8 text-gray-700">
            Medicine and dentistry are not the only meaningful healthcare careers.
            Many students discover fulfilling roles in related professions.
          </p>

        </header>

        <section className="py-10">

          <h2 className="text-2xl font-bold text-gray-900">
            Examples of related careers
          </h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">

            {careers.map((career) => (
              <div
                key={career}
                className="border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800"
              >
                {career}
              </div>
            ))}

          </div>

        </section>

      </div>

    </main>
  );
}