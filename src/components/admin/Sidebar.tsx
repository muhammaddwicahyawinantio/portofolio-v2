"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { RESOURCES } from "@/lib/admin/resources";
import { signOutAction } from "@/lib/admin/actions";

const GROUPS = [
  { key: "content" as const, label: "Content" },
  { key: "settings" as const, label: "Settings" },
];

export default function Sidebar({ name }: { name: string }) {
  const pathname = usePathname();

  const link = (href: string, label: string) => (
    <li key={href}>
      <Link
        href={href}
        aria-current={pathname === href ? "page" : undefined}
        className={clsx(
          "block px-6 py-2.5 text-sm transition-colors",
          pathname === href
            ? "bg-graphite/30 text-paper border-paper border-l-2"
            : "text-ash hover:text-paper border-l-2 border-transparent",
        )}
      >
        {label}
      </Link>
    </li>
  );

  return (
    <aside className="border-graphite/40 bg-ink-raised flex w-60 shrink-0 flex-col border-r">
      <div className="border-graphite/40 border-b px-6 py-6">
        <p className="font-display text-sm font-extrabold tracking-[-0.02em] uppercase">Dwi CMS</p>
        <p className="text-ash mt-1 truncate text-xs">{name}</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul>{link("/admin", "Dashboard")}</ul>

        {GROUPS.map((group) => (
          <div key={group.key} className="mt-6">
            <p className="text-graphite px-6 pb-2 text-[10px] font-semibold tracking-[0.3em] uppercase">
              {group.label}
            </p>
            <ul>
              {RESOURCES.filter((r) => r.group === group.key).map((r) =>
                link(`/admin/${r.key}`, r.label),
              )}
              {group.key === "settings" ? link("/admin/profile", "Profile") : null}
            </ul>
          </div>
        ))}
      </nav>

      <form action={signOutAction} className="border-graphite/40 border-t p-4">
        <button
          type="submit"
          className="text-ash hover:text-paper w-full px-2 py-2 text-left text-sm transition-colors"
        >
          Sign out
        </button>
      </form>
    </aside>
  );
}
