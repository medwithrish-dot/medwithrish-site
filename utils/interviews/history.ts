import "server-only";
import { createClient } from "@/utils/supabase/server";
import { toInterviewAttempt } from "./server";
import type { InterviewAttempt } from "@/app/phloemai/interviews/_lib/interview-types";

export async function interviewHistory(): Promise<{ attempts: InterviewAttempt[]; message: string | null; signedIn: boolean }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { attempts: [], signedIn: false, message: "Sign in to keep your interviews, feedback and progress together." };
    const { data, error } = await supabase.from("interview_attempts").select("*").order("started_at", { ascending: false }).limit(300);
    if (error) return { attempts: [], signedIn: true, message: "Interview storage is being set up. Your history will appear here once it is ready." };
    return { attempts: (data ?? []).map(toInterviewAttempt), signedIn: true, message: null };
  } catch { return { attempts: [], signedIn: false, message: "Interview services are temporarily unavailable. Please try again shortly." }; }
}
