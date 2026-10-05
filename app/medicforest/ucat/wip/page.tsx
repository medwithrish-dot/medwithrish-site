import Link from "next/link";
import { Construction } from "lucide-react";

export default function UcatWorkInProgress() {
  return <main className="flex min-h-[80vh] items-center justify-center bg-[#eef5f4] px-6 py-16 text-[#042724]">
    <section className="w-full max-w-lg rounded-2xl border border-[#cfe0df] bg-white p-8 text-center shadow-sm">
      <Construction className="mx-auto h-10 w-10 text-[#08787b]" aria-hidden="true" />
      <p className="mt-5 inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">Work in progress</p>
      <h1 className="mt-4 text-3xl font-semibold">UCAT is coming soon</h1>
      <p className="mt-4 text-base leading-7 text-slate-600">We are still preparing the UCAT area. It is currently unavailable on both Free and Premium plans. You can explore interview preparation now.</p>
      <Link href="/medicforest/interview/dashboard" className="mt-6 inline-flex rounded-lg bg-[#08787b] px-5 py-3 text-sm font-semibold text-white">Open interviews</Link>
      <Link href="/medicforest" className="mt-4 block text-sm text-[#08787b] underline">Back to MedicForest</Link>
    </section>
  </main>;
}
