import { getTemplate } from "@/lib/wedding/template-registry";
import type { WeddingPreviewData } from "@/components/wedding/types";

/**
 * The single render path for a wedding invitation, shared by the public route
 * (`/undangan/[slug]`) and the admin realtime preview — so a template is never
 * wired up in two places. Resolves the template by slug (falling back to
 * classic-elegant via getTemplate) and renders it. No hooks, so it works as a
 * server component on the public route and inside the client preview tree.
 */
export default function WeddingTemplateRenderer({
  invitation,
  guestName,
  preview = false,
}: {
  invitation: WeddingPreviewData;
  guestName: string | null;
  preview?: boolean;
}) {
  const Template = getTemplate(invitation.templateSlug).component;
  return <Template invitation={invitation} guestName={guestName} preview={preview} />;
}
