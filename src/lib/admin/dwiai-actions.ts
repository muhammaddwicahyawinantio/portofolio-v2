"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  DEFAULT_DWIAI_MODEL,
  DEFAULT_DWIAI_SETTING,
  DWIAI_MODEL_OPTIONS,
} from "@/lib/dwiai";
import { prisma } from "@/lib/prisma";

function field(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

export async function saveDwiAiSettings(form: FormData) {
  await requireAdmin();

  const id = field(form, "id");
  const assistantName = field(form, "assistantName") || DEFAULT_DWIAI_SETTING.assistantName;
  const systemPrompt = field(form, "systemPrompt") || DEFAULT_DWIAI_SETTING.systemPrompt;
  const behaviorDescription = field(form, "behaviorDescription") || null;
  const rawModel = field(form, "model");
  const model = DWIAI_MODEL_OPTIONS.includes(rawModel as (typeof DWIAI_MODEL_OPTIONS)[number])
    ? rawModel
    : DEFAULT_DWIAI_MODEL;
  const parsedTemperature = Number(field(form, "temperature"));
  const parsedMaxTokens = Number(field(form, "maxTokens"));
  const isActive = form.get("isActive") === "on";
  const data = {
    assistantName,
    systemPrompt,
    behaviorDescription,
    model,
    temperature: Number.isFinite(parsedTemperature) ? clamp(parsedTemperature, 0, 2) : 0.7,
    maxTokens: Number.isFinite(parsedMaxTokens) ? Math.max(1, Math.trunc(parsedMaxTokens)) : 4000,
    isActive,
  };

  const existing = id
    ? await prisma.dwiAiSetting.findUnique({ where: { id } })
    : await prisma.dwiAiSetting.findFirst({ orderBy: { updatedAt: "desc" } });
  const rowId = existing?.id;

  const saved = rowId
    ? await prisma.dwiAiSetting.update({ where: { id: rowId }, data })
    : await prisma.dwiAiSetting.create({ data });

  await prisma.dwiAiSetting.updateMany({
    where: { id: { not: saved.id } },
    data: { isActive: false },
  });

  revalidatePath("/admin/dwiai-settings");
  revalidatePath("/admin/ai-chat");
  redirect("/admin/dwiai-settings?saved=1");
}
