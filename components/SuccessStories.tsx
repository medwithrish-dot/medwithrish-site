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
      className="relative overflow-hidden bg-transparent px-6 pt-10 pb-12 md:pt-14 md:pb-16"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Student Success Stories
          </p>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Real messages. Real offers. Real results.
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
            A few of the messages and outcomes from students we’ve helped with
            UCAT, interviews, and competitive applications that received <strong className="font-semibold text-slate-800">Oxbridge</strong> and other Russell Group university offers.
          </p>

          <div className="mt-5 flex justify-center">
            <a
              href="#more-results"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 shadow-xs transition hover:border-blue-300 hover:text-blue-600"
            >
              Scroll down for more
              <span className="text-sm">↓</span>
            </a>
          </div>
        </Reveal>

        {/* Featured result */}
        <Reveal delay={80} className="mx-auto mt-8 max-w-3xl">
          <div id="featured-result">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-7">
              <div className="relative grid items-center gap-6 md:grid-cols-[1fr_260px]">
                <div className="max-w-md">
                  <span className="inline-flex rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                    Featured Result
                  </span>

                  <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                    A UCAT score that beat 97% of test-takers.
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    This is one of MULTIPLE students who I have helped get a UCAT score that was within the top 5%. This particular student went from &apos;failing&apos; his UCAT mock-tests to out-competing approximately 40,000 test-takers, using my guidance and resources!
                  </p>

                  <div className="mt-4 inline-flex rounded-full bg-amber-50 border border-amber-200/80 px-3 py-1 text-xs font-semibold text-amber-900">
                    Standout student result (2370 B2)
                  </div>
                </div>

                <div className="mx-auto w-full max-w-[260px] rounded-xl border border-slate-100 bg-white p-2 shadow-xs">
                  <Image
                    src={featuredStory.src}
                    alt={featuredStory.alt}
                    width={1200}
                    height={1600}
                    sizes="240px"
                    className="h-auto w-full rounded-lg object-cover"
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
                className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <Image
                  src={story.src}
                  alt={story.alt}
                  width={900}
                  height={1200}
                  sizes="(max-width: 639px) calc(100vw - 74px), (max-width: 1023px) calc((100vw - 98px) / 2), (max-width: 1199px) calc((100vw - 122px) / 3), 342px"
                  className="h-auto w-full rounded-xl object-contain"
                />

                {story.caption && (
                  <p className="mt-3 text-center text-xs font-medium text-slate-700">
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
              className="rounded-full bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700"
            >
              View More Success Stories
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
