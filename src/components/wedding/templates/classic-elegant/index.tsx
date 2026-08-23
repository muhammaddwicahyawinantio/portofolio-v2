import type { CSSProperties } from "react";
import type { TemplateProps } from "@/lib/wedding/template-registry";
import { displayFontVar, bodyFontVar } from "@/lib/wedding/fonts";
import Section from "@/components/wedding/shared/Section";

export default function ClassicElegant({ invitation, guestName }: TemplateProps) {
  const style = {
    "--w-primary": invitation.primaryColor,
    "--w-secondary": invitation.secondaryColor,
    "--w-accent": invitation.accentColor,
    "--w-bg": invitation.backgroundColor,
    "--w-font-display": `var(${displayFontVar(invitation.fontDisplay)})`,
    "--w-font-body": `var(${bodyFontVar(invitation.fontBody)})`,
  } as CSSProperties;

  return (
    <main
      style={style}
      className="min-h-screen bg-[var(--w-bg)] font-[family-name:var(--w-font-body)] text-[#2E2A26] antialiased"
    >
      {/* Placeholders — replaced in Tasks 7–8. */}
      <Section className="text-center">
        <p className="font-[family-name:var(--w-font-display)] text-4xl text-[var(--w-primary)]">
          {invitation.brideName} &amp; {invitation.groomName}
        </p>
        <p className="mt-2 text-sm">{guestName ? `Kepada: ${guestName}` : "The Wedding Of"}</p>
      </Section>
    </main>
  );
}
