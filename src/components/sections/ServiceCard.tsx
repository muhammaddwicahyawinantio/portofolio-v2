import { Link } from "@/i18n/navigation";

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
  inquireLabel: string;
};

export default function ServiceCard({ service }: { service: ServiceView }) {
  return (
    <article className="bg-ink flex flex-col p-6 md:p-8">
      <div className="border-graphite/60 relative mb-6 aspect-[4/3] w-full overflow-hidden border">
        {service.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase
          <img src={service.image} alt={service.name} className="h-full w-full object-cover" />
        ) : (
          <div className="bg-ink-raised flex h-full w-full items-center justify-center text-4xl">
            {service.icon}
          </div>
        )}
        <p className="bg-paper text-ink absolute top-0 left-0 px-3 py-1.5 text-sm">
          {service.icon}
        </p>
      </div>

      <h3 className="font-display text-xl leading-tight font-extrabold tracking-[-0.02em] md:text-2xl">
        {service.name}
      </h3>
      <p className="text-silver mt-2 text-sm leading-[1.6]">{service.description}</p>
      <p className="text-paper mt-4 text-sm font-semibold">
        {service.priceFromLabel} {service.priceLabel}
      </p>

      {service.features.length > 0 ? (
        <ul className="text-ash mt-4 flex flex-col gap-1.5 text-xs leading-relaxed">
          {service.features.map((feature) => (
            <li key={feature}>— {feature}</li>
          ))}
        </ul>
      ) : null}

      {service.benefits.length > 0 ? (
        <ul className="text-ash border-graphite/40 mt-4 flex flex-col gap-1.5 border-t pt-4 text-xs leading-relaxed">
          {service.benefits.map((benefit) => (
            <li key={benefit}>✓ {benefit}</li>
          ))}
        </ul>
      ) : null}

      <Link
        href="/contact"
        className="group border-graphite/60 hover:border-paper mt-6 inline-flex w-fit items-center gap-3 border px-4 py-2.5 text-xs font-semibold tracking-[0.2em] uppercase transition-colors"
      >
        {service.inquireLabel}
        <svg aria-hidden viewBox="0 0 16 16" className="h-3 w-3">
          <path
            d="M1 8h13M9 3l5 5-5 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </article>
  );
}
