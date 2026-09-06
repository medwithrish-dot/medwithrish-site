import type Stripe from "stripe";
import { createStripeClient } from "@/utils/stripe";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient as createServerSupabaseClient } from "@/utils/supabase/server";
import { getRequiredSiteUrl } from "@/utils/site-url";
import { billingActionStatuses } from "@/utils/stripe-subscriptions";

export const runtime = "nodejs";

const paidSubscriptionStatuses = ["active", "trialing"] as const;

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
  } catch (error) {
    if (
      error && typeof error === "object" &&
      "code" in error && error.code === "resource_missing"
    ) {
      return false;
    }
    // An outage is not evidence that the customer has been deleted.
    throw error;
  }
}

function getPriceProductId(price: Stripe.Price) {
  return typeof price.product === "string" ? price.product : price.product.id;
}

function priceIsUsableForSubscription(
  price: Stripe.Price,
  productId: string
) {
  return price.active && Boolean(price.recurring) && getPriceProductId(price) === productId;
}

async function resolvePremiumPriceId(
  stripe: ReturnType<typeof createStripeClient>
) {
  const priceId = process.env.STRIPE_PREMIUM_PRICE_ID?.trim();
  const productId = process.env.STRIPE_PREMIUM_PRODUCT_ID?.trim();

  if (!priceId) {
    throw new Error("Missing STRIPE_PREMIUM_PRICE_ID.");
  }

  const price = await stripe.prices.retrieve(priceId);

  if (!price.active || !price.recurring) {
    throw new Error(
      `Stripe price ${priceId} must be active and recurring.`
    );
  }

  if (productId && !priceIsUsableForSubscription(price, productId)) {
    throw new Error(
      `Stripe price ${priceId} must be attached to product ${productId}.`
    );
  }

  return price.id;
}

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

    const siteUrl = getRequiredSiteUrl(request);

    const { data: existingSubscription, error: subscriptionError } = await admin
      .from("subscriptions")
      .select("id,status,stripe_customer_id")
      .eq("user_id", user.id)
      .in("status", billingActionStatuses)
      .limit(1)
      .maybeSingle();

    if (subscriptionError) {
      return Response.json(
        { error: subscriptionError.message },
        { status: 500 }
      );
    }

    if (profile?.current_plan === "premium") {
      if (profile.stripe_customer_id) {
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: profile.stripe_customer_id,
          return_url: `${siteUrl}/phloemai/account`,
        });

        return Response.json({ url: portalSession.url });
      }

      return Response.json(
        {
          error:
            "This account already has Premium. Manual Premium accounts do not have Stripe billing to manage.",
        },
        { status: 409 }
      );
    }

    if (existingSubscription) {
      const customerIdForPortal =
        typeof existingSubscription.stripe_customer_id === "string"
          ? existingSubscription.stripe_customer_id
          : profile?.stripe_customer_id;

      if (customerIdForPortal) {
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: customerIdForPortal,
          return_url: `${siteUrl}/phloemai/account`,
        });

        return Response.json({ url: portalSession.url });
      }

      const status = existingSubscription.status;
      const activeText = paidSubscriptionStatuses.includes(
        status as (typeof paidSubscriptionStatuses)[number]
      )
        ? "active Premium subscription"
        : "subscription that needs billing action";

      return Response.json(
        {
          error: `This account already has an ${activeText}. Manage billing from account settings.`,
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

    const priceId = await resolvePremiumPriceId(stripe);

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
