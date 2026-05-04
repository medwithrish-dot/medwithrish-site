"use client";

import { useState } from "react";
import { LockKeyhole, Sparkles } from "lucide-react";

type PremiumLockCardProps = {
  title?: string;
  description?: string;
  featureLabel?: string;
  buttonLabel?: string;
  className?: string;
  checkoutLoading?: boolean;
  onUpgrade?: () => void | Promise<void>;
};

export function PremiumLockCard({
  title = "Unlock this premium section",
  description = "Upgrade to Premium to see the full insight, recommendations and question-level analysis.",
  featureLabel = "Premium",
  buttonLabel = "Upgrade to Premium",
  className = "",
  checkoutLoading = false,
  onUpgrade,
}: PremiumLockCardProps) {
  const [openingCheckout, setOpeningCheckout] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loading = checkoutLoading || openingCheckout;

  const handleUpgrade = async () => {
    setError(null);

    if (onUpgrade) {
      await onUpgrade();
      return;
    }

    setOpeningCheckout(true);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Could not start checkout.");
      }

      window.location.assign(data.url);
      window.setTimeout(() => setOpeningCheckout(false), 8000);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Could not start checkout."
      );
      setOpeningCheckout(false);
    }
  };

  return (
    <section
      className={`relative overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm ${className}`}
    >
      <div
        aria-hidden="true"
        className="select-none space-y-4 p-5 opacity-70 blur-[3px]"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="h-4 w-40 rounded-full bg-slate-300" />
          <div className="h-8 w-24 rounded-lg bg-amber-200" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="h-20 rounded-xl bg-slate-100" />
          <div className="h-20 rounded-xl bg-slate-100" />
          <div className="h-20 rounded-xl bg-slate-100" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-11/12 rounded-full bg-slate-200" />
          <div className="h-3 w-8/12 rounded-full bg-slate-200" />
          <div className="h-3 w-10/12 rounded-full bg-slate-200" />
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center bg-white/78 px-4 backdrop-blur-[2px]">
        <div className="max-w-md rounded-xl border border-amber-200 bg-white/95 p-5 text-center shadow-lg shadow-amber-100">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-3 text-xs font-black uppercase tracking-wide text-amber-600">
            {featureLabel}
          </p>
          <h2 className="mt-2 text-lg font-black text-slate-950">{title}</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {description}
          </p>
          <button
            type="button"
            onClick={() => void handleUpgrade()}
            disabled={loading}
            className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-black text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {loading ? "Opening..." : buttonLabel}
          </button>
          {error && (
            <p className="mt-3 text-xs font-bold leading-5 text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
