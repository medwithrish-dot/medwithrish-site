"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Search,
  CheckCircle2,
  X,
  FileText,
  Award,
  GraduationCap,
  Maximize2,
} from "lucide-react";

interface SuccessItem {
  id: string;
  type: "mockup" | "image";
  title: string;
  subtitle: string;
  tag?: string;
  imageSrc?: string;
  mockupKind?: "interview" | "ucas" | "ucat";
}

const PRIMARY_STORIES: SuccessItem[] = [
  {
    id: "interview-invitation",
    type: "mockup",
    mockupKind: "interview",
    title: "Interview offer",
    subtitle: "Invitation to interview at a UK medical school",
    tag: "Medical Interview",
  },
  {
    id: "ucas-medicine-offer",
    type: "mockup",
    mockupKind: "ucas",
    title: "Medicine offer",
    subtitle: "Successful medicine offer through UCAS",
    tag: "UCAS Track",
  },
  {
    id: "ucat-improvement-3050",
    type: "mockup",
    mockupKind: "ucat",
    title: "UCAT improvement",
    subtitle: "+200 points average increase per section",
    tag: "UCAT Test Report",
  },
];

const ADDITIONAL_STORIES: SuccessItem[] = [
  {
    id: "score-2410",
    type: "image",
    imageSrc: "/success-stories/story-2410-b2.png",
    title: "Top UCAT score: 2410 Band 2",
    subtitle: "Consistently in the top 3% percentile nationally",
    tag: "UCAT Official",
  },
  {
    id: "score-2340",
    type: "image",
    imageSrc: "/success-stories/story-2340-b2.png",
    title: "2340 Band 2 with 900 in QR",
    subtitle: "Flawless Quantitative Reasoning score after timing drills",
    tag: "UCAT 900 QR",
  },
  {
    id: "story-4-offers",
    type: "image",
    imageSrc: "/success-stories/story1.jpeg",
    title: "Secured 4 / 4 Medicine offers",
    subtitle: "Full sweep of UK medical school interviews converted to offers",
    tag: "Admissions Offer",
  },
  {
    id: "story-2350",
    type: "image",
    imageSrc: "/success-stories/story-2350-b1.png",
    title: "2350 Band 1 (Top 4% score)",
    subtitle: "Rapid score jump from early diagnostic mocks",
    tag: "UCAT Band 1",
  },
  {
    id: "story-oxbridge",
    type: "image",
    imageSrc: "/success-stories/story5.jpeg",
    title: "Oxbridge & Russell Group offer",
    subtitle: "Intensive MMI coaching & STARR model answer mastery",
    tag: "Oxbridge Offer",
  },
  {
    id: "story-2170",
    type: "image",
    imageSrc: "/success-stories/story-2170-b2.png",
    title: "2170 Band 2 (880 in QR)",
    subtitle: "Strong numerical shortcuts and pacing technique",
    tag: "UCAT Official",
  },
];

const ALL_STORIES = [...PRIMARY_STORIES, ...ADDITIONAL_STORIES];

export function StudentSuccessStoriesCarousel() {
  const [page, setPage] = useState(0);
  const [selectedItem, setSelectedItem] = useState<SuccessItem | null>(null);

  const pageSize = 3;
  const totalPages = Math.ceil(ALL_STORIES.length / pageSize);

  const handlePrev = () => {
    setPage((p) => (p > 0 ? p - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setPage((p) => (p < totalPages - 1 ? p + 1 : 0));
  };

  const currentStories = ALL_STORIES.slice(
    page * pageSize,
    page * pageSize + pageSize
  );

  return (
    <div className="mt-8">
      {/* Sub-header with Carousel controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-950 sm:text-lg">
            Student success stories
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Real offers. Real score improvements. Real progress.
          </p>
        </div>

        {/* Carousel buttons */}
        <div className="flex items-center gap-2">
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

      {/* 3 Cards Grid */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {currentStories.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs transition hover:border-teal-300 hover:shadow-xs"
          >
            {/* Visual Container */}
            <div className="relative flex h-48 w-full flex-col justify-between overflow-hidden rounded-xl border border-slate-100 bg-[#f8fafc] p-3 transition group-hover:bg-[#f1f7f5]">
              {item.type === "mockup" && item.mockupKind === "interview" && (
                <InterviewMockupCard />
              )}

              {item.type === "mockup" && item.mockupKind === "ucas" && (
                <UcasMockupCard />
              )}

              {item.type === "mockup" && item.mockupKind === "ucat" && (
                <UcatMockupCard />
              )}

              {item.type === "image" && item.imageSrc && (
                <div className="relative h-full w-full overflow-hidden rounded-lg bg-slate-100">
                  <Image
                    src={item.imageSrc}
                    alt={item.title}
                    fill
                    className="object-contain p-1"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-slate-900/0 transition group-hover:bg-slate-900/5 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition rounded-full bg-white/90 p-1.5 shadow-xs text-slate-700">
                      <Maximize2 className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Caption */}
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-950">{item.title}</p>
                {item.tag && (
                  <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                    {item.tag}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-500 leading-snug">
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-bold text-slate-950">
                  {selectedItem.title}
                </h4>
                <p className="text-xs text-slate-500">{selectedItem.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex max-h-[65vh] items-center justify-center overflow-auto rounded-xl bg-slate-50 p-4">
              {selectedItem.type === "image" && selectedItem.imageSrc ? (
                <div className="relative h-[480px] w-full">
                  <Image
                    src={selectedItem.imageSrc}
                    alt={selectedItem.title}
                    fill
                    className="object-contain"
                    sizes="600px"
                  />
                </div>
              ) : selectedItem.mockupKind === "interview" ? (
                <div className="w-full max-w-lg">
                  <InterviewMockupCard expanded />
                </div>
              ) : selectedItem.mockupKind === "ucas" ? (
                <div className="w-full max-w-lg">
                  <UcasMockupCard expanded />
                </div>
              ) : (
                <div className="w-full max-w-lg">
                  <UcatMockupCard expanded />
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-xl bg-[#0c6b5e] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#084e45]"
              >
                Close preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

{/* 1. Interview Invitation Mockup */}
function InterviewMockupCard({ expanded = false }: { expanded?: boolean }) {
  return (
    <div className="flex h-full w-full flex-col justify-between rounded-lg bg-white p-3 shadow-2xs border border-slate-200/80 text-left">
      {/* Window bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            <GraduationCap className="h-3.5 w-3.5" />
          </div>
          <div className="h-2 w-20 rounded bg-slate-200" />
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Search className="h-3 w-3" />
          <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
        </div>
      </div>

      {/* Invitation Letter Body */}
      <div className="my-2 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-black text-slate-900">
            Interview Invitation
          </span>
          <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1 py-0.2 text-[9px] font-bold text-emerald-700">
            <CheckCircle2 className="h-2.5 w-2.5" /> Verified
          </span>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-600">
          Dear Applicant,
          <br />
          We are pleased to invite you to attend an interview for Medicine at the
          University of...
        </p>
        {expanded && (
          <p className="text-[10px] text-slate-500 pt-1">
            Station Format: Multiple Mini Interviews (MMI) • 7 Stations • Ethical Scenarios, STARR Reflective stations &amp; Roleplay.
          </p>
        )}
      </div>

      {/* Footer Pill */}
      <div className="flex items-center justify-between rounded bg-slate-50 px-2 py-1 text-[9px] text-slate-500">
        <span>Format: MMI Circuit</span>
        <span className="font-semibold text-teal-700">Medicine (A100)</span>
      </div>
    </div>
  );
}

{/* 2. UCAS Offer Mockup */}
function UcasMockupCard({ expanded = false }: { expanded?: boolean }) {
  return (
    <div className="flex h-full w-full flex-col justify-between rounded-lg bg-white p-3 shadow-2xs border border-slate-200/80 text-left">
      {/* Header with UCAS branding */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black tracking-tight text-[#e51e2b]">
            UCAS
          </span>
          <span className="text-[10px] font-bold text-slate-700">
            Your choices
          </span>
        </div>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
          2026 Entry
        </span>
      </div>

      {/* Main Choice Preview */}
      <div className="my-2 grid grid-cols-5 gap-2 items-center">
        {/* Course choices placeholders */}
        <div className="col-span-2 space-y-1">
          <div className="h-2 w-full rounded bg-slate-200" />
          <div className="h-2 w-3/4 rounded bg-slate-200" />
          <div className="h-2 w-4/5 rounded bg-slate-100" />
        </div>

        {/* Purple Celebration Pill */}
        <div className="col-span-3 rounded-lg bg-gradient-to-r from-[#401254] to-[#2c0e3a] p-2 text-white shadow-xs">
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300">
            <Sparkles className="h-3 w-3" />
            <span>Congratulations!</span>
          </div>
          <p className="mt-0.5 text-[9px] leading-tight text-purple-100">
            You have received an offer for Medicine at...
          </p>
        </div>
      </div>

      {/* Footer Details */}
      <div className="flex items-center justify-between rounded bg-emerald-50/70 px-2 py-1 text-[9px] text-emerald-800 font-semibold">
        <span>Status: Conditional Offer</span>
        <span>A*AA Requirements</span>
      </div>
    </div>
  );
}

{/* 3. UCAT Test Results Mockup */}
function UcatMockupCard({ expanded = false }: { expanded?: boolean }) {
  return (
    <div className="flex h-full w-full flex-col justify-between rounded-lg bg-white p-3 shadow-2xs border border-slate-200/80 text-left">
      {/* UCAT Banner */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="rounded bg-[#0c2340] px-1.5 py-0.5 text-[9px] font-black text-white tracking-wider">
            UCAT
          </span>
          <span className="text-[10px] font-bold text-slate-700">
            Test Results
          </span>
        </div>
        <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[9px] font-bold text-teal-700">
          Band 1 (SJT)
        </span>
      </div>

      {/* Score Table */}
      <div className="my-1.5 overflow-hidden rounded border border-slate-200 text-center">
        <div className="grid grid-cols-4 bg-slate-100 text-[8px] font-bold text-slate-600 py-1 border-b border-slate-200">
          <div>VR</div>
          <div>DM</div>
          <div>QR</div>
          <div>AR</div>
        </div>
        <div className="grid grid-cols-4 bg-white text-[11px] font-black text-slate-900 py-1.5">
          <div>780</div>
          <div>760</div>
          <div>790</div>
          <div>720</div>
        </div>
      </div>

      {/* Total Result */}
      <div className="flex items-center justify-between rounded bg-slate-50 px-2 py-1 text-[9px]">
        <span className="text-slate-500 font-medium">Total Cognitive Score</span>
        <span className="font-black text-[#0c6b5e] text-[10px]">
          3,050 • Top 1% Percentile
        </span>
      </div>
    </div>
  );
}
