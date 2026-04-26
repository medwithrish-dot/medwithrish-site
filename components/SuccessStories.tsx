"use client";
import Universities from "./Universities";
import Image from "next/image";
import { useState } from "react";

const featuredStory = {
  src: "/success-stories/story5.jpeg",
  alt: "Oxbridge offer success story",
};

const stories = [
  {
    src: "/success-stories/story6.jpeg",
    alt: "Student success story 1",
    caption: "A 92nd Percentile UCAT Score - 2260!",
  },

  {
    src: "/success-stories/story3.jpeg",
    alt: "Student success story 2",
    caption: "All it takes is one interview to get a medicine offer!",
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
    alt: "Student success story 9",
  },

  {
    src: "/success-stories/story10.jpeg",
    alt: "Student success story 10",
  },
];



export default function SuccessStories() {
  const [showAll, setShowAll] = useState(false);

  const initialCount = 5;
  const visibleStories = showAll ? stories : stories.slice(0, initialCount);

  return (
    <section
      id="success-stories"
      className="bg-gray-50 px-6 pt-6 pb-12 md:pt-8 md:pb-14"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Student Success Stories
          </p>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 md:text-4xl">
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
        </div>

        {/* Featured result */}
<div id="featured-result" className="mx-auto mt-8 max-w-3xl">
  <div className="relative overflow-hidden rounded-[1.75rem] border border-blue-200 bg-white p-4 shadow-[0_14px_40px_rgba(59,130,246,0.10)] md:p-5">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -left-10 top-6 h-24 w-24 rounded-full bg-blue-100/70 blur-3xl" />
      <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-yellow-100/60 blur-3xl" />
    </div>

    <div className="relative grid items-center gap-5 md:grid-cols-[0.9fr_260px]">
      <div className="max-w-md">
        <span className="inline-flex rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
          Featured Result
        </span>

        <h3 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          A UCAT score that beat 97% of test-takers.
        </h3>

        <p className="mt-3 text-sm leading-7 text-gray-600 md:text-base">
          This is one of MULTIPLE students who I have helped get a UCAT score that was within the top 5%. This particular student went from &apos;failing&apos; his UCAT mock-tests to out-competing approximately 40,000 test-takers, using my guidance and resources!
        </p>

        <div className="mt-4 inline-flex rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-800">
          Standout student result (2370 B2)
        </div>
      </div>

      <div className="mx-auto w-full max-w-[260px] rounded-[1.25rem] border border-blue-100 bg-white p-2.5 shadow-sm">
        <Image
          src={featuredStory.src}
          alt={featuredStory.alt}
          width={1200}
          height={1600}
          className="h-auto w-full rounded-[0.9rem] object-cover"
        />
      </div>
    </div>
  </div>
</div>
<Universities />
        {/* More results heading */}
        <div id="more-results" className="mt-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            More Offers & Results
          </p>

          <h3 className="mt-2 text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
            More student messages and outcomes
          </h3>
        </div>

       {/* Grid */}
<div className="mx-auto mt-6 max-w-6xl columns-1 gap-6 sm:columns-2 lg:columns-3">
  {visibleStories.map((story, index) => (
    <div
      key={index}
      className="mb-6 break-inside-avoid rounded-3xl border border-gray-200 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <Image
        src={story.src}
        alt={story.alt}
        width={900}
        height={1200}
        className="h-auto w-full rounded-2xl object-contain"
      />

      {story.caption && (
        <p className="mt-3 text-center text-sm font-semibold text-gray-700">
          {story.caption}
        </p>
      )}
    </div>
  ))}
</div>

        {/* View More button */}
        {!showAll && stories.length > initialCount && (
          <div className="mt-7 flex justify-center">
            <button
              onClick={() => setShowAll(true)}
              className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              View More Success Stories
            </button>
          </div>
        )}
      </div>
    </section>
  );
}