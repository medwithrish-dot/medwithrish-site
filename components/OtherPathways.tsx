"use client";

import { useState, useRef } from "react";
import Reveal from "./Reveal";

const pathways = [
  {
    id: "reapply",
    title: "Reapplying After a Gap Year",
    audience: "Medicine & Dentistry",
    description:
      "A gap year can strengthen your application through improved UCAT, more work experience, stronger Med interview prep, and broader reflection. Often, I deal with students who need correction in how to revise effectively for each stage, since they did almost everything wrong and inefficiently the first time round. This is good to recognise for the second round, as it means there are a lot of easy fixes!",
  },
  {
    id: "gateway",
    title: "Gateway / Foundation Courses",
    audience: "Medicine & Dentistry",
    description:
      "Some universities offer gateway or foundation routes for eligible students from underrepresented or widening participation backgrounds.",
  },
  {
    id: "graduate",
    title: "Graduate Entry Medicine",
    audience: "Medicine",
    description:
      "If you complete a degree first, Graduate Entry Medicine can be another route into becoming a doctor, though it is highly competitive. I have helped students get into graduate entry medicine. Many people don't know about the GAMSAT which is another entrance exam for medicine, if the UCAT tests skills you find too difficult.",
  },
  {
    id: "dental-alt",
    title: "Routes Into Dentistry Later",
    audience: "Dentistry",
    description:
      "Some students enter dentistry after taking more time to build their application, strengthen academics, or complete another degree first. There are also other options like transfer schemes into dentistry from other degrees, which is possible in universities like Newcastle.",
  },
  {
    id: "related",
    title: "Related Healthcare Careers",
    audience: "Medicine & Dentistry",
    description:
      "Students may also explore pharmacy, physician associate pathways, biomedical sciences, dental hygiene/therapy, nursing, and other patient-facing careers.",
  },
];

export default function OtherPathways() {
  const [selected, setSelected] = useState(pathways[0]);
const cardRef = useRef<HTMLDivElement | null>(null);
  return (
    <section className="relative overflow-hidden bg-transparent px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Other Pathways
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            There is more than one route into medicine or dentistry
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
            Not getting in first time does not mean the journey is over. Explore
            alternative routes and realistic next steps.
          </p>
        </Reveal>

        <Reveal delay={80} className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {pathways.map((pathway) => {
            const active = selected.id === pathway.id;

            return (
              <button
                key={pathway.id}
               onClick={() => {
  setSelected(pathway);

  // Only scroll on mobile (iPhone-sized screens)
  if (window.innerWidth < 768) {
    setTimeout(() => {
      cardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  }
}}
                className={`rounded-xl border p-4 text-left transition ${
                  active
                    ? "border-blue-600 bg-blue-50/70 shadow-2xs"
                    : "border-slate-200/80 bg-white hover:border-blue-200 hover:bg-slate-50/50"
                }`}
              >
                <p className="text-sm font-semibold text-slate-900">
                  {pathway.title}
                </p>
                <p className="mt-1.5 text-xs text-slate-500">{pathway.audience}</p>
              </button>
            );
          })}
        </Reveal>

        <Reveal delay={150}>
        <div
          ref={cardRef}
          className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            {selected.audience}
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
            {selected.title}
          </h3>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            {selected.description}
          </p>
        </div>
        </Reveal>
      </div>
    </section>
  );
}
