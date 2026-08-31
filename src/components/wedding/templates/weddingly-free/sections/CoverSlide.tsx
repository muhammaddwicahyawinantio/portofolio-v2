import type { WeddingPreviewData } from "@/components/wedding/types";
import { photoBackgroundStyle } from "../utils";

export default function CoverSlide({ invitation }: { invitation: WeddingPreviewData }) {
  const firstEvent = invitation.events[0];
  const photo = invitation.coverImage ?? invitation.bridePhoto ?? invitation.groomPhoto ?? null;
  const dateLabel = firstEvent
    ? new Date(firstEvent.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <section
      className="flex min-h-dvh flex-col items-center justify-center px-6 text-center text-white"
      style={photoBackgroundStyle(photo)}
    >
      <p className="text-[11px] tracking-[0.3em] text-white/70 uppercase">Wedding Invitation</p>
      <h2 className="mt-5 font-[family-name:var(--w-font-display)] text-4xl sm:text-5xl">
        {invitation.brideName} &amp; {invitation.groomName}
      </h2>
      {dateLabel ? <p className="mt-4 text-sm text-white/85">{dateLabel}</p> : null}
    </section>
  );
}
