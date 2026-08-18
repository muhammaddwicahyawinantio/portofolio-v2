import Link from "next/link";
import clsx from "clsx";
import type { ReactNode } from "react";

const BASE =
  "inline-flex items-center gap-3 whitespace-nowrap bg-paper px-7 py-4 font-body text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:bg-silver";

/** Satu tampilan saja — varian kedua ditambah kalau memang ada yang memakai. */
export default function Button({
  children,
  href,
  className,
  type = "button",
}: {
  children: ReactNode;
  href?: string;
  className?: string;
  type?: "button" | "submit";
}) {
  if (href) {
    return (
      <Link href={href} className={clsx(BASE, className)}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={clsx(BASE, className)}>
      {children}
    </button>
  );
}
