import type { ReactNode } from "react";

import { InterviewMobileNav } from "../../interview/_components/InterviewMobileNav";
import { InterviewSidebar } from "../../interview/_components/InterviewSidebar";

export function MedicForestLandingShell({ children }: { children: ReactNode }) {
  return (
    <div
      data-interview-shell
      className="medicforest-dashboard-compact min-h-screen bg-[#eef1f3] text-[#071923] lg:fixed lg:inset-0 lg:h-[100dvh] lg:overflow-hidden"
    >
      <a
        href="#medicforest-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-xl bg-[#062f2a] px-4 py-3 text-sm font-black text-white transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      <div
        data-interview-shell-grid
        className="grid min-h-screen lg:h-full lg:min-h-0 lg:grid-cols-[230px_1fr]"
      >
        <InterviewSidebar activeLabel="" showPremiumCard mode="landing" />

        <div
          data-interview-shell-main
          className="min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto"
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
