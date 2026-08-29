"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  isAvatarFile,
  storeTestimonialAvatar,
  validateAvatarFile,
} from "@/lib/testimonials/upload";
import {
  adminTestimonialSchema,
  publicTestimonialSchema,
  type AdminTestimonialInput,
} from "@/lib/testimonials/validation";

export type PublicTestimonialState = {
  ok?: true;
  message?: string;
  error?: string;
} | null;

export type AdminTestimonialState = { error?: string } | null;

function valuesFrom(form: FormData) {
  return {
    name: String(form.get("name") ?? ""),
    position: String(form.get("position") ?? ""),
    content: String(form.get("content") ?? ""),
    rating: String(form.get("rating") ?? "5"),
  };
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

async function readAvatar(form: FormData, existingAvatar?: string | null) {
  const file = form.get("avatar");
  if (!isAvatarFile(file)) return existingAvatar ?? null;

  validateAvatarFile(file);
  return storeTestimonialAvatar(file);
}

function firstZodError(error: unknown) {
  if (error && typeof error === "object" && "issues" in error) {
    const issues = (error as { issues?: Array<{ message?: string }> }).issues;
    return issues?.[0]?.message;
  }

  return null;
}

export async function submitPublicTestimonial(
  _prev: PublicTestimonialState,
  form: FormData,
): Promise<PublicTestimonialState> {
  let parsed;

  try {
    parsed = publicTestimonialSchema.parse(valuesFrom(form));
    const avatar = await readAvatar(form);

    await prisma.testimonial.create({
      data: {
        ...parsed,
        avatar,
        // Default to inactive until approved by admin.
        isActive: false,
      },
    });
  } catch (error) {
    return {
      error:
        firstZodError(error) ??
        (error instanceof Error ? error.message : "Could not submit your story."),
    };
  }

  revalidatePath("/admin/testimonials");

  return {
    ok: true,
    message: "Terima kasih! Ceritamu sudah dikirim dan sedang direview.",
  };
}

export async function saveAdminTestimonial(
  _prev: AdminTestimonialState,
  form: FormData,
): Promise<AdminTestimonialState> {
  await requireAdmin();

  const id = String(form.get("__id") ?? "");
  const existingAvatar = String(form.get("__avatar") ?? "") || null;
  let parsed: AdminTestimonialInput;
  let avatar: string | null;

  try {
    parsed = adminTestimonialSchema.parse({
      ...valuesFrom(form),
      isActive: form.get("isActive") === "on",
    });
    avatar = await readAvatar(form, existingAvatar);
  } catch (error) {
    return {
      error:
        firstZodError(error) ??
        (error instanceof Error ? error.message : "Could not save testimonial."),
    };
  }

  if (id) {
    await prisma.testimonial.update({
      where: { id },
      data: { ...parsed, avatar },
    });
  } else {
    await prisma.testimonial.create({
      data: {
        ...parsed,
        avatar,
        isActive: true,
      },
    });
  }

  revalidatePath("/admin/testimonials");
  revalidatePath("/", "layout");
  redirect("/admin/testimonials?saved=1");
}

export async function toggleTestimonialStatus(form: FormData) {
  await requireAdmin();

  const id = String(form.get("__id") ?? "");
  const isActive = form.get("__isActive") === "true";
  if (!id) return;

  await prisma.testimonial.update({ where: { id }, data: { isActive: !isActive } });
  revalidatePath("/admin/testimonials");
  revalidatePath("/", "layout");
}

export async function deleteTestimonial(form: FormData) {
  await requireAdmin();

  const id = String(form.get("__id") ?? "");
  if (!id) return;

  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/admin/testimonials");
  revalidatePath("/", "layout");
}
