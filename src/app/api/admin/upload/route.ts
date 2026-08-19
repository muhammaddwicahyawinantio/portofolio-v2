import { NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/lib/auth";
import { MAX_UPLOAD_BYTES, randomUploadName } from "@/lib/admin/upload";

/**
 * Sama seperti server action lain di CMS: memeriksa sesi sendiri, bukan
 * cuma mengandalkan penjagaan layout admin (lihat lib/admin/actions.ts).
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File too large (max 5MB)." }, { status: 400 });
  }

  const filename = randomUploadName(file.type);
  if (!filename) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(process.cwd(), "public", "uploads", filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
