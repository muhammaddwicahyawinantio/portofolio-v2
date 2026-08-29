import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const DWIAI_COOKIE_NAME = "dwiai_session_id";
export const DWIAI_TTL_SECONDS = 60 * 60 * 24;
export const DEFAULT_DWIAI_MODEL = "openai/gpt-oss-20b";
export const DWIAI_GENERIC_ERROR = "Maaf, Dwi AI lagi ada gangguan. Coba lagi sebentar ya.";
export const DWIAI_INACTIVE_MESSAGE = "Maaf, Dwi AI sedang tidak aktif saat ini.";

export const DWIAI_MODEL_OPTIONS = [
  "openai/gpt-oss-20b",
  "groq/compound-mini",
  "groq/compound",
  "openai/gpt-oss-120b",
] as const;

export type DwiAiRole = "user" | "assistant";
export type DwiAiMessage = { role: DwiAiRole; content: string };

export const DEFAULT_DWIAI_SETTING = {
  assistantName: "Dwi AI",
  systemPrompt:
    "Kamu adalah Dwi AI, asisten custom milik website Dwi Studio. Tugasmu hanya membantu pengunjung memahami konteks website ini: Dwi Studio, portofolio/proyek, layanan pembuatan website, undangan pernikahan digital, landing page, company profile/e-commerce, ERP/e-learning, custom web app, produk digital, dan cara menghubungi Dwi Studio. Jawab singkat, ramah, dan langsung ke inti dalam bahasa pengguna. Jangan memperluas pembahasan ke topik umum yang jauh dari website ini. Kalau pertanyaan di luar konteks Dwi Studio, arahkan pelan-pelan kembali ke layanan, proyek, atau kontak Dwi Studio.",
  behaviorDescription:
    "Asisten ringan untuk pengunjung website: fokus konteks Dwi Studio, tidak melebar, dan membantu calon klien menemukan layanan yang tepat.",
  temperature: 0.7,
  maxTokens: 4000,
  model: DEFAULT_DWIAI_MODEL,
  isActive: true,
};

export function dwiAiExpiresAt() {
  return new Date(Date.now() + DWIAI_TTL_SECONDS * 1000);
}

export function dwiAiGreeting(assistantName = "Dwi AI"): DwiAiMessage {
  return {
    role: "assistant",
    content: `Halo, aku ${assistantName}. Ada yang bisa aku bantu hari ini?`,
  };
}

export function parseDwiAiMessages(value: Prisma.JsonValue | null | undefined): DwiAiMessage[] {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is DwiAiMessage => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return false;
    const record = item as Record<string, unknown>;
    return (
      (record.role === "user" || record.role === "assistant") &&
      typeof record.content === "string"
    );
  });
}

export function serializeDwiAiCookie(sessionId: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${DWIAI_COOKIE_NAME}=${sessionId}; Path=/; Max-Age=${DWIAI_TTL_SECONDS}; HttpOnly; SameSite=Lax${secure}`;
}

export async function getActiveDwiAiSetting() {
  const active = await prisma.dwiAiSetting.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
  });
  if (active) return active;

  const count = await prisma.dwiAiSetting.count();
  if (count > 0) return null;

  return prisma.dwiAiSetting.create({ data: DEFAULT_DWIAI_SETTING });
}

export async function getDwiAiSettingForAdmin() {
  const setting = await prisma.dwiAiSetting.findFirst({ orderBy: { updatedAt: "desc" } });
  if (setting) return setting;
  return prisma.dwiAiSetting.create({ data: DEFAULT_DWIAI_SETTING });
}

export function normalizeDwiAiModel(model: string | null | undefined) {
  return model?.trim() || DEFAULT_DWIAI_MODEL;
}

export function toPrismaMessages(messages: DwiAiMessage[]) {
  return messages as unknown as Prisma.InputJsonValue;
}
