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
    path: "/phloemai/interview/dashboard",
  },
  ucat: {
    label: "UCAT dashboard",
    path: "/phloemai/dashboard",
  },
} as const;

export const metadata: Metadata = {
  title: {
    absolute: "PhloemAI Preview Access",
  },
  description: "Private preview access for PhloemAI.",
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
    return "Preview access is not configured yet. Add PHLOEMAI_PREVIEW_PASSWORD to the deployment environment.";
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
    <main className="min-h-screen bg-[#f8fbff] px-6 py-10 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col justify-center">
        <Link
          href="/phloemai"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </Link>

        <section className="mt-8 rounded-lg border border-cyan-100 bg-white p-6 shadow-sm">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </div>

          <h1 className="mt-5 text-2xl font-black tracking-normal text-slate-950">
            PhloemAI preview access
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Enter the private preview password to open the work-in-progress
            {selectedDestination
              ? ` ${selectedDestination.label} on this browser.`
              : " PhloemAI app on this browser."}
          </p>

          <form
            action="/api/phloemai/preview-access"
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
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-300"
                  >
                    <input
                      type="radio"
                      name="next"
                      value={destination.path}
                      required
                      className="h-4 w-4 accent-cyan-700"
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
                className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            {errorMessage && (
              <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
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
