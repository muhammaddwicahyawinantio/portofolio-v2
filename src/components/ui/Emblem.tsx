import clsx from "clsx";

/**
 * Lambang studio: lingkaran putih dengan tiga batang menaik — gema dari tiga
 * panel tirai intro dan tangga nilai situs. Geometris murni supaya tetap tajam
 * sampai ukuran 18px.
 *
 * Satu komponen dipakai intro dan header, jadi lockup yang ditutup intro sama
 * persis dengan yang mengambil alih di header sesudahnya.
 */
export default function Emblem({ className }: { className?: string }) {
  return (
    <span
      className={clsx("bg-cream flex shrink-0 items-center justify-center rounded-full", className)}
    >
      {/* Ukuran relatif, jadi proporsinya ikut berapa pun diameter lingkarannya. */}
      <svg viewBox="0 0 18 18" className="h-[56%] w-[56%]" fill="var(--color-charcoal)" aria-hidden>
        <rect x="3" y="9" width="3" height="6" rx="0.5" />
        <rect x="7.5" y="6" width="3" height="9" rx="0.5" />
        <rect x="12" y="3" width="3" height="12" rx="0.5" />
      </svg>
    </span>
  );
}
