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
    <div className={clsx("mx-auto w-full max-w-[80rem] px-5 md:px-8 lg:px-12", className)}>
      {children}
    </div>
  );
}
