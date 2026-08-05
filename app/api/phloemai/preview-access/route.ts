import { NextResponse, type NextRequest } from "next/server";
import {
  createPhloemPreviewToken,
  getPhloemPreviewPassword,
  isPhloemPreviewConfigured,
  PHLOEMAI_PREVIEW_COOKIE,
  PHLOEMAI_PREVIEW_COOKIE_MAX_AGE,
} from "@/utils/phloemai/preview-access";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const submittedPassword = formData.get("password");
  const accessUrl = new URL("/phloemai/access", request.url);

  if (!isPhloemPreviewConfigured()) {
    accessUrl.searchParams.set("error", "not-configured");
    return NextResponse.redirect(accessUrl, 303);
  }

  if (
    typeof submittedPassword !== "string" ||
    submittedPassword !== getPhloemPreviewPassword()
  ) {
    accessUrl.searchParams.set("error", "invalid");
    return NextResponse.redirect(accessUrl, 303);
  }

  const response = NextResponse.redirect(
    new URL("/phloemai/dashboard", request.url),
    303
  );

  response.cookies.set(PHLOEMAI_PREVIEW_COOKIE, await createPhloemPreviewToken(), {
    httpOnly: true,
    maxAge: PHLOEMAI_PREVIEW_COOKIE_MAX_AGE,
    path: "/phloemai",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
