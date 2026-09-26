"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Mail,
  Star,
  UserRoundCheck,
} from "lucide-react";
import { MedicForestLandingShell } from "../ucat/_components/MedicForestLandingShell";

const slides = [
  {
    src: "/success-stories/story-2410-b2.png",
    alt: "Student UCAT 2410 Band 2",
    caption: "2410 B2 — top percentile UCAT result",
  },
  {
    src: "/success-stories/story1.jpeg",
    alt: "4 out of 4 medicine offers",
    caption: "4/4 medicine offers after personalised tutoring",
  },
  {
    src: "/success-stories/story-2340-b2.png",
    alt: "Student UCAT 2340 Band 2",
    caption: "2340 B2 — exceptional UCAT performance",
  },
  {
    src: "/success-stories/story3.jpeg",
    alt: "Medicine interview offer",
    caption: "One interview was all it took",
  },
  {
    src: "/success-stories/story-2170-b2.png",
    alt: "Student UCAT 2170 Band 2 with 880 QR",
    caption: "2170 B2 — 880 in Quantitative Reasoning",
  },
];

const benefits = [
  "Personalised session plan based on your diagnostic results",
  "Timing and accuracy strategies for each UCAT subtest",
  "Live mock questions with immediate, targeted feedback",
  "Interview technique coaching — MMI and panel formats",
  "Personal statement planning and review",
  "Flexible scheduling — weekday, weekend, evenings available",
];

function Slideshow() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [next, paused]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-[#0d1c1c] shadow-xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[4/3] w-full">
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === current ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden={i !== current}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={i === 0}
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
            <p className="absolute bottom-4 left-4 right-4 text-sm font-semibold leading-snug text-white drop-shadow-sm">
              {slide.caption}
            </p>
          </div>
        ))}
      </div>

      {/* Arrow controls */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
        <button
          onClick={next}
          aria-label="Next slide"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-3 right-4 flex gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? "w-5 bg-white" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function TutoringPageClient() {
  return (
    <MedicForestLandingShell>
      <div className="min-h-screen bg-[#f7faf9] px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Hero grid */}
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                <UserRoundCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
                1-1 Tutoring
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#0d2c2e] sm:text-5xl">
                One-to-one tutoring,{" "}
                <span className="text-teal-700">built around you.</span>
              </h1>
              <p className="mt-5 text-base leading-8 text-[#4a6568]">
                Work directly with <strong>@medwithrish</strong> — a leading medical admissions
                expert who has helped students achieve top UCAT scores, secure multiple medicine
                offers, and ace their interviews.
              </p>

              <div className="mt-4 flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-2 text-sm font-semibold text-[#0d2c2e]">
                  Trusted by students across the UK
                </span>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="mailto:medwithrish@gmail.com?subject=1-1 Tutoring Enquiry"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-teal-900/20 transition hover:bg-teal-800"
                >
                  <Mail className="h-4 w-4" />
                  Book a session
                </a>
                <a
                  href="mailto:medwithrish@gmail.com?subject=Tutoring Question"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-white px-6 py-3.5 text-sm font-bold text-teal-700 transition hover:border-teal-400 hover:bg-teal-50"
                >
                  Ask a question
                </a>
              </div>

              <p className="mt-4 flex items-center gap-2 text-sm text-[#4a6568]">
                <Mail className="h-4 w-4 shrink-0 text-teal-700" />
                <a
                  href="mailto:medwithrish@gmail.com"
                  className="font-semibold text-teal-700 hover:underline"
                >
                  medwithrish@gmail.com
                </a>
              </p>
            </div>

            <Slideshow />
          </div>

          {/* Benefits */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-[#0d2c2e]">What&apos;s included</h2>
            <p className="mt-2 text-sm text-[#4a6568]">
              Every session is tailored to where you are and what you need most.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {benefits.map((b) => (
                <div
                  key={b}
                  className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                  <p className="text-sm font-medium text-[#0d2c2e]">{b}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How to book */}
          <section className="mt-12 rounded-2xl border border-teal-100 bg-teal-50 p-7 sm:p-10">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                <Calendar className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-[#0d2c2e]">How to book</h2>
                <p className="mt-3 text-sm leading-7 text-[#4a6568]">
                  Getting started is simple — just send an email and Rish will get back to you
                  within 24 hours to discuss your goals, schedule a free introductory call, and
                  agree on a session plan.
                </p>

                <ol className="mt-5 space-y-3">
                  {[
                    "Email medwithrish@gmail.com with your name, what you're preparing for, and your timeline.",
                    "Rish will reply with availability and suggest the best session format for your needs.",
                    "Book your first session — no long-term commitment required.",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <p className="text-sm leading-6 text-[#0d2c2e]">{step}</p>
                    </li>
                  ))}
                </ol>

                <a
                  href="mailto:medwithrish@gmail.com?subject=1-1 Tutoring Enquiry&body=Hi Rish,%0A%0AI'm interested in booking a 1-1 tutoring session. Here's a bit about where I am:%0A%0A- Preparing for: %0A- Timeline: %0A- Goals: %0A%0AThanks!"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
                >
                  <Mail className="h-4 w-4" />
                  Email to book now
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MedicForestLandingShell>
  );
}
