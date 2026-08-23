import type { CSSProperties } from "react";
import type { TemplateProps } from "@/lib/wedding/template-registry";
import { displayFontVar, bodyFontVar } from "@/lib/wedding/fonts";
import { parseAnimationSettings } from "@/lib/wedding/animation-presets";
import WeddingMotionProvider from "@/components/wedding/animation/WeddingMotionProvider";
import SectionMotion from "@/components/wedding/animation/SectionMotion";
import Cover from "./sections/Cover";
import Couple from "./sections/Couple";
import Countdown from "./sections/Countdown";
import Events from "./sections/Events";
import LoveStory from "./sections/LoveStory";
import Gallery from "./sections/Gallery";
import Gift from "./sections/Gift";
import Rsvp from "./sections/Rsvp";
import Guestbook from "./sections/Guestbook";
import Closing from "./sections/Closing";
import "@/styles/wedding-motion.css";

export default function ClassicElegant({ invitation, guestName, preview = false }: TemplateProps) {
  const anim = parseAnimationSettings(invitation.animationSettings);
  const style = {
    "--w-primary": invitation.primaryColor,
    "--w-secondary": invitation.secondaryColor,
    "--w-accent": invitation.accentColor,
    "--w-bg": invitation.backgroundColor,
    "--w-font-display": `var(${displayFontVar(invitation.fontDisplay)})`,
    "--w-font-body": `var(${bodyFontVar(invitation.fontBody)})`,
  } as CSSProperties;

  return (
    <WeddingMotionProvider smoothScroll={anim.global.smoothScroll} preview={preview}>
      <main
        style={style}
        className="min-h-screen bg-[var(--w-bg)] font-[family-name:var(--w-font-body)] text-[#2E2A26] antialiased"
      >
        <Cover invitation={invitation} guestName={guestName} preview={preview} />
        <SectionMotion preset={anim.sections.couple} preview={preview}>
          <Couple invitation={invitation} />
        </SectionMotion>
        <SectionMotion preset={anim.sections.countdown} preview={preview}>
          <Countdown date={invitation.events[0]?.date ?? null} />
        </SectionMotion>
        <SectionMotion preset={anim.sections.events} preview={preview}>
          <Events events={invitation.events} />
        </SectionMotion>
        {invitation.storyText ? (
          <SectionMotion preset={anim.sections.story} preview={preview}>
            <LoveStory title={invitation.storyTitle} text={invitation.storyText} />
          </SectionMotion>
        ) : null}
        <SectionMotion preset={anim.sections.gallery} preview={preview}>
          <Gallery items={invitation.gallery} />
        </SectionMotion>
        <SectionMotion preset={anim.sections.gift} preview={preview}>
          <Gift gifts={invitation.gifts} />
        </SectionMotion>
        {invitation.isRsvpEnabled ? (
          <SectionMotion preset={anim.sections.rsvp} preview={preview}>
            <Rsvp invitationId={invitation.id} defaultName={guestName} />
          </SectionMotion>
        ) : null}
        {invitation.isGuestbookEnabled ? (
          <SectionMotion preset={anim.sections.guestbook} preview={preview}>
            <Guestbook invitationId={invitation.id} messages={invitation.messages} />
          </SectionMotion>
        ) : null}
        <SectionMotion preset={anim.sections.closing} preview={preview}>
          <Closing invitation={invitation} />
        </SectionMotion>
      </main>
    </WeddingMotionProvider>
  );
}
