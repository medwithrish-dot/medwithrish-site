"use client";

import { createContext, useContext } from "react";
import type { InterviewPlatform } from "@/utils/interviews/platform";

const PlatformContext = createContext<InterviewPlatform>("medicine");
export function InterviewPlatformProvider({ children, platform }: { children: React.ReactNode; platform: InterviewPlatform }) {
  return <PlatformContext.Provider value={platform}>{children}</PlatformContext.Provider>;
}
export const useInterviewPlatform = () => useContext(PlatformContext);
