import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <section className="flex min-h-[70vh] flex-col justify-center pt-40 pb-24">
      <Container>
        <p className="text-ash mb-8 text-[11px] font-semibold tracking-[0.3em] uppercase">
          {t("eyebrow")}
        </p>
        <h1
          data-headline
          className="font-display max-w-3xl text-[clamp(2.25rem,7vw,5.5rem)] leading-[0.9] font-extrabold tracking-[-0.045em] text-balance"
        >
          {t("title")}
        </h1>
        <p className="text-silver mt-8 max-w-lg text-base leading-[1.65] text-pretty">
          {t("lead")}
        </p>
        <Button href="/" className="mt-12">
          {t("action")}
        </Button>
      </Container>
    </section>
  );
}
