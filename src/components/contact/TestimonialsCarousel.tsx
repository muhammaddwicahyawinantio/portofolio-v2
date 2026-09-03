import { Star } from "lucide-react";
import Marquee from "@/components/ui/marquee";

export type StoryTestimonial = {
  id: string;
  name: string;
  position: string | null;
  content: string;
  rating: number;
  avatar: string | null;
};

export default function TestimonialsCarousel({
  testimonials,
  locale,
}: {
  testimonials: StoryTestimonial[];
  locale: string;
}) {
  if (testimonials.length === 0) return null;

  const id = locale === "id";

  return (
    <div className="border-line mt-14 border-t pt-10 md:mt-20 md:pt-14">
      <div className="mb-7">
        <p className="eyebrow mb-4">{id ? "Stories" : "Stories"}</p>
        <h3 className="home-stories-heading font-rampart-one font-display max-w-3xl text-[clamp(1.9rem,4.6vw,3.5rem)] leading-[1.02] font-medium tracking-[-0.015em]">
          {id
          ? "Pengalaman Client"
          : "Client Experiences"}
        </h3>
      </div>

      <Marquee
        repeat={testimonials.length < 3 ? 6 : 4}
        className="marquee-always [--marquee-duration:42s] [--marquee-gap:0.875rem] py-1"
      >
        {testimonials.map((item) => (
          <figure
            key={item.id}
            className="group border-line bg-card/85 rounded-card shadow-card relative flex min-h-56 w-[17rem] shrink-0 flex-col justify-between overflow-hidden border p-4 transition-all duration-400 hover:-translate-y-1 sm:w-[18.5rem] md:min-h-60 md:w-[20rem] md:p-5"
          >
            <span className="bg-gold absolute right-0 bottom-0 left-0 h-px w-0 transition-all duration-700 group-hover:w-full" />

            <div>
              <div className="text-gold-ink mb-4 flex gap-1">
                {Array.from({ length: Math.max(1, Math.min(5, item.rating)) }).map((_, index) => (
                  <Star key={index} aria-hidden className="size-3.5 fill-current" />
                ))}
              </div>
              <blockquote className="text-ink-soft line-clamp-5 text-[13px] leading-[1.7] text-pretty md:line-clamp-6">
                &quot;{item.content}&quot;
              </blockquote>
            </div>

            <figcaption className="mt-6 flex items-center gap-3">
              {item.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase
                <img
                  src={item.avatar}
                  alt=""
                  loading="lazy"
                  className="border-line size-10 shrink-0 rounded-full border object-cover grayscale transition duration-500 group-hover:grayscale-0"
                />
              ) : (
                <span
                  aria-hidden
                  className="bg-cream-deep text-ink/35 font-display flex size-10 shrink-0 items-center justify-center rounded-full text-base leading-none font-medium"
                >
                  {item.name.charAt(0)}
                </span>
              )}
              <span className="min-w-0">
                <span className="font-display block truncate text-[15px] font-medium tracking-[-0.01em]">
                  {item.name}
                </span>
                {item.position ? (
                  <span className="text-ink-soft block truncate font-mono text-[9px] tracking-[0.1em] uppercase">
                    {item.position}
                  </span>
                ) : null}
              </span>
            </figcaption>
          </figure>
        ))}
      </Marquee>
    </div>
  );
}
