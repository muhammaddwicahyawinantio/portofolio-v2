import clsx from "clsx";
import type { ReactNode } from "react";

export default function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={clsx("py-24 md:py-36", className)}>
      {children}
    </section>
  );
}
