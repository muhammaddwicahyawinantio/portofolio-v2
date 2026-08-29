import "server-only";
import { prisma } from "@/lib/prisma";
import Reveal from "@/components/animations/Reveal";
import Button from "@/components/ui/Button";
import { iconFor } from "@/lib/icons";
import { ShoppingCart } from "lucide-react";

/** Ikon garis untuk emoji yang dikenal, monogram huruf untuk sisanya. */
function FallbackMark({ value }: { value: string }) {
  const Icon = iconFor(value);
  if (Icon) return <Icon aria-hidden className="text-ink/30 size-5" strokeWidth={1.5} />;
  return (
    <span aria-hidden className="text-ink/25 font-display text-xl leading-none">
      {value}
    </span>
  );
}

/** Satu baris di salah satu kolom, sudah dilokalkan di server. */
type ExploreItem = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  /** Dipakai kalau belum ada gambar: emoji (Services) atau monogram (Products). */
  fallback: string;
  href: string;
};

/**
 * Kartu ringkas dipakai KEDUA kolom, dan sengaja bukan ServiceCard/ProductCard.
 * ServiceCard membawa foto 16:9, harga besar, dan dua daftar centang — dua
 * belas kartu seperti itu berjejer di beranda jadi sangat panjang. Halaman
 * /services dan /products tetap memakai kartu penuhnya, tidak berubah.
 */
function ExploreCard({ item, exploreLabel }: { item: ExploreItem; exploreLabel: string }) {
  return (
    <article className="card-glow border-line bg-card rounded-card flex h-full gap-4 border p-4">
      <div className="bg-cream-deep rounded-card flex size-14 shrink-0 items-center justify-center overflow-hidden">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase
          <img
            src={item.image}
            alt={item.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          /* Kolom Services menyimpan emoji di `fallback`, kolom Products
             menyimpan monogram huruf. Emoji dipetakan ke ikon garis supaya ia
             tidak membawa palet fontnya sendiri; huruf tetap huruf. */
          <FallbackMark value={item.fallback} />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
        <h3 className="font-display text-sm leading-tight font-medium tracking-[-0.01em] text-balance md:text-base">
          {item.title}
        </h3>
        <p className="text-ink-soft line-clamp-2 text-[11px] leading-[1.6] text-pretty">
          {item.description}
        </p>
        {/* Ikon, bukan kata. Dua belas tombol "EXPLORE" identik berjejer di satu
            layar membuat labelnya berhenti berarti — yang tersisa cuma dua belas
            baris huruf kapital yang sama persis. Keranjang menyampaikan hal yang
            sama dalam satu bentuk, dan menyisakan ruang untuk judul kartunya.

            Labelnya TIDAK hilang, ia pindah ke aria-label: teks terjemahan yang
            sama, kini dibacakan pembaca layar alih-alih dicetak dua belas kali.
            Tombol ikon tanpa nama adalah tombol tanpa arti bagi yang tidak
            melihatnya.

            strokeWidth 1.5 dan size-5 menyamakannya dengan ikon Lucide di kotak
            fallback kartu ini — satu keluarga garis pada satu ukuran, bukan dua.
            Di size-4 ia terbaca hilang di tengah pil 44px-nya. */}
        <Button
          href={item.href}
          size="icon"
          variant="ghost"
          className="mt-1"
          aria-label={exploreLabel}
        >
          <ShoppingCart aria-hidden className="size-5" strokeWidth={1.5} />
        </Button>
      </div>
    </article>
  );
}

function Column({
  heading,
  items,
  exploreLabel,
}: {
  heading: string;
  items: ExploreItem[];
  exploreLabel: string;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="home-service-heading font-rampart-one font-display border-line mb-6 border-b pb-4 text-[clamp(1.55rem,3.8vw,3rem)] leading-[1.02] font-medium tracking-[-0.01em]">
        {heading}
      </h3>
      {/* targets="li": tiap baris masuk bergantian, pola yang sama dengan
          ProductList dan ServiceGrid. */}
      <Reveal targets="li">
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id} className="h-full">
              <ExploreCard item={item} exploreLabel={exploreLabel} />
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}

/**
 * Section Services di beranda, dipecah dua kolom: kiri jasa pembuatan (CMS →
 * Services), kanan produk digital (CMS → Products).
 *
 * `take: 6` adalah batas, bukan syarat — kolomnya merender berapa pun yang ada.
 * Seed hanya berisi lima item per tabel; tambah lewat CMS kalau memang mau
 * enam penuh.
 */
export default async function ExploreColumns({
  locale,
  builderLabel,
  digitalProductLabel,
  exploreLabel,
}: {
  locale: string;
  builderLabel: string;
  digitalProductLabel: string;
  exploreLabel: string;
}) {
  const id = locale === "id";
  const [services, products] = await Promise.all([
    prisma.service.findMany({ orderBy: { order: "asc" }, take: 6 }),
    prisma.product.findMany({ orderBy: { order: "asc" }, take: 6 }),
  ]);

  if (services.length === 0 && products.length === 0) return null;

  const builderItems: ExploreItem[] = services.map((row) => ({
    id: row.id,
    title: id ? row.name_id : row.name_en,
    description: id ? row.description_id : row.description_en,
    image: row.image,
    fallback: row.icon,
    // SATU tujuan untuk seluruh kolom, bukan `row.link` per baris. Kolom ini
    // etalase ringkas dari halaman Services; tombolnya membuka etalase penuhnya,
    // dan di sanalah tiap layanan punya kartu lengkapnya sendiri. Situs ini juga
    // tidak punya halaman /services/{slug}, jadi tautan per baris tak pernah
    // benar-benar mendarat di detail item yang diklik.
    href: "/services",
  }));

  const productItems: ExploreItem[] = products.map((row) => ({
    id: row.id,
    title: row.title,
    description: id ? row.description_id : row.description_en,
    image: row.image,
    fallback: row.title.charAt(0),
    // Pasangan dari kolom kiri: /products, BUKAN /product. Route tunggalnya
    // tidak ada di app/[locale] dan akan jatuh ke catch-all [...rest].
    href: "/products",
  }));

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
      <Column heading={builderLabel} items={builderItems} exploreLabel={exploreLabel} />
      <Column heading={digitalProductLabel} items={productItems} exploreLabel={exploreLabel} />
    </div>
  );
}
