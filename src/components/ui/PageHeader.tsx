import clsx from "clsx";
import Container from "@/components/ui/Container";

/**
 * `centered` dipakai halaman Projects, yang kepalanya duduk di atas grid kartu
 * tiga kolom — judul rata kiri di atas grid simetris terbaca miring sebelah.
 * Halaman lain (Services, Products, detail Feature) tetap rata kiri: di sana
 * isinya daftar rata kiri juga.
 */
export default function PageHeader({
  eyebrow,
  title,
  lead,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  centered?: boolean;
}) {
  return (
    <section className="pt-24 pb-9 md:pt-32 md:pb-12">
      <Container className={clsx(centered && "flex flex-col items-center text-center")}>
        <p className="eyebrow mb-5">{eyebrow}</p>
        <h1
          data-headline
          className={clsx(
            "font-display text-[clamp(1.9rem,5.5vw,4rem)] leading-[1.05] font-medium tracking-[-0.022em] text-balance",
            centered ? "max-w-3xl" : "max-w-4xl",
          )}
        >
          {title}
        </h1>
        <p
          className={clsx(
            "text-ink-soft mt-6 text-[15px] leading-[1.7] text-pretty md:text-base",
            centered ? "max-w-xl" : "max-w-lg",
          )}
        >
          {lead}
        </p>
      </Container>
    </section>
  );
}
