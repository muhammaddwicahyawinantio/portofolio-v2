import type { PublicInvitation } from "@/lib/wedding/queries";
import Section from "@/components/wedding/shared/Section";
import Eyebrow from "@/components/wedding/shared/Eyebrow";

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Events({ events }: { events: PublicInvitation["events"] }) {
  if (events.length === 0) return null;
  return (
    <Section>
      <Eyebrow>Wedding Events</Eyebrow>
      <div className="flex flex-col gap-6">
        {events.map((e) => (
          <div
            key={e.id}
            className="rounded-2xl border border-[var(--w-accent)]/30 bg-white/40 p-6 text-center"
          >
            <h3 className="font-[family-name:var(--w-font-display)] text-2xl text-[var(--w-primary)]">
              {e.title}
            </h3>
            <p className="mt-2 text-sm">{formatDate(e.date)}</p>
            {e.startTime ? (
              <p className="text-sm opacity-80">
                {e.startTime}
                {e.endTime ? ` – ${e.endTime}` : ""} WITA
              </p>
            ) : null}
            {e.venueName ? <p className="mt-3 font-medium">{e.venueName}</p> : null}
            {e.venueAddress ? (
              <p className="text-xs leading-relaxed opacity-70">{e.venueAddress}</p>
            ) : null}
            {e.mapsUrl ? (
              <a
                href={e.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block rounded-full bg-[var(--w-primary)] px-5 py-2 text-xs tracking-[0.15em] text-white uppercase"
              >
                Buka Google Maps
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </Section>
  );
}
