import Eyebrow from "@/components/wedding/shared/Eyebrow";

export default function StorySlide({ title, text }: { title: string | null; text: string }) {
  return (
    <section className="flex min-h-dvh flex-col justify-center bg-[var(--w-bg)] px-8 py-16">
      <div className="mx-auto w-full max-w-xl text-center">
        <Eyebrow>Our Story</Eyebrow>
        {title ? (
          <h2 className="mb-6 font-[family-name:var(--w-font-display)] text-3xl text-[var(--w-primary)]">{title}</h2>
        ) : null}
        <p className="text-sm leading-relaxed whitespace-pre-line opacity-85">{text}</p>
      </div>
    </section>
  );
}
