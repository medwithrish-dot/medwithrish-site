import ScrollIndicator from "./ScrollIndicator";

export default function TopBanner() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white">

      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="absolute right-[-120px] top-[-40px] h-80 w-80 rounded-full bg-fuchsia-300/20 blur-3xl" />
        <div className="absolute bottom-[-120px] left-1/3 h-72 w-72 rounded-full bg-indigo-200/10 blur-3xl" />

        <div className="absolute right-[-180px] top-[-30px] h-[360px] w-[760px] rotate-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent blur-2xl" />
        <div className="absolute right-[-120px] top-20 h-[220px] w-[560px] rotate-[-20deg] bg-gradient-to-r from-transparent via-cyan-100/20 to-transparent blur-xl" />

        <div className="absolute right-20 top-16 h-2 w-2 rounded-full bg-white/40" />
        <div className="absolute right-32 top-28 h-1.5 w-1.5 rounded-full bg-white/30" />
        <div className="absolute right-48 top-20 h-1 w-1 rounded-full bg-white/35" />
        <div className="absolute right-24 bottom-16 h-2 w-2 rounded-full bg-white/25" />
        <div className="absolute right-56 bottom-24 h-1.5 w-1.5 rounded-full bg-white/25" />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-white/20" />

      {/* Main Content */}
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 pt-10 pb-6 text-center md:pt-12 md:pb-8">

        {/* Badge */}
        <span className="mb-4 rounded-full bg-yellow-300 px-5 py-1.5 text-xs font-extrabold tracking-wide text-blue-950 shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
          MOST POPULAR RESOURCES
        </span>

        {/* Headline */}
        <h2 className="max-w-4xl text-2xl font-extrabold leading-tight tracking-tight md:text-4xl">
          UCAT Notes +{" "}
          <span className="text-yellow-300">FREE</span>{" "}
          Medicine Interview Guide
        </h2>

        {/* Subtext */}
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/92 md:text-base">
          Everything you need to ace the UCAT + a FREE 20-page Medicine interview guide.
  
        </p>

        {/* Buttons */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">

          <a
            href="https://payhip.com/Medwithrish"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white px-7 py-3 text-base font-bold text-blue-700 shadow transition hover:-translate-y-0.5"
          >
            View UCAT Notes
          </a>

          <a
            href="https://payhip.com/Medwithrish"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-yellow-300 px-7 py-3 text-base font-extrabold text-blue-950 shadow-[0_12px_30px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:bg-yellow-200"
          >
            Get FREE Guide
          </a>

        </div>

        {/* Credibility Line */}
        <p className="mt-4 text-xs text-white/80">
          Trusted by <strong>350+</strong> students receiving medical/dental school offers.
        </p>

        {/* Scroll Arrow */}
        <a href="#success-stories" aria-label="See student success stories" className="mt-4 inline-flex">
          <ScrollIndicator />
        </a>

      </div>
    </section>
  );
}
