import { ArrowUpRight } from "lucide-react";
import Button from "@/components/ui/Button";

/** Satu produk yang sudah dilokalkan di server. */
export type ProductView = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string | null;
  link: string;
  exploreLabel: string;
};

/**
 * Baris produk horizontal: artwork | keterangan | tombol beli — susunan tiga
 * kolom yang sama dengan kartu referensi, tapi kolom ketiganya berisi ajakan
 * membeli, bukan harga. Harga tinggal di halaman Lynk.id (lihat komentar di
 * model Product), jadi tidak ada angka di sini yang bisa basi.
 *
 * Server component. Referensinya memakai framer-motion untuk mengangkat kartu
 * saat hover; di repo ini .card-glow sudah melakukan persis itu lewat CSS, dan
 * Reveal sudah menangani masuknya tiap baris saat digulir — keduanya berarti
 * kartu ini tidak perlu jadi client component sama sekali.
 */
export default function ProductCard({ product }: { product: ProductView }) {
  return (
    <article className="card-glow border-line bg-card rounded-card grid grid-cols-1 gap-6 border p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)_auto] md:items-center md:gap-8 md:p-6">
      <div className="bg-cream-deep rounded-card aspect-square w-full max-w-[168px] shrink-0 overflow-hidden">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          /* Monogram sampai artwork asli diunggah lewat CMS. Bukan logo merek:
             repo ini tidak menyimpan aset milik OpenAI, Canva, Netflix, dan
             seterusnya, dan menggambarnya sendiri hanya akan jadi tiruan. */
          <span
            aria-hidden
            className="font-display text-ink/10 flex h-full w-full items-center justify-center text-6xl leading-none font-medium"
          >
            {product.title.charAt(0)}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <p className="eyebrow">{product.subtitle}</p>
        <h2 className="font-display text-xl leading-[1.05] font-medium tracking-[-0.01em] text-balance md:text-2xl">
          {product.title}
        </h2>
        <p className="text-ink-soft text-sm leading-[1.7] text-pretty">{product.description}</p>
      </div>

      <div className="flex flex-col items-start gap-2 md:items-end">
        <Button href={product.link} size="sm" variant="ghost">
          {product.exploreLabel}
          <ArrowUpRight aria-hidden className="size-3.5" />
        </Button>
        {/* Pembeli berhak tahu ke mana tombolnya membawa sebelum diklik. */}
        <p className="text-ink-soft font-mono text-[10px] tracking-[0.08em] uppercase"></p>
      </div>
    </article>
  );
}
