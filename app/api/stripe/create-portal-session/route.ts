import { createStripeClient } from "@/utils/stripe";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient as createServerSupabaseClient } from "@/utils/supabase/server";

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

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.stripe_customer_id) {
      return Response.json(
        { error: "No Stripe customer found for this account." },
        { status: 404 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      request.headers.get("origin") ??
      "http://localhost:3000";

    const stripe = createStripeClient();
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${siteUrl}/phloemai/account`,
    });

    return Response.json({ url: portalSession.url });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not open the billing portal.",
      },
      { status: 500 }
    );
  }
}
