import type { ReactNode } from "react";

import { InterviewMobileNav } from "../../interview/_components/InterviewMobileNav";
import { InterviewSidebar } from "../../interview/_components/InterviewSidebar";

export function MedicForestLandingShell({ children }: { children: ReactNode }) {
  return (
    <div
      data-interview-shell
      className="soft-wave-bg medicforest-dashboard-compact min-h-[100dvh] text-[#071923]"
    >
      <a
        href="#medicforest-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-xl bg-[#062f2a] px-4 py-3 text-sm font-black text-white transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      <div
        data-interview-shell-grid
        className="grid min-h-[100dvh] lg:grid-cols-[200px_1fr]"
      >
        <InterviewSidebar activeLabel="" showPremiumCard mode="landing" />

        <div
          data-interview-shell-main
          className="min-w-0"
        >
          <InterviewMobileNav activeLabel="" mode="landing" />
          <main id="medicforest-content" className="min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
