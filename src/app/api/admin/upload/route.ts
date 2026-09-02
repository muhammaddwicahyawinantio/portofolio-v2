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
  // Audio uploads (wedding background music) are MP3-only with a tighter cap —
  // server-side, not trusting the client's accept attribute.
  if (form.get("kind") === "audio") {
    if (file.type !== "audio/mpeg") {
      return NextResponse.json({ error: "Only MP3 files are allowed." }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Audio file too large (max 10MB)." }, { status: 400 });
    }
  }
  // PDF uploads (hero proposal, CV/resume) are meant to stay lightweight
  // documents, not scans — tighter cap than the generic ceiling below. Keyed
  // on the validated MIME type, not a client-supplied "kind", so every PDF
  // field gets this for free without each control having to opt in.
  if (file.type === "application/pdf" && file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "PDF too large (max 10MB)." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File too large (max 20MB)." }, { status: 400 });
  }

  const filename = randomUploadName(file.type);
  if (!filename) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(process.cwd(), "public", "uploads", filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
