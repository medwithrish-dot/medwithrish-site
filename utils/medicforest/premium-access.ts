import "server-only";

import { cache } from "react";
import { createClient } from "@/utils/supabase/server";

export type MedicForestPlan = "free" | "premium";

export type MedicForestEntitlements = {
  isPremium: boolean;
  plan: MedicForestPlan;
  userId: string | null;
};

const FREE_ENTITLEMENTS: MedicForestEntitlements = {
  isPremium: false,
  plan: "free",
  userId: null,
};

export const getMedicForestEntitlements = cache(async (): Promise<MedicForestEntitlements> => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return FREE_ENTITLEMENTS;

    const { data } = await supabase
      .from("profiles")
      .select("current_plan")
      .eq("id", user.id)
      .maybeSingle();

    const plan: MedicForestPlan = data?.current_plan === "premium" ? "premium" : "free";

    return {
      isPremium: plan === "premium",
      plan,
      userId: user.id,
    };
  } catch {
    return FREE_ENTITLEMENTS;
  }
});
