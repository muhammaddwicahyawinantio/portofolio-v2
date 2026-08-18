import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";

export default function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-graphite/60 border-t pt-20 pb-24 md:pb-20">
      <Container className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
        <p className="font-display max-w-xl text-3xl leading-[1.05] font-extrabold tracking-[-0.03em] text-balance md:text-5xl">
          {t("statement")}
        </p>
        <p className="text-ash text-[11px] tracking-[0.2em] uppercase">
          © {year} Dwi Studio. {t("rights")}
        </p>
      </Container>
    </footer>
  );
}
