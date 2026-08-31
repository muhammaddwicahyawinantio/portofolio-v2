import type { WeddingPreviewData } from "@/components/wedding/types";

export default function ClosingSlide({ invitation }: { invitation: WeddingPreviewData }) {
  return (
    <section className="flex min-h-dvh flex-col items-center justify-center bg-[var(--w-bg)] px-6 py-16 text-center">
      <p className="text-sm leading-relaxed opacity-80">
        Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan
        memberikan doa restu.
      </p>
      <p className="mt-8 font-[family-name:var(--w-font-display)] text-4xl text-[var(--w-primary)]">
        {invitation.brideName} &amp; {invitation.groomName}
      </p>
      <p className="mt-10 text-[11px] tracking-[0.2em] uppercase opacity-50">Created by DwiStudio</p>
    </section>
  );
}
