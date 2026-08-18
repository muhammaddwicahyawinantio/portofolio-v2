"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { getResource, parseFields } from "@/lib/admin/resources";
import { getDelegate } from "@/lib/admin/delegates";

export type FormState = { error?: string } | null;

/**
 * Setiap aksi memeriksa sesi sendiri. Layout admin sudah memblokir tamu, tapi
 * server action adalah endpoint HTTP tersendiri — kalau hanya mengandalkan
 * penjagaan di layout, siapa pun bisa memanggilnya langsung.
 */
async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

export async function saveRecord(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();

  const key = String(form.get("__resource") ?? "");
  const id = String(form.get("__id") ?? "");
  const resource = getResource(key);
  const delegate = getDelegate(key);

  if (!resource || !delegate || resource.readOnly) return { error: "Unknown resource." };

  let data: Record<string, unknown>;
  try {
    data = parseFields(resource, form);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Invalid input." };
  }

  try {
    if (resource.singleton) {
      // Baris tunggal dengan id tetap, jadi menyimpan dua kali tidak pernah
      // menghasilkan baris kedua.
      await delegate.upsert({
        where: { id: "footer" },
        update: data,
        create: { id: "footer", ...data },
      });
    } else if (id) {
      await delegate.update({ where: { id }, data });
    } else {
      await delegate.create({ data });
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not save." };
  }

  revalidatePath(`/admin/${key}`);
  redirect(`/admin/${key}?saved=1`);
}

export async function deleteRecord(form: FormData) {
  await requireAdmin();

  const key = String(form.get("__resource") ?? "");
  const id = String(form.get("__id") ?? "");
  const delegate = getDelegate(key);
  if (!delegate || !id) return;

  await delegate.delete({ where: { id } });
  revalidatePath(`/admin/${key}`);
}

export async function toggleMessageRead(form: FormData) {
  await requireAdmin();

  const id = String(form.get("__id") ?? "");
  const isRead = form.get("__isRead") === "true";
  if (!id) return;

  const delegate = getDelegate("messages");
  await delegate?.update({ where: { id }, data: { isRead: !isRead } });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function signOutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
