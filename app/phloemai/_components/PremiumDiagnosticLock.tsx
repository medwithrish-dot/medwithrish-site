import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PremiumLockCard } from "./PremiumLockCard";

type PremiumDiagnosticLockProps = {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
};

export function PremiumDiagnosticLock({
  title = "Premium diagnostic locked",
  description = "Mock diagnostics, full mocks, subtest mocks and 15-minute sprints are part of Premium. Upgrade to run them and unlock detailed analysis. The free QR diagnostic is always available on the diagnostic page.",
  backHref = "/phloemai/diagnostic",
  backLabel = "Back to diagnostics",
}: PremiumDiagnosticLockProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef3fb] via-[#f5f8fc] to-white px-4 py-10 text-[#111827]">
      <div className="mx-auto max-w-3xl">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Link>
        <div className="mt-8">
          <PremiumLockCard
            title={title}
            description={description}
            featureLabel="Premium diagnostic"
            buttonLabel="View plans"
          />
        </div>
      </div>
    </div>
  );
}
