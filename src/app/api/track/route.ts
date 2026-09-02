import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimited } from "@/lib/rate-limit";

/**
 * Beacon kunjungan publik: satu increment per panggilan, di-bucket per hari
 * UTC (sama seperti seed & VisitorChart di dashboard admin). Dipanggil dari
 * VisitorTracker (client, di [locale]/layout.tsx) — layout admin/API/aset
 * statis tidak pernah merender komponen itu, jadi rute ini otomatis tidak
 * pernah dipanggil dari sana.
 */
// Dedupe di VisitorTracker memakai localStorage, jadi ia hanya mengikat
// browser yang jujur — rute ini sendiri publik dan tanpa autentikasi, jadi
// `curl` dalam loop bisa menaikkan angka dashboard sesuka hati. Penjaga
// per-IP di sini yang menutupnya. Batasnya longgar (kunjungan sah cuma butuh
// SATU) supaya kantor/kampus di belakang satu NAT tidak ikut terpotong.
const TRACK_LIMIT = 30;
const TRACK_WINDOW_MS = 60 * 60 * 1000;

export async function POST() {
  if (rateLimited(`track:${await clientIp()}`, TRACK_LIMIT, TRACK_WINDOW_MS)) {
    // Tetap 200: beacon tidak boleh pernah menampakkan apa pun ke pengunjung.
    return NextResponse.json({ ok: true });
  }

  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  try {
    await prisma.visitorStat.upsert({
      where: { date: today },
      update: { count: { increment: 1 } },
      create: { date: today, count: 1 },
    });
  } catch (err) {
    console.error("[track] gagal mencatat kunjungan:", err);
  }

  // Selalu 200: beacon fire-and-forget, kegagalan di sini tidak boleh pernah
  // terlihat pengunjung atau memengaruhi halaman yang memanggilnya.
  return NextResponse.json({ ok: true });
}
