import Link from "next/link";

const keyIdeas = [
  {
    title: "Predicted grades matter early",
    text: "Universities often screen applicants using predicted grades. Strong Year 12 performance helps teachers justify competitive predictions.",
  },
  {
    title: "A-Level consistency beats last-minute panic",
    text: "Medicine and dentistry applicants need strong predicted grades while also preparing UCAT, work experience, and applications.",
  },
  {
    title: "Year 12 is when strategy begins",
    text: "This is the year to start thinking about UCAT timing, work experience, university choices, and academic performance together.",
  },
];

const priorities = [
  "Secure strong topic understanding in Biology and Chemistry",
  "Keep organised notes and question banks from early in the year",
  "Speak to teachers about what is needed for strong predicted grades",
  "Plan UCAT preparation before the summer becomes too busy",
  "Begin work experience and reflection notes early",
];

export default function Year12GuidePage() {
  return (
    <main className="bg-white px-6 pb-20 pt-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/resources" className="text-sm font-semibold text-blue-600 hover:underline">
          ← Back to resources
        </Link>

        <header className="mt-10 border-b border-gray-200 pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Application Guide
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Year 12 Guide
          </h1>

          <p className="mt-5 text-lg leading-8 text-gray-700">
            Year 12 is one of the most important years for medicine and dentistry applicants. It shapes predicted grades, UCAT preparation, work experience, and the strength of your final application.
          </p>

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-6 py-5">
            <p className="text-sm font-semibold text-blue-700">
              Need help securing strong A-Level performance?
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-700">
              I offer A-Level tutoring focused on understanding, exam technique, and building the grades needed for competitive applications.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/alevel-tutoring"
                className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                A-Level tutoring
              </Link>

              <Link
                href="/ucat-timeline"
                className="inline-flex rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:border-blue-300 hover:text-blue-700"
              >
                UCAT prep timeline
              </Link>
            </div>
          </div>
        </header>

        <section className="border-b border-gray-200 py-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Why Year 12 matters so much
          </h2>

          <div className="mt-5 space-y-5 text-base leading-8 text-gray-700">
            <p>
              Medicine and dentistry applications happen earlier than many students expect. By the time you apply, universities will often be looking at predicted grades, UCAT score, work experience, and personal statement preparation.
            </p>

            <p>
              This means Year 12 is not just a “practice year.” It is the year where you build the evidence needed for a strong application.
            </p>
          </div>
        </section>

        <section className="border-b border-gray-200 py-10">
          <h2 className="text-2xl font-bold text-gray-900">What matters most</h2>

          <div className="mt-6 grid gap-5">
            {keyIdeas.map((item) => (
              <div key={item.title} className="border-l-4 border-blue-600 pl-5">
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-base leading-7 text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-gray-200 py-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Year 12 priorities
          </h2>

          <ul className="mt-5 space-y-3 text-base leading-7 text-gray-700">
            {priorities.map((priority) => (
              <li key={priority} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                <span>{priority}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-b border-gray-200 py-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Common mistake: focusing only on UCAT
          </h2>

          <div className="mt-5 space-y-5 text-base leading-8 text-gray-700">
            <p>
              UCAT is important, but it cannot compensate for predicted grades that do not meet entry requirements. Many students focus heavily on admissions tests while neglecting their A-Level performance.
            </p>

            <p>
              The strongest applicants manage both: strong academic performance and organised admissions preparation.
            </p>
          </div>
        </section>

        <section className="py-10">
          <div className="rounded-2xl border border-blue-100 bg-[#f7fafe] p-7">
            <h2 className="text-2xl font-bold text-gray-900">
              Want help with A-Level performance?
            </h2>

            <p className="mt-3 text-base leading-7 text-gray-700">
              Strong predicted grades can make a huge difference to your medicine or dentistry application.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/alevel-tutoring"
                className="inline-flex justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Explore A-Level tutoring
              </Link>

              <Link
                href="/contact"
                className="inline-flex justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-800 transition hover:border-blue-300 hover:text-blue-700"
              >
                Contact me
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}