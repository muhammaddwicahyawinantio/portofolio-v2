import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Aksen warna hanya hidup di ikon, sesuai referensi CMS. Sisanya monokrom.
const ICONS = {
  projects: { color: "#edeff2", path: "M3 7h7l2 2h9v9a2 2 0 0 1-2 2H3z" },
  websites: {
    color: "#a78bfa",
    path: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3.5 3 14 0 18",
  },
  services: { color: "#edeff2", path: "M4 6h16M4 12h16M4 18h10" },
  messages: { color: "#4ade80", path: "M3 6h18v12H3z M3 6l9 7 9-7" },
} as const;

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: keyof typeof ICONS;
}) {
  const { color, path } = ICONS[icon];

  return (
    <div className="border-graphite/40 bg-ink-raised flex items-start justify-between border p-6">
      <div>
        <p className="text-ash text-[11px] font-semibold tracking-[0.2em] uppercase">{label}</p>
        <p className="font-display mt-3 text-4xl leading-none font-extrabold tracking-[-0.03em]">
          {value}
        </p>
      </div>
      <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" aria-hidden>
        <path d={path} stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function VisitorChart({ stats }: { stats: { date: Date; count: number }[] }) {
  const total = stats.reduce((sum, s) => sum + s.count, 0);
  // Skala relatif terhadap hari tertinggi; kalau semuanya nol, jangan bagi nol.
  const peak = Math.max(1, ...stats.map((s) => s.count));

  return (
    <section className="border-graphite/40 bg-ink-raised border p-6">
      <div className="mb-8 flex items-baseline justify-between">
        <h2 className="text-[11px] font-semibold tracking-[0.2em] uppercase">Visitor Statistics</h2>
        <p className="text-ash text-xs">
          <span className="text-paper font-semibold">{total.toLocaleString("en-US")}</span> visitors
        </p>
      </div>

      <ul className="flex h-44 items-end gap-3">
        {stats.map((s) => (
          <li key={s.date.toISOString()} className="flex h-full flex-1 flex-col justify-end gap-3">
            <span className="text-ash text-center text-[10px]">{s.count}</span>
            <span
              className="bg-paper/85 block w-full"
              style={{ height: `${(s.count / peak) * 100}%` }}
            />
            <span className="text-graphite text-center text-[10px] tracking-[0.15em] uppercase">
              {s.date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

const QUICK_ACTIONS = [
  { href: "/admin/projects", label: "Add New Project" },
  { href: "/admin/websites", label: "Add New Website" },
];

export default async function AdminDashboard() {
  const [projects, websites, services, messageCount, visitors, recent] = await Promise.all([
    prisma.project.count(),
    prisma.website.count(),
    prisma.service.count(),
    prisma.message.count(),
    prisma.visitorStat.findMany({ orderBy: { date: "asc" }, take: 7 }),
    prisma.message.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-3xl leading-none font-extrabold tracking-[-0.03em]">
          Dashboard
        </h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Projects" value={projects} icon="projects" />
        <StatCard label="Websites" value={websites} icon="websites" />
        <StatCard label="Services" value={services} icon="services" />
        <StatCard label="Messages" value={messageCount} icon="messages" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <VisitorChart stats={visitors} />

        <section className="border-graphite/40 bg-ink-raised border p-6">
          <h2 className="mb-6 text-[11px] font-semibold tracking-[0.2em] uppercase">
            Quick Actions
          </h2>
          <div className="flex flex-col gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="border-graphite/50 hover:border-paper hover:bg-graphite/20 flex items-center gap-3 border border-dashed px-5 py-4 text-sm transition-colors"
              >
                <span aria-hidden className="text-xl leading-none">
                  +
                </span>
                {action.label}
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="border-graphite/40 bg-ink-raised border">
        <div className="border-graphite/40 flex items-center justify-between border-b px-6 py-5">
          <h2 className="text-[11px] font-semibold tracking-[0.2em] uppercase">
            Incoming Messages
          </h2>
          <Link href="/admin/messages" className="text-ash hover:text-paper text-xs">
            View All
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="text-ash px-6 py-10 text-sm">No messages yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-graphite text-[10px] tracking-[0.2em] uppercase">
              <tr>
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Subject</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((m) => (
                <tr key={m.id} className="border-graphite/30 border-t">
                  <td className="px-6 py-4">
                    {m.isRead ? null : (
                      <span
                        aria-label="Unread"
                        className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#4ade80]"
                      />
                    )}
                    {m.name}
                  </td>
                  <td className="text-ash px-6 py-4">{m.subject}</td>
                  <td className="text-ash px-6 py-4 whitespace-nowrap">
                    {m.createdAt.toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <Link href="/admin/messages" className="text-ash hover:text-paper">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
