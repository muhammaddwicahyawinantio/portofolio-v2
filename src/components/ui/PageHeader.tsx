import Container from "@/components/ui/Container";

export default function PageHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead: string;
}) {
  return (
    <section className="pt-40 pb-16 md:pt-56 md:pb-24">
      <Container>
        <p className="text-ash mb-8 text-[11px] font-semibold tracking-[0.3em] uppercase">
          {eyebrow}
        </p>
        <h1 className="font-display max-w-4xl text-[clamp(2.5rem,8vw,7rem)] leading-[0.9] font-extrabold tracking-[-0.045em] text-balance">
          {title}
        </h1>
        <p className="text-silver mt-10 max-w-xl text-base leading-[1.65] text-pretty md:text-lg">
          {lead}
        </p>
      </Container>
    </section>
  );
}
