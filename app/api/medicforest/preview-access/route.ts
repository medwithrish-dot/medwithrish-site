import { NextResponse, type NextRequest } from "next/server";
import {
  createMedicForestPreviewToken,
  getMedicForestPreviewPassword,
  isMedicForestPreviewConfigured,
  MEDICFOREST_PREVIEW_COOKIE,
  MEDICFOREST_PREVIEW_COOKIE_MAX_AGE,
} from "@/utils/medicforest/preview-access";

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid access form." }, { status: 400 });
  }
  const submittedPassword = formData.get("password");
  const submittedNext = formData.get("next");
  const destination =
    submittedNext === "/medicforest/interview/dashboard" ||
    submittedNext === "/medicforest/ucat/dashboard"
      ? submittedNext
      : "";
  const accessUrl = new URL("/medicforest/access", request.url);
  if (destination) accessUrl.searchParams.set("next", destination);

  if (!isMedicForestPreviewConfigured()) {
    accessUrl.searchParams.set("error", "not-configured");
    return NextResponse.redirect(accessUrl, 303);
  }

  if (
    typeof submittedPassword !== "string" ||
    submittedPassword !== getMedicForestPreviewPassword()
  ) {
    accessUrl.searchParams.set("error", "invalid");
    return NextResponse.redirect(accessUrl, 303);
  }

  const response = NextResponse.redirect(
    new URL(destination || "/medicforest", request.url),
    303
  );

  response.cookies.set(MEDICFOREST_PREVIEW_COOKIE, await createMedicForestPreviewToken(), {
    httpOnly: true,
    maxAge: MEDICFOREST_PREVIEW_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
