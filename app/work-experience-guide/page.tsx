import Link from "next/link";

const keyIdeas = [
  {
    title: "An anecdote tying in almost all good skills of a doctor",
    text: "In a medical interview, most questions within the category of 'motivatoin for medicine' involves using the STARR structure, which involves using an anecdote - you should remember a specific situation to use in a lot of these STARR structures. For example, was it a specific patient that was dealt with by the doctor you shadowed?",
  },
  {
    title: "You need to understand people, not just procedures",
    text: "Good work experience should help you understand communication, empathy, teamwork, pressure, responsibility, and patient-centred care.",
  },
  {
    title: "Quality beats quantity",
    text: "A few experiences reflected on well are usually stronger than many placements described vaguely. This links back to the anecdote - it should be unique and catches attention. This is how to stand out in your medical application.",
  },
];

const examples = [
  "Hospital or GP observation",
  "Dentist or orthodontist shadowing",
  "Care home volunteering",
  "Hospice volunteering",
  "Pharmacy or community healthcare exposure",
  "Online work experience programmes",
  "Charity work involving communication or responsibility",
];

const reflectionPrompts = [
  "What did I observe?",
  "Why did it matter?",
  "What did it teach me about medicine, dentistry, or healthcare?",
  "What skill or quality did it show was important?",
  "How did it affect the way I think about the profession?",
  "And for bonus points - How did I learn from it and apply it to improve?"
];

export default function WorkExperienceGuidePage() {
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
            Application Guide
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Work Experience Guide
          </h1>
          <br></br>
<p><em>by medwithrish, leading medical admissions tutor.</em></p>
          <p className="mt-5 text-lg leading-8 text-gray-700">
            Why do you do work experience within the hospital? How is it useful in the medical admissions process? What am I meant to learn or remember from medical work experience? There are many questions students have that they do cannot find the answer to easily. This guide covers what you do with your medical work experience.
          </p>
        </header>

        <section className="border-b border-gray-200 py-10">
          <h2 className="text-2xl font-bold text-gray-900">
            What work experience is actually for
          </h2>

          <div className="mt-5 space-y-5 text-base leading-8 text-gray-700">
            <p>
              Many students misunderstand work experience. They think the goal is
              to find the most impressive hospital, clinic, or consultant. In reality, you&apos;ll find medical work experience is generally used for your personal statement and in interviews, where for a lot of universities you can get through the admissions process with 0 work experience and still get an offer. For example - <em>What did you learn in your work experience?</em> You can answer using an example of virtual medical work experience, which can easily be found on the internet as quick courses.
            </p>

            <p>
              Besides the admissions process, it is used for you to see if the profession is actually one that suits you, from seeing firsthand what a doctor does.


            </p>
          </div>
        </section>

        <section className="border-b border-gray-200 py-10">
          <h2 className="text-2xl font-bold text-gray-900">
            What matters most / What to remember 
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

        <section className="border-b border-gray-200 py-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Examples of useful experience
          </h2>

          <p className="mt-4 text-base leading-8 text-gray-700">
            Useful experience does not have to be rare or prestigious. The best
            experiences are often the ones where you can observe communication,
            responsibility, care, and teamwork clearly.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {examples.map((item) => (
              <div
                key={item}
                className="border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-gray-200 py-10">
          <h2 className="text-2xl font-bold text-gray-900">
            How to reflect properly
          </h2>

          <p className="mt-4 text-base leading-8 text-gray-700">
            Reflection is what turns an experience into something useful. A weak
            reflection simply says what happened. A strong reflection explains
            why it mattered and what it taught you about the profession.
          </p>

          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Use these questions after each experience
            </h3>

            <ul className="mt-5 space-y-3 text-base leading-7 text-gray-700">
              {reflectionPrompts.map((prompt) => (
                <li key={prompt} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  <span>{prompt}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-b border-gray-200 py-10">
          <h2 className="text-2xl font-bold text-gray-900">
            How to use work experience later
          </h2>

          <div className="mt-5 space-y-5 text-base leading-8 text-gray-700">
            <p>
              Your work experience becomes useful later in two main places: your
              personal statement and your interview answers.
            </p>

            <p>
              In a personal statement, you might use one short example to show
              insight, reflection, or motivation. In interviews, there is usually a specific station about work experience, with questions generally being <em>&apos;What did you learn from your work experience?&apos; </em> or even <em>&apos;Why do you think medical schools usually ask you to undertake medical work experience?&apos; </em>. You can also use work
              experience to discuss communication, empathy, teamwork, ethical
              challenges, and the realities of patient care.
            </p>

            <p>
              The best applicants do not just say, “I saw a doctor communicate
              well.” They explain what made the communication effective and why
              that skill matters in healthcare.
            </p>
          </div>
        </section>

        <section className="py-10">
          <div className="rounded-2xl border border-blue-100 bg-[#f7fafe] p-7">
            <h2 className="text-2xl font-bold text-gray-900">
              Want help strengthening your application?
            </h2>

            <p className="mt-3 text-base leading-7 text-gray-700">
              Explore more resources on personal statements, UCAT preparation,
              interviews, and the full admissions journey.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/resources"
                className="inline-flex justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Browse all resources
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