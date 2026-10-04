"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  Lock,
  LogOut,
  Mail,
  Shield,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  createClient as createSupabaseClient,
  hasSupabaseConfig,
} from "@/utils/supabase/client";
import { MedicForestLandingShell } from "../ucat/_components/MedicForestLandingShell";

type AuthTab = "login" | "signup";

interface ProfileData {
  full_name: string | null;
  current_plan: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  diagnostic_credits: number | null;
}

export function ManageAccountClient() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth Form State
  const [authTab, setAuthTab] = useState<AuthTab>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Profile Edit State
  const [displayNameDraft, setDisplayNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameSaveMessage, setNameSaveMessage] = useState<string | null>(null);
  const [nameSaveError, setNameSaveError] = useState<string | null>(null);

  // Billing State
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const supabaseReady = hasSupabaseConfig();
  const supabase = useMemo(
    () => (supabaseReady ? createSupabaseClient() : null),
    [supabaseReady]
  );

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    async function initAuth() {
      if (!supabase) return;
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (!active) return;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await loadUserProfile(initialSession.user.id);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!active) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await loadUserProfile(newSession.user.id);
      } else {
        setProfile(null);
        setDisplayNameDraft("");
      }
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function loadUserProfile(userId: string) {
    if (!supabase) return;
    try {
      const { data } = await supabase
        .from("profiles")
        .select(
          "full_name,current_plan,stripe_customer_id,stripe_subscription_id,subscription_status,diagnostic_credits"
        )
        .eq("id", userId)
        .maybeSingle();

      if (data) {
        const profileData = data as ProfileData;
        setProfile(profileData);
        setDisplayNameDraft(profileData.full_name ?? "");
      }
    } catch {
      // Fallback
    }
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setAuthSubmitting(true);
    setAuthError(null);
    setAuthMessage(null);

    const trimmedEmail = email.trim().toLowerCase();

    try {
      if (authTab === "signup") {
        const trimmedName = fullName.trim();
        if (!trimmedName) throw new Error("Please enter your full name.");
        if (!legalAccepted) {
          throw new Error("Please accept the terms to create your account.");
        }

        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: { full_name: trimmedName },
          },
        });

        if (error) throw error;

        if (data.session) {
          setSession(data.session);
          setUser(data.user);
          setAuthMessage("Account created successfully!");
        } else {
          setAuthMessage(
            "Account created. If required, check your email to verify your account."
          );
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) throw error;

        setSession(data.session);
        setUser(data.user);
        setAuthMessage("Logged in successfully.");
      }
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : "Authentication failed."
      );
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
      router.refresh();
    } catch {
      // ignore
    }
  };

  const handleSaveDisplayName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;

    const trimmed = displayNameDraft.trim();
    if (!trimmed) {
      setNameSaveError("Display name cannot be empty.");
      return;
    }

    setSavingName(true);
    setNameSaveMessage(null);
    setNameSaveError(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: trimmed })
        .eq("id", user.id);

      if (error) throw error;

      setProfile((prev) => (prev ? { ...prev, full_name: trimmed } : null));
      setNameSaveMessage("Display name saved successfully.");
    } catch (err) {
      setNameSaveError(
        err instanceof Error ? err.message : "Could not update display name."
      );
    } finally {
      setSavingName(false);
    }
  };

  const handleManageStripeBilling = async () => {
    setPortalLoading(true);
    setPortalError(null);

    try {
      const res = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
      });
      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Could not open billing portal.");
      }

      window.location.assign(data.url);
    } catch (err) {
      setPortalError(
        err instanceof Error
          ? err.message
          : "Could not open Stripe billing portal. Please contact medwithrish@gmail.com."
      );
      setPortalLoading(false);
    }
  };

  const isPremium = profile?.current_plan === "premium";
  const hasStripeCustomer = Boolean(
    profile?.stripe_customer_id &&
      profile?.stripe_subscription_id &&
      profile?.subscription_status !== "manual"
  );

  const rawName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Student";
  const initial = rawName.charAt(0).toUpperCase();

  return (
    <MedicForestLandingShell>
      <div className="min-h-screen bg-[#f7faf9] px-5 py-10 sm:px-8 sm:py-12">
        <main className="mx-auto max-w-4xl space-y-8">
          {/* Header */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200/80 bg-white px-3 py-1 text-xs font-bold text-teal-800 shadow-2xs">
              <UserRound className="h-3.5 w-3.5 text-teal-600" />
              <span>MEDICFOREST ACCOUNT</span>
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Manage Account
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              Manage your login, subscription billing, permissions, and platform
              access across UCAT and Med Interviews.
            </p>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-8">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0c6b5e] border-t-transparent" />
                <p className="text-xs font-semibold">Loading account details…</p>
              </div>
            </div>
          ) : !user ? (
            /* ─────────────────────────────────────────────────────────────
               LOGGED OUT STATE: LOGIN & SIGN UP CARD
            ───────────────────────────────────────────────────────────── */
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs sm:p-8">
                  {/* Tabs */}
                  <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab("login");
                        setAuthError(null);
                        setAuthMessage(null);
                      }}
                      className={`rounded-lg py-2.5 text-xs sm:text-sm font-bold transition-all ${
                        authTab === "login"
                          ? "bg-white text-[#0c6b5e] shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Log In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab("signup");
                        setAuthError(null);
                        setAuthMessage(null);
                      }}
                      className={`rounded-lg py-2.5 text-xs sm:text-sm font-bold transition-all ${
                        authTab === "signup"
                          ? "bg-white text-[#0c6b5e] shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Create Account
                    </button>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
                    {authTab === "signup" && (
                      <div>
                        <label
                          htmlFor="fullName"
                          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                        >
                          Full name
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Maya Patel"
                          className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-[#f9fdfb] px-3.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                        />
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                      >
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-[#f9fdfb] px-3.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                      >
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-[#f9fdfb] px-3.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                      />
                    </div>

                    {authTab === "signup" && (
                      <div className="pt-1">
                        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                          <input
                            type="checkbox"
                            checked={legalAccepted}
                            onChange={(e) => setLegalAccepted(e.target.checked)}
                            className="mt-0.5 rounded border-slate-300 text-[#0c6b5e] focus:ring-teal-400"
                          />
                          <span>
                            I agree to the{" "}
                            <Link
                              href="/terms-and-conditions"
                              className="font-semibold text-teal-700 underline"
                            >
                              Terms &amp; Conditions
                            </Link>{" "}
                            and{" "}
                            <Link
                              href="/privacy-policy"
                              className="font-semibold text-teal-700 underline"
                            >
                              Privacy Policy
                            </Link>
                            .
                          </span>
                        </label>
                      </div>
                    )}

                    {authError && (
                      <div
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700"
                      >
                        {authError}
                      </div>
                    )}

                    {authMessage && (
                      <div className="rounded-xl border border-teal-200 bg-teal-50 p-3 text-xs font-semibold text-teal-800">
                        {authMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={authSubmitting}
                      className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-[#0c6b5e] px-4 text-sm font-bold text-white shadow-xs transition hover:bg-[#084e45] disabled:opacity-50"
                    >
                      {authSubmitting
                        ? "Processing…"
                        : authTab === "login"
                        ? "Log In to MedicForest"
                        : "Create My Account"}
                    </button>
                  </form>
                </div>
              </div>

              {/* Informational Column */}
              <div className="space-y-4 lg:col-span-5">
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs">
                  <h2 className="text-base font-bold text-slate-950">
                    One unified admissions account
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    Your MedicForest login works seamlessly across the entire
                    platform:
                  </p>
                  <ul className="mt-4 space-y-2.5 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                      <span>Full access to AI Med Interviews &amp; question stations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                      <span>UCAT Question Bank &amp; Diagnostic Mock scoring</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                      <span>Synchronised subscription billing &amp; plan upgrades</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                      <span>Personalised admissions progress tracking</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-teal-100 bg-teal-50/70 p-5 text-xs text-slate-600">
                  <div className="flex items-center gap-2 font-bold text-teal-900">
                    <Lock className="h-4 w-4 text-teal-700" />
                    <span>Secure &amp; GDPR Compliant</span>
                  </div>
                  <p className="mt-1.5 leading-relaxed text-slate-600">
                    Your personal information and interview recordings are securely encrypted and never shared with third parties.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ─────────────────────────────────────────────────────────────
               LOGGED IN STATE: FULL ACCOUNT MANAGEMENT
            ───────────────────────────────────────────────────────────── */
            <div className="space-y-6">
              {/* Profile Card Header */}
              <div className="flex flex-col gap-5 rounded-2xl border border-teal-200/80 bg-gradient-to-br from-[#0c6b5e] to-[#042724] p-6 text-white shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-black text-white ring-1 ring-white/20">
                    {initial}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-black tracking-tight">{rawName}</h2>
                      <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold text-teal-100">
                        {isPremium ? "Premium Plan" : "Free Plan"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-teal-100 font-medium sm:text-sm">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/20"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>

              {/* 2-Column Grid: Billing and Profile */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* 1. Subscription & Billing */}
                <section className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs sm:p-7">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CreditCard className="h-5 w-5 text-teal-600" />
                        <h3 className="text-base font-bold text-slate-950">
                          Subscription &amp; Billing
                        </h3>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          isPremium
                            ? "bg-teal-50 text-teal-800 ring-1 ring-teal-600/20"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {isPremium ? "Premium Active" : "Free Tier"}
                      </span>
                    </div>

                    <div className="mt-5 rounded-xl border border-slate-100 bg-[#f8faf9] p-4 text-xs">
                      <p className="font-bold text-slate-900">
                        {isPremium
                          ? "Full MedicForest Access"
                          : "Starter Admissions Access"}
                      </p>
                      <ul className="mt-2 space-y-1.5 text-slate-600">
                        {isPremium ? (
                          <>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                              <span>Unlimited AI Med interview practice stations</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                              <span>Full UCAT question bank &amp; diagnostic mocks</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                              <span>Instant rubric breakdown &amp; speech scoring</span>
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                              <span>Free Why Medicine? AI interview station</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                              <span>Free Quantitative Reasoning diagnostic</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                              <span>1 complimentary AI diagnostic feedback credit</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>

                    {portalError && (
                      <p className="mt-3 text-xs font-semibold text-red-600">
                        {portalError}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
                    {isPremium ? (
                      hasStripeCustomer ? (
                        <button
                          type="button"
                          onClick={handleManageStripeBilling}
                          disabled={portalLoading}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#0c6b5e] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#084e45] disabled:opacity-50"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>
                            {portalLoading
                              ? "Opening portal…"
                              : "Manage billing & invoices"}
                          </span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">
                          Manual Premium subscription active
                        </span>
                      )
                    ) : (
                      <Link
                        href="/medicforest/pricing"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#0c6b5e] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#084e45]"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Upgrade to Premium</span>
                      </Link>
                    )}

                    <Link
                      href="/medicforest/pricing"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-900"
                    >
                      <span>Compare plans</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </section>

                {/* 2. Profile Details & Permissions */}
                <section className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs sm:p-7">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <Shield className="h-5 w-5 text-teal-600" />
                      <h3 className="text-base font-bold text-slate-950">
                        Profile &amp; Permissions
                      </h3>
                    </div>

                    <form onSubmit={handleSaveDisplayName} className="mt-5 space-y-4">
                      <div>
                        <label
                          htmlFor="displayDraft"
                          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                        >
                          Display name
                        </label>
                        <div className="mt-1.5 flex gap-2">
                          <input
                            id="displayDraft"
                            type="text"
                            value={displayNameDraft}
                            onChange={(e) => {
                              setDisplayNameDraft(e.target.value);
                              setNameSaveMessage(null);
                              setNameSaveError(null);
                            }}
                            maxLength={70}
                            placeholder="Your full name"
                            className="h-10 flex-1 rounded-xl border border-slate-200 bg-[#f9fdfb] px-3.5 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                          />
                          <button
                            type="submit"
                            disabled={
                              savingName ||
                              !displayNameDraft.trim() ||
                              displayNameDraft.trim() === (profile?.full_name || "")
                            }
                            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {savingName ? "Saving…" : "Save"}
                          </button>
                        </div>
                        {nameSaveMessage && (
                          <p className="mt-2 text-xs font-semibold text-teal-700">
                            {nameSaveMessage}
                          </p>
                        )}
                        {nameSaveError && (
                          <p className="mt-2 text-xs font-semibold text-red-600">
                            {nameSaveError}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          Login email
                        </label>
                        <input
                          type="email"
                          readOnly
                          value={user.email}
                          className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 text-xs text-slate-600 select-all"
                        />
                        <p className="mt-1 text-[11px] text-slate-400">
                          Login email is fixed for your account credentials.
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-[#f8faf9] p-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            Role &amp; Permissions
                          </span>
                          <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-800">
                            Verified Candidate
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Standard applicant permissions: practice recordings, interview scoring, study plan saves.
                        </p>
                      </div>
                    </form>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
                    <a
                      href="mailto:medwithrish@gmail.com?subject=MedicForest%20Account%20Data%20Request"
                      className="font-semibold text-slate-600 hover:text-teal-800 hover:underline"
                    >
                      Request account data
                    </a>
                    <span className="text-slate-300">·</span>
                    <a
                      href="mailto:medwithrish@gmail.com?subject=MedicForest%20Account%20Deletion%20Request"
                      className="font-semibold text-slate-600 hover:text-red-700 hover:underline"
                    >
                      Delete account enquiry
                    </a>
                  </div>
                </section>
              </div>

              {/* 3. Platform Quick Jumps */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs sm:p-7">
                <h3 className="text-base font-bold text-slate-950">
                  Quick Access Areas
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Jump directly into your preparation tools and reports:
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Link
                    href="/interviews"
                    className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-[#f8faf9] p-4 transition hover:border-teal-300 hover:bg-white hover:shadow-2xs"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                        Interviews
                      </p>
                      <h4 className="mt-1 text-sm font-bold text-slate-950">
                        AI Med Interviews
                      </h4>
                      <p className="mt-1 text-[11px] text-slate-500">
                        MMI &amp; panel stations with instant voice feedback
                      </p>
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-teal-700 group-hover:underline">
                      <span>Open Interviews</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </Link>

                  <Link
                    href="/medicforest/interview/reports"
                    className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-[#f8faf9] p-4 transition hover:border-teal-300 hover:bg-white hover:shadow-2xs"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                        Feedback
                      </p>
                      <h4 className="mt-1 text-sm font-bold text-slate-950">
                        Interview Reports
                      </h4>
                      <p className="mt-1 text-[11px] text-slate-500">
                        View completed station scores &amp; transcripts
                      </p>
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-teal-700 group-hover:underline">
                      <span>View Reports</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </Link>

                  <Link
                    href="/medicforest/ucat/dashboard"
                    className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-[#f8faf9] p-4 transition hover:border-teal-300 hover:bg-white hover:shadow-2xs"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                        UCAT
                      </p>
                      <h4 className="mt-1 text-sm font-bold text-slate-950">
                        UCAT Dashboard
                      </h4>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Question bank, diagnostic mocks &amp; accuracy
                      </p>
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-teal-700 group-hover:underline">
                      <span>Open UCAT</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </Link>

                  <Link
                    href="/feedback"
                    className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-[#f8faf9] p-4 transition hover:border-teal-300 hover:bg-white hover:shadow-2xs"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                        Support
                      </p>
                      <h4 className="mt-1 text-sm font-bold text-slate-950">
                        Feedback &amp; Help
                      </h4>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Reach out via Instagram, TikTok or email
                      </p>
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-teal-700 group-hover:underline">
                      <span>Get Support</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </MedicForestLandingShell>
  );
}
