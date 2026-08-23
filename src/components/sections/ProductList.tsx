import "server-only";
import { prisma } from "@/lib/prisma";
import Reveal from "@/components/animations/Reveal";
import ProductCard, { type ProductView } from "./ProductCard";

/** Dikelola dari CMS: Content -> Products. Urutannya ikut kolom `order`. */
export default async function ProductList({
  locale,
  exploreLabel,
}: {
  locale: string;
  exploreLabel: string;
}) {
  const rows = await prisma.product.findMany({ orderBy: { order: "asc" } });
  if (rows.length === 0) return null;

  const products: ProductView[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    subtitle: locale === "id" ? row.subtitle_id : row.subtitle_en,
    description: locale === "id" ? row.description_id : row.description_en,
    image: row.image,
    link: row.link,
    exploreLabel,
  }));

  return (
    // targets="li": tiap baris masuk bergantian, bukan seluruh daftar sekaligus
    // — pola yang sama dengan ProjectList dan ServiceGrid.
    <Reveal targets="li">
      <ul className="flex flex-col gap-4">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
