import "server-only";
import { prisma } from "@/lib/prisma";
import Reveal from "@/components/animations/Reveal";
import ServiceCard, { type ServiceView } from "./ServiceCard";

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

export default async function ServiceGrid({
  locale,
  priceFromLabel,
  inquireLabel,
}: {
  locale: string;
  priceFromLabel: string;
  inquireLabel: string;
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
    inquireLabel,
  }));

  return (
    <Reveal>
      <div className="border-graphite/40 bg-graphite/40 grid gap-px border sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </Reveal>
  );
}
