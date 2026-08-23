import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <section className="flex min-h-[70vh] flex-col justify-center pt-40 pb-24">
      <Container>
        <p className="eyebrow mb-8">{t("eyebrow")}</p>
        <h1
          data-headline
          className="font-display max-w-3xl text-[clamp(1.75rem,5vw,3.5rem)] leading-[1.05] font-medium tracking-[-0.01em] text-balance"
        >
          {t("title")}
        </h1>
        <p className="text-ink-soft mt-8 max-w-lg text-base leading-[1.65] text-pretty">
          {t("lead")}
        </p>
        <Button href="/" className="mt-12">
          {t("action")}
        </Button>
      </Container>
    </section>
  );
}
