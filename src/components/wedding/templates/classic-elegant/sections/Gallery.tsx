import type { WeddingPreviewData } from "@/components/wedding/types";
import Section from "@/components/wedding/shared/Section";
import Eyebrow from "@/components/wedding/shared/Eyebrow";

export default function Gallery({ items }: { items: WeddingPreviewData["gallery"] }) {
  if (items.length === 0) return null;
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
