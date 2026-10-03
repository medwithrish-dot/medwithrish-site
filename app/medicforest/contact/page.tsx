import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Mail, MessageSquare } from "lucide-react";
import { FaInstagram, FaTiktok } from "react-icons/fa";
import { MedicForestLandingShell } from "../ucat/_components/MedicForestLandingShell";

export const metadata: Metadata = {
  title: "Help & Support | MedicForest",
  description:
    "Get in touch with MedWithRish and MedicForest. Email medwithrish@gmail.com or DM @medwithrish_ on Instagram or @medwithrish on TikTok.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <MedicForestLandingShell>
      <div className="min-h-screen bg-[#f7faf8] text-slate-900 pb-16">
        <main className="mx-auto max-w-4xl px-5 pt-8 sm:px-8 sm:pt-10">
          {/* Back Navigation Link */}
          <div>
            <Link
              href="/interviews"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 transition hover:text-teal-950 sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Med Interviews</span>
            </Link>
          </div>

          {/* Header */}
          <div className="mt-6 max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700 sm:text-xs">
              Help &amp; Support
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              We&apos;re here to help.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Have a question about Med interview tutoring, UCAT coaching, or your MedicForest account? Reach out directly - we usually reply the same day.
            </p>
          </div>

          {/* 3 Direct Support Channels Grid */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Email Option */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs transition hover:border-teal-300 hover:shadow-xs">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <Mail className="h-6 w-6" />
                </div>

                <h2 className="mt-4 text-lg font-bold text-slate-950">
                  Email
                </h2>
                <p className="mt-1 text-xs font-semibold text-teal-700">
                  medwithrish@gmail.com
                </p>

                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                  Best for detailed questions, 1-to-1 tutoring enquiries, or platform support.
                </p>
              </div>

              <a
                href="mailto:medwithrish@gmail.com"
                className="mt-6 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 text-xs font-bold text-white shadow-xs transition hover:bg-teal-700"
              >
                <span>Send Email</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Instagram Option */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs transition hover:border-pink-300 hover:shadow-xs">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                  <FaInstagram className="h-6 w-6" />
                </div>

                <h2 className="mt-4 text-lg font-bold text-slate-950">
                  Instagram DM
                </h2>
                <p className="mt-1 text-xs font-semibold text-pink-600">
                  @medwithrish_
                </p>

                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                  Drop a quick DM for fast questions, admissions advice, or interview tips.
                </p>
              </div>

              <a
                href="https://instagram.com/medwithrish_"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-[#042724] px-4 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800"
              >
                <span>Message on Instagram</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* TikTok Option */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs transition hover:border-slate-400 hover:shadow-xs">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
                  <FaTiktok className="h-5 w-5" />
                </div>

                <h2 className="mt-4 text-lg font-bold text-slate-950">
                  TikTok DM
                </h2>
                <p className="mt-1 text-xs font-semibold text-slate-700">
                  @medwithrish
                </p>

                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                  Message via TikTok or check out high-yield interview breakdowns and guidance.
                </p>
              </div>

              <a
                href="https://www.tiktok.com/@medwithrish"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-800 shadow-2xs transition hover:bg-slate-50"
              >
                <span>Message on TikTok</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Quick FAQ / Info Box */}
          <div className="mt-10 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs sm:p-7">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <MessageSquare className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-slate-950">
                Common questions &amp; quick access
              </h2>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3 text-xs text-slate-600">
              <div className="space-y-1">
                <p className="font-bold text-slate-900">Looking for 1-to-1 Tuition?</p>
                <p>Explore crash courses and private coaching for UCAT and Med interviews.</p>
                <Link href="/medicforest/tutoring" className="inline-block pt-1 font-semibold text-teal-700 hover:underline">
                  View Tutoring Options →
                </Link>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-slate-900">Free Admissions Guides</p>
                <p>Download our free Medicine interview guide and access revision roadmaps.</p>
                <Link href="/resources" className="inline-block pt-1 font-semibold text-teal-700 hover:underline">
                  Browse Resources →
                </Link>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-slate-900">Platform &amp; Billing</p>
                <p>Manage subscription, AI attempt credits, or report issues.</p>
                <Link href="/medicforest/pricing" className="inline-block pt-1 font-semibold text-teal-700 hover:underline">
                  View Plans &amp; Pricing →
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </MedicForestLandingShell>
  );
}
