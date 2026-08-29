import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function cleanupExpiredSessions() {
  return prisma.dwiAiSession.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}

export async function GET() {
  const result = await cleanupExpiredSessions();
  return NextResponse.json({ deleted: result.count });
}

export async function POST() {
  const result = await cleanupExpiredSessions();
  return NextResponse.json({ deleted: result.count });
}
