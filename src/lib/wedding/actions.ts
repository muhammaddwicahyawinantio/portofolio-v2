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
  GIFT_TYPES,
  parseRsvp,
  parseMessage,
  type WeddingStatusValue,
  type GiftType,
} from "@/lib/wedding/validation";
import { TEMPLATES } from "@/lib/wedding/template-registry";
import { DISPLAY_FONTS, BODY_FONTS } from "@/lib/wedding/fonts";
import { parseAnimationSettings, SECTION_KEYS } from "@/lib/wedding/animation-presets";

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
  if (section === "animations") {
    const raw = {
      global: {
        smoothScroll: form.get("anim_smoothScroll") === "on",
        profile: form.get("anim_profile"),
        intensity: form.get("anim_intensity"),
        background: form.get("anim_background"),
      },
      sections: Object.fromEntries(SECTION_KEYS.map((k) => [k, form.get(`anim_section_${k}`)])),
    };
    // Validated to whitelisted preset values before it ever reaches the DB.
    return { animationSettings: parseAnimationSettings(raw) as Prisma.InputJsonValue };
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

// ── Child collections (events, gallery, gifts) ───────────────────────────────

async function invitationSlug(invitationId: string): Promise<string | null> {
  const inv = await prisma.weddingInvitation.findUnique({
    where: { id: invitationId },
    select: { slug: true },
  });
  return inv?.slug ?? null;
}

function intField(form: FormData, name: string): number {
  const n = Number(cleanText(form.get(name), 10));
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

async function revalidateChild(invitationId: string) {
  const slug = await invitationSlug(invitationId);
  revalidatePath(`/admin/wedding-invitations/${invitationId}`);
  if (slug) revalidatePath(`/undangan/${slug}`);
}

// ---- Events ----
export async function saveEvent(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const invitationId = String(form.get("__invitationId") ?? "");
  const id = String(form.get("__id") ?? "");
  if (!invitationId) return { error: "Undangan tidak dikenal." };

  const title = cleanText(form.get("title"), 150);
  const dateStr = cleanText(form.get("date"), 20);
  if (!title) return { error: "Judul acara wajib diisi." };
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return { error: "Tanggal tidak valid." };

  let mapsUrl: string | null;
  try {
    mapsUrl = urlField(form, "mapsUrl");
  } catch (e) {
    return { error: e instanceof Error ? e.message : "URL tidak valid." };
  }

  const data = {
    title,
    date,
    startTime: cleanText(form.get("startTime"), 10) || null,
    endTime: cleanText(form.get("endTime"), 10) || null,
    venueName: cleanText(form.get("venueName"), 200) || null,
    venueAddress: cleanText(form.get("venueAddress"), 500) || null,
    mapsUrl,
    description: cleanText(form.get("description"), 1000) || null,
    order: intField(form, "order"),
  };

  if (id) await prisma.weddingEvent.update({ where: { id }, data });
  else await prisma.weddingEvent.create({ data: { ...data, invitationId } });

  await revalidateChild(invitationId);
  redirect(`/admin/wedding-invitations/${invitationId}?tab=events&saved=1`);
}

export async function deleteEvent(form: FormData) {
  await requireAdmin();
  const id = String(form.get("__id") ?? "");
  const invitationId = String(form.get("__invitationId") ?? "");
  if (!id) return;
  await prisma.weddingEvent.delete({ where: { id } });
  await revalidateChild(invitationId);
}

// ---- Gallery ----
export async function saveGalleryItem(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const invitationId = String(form.get("__invitationId") ?? "");
  const id = String(form.get("__id") ?? "");
  if (!invitationId) return { error: "Undangan tidak dikenal." };
  const imageUrl = cleanText(form.get("imageUrl"), 500);
  if (!imageUrl || !isSafeUrl(imageUrl)) return { error: "Gambar wajib diunggah." };
  const data = {
    imageUrl,
    caption: cleanText(form.get("caption"), 200) || null,
    order: intField(form, "order"),
  };
  if (id) await prisma.weddingGallery.update({ where: { id }, data });
  else await prisma.weddingGallery.create({ data: { ...data, invitationId } });
  await revalidateChild(invitationId);
  redirect(`/admin/wedding-invitations/${invitationId}?tab=gallery&saved=1`);
}

export async function deleteGalleryItem(form: FormData) {
  await requireAdmin();
  const id = String(form.get("__id") ?? "");
  const invitationId = String(form.get("__invitationId") ?? "");
  if (!id) return;
  await prisma.weddingGallery.delete({ where: { id } });
  await revalidateChild(invitationId);
}

// ---- Gifts ----
export async function saveGift(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const invitationId = String(form.get("__invitationId") ?? "");
  const id = String(form.get("__id") ?? "");
  if (!invitationId) return { error: "Undangan tidak dikenal." };
  const type = String(form.get("type") ?? "");
  if (!GIFT_TYPES.includes(type as GiftType)) return { error: "Tipe gift tidak valid." };
  let qrImage: string | null;
  try {
    qrImage = urlField(form, "qrImage");
  } catch (e) {
    return { error: e instanceof Error ? e.message : "URL tidak valid." };
  }
  const data = {
    type: type as GiftType,
    providerName: cleanText(form.get("providerName"), 150) || null,
    accountNumber: cleanText(form.get("accountNumber"), 100) || null,
    accountName: cleanText(form.get("accountName"), 150) || null,
    address: cleanText(form.get("address"), 500) || null,
    qrImage,
    notes: cleanText(form.get("notes"), 500) || null,
    order: intField(form, "order"),
  };
  if (id) await prisma.weddingGift.update({ where: { id }, data });
  else await prisma.weddingGift.create({ data: { ...data, invitationId } });
  await revalidateChild(invitationId);
  redirect(`/admin/wedding-invitations/${invitationId}?tab=gifts&saved=1`);
}

export async function deleteGift(form: FormData) {
  await requireAdmin();
  const id = String(form.get("__id") ?? "");
  const invitationId = String(form.get("__invitationId") ?? "");
  if (!id) return;
  await prisma.weddingGift.delete({ where: { id } });
  await revalidateChild(invitationId);
}

// ── Public submissions (no auth) + guestbook moderation ──────────────────────

export type PublicFormState = { error?: string; success?: boolean } | null;

export async function submitRsvp(_prev: PublicFormState, form: FormData): Promise<PublicFormState> {
  const invitationId = String(form.get("invitationId") ?? "");
  const inv = await prisma.weddingInvitation.findUnique({
    where: { id: invitationId },
    select: { status: true, isRsvpEnabled: true, slug: true },
  });
  if (!inv || inv.status !== "published" || !inv.isRsvpEnabled) {
    return { error: "Undangan tidak tersedia." };
  }

  const parsed = parseRsvp({
    guestName: form.get("guestName"),
    attendanceStatus: form.get("attendanceStatus"),
    guestCount: form.get("guestCount"),
    message: form.get("message"),
  });
  if (!parsed.ok) return { error: parsed.error };

  await prisma.weddingRsvp.create({ data: { invitationId, ...parsed.value } });
  revalidatePath(`/undangan/${inv.slug}`);
  return { success: true };
}

export async function submitMessage(
  _prev: PublicFormState,
  form: FormData,
): Promise<PublicFormState> {
  const invitationId = String(form.get("invitationId") ?? "");
  const inv = await prisma.weddingInvitation.findUnique({
    where: { id: invitationId },
    select: { status: true, isGuestbookEnabled: true, slug: true },
  });
  if (!inv || inv.status !== "published" || !inv.isGuestbookEnabled) {
    return { error: "Undangan tidak tersedia." };
  }

  const parsed = parseMessage({ guestName: form.get("guestName"), message: form.get("message") });
  if (!parsed.ok) return { error: parsed.error };

  await prisma.weddingMessage.create({ data: { invitationId, ...parsed.value } }); // isVisible defaults true
  revalidatePath(`/undangan/${inv.slug}`);
  return { success: true };
}

export async function toggleMessageVisible(form: FormData) {
  await requireAdmin();
  const id = String(form.get("__id") ?? "");
  const invitationId = String(form.get("__invitationId") ?? "");
  const isVisible = form.get("__isVisible") === "true";
  if (!id) return;
  await prisma.weddingMessage.update({ where: { id }, data: { isVisible: !isVisible } });
  await revalidateChild(invitationId);
}

export async function deleteMessage(form: FormData) {
  await requireAdmin();
  const id = String(form.get("__id") ?? "");
  const invitationId = String(form.get("__invitationId") ?? "");
  if (!id) return;
  await prisma.weddingMessage.delete({ where: { id } });
  await revalidateChild(invitationId);
}
