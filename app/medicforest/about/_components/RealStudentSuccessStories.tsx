"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
} from "lucide-react";

interface RealStory {
  id: string;
  imageSrc: string;
  title: string;
  subtitle: string;
  tag: string;
  highlightText?: string;
}

const ALL_REAL_STORIES: RealStory[] = [
  // Flip Page 1: Flagship Offers & High Scores
  {
    id: "cambridge-offer",
    imageSrc: "/success-stories/oxbridge.jpeg",
    title: "Cambridge Medicine (A100) offer",
    subtitle: "Official UCAS offer secured for Medicine at University of Cambridge",
    tag: "Oxbridge Offer",
    highlightText: "University of Cambridge (C05)",
  },
  {
    id: "story-4-offers",
    imageSrc: "/success-stories/story1.jpeg",
    title: "Secured 4 / 4 Medicine offers",
    subtitle: "Full sweep of UK medical school interviews converted to offers",
    tag: "4 / 4 Offers",
    highlightText: "Manchester, Newcastle, KCL & Liverpool",
  },
  {
    id: "score-2340-qr900",
    imageSrc: "/success-stories/story-2340-b2.png",
    title: "2340 Band 2 (900 in QR)",
    subtitle: "Flawless Quantitative Reasoning score on official UCAT report",
    tag: "900 in QR",
    highlightText: "VR 730 · DM 710 · QR 900",
  },

  // Flip Page 2: Edinburgh, Manchester, 2410
  {
    id: "edinburgh-offer",
    imageSrc: "/success-stories/story10.jpeg",
    title: "Edinburgh Medicine offer",
    subtitle: "Official place secured to study Medicine at University of Edinburgh",
    tag: "Medicine Offer",
    highlightText: "University of Edinburgh",
  },
  {
    id: "manchester-offer",
    imageSrc: "/success-stories/story7.jpeg",
    title: "Manchester Medicine offer",
    subtitle: "Offer secured following intensive interview practice sessions",
    tag: "Medicine (A106)",
    highlightText: "University of Manchester",
  },
  {
    id: "score-2410-b2",
    imageSrc: "/success-stories/story-2410-b2.png",
    title: "2410 Band 2 UCAT score",
    subtitle: "Top national percentile score targeting Cambridge and Imperial",
    tag: "Top Decile UCAT",
    highlightText: "All 9s & 8s at GCSE · 2410 B2",
  },

  // Flip Page 3: UEA 1-Interview-1-Offer, Lincoln Unconditional, 2350 Band 1
  {
    id: "story-1-chance",
    imageSrc: "/success-stories/story3.jpeg",
    title: "1 Interview, 1 Medicine offer",
    subtitle: "Single interview converted into an official place for Medicine",
    tag: "UCAS Track Offer",
    highlightText: "Medicine (A104) at UEA",
  },
  {
    id: "lincoln-unconditional",
    imageSrc: "/success-stories/story2.jpeg",
    title: "Lincoln Medicine unconditional offer",
    subtitle: "Direct unconditional place secured for MBChB Medicine",
    tag: "Unconditional Offer",
    highlightText: "University of Lincoln (L39)",
  },
  {
    id: "score-2350-band1",
    imageSrc: "/success-stories/story-2350-b1.png",
    title: "2350 Band 1 (Top 4% score)",
    subtitle: "96th percentile national score across all cognitive subtests",
    tag: "UCAT Band 1",
    highlightText: "VR 730 · DM 740 · QR 880 · Band 1",
  },

  // Flip Page 4: Kent & Medway, 2370 Band 2, 2350 Band 2
  {
    id: "kmms-offer",
    imageSrc: "/success-stories/story11.jpeg",
    title: "Kent & Medway Medicine offer",
    subtitle: "Official place secured for Medicine (A100) at KMMS",
    tag: "Medicine (A100)",
    highlightText: "Kent and Medway Medical School",
  },
  {
    id: "story-2370-qr880",
    imageSrc: "/success-stories/story5.jpeg",
    title: "2370 Band 2 (880 in QR)",
    subtitle: "Official candidate score report with 880 in Quantitative Reasoning",
    tag: "Candidate Report",
    highlightText: "VR 730 · DM 760 · QR 880",
  },
  {
    id: "story-2350-qr820",
    imageSrc: "/success-stories/story4.jpeg",
    title: "2350 Band 2 (QR 820)",
    subtitle: "Top 4% national UCAT candidate score report",
    tag: "Top 4% Score",
    highlightText: "VR 750 · DM 780 · QR 820",
  },

  // Flip Page 5: UEA Offer 2, 2260 QR 880, 2170 QR 880
  {
    id: "uea-offer-2",
    imageSrc: "/success-stories/story9.jpeg",
    title: "UEA Medicine place confirmed",
    subtitle: "Official offer received to study Medicine at University of East Anglia",
    tag: "Future Doctor",
    highlightText: "University of East Anglia",
  },
  {
    id: "score-2260-qr880",
    imageSrc: "/success-stories/story6.jpeg",
    title: "2260 Band 3 (880 in QR)",
    subtitle: "92nd percentile UCAT score report following tutoring drills",
    tag: "92nd Percentile",
    highlightText: "QR 880 · DM 740 · VR 640",
  },
  {
    id: "score-2170-qr880",
    imageSrc: "/success-stories/story-2170-b2.png",
    title: "2170 Band 2 (880 in QR)",
    subtitle: "Strong numerical pacing and decision-making logic shortcuts",
    tag: "Official UCAT",
    highlightText: "880 in QR · Band 2",
  },

  // Flip Page 6: 2140 Band 1, 2190 Band 3
  {
    id: "score-2140-band1",
    imageSrc: "/success-stories/story8.jpeg",
    title: "2140 Band 1 UCAT score",
    subtitle: "Top tier Situational Judgement Band 1 on official candidate report",
    tag: "Band 1 SJT",
    highlightText: "Band 1 SJT · QR 780 · DM 740",
  },
  {
    id: "score-2190-b3",
    imageSrc: "/success-stories/story-2190-b3.png",
    title: "2190 Band 3 UCAT score",
    subtitle: "Solid competitive UCAT score achieving medical school thresholds",
    tag: "Official UCAT",
    highlightText: "Medical School Threshold Secured",
  },
];

export function RealStudentSuccessStories() {
  const [page, setPage] = useState(0);
  const [selectedStory, setSelectedStory] = useState<RealStory | null>(null);

  const pageSize = 3;
  const totalPages = Math.ceil(ALL_REAL_STORIES.length / pageSize);

  const handlePrev = () => {
    setPage((p) => (p > 0 ? p - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setPage((p) => (p < totalPages - 1 ? p + 1 : 0));
  };

  const currentStories = ALL_REAL_STORIES.slice(
    page * pageSize,
    page * pageSize + pageSize
  );

  return (
    <div className="mt-8 border-t border-slate-100 pt-6">
      {/* Flip controls */}
      <div className="flex items-center justify-between mb-4">
        {/* Flip Dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setPage(idx)}
              aria-label={`Go to flip page ${idx + 1}`}
              className={`h-2 rounded-full transition-all ${
                page === idx
                  ? "w-6 bg-[#0c6b5e]"
                  : "w-2 bg-slate-200 hover:bg-slate-300"
              }`}
            />
          ))}
        </div>

        {/* Flip Arrow Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous success stories"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:border-teal-300 hover:text-teal-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next success stories"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:border-teal-300 hover:text-teal-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 3 Real Stories Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {currentStories.map((story) => (
          <div
            key={story.id}
            onClick={() => setSelectedStory(story)}
            className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs transition hover:border-teal-300 hover:shadow-xs"
          >
            {/* Real Screenshot Preview Container */}
            <div className="relative flex h-52 w-full flex-col justify-between overflow-hidden rounded-xl border border-slate-100 bg-slate-950 p-1.5 transition">
              <div className="relative h-full w-full overflow-hidden rounded-lg">
                <Image
                  src={story.imageSrc}
                  alt={story.title}
                  fill
                  className="object-contain transition duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-slate-950/0 transition group-hover:bg-slate-950/20 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-800 shadow-sm flex items-center gap-1.5 backdrop-blur-xs">
                    <Maximize2 className="h-3 w-3 text-teal-700" />
                    <span>View full receipt</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Caption & Metadata */}
            <div className="mt-3.5 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-slate-950 group-hover:text-teal-900 transition">
                  {story.title}
                </p>
                <span className="shrink-0 text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
                  {story.tag}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-snug">
                {story.subtitle}
              </p>
              {story.highlightText && (
                <div className="pt-1">
                  <span className="inline-block rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-100">
                    {story.highlightText}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal for Full Screenshot */}
      {selectedStory && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs"
          onClick={() => setSelectedStory(null)}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white p-5 sm:p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-950">
                    {selectedStory.title}
                  </h4>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full">
                    {selectedStory.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedStory.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStory(null)}
                aria-label="Close modal"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex max-h-[68vh] items-center justify-center overflow-auto rounded-xl bg-slate-950 p-2 sm:p-4">
              <div className="relative h-[480px] w-full">
                <Image
                  src={selectedStory.imageSrc}
                  alt={selectedStory.title}
                  fill
                  className="object-contain"
                  sizes="640px"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Authentic student verification receipt</span>
              <button
                type="button"
                onClick={() => setSelectedStory(null)}
                className="rounded-xl bg-[#0c6b5e] px-4 py-2 font-bold text-white transition hover:bg-[#084e45]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
