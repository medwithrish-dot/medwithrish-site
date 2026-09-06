import { createStripeClient } from "@/utils/stripe";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient as createServerSupabaseClient } from "@/utils/supabase/server";
import { getRequiredSiteUrl } from "@/utils/site-url";
import { billingActionStatuses } from "@/utils/stripe-subscriptions";

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
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("stripe_customer_id,stripe_subscription_id,subscription_status")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return Response.json({ error: profileError.message }, { status: 500 });
    }

    if (!profile?.stripe_customer_id) {
      return Response.json(
        { error: "No Stripe customer found for this account." },
        { status: 404 }
      );
    }

    if (!profile.stripe_subscription_id || profile.subscription_status === "manual") {
      return Response.json(
        {
          error:
            "This account has manual Premium access, so there is no Stripe billing portal to manage.",
        },
        { status: 409 }
      );
    }

    const { data: manageableSubscription, error: subscriptionError } = await admin
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("stripe_customer_id", profile.stripe_customer_id)
      .eq("stripe_subscription_id", profile.stripe_subscription_id)
      .in("status", billingActionStatuses)
      .limit(1)
      .maybeSingle();

    if (subscriptionError) {
      return Response.json(
        { error: subscriptionError.message },
        { status: 500 }
      );
    }

    if (!manageableSubscription) {
      return Response.json(
        { error: "No manageable Stripe subscription found for this account." },
        { status: 409 }
      );
    }

    const siteUrl = getRequiredSiteUrl(request);

    const stripe = createStripeClient();
    let customerUnavailable = false;
    try {
      const customer = await stripe.customers.retrieve(profile.stripe_customer_id);
      customerUnavailable = Boolean(customer.deleted);
    } catch (error) {
      if (
        !error || typeof error !== "object" ||
        !("code" in error) || error.code !== "resource_missing"
      ) {
        throw error;
      }
      customerUnavailable = true;
    }
    if (customerUnavailable) {
      return Response.json(
        {
          error:
            "This account is linked to an old Stripe test customer. Start a live checkout first.",
        },
        { status: 409 }
      );
    }

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
