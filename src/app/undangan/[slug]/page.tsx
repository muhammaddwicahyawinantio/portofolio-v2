import { notFound } from "next/navigation";
import { getPublishedInvitation } from "@/lib/wedding/queries";
import { cleanText } from "@/lib/wedding/validation";

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

  // Replaced by the template render in Task 6.
  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <p>
        {invitation.brideName} &amp; {invitation.groomName}
      </p>
      <p>Guest: {guestName ?? "(none)"}</p>
      <p>
        Events: {invitation.events.length} · Gallery: {invitation.gallery.length}
      </p>
    </main>
  );
}
