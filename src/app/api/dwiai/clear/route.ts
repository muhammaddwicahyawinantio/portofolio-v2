import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  DWIAI_COOKIE_NAME,
  dwiAiExpiresAt,
  dwiAiGreeting,
  getDwiAiSettingForAdmin,
  serializeDwiAiCookie,
  toPrismaMessages,
} from "@/lib/dwiai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(DWIAI_COOKIE_NAME)?.value || crypto.randomUUID();
  const setting = await getDwiAiSettingForAdmin();
  const messages = [dwiAiGreeting(setting.assistantName)];
  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

  await prisma.dwiAiSession.upsert({
    where: { sessionId },
    update: {
      ipAddress,
      messages: toPrismaMessages(messages),
      expiresAt: dwiAiExpiresAt(),
    },
    create: {
      sessionId,
      ipAddress,
      messages: toPrismaMessages(messages),
      expiresAt: dwiAiExpiresAt(),
    },
  });

  const response = NextResponse.json({ messages });
  response.headers.append("Set-Cookie", serializeDwiAiCookie(sessionId));
  return response;
}
