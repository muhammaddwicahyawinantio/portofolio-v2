import "server-only";
import { prisma } from "@/lib/prisma";
import Reveal from "@/components/animations/Reveal";
import TiltedCard from "@/components/ui/tilted-card";
import ServiceCard, { type ServiceView } from "./ServiceCard";

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

export default async function ServiceGrid({
  locale,
  priceFromLabel,
  exploreLabel,
}: {
  locale: string;
  priceFromLabel: string;
  exploreLabel: string;
}) {
  const rows = await prisma.service.findMany({ orderBy: { order: "asc" } });
  if (rows.length === 0) return null;

  const services: ServiceView[] = rows.map((row) => ({
    id: row.id,
    icon: row.icon,
    name: locale === "id" ? row.name_id : row.name_en,
    description: locale === "id" ? row.description_id : row.description_en,
    priceLabel: row.priceLabel,
    priceFromLabel,
    features: toStringArray(locale === "id" ? row.features_id : row.features_en),
    benefits: toStringArray(locale === "id" ? row.benefits_id : row.benefits_en),
    image: row.image,
    link: row.link,
    exploreLabel,
  }));

  return (
    // targets="article": tiap kartu masuk bergantian, bukan seluruh grid
    // sekaligus — gratis, Reveal sudah mendukungnya.
    <Reveal targets="article">
      {/* Tinggi kartu kini disamakan per baris (stretch, bawaan grid). Dulu
          `items-start`, dengan alasan tombolnya tidak terdorong jauh ke bawah
          saat fiturnya sedikit. Sejak kartunya berhenti mengambang di atas
          bayangan dan mulai terbaca sebagai LEMBAR, alasan itu berbalik: satu
          set gambar teknik berukuran sama, dan lembar yang isinya lebih sedikit
          memang punya ruang kosong lebih banyak. Tepi bawah yang rata jauh
          lebih tenang daripada tiga kartu yang berhenti di tiga ketinggian. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => (
          // Pembungkus di sini, bukan di dalam ServiceCard: tilt butuh handler
          // mouse alias client component, dan ServiceCard tetap server.
          <TiltedCard key={service.id}>
            <ServiceCard service={service} index={index} />
          </TiltedCard>
        ))}
      </div>
    </Reveal>
  );
}
