"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Brain,
  ChevronDown,
  MessageSquare,
} from "lucide-react";

const switchItems = [
  {
    label: "UCAT",
    eyebrow: "Question bank and mocks",
    href: "/phloemai/dashboard",
    icon: Brain,
    current: false,
  },
  {
    label: "Med Interviews",
    eyebrow: "Current workspace",
    href: "/phloemai/interviews",
    icon: MessageSquare,
    current: true,
  },
] as const;

export function InterviewAreaSwitcher() {
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (!closeTimerRef.current) return;
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const openMenu = () => {
    clearCloseTimer();
    setOpen(true);
  };

  const closeSoon = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, 180);
  };

  useEffect(() => clearCloseTimer, []);

  return (
    <div
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={closeSoon}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        onFocus={openMenu}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        aria-label="Switch PhloemAI area"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="interview-area-switcher"
        className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-[#0b3431] px-2.5 py-2.5 text-left shadow-sm transition-colors hover:border-teal-300/40 hover:bg-[#123f3b] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#123f3b] text-xs font-bold text-white">
          MWR
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-lg font-bold text-white">
            Phloem<span className="text-[#8be5df]">AI</span>
          </span>
          <span className="mt-0.5 block truncate text-xs font-semibold text-slate-300">
            Med Interviews
          </span>
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0f4a45] text-[#86e6e1] ring-1 ring-white/10 transition-colors group-hover:bg-[#1aa0a5] group-hover:text-white">
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
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
          {switchItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                role="menuitem"
                aria-current={item.current ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                  item.current
                    ? "bg-[#edf7f6] text-[#08787b]"
                    : "text-slate-700 hover:bg-[#f4f8f8] hover:text-[#08787b]"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    item.current
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
