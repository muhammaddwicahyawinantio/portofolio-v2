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
    <section id={id} className={clsx("py-14 md:py-20", className)}>
      {children}
    </section>
  );
}
