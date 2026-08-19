import Button from "@/components/ui/Button";

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

function CheckList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-3">
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="text-paper h-3 w-3 shrink-0"
          >
            <path
              d="M3 8.5l3 3 7-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-silver text-sm">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ServiceCard({ service }: { service: ServiceView }) {
  return (
    <article className="border-graphite/60 bg-ink border">
      <div className="divide-graphite/40 grid items-center gap-10 divide-y p-8 md:grid-cols-2 md:divide-x md:divide-y-0 md:p-12">
        <div className="flex flex-col items-center pb-10 text-center md:pb-0 md:pr-12">
          <div className="border-graphite/60 relative mb-8 aspect-[4/3] w-full max-w-xs overflow-hidden border">
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

          <h3 className="font-display text-2xl leading-tight font-extrabold tracking-[-0.02em]">
            {service.name}
          </h3>
          <p className="text-silver mt-2 max-w-xs text-sm leading-[1.6]">{service.description}</p>

          <p className="text-ash mt-8 text-[11px] font-semibold tracking-[0.3em] uppercase">
            {service.priceFromLabel}
          </p>
          <p className="font-display mt-2 mb-8 text-2xl font-extrabold tracking-[-0.02em] text-balance md:text-3xl">
            {service.priceLabel}
          </p>

          <Button href="/contact">{service.inquireLabel}</Button>
        </div>

        <div className="flex flex-col gap-8">
          <CheckList items={service.features} />
          {service.benefits.length > 0 ? (
            <div className="border-graphite/40 flex flex-col gap-4 border-t pt-8">
              <CheckList items={service.benefits} />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
