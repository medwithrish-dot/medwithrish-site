import { createAdminClient } from "@/utils/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const maxFileSize = 10 * 1024 * 1024;
  const contentLength = Number(request.headers.get("content-length"));
  if (contentLength > maxFileSize + 64 * 1024) {
    return Response.json({ error: "File must be under 10MB." }, { status: 413 });
  }
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid upload form." }, { status: 400 });
  }
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided." }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return Response.json({ error: "Only PDF files are accepted." }, { status: 400 });
  }

  if (file.size > maxFileSize) {
    return Response.json({ error: "File must be under 10MB." }, { status: 400 });
  }

  const signature = await file.slice(0, 5).text();
  if (signature !== "%PDF-") {
    return Response.json({ error: "The uploaded file is not a valid PDF." }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const fileName = `${crypto.randomUUID()}.pdf`;
    const arrayBuffer = await file.arrayBuffer();

    const { error } = await admin.storage
      .from("ps-uploads")
      .upload(fileName, Buffer.from(arrayBuffer), {
        contentType: "application/pdf",
      });

    if (error) throw error;
    return Response.json({ filePath: fileName });
  } catch {
    return Response.json({ error: "Could not upload the file. Please try again." }, { status: 500 });
  }
}
