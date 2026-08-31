export default function QuoteSlide({ quoteText }: { quoteText: string | null }) {
  const text = quoteText?.trim() || "Dua hati, satu janji, selamanya.";
  return (
    <section className="flex min-h-dvh flex-col items-center justify-center bg-[var(--w-bg)] px-8 text-center">
      <p className="font-[family-name:var(--w-font-display)] text-2xl leading-relaxed text-[var(--w-primary)] italic sm:text-3xl">
        &ldquo;{text}&rdquo;
      </p>
    </section>
  );
}
