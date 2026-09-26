"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Mail,
  Star,
  CheckCircle2,
  ZoomIn,
  X,
} from "lucide-react";
import { MedicForestLandingShell } from "../ucat/_components/MedicForestLandingShell";

const stories = [
  {
    src: "/success-stories/story-2410-b2.png",
    alt: "Student UCAT score 2410 Band 2",
    tag: "UCAT Score",
    isOffer: false,
    caption: "2410 Band 2",
    detail: "Top percentile national UCAT achievement",
  },
  {
    src: "/success-stories/story1.jpeg",
    alt: "Student received 4 out of 4 medicine offers",
    tag: "Medicine Offer",
    isOffer: true,
    caption: "4 / 4 Medicine Offers",
    detail: "Received offers from all four medical school applications",
  },
  {
    src: "/success-stories/story-2340-b2.png",
    alt: "Student UCAT score 2340 Band 2",
    tag: "UCAT Score",
    isOffer: false,
    caption: "2340 Band 2",
    detail: "Top 4% nationally with exceptional section breakdown",
  },
  {
    src: "/success-stories/story3.jpeg",
    alt: "Student medicine offer success story",
    tag: "Medicine Offer",
    isOffer: true,
    caption: "Medicine Offer Secured",
    detail: "All it takes is one interview to get a medicine offer!",
  },
  {
    src: "/success-stories/story-2170-b2.png",
    alt: "Student UCAT score 2170 Band 2 with 880 QR",
    tag: "UCAT Score",
    isOffer: false,
    caption: "2170 Band 2 (880 in QR)",
    detail: "Near-perfect 880 score in Quantitative Reasoning",
  },
  {
    src: "/success-stories/story5.jpeg",
    alt: "Oxbridge medicine offer success story",
    tag: "Medicine Offer",
    isOffer: true,
    caption: "Oxbridge Medicine Offer",
    detail: "Secured prestigious medicine offer after 1-1 coaching",
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

function StudentOutcomesCard() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [zoomedStory, setZoomedStory] = useState<(typeof stories)[0] | null>(null);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % stories.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + stories.length) % stories.length);
  }, []);

  useEffect(() => {
    if (paused || zoomedStory) return;
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [next, paused, zoomedStory]);

  const activeStory = stories[current];

  return (
    <>
      <div
        className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm sm:p-6 transition hover:shadow-md"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Header with Title and Prev/Next arrows */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Student outcomes</h3>
            <p className="text-xs font-medium text-gray-500">Real results. Real progress.</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous outcome"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next outcome"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Transitioning image container with object-contain to avoid super-cropping */}
        <div className="relative mt-4">
          <div
            className="group relative h-60 sm:h-64 w-full cursor-zoom-in overflow-hidden rounded-xl border border-gray-200/70 bg-[#f8fafb] p-3 flex items-center justify-center shadow-inner"
            onClick={() => setZoomedStory(activeStory)}
            title="Click to view full screenshot"
          >
            {stories.map((story, i) => (
              <div
                key={story.src}
                className={`absolute inset-3 flex items-center justify-center transition-opacity duration-500 ease-in-out ${
                  i === current
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
                }`}
                aria-hidden={i !== current}
              >
                <Image
                  src={story.src}
                  alt={story.alt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 520px"
                  priority={i === 0}
                />
              </div>
            ))}

            {/* Subtle zoom hint badge on hover */}
            <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white opacity-0 backdrop-blur-xs transition group-hover:opacity-100">
              <ZoomIn className="h-3 w-3" />
              <span>Expand</span>
            </div>
          </div>

          {/* Caption & category bar */}
          <div className="mt-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    activeStory.isOffer
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                      : "bg-teal-50 text-teal-700 border border-teal-200/70"
                  }`}
                >
                  {activeStory.tag}
                </span>
                <h4 className="truncate text-sm font-bold text-gray-900">
                  {activeStory.caption}
                </h4>
              </div>
              <p className="mt-0.5 truncate text-xs text-gray-500">
                {activeStory.detail}
              </p>
            </div>

            {/* Dot indicators */}
            <div className="flex shrink-0 items-center gap-1.5">
              {stories.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current ? "w-5 bg-teal-600" : "w-1.5 bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full image zoom modal */}
      {zoomedStory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
          onClick={() => setZoomedStory(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-white p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomedStory(null)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
              aria-label="Close zoomed image"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="relative h-[70vh] w-[85vw] max-w-3xl">
              <Image
                src={zoomedStory.src}
                alt={zoomedStory.alt}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </div>
            <div className="px-3 py-2 text-center">
              <p className="text-sm font-bold text-gray-900">{zoomedStory.caption}</p>
              <p className="text-xs text-gray-500">{zoomedStory.detail}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function TutoringPageClient() {
  return (
    <MedicForestLandingShell>
      <div className="relative min-h-screen bg-[#f7faf9] px-6 py-10 sm:px-10 lg:py-12">
        {/* Soft background mint glow decoration */}
        <div
          className="pointer-events-none absolute right-0 top-0 -z-10 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-teal-100/40 via-emerald-100/20 to-transparent blur-3xl"
          aria-hidden="true"
        />

        <div className="mx-auto max-w-5xl">
          {/* Top Hero: 2-column layout */}
          <div className="grid items-center gap-10 lg:grid-cols-2">
            {/* Left Column: Copy & Contact CTA */}
            <div>
              <span className="inline-flex items-center rounded-full bg-teal-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-700 border border-teal-100/80">
                1-1 Tutoring
              </span>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                One-to-one tutoring,{" "}
                <span className="text-teal-700 block sm:inline">built around you.</span>
              </h1>

              <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
                Work directly with <strong className="font-semibold text-gray-900">@medwithrish</strong> — a
                leading medical admissions expert who has helped students achieve strong UCAT
                scores, secure multiple medicine offers, and ace their interviews.
              </p>

              {/* Rating row */}
              <div className="mt-4 flex items-center gap-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  Trusted by students across the UK
                </span>
              </div>

              {/* Single Contact CTA Button */}
              <div className="mt-7">
                <a
                  href="https://medwithrish.com/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
                >
                  <span>Contact</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              {/* Direct email */}
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-teal-700 shrink-0" />
                <a
                  href="mailto:medwithrish@gmail.com"
                  className="font-medium text-gray-600 hover:text-teal-700 hover:underline"
                >
                  medwithrish@gmail.com
                </a>
              </div>
            </div>

            {/* Right Column: Student outcomes transitioning slideshow */}
            <StudentOutcomesCard />
          </div>

          {/* What's included section with teal accent line */}
          <section className="mt-14 lg:mt-18">
            <div className="border-l-4 border-teal-600 pl-3.5">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">What&apos;s included</h2>
              <p className="mt-1 text-sm text-gray-600">
                Every session is tailored to where you are and what you need most.
              </p>
            </div>

            <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
              {benefits.map((b) => (
                <div
                  key={b}
                  className="flex items-center gap-3.5 rounded-xl border border-gray-200/90 bg-white px-5 py-4 shadow-xs transition hover:border-teal-200"
                >
                  <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0" />
                  <span className="text-sm font-medium text-gray-800">{b}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </MedicForestLandingShell>
  );
}
