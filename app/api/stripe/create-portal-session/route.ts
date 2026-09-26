import { createClient as createServerSupabaseClient } from "@/utils/supabase/server";
import { getRequiredSiteUrl } from "@/utils/site-url";
import { openCustomerPortal } from "@/utils/billing/billing-service";
import { toBillingResponse } from "@/utils/billing/billing-errors";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json({ error: "Log in before managing billing." }, { status: 401 });
    }

    const siteUrl = getRequiredSiteUrl(request);
    const { url } = await openCustomerPortal({ user, siteUrl });

    return Response.json({ url });
  } catch (error) {
    return toBillingResponse(error, "Could not open the billing portal.");
  }
}
