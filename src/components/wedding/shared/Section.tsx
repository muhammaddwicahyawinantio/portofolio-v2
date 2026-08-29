import type { ReactNode } from "react";

// Vertical rhythm + centered column shared by every template section.
export default function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`px-6 py-16 sm:py-20 ${className}`}>
      <div className="mx-auto w-full max-w-xl">{children}</div>
    </section>
  );
}
