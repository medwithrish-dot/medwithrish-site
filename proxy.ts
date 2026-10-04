import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isValidMedicForestPreviewToken,
  MEDICFOREST_PREVIEW_COOKIE,
} from "@/utils/medicforest/preview-access";
import { isPublicMedicForestPath } from "@/utils/medicforest/public-paths";
import { isMedicForestHost, previewPathname } from "@/utils/medicforest/preview-routing";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const productHost = isMedicForestHost(request.nextUrl.hostname)
    || isMedicForestHost(request.headers.get("host"));
  const accessPathname = previewPathname(pathname, productHost);
  const isProtectedMedicForestPath =
    accessPathname.startsWith("/medicforest/") && !isPublicMedicForestPath(accessPathname);

  if (isProtectedMedicForestPath) {
    const previewToken = request.cookies.get(MEDICFOREST_PREVIEW_COOKIE)?.value;
    const hasPreviewAccess = await isValidMedicForestPreviewToken(previewToken);

    if (!hasPreviewAccess) {
      const stayTunedUrl = request.nextUrl.clone();
      stayTunedUrl.pathname = productHost ? "/" : "/medicforest";
      stayTunedUrl.search = "";
      stayTunedUrl.searchParams.set(
        "preview",
        accessPathname.startsWith("/medicforest/interview") ? "interview" : "ucat"
      );

      return NextResponse.redirect(stayTunedUrl);
    }
  }

  // Public marketing pages and guest views do not need a Supabase claim refresh.
  if (!isProtectedMedicForestPath && !pathname.startsWith("/api/")) {
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
    "/api/ai/:path*",
    "/api/interviews/:path*",
    "/api/stripe/create-checkout-session",
    "/api/stripe/create-portal-session",
    "/api/stripe/sync-checkout-session",
  ],
};
