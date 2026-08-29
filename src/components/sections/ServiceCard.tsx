import { Check, Shapes } from "lucide-react";
import Button from "@/components/ui/Button";
import { iconFor } from "@/lib/icons";

export type ServiceView = {
  id: string;
  icon: string;
  name: string;
  description: string;
  priceLabel: string;
  priceFromLabel: string;
  features: string[];
  benefits: string[];
  image: string | null;
  exploreLabel: string;
  link: string | null;
};

function FeatureList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-1.5">
          <Check aria-hidden className="text-ink/35 size-3.5 shrink-0" />
          <span className="text-ink-soft text-[12px] leading-[1.45]">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Susunan kartu harga: gambar, lalu header (judul + deskripsi), isi (harga
 * besar + daftar centang), dan footer berisi tombol selebar kartu.
 *
 * Tinggi card disamakan per baris oleh grid (stretch), jadi `h-full` di sini
 * dan `mt-auto` di footer: tombolnya duduk rapat di dasar kartu berapa pun
 * panjang daftar fiturnya, dan tepi bawah satu baris kartu jadi rata.
 *
 * "Mulai dari" ditaruh DI ATAS harga, bukan di sampingnya seperti "/month"
 * pada referensi — dalam bahasa Indonesia ia awalan, dan "Rp5.000.000 Mulai
 * dari" tidak terbaca sebagai kalimat.
 */
export default function ServiceCard({ service, index }: { service: ServiceView; index: number }) {
  const Icon = iconFor(service.icon) ?? Shapes;
  // Nomor lembar drafting: 01, 02, … — bukan sekadar dekorasi, ia menandai
  // urutan paket seperti indeks gambar teknik.
  const sheet = String(index + 1).padStart(2, "0");

  return (
    <article className="card-glow border-line bg-card rounded-card flex h-full flex-col overflow-hidden border">
      <div className="border-line relative aspect-[16/9] w-full overflow-hidden border-b">
        {service.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase
          <img src={service.image} alt={service.name} className="h-full w-full object-cover" />
        ) : (
          // Tanpa foto, slot ini jadi LEMBAR KEDUA (cream-1) — bidang datar,
          // bukan tekstur. Kisi blueprint yang dulu di sini dibuang: ia
          // dirender di tiap kartu, jadi signature-nya sudah jadi wallpaper.
          <div className="bg-cream-deep flex h-full w-full items-center justify-center">
            <Icon aria-hidden className="text-ink/25 size-8" strokeWidth={1.25} />
          </div>
        )}
        <p className="bg-charcoal text-cream absolute top-2.5 left-2.5 rounded-full px-2 py-0.5 font-mono text-[10px] leading-none tracking-[0.08em]">
          {sheet}
        </p>
      </div>

      <div className="flex flex-col gap-1 px-3.5 pt-3">
        <h3 className="font-display text-[15px] leading-tight font-bold tracking-[-0.01em]">
          {service.name}
        </h3>
        <p className="text-ink-soft text-[12px] leading-[1.45]">{service.description}</p>
      </div>

      <div className="flex flex-col px-3.5 pt-3">
        <div className="mb-3">
          <p className="text-ink-soft font-mono text-[10px] tracking-[0.06em]">
            {service.priceFromLabel}
          </p>
          <p className="font-display mt-0.5 text-lg leading-tight font-bold tracking-[-0.01em] text-balance">
            {service.priceLabel}
          </p>
        </div>

        <FeatureList items={service.features} />
        {service.benefits.length > 0 ? (
          <div className="border-line mt-2.5 border-t pt-2.5">
            <FeatureList items={service.benefits} />
          </div>
        ) : null}
      </div>

      <div className="mt-auto px-3.5 pt-4 pb-3.5">
        {/* Tanpa link dari CMS tetap ke /contact — tujuan CTA kartu ini
            sebelumnya, dan tidak ada halaman /services/{slug} di situs ini. */}
        <Button
          href={service.link ?? "/contact"}
          size="sm"
          variant="ghost"
          className="w-full justify-center !py-2 text-[11px]"
        >
          {service.exploreLabel}
        </Button>
      </div>
    </article>
  );
}
