import "server-only";
import { prisma } from "@/lib/prisma";
import Marquee from "@/components/ui/marquee";

/**
 * Kutipan klien yang berjalan pelan di dasar section Contact — bukti sosial
 * tepat di bawah formulirnya.
 *
 * Dikelola dari CMS: Content → Testimonials.
 *
 * Referensinya memakai LiquidCard (backdrop-filter dengan feDisplacementMap,
 * dan dua set box-shadow raksasa untuk terang/gelap). Itu tidak dipakai:
 * seluruh situs ini satu tema cream, dan kartunya sudah punya bahasa sendiri —
 * .card-glow + border-line + bg-card. Bintang rating juga tidak ada, karena
 * model Testimonial memang tidak menyimpan rating; menaruh lima bintang penuh
 * yang tidak berasal dari data mana pun sama saja mengarang ulasan.
 */
export default async function TestimonialMarquee({
  locale,
  title,
}: {
  locale: string;
  title: string;
}) {
  const rows = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });
  if (rows.length === 0) return null;

  const id = locale === "id";

  return (
    <div>
      <p className="eyebrow mb-8">{title}</p>

      <Marquee>
        {rows.map((row) => (
          <figure
            key={row.id}
            className="card-glow border-line bg-card rounded-card flex w-72 shrink-0 flex-col justify-between gap-5 border p-5 md:w-80"
          >
            <blockquote className="text-ink-soft text-sm leading-[1.7] text-pretty">
              “{id ? row.content_id : row.content_en}”
            </blockquote>

            <figcaption className="flex items-center gap-3">
              {row.photo ? (
                // eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase
                <img
                  src={row.photo}
                  alt=""
                  loading="lazy"
                  className="border-line size-10 shrink-0 rounded-full border object-cover"
                />
              ) : (
                /* Monogram sampai fotonya diunggah lewat CMS — pola yang sama
                   dipakai ProductCard. Dekoratif, jadi disembunyikan dari
                   pembaca layar: namanya sudah tertulis tepat di sebelahnya. */
                <span
                  aria-hidden
                  className="bg-cream-deep text-ink/30 font-display flex size-10 shrink-0 items-center justify-center rounded-full text-base leading-none font-medium"
                >
                  {row.clientName.charAt(0)}
                </span>
              )}

              <span className="min-w-0">
                <span className="font-display block truncate text-sm font-medium tracking-[-0.01em]">
                  {row.clientName}
                </span>
                <span className="text-ink-soft block truncate font-mono text-[10px] tracking-[0.08em] uppercase">
                  {row.position}
                </span>
              </span>
            </figcaption>
          </figure>
        ))}
      </Marquee>
    </div>
  );
}
