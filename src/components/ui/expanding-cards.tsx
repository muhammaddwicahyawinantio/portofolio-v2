"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export interface CardItem {
  id: string | number;
  title: string;
  description: string;
  imgSrc: string;
  icon: React.ReactNode;
  linkHref: string;
}

interface ExpandingCardsProps extends React.HTMLAttributes<HTMLUListElement> {
  items: CardItem[];
  defaultActiveIndex?: number;
}

export const ExpandingCards = React.forwardRef<HTMLUListElement, ExpandingCardsProps>(
  ({ className, items, defaultActiveIndex = 0, ...props }, ref) => {
    const [activeIndex, setActiveIndex] = React.useState<number | null>(defaultActiveIndex);
    const [isDesktop, setIsDesktop] = React.useState(false);

    React.useEffect(() => {
      const handleResize = () => {
        setIsDesktop(window.innerWidth >= 768);
      };
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    const gridStyle = React.useMemo(() => {
      if (activeIndex === null) return {};

      if (isDesktop) {
        const columns = items.map((_, index) => (index === activeIndex ? "5fr" : "1fr")).join(" ");
        return { gridTemplateColumns: columns };
      } else {
        const rows = items.map((_, index) => (index === activeIndex ? "5fr" : "1fr")).join(" ");
        return { gridTemplateRows: rows };
      }
    }, [activeIndex, items, isDesktop]);

    const handleInteraction = (index: number) => {
      setActiveIndex(index);
    };

    return (
      <ul
        className={cn("grid h-[600px] w-full max-w-6xl gap-2 transition-[grid-template-columns,grid-template-rows] duration-500 ease-out md:h-[500px]", className)}
        style={{
          ...gridStyle,
          ...(isDesktop ? { gridTemplateRows: "1fr" } : { gridTemplateColumns: "1fr" }),
        }}
        ref={ref}
        {...props}
      >
        {items.map((item, index) => (
          <li
            key={item.id}
            className="group border-graphite/60 bg-ink-raised relative min-h-0 min-w-0 cursor-pointer overflow-hidden border md:min-w-[80px]"
            onMouseEnter={() => handleInteraction(index)}
            onFocus={() => handleInteraction(index)}
            onClick={() => handleInteraction(index)}
            tabIndex={0}
            data-active={activeIndex === index}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase */}
            <img
              src={item.imgSrc}
              alt={item.title}
              className="absolute inset-0 h-full w-full scale-110 object-cover grayscale transition-all duration-300 ease-out group-data-[active=true]:scale-100 group-data-[active=true]:grayscale-0"
            />
            <div className="from-ink/90 via-ink/40 absolute inset-0 bg-gradient-to-t to-transparent" />

            <article className="absolute inset-0 flex flex-col justify-end gap-2 p-4">
              <h3 className="text-paper/80 hidden origin-left rotate-90 text-[11px] font-semibold tracking-[0.2em] uppercase opacity-100 transition-all duration-300 ease-out group-data-[active=true]:opacity-0 md:block">
                {item.title}
              </h3>

              <div className="text-paper/90 opacity-0 transition-all duration-300 delay-75 ease-out group-data-[active=true]:opacity-100">
                {item.icon}
              </div>

              <Link
                href={item.linkHref}
                className="pointer-events-none flex flex-col gap-2 group-data-[active=true]:pointer-events-auto"
              >
                <h3 className="font-display text-xl font-extrabold tracking-[-0.02em] text-paper opacity-0 transition-all duration-300 delay-150 ease-out group-data-[active=true]:opacity-100">
                  {item.title}
                </h3>
                <p className="text-silver line-clamp-3 w-full max-w-xs text-sm opacity-0 transition-all duration-300 delay-225 ease-out group-data-[active=true]:opacity-100">
                  {item.description}
                </p>
              </Link>
            </article>
          </li>
        ))}
      </ul>
    );
  },
);
ExpandingCards.displayName = "ExpandingCards";
