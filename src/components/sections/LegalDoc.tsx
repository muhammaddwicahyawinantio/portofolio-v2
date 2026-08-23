import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/ui/Section";

export type LegalSection = { heading: string; body: string };

/**
 * Badan halaman Syarat Layanan dan Kebijakan Privasi. Satu komponen, dua
 * halaman — isinya beda, susunannya sama persis.
 *
 * Isinya dioper sebagai prop, BUKAN diambil sendiri dari namespace lewat kunci
 * yang dirangkai (`${doc}.sections`): next-intl mengetik nama pesan, dan kunci
 * hasil penggabungan string ditolak compiler. Jadi tiap halaman menyebut kunci
 * literalnya sendiri, lalu menyerahkan hasilnya ke sini. Pola yang sama sudah
 * dipakai daftar values di halaman About.
 *
 * Penomoran di sini BUKAN hiasan: pasal hukum memang dirujuk lewat nomornya
 * ("lihat butir 4"), jadi urutannya membawa informasi yang pembaca butuhkan.
 */
export default function LegalDoc({
  eyebrow,
  title,
  lead,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} lead={lead} />

      <Section className="pt-0 pb-24 md:pb-32">
        <Container>
          <p className="text-ink-soft mb-10 font-mono text-[11px] tracking-[0.14em] uppercase md:mb-14">
            {updated}
          </p>

          {/* Tepi atas daftar ini sekaligus jadi tepi bawah kepala halaman —
              satu hairline, bukan dua yang bertumpuk. */}
          <ol className="border-line border-t">
            {sections.map((section, index) => (
              <li
                key={section.heading}
                className="border-line grid gap-3 border-b py-8 md:grid-cols-[4rem_1fr] md:gap-10 md:py-10"
              >
                <span
                  aria-hidden
                  className="text-ink-soft font-mono text-xs leading-[1.6] tracking-[0.14em] md:pt-1"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="max-w-2xl">
                  <h2 className="font-display text-lg leading-tight font-medium tracking-[-0.01em] text-balance md:text-xl">
                    {section.heading}
                  </h2>
                  <p className="text-ink-soft mt-3 text-[15px] leading-[1.75] text-pretty md:text-base">
                    {section.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>
    </>
  );
}
