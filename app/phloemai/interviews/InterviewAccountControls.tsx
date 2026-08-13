"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import {
  Bell,
  Bookmark,
  ChevronDown,
  LogOut,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import {
  createClient as createSupabaseClient,
  hasSupabaseConfig,
} from "@/utils/supabase/client";

function getUserName(user: User | null) {
  const metadataName =
    typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user?.user_metadata?.name === "string"
        ? user.user_metadata.name
        : "";

  return metadataName || user?.email?.split("@")[0] || "Rishoo";
}

export function InterviewAccountControls() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const supabaseReady = hasSupabaseConfig();
  const supabase = useMemo(
    () => (supabaseReady ? createSupabaseClient() : null),
    [supabaseReady]
  );

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;
    const client = supabase;

    async function loadSession() {
      const {
        data: { session },
      } = await client.auth.getSession();

      if (mounted) setUser(session?.user ?? null);
    }

    void loadSession();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const displayName = getUserName(user);
  const firstName = displayName.split(" ")[0] || "Rishoo";
  const initial = firstName.charAt(0).toUpperCase() || "R";
  const email = user?.email ?? "Account settings";

  const handleLogout = async () => {
    if (!supabase) {
      window.location.assign("/phloemai");
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
    window.location.assign("/phloemai");
  };

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        aria-label="Notifications"
        className="rounded-lg p-2 text-slate-700 transition-colors hover:bg-white hover:text-[#08787b]"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
      </button>
      <div className="hidden h-8 w-px bg-slate-200 sm:block" />
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-1 transition-colors hover:border-[#cfe0df] hover:bg-white"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d6eeee] text-sm font-bold text-[#08787b]">
            {initial}
          </div>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-bold leading-4 text-[#071923]">
              {firstName}
            </span>
            <span className="mt-1 block text-[11px] font-bold uppercase tracking-wide text-[#6f8792]">
              Premium plan
            </span>
          </span>
          <ChevronDown className="h-4 w-4 text-[#4a6370]" aria-hidden="true" />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 z-20 mt-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[#d8e0e6] bg-white shadow-xl"
          >
            <div className="bg-[#042724] p-4 text-white">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-lg font-bold ring-1 ring-white/20">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold">{displayName}</p>
                  <p className="mt-1 truncate text-xs font-semibold text-slate-300">
                    {email}
                  </p>
                  <span className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#8be5df] ring-1 ring-white/20">
                    Premium plan
                  </span>
                </div>
              </div>
            </div>
            <div className="p-2">
              <Link
                href="/phloemai/account"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-[#f4f8f8] hover:text-[#08787b]"
                role="menuitem"
              >
                <UserRound className="h-4 w-4" aria-hidden="true" />
                Account settings
              </Link>
              <Link
                href="/phloemai/pricing"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-[#f4f8f8] hover:text-[#08787b]"
                role="menuitem"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Manage plan
              </Link>
              <Link
                href="/phloemai/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-[#f4f8f8] hover:text-[#08787b]"
                role="menuitem"
              >
                <Target className="h-4 w-4" aria-hidden="true" />
                UCAT dashboard
              </Link>
              <Link
                href="/phloemai/report"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-[#f4f8f8] hover:text-[#08787b]"
                role="menuitem"
              >
                <Bookmark className="h-4 w-4" aria-hidden="true" />
                Reports
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-3 rounded-lg border-t border-slate-100 px-3 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50"
                role="menuitem"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Log out
              </button>
            </div>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white hover:text-red-600"
        aria-label="Log out"
      >
        <LogOut className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
