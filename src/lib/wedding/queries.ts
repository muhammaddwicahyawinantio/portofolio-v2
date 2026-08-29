import "server-only";
import { prisma } from "@/lib/prisma";

export function listInvitations() {
  return prisma.weddingInvitation.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      templateSlug: true,
      brideName: true,
      groomName: true,
      updatedAt: true,
    },
  });
}

export function getInvitationForEdit(id: string) {
  return prisma.weddingInvitation.findUnique({
    where: { id },
    include: {
      events: { orderBy: { order: "asc" } },
      gallery: { orderBy: { order: "asc" } },
      gifts: { orderBy: { order: "asc" } },
      rsvps: { orderBy: { createdAt: "desc" } },
      messages: { orderBy: { createdAt: "desc" } },
    },
  });
}

export function getPublishedInvitation(slug: string) {
  return prisma.weddingInvitation.findFirst({
    where: { slug, status: "published" },
    include: {
      events: { orderBy: { order: "asc" } },
      gallery: { orderBy: { order: "asc" } },
      gifts: { orderBy: { order: "asc" } },
      messages: { where: { isVisible: true }, orderBy: { createdAt: "desc" } },
    },
  });
}

export type InvitationListItem = Awaited<ReturnType<typeof listInvitations>>[number];
export type EditInvitation = NonNullable<Awaited<ReturnType<typeof getInvitationForEdit>>>;
export type PublicInvitation = NonNullable<Awaited<ReturnType<typeof getPublishedInvitation>>>;
