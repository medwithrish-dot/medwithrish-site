import "server-only";

import { cache } from "react";
import { createClient } from "@/utils/supabase/server";

export type MedicForestPlan = "free" | "premium";

export type MedicForestEntitlements = {
  isPremium: boolean;
  plan: MedicForestPlan;
  userId: string | null;
  freeInterviewUsed: boolean;
};

const FREE_ENTITLEMENTS: MedicForestEntitlements = {
  isPremium: false,
  plan: "free",
  userId: null,
  freeInterviewUsed: false,
};

export const getMedicForestEntitlements = cache(async (): Promise<MedicForestEntitlements> => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return FREE_ENTITLEMENTS;

    const [{ data }, trial] = await Promise.all([
      supabase.from("profiles").select("current_plan").eq("id", user.id).maybeSingle(),
      supabase.from("interview_attempts").select("id").eq("user_id", user.id).eq("mode", "free").limit(1),
    ]);

    const plan: MedicForestPlan = data?.current_plan === "premium" ? "premium" : "free";

    return {
      isPremium: plan === "premium",
      plan,
      userId: user.id,
      freeInterviewUsed: Boolean(trial.error || trial.data?.length),
    };
  } catch {
    return FREE_ENTITLEMENTS;
  }
});
