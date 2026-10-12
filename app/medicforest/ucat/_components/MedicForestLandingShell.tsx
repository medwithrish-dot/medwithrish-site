import type { ReactNode } from "react";

import { InterviewMobileNav } from "../../interview/_components/InterviewMobileNav";
import { InterviewSidebar } from "../../interview/_components/InterviewSidebar";

export function MedicForestLandingShell({ children }: { children: ReactNode }) {
  return (
    <div
      data-interview-shell
      className="soft-wave-bg medicforest-dashboard-compact min-h-[100dvh] w-full max-w-full overflow-x-hidden text-[#071923]"
    >
      <a
        href="#medicforest-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-xl bg-[#062f2a] px-4 py-3 text-sm font-black text-white transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      <div
        data-interview-shell-grid
        className="grid min-h-[100dvh] w-full min-w-0 max-w-full grid-cols-[minmax(0,1fr)] lg:grid-cols-[200px_minmax(0,1fr)]"
      >
        <InterviewSidebar activeLabel="" showPremiumCard mode="landing" />

        <div
          data-interview-shell-main
          className="w-full min-w-0 max-w-full overflow-x-hidden"
        >
          <InterviewMobileNav activeLabel="" mode="landing" />
          <main id="medicforest-content" className="w-full min-w-0 max-w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
