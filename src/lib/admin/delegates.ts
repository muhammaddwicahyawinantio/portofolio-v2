import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * ponytail: delegate Prisma di-cast ke bentuk struktural minimal. Tiap model
 * punya tipe argumen sendiri, dan mempertahankan tipe penuh di jalur dinamis
 * butuh generic berlapis yang jauh lebih panjang daripada nilainya. Keamanan
 * datang dari whitelist field di parseFields, bukan dari tipe.
 * Upgrade path: kalau satu modul butuh perilaku khusus, pecah modul itu jadi
 * halaman sendiri — jangan tambah opsi di sini.
 */
type Delegate = {
  findMany: (args?: unknown) => Promise<Record<string, unknown>[]>;
  findFirst: (args?: unknown) => Promise<Record<string, unknown> | null>;
  create: (args: unknown) => Promise<unknown>;
  update: (args: unknown) => Promise<unknown>;
  upsert: (args: unknown) => Promise<unknown>;
  delete: (args: unknown) => Promise<unknown>;
  count: (args?: unknown) => Promise<number>;
};

const DELEGATES: Record<string, Delegate> = {
  projects: prisma.project as unknown as Delegate,
  services: prisma.service as unknown as Delegate,
  products: prisma.product as unknown as Delegate,
  features: prisma.feature as unknown as Delegate,
  hero: prisma.heroSection as unknown as Delegate,
  benefits: prisma.benefit as unknown as Delegate,
  contact: prisma.contactSettings as unknown as Delegate,
  about: prisma.about as unknown as Delegate,
  "work-experience": prisma.workExperience as unknown as Delegate,
  education: prisma.education as unknown as Delegate,
  skills: prisma.skill as unknown as Delegate,
  certifications: prisma.certification as unknown as Delegate,
  testimonials: prisma.testimonial as unknown as Delegate,
  "media-gallery": prisma.mediaGalleryItem as unknown as Delegate,
  music: prisma.musicItem as unknown as Delegate,
  films: prisma.filmItem as unknown as Delegate,
  footer: prisma.footerContent as unknown as Delegate,
  "social-links": prisma.socialLink as unknown as Delegate,
  navigation: prisma.navigationItem as unknown as Delegate,
  messages: prisma.message as unknown as Delegate,
};

export function getDelegate(key: string): Delegate | undefined {
  return DELEGATES[key];
}
