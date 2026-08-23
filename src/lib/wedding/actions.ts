"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  isValidSlug,
  isSafeUrl,
  cleanText,
  WEDDING_STATUSES,
  type WeddingStatusValue,
} from "@/lib/wedding/validation";
import { TEMPLATES } from "@/lib/wedding/template-registry";
import { DISPLAY_FONTS, BODY_FONTS } from "@/lib/wedding/fonts";

export type FormState = { error?: string } | null;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

function urlField(form: FormData, name: string): string | null {
  const v = cleanText(form.get(name), 500);
  if (!v) return null;
  if (!isSafeUrl(v)) throw new Error(`${name} harus diawali http://, https://, atau /.`);
  return v;
}

function hex(form: FormData, name: string, fallback: string): string {
  const v = cleanText(form.get(name), 20);
  return /^#[0-9a-fA-F]{6}$/.test(v) ? v : fallback;
}

function buildSectionData(section: string, form: FormData): Record<string, unknown> {
  if (section === "main") {
    const title = cleanText(form.get("title"), 150);
    const slug = cleanText(form.get("slug"), 150).toLowerCase();
    if (!title) throw new Error("Judul wajib diisi.");
    if (!isValidSlug(slug)) throw new Error("Slug hanya huruf kecil, angka, dan tanda hubung.");
    const status = String(form.get("status") ?? "draft");
    if (!WEDDING_STATUSES.includes(status as WeddingStatusValue)) throw new Error("Status tidak valid.");
    const templateSlug = String(form.get("templateSlug") ?? "");
    if (!(templateSlug in TEMPLATES)) throw new Error("Template tidak valid.");
    return {
      title,
      slug,
      status,
      templateSlug,
      coverImage: urlField(form, "coverImage"),
      openingText: cleanText(form.get("openingText"), 1000) || null,
      quoteText: cleanText(form.get("quoteText"), 1000) || null,
      storyTitle: cleanText(form.get("storyTitle"), 150) || null,
      storyText: cleanText(form.get("storyText"), 4000) || null,
    };
  }
  if (section === "couple") {
    const brideName = cleanText(form.get("brideName"), 100);
    const groomName = cleanText(form.get("groomName"), 100);
    if (!brideName || !groomName) throw new Error("Nama kedua mempelai wajib diisi.");
    return {
      brideName,
      groomName,
      brideFullName: cleanText(form.get("brideFullName"), 150) || null,
      groomFullName: cleanText(form.get("groomFullName"), 150) || null,
      brideParents: cleanText(form.get("brideParents"), 500) || null,
      groomParents: cleanText(form.get("groomParents"), 500) || null,
      bridePhoto: urlField(form, "bridePhoto"),
      groomPhoto: urlField(form, "groomPhoto"),
    };
  }
  if (section === "settings") {
    const fontDisplay = String(form.get("fontDisplay") ?? "");
    const fontBody = String(form.get("fontBody") ?? "");
    if (!DISPLAY_FONTS.some((f) => f.key === fontDisplay)) throw new Error("Font display tidak valid.");
    if (!BODY_FONTS.some((f) => f.key === fontBody)) throw new Error("Font body tidak valid.");
    return {
      primaryColor: hex(form, "primaryColor", "#5A6B4E"),
      secondaryColor: hex(form, "secondaryColor", "#B98A7A"),
      accentColor: hex(form, "accentColor", "#C9A15A"),
      backgroundColor: hex(form, "backgroundColor", "#F7F3EC"),
      fontDisplay,
      fontBody,
      musicUrl: urlField(form, "musicUrl"),
      isMusicEnabled: form.get("isMusicEnabled") === "on",
      isRsvpEnabled: form.get("isRsvpEnabled") === "on",
      isGuestbookEnabled: form.get("isGuestbookEnabled") === "on",
    };
  }
  throw new Error("Section tidak dikenal.");
}

export async function saveInvitation(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(form.get("__id") ?? "");
  const section = String(form.get("__section") ?? "");

  let data: Record<string, unknown>;
  try {
    data = buildSectionData(section, form);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Input tidak valid." };
  }

  let targetId = id;
  try {
    if (id) {
      await prisma.weddingInvitation.update({ where: { id }, data });
    } else {
      // Create only from /new (section "main"); couple names required by schema.
      const brideName = cleanText(form.get("brideName"), 100);
      const groomName = cleanText(form.get("groomName"), 100);
      if (!brideName || !groomName) return { error: "Nama kedua mempelai wajib diisi." };
      const created = await prisma.weddingInvitation.create({
        data: { ...data, brideName, groomName } as Prisma.WeddingInvitationCreateInput,
      });
      targetId = created.id;
    }
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "Slug sudah dipakai undangan lain." };
    }
    return { error: err instanceof Error ? err.message : "Gagal menyimpan." };
  }

  revalidatePath("/admin/wedding-invitations");
  const inv = await prisma.weddingInvitation.findUnique({
    where: { id: targetId },
    select: { slug: true },
  });
  if (inv) revalidatePath(`/undangan/${inv.slug}`);
  redirect(`/admin/wedding-invitations/${targetId}?tab=${id ? section : "couple"}&saved=1`);
}

export async function deleteInvitation(form: FormData) {
  await requireAdmin();
  const id = String(form.get("__id") ?? "");
  if (!id) return;
  await prisma.weddingInvitation.delete({ where: { id } });
  revalidatePath("/admin/wedding-invitations");
  redirect("/admin/wedding-invitations");
}

export async function togglePublish(form: FormData) {
  await requireAdmin();
  const id = String(form.get("__id") ?? "");
  if (!id) return;
  const current = await prisma.weddingInvitation.findUnique({
    where: { id },
    select: { status: true, slug: true },
  });
  if (!current) return;
  const next = current.status === "published" ? "draft" : "published";
  await prisma.weddingInvitation.update({
    where: { id },
    data: { status: next, publishedAt: next === "published" ? new Date() : null },
  });
  revalidatePath("/admin/wedding-invitations");
  revalidatePath(`/undangan/${current.slug}`);
}
