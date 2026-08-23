import type { WeddingPreviewData } from "@/components/wedding/types";
import Section from "@/components/wedding/shared/Section";
import Eyebrow from "@/components/wedding/shared/Eyebrow";

function Person({
  name,
  fullName,
  parents,
  photo,
}: {
  name: string;
  fullName: string | null;
  parents: string | null;
  photo: string | null;
}) {
  return (
    <div className="text-center">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- local public/ URLs only
        <img
          src={photo}
          alt={name}
          className="mx-auto mb-4 h-40 w-40 rounded-full object-cover ring-1 ring-[var(--w-accent)]/40"
        />
      ) : (
        <div className="mx-auto mb-4 h-40 w-40 rounded-full bg-[var(--w-secondary)]/20" />
      )}
      <h3 className="font-[family-name:var(--w-font-display)] text-3xl text-[var(--w-primary)]">{name}</h3>
      {fullName ? <p className="mt-1 text-sm">{fullName}</p> : null}
      {parents ? <p className="mt-2 text-xs leading-relaxed opacity-70">{parents}</p> : null}
    </div>
  );
}

export default function Couple({ invitation }: { invitation: WeddingPreviewData }) {
  return (
    <Section>
      <Eyebrow>The Bride &amp; Groom</Eyebrow>
      {invitation.openingText ? (
        <p className="mb-10 text-center text-sm leading-relaxed opacity-80">{invitation.openingText}</p>
      ) : null}
      <div className="grid items-start gap-10 sm:grid-cols-2">
        <Person
          name={invitation.brideName}
          fullName={invitation.brideFullName}
          parents={invitation.brideParents}
          photo={invitation.bridePhoto}
        />
        <Person
          name={invitation.groomName}
          fullName={invitation.groomFullName}
          parents={invitation.groomParents}
          photo={invitation.groomPhoto}
        />
      </div>
      {invitation.quoteText ? (
        <p className="mt-12 text-center font-[family-name:var(--w-font-display)] text-lg leading-relaxed text-[var(--w-primary)] italic">
          {invitation.quoteText}
        </p>
      ) : null}
    </Section>
  );
}
