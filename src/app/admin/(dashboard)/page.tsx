import Link from "next/link";
import type { CSSProperties } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  FolderKanban,
  Layers,
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  Star,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ACCENT = {
  blue: "#2563eb",
  cyan: "#0891b2",
  violet: "#7c3aed",
  emerald: "#059669",
  amber: "#d97706",
  rose: "#e11d48",
  slate: "#475569",
  skySoft: "#dbeafe",
  cyanSoft: "#cffafe",
  violetSoft: "#ede9fe",
  emeraldSoft: "#d1fae5",
  amberSoft: "#fef3c7",
  roseSoft: "#ffe4e6",
  line: "#dbe3f0",
} as const;

/* ── helpers ─────────────────────────────────────────────────────────────── */

// Jarak waktu ringkas untuk feed notifikasi. Server-render, jadi patokannya
// waktu request — cukup untuk CMS internal, tak perlu live-tick di klien.
function timeAgo(date: Date, now: number): string {
  const s = Math.max(0, Math.round((now - date.getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return `${Math.round(d / 7)}w ago`;
}

// Catmull-Rom → cubic bézier: garis mulus tanpa dependency chart. Perlu ≥2 titik.
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0]!.x} ${pts[0]!.y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/* ── stat cards ──────────────────────────────────────────────────────────── */

const STAT_ICON = { projects: FolderKanban, services: Layers, messages: Mail };
const STAT_META = {
  projects: { color: ACCENT.blue, bg: ACCENT.skySoft, label: "Project pipeline" },
  services: { color: ACCENT.violet, bg: ACCENT.violetSoft, label: "Offers" },
  messages: { color: ACCENT.rose, bg: ACCENT.roseSoft, label: "Inbox" },
} as const;

function StatCard({
  label,
  value,
  icon,
  hint,
  tone = "muted",
}: {
  label: string;
  value: number;
  icon: keyof typeof STAT_ICON;
  hint: string;
  tone?: "up" | "accent" | "muted";
}) {
  const Icon = STAT_ICON[icon];
  const meta = STAT_META[icon];
  const hintColor =
    tone === "up" ? "text-emerald-700" : tone === "accent" ? "text-rose-700" : "text-ink-soft";
  const style = {
    "--stat-accent": meta.color,
    "--stat-bg": meta.bg,
  } as CSSProperties;

  return (
    <div
      className="admin-card admin-stat-card card-glow border-line bg-card rounded-card shadow-card relative flex flex-col justify-between gap-6 overflow-hidden border p-6"
      style={style}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-ink-soft font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
            {label}
          </p>
          <p className="mt-1 text-[11px] font-medium" style={{ color: meta.color }}>
            {meta.label}
          </p>
        </div>
        <span className="admin-icon-badge" aria-hidden>
          <Icon className="h-5 w-5 shrink-0" strokeWidth={1.7} />
        </span>
      </div>
      <div>
        <p className="font-display text-4xl leading-none font-medium tracking-[-0.01em]">
          {value.toLocaleString("en-US")}
        </p>
        <p className={`mt-2 flex items-center gap-1.5 text-xs ${hintColor}`}>
          {tone === "up" ? (
            <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          ) : null}
          {hint}
        </p>
      </div>
    </div>
  );
}

/* ── visitor area chart (SVG, no chart lib) ──────────────────────────────── */

function VisitorChart({ stats }: { stats: { date: Date; count: number }[] }) {
  const total = stats.reduce((sum, s) => sum + s.count, 0);

  // Tren: separuh-akhir vs separuh-awal dari data yang ada. Hanya tampil kalau
  // separuh-awal > 0, supaya tak pernah bagi nol / persentase palsu.
  const mid = Math.floor(stats.length / 2);
  const prev = stats.slice(0, mid).reduce((s, x) => s + x.count, 0);
  const recent = stats.slice(mid).reduce((s, x) => s + x.count, 0);
  const pct = prev > 0 ? Math.round(((recent - prev) / prev) * 100) : null;

  const W = 640;
  const H = 200;
  const padX = 6;
  const padTop = 16;
  const padBottom = 26;
  const peak = Math.max(1, ...stats.map((s) => s.count));
  const innerH = H - padTop - padBottom;
  const stepX = stats.length > 1 ? (W - padX * 2) / (stats.length - 1) : 0;

  const pts = stats.map((s, i) => ({
    x: padX + i * stepX,
    y: padTop + (1 - s.count / peak) * innerH,
  }));
  const line = smoothPath(pts);
  const area = line
    ? `${line} L ${pts.at(-1)!.x} ${padTop + innerH} L ${pts[0]!.x} ${padTop + innerH} Z`
    : "";

  return (
    <section className="admin-card border-line bg-card rounded-card shadow-card border p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
            <span
              className="admin-section-icon"
              style={
                {
                  "--section-accent": ACCENT.blue,
                  "--section-bg": ACCENT.skySoft,
                } as CSSProperties
              }
              aria-hidden
            >
              <BarChart3 className="h-4 w-4" strokeWidth={1.7} />
            </span>
            Visitor Statistics
          </h2>
          <p className="text-ink-soft mt-2 text-xs">Last {stats.length} days</p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl leading-none font-medium tracking-[-0.01em]">
            {total.toLocaleString("en-US")}
          </p>
          {pct !== null ? (
            <p
              className={`mt-1.5 flex items-center justify-end gap-1 text-xs ${
                pct >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {pct >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              )}
              {pct >= 0 ? "+" : ""}
              {pct}% vs earlier
            </p>
          ) : null}
        </div>
      </div>

      {stats.length < 2 ? (
        <p className="text-ink-soft py-10 text-sm">Not enough data yet.</p>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-44 w-full"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="visitorFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT.blue} stopOpacity="0.24" />
                <stop offset="54%" stopColor={ACCENT.cyan} stopOpacity="0.12" />
                <stop offset="100%" stopColor={ACCENT.blue} stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* gridlines seperempat — hairline, tak menuntut perhatian */}
            {[0.25, 0.5, 0.75].map((f) => (
              <line
                key={f}
                x1={padX}
                x2={W - padX}
                y1={padTop + innerH * f}
                y2={padTop + innerH * f}
                stroke="rgba(37,99,235,0.12)"
                strokeWidth="1"
              />
            ))}
            <path d={area} fill="url(#visitorFill)" />
            <path
              d={line}
              fill="none"
              stroke={ACCENT.blue}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <circle cx={pts.at(-1)!.x} cy={pts.at(-1)!.y} r="3.5" fill={ACCENT.cyan} />
          </svg>
          <ul className="text-ink-soft mt-3 flex justify-between text-[10px] tracking-[0.15em] uppercase">
            {stats.map((s) => (
              <li key={s.date.toISOString()}>
                {s.date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

/* ── content-mix donut (SVG) ─────────────────────────────────────────────── */

function ContentDonut({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const R = 46;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <section className="admin-card border-line bg-card rounded-card shadow-card flex flex-col border p-6">
      <h2 className="mb-6 flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
        <span
          className="admin-section-icon"
          style={
            {
              "--section-accent": ACCENT.violet,
              "--section-bg": ACCENT.violetSoft,
            } as CSSProperties
          }
          aria-hidden
        >
          <Layers className="h-4 w-4" strokeWidth={1.7} />
        </span>
        Content Mix
      </h2>

      <div className="flex items-center gap-6">
        <svg viewBox="0 0 120 120" className="h-28 w-28 shrink-0 -rotate-90" aria-hidden>
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke="rgba(37,99,235,0.12)"
            strokeWidth="10"
          />
          {total > 0 &&
            data.map((d) => {
              const len = (d.value / total) * C;
              const seg = (
                <circle
                  key={d.label}
                  cx="60"
                  cy="60"
                  r={R}
                  fill="none"
                  stroke={d.color}
                  strokeWidth="10"
                  strokeDasharray={`${len} ${C - len}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += len;
              return seg;
            })}
        </svg>

        <ul className="flex-1 space-y-2">
          {data.map((d) => (
            <li key={d.label} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: d.color }}
                  aria-hidden
                />
                <span className="text-ink-soft">{d.label}</span>
              </span>
              <span className="text-ink font-semibold">{d.value}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-ink-soft mt-6 text-[11px] tracking-[0.15em] uppercase">
        {total} published items
      </p>
    </section>
  );
}

/* ── notifications feed (dari data nyata) ────────────────────────────────── */

type Notification = {
  id: string;
  kind: "message" | "project";
  title: string;
  detail: string;
  at: Date;
};

function Notifications({ items, now }: { items: Notification[]; now: number }) {
  return (
    <section className="admin-card border-line bg-card rounded-card shadow-card overflow-hidden border">
      <div className="border-line flex items-center justify-between border-b px-6 py-5">
        <h2 className="flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
          <span
            className="admin-section-icon"
            style={
              {
                "--section-accent": ACCENT.amber,
                "--section-bg": ACCENT.amberSoft,
              } as CSSProperties
            }
            aria-hidden
          >
            <Bell className="h-4 w-4" strokeWidth={1.7} />
          </span>
          Notifications
        </h2>
      </div>
      {items.length === 0 ? (
        <p className="text-ink-soft px-6 py-10 text-sm">You&apos;re all caught up.</p>
      ) : (
        <ul>
          {items.map((n) => {
            const Icon = n.kind === "message" ? MessageSquare : Pencil;
            const tint = n.kind === "message" ? ACCENT.emerald : ACCENT.violet;
            const bg = n.kind === "message" ? ACCENT.emeraldSoft : ACCENT.violetSoft;
            return (
              <li
                key={n.id}
                className="border-line hover:bg-cream-deep/55 flex items-start gap-3 border-t px-6 py-4 transition-colors first:border-t-0"
              >
                <span
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]"
                  style={{ backgroundColor: bg, color: tint }}
                  aria-hidden
                >
                  <Icon className="h-4 w-4" strokeWidth={1.6} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{n.title}</p>
                  <p className="text-ink-soft truncate text-xs">{n.detail}</p>
                </div>
                <span className="text-ink-soft shrink-0 text-[10px] whitespace-nowrap">
                  {timeAgo(n.at, now)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

const QUICK_ACTIONS = [
  { href: "/admin/projects", label: "Add New Project", color: ACCENT.blue, bg: ACCENT.skySoft },
];

/* ── page ────────────────────────────────────────────────────────────────── */

export default async function AdminDashboard() {
  const now = Date.now();
  const startOfMonth = new Date(new Date(now).getFullYear(), new Date(now).getMonth(), 1);

  const session = await auth();
  const adminName = session?.user?.name?.trim() || "there";
  const firstName = adminName.split(/\s+/)[0] || adminName;
  const hour = new Date(now).getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const [
    projects,
    services,
    messageCount,
    unread,
    featured,
    newThisMonth,
    features,
    testimonials,
    media,
    visitors,
    recentMessages,
    recentProjects,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.service.count(),
    prisma.message.count(),
    prisma.message.count({ where: { isRead: false } }),
    prisma.project.count({ where: { featured: true } }),
    prisma.project.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.feature.count(),
    prisma.testimonial.count(),
    prisma.mediaGalleryItem.count(),
    prisma.visitorStat.findMany({ orderBy: { date: "asc" }, take: 14 }),
    prisma.message.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 4,
      select: { id: true, title_en: true, updatedAt: true, featured: true },
    }),
  ]);

  const contentMix = [
    { label: "Projects", value: projects, color: ACCENT.blue },
    { label: "Services", value: services, color: ACCENT.violet },
    { label: "Features", value: features, color: ACCENT.emerald },
    { label: "Testimonials", value: testimonials, color: ACCENT.amber },
    { label: "Media", value: media, color: ACCENT.slate },
  ].filter((d) => d.value > 0);

  // Feed notifikasi = pesan belum dibaca + proyek yang baru diperbarui, digabung
  // lalu diurut terbaru. Semuanya turun langsung dari data, bukan hardcode.
  const notifications: Notification[] = [
    ...recentMessages
      .filter((m) => !m.isRead)
      .map((m) => ({
        id: `msg-${m.id}`,
        kind: "message" as const,
        title: `New message from ${m.name}`,
        detail: m.subject,
        at: m.createdAt,
      })),
    ...recentProjects.map((p) => ({
      id: `prj-${p.id}`,
      kind: "project" as const,
      title: `${p.title_en} ${p.featured ? "featured" : "updated"}`,
      detail: p.featured ? "Live on the homepage" : "Content edited",
      at: p.updatedAt,
    })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl leading-none font-medium tracking-[-0.01em]">
            {greeting}, {firstName}
          </h1>
          <p className="text-ink-soft mt-2 text-sm">
            Stay on top of your content ·{" "}
            {new Date(now).toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/projects" className="admin-search-chip">
            <span className="admin-search-icon" aria-hidden>
              <Search className="h-4 w-4" strokeWidth={1.7} />
            </span>
            Search content
          </Link>
          <Link href="/admin/messages" className="admin-notification-chip">
            <Bell className="h-4 w-4" strokeWidth={1.6} aria-hidden />
            Notifications
            {unread > 0 ? (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold">
                {unread}
              </span>
            ) : null}
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Projects"
          value={projects}
          icon="projects"
          hint={newThisMonth > 0 ? `${newThisMonth} new this month` : `${featured} featured`}
          tone={newThisMonth > 0 ? "up" : "muted"}
        />
        <StatCard label="Services" value={services} icon="services" hint="Offered" />
        <StatCard
          label="Messages"
          value={messageCount}
          icon="messages"
          hint={unread > 0 ? `${unread} unread` : "All read"}
          tone={unread > 0 ? "accent" : "muted"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <VisitorChart stats={visitors} />
        <ContentDonut data={contentMix} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <section className="admin-card border-line bg-card rounded-card shadow-card overflow-hidden border">
          <div className="border-line flex items-center justify-between border-b px-6 py-5">
            <h2 className="flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
              <span
                className="admin-section-icon"
                style={
                  {
                    "--section-accent": ACCENT.rose,
                    "--section-bg": ACCENT.roseSoft,
                  } as CSSProperties
                }
                aria-hidden
              >
                <Mail className="h-4 w-4" strokeWidth={1.7} />
              </span>
              Incoming Messages
            </h2>
            <Link href="/admin/messages" className="text-xs text-blue-700 hover:text-blue-900">
              View All
            </Link>
          </div>

          {recentMessages.length === 0 ? (
            <p className="text-ink-soft px-6 py-10 text-sm">No messages yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[44rem] text-left text-sm">
                <thead className="text-ink-soft border-line border-b font-mono text-[11px] tracking-[0.1em] uppercase">
                  <tr>
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Subject</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMessages.slice(0, 5).map((m) => (
                    <tr
                      key={m.id}
                      className="border-line border-t transition-colors hover:bg-sky-50/70"
                    >
                      <td className="px-6 py-4">{m.name}</td>
                      <td className="text-ink-soft px-6 py-4">{m.subject}</td>
                      <td className="text-ink-soft px-6 py-4 whitespace-nowrap">
                        {m.createdAt.toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium whitespace-nowrap ${
                            m.isRead
                              ? "border-slate-200 bg-slate-50 text-slate-600"
                              : "border-rose-200 bg-rose-50 text-rose-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              m.isRead ? "bg-slate-400" : "bg-rose-500"
                            }`}
                            aria-hidden
                          />
                          {m.isRead ? "Read" : "Unread"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href="/admin/messages"
                          className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900"
                        >
                          View
                          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="flex flex-col gap-4">
          <Notifications items={notifications} now={now} />

          <section className="admin-card border-line bg-card rounded-card shadow-card border p-6">
            <h2 className="mb-6 flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
              <span
                className="admin-section-icon"
                style={
                  {
                    "--section-accent": ACCENT.amber,
                    "--section-bg": ACCENT.amberSoft,
                  } as CSSProperties
                }
                aria-hidden
              >
                <Star className="h-4 w-4" strokeWidth={1.7} />
              </span>
              Quick Actions
            </h2>
            <div className="flex flex-col gap-3">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="admin-action-link flex items-center gap-3 rounded-[14px] border px-5 py-4 text-sm transition-colors"
                  style={
                    {
                      "--action-color": action.color,
                      "--action-bg": action.bg,
                    } as CSSProperties
                  }
                >
                  <Plus className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                  {action.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
