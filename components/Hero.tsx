import Image from "next/image";
import Link from "next/link";
import SocialLinks from "./SocialLinks";
import Reveal from "./Reveal";

export default function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-[#e9f0f8] via-[#edf3fa] to-[#e5eef7] px-6 py-8 md:py-12 -mt-10 md:-mt-14">

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute top-0 left-[-150px] h-[400px] w-[400px] rounded-full bg-blue-200/30 blur-3xl" />

        <div className="absolute bottom-[-100px] right-[-150px] h-[400px] w-[400px] rounded-full bg-indigo-200/30 blur-3xl" />

      </div>

      <Reveal className="relative mx-auto max-w-6xl">

        <div className="grid items-center gap-8 rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm md:grid-cols-[280px_1fr] md:p-8">

          {/* Image */}
          <div className="flex justify-center md:justify-start">
            <Image
              src="/rish-profile.jpg"
              alt="Rish from MedWithRish"
              width={220}
              height={220}
              className="h-[220px] w-[220px] rounded-[2rem] object-cover shadow-md"
            />
          </div>

          {/* Text */}
          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              FOUNDER - MEDWITHRISH
            </p>

            <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Helping students succeed in UCAT, interviews,
              and competitive applications.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-8 text-gray-600 md:text-lg">
              I create structured revision resources, practical study support,
              and high-value guidance to help students move closer to medicine
              and other ambitious career goals.
<br></br>
             Need to contact me? Send an email to <a href="mailto:medwithrish@gmail.com" className="font-bold text-blue-600 hover:underline">medwithrish@gmail.com</a>  
              Or below are my current, official socials.
            </p>

            <div className="mt-6">
              <SocialLinks />
            </div>

            <div className="mt-7 flex flex-wrap gap-4">

              <Link
                href="/resources"
                className="rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
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
