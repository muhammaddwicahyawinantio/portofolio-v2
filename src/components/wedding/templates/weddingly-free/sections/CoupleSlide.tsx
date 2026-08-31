import type { WeddingPreviewData } from "@/components/wedding/types";
import Eyebrow from "@/components/wedding/shared/Eyebrow";
import SafeImage from "@/components/wedding/shared/SafeImage";
import ParallaxLayer from "@/components/wedding/animation/ParallaxLayer";

function Person({
  name,
  fullName,
  parents,
  photo,
  parallax,
  preview,
}: {
  name: string;
  fullName: string | null;
  parents: string | null;
  photo: string | null;
  parallax: boolean;
  preview: boolean;
}) {
  const portraitClass = "mx-auto h-40 w-40 rounded-full object-cover ring-1 ring-[var(--w-accent)]/40";
  const portrait = <SafeImage src={photo} alt={name} className={portraitClass} placeholderClassName={portraitClass} />;

  return (
    <div className="text-center">
      <div className="mb-4">
        {parallax ? (
          <ParallaxLayer preview={preview} amount={7}>
            {portrait}
          </ParallaxLayer>
        ) : (
          portrait
        )}
      </div>
      <h3 className="font-[family-name:var(--w-font-display)] text-2xl text-[var(--w-primary)]">{name}</h3>
      {fullName ? <p className="mt-1 text-sm opacity-80">{fullName}</p> : null}
      {parents ? <p className="mt-2 text-xs leading-relaxed opacity-65">{parents}</p> : null}
    </div>
  );
}

export default function CoupleSlide({
  invitation,
  scroll,
  preview = false,
}: {
  invitation: WeddingPreviewData;
  scroll?: string;
  preview?: boolean;
}) {
  const parallax = scroll === "portrait-parallax";
  return (
    <section className="flex min-h-dvh flex-col justify-center bg-[var(--w-bg)] px-6 py-16">
      <div className="mx-auto w-full max-w-xl">
        <Eyebrow>The Bride &amp; Groom</Eyebrow>
        <div className="grid gap-10 sm:grid-cols-2">
          <Person
            name={invitation.brideName}
            fullName={invitation.brideFullName}
            parents={invitation.brideParents}
            photo={invitation.bridePhoto}
            parallax={parallax}
            preview={preview}
          />
          <Person
            name={invitation.groomName}
            fullName={invitation.groomFullName}
            parents={invitation.groomParents}
            photo={invitation.groomPhoto}
            parallax={parallax}
            preview={preview}
          />
        </div>
      </div>
    </section>
  );
}
