"use client";

import Link from "@/app/medicforest/_components/MedicForestLink";
import { useVisiblePathname } from "@/app/medicforest/_components/useVisiblePathname";
import { InterviewDeviceBanner } from "./InterviewDeviceBanner";
import { getLandingActiveLabel } from "./InterviewSidebar";
import { medicForestPublicHref } from "@/utils/medicforest/public-navigation";
import { MedicForestLogo } from "@/app/medicforest/_components/MedicForestLogo";
import { Menu } from "lucide-react";
import styles from "./InterviewMobileNav.module.css";

const interviewLinks = [
  ["Dashboard", "/medicforest/interview/dashboard"],
  ["AI Interviews", "/medicforest/interview/ai-interviews"],
  ["Question Bank", "/medicforest/interview/question-bank"],
  ["Guides", "/medicforest/interview/guides"],
  ["1-1 Tutoring", "/medicforest/interview/tutoring"],
  ["Groups", "/medicforest/interview/groups"],
  ["Leaderboard", "/medicforest/interview/leaderboard"],
  ["Progress", "/medicforest/interview/progress"],
  ["Plan", "/medicforest/interview/plan"],
  ["Reports", "/medicforest/interview/reports"],
] as const;

const landingLinks = [
  ["About", "/about"],
  ["Pricing", "/pricing"],
  ["UCAT", "/ucat"],
  ["Med Interviews", "/interviews"],
  ["1-1 Tutoring", "/tutoring"],
  ["Resources", "/resources"],
  ["Feedback & Support", "/feedback"],
  ["Manage Account", "/account"],
] as const;

export function InterviewMobileNav({
  activeLabel = "",
  mode = "interview",
}: {
  activeLabel?: string;
  mode?: "interview" | "landing";
}) {
  const pathname = useVisiblePathname();
  const links = mode === "landing" ? landingLinks : interviewLinks;
  const currentActive =
    activeLabel || (mode === "landing" ? getLandingActiveLabel(pathname) : "");

  return (
    <>
      {mode === "interview" && <InterviewDeviceBanner />}
      <nav
        aria-label={
          mode === "landing" ? "MedicForest navigation" : "Med Interview navigation"
        }
        className={styles.navigation}
      >
        <Link href="/medicforest" className={styles.brand} aria-label="MedicForest home">
          <MedicForestLogo onDark width={144} height={34} />
        </Link>
        <details key={pathname} className={styles.menu}>
          <summary className={styles.toggle}>
            <Menu size={20} aria-hidden="true" />
            <span>Menu</span>
          </summary>
          <div className={styles.links}>
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={mode === "landing" ? medicForestPublicHref(pathname, href) : href}
                aria-current={currentActive === label ? "page" : undefined}
                onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}
                className={`${styles.link} ${
                  currentActive === label
                    ? "bg-[#159a9d] text-white"
                    : "text-[#cde1df] hover:bg-white/10 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </details>
      </nav>
    </>
  );
}
