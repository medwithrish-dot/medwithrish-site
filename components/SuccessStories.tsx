"use client";
import Universities from "./Universities";
import Image from "next/image";
import { useState } from "react";
import Reveal from "./Reveal";

const featuredStory = {
  src: "/success-stories/story5.jpeg",
  alt: "Oxbridge offer success story",
};

const stories = [
  {
    src: "/success-stories/story-2410-b2.png",
    alt: "Student UCAT score 2410 Band 2",
    caption: "2410 b2!",
  },
  {
    src: "/success-stories/story-2340-b2.png",
    alt: "Student UCAT score 2340 Band 2 with QR 900",
    caption: "2340 B2 (QR 900!)",
  },
  {
    src: "/success-stories/story-2170-b2.png",
    alt: "Student UCAT score 2170 Band 2 with 880 Quantitative Reasoning",
    caption: "2170 B2 (880 in QR)!",
  },
  {
    src: "/success-stories/story-2190-b3.png",
    alt: "Student UCAT score 2190 Band 3",
    caption: "2190 B3!",
  },
  {
    src: "/success-stories/story6.jpeg",
    alt: "Student success story 1",
    caption: "A 92nd Percentile UCAT Score - 2260!",
  },
  {
    src: "/success-stories/story3.jpeg",
    alt: "Student success story 2",
    caption: "All it takes is one Med interview to get a medicine offer!",
  },
  {
    src: "/success-stories/story4.jpeg",
    alt: "Student success story 4",
    caption: "A 96th percentile / top 4% UCAT score - 2350!",
  },
  {
    src: "/success-stories/story7.jpeg",
    alt: "Student success story 5",
  },
  {
    src: "/success-stories/story1.jpeg",
    alt: "Student success story 6",
    caption: "4 / 4 medicine offers!",
  },
  {
    src: "/success-stories/story2.jpeg",
    alt: "Student success story 7",
  },
  {
    src: "/success-stories/story8.jpeg",
    alt: "Student success story 8",
  },
  {
    src: "/success-stories/story9.jpeg",
    alt: "Student success story 9",
  },
  {
    src: "/success-stories/story11.jpeg",
    alt: "Student success story 10",
  },
  {
    src: "/success-stories/story10.jpeg",
    alt: "Student success story 11",
  },
];



export default function SuccessStories() {
  const [showAll, setShowAll] = useState(false);

  const initialCount = 6;
  const visibleStories = showAll ? stories : stories.slice(0, initialCount);

  return (
    <section
      id="success-stories"
      className="relative overflow-hidden px-6 pt-10 pb-14 md:pt-14 md:pb-20"
    >
      {/* ── Collegiate Academic Ambient Background with Layered Overlays ── */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none" aria-hidden="true">
        {/* Academic Image Layer */}
        <div className="absolute inset-0">
          <Image
            src="/academic-ambient-bg.jpg"
            alt="British collegiate university campus panorama"
            fill
            sizes="100vw"
            className="object-cover object-top opacity-35 md:opacity-45"
            priority
          />
        </div>

        {/* Seamless Top & Bottom Blends */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1d4ed8]/25 via-[#eef5fc]/90 to-[#e9f1fa]" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/75 via-transparent to-white/75" />

        {/* Radial Ambient Lighting Orbs */}
        <div className="absolute -left-20 top-10 h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -right-20 top-40 h-[500px] w-[500px] rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute left-1/2 bottom-10 -translate-x-1/2 h-[380px] w-[600px] rounded-full bg-cyan-300/20 blur-3xl" />

        {/* Subtle geometric dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#1e3a8a 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Micro-grain texture (2% opacity) to remove digital sterility */}
        <div
          className="absolute inset-0 opacity-[0.02] mix-blend-multiply pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/90 bg-white/90 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-blue-700 shadow-xs backdrop-blur-sm">
            Student Success Stories
          </span>

          <h2 className="mt-3.5 text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
            Real messages. Real offers. Real results.
          </h2>

          <p className="mt-3 text-sm leading-7 text-gray-600 md:text-base">
            A few of the messages and outcomes from students we’ve helped with
            UCAT, interviews, and competitive applications that received <strong>Oxbridge</strong> and other Russel group uni offers.

          
          </p>

          <div className="mt-5 flex justify-center">
  <a
    href="#more-results"
    className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600 hover:shadow"
  >
    Scroll down for more
    <span className="text-base">↓</span>
  </a>
</div>
        </Reveal>

        {/* Featured result */}
<Reveal delay={80} className="mx-auto mt-8 max-w-3xl">
<div id="featured-result">
  <div className="relative overflow-hidden rounded-[2rem] border border-white/90 bg-white/90 p-5 shadow-[0_20px_50px_rgba(30,58,138,0.08)] backdrop-blur-md md:p-7">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -left-10 top-6 h-28 w-28 rounded-full bg-blue-100/70 blur-3xl" />
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-yellow-100/60 blur-3xl" />
    </div>

    <div className="relative grid items-center gap-6 md:grid-cols-[0.9fr_260px]">
      <div className="max-w-md">
        <span className="inline-flex rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white shadow-xs">
          Featured Result
        </span>

        <h3 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          A UCAT score that beat 97% of test-takers.
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
          This is one of MULTIPLE students who I have helped get a UCAT score that was within the top 5%. This particular student went from &apos;failing&apos; his UCAT mock-tests to out-competing approximately 40,000 test-takers, using my guidance and resources!
        </p>

        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-yellow-200/80 bg-yellow-50 px-3.5 py-1.5 text-xs font-bold text-yellow-800 shadow-2xs">
          <span>🏆</span>
          <span>Standout student result (2370 B2)</span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[260px] rounded-[1.5rem] border border-blue-100/80 bg-white p-2.5 shadow-sm">
        <Image
          src={featuredStory.src}
          alt={featuredStory.alt}
          width={1200}
          height={1600}
          sizes="240px"
          className="h-auto w-full rounded-[0.9rem] object-cover"
        />
      </div>
    </div>
  </div>
</div>
</Reveal>
<Reveal delay={120}><Universities /></Reveal>
        {/* More results heading */}
        <Reveal className="mt-10 text-center">
        <div id="more-results">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            More Offers & Results
          </p>

          <h3 className="mt-2 text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
            More student messages and outcomes
          </h3>
        </div>
        </Reveal>

       {/* Grid */}
<div className="mx-auto mt-6 max-w-6xl columns-1 gap-6 sm:columns-2 lg:columns-3">
  {visibleStories.map((story, index) => (
    <Reveal
      key={story.src}
      delay={(index % 3) * 70}
      className="mb-6 break-inside-avoid"
    >
    <div
      className="rounded-3xl border border-slate-200/80 bg-white/95 p-3.5 shadow-sm backdrop-blur-xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
    >
      <Image
        src={story.src}
        alt={story.alt}
        width={900}
        height={1200}
        sizes="(max-width: 639px) calc(100vw - 74px), (max-width: 1023px) calc((100vw - 98px) / 2), (max-width: 1199px) calc((100vw - 122px) / 3), 342px"
        className="h-auto w-full rounded-2xl object-contain"
      />

      {story.caption && (
        <p className="mt-3 text-center text-sm font-semibold text-gray-700">
          {story.caption}
        </p>
      )}
    </div>
    </Reveal>
  ))}
</div>

        {/* View More button */}
        {!showAll && stories.length > initialCount && (
          <div className="mt-7 flex justify-center">
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/25 transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-600/35 active:scale-95"
            >
              <span>View More Success Stories</span>
              <span>↓</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
