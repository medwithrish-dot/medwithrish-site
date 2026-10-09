"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import Link from "@/app/medicforest/_components/MedicForestLink";
import {
  Bell,
  Bookmark,
  ChevronDown,
  HelpCircle,
  LogOut,
  Settings,
  Sparkles,
  Target,
} from "lucide-react";
import {
  createClient as createSupabaseClient,
  hasSupabaseConfig,
} from "@/utils/supabase/client";

function getUserName(user: User | null, profileName: string | null) {
  if (profileName?.trim()) return profileName.trim();

  const metadataName =
    typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : typeof user?.user_metadata?.name === "string"
        ? user.user_metadata.name.trim()
        : "";

  return metadataName || user?.email?.split("@")[0] || "Guest";
}

export function InterviewAccountControls() {
  const [user, setUser] = useState<User | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [profileResult, setProfileResult] = useState<{
    userId: string;
    name: string | null;
    plan: string;
  } | null>(null);
  const [signOutError, setSignOutError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const supabaseReady = hasSupabaseConfig();
  const supabase = useMemo(
    () => (supabaseReady ? createSupabaseClient() : null),
    [supabaseReady]
  );

  useEffect(() => {
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setSessionReady(true);
      if (event === "SIGNED_OUT") {
        setProfileResult(null);
        setMenuOpen(false);
        setSignOutError("");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const userId = user?.id;
  useEffect(() => {
    if (!supabase || !userId) return;

    let active = true;
    void supabase
      .from("profiles")
      .select("full_name,current_plan")
      .eq("id", userId)
      .maybeSingle()
      .then(
        ({ data }) => {
          if (active) {
            setProfileResult({
              userId,
              name: typeof data?.full_name === "string" ? data.full_name : null,
              plan: data?.current_plan === "premium" ? "Premium plan" : "Free plan",
            });
          }
        },
        () => {
          if (active) {
            setProfileResult({ userId, name: null, plan: "Free plan" });
          }
        }
      );

    return () => {
      active = false;
    };
  }, [supabase, userId]);

  const profile = profileResult?.userId === user?.id ? profileResult : null;
  const displayName = getUserName(user, profile?.name ?? null);
  const firstName = displayName.split(" ")[0] || "Guest";
  const initial = firstName.charAt(0).toUpperCase() || "R";
  const email = user?.email ?? "Account settings";
  const plan = profile?.plan ?? "Checking plan…";

  const handleLogout = async () => {
    if (!supabase) return;
    setSignOutError("");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch {
      setSignOutError("Could not log out. Please try again.");
      return;
    }
    // A full navigation clears Med interview state and previously cached account pages.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/medicforest");
  };

  if (supabase && !sessionReady) return <span className="text-sm text-slate-500">Loading account…</span>;
  if (!user) return <Link href="/medicforest/account" className="inline-flex shrink-0 items-center justify-center rounded-xl border border-[#cfe0df] bg-white px-5 py-3 text-sm font-bold text-[#08787b] hover:bg-[#edf7f6]">Sign in / create account</Link>;

  return (
    <div className="flex min-w-0 items-center gap-4">
      <Link
        href="/medicforest/interview/notifications"
        aria-label="Notifications"
        className="rounded-lg p-2 text-slate-700 transition-colors hover:bg-white hover:text-[#08787b]"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
      </Link>
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
          <span className="hidden min-w-0 max-w-36 text-left sm:block">
            <span className="block truncate text-sm font-bold leading-4 text-[#071923]">
              {firstName}
            </span>
            <span className="mt-1 block text-[11px] font-bold uppercase tracking-wide text-[#6f8792]">
              {plan}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 text-[#4a6370]" aria-hidden="true" />
        </button>

        {signOutError && <p role="alert" className="mt-2 max-w-72 text-xs font-semibold text-red-600">{signOutError}</p>}

        {menuOpen && (
          <div
            role="menu"
            className="absolute -left-12 z-20 mt-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[#d8e0e6] bg-white shadow-xl sm:left-auto sm:right-0"
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
                    {plan}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-2">
              <Link
                href="/medicforest/account"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-[#f4f8f8] hover:text-[#08787b]"
                role="menuitem"
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                Settings
              </Link>
              <Link
                href="/medicforest/pricing"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-[#f4f8f8] hover:text-[#08787b]"
                role="menuitem"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Manage plan
              </Link>
              <Link
                href="/feedback"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-[#f4f8f8] hover:text-[#08787b]"
                role="menuitem"
              >
                <HelpCircle className="h-4 w-4" aria-hidden="true" />
                Feedback & Support
              </Link>
              <Link
                href="/medicforest/ucat/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-[#f4f8f8] hover:text-[#08787b]"
                role="menuitem"
              >
                <Target className="h-4 w-4" aria-hidden="true" />
                UCAT dashboard
              </Link>
              <Link
                href="/medicforest/interview/reports"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-[#f4f8f8] hover:text-[#08787b]"
                role="menuitem"
              >
                <Bookmark className="h-4 w-4" aria-hidden="true" />
                Med Interview reports
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
