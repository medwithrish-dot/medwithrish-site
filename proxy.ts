import { guardApiRequest } from "@/utils/security/api-guard";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isMedicForestHost, previewPathname } from "@/utils/medicforest/preview-routing";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const productHost = isMedicForestHost(request.nextUrl.hostname)
    || isMedicForestHost(request.headers.get("host"));
  const accessPathname = previewPathname(pathname, productHost);
  if (accessPathname === "/medicforest/ucat" || accessPathname.startsWith("/medicforest/ucat/")) {
    if (accessPathname !== "/medicforest/ucat/wip") {
      const wipUrl = request.nextUrl.clone();
      wipUrl.pathname = productHost ? "/ucat/wip" : "/medicforest/ucat/wip";
      wipUrl.search = "";
      return NextResponse.redirect(wipUrl);
    }
    return NextResponse.next({ request });
  }

  const apiFailure = guardApiRequest(request);
  if (apiFailure) return apiFailure;

  // Browse the interview platform freely. Features verify identity in their routes.
  const needsSessionRefresh = accessPathname.startsWith("/medicforest/interview/")
    || accessPathname === "/medicforest/account"
    || pathname.startsWith("/api/interviews/")
    || ["/api/stripe/create-checkout-session", "/api/stripe/create-portal-session", "/api/stripe/sync-checkout-session"].includes(pathname);
  if (!needsSessionRefresh) {
    return NextResponse.next({ request });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );

        Object.entries(headers).forEach(([key, value]) =>
          supabaseResponse.headers.set(key, value)
        );
      },
    },
  });

  try {
    await supabase.auth.getClaims();
  } catch {
    // Routes still verify identity themselves. A refresh outage must not take
    // down the interview shell before its fallback can render.
    console.error("auth_refresh_unavailable");
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/medicforest/:path*",
    "/ucat/:path*",
    "/interviews/:path*",
    "/api/:path*",
  ],
};
