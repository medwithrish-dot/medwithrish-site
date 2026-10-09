"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Reveal from "@/components/Reveal";
import { FREE_INTERVIEW_GUIDE_URL, MEDWITHRISH_NOTES_URL } from "@/utils/medwithrish/site-links";

const stages = [
  {
    number: "01",
    title: "GCSEs",
    description:
      "Build strong academic foundations early and keep as many options open as possible for medicine or dentistry. High-end unis often require strong GCSE's to progress to a Med interview and weigh them heavily. Other unis only ask for a minimum set of GCSE grades in order to progress to the next cutoff stage. Click below to find out more!",
    buttons: [
      {
        label: "Click here to access the GCSE revision guide",
        href: "/gcse-revision-guide",
        variant: "secondary",
      },
      {
        label: "Click here for GCSE tutoring",
        href: "/gcse-tutoring",
        variant: "tutoring",
      },
    ],
  },
  {
    number: "02",
    title: "Work Experience & Supercurriculars",
    description:
      "Gain insight into healthcare, develop reflection skills, and begin showing commitment to medicine or dentistry. Often people misunderstand what work experience and supercurriculars are needed for your application - it is only useful within your personal statement which is disregarded by most med/dent schools, and also as talking points for Med interview. Click below to find out what you actually need to learn within work experience!",
    buttons: [
      {
        label: "Click here to access the work experience guide",
        href: "/work-experience-guide",
        variant: "secondary",
      },
    ],
  },
  {
    number: "03",
    title: "Year 12 & Predicted Grades",
    description:
      "Year 12 performance is crucial for strong predicted grades and a competitive university application. Often universities have an automated rejection service that rejects anybody who does not meet the minimum predicted grade requirements. In order to apply, you should aim for AAA predicted minimum for MOST med/dent universities. Click below to learn more!",
    buttons: [
      {
        label: "Click here to access the AS-Level / Year 12 guide",
        href: "/year12-guide",
        variant: "secondary",
      },
      {
        label: "Click here for A-Level tutoring",
        href: "/alevel-tutoring",
        variant: "tutoring",
      },
    ],
  },
  {
    number: "04",
    title: "UCAT",
    description:
      "The UCAT is one of the most important parts of the application and can heavily influence Med interview chances. It is often HEAVILY weighted and a difficult exam testing logic, critical thinking, ethical reasoning and accuracy under time pressure. It is important to aim at a minimum of the top 70% for med, and top 40% for dentistry as a minimum. This is with strategic applications. Often, most universities have automated UCAT cut-offs and reject anybody below, as well as anybody who doesn't meet the SJT band minimum. Click below for highly specialised UCAT notes.",
    featured: true,
    buttons: [
       {
    label: "Click here for UCAT tutoring",
    href: "/ucat-tutoring",
    variant: "tutoring",
  },
  
    {
    label: "Click here for UCAT notes",
    href: MEDWITHRISH_NOTES_URL,
    variant: "primary",
  },
  

  {
    label: "Click here to access the UCAT prep timeline",
    href: "/ucat-timeline",
    variant: "secondary",
  },
 {
    label: "Download Free UCAT Score Tracker",
    href: "/ucat-score-tracker",
    variant: "secondary",
  },
],
  },
  {
    number: "05",
    title: "Personal Statement",
    description:
      "Your personal statement should show motivation, reflection, and clear evidence of suitability for the course. Personal statements are VERY IMPORTANT to generally high-end medical schools (Oxbridge etc.) and some select dental schools. It is therefore important to refine the personal statement if aiming for high-end univerisities/select universities that have weighting on personal statement strength. Otherwise, generally most medical universities do not give significance to the PS, and if used, will be talked about within interviews. Fortunately, they are easy to perfect. Click below for help!",
    buttons: [
      {
        label: "Click here for the personal statements guide",
        href: "/personal-statements-guide",
        variant: "secondary",
      },
      {
        label: "Click here for a 1-to-1 personal statements session",
        href: "/personal-statement-session",
        variant: "tutoring",
      },
    ],
  },
  {
    number: "06",
    title: "Med Interviews",
    description:
      "Strong Med interview preparation helps students communicate clearly, think ethically, and perform confidently under pressure. Medicine interviews are a hurdle students are unfamiliar with and often fail at. It is highly important to prepare carefully and invest a lot of time into practice. Interviews test communication, personality and critical thinking generally. Fortunately, we've prepared a FREE medicine interviews guide that has helped 300+ students. Click below for more!",
    buttons: [
      {
        label: "Click here for the Med interview prep hub",
        href: "/interviews",
        variant: "primary",
      },
      {
        label: "Click here for the FREE medicine interviews guide",
        href: FREE_INTERVIEW_GUIDE_URL,
        variant: "secondary",
      },
      {
        label: "Click here for medicine Med interview tutoring",
        href: "/interview-tutoring",
        variant: "tutoring",
      },
    ],
  },
  {
    number: "07",
    title: "A-Levels & Final Offers",
    description:
      "Final grades matter. Meeting offer conditions is the final step in securing your place at medical or dental school. Often, students become relaxed after getting their offer and end up losing their offer after neglecting A-level revision. It is highly important you do NOT miss your A-Levels offer. Click below for A-Level help!",
    buttons: [
      {
        label: "Click here for A-Level tutoring",
        href: "/alevel-tutoring",
        variant: "tutoring",
      },
    ],
  },
];

function buttonClasses(variant: string) {
  if (variant === "tutoring") {
    return "bg-yellow-300 text-blue-950 font-bold hover:bg-yellow-200 shadow-xs";
  }

  if (variant === "primary") {
    return "bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-xs";
  }

  return "bg-white text-blue-700 font-semibold border border-blue-200 hover:bg-blue-50 shadow-2xs";
}

export default function AdmissionsJourney() {
  const journeyRef = useRef<HTMLElement | null>(null);

  const searchParams = useSearchParams();
  const routeKey = searchParams.toString();
  const requestedStage = searchParams.get("stage")?.padStart(2, "0");
  const urlStage = stages.some((stage) => stage.number === requestedStage)
    ? requestedStage
    : "04";

  // A manual selection belongs to the current URL; new deep links take precedence.
  const [userStage, setUserStage] = useState<{ routeKey: string; stage: string | null } | null>(null);
  const openStage = userStage?.routeKey === routeKey ? userStage.stage : urlStage;
  const setOpenStage = (stage: string | null) => setUserStage({ routeKey, stage });


  return (
    <section
      id="journey"
      ref={journeyRef}
      className="relative overflow-hidden bg-transparent px-6 py-12 md:py-16"
    >
      <Reveal className="mx-auto max-w-6xl">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Admissions Roadmap
          </p>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Your journey into medicine/dentistry
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
            From GCSEs to final offers, each stage plays a role in building a
            strong and competitive application. 
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {stages.map((stage) => {
            const isOpen = openStage === stage.number;
            const isFeatured = !!stage.featured;

            return (
              <div
                key={stage.number}
                className={`relative overflow-hidden rounded-xl border transition-all duration-200 ${
                  isOpen
                    ? isFeatured
                      ? "border-blue-400 bg-blue-50/70 shadow-sm"
                      : "border-slate-300 bg-white shadow-sm"
                    : isFeatured
                    ? "border-blue-200 bg-blue-50/30 hover:border-blue-300 hover:bg-blue-50/60"
                    : "border-slate-200/80 bg-white hover:border-blue-200 hover:bg-slate-50/50 cursor-pointer"
                }`}
              >
                {isOpen && (
                  <div className="absolute left-0 top-0 h-full w-1.5 bg-blue-500" />
                )}

                <button
                  type="button"
                  onClick={() => setOpenStage(isOpen ? null : stage.number)}
                  aria-expanded={isOpen}
                  aria-controls={`journey-stage-${stage.number}`}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left md:px-8 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                        isFeatured
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {stage.number}
                    </div>

                    <div>
                      <p
                        className={`text-sm font-medium ${
                          isFeatured ? "text-blue-700" : "text-gray-500"
                        }`}
                      >
                        Stage {stage.number}
                      </p>

                      <h3
                        className={`mt-1 text-lg font-semibold tracking-tight md:text-xl ${
                          isFeatured ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        {stage.title}
                      </h3>
                    </div>
                  </div>

                  <div
                    className={`text-3xl leading-none transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    } ${isFeatured ? "text-blue-700" : "text-gray-500"}`}
                  >
                    ˅
                  </div>
                </button>

                <div
                  id={`journey-stage-${stage.number}`}
                  inert={!isOpen}
                  aria-hidden={!isOpen}
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-4 md:px-8 md:pb-5">
                      <div className="ml-[56px] max-w-4xl">
                        <p className="text-sm leading-7 text-gray-600 md:text-base">
                          {stage.description}
                        </p>

                        {isFeatured && (
                          <div className="mt-4 inline-flex rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                            Key admissions stage
                          </div>
                        )}

                        {stage.buttons?.length > 0 && (
                          <div className="mt-6 flex flex-wrap gap-3">
                            {stage.buttons.map((button, index) =>
                              button.href.startsWith("http") ? (
                                <a
                                  key={index}
                                  href={button.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-flex rounded-xl px-4 py-3 text-sm font-semibold transition ${buttonClasses(
                                    button.variant
                                  )}`}
                                >
                                  {button.label}
                                </a>
                              ) : (
                                <Link
                                  key={index}
                                  href={button.href}
                                  className={`inline-flex rounded-xl px-4 py-3 text-sm font-semibold transition ${buttonClasses(
                                    button.variant
                                  )}`}
                                >
                                  {button.label}
                                </Link>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </Reveal>
    </section>
  );
}
