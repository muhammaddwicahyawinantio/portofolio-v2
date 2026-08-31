import type { CSSProperties } from "react";
import type { TemplateProps } from "@/lib/wedding/template-registry";
import { displayFontVar, bodyFontVar } from "@/lib/wedding/fonts";
import { parseAnimationSettings } from "@/lib/wedding/animation-presets";
import WeddingMotionProvider from "@/components/wedding/animation/WeddingMotionProvider";
import SectionMotion from "@/components/wedding/animation/SectionMotion";
import OpeningGate from "./sections/OpeningGate";
import CoverSlide from "./sections/CoverSlide";
import QuoteSlide from "./sections/QuoteSlide";
import CoupleSlide from "./sections/CoupleSlide";
import StorySlide from "./sections/StorySlide";
import EventsSlide from "./sections/EventsSlide";
import CountdownSlide from "./sections/CountdownSlide";
import GallerySlide from "./sections/GallerySlide";
import GiftSlide from "./sections/GiftSlide";
import RsvpSlide from "./sections/RsvpSlide";
import GuestbookSlide from "./sections/GuestbookSlide";
import ClosingSlide from "./sections/ClosingSlide";
import { photoBackgroundStyle } from "./utils";
import "@/styles/wedding-motion.css";

export default function WeddinglyFree({ invitation, guestName, preview = false }: TemplateProps) {
  const anim = parseAnimationSettings(invitation.animationSettings);
  const style = {
    "--w-primary": invitation.primaryColor,
    "--w-secondary": invitation.secondaryColor,
    "--w-accent": invitation.accentColor,
    "--w-bg": invitation.backgroundColor,
    "--w-font-display": `var(${displayFontVar(invitation.fontDisplay)})`,
    "--w-font-body": `var(${bodyFontVar(invitation.fontBody)})`,
  } as CSSProperties;

  const panelPhoto = invitation.coverImage ?? invitation.bridePhoto ?? invitation.groomPhoto ?? null;

  return (
    <WeddingMotionProvider smoothScroll={anim.global.smoothScroll} preview={preview}>
      <main style={style} className="font-[family-name:var(--w-font-body)] text-[#2E2A26] antialiased">
        <OpeningGate invitation={invitation} guestName={guestName} preview={preview} />

        <div className="lg:grid lg:grid-cols-[42%_58%]">
          <div
            aria-hidden
            className="hidden lg:sticky lg:top-0 lg:block lg:h-dvh"
            style={photoBackgroundStyle(panelPhoto)}
          />

          <div>
            <SectionMotion preset={anim.sections.cover} preview={preview} className="snap-start">
              <CoverSlide invitation={invitation} />
            </SectionMotion>
            <SectionMotion preset="fade-up" preview={preview} className="snap-start">
              <QuoteSlide quoteText={invitation.quoteText} />
            </SectionMotion>
            <SectionMotion preset={anim.sections.couple} preview={preview} className="snap-start">
              <CoupleSlide invitation={invitation} scroll={anim.sections.couple} preview={preview} />
            </SectionMotion>
            {invitation.storyText ? (
              <SectionMotion preset={anim.sections.story} preview={preview} className="snap-start">
                <StorySlide title={invitation.storyTitle} text={invitation.storyText} />
              </SectionMotion>
            ) : null}
            <SectionMotion preset={anim.sections.events} preview={preview} className="snap-start">
              <EventsSlide events={invitation.events} />
            </SectionMotion>
            <SectionMotion preset={anim.sections.countdown} preview={preview} className="snap-start">
              <CountdownSlide date={invitation.events[0]?.date ?? null} />
            </SectionMotion>
            <SectionMotion preset={anim.sections.gallery} preview={preview} className="snap-start">
              <GallerySlide invitation={invitation} scroll={anim.sections.gallery} preview={preview} />
            </SectionMotion>
            <SectionMotion preset={anim.sections.gift} preview={preview} className="snap-start">
              <GiftSlide gifts={invitation.gifts} />
            </SectionMotion>
            {invitation.isRsvpEnabled ? (
              <SectionMotion preset={anim.sections.rsvp} preview={preview} className="snap-start">
                <RsvpSlide invitationId={invitation.id} defaultName={guestName} />
              </SectionMotion>
            ) : null}
            {invitation.isGuestbookEnabled ? (
              <SectionMotion preset={anim.sections.guestbook} preview={preview} className="snap-start">
                <GuestbookSlide invitationId={invitation.id} messages={invitation.messages} />
              </SectionMotion>
            ) : null}
            <SectionMotion preset={anim.sections.closing} preview={preview} className="snap-start">
              <ClosingSlide invitation={invitation} />
            </SectionMotion>
          </div>
        </div>
      </main>
    </WeddingMotionProvider>
  );
}
