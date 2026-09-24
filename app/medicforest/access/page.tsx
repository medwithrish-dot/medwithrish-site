import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, KeyRound, Lock } from "lucide-react";

type AccessSearchParams = {
  error?: string | string[];
  next?: string | string[];
};

const PREVIEW_DESTINATIONS = {
  interview: {
    label: "Medicine interview dashboard",
    path: "/medicforest/interview/dashboard",
  },
  ucat: {
    label: "UCAT dashboard",
    path: "/medicforest/ucat/dashboard",
  },
} as const;

export const metadata: Metadata = {
  title: {
    absolute: "MedicForest Preview Access",
  },
  description: "Private preview access for MedicForest.",
  robots: {
    index: false,
    follow: false,
  },
};

function getErrorMessage(searchParams: AccessSearchParams) {
  const error = Array.isArray(searchParams.error)
    ? searchParams.error[0]
    : searchParams.error;

  if (error === "not-configured") {
    return "Preview access is not configured yet. Add MEDICFOREST_PREVIEW_PASSWORD to the deployment environment.";
  }

  if (error === "invalid") {
    return "That password did not work. Try again.";
  }

  return "";
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<AccessSearchParams>;
}) {
  const params = await searchParams;
  const errorMessage = getErrorMessage(params);
  const requestedNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const selectedDestination = Object.values(PREVIEW_DESTINATIONS).find(
    (destination) => destination.path === requestedNext
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_70%_10%,#eadff8_0,transparent_30rem),linear-gradient(145deg,#f8f5fb,#f1ebf7)] px-6 py-10 font-['Segoe_UI',Arial,sans-serif] text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col justify-center">
        <Link
          href="/medicforest"
          className="inline-flex w-fit items-center gap-2 rounded-md border border-violet-200 bg-white/80 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-violet-400 hover:text-violet-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </Link>

        <section className="mt-8 rounded-lg border border-violet-200 bg-gradient-to-br from-white to-violet-50 p-6 shadow-[0_18px_55px_rgba(52,27,92,0.09)]">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-violet-200 bg-violet-100 text-violet-700">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </div>

          <h1 className="mt-5 text-2xl font-black tracking-normal text-slate-950">
            MedicForest preview access
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Enter the private preview password to open the work-in-progress
            {selectedDestination
              ? ` ${selectedDestination.label} on this browser.`
              : " MedicForest app on this browser."}
          </p>

          <form
            action="/api/medicforest/preview-access"
            method="post"
            className="mt-6 space-y-4"
          >
            {selectedDestination ? (
              <input type="hidden" name="next" value={selectedDestination.path} />
            ) : (
              <fieldset className="space-y-2 text-left">
                <legend className="text-sm font-bold text-slate-800">
                  Choose a dashboard
                </legend>
                {Object.values(PREVIEW_DESTINATIONS).map((destination) => (
                  <label
                    key={destination.path}
                    className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-400"
                  >
                    <input
                      type="radio"
                      name="next"
                      value={destination.path}
                      required
                      className="h-4 w-4 accent-violet-700"
                    />
                    {destination.label}
                  </label>
                ))}
              </fieldset>
            )}
            <label className="block text-left text-sm font-bold text-slate-800">
              Password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-2 block w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
            </label>

            {errorMessage && (
              <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-b from-violet-700 to-violet-900 px-5 py-3 text-sm font-bold text-white transition hover:from-violet-600 hover:to-violet-800"
            >
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              Unlock Preview
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
