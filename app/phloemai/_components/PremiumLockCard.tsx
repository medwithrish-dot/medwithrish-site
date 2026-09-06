"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  description = "Premium unlocks the full insight, recommendations and question-level analysis. View the plan before checkout.",
  featureLabel = "Premium",
  buttonLabel = "View plans",
  className = "",
  checkoutLoading = false,
  onUpgrade,
}: PremiumLockCardProps) {
  const router = useRouter();
  const [openingCheckout, setOpeningCheckout] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loading = checkoutLoading || openingCheckout;

  const handleUpgrade = async () => {
    setError(null);

    if (!onUpgrade) {
      router.push("/phloemai/pricing");
      return;
    }

    setOpeningCheckout(true);

    try {
      await onUpgrade();
      setOpeningCheckout(false);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Could not open pricing."
      );
      setOpeningCheckout(false);
    }
  };

  return (
    <section
      className={`relative min-h-[360px] overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm sm:min-h-[320px] ${className}`}
    >
      <div
        aria-hidden="true"
        className="min-h-[360px] select-none space-y-4 p-5 opacity-70 blur-[3px] sm:min-h-[320px]"
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

      <div className="absolute inset-0 flex items-center justify-center overflow-y-auto bg-white/78 px-4 py-6 backdrop-blur-[2px]">
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
            onClick={handleUpgrade}
            disabled={loading}
            className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-black text-white hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:bg-blue-300"
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
