import clsx from "clsx";
import type { ReactNode } from "react";

export default function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("mx-auto w-full max-w-[92rem] px-6 md:px-12 lg:px-20", className)}>
      {children}
    </div>
  );
}
