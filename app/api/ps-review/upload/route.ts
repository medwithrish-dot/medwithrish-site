import { createAdminClient } from "@/utils/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "No file provided." }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return Response.json({ error: "Only PDF files are accepted." }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return Response.json({ error: "File must be under 10MB." }, { status: 400 });
  }

  const admin = createAdminClient();
  const fileName = `${crypto.randomUUID()}.pdf`;
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await admin.storage
    .from("ps-uploads")
    .upload(fileName, Buffer.from(arrayBuffer), {
      contentType: "application/pdf",
    });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ filePath: fileName });
}
