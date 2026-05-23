import { createStripeClient } from "@/utils/stripe";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient as createServerSupabaseClient } from "@/utils/supabase/server";
import { getRequiredSiteUrl } from "@/utils/site-url";

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

  const { error } = await admin
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  if (error) throw error;

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
    const profileSelect = "current_plan,stripe_customer_id,full_name";
    const { data: existingProfile, error: profileError } = await admin
      .from("profiles")
      .select(profileSelect)
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return Response.json({ error: profileError.message }, { status: 500 });
    }

    let profile = existingProfile;

    if (!profile) {
      const { data: createdProfile, error: createProfileError } = await admin
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email ?? null,
            full_name:
              typeof user.user_metadata?.full_name === "string"
                ? user.user_metadata.full_name
                : "",
          },
          { onConflict: "id" }
        )
        .select(profileSelect)
        .single();

      if (createProfileError) {
        return Response.json(
          { error: createProfileError.message },
          { status: 500 }
        );
      }

      profile = createdProfile;
    }

    if (profile?.current_plan === "premium") {
      return Response.json(
        {
          error:
            "This account already has Premium. Manage billing from account settings.",
        },
        { status: 409 }
      );
    }

    const { data: activeSubscription, error: subscriptionError } = await admin
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .limit(1)
      .maybeSingle();

    if (subscriptionError) {
      return Response.json(
        { error: subscriptionError.message },
        { status: 500 }
      );
    }

    if (activeSubscription) {
      return Response.json(
        {
          error:
            "This account already has an active Premium subscription. Manage billing from account settings.",
        },
        { status: 409 }
      );
    }

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

    const siteUrl = getRequiredSiteUrl(request);

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
