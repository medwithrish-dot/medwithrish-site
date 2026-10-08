import "server-only";
import { checkBotId } from "botid/server";
import { InterviewError } from "@/utils/interviews/server";

/** Paid generation requires a human classification, including for verified bots. */
export async function requireHumanRequest() {
  try {
    const result = await checkBotId({ advancedOptions: { checkLevel: "basic" } });
    if (!result.isHuman || result.isBot || result.isVerifiedBot) {
      throw new InterviewError("Please use the interview in your browser. Automated AI requests are blocked.", 403);
    }
  } catch (error) {
    if (error instanceof InterviewError) throw error;
    throw new InterviewError("Browser verification is temporarily unavailable. Your answers are saved; please retry.", 503);
  }
}
