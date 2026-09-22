"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgePoundSterling,
  BookOpen,
  Brain,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  GraduationCap,
  Home,
  Menu,
  MessageSquare,
  PlayCircle,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";

type LandingNavItem = {
  label: string;
  href?: string;
  icon: typeof Home;
  active?: boolean;
  badge?: string;
  external?: boolean;
};

const landingSections: Array<{
  label: string;
  items: LandingNavItem[];
}> = [
  {
    label: "UCAT preparation",
    items: [
      {
        label: "UCAT overview",
        href: "/phloemai/ucat",
        icon: Home,
        active: true,
      },
      {
        label: "Launch platform",
        href: "/phloemai/ucat/dashboard",
        icon: Brain,
      },
      {
        label: "Try the live demo",
        href: "/phloemai/ucat/ucat-demo",
        icon: PlayCircle,
      },
    ],
  },
  {
    label: "PhloemAI",
    items: [
      {
        label: "Medicine interviews",
        href: "/phloemai/interview/dashboard",
        icon: MessageSquare,
        badge: "Preview",
      },
      {
        label: "Dentistry interviews",
        icon: Stethoscope,
        badge: "Soon",
      },
      {
        label: "Pricing",
        href: "/phloemai/pricing",
        icon: BadgePoundSterling,
      },
    ],
  },
  {
    label: "MedWithRish",
    items: [
      { label: "Main website", href: "https://www.medwithrish.com", icon: GraduationCap, external: true },
      { label: "Free resources", href: "https://www.medwithrish.com/resources", icon: BookOpen, external: true },
      { label: "Contact & support", href: "https://www.medwithrish.com/contact", icon: CircleHelp, external: true },
    ],
  },
];

function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="h-10 w-10 shrink-0 rounded-xl bg-cover bg-center bg-no-repeat shadow-sm ring-1 ring-white/10"
      style={{ backgroundImage: "url('/favicon.ico')" }}
    />
  );
}

function LandingSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex min-h-full flex-col">
      <Link
        href="/phloemai/ucat"
        onClick={onNavigate}
        className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-2.5 transition-colors hover:bg-white/[0.09]"
      >
        <BrandMark />
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-black tracking-tight text-white">
            Phloem<span className="text-[#78ddd7]">AI</span>
          </span>
          <span className="block text-[11px] font-semibold text-slate-400">
            by MedWithRish
          </span>
        </span>
        <ChevronRight
          className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-[#78ddd7]"
          aria-hidden="true"
        />
      </Link>

      <div className="mt-7 space-y-7">
        {landingSections.map((section) => (
          <section key={section.label} aria-labelledby={`landing-nav-${section.label.replaceAll(" ", "-").toLowerCase()}`}>
            <h2
              id={`landing-nav-${section.label.replaceAll(" ", "-").toLowerCase()}`}
              className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500"
            >
              {section.label}
            </h2>
            <div className="mt-2 space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const content = (
                  <>
                    <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full border border-white/10 bg-white/[0.07] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                        {item.badge}
                      </span>
                    )}
                    {item.external && <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />}
                  </>
                );
                const className = `flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${
                  item.active
                    ? "bg-white/[0.09] text-[#8be5df] ring-1 ring-white/[0.06]"
                    : item.href
                      ? "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                      : "cursor-default text-slate-600"
                }`;

                return item.href ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={item.active ? "page" : undefined}
                    className={className}
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={item.label} aria-disabled="true" className={className}>
                    {content}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-auto pt-8">
        <div className="rounded-2xl border border-[#19544f] bg-[#0b3431] p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#123f3b] text-[#8be5df]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm font-bold text-white">Ready to see what costs you marks?</p>
          <p className="mt-1.5 text-xs leading-5 text-slate-400">
            Start with the free UCAT diagnostic. No card needed.
          </p>
          <Link
            href="/phloemai/ucat/dashboard"
            onClick={onNavigate}
            className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl bg-[#1aa0a5] text-xs font-bold text-white transition-colors hover:bg-[#21b2b6]"
          >
            Start free <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 px-1 text-[10px] font-semibold text-slate-500">
          <Link href="/privacy-policy" onClick={onNavigate} className="hover:text-slate-300">Privacy</Link>
          <Link href="/terms-and-conditions" onClick={onNavigate} className="hover:text-slate-300">Terms</Link>
          <Link href="/phloemai-disclaimer" onClick={onNavigate} className="hover:text-slate-300">AI disclaimer</Link>
        </div>
      </div>
    </div>
  );
}

export function PhloemAILandingShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-white text-slate-950 lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <a
        href="#ucat-landing-content"
        className="sr-only z-[80] rounded-lg bg-white px-4 py-3 font-bold text-[#08787b] focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to page content
      </a>

      <aside className="hidden h-[100dvh] overflow-y-auto border-r border-[#0d403b] bg-[#042724] px-4 py-5 text-slate-100 lg:sticky lg:top-0 lg:block">
        <LandingSidebarContent />
      </aside>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-[#042724]/95 px-4 text-white backdrop-blur lg:hidden">
        <Link href="/phloemai/ucat" className="flex items-center gap-2.5" aria-label="PhloemAI UCAT home">
          <BrandMark />
          <span>
            <span className="block text-base font-black leading-none">
              Phloem<span className="text-[#78ddd7]">AI</span>
            </span>
            <span className="mt-1 block text-[10px] font-semibold text-slate-400">UCAT preparation</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-100"
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
          aria-controls="phloem-landing-mobile-nav"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
          />
          <aside
            id="phloem-landing-mobile-nav"
            aria-label="PhloemAI navigation"
            className="absolute inset-y-0 left-0 w-[min(88vw,320px)] overflow-y-auto border-r border-[#0d403b] bg-[#042724] px-4 py-5 text-slate-100 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.07] text-slate-300 hover:text-white"
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            <LandingSidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <main id="ucat-landing-content" className="min-w-0">
        {children}
      </main>
    </div>
  );
}
