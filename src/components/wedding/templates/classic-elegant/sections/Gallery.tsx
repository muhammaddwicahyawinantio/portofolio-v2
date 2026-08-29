import type { WeddingPreviewData } from "@/components/wedding/types";
import Section from "@/components/wedding/shared/Section";
import Eyebrow from "@/components/wedding/shared/Eyebrow";
import HorizontalScrollSection from "@/components/wedding/animation/HorizontalScrollSection";

export default function Gallery({
  items,
  scroll,
  preview = false,
}: {
  items: WeddingPreviewData["gallery"];
  scroll?: string;
  preview?: boolean;
}) {
  if (items.length === 0) return null;

  if (scroll === "horizontal-scroll") {
    return (
      <Section>
        <Eyebrow>Gallery</Eyebrow>
        <HorizontalScrollSection preview={preview}>
          {items.map((g) => (
            <figure key={g.id} className="w-[68%] shrink-0 snap-start sm:w-[44%] md:w-[32%]">
              {/* eslint-disable-next-line @next/next/no-img-element -- local public/ URLs only */}
              <img
                src={g.imageUrl}
                alt={g.caption ?? ""}
                className="aspect-[3/4] w-full rounded-lg object-cover"
              />
              {g.caption ? (
                <figcaption className="mt-1 text-center text-[11px] opacity-60">{g.caption}</figcaption>
              ) : null}
            </figure>
          ))}
        </HorizontalScrollSection>
      </Section>
    );
  }

  return (
    <Section>
      <Eyebrow>Gallery</Eyebrow>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((g) => (
          <figure key={g.id}>
            {/* eslint-disable-next-line @next/next/no-img-element -- local public/ URLs only */}
            <img
              src={g.imageUrl}
              alt={g.caption ?? ""}
              className="aspect-square w-full rounded-lg object-cover"
            />
            {g.caption ? (
              <figcaption className="mt-1 text-center text-[11px] opacity-60">{g.caption}</figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </Section>
  );
}
