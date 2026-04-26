"use client";

import Link from "next/link";
import { useState } from "react";

const navItems: {
  label: string;
  href?: string;
  bold?: boolean;
  special?: boolean;
  items?: { label: string; href: string; external?: boolean }[];
}[] = [
  { label: "Journey", href: "#journey", bold: true },

  {
    label: "UCAT",
    items: [
      { label: "UCAT Notes", href: "https://payhip.com/Medwithrish", external: true },
      { label: "UCAT Prep Timeline", href: "/ucat-timeline" },
      { label: "UCAT Tutoring", href: "/ucat-tutoring" },
      {
  label: "Free UCAT Score Tracker",
  href:"/ucat-score-tracker"
}
    ],
  },

  {
    label: "Personal Statements",
    items: [
      { label: "Personal Statements Guide", href: "/personal-statements-guide" },
      { label: "1-to-1 Personal Statement Session", href: "/personal-statement-session" },
      { label: "Medicine Personal Statement Review", href:"/?stage=05&scroll=ps-submission#journey" },
       { label: "Dental Personal Statement Review", href:"/?stage=05&scroll=ps-submission#journey" },
    ],
  },

  {
    label: "Interviews",
    items: [
      { label: "FREE Medicine Interview Guide", href: "https://payhip.com/Medwithrish", external: true },
      { label: "Medicine/Dentistry Interview Tutoring", href: "/interview-tutoring" },
    ],
  },

  {
    label: "GCSE & A-Levels",
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
      { label: "Notes", href: "https://payhip.com/Medwithrish" },
    ],
  },

  { label: "PhloemAI", href: "/rishbot-tutor", special: true },
  { label: "Contact", href: "/contact" },
];

function Chevron() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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
      <div aria-hidden="true" className="h-[49px]" />

      <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1">
          <Link href="/" className="text-lg font-bold tracking-wide text-gray-900">
            MedWithRish
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium lg:flex">
            {navItems.map((item) => {
              if (item.items) {
                return (
                  <div key={item.label} className="group relative">
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="flex items-center gap-1.5 text-gray-700 transition hover:text-blue-600"
                      >
                        <span>{item.label}</span>
                        <span className="transition-transform duration-200 group-hover:rotate-180">
                          <Chevron />
                        </span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="flex cursor-pointer items-center gap-1.5 text-gray-700 transition hover:text-blue-600"
                      >
                        <span>{item.label}</span>
                        <span className="transition-transform duration-200 group-hover:rotate-180">
                          <Chevron />
                        </span>
                      </button>
                    )}

                    <div className="invisible absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-2 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
                      {item.items.map((subItem) =>
                        subItem.external ? (
                          <a
                            key={subItem.label}
                            href={subItem.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                          >
                            {subItem.label}
                          </a>
                        ) : (
                         <Link
  key={subItem.label}
  href={subItem.href}
  scroll={true}
  replace={false}
  className="block rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
>
  {subItem.label}
</Link>
                        )
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href || "#"}
                  className={
                    item.special
                      ? "rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:from-cyan-400 hover:to-blue-500"
                      : item.bold
                      ? "font-semibold text-gray-900 transition hover:text-blue-600"
                      : "text-gray-700 transition hover:text-blue-600"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 lg:hidden"
            aria-label="Open navigation menu"
          >
            <div className="space-y-1.5">
              <span className="block h-0.5 w-5 bg-gray-700" />
              <span className="block h-0.5 w-5 bg-gray-700" />
              <span className="block h-0.5 w-5 bg-gray-700" />
            </div>
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-gray-200 bg-white px-6 py-4 lg:hidden">
            <div className="space-y-2">
              {navItems.map((item) => {
                if (item.items) {
                  const isOpen = openMobileDropdown === item.label;

                  return (
                    <div key={item.label} className="rounded-2xl border border-gray-200 bg-gray-50">
                      <button
                        type="button"
                        onClick={() => setOpenMobileDropdown(isOpen ? null : item.label)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-gray-800"
                      >
                        <span>{item.label}</span>
                        <span className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                          <Chevron />
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-2 pb-2">
                          {item.href && (
                            <Link
                              href={item.href}
                              className="block rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
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
                                className="block rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                              >
                                {subItem.label}
                              </a>
                            ) : (
                             <Link
  key={subItem.label}
  href={subItem.href}
  scroll={true}
  replace={false}
  className="block rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
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

                return (
                  <Link
                    key={item.label}
                    href={item.href || "#"}
                    className={
                      item.special
                        ? "block rounded-xl px-4 py-3 text-sm font-semibold text-cyan-600 bg-cyan-50 border border-cyan-200"
                        : item.bold
                        ? "block rounded-xl px-4 py-3 text-sm font-semibold text-gray-900"
                        : "block rounded-xl px-4 py-3 text-sm font-medium text-gray-700"
                    }
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
  );}