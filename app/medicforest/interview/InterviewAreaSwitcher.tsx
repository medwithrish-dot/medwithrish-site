"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MedicForestLogo } from "../_components/MedicForestLogo";
import {
  Brain,
  ChevronDown,
  MessageSquare,
} from "lucide-react";

const interviewSwitchItems = [
  {
    area: "ucat",
    label: "UCAT",
    eyebrow: "Question bank and mocks",
    href: "/medicforest/ucat/dashboard",
    icon: Brain,
  },
  {
    area: "interviews",
    label: "Med Interviews",
    eyebrow: "Current workspace",
    href: "/medicforest/interview/dashboard",
    icon: MessageSquare,
  },
] as const;

export function InterviewAreaSwitcher({
  area = "interviews",
}: {
  area?: "admissions" | "interviews";
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (!closeTimerRef.current) return;
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const openSwitcher = () => {
    clearCloseTimer();
    setOpen(true);
  };

  const closeSwitcherSoon = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, 180);
  };

  useEffect(() => clearCloseTimer, []);

  if (area === "admissions") {
    return (
      <div
        data-medicforest-static-brand
        className="flex w-full items-center rounded-xl border border-white/10 bg-[#0b3431] px-2.5 py-2 shadow-sm"
      >
        <MedicForestLogo className="h-9 w-[136px]" onDark />
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={openSwitcher}
      onMouseLeave={closeSwitcherSoon}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          clearCloseTimer();
          setOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          triggerRef.current?.focus();
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        onFocus={openSwitcher}
        aria-label="Switch MedicForest area"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="interview-area-switcher"
        className="group flex w-full cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-[#0b3431] px-2 py-2 text-left shadow-sm transition-colors hover:border-teal-300/40 hover:bg-[#123f3b] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
      >
        <span className="min-w-0 flex-1">
          <MedicForestLogo className="h-8.5 w-[122px]" onDark />
        </span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0f4a45] text-[#86e6e1] ring-1 ring-white/10 transition-colors group-hover:bg-[#1aa0a5] group-hover:text-white">
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </span>
      </button>

      {open && (
        <div
          id="interview-area-switcher"
          role="menu"
          className="absolute left-0 z-30 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
        >
          {interviewSwitchItems.map((item) => {
            const Icon = item.icon;
            const current = item.area === area;
            return (
              <Link
                key={item.label}
                href={item.href}
                role="menuitem"
                aria-current={current ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                  current
                    ? "bg-[#edf7f6] text-[#08787b]"
                    : "text-slate-700 hover:bg-[#f4f8f8] hover:text-[#08787b]"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    current
                      ? "bg-white text-[#08787b]"
                      : "bg-[#edf7f6] text-[#4a6370]"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">
                    {item.eyebrow}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
