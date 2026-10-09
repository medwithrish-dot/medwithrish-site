import Image from "next/image";
import Link from "next/link";
import SocialLinks from "./SocialLinks";
import Reveal from "./Reveal";

export default function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden bg-transparent px-6 py-8 md:py-12 -mt-6 md:-mt-8">
      <Reveal className="relative mx-auto max-w-6xl">
        <div className="grid items-center gap-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:grid-cols-[240px_1fr] md:p-8">
          {/* Image */}
          <div className="flex justify-center md:justify-start">
            <Image
              src="/rish-profile.jpg"
              alt="Rishoo from MedWithRish"
              width={220}
              height={220}
              className="h-[220px] w-[220px] rounded-2xl object-cover shadow-sm"
            />
          </div>

          {/* Text */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              FOUNDER - MEDWITHRISH
            </p>

            <h2 className="mt-3 max-w-3xl text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Helping students succeed in UCAT, interviews, and competitive applications.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
              I create structured revision resources, practical study support,
              and high-value guidance to help students move closer to medicine
              and other ambitious career goals.
              <br />
              Need to contact me? Send an email to{" "}
              <a href="mailto:medwithrish@gmail.com" className="font-semibold text-blue-600 hover:underline">
                medwithrish@gmail.com
              </a>
              . Or find my official socials below.
            </p>

            <div className="mt-5">
              <SocialLinks />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/resources"
                className="rounded-full bg-slate-900 px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800"
              >
                Explore Resources
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
