import type { CSSProperties } from "react";
import type { TemplateProps } from "@/lib/wedding/template-registry";
import { displayFontVar, bodyFontVar } from "@/lib/wedding/fonts";
import Couple from "./sections/Couple";
import Events from "./sections/Events";
import LoveStory from "./sections/LoveStory";
import Gallery from "./sections/Gallery";
import Closing from "./sections/Closing";

export default function ClassicElegant({ invitation }: TemplateProps) {
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
      <Couple invitation={invitation} />
      <Events events={invitation.events} />
      {invitation.storyText ? (
        <LoveStory title={invitation.storyTitle} text={invitation.storyText} />
      ) : null}
      <Gallery items={invitation.gallery} />
      <Closing invitation={invitation} />
    </main>
  );
}
