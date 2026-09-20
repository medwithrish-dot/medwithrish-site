import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, MessageCircle, Target, UserRoundCheck } from "lucide-react";
import { InterviewShell } from "../_components/InterviewShell";

export const metadata: Metadata = {
  title: "1-1 Interview Tutoring | PhloemAI",
  description: "Book individual medicine or dentistry interview tutoring with tailored MMI and panel interview practice.",
};

const benefits = [
  "A session shaped around your universities and interview format",
  "Live MMI or panel-style questioning with specific feedback",
  "Support with structure, reflection, ethics and confident delivery",
  "Clear priorities to practise after the session",
];

export default function Page() {
  const subject = encodeURIComponent("1-1 interview tutoring enquiry");
  const body = encodeURIComponent("Hi Rish,\n\nI’m interested in 1-1 interview tutoring.\n\nUniversity/universities:\nInterview date (if known):\nAreas I would like help with:\n\nThanks,");

  return (
    <InterviewShell
      title="1-1 Interview Tutoring"
      subtitle="Personal medicine and dentistry interview coaching, built around the answers and stations you want to improve."
      activeLabel="1-1 Tutoring"
      eyebrow="Work directly with Rish"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-2xl bg-[#042724] p-7 text-white sm:p-9">
            <div aria-hidden="true" className="absolute -right-16 -top-16 h-56 w-56 rounded-full border-[32px] border-white/[0.04]" />
            <UserRoundCheck className="h-8 w-8 text-[#9ce8dd]" aria-hidden="true" />
            <h2 className="mt-5 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">Turn practice into a stronger interview performance.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-teal-50/80">Use a session to rehearse under realistic pressure, understand what is holding an answer back, and leave with practical changes you can apply straight away.</p>
          </section>

          <section className="rounded-2xl border border-[#d8e4e4] bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center gap-3"><Target className="h-5 w-5 text-[#08787b]" aria-hidden="true" /><h2 className="text-lg font-bold">What your session can cover</h2></div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {benefits.map((benefit) => <li key={benefit} className="flex gap-3 rounded-xl bg-[#f3f8f7] p-4 text-sm leading-6 text-[#314956]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#159a9d]" aria-hidden="true" />{benefit}</li>)}
            </ul>
          </section>

          <section className="rounded-2xl border border-[#d8e4e4] bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-lg font-bold">How it works</h2>
            <ol className="mt-5 grid gap-4 sm:grid-cols-3">
              {[['01', 'Tell me your goals', 'Share your target universities, interview date and the areas you want to improve.'], ['02', 'Practise live', 'Work through focused questions or a realistic mock interview.'], ['03', 'Leave with a plan', 'Get direct feedback and clear next steps for independent practice.']].map(([number, title, copy]) => <li key={number}><span className="text-xs font-bold tracking-wider text-[#08787b]">{number}</span><h3 className="mt-2 text-sm font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#526b72]">{copy}</p></li>)}
            </ol>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-[#bcd8d5] bg-[#e7f3f0] p-6 sm:p-7 xl:sticky xl:top-8">
          <MessageCircle className="h-7 w-7 text-[#08787b]" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-bold text-[#042724]">Enquire about a session</h2>
          <p className="mt-3 text-sm leading-6 text-[#415b61]">Send your university choices and interview date, if you know them. Rish will reply with availability and next steps.</p>
          <a href={`mailto:medwithrish@gmail.com?subject=${subject}&body=${body}`} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#08787b] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#042724]">Email to sign up <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
          <a href="https://wa.me/447305422619?text=Hi%20Rish%2C%20I%E2%80%99m%20interested%20in%201-1%20interview%20tutoring." target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-[#9fc6c1] bg-white px-5 py-3.5 text-sm font-bold text-[#075d5f] transition hover:border-[#08787b]">Message on WhatsApp</a>
          <p className="mt-4 text-xs leading-5 text-[#5b7275]">There is no commitment when you enquire. Availability and session details are confirmed directly before booking.</p>
        </aside>
      </div>
    </InterviewShell>
  );
}
