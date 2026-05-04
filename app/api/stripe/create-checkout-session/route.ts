import { createStripeClient } from "@/utils/stripe";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient as createServerSupabaseClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const priceId = process.env.STRIPE_PREMIUM_PRICE_ID;

    if (!priceId) {
      return Response.json(
        { error: "Missing STRIPE_PREMIUM_PRICE_ID." },
        { status: 500 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json({ error: "Log in before upgrading." }, { status: 401 });
    }

    const admin = createAdminClient();
    const stripe = createStripeClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id,full_name")
      .eq("id", user.id)
      .maybeSingle();

    let customerId =
      typeof profile?.stripe_customer_id === "string"
        ? profile.stripe_customer_id
        : null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        name:
          typeof profile?.full_name === "string" && profile.full_name.trim()
            ? profile.full_name
            : undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      customerId = customer.id;

      await admin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      request.headers.get("origin") ??
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${siteUrl}/phloemai/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/phloemai/dashboard?checkout=cancelled`,
      metadata: {
        supabase_user_id: user.id,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
        },
      },
    });

    if (!session.url) {
      return Response.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 }
      );
    }

    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not start checkout.",
      },
      { status: 500 }
    );
  }
}
