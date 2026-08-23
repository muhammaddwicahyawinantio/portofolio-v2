import Link from "next/link";

const TABS: [string, string][] = [
  ["main", "Main"],
  ["couple", "Couple"],
  ["events", "Events"],
  ["gallery", "Gallery"],
  ["gifts", "Gifts"],
  ["settings", "Settings"],
  ["rsvps", "RSVPs"],
  ["guestbook", "Guestbook"],
];

export default function EditorTabs({ id, current }: { id: string; current: string }) {
  return (
    <nav className="border-line flex flex-wrap gap-1 border-b pb-3">
      {TABS.map(([key, label]) => (
        <Link
          key={key}
          href={`/admin/wedding-invitations/${id}?tab=${key}`}
          aria-current={current === key ? "page" : undefined}
          className={`rounded-full px-4 py-1.5 text-xs transition-colors ${
            current === key
              ? "bg-cream-deep text-ink"
              : "text-ink-soft hover:bg-cream-deep/50 hover:text-ink"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
