"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const stages = [
  {
    number: "01",
    title: "GCSEs",
    description:
      "Build strong academic foundations early and keep as many options open as possible for medicine or dentistry. High-end unis often require strong GCSE's to progress to an interview and weigh them heavily. Other unis only ask for a minimum set of GCSE grades in order to progress to the next cutoff stage. Click below to find out more!",
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
      "Gain insight into healthcare, develop reflection skills, and begin showing commitment to medicine or dentistry. Often people misunderstand what work experience and supercurriculars are needed for your application - it is only useful within your personal statement which is disregarded by most med/dent schools, and also as talking points for interview. Click below to find out what you actually need to learn within work experience!",
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
      "The UCAT is one of the most important parts of the application and can heavily influence interview chances. It is often HEAVILY weighted and a difficult exam testing logic, critical thinking, ethical reasoning and accuracy under time pressure. It is important to aim at a minimum of the top 70% for med, and top 40% for dentistry as a minimum. This is with strategic applications. Often, most universities have automated UCAT cut-offs and reject anybody below, as well as anybody who doesn't meet the SJT band minimum. Click below for highly specialised UCAT notes.",
    featured: true,
    buttons: [
       {
    label: "Click here for UCAT tutoring",
    href: "/ucat-tutoring",
    variant: "tutoring",
  },
  
    {
    label: "Click here for UCAT notes",
    href: "https://payhip.com/Medwithrish",
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
    showSubmissionPlaceholder: true,
  },
  {
    number: "06",
    title: "Interviews",
    description:
      "Strong interview preparation helps students communicate clearly, think ethically, and perform confidently under pressure. Medicine/dentistry nterviews are a hurdle students are unfamiliar with and often fail at. It is highly important to prepare carefully and invest a lot of time into practice. Interviews test communication, personality and critical thinking generally. Fortunately, I've prepared a FREE medicine interviews guide that has helped 300+ students. Click below for more!",
    buttons: [
      {
        label: "Click here for the FREE medicine interviews guide",
        href: "https://payhip.com/Medwithrish",
        variant: "secondary",
      },
      {
        label: "Click here for medicine interview tutoring",
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
    return "bg-yellow-300 text-blue-950 hover:bg-yellow-200";
  }

  if (variant === "primary") {
    return "bg-blue-600 text-white hover:bg-blue-700";
  }

  return "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100";
}

export default function AdmissionsJourney() {
  const [openStage, setOpenStage] = useState<string | null>("04");
const submissionRef = useRef<HTMLDivElement | null>(null);
const journeyRef = useRef<HTMLElement | null>(null);


const shouldScrollRef = useRef(false);
const searchParams = useSearchParams();

useEffect(() => {
  const stage = searchParams.get("stage");
  const scrollTarget = searchParams.get("scroll");

  if (stage) {
    const formattedStage = stage.padStart(2, "0");
    setOpenStage(formattedStage);

    if (
      formattedStage === "05" &&
      scrollTarget === "ps-submission"
    ) {
      shouldScrollRef.current = true;
    }
  }
}, [searchParams]);

useEffect(() => {
  if (openStage === "05" && shouldScrollRef.current) {
    const timer = setTimeout(() => {
      const element = submissionRef.current;

      if (element) {
        const yOffset = -90;

        const y =
          element.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;

        window.scrollTo({
          top: y,
          behavior: "smooth",
        });
      }

      shouldScrollRef.current = false;
    }, 500);

    return () => clearTimeout(timer);
  }
}, [openStage]);
  return (
    <section
  id="journey"
  ref={journeyRef}
  className="bg-[#f1f5fb] px-6 py-12 md:py-14"
>
      <div className="mx-auto max-w-6xl rounded-[2.5rem] bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] md:p-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Admissions Roadmap
          </p>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Your journey into medicine/dentistry
          </h2>

          <p className="mt-3 text-sm leading-7 text-gray-600 md:text-base">
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
                className={`relative overflow-hidden rounded-[2rem] border transition-all duration-200 hover:shadow-md ${
                  isOpen
                    ? isFeatured
                      ? "border-blue-400 bg-blue-50 shadow-[0_12px_30px_rgba(37,99,235,0.10)]"
                      : "border-blue-200 bg-white shadow-md"
                    : isFeatured
                    ? "border-blue-300 bg-blue-50/70 shadow-sm"
                    : "border-gray-200 bg-white shadow-sm hover:border-blue-300 hover:bg-blue-50/60 cursor-pointer"
                }`}
              >
                {isOpen && (
                  <div className="absolute left-0 top-0 h-full w-1.5 bg-blue-500" />
                )}

                <button
                  type="button"
                  onClick={() => setOpenStage(isOpen ? null : stage.number)}
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

                        {stage.showSubmissionPlaceholder && (
                          <div
  id="ps-submission"
  ref={submissionRef}
  className="mt-8 scroll-mt-28 rounded-[2rem] border border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.95)_0%,rgba(255,255,255,1)_100%)] p-6"
>
                            <div className="inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800">
                              Personal Statement Review
                            </div>

                            <h4 className="mt-5 text-2xl font-bold tracking-tight text-gray-900">
                              Submit your personal statement for review
                            </h4>

                            <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600 md:text-base">
                              This will eventually allow students to upload
                              their personal statement, pay securely, and
                              receive detailed feedback. For now, this is a
                              placeholder while the submission system is being
                              set up. If you want personal statement reviews, contact <strong> medwithrish@gmail.com.</strong>
                            </p>

                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                  Email address
                                </label>
                                <input
                                  type="email"
                                  placeholder="Enter your email"
                                  disabled
                                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-gray-400 outline-none"
                                />
                              </div>

                              <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                  Confirm email address
                                </label>
                                <input
                                  type="email"
                                  placeholder="Re-enter your email"
                                  disabled
                                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-gray-400 outline-none"
                                />
                              </div>
                            </div>

                            <div className="mt-5">
                              <p className="mb-2 text-sm font-medium text-gray-700">
                                Upload personal statement
                              </p>

                              <div className="rounded-[2rem] border-2 border-dashed border-amber-300 bg-white px-6 py-10 text-center">
                                <div className="text-lg font-semibold text-gray-700">
                                  Submission feature coming soon
                                </div>
                                <div className="mt-2 text-sm text-gray-500">
                                  Upload and payment functionality will be added
                                  here later.
                                </div>
                              </div>
                            </div>

                            <button
                              disabled
                              className="mt-6 w-full rounded-2xl bg-amber-300 px-5 py-4 text-base font-bold text-amber-900 opacity-70"
                            >
                              Personal statement submission coming soon
                            </button>
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
    </section>
  );
}