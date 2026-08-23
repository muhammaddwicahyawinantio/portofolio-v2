import { notFound } from "next/navigation";
import { getPublishedInvitation } from "@/lib/wedding/queries";
import { getTemplate } from "@/lib/wedding/template-registry";
import { cleanText } from "@/lib/wedding/validation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const inv = await getPublishedInvitation(slug);
  if (!inv) return { title: "Undangan" };
  return { title: `${inv.brideName} & ${inv.groomName} — Undangan Pernikahan` };
}

export default async function InvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string }>;
}) {
  const { slug } = await params;
  const { to } = await searchParams;
  const invitation = await getPublishedInvitation(slug);
  if (!invitation) notFound();

  const guestName = to ? cleanText(to, 100) || null : null;
  const Template = getTemplate(invitation.templateSlug).component;
  return <Template invitation={invitation} guestName={guestName} />;
}
