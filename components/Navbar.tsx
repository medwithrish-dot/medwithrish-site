"use client";

import Link from "next/link";
import { Lock, Sparkles, Trees, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { FREE_INTERVIEW_GUIDE_URL, MEDWITHRISH_NOTES_URL } from "@/utils/medwithrish/site-links";

const navItems: {
  label: string;
  href?: string;
  bold?: boolean;
  special?: boolean;
  locked?: boolean;
  badge?: string;
  external?: boolean;
  items?: { label: string; href: string; external?: boolean }[];
}[] = [
  {
    label: "UCAT",
    href: "/ucat-timeline",
    items: [
      { label: "UCAT Notes", href: MEDWITHRISH_NOTES_URL, external: true },
      { label: "UCAT Prep Timeline", href: "/ucat-timeline" },
      { label: "UCAT Tutoring", href: "/ucat-tutoring" },
      { label: "Free UCAT Score Tracker", href: "/ucat-score-tracker" },
      { label: "UCAT Mock Difficulty Spreadsheet", href: "/ucat-mock-difficulty" },
    ],
  },

  {
    label: "Personal Statements",
    href: "/personal-statements-guide",
    items: [
      { label: "Personal Statements Guide", href: "/personal-statements-guide" },
      { label: "1–to–1 Personal Statement Session", href: "/personal-statement-session" },
    ],
  },

  {
    label: "Med Interviews",
    href: "/interviews",
    badge: "NEW!",
    items: [
      { label: "Med Interview Hub", href: "/interviews" },
      { label: "FREE Medicine Interview Guide", href: FREE_INTERVIEW_GUIDE_URL, external: true },
      { label: "1–to–1 Med Interview Tutoring", href: "/interview-tutoring" },
    ],
  },

  {
    label: "GCSE & A–Levels",
    href: "/resources",
    items: [
            { label: "A-Level Tutoring", href: "/alevel-tutoring" },
      { label: "GCSE Revision Guide", href: "/gcse-revision-guide" },
      { label: "GCSE Tutoring", href: "/gcse-tutoring" },
      { label: "Year 12 Guide", href: "/year12-guide" },
    ],
  },

  {
    label: "Resources",
    href: "/resources",
    items: [
      { label: "All Guides", href: "/resources" },
      { label: "Notes", href: MEDWITHRISH_NOTES_URL, external: true },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms and Conditions", href: "/terms-and-conditions" },
      { label: "MedicForest AI/Data Disclaimer", href: "/medicforest-disclaimer" },
    ],
  },

  { label: "MedicForest", href: "https://medicforest.com", special: true, external: true },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function Chevron() {
  return (
    <svg
      className="ml-0.5 h-3 w-3 text-slate-400 transition-transform duration-200 group-hover:text-blue-600 group-hover:rotate-180"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);

  return (
    <>
      <div aria-hidden="true" className="h-[60px]" />

      <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-[0_1px_8px_rgba(15,23,42,0.03)] transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-2">
          <Link
            href="/"
            className="text-[17px] font-bold tracking-tight text-slate-900 transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
          >
            MedWithRish
          </Link>

          <nav className="hidden items-center gap-1 text-sm font-medium xl:flex">
            {navItems.map((item) => {
              if (item.items) {
                return (
                  <div key={item.label} className="group relative">
                    <Link
                      href={item.href ?? item.items[0].href}
                      className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[13.5px] font-medium text-slate-700 transition-all hover:bg-slate-100/90 hover:text-blue-700"
                    >
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-2xs">
                          <Sparkles className="h-2.5 w-2.5" />
                          <span>{item.badge}</span>
                        </span>
                      )}
                      <Chevron />
                    </Link>

                    <div className="invisible absolute left-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-slate-200/90 bg-white/98 p-1.5 opacity-0 shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur-md transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                      {item.items.map((subItem) =>
                        subItem.external ? (
                          <a
                            key={subItem.label}
                            href={subItem.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between rounded-lg px-3 py-2 text-[13px] font-medium text-slate-700 transition-all hover:bg-blue-50/80 hover:text-blue-700"
                          >
                            <span>{subItem.label}</span>
                            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                          </a>
                        ) : (
                          <Link
                            key={subItem.label}
                            href={subItem.href}
                            className="block rounded-lg px-3 py-2 text-[13px] font-medium text-slate-700 transition-all hover:bg-blue-50/80 hover:text-blue-700"
                          >
                            {subItem.label}
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                );
              }

              if (item.locked) {
                return (
                  <button
                    key={item.label}
                    type="button"
                    disabled
                    aria-label={`${item.label} is a work in progress. Stay tuned.`}
                    title={`${item.label} is a work in progress. Stay tuned.`}
                    className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3.5 py-1.5 text-xs font-semibold text-cyan-700 shadow-sm"
                  >
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold leading-none text-blue-700">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              }

              if (item.external) {
                return (
                  <a
                    key={item.label}
                    href={item.href || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={
                      item.special
                        ? "inline-flex items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-50 px-3.5 py-1 text-[13px] font-semibold text-emerald-800 transition-all hover:bg-emerald-100 hover:border-emerald-600/50 hover:text-emerald-900 active:scale-[0.98]"
                        : "rounded-full px-3 py-1.5 text-[13.5px] font-medium text-slate-700 transition-all hover:bg-slate-100/90 hover:text-blue-700"
                    }
                  >
                    {item.special && <Trees className="h-3.5 w-3.5 text-emerald-600" />}
                    <span>{item.label}</span>
                    {item.special && <ArrowUpRight className="h-3 w-3 text-emerald-500" />}
                  </a>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href || "#"}
                  className="rounded-full px-3 py-1.5 text-[13.5px] font-medium text-slate-700 transition-all hover:bg-slate-100/90 hover:text-blue-700"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 transition xl:hidden"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            <div className="space-y-1.5">
              <span className="block h-0.5 w-5 bg-slate-700" />
              <span className="block h-0.5 w-5 bg-slate-700" />
              <span className="block h-0.5 w-5 bg-slate-700" />
            </div>
          </button>
        </div>

        {mobileOpen && (
          <div
            id="mobile-navigation"
            role="navigation"
            aria-label="Mobile navigation"
            className="max-h-[calc(100dvh-64px)] overflow-y-auto border-t border-slate-200/90 bg-white/95 px-6 py-4 backdrop-blur-xl shadow-xl xl:hidden"
            onClick={(event) => {
              if (event.target instanceof Element && event.target.closest("a[href]")) {
                setMobileOpen(false);
                setOpenMobileDropdown(null);
              }
            }}
          >
            <div className="space-y-2.5">
              {navItems.map((item) => {
                if (item.items) {
                  const isOpen = openMobileDropdown === item.label;

                  return (
                    <div key={item.label} className="rounded-2xl border border-slate-200/80 bg-slate-50/70">
                      <button
                        type="button"
                        onClick={() => setOpenMobileDropdown(isOpen ? null : item.label)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-800"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-2xs">
                              <Sparkles className="h-2.5 w-2.5" />
                              <span>{item.badge}</span>
                            </span>
                          )}
                        </span>
                        <span className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                          <Chevron />
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-2 pb-2 space-y-1">
                          {item.href && (
                            <Link
                              href={item.href}
                              className="block rounded-xl px-3.5 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50/80"
                            >
                              {item.label} Overview
                            </Link>
                          )}

                          {item.items.map((subItem) =>
                            subItem.external ? (
                              <a
                                key={subItem.label}
                                href={subItem.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between rounded-xl px-3.5 py-2 text-sm text-slate-700 hover:bg-blue-50/80 hover:text-blue-700"
                              >
                                <span>{subItem.label}</span>
                                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                              </a>
                            ) : (
                              <Link
                                key={subItem.label}
                                href={subItem.href}
                                className="block rounded-xl px-3.5 py-2 text-sm text-slate-700 hover:bg-blue-50/80 hover:text-blue-700"
                              >
                                {subItem.label}
                              </Link>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                if (item.locked) {
                  return (
                    <button
                      key={item.label}
                      type="button"
                      disabled
                      aria-label={`${item.label} is a work in progress. Stay tuned.`}
                      className="flex w-full cursor-not-allowed items-center justify-between rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-700"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Lock className="h-4 w-4" aria-hidden="true" />
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold leading-none text-blue-700">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                }

                if (item.special) {
                  return (
                    <a
                      key={item.label}
                      href={item.href || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl border border-emerald-600/30 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Trees className="h-4 w-4 text-emerald-600" />
                        <span>{item.label}</span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href || "#"}
                    className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-blue-700"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
