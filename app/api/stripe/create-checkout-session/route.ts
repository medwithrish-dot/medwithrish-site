import { createClient as createServerSupabaseClient } from "@/utils/supabase/server";
import { getRequiredSiteUrl } from "@/utils/site-url";
import { preparePremiumCheckout } from "@/utils/billing/billing-service";
import { toBillingResponse } from "@/utils/billing/billing-errors";
import { readLimitedText } from "@/utils/security/request-body";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json({ error: "Log in before upgrading." }, { status: 401 });
    }

    let returnArea: "ucat" | "interviews" = "ucat";
    const bodyText = await readLimitedText(request, 12_000);
    if (bodyText) {
      let body: unknown;
      try {
        body = JSON.parse(bodyText);
      } catch {
        return Response.json({ error: "Invalid request body." }, { status: 400 });
      }
      if (!body || typeof body !== "object" || !("returnTo" in body) ||
          (body.returnTo !== "interviews" && body.returnTo !== "ucat")) {
        return Response.json({ error: "Invalid return destination." }, { status: 400 });
      }
      returnArea = body.returnTo;
    }

    const siteUrl = getRequiredSiteUrl(request);
    const outcome = await preparePremiumCheckout({ user, siteUrl, returnArea });

    return Response.json({ url: outcome.url });
  } catch (error) {
    return toBillingResponse(error, "Could not start checkout.");
  }
}
