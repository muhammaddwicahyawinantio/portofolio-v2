import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import KineticText from "@/components/animations/KineticText";

export default function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-graphite/60 border-t pt-20 pb-10 md:pt-28">
      <Container>
        {/* Wordmark besar sebagai satu-satunya rumah efek kinetic/cursor
            displacement di situs — dipindah dari judul hero supaya first
            impression halaman tenang, dan kejutan interaktifnya menunggu di
            titik keluar. <h2> asli tetap di DOM; KineticText hanya menimpanya
            dengan kanvas kalau perangkatnya sanggup. */}
        <KineticText>
          <h2 className="font-display text-center text-[clamp(3.5rem,16vw,13rem)] leading-[0.85] font-extrabold tracking-[-0.03em] uppercase">
            Dwi Studio
          </h2>
        </KineticText>

        <div className="mt-12 flex flex-col gap-8 md:mt-16 md:flex-row md:items-end md:justify-between">
          <p className="font-display max-w-xl text-2xl leading-[1.05] font-extrabold tracking-[-0.03em] text-balance md:text-4xl">
            {t("statement")}
          </p>
          <p className="text-ash text-[11px] tracking-[0.2em] uppercase">
            © {year} Dwi Studio. {t("rights")}
          </p>
        </div>
      </Container>
    </footer>
  );
}
