import type { WeddingPreviewData } from "@/components/wedding/types";
import Eyebrow from "@/components/wedding/shared/Eyebrow";
import SafeImage from "@/components/wedding/shared/SafeImage";
import HorizontalScrollSection from "@/components/wedding/animation/HorizontalScrollSection";

type GalleryPhoto = { id: string; imageUrl: string; caption: string | null };

function fallbackPhotos(invitation: WeddingPreviewData): GalleryPhoto[] {
  return [
    invitation.coverImage ? { id: "cover", imageUrl: invitation.coverImage, caption: null } : null,
    invitation.bridePhoto ? { id: "bride", imageUrl: invitation.bridePhoto, caption: invitation.brideName } : null,
    invitation.groomPhoto ? { id: "groom", imageUrl: invitation.groomPhoto, caption: invitation.groomName } : null,
  ].filter((p): p is GalleryPhoto => p !== null);
}

function renderPhoto(item: GalleryPhoto, figureClassName: string, imgClassName: string) {
  return (
    <figure key={item.id} className={figureClassName}>
      <SafeImage src={item.imageUrl} alt={item.caption ?? ""} className={imgClassName} placeholderClassName={imgClassName} />
      {item.caption ? <figcaption className="mt-1 text-center text-[11px] opacity-60">{item.caption}</figcaption> : null}
    </figure>
  );
}

export default function GallerySlide({
  invitation,
  scroll,
  preview = false,
}: {
  invitation: WeddingPreviewData;
  scroll?: string;
  preview?: boolean;
}) {
  const items: GalleryPhoto[] =
    invitation.gallery.length > 0
      ? invitation.gallery.map((g) => ({ id: g.id, imageUrl: g.imageUrl, caption: g.caption }))
      : fallbackPhotos(invitation);

  if (items.length === 0) {
    return (
      <section className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-[var(--w-secondary)]/30 to-[var(--w-primary)]/20 px-6 py-16 text-center">
        <Eyebrow>Gallery</Eyebrow>
        <p className="text-sm opacity-70">Galeri foto akan segera hadir.</p>
      </section>
    );
  }

  return (
    <section className="flex min-h-dvh flex-col justify-center bg-[var(--w-bg)] px-6 py-16">
      <div className="mx-auto w-full max-w-xl">
        <Eyebrow>Gallery</Eyebrow>
        {scroll === "horizontal-scroll" ? (
          <HorizontalScrollSection preview={preview}>
            {items.map((item) =>
              renderPhoto(
                item,
                "w-[68%] shrink-0 snap-start sm:w-[44%] md:w-[32%]",
                "aspect-[3/4] w-full rounded-lg object-cover",
              ),
            )}
          </HorizontalScrollSection>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((item) => renderPhoto(item, "", "aspect-square w-full rounded-lg object-cover"))}
          </div>
        )}
      </div>
    </section>
  );
}
