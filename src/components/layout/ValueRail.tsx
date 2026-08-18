import clsx from "clsx";
import { MEDIUMS } from "@/lib/mediums";
import { messages } from "@/i18n/t";

/**
 * Signature element. Gradasi hitam-putih dipakai sebagai indeks medium,
 * bukan dekorasi: tiap segmen satu langkah tonal, berlabel satu medium.
 * aria-hidden karena daftar medium yang sama sudah ada sebagai teks di home.
 */
export default function ValueRail() {
  return (
    <>
      {/* Desktop: rail vertikal, label dibaca bawah-ke-atas. */}
      <div aria-hidden className="w-rail fixed top-0 left-0 z-40 hidden h-screen flex-col md:flex">
        {MEDIUMS.map((m) => (
          <div key={m.key} className={clsx("flex flex-1 items-center justify-center", m.tone)}>
            <span
              className={clsx(
                "text-vertical rotate-180 text-[9px] font-semibold tracking-[0.3em] uppercase",
                m.label,
              )}
            >
              {messages.mediums[m.key]}
            </span>
          </div>
        ))}
      </div>

      {/* Mobile: strip tipis di bawah, tanpa label. */}
      <div aria-hidden className="fixed inset-x-0 bottom-0 z-40 flex h-1.5 md:hidden">
        {MEDIUMS.map((m) => (
          <div key={m.key} className={clsx("flex-1", m.tone)} />
        ))}
      </div>
    </>
  );
}
