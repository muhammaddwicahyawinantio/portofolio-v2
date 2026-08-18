import { messages } from "@/i18n/t";

// Fase 1: markup statis. Route-aware switching disambung di Fase 2 (next-intl).
export default function LocaleSwitch() {
  return (
    <div
      aria-label={messages.locale.switchLabel}
      className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase"
    >
      <span className="text-paper">{messages.locale.en}</span>
      <span aria-hidden className="text-graphite">
        /
      </span>
      <span className="text-ash">{messages.locale.id}</span>
    </div>
  );
}
