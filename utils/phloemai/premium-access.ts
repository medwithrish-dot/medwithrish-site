import "server-only";

import { cache } from "react";
import { createClient } from "@/utils/supabase/server";

export type PhloemPlan = "free" | "premium";

export type PhloemEntitlements = {
  isPremium: boolean;
  plan: PhloemPlan;
  userId: string | null;
};

const FREE_ENTITLEMENTS: PhloemEntitlements = {
  isPremium: false,
  plan: "free",
  userId: null,
};

export const getPhloemEntitlements = cache(async (): Promise<PhloemEntitlements> => {
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

    const plan: PhloemPlan = data?.current_plan === "premium" ? "premium" : "free";

    return {
      isPremium: plan === "premium",
      plan,
      userId: user.id,
    };
  } catch {
    return FREE_ENTITLEMENTS;
  }
});
