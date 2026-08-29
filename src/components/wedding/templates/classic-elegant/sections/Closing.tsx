import type { WeddingPreviewData } from "@/components/wedding/types";
import Section from "@/components/wedding/shared/Section";

export default function Closing({ invitation }: { invitation: WeddingPreviewData }) {
  return (
    <Section className="text-center">
      <p className="text-sm leading-relaxed opacity-80">
        Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan
        hadir dan memberikan doa restu.
      </p>
      <p className="mt-8 font-[family-name:var(--w-font-display)] text-4xl text-[var(--w-primary)]">
        {invitation.brideName} &amp; {invitation.groomName}
      </p>
      <p className="mt-10 text-[11px] tracking-[0.2em] uppercase opacity-50">Created by Dwi Studio</p>
    </Section>
  );
}
