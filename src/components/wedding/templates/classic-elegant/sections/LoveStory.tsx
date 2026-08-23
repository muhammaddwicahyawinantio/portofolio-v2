import Section from "@/components/wedding/shared/Section";
import Eyebrow from "@/components/wedding/shared/Eyebrow";

export default function LoveStory({ title, text }: { title: string | null; text: string }) {
  return (
    <Section>
      <Eyebrow>Our Story</Eyebrow>
      {title ? (
        <h2 className="mb-6 text-center font-[family-name:var(--w-font-display)] text-3xl text-[var(--w-primary)]">
          {title}
        </h2>
      ) : null}
      <p className="text-center text-sm leading-relaxed whitespace-pre-line opacity-85">{text}</p>
    </Section>
  );
}
