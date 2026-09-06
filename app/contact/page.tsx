import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact MedWithRish | MedWithRish",
  description: "Contact Rish about UCAT tutoring, interviews, personal statement reviews and admissions resources.",
  alternates: { canonical: "/contact" },
};

import Image from "next/image";
import Link from "next/link";
import SocialLinks from "@/components/SocialLinks";
const leftStories = [
  "/success-stories/story1.jpeg",
  "/success-stories/story2.jpeg",
  "/success-stories/story3.jpeg",
  "/success-stories/story4.jpeg",
];

const rightStories = [
  "/success-stories/story5.jpeg",
  "/success-stories/story6.jpeg",
  "/success-stories/story7.jpeg",
  "/success-stories/story8.jpeg",
];

function StoryGrid({ images }: { images: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {images.map((src, index) => (
        <div
          key={src}
          className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-sm"
        >
          <Image
            src={src}
            alt={`Student success story ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 1023px) calc((100vw - 110px) / 2), 142px"
          />
        </div>
      ))}
    </div>
  );
}

export default function ContactPage() {
  return (
    <main className="bg-[#f7fafe] px-6 pb-14 pt-8 md:pb-16 md:pt-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
        >
          ← Back to homepage
        </Link>

        <section className="mt-8 rounded-[2.5rem] border border-gray-200 bg-white p-6 shadow-sm md:p-10">
          <div className="grid gap-8 lg:grid-cols-[300px_1fr_300px] lg:items-center">
            <div className="hidden lg:block">
              <StoryGrid images={leftStories} />
            </div>

            <div className="text-center">
              <div className="mx-auto mb-5 h-28 w-28 overflow-hidden rounded-full border-4 border-blue-100 bg-gray-100 shadow-sm">
                <Image
                  src="/rish-profile.jpg"
                  alt="Rish profile photo"
                  width={112}
                  height={112}
                  className="h-full w-full object-cover"
                  preload
                />
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                Founder - MedWithRish
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
                Get in touch
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-gray-600 md:text-lg">
                For enquiries about UCAT tutoring, interviews, personal statement
                reviews, resources, or collaborations, email me directly.
              </p>

              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=medwithrish@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mx-auto mt-7 inline-flex justify-center rounded-2xl border border-blue-200 bg-white px-6 py-4 text-sm font-bold text-blue-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-50"
              >
                medwithrish@gmail.com
              </a>

              <p className="mt-3 text-xs font-medium text-gray-400">
                Prefer WhatsApp/text?{" "}
                <a
                  href="tel:+447305422619"
                  className="font-semibold text-gray-500 transition hover:text-blue-600"
                >
                  +44 7305 422619
                </a>
              </p>

<div className="mt-6 flex justify-center">
  <SocialLinks />
</div>
             
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/resources"
                  className="inline-flex justify-center rounded-2xl bg-gray-950 px-6 py-4 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  View Resources
                </Link>

                <Link
                  href="/"
                  className="inline-flex justify-center rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm font-bold text-gray-800 transition hover:border-blue-300 hover:text-blue-700"
                >
                  Back to Homepage
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <StoryGrid images={rightStories} />
            </div>

            <div className="lg:hidden">
              <StoryGrid images={[...leftStories.slice(0, 2), ...rightStories.slice(0, 2)]} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
