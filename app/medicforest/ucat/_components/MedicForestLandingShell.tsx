"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  BadgePoundSterling,
  BookOpen,
  Brain,
  CircleHelp,
  ExternalLink,
  FileText,
  Home,
  Menu,
  MessageSquare,
  Sparkles,
  UserRoundCheck,
  X,
} from "lucide-react";

type LandingNavItem = {
  label: string;
  href?: string;
  icon: typeof Home;
  badge?: string;
  external?: boolean;
  italic?: boolean;
};

const landingSections: Array<{
  label: string;
  items: LandingNavItem[];
}> = [
  {
    label: "Preparation",
    items: [
      {
        label: "UCAT",
        href: "/ucat",
        icon: Brain,
      },
      {
        label: "Personal Statement",
        href: "/personal-statement",
        icon: FileText,
      },
      {
        label: "Interviews",
        href: "/interviews/dashboard",
        icon: MessageSquare,
      },
      {
        label: "1-1 Tutoring",
        href: "/tutoring",
        icon: UserRoundCheck,
        italic: true,
      },
      {
        label: "Resources",
        href: "/resources",
        icon: BookOpen,
      },
    ],
  },
  {
    label: "Support",
    items: [
      { label: "Feedback", href: "/feedback", icon: MessageSquare },
      { label: "Contact us", href: "/contact", icon: CircleHelp },
    ],
  },
];

function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm"
    >
      <Image
        src="/medicforest/medicforest-placeholder-logo.png"
        alt=""
        width={48}
        height={48}
        className="h-full w-full scale-[1.35] object-contain"
      />
    </span>
  );
}

function LandingSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const isCurrentPage = (href: string) =>
    href === "/ucat"
      ? ["/", "/ucat", "/medicforest", "/medicforest/ucat"].includes(pathname)
      : href === "/interviews/dashboard"
        ? pathname === "/interviews" ||
          pathname.startsWith("/interviews/") ||
          pathname.startsWith("/medicforest/interview/") ||
          pathname.startsWith("/medicforest/interviews/")
      : pathname === href || pathname === `/medicforest${href}`;

  return (
    <div className="flex min-h-full flex-col">
      <Link
        href="/"
        onClick={onNavigate}
        className="group flex items-center gap-3 px-2 py-1"
        aria-label="MedicForest home"
      >
        <BrandMark />
        <span className="min-w-0 flex-1">
          <span className="block text-[19px] font-bold leading-tight tracking-tight text-white transition-colors group-hover:text-[#c7fffb]">
            Medic<span className="text-[#8be5df]">Forest</span>
          </span>
          <span className="mt-0.5 block text-xs font-medium text-slate-400">
            Medical admissions
          </span>
        </span>
      </Link>

      <nav aria-label="MedicForest navigation" className="mt-8 space-y-1">
        <Link
          href="/about"
          onClick={onNavigate}
          aria-current={isCurrentPage("/about") ? "page" : undefined}
          className={`flex h-12 w-full items-center gap-4 rounded-xl px-4 text-sm font-semibold transition-colors ${
            isCurrentPage("/about")
              ? "bg-white/[0.09] text-[#8be5df] ring-1 ring-white/[0.06]"
              : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
          }`}
        >
          <Home className="h-5 w-5" aria-hidden="true" />
          <span>About</span>
        </Link>
        <Link
          href="/pricing"
          onClick={onNavigate}
          aria-current={isCurrentPage("/pricing") ? "page" : undefined}
          className={`flex h-12 w-full items-center gap-4 rounded-xl px-4 text-sm font-semibold transition-colors ${
            isCurrentPage("/pricing")
              ? "bg-white/[0.09] text-[#8be5df] ring-1 ring-white/[0.06]"
              : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
          }`}
        >
          <BadgePoundSterling className="h-5 w-5" aria-hidden="true" />
          <span>Pricing</span>
        </Link>
      </nav>

      <div className="mt-8 space-y-8">
        {landingSections.map((section) => (
          <section key={section.label} aria-labelledby={`landing-nav-${section.label.replaceAll(" ", "-").toLowerCase()}`}>
            <h2
              id={`landing-nav-${section.label.replaceAll(" ", "-").toLowerCase()}`}
              className="px-4 text-xs font-bold uppercase tracking-wide text-slate-500"
            >
              {section.label}
            </h2>
            <div className="mt-2 space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = item.href ? isCurrentPage(item.href) : false;
                const content = (
                  <>
                    <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                    <span className={`min-w-0 flex-1 truncate ${item.italic ? "italic" : ""}`}>{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full border border-white/10 bg-white/[0.07] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                        {item.badge}
                      </span>
                    )}
                    {item.external && <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />}
                  </>
                );
                const className = `flex h-12 w-full items-center gap-4 rounded-xl px-4 text-sm font-semibold transition-colors ${
                  active
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
                    aria-current={active ? "page" : undefined}
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
            href="/ucat/dashboard"
            onClick={onNavigate}
            className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl bg-[#1aa0a5] text-xs font-bold text-white transition-colors hover:bg-[#21b2b6]"
          >
            Start free <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 px-1 text-[10px] font-semibold text-slate-500">
          <Link href="/privacy-policy" onClick={onNavigate} className="hover:text-slate-300">Privacy</Link>
          <Link href="/terms-and-conditions" onClick={onNavigate} className="hover:text-slate-300">Terms</Link>
          <Link href="/medicforest-disclaimer" onClick={onNavigate} className="hover:text-slate-300">AI disclaimer</Link>
        </div>
      </div>
    </div>
  );
}

export function MedicForestLandingShell({ children }: { children: ReactNode }) {
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
    <div className="min-h-screen bg-white text-slate-950">
      <a
        href="#ucat-landing-content"
        className="sr-only z-[80] rounded-lg bg-white px-4 py-3 font-bold text-[#08787b] focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to page content
      </a>

      <aside className="hidden border-r border-[#093f3a] bg-[#042724] px-4 py-5 text-slate-100 lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-[230px] lg:overflow-y-auto lg:overscroll-contain">
        <LandingSidebarContent />
      </aside>

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-[#042724]/95 px-4 text-white backdrop-blur lg:hidden">
        <Link href="/" className="flex items-center gap-2.5" aria-label="MedicForest home">
          <BrandMark />
          <span>
            <span className="block text-base font-black leading-none">
              Medic<span className="text-[#78ddd7]">Forest</span>
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
          aria-controls="medicforest-landing-mobile-nav"
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
            id="medicforest-landing-mobile-nav"
            aria-label="MedicForest navigation"
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

      <main id="ucat-landing-content" className="medicforest-landing min-w-0 lg:ml-[230px]">
        {children}
      </main>
    </div>
  );
}
