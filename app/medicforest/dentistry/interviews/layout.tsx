import { InterviewPlatformProvider } from "../../interview/_lib/platform-context";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <InterviewPlatformProvider platform="dentistry">{children}</InterviewPlatformProvider>;
}
