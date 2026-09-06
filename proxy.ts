import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isValidPhloemPreviewToken,
  PHLOEMAI_PREVIEW_COOKIE,
} from "@/utils/phloemai/preview-access";

const PHLOEMAI_PUBLIC_PATHS = new Set(["/phloemai", "/phloemai/access"]);

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/phloemai/") && !PHLOEMAI_PUBLIC_PATHS.has(pathname)) {
    const previewToken = request.cookies.get(PHLOEMAI_PREVIEW_COOKIE)?.value;
    const hasPreviewAccess = await isValidPhloemPreviewToken(previewToken);

    if (!hasPreviewAccess) {
      const stayTunedUrl = request.nextUrl.clone();
      stayTunedUrl.pathname = "/phloemai";
      stayTunedUrl.search = "";

      return NextResponse.redirect(stayTunedUrl);
    }
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

  await supabase.auth.getClaims();

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/phloemai/:path*",
    "/api/ai/:path*",
    "/api/interviews/:path*",
    "/api/stripe/create-checkout-session",
    "/api/stripe/create-portal-session",
    "/api/stripe/sync-checkout-session",
  ],
};
