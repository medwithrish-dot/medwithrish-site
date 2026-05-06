import { createStripeClient } from "@/utils/stripe";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient as createServerSupabaseClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

async function createCustomer({
  admin,
  stripe,
  userId,
  email,
  fullName,
}: {
  admin: ReturnType<typeof createAdminClient>;
  stripe: ReturnType<typeof createStripeClient>;
  userId: string;
  email?: string;
  fullName?: string | null;
}) {
  const customer = await stripe.customers.create({
    email,
    name: fullName?.trim() ? fullName : undefined,
    metadata: {
      supabase_user_id: userId,
    },
  });

  await admin
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  return customer.id;
}

async function customerExists(
  stripe: ReturnType<typeof createStripeClient>,
  customerId: string
) {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return !customer.deleted;
  } catch {
    return false;
  }
}

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

    if (customerId && !(await customerExists(stripe, customerId))) {
      customerId = null;
    }

    if (!customerId) {
      customerId = await createCustomer({
        admin,
        stripe,
        userId: user.id,
        email: user.email ?? undefined,
        fullName:
          typeof profile?.full_name === "string" ? profile.full_name : null,
      });
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
      consent_collection: {
        terms_of_service: "required",
      },
      custom_text: {
        terms_of_service_acceptance: {
          message: `I agree to the [Terms and Conditions](${siteUrl}/terms-and-conditions) and confirm I have read the [Privacy Policy](${siteUrl}/privacy-policy).`,
        },
      },
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
