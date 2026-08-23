import type { CSSProperties } from "react";
import type { TemplateProps } from "@/lib/wedding/template-registry";
import { displayFontVar, bodyFontVar } from "@/lib/wedding/fonts";
import Cover from "./sections/Cover";
import Couple from "./sections/Couple";
import Countdown from "./sections/Countdown";
import Events from "./sections/Events";
import LoveStory from "./sections/LoveStory";
import Gallery from "./sections/Gallery";
import Gift from "./sections/Gift";
import Closing from "./sections/Closing";

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
      <Cover invitation={invitation} guestName={guestName} />
      <Couple invitation={invitation} />
      <Countdown date={invitation.events[0]?.date ?? null} />
      <Events events={invitation.events} />
      {invitation.storyText ? (
        <LoveStory title={invitation.storyTitle} text={invitation.storyText} />
      ) : null}
      <Gallery items={invitation.gallery} />
      <Gift gifts={invitation.gifts} />
      <Closing invitation={invitation} />
    </main>
  );
}
