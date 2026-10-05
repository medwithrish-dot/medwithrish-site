"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LockKeyhole, X } from "lucide-react";
import type { MedicForestEntitlements } from "@/utils/medicforest/premium-access";
import { FEATURE_ACCESS_EVENT, featureAccessDecision, safeInterviewReturnPath, type FeatureTier } from "@/utils/medicforest/feature-access";
import { createClient, hasSupabaseConfig } from "@/utils/supabase/client";

export function FeatureAccessProvider({ entitlements, children }: { entitlements: MedicForestEntitlements; children: ReactNode }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [prompt, setPrompt] = useState<{ kind: "signup" | "premium"; label: string; next: string } | null>(null);

  useEffect(() => {
    const onRequest = (event: Event) => {
      const { tier, label, deniedByServer, next } = (event as CustomEvent<{ tier: FeatureTier; label: string; deniedByServer?: boolean; next?: string }>).detail;
      const kind = deniedByServer ? tier === "premium" ? "premium" : "signup" : featureAccessDecision(entitlements.userId, entitlements.isPremium, tier, entitlements.freeInterviewUsed);
      if (kind === "allowed") return;
      event.preventDefault();
      setPrompt({ kind, label, next: safeInterviewReturnPath(next) ?? window.location.pathname + window.location.search });
    };
    window.addEventListener(FEATURE_ACCESS_EVENT, onRequest);
    return () => window.removeEventListener(FEATURE_ACCESS_EVENT, onRequest);
  }, [entitlements]);

  useEffect(() => {
    const refresh = () => router.refresh();
    window.addEventListener("medicforest:entitlements-changed", refresh);
    return () => window.removeEventListener("medicforest:entitlements-changed", refresh);
  }, [router]);

  useEffect(() => {
    if (!hasSupabaseConfig()) return;
    const { data: { subscription } } = createClient().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        window.setTimeout(() => router.refresh(), 0);
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!prompt || !dialog.current) return;
    const element = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    element.showModal();
    return () => { element.close(); previous?.focus(); };
  }, [prompt]);

  const accountHref = `/medicforest/account?mode=signup&next=${encodeURIComponent(prompt?.next ?? "/medicforest/interview/dashboard")}`;
  return <>{children}
    {prompt && <dialog ref={dialog} onCancel={() => setPrompt(null)} onClick={(event) => { if (event.target === event.currentTarget) setPrompt(null); }} aria-labelledby="feature-access-title" aria-describedby="feature-access-description" className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-sm rounded-2xl border border-[#d5e2e3] bg-white p-6 text-[#071923] shadow-xl backdrop:bg-slate-950/50">
      <button type="button" autoFocus onClick={() => setPrompt(null)} aria-label="Close popup" className="absolute right-3 top-3 rounded-lg p-2 hover:bg-slate-100"><X size={18} /></button>
      <LockKeyhole size={24} className="text-[#08787b]" aria-hidden="true" />
      <h2 id="feature-access-title" className="mt-4 text-xl font-semibold">{prompt.kind === "premium" ? "Upgrade to Premium to continue" : "Sign up for free to continue"}</h2>
      <p id="feature-access-description" className="mt-3 text-sm leading-6 text-slate-600">{prompt.kind === "premium" ? `${prompt.label} is included in Premium. Upgrade to unlock this feature.` : `Create a free account or log in to use ${prompt.label.toLowerCase()} and save your progress.`}</p>
      <Link href={prompt.kind === "premium" ? "/medicforest/pricing" : accountHref} onClick={() => setPrompt(null)} className="mt-5 flex justify-center rounded-lg bg-[#08787b] px-4 py-3 text-sm font-semibold text-white">{prompt.kind === "premium" ? "Upgrade to Premium" : "Sign up for free"}</Link>
      {!entitlements.userId && <Link href={accountHref.replace("mode=signup", "mode=login")} onClick={() => setPrompt(null)} className="mt-3 block text-center text-sm font-semibold text-[#08787b]">Already have an account? Log in</Link>}
      <button type="button" onClick={() => setPrompt(null)} className="mt-4 w-full text-sm text-slate-500">Keep browsing</button>
    </dialog>}
  </>;
}
