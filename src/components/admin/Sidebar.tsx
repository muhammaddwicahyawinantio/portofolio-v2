"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import clsx from "clsx";
import {
  LayoutDashboard,
  FolderKanban,
  Globe,
  Package,
  Box,
  Image as ImageIcon,
  Images,
  Quote,
  User,
  GraduationCap,
  Briefcase,
  Award,
  Sparkles,
  Music,
  Film,
  Wrench,
  Tag,
  LayoutGrid,
  Gift,
  Heart,
  Bot,
  Settings,
  Menu,
  Copyright,
  Mail,
  AtSign,
  Share2,
  CircleUser,
  PenTool,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  type LucideIcon,
} from "lucide-react";
import { signOutAction } from "@/lib/admin/actions";

const SECTION_ACCENTS = {
  dashboard: { color: "#2563eb", bg: "#dbeafe" },
  content: { color: "#7c3aed", bg: "#ede9fe" },
  about: { color: "#0891b2", bg: "#cffafe" },
  services: { color: "#059669", bg: "#d1fae5" },
  weddings: { color: "#e11d48", bg: "#ffe4e6" },
  "ai-chat": { color: "#d97706", bg: "#fef3c7" },
  settings: { color: "#475569", bg: "#e2e8f0" },
} as const;

type NavTone = keyof typeof SECTION_ACCENTS;

function sectionStyle(key: string): CSSProperties {
  const tone = SECTION_ACCENTS[key as NavTone] ?? SECTION_ACCENTS.dashboard;
  return {
    "--section-accent": tone.color,
    "--section-bg": tone.bg,
  } as CSSProperties;
}

/* Struktur navigasi CMS. Dua level: ikon rail (section) → panel detail (item).
   Setiap item menunjuk ke rute /admin/[resource] yang SUDAH ada — hanya label &
   pengelompokannya yang baru (mis. "Pricing" = resource `services`). Lima
   resource yang tak disebut plan (hero, about, skills, testimonials, media)
   dilipat ke grup terdekat supaya tak ada akses/data yang hilang. */
type NavItem = { label: string; href: string; icon: LucideIcon };
type NavSection = {
  key: string;
  label: string;
  icon: LucideIcon;
  href?: string; // standalone (tanpa submenu) → klik langsung navigasi
  hint?: string; // teks panel untuk section standalone
  items?: NavItem[];
};

const NAV: NavSection[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
    hint: "Overview, metrics, and the latest activity across the CMS.",
  },
  {
    key: "content",
    label: "Content",
    icon: FolderKanban,
    items: [
      { label: "Projects", href: "/admin/projects", icon: FolderKanban },
      { label: "Website", href: "/admin/websites", icon: Globe },
      { label: "Product Digital", href: "/admin/products", icon: Package },
      { label: "3D Gallery", href: "/admin/gallery-3d", icon: Box },
      { label: "Hero", href: "/admin/hero", icon: ImageIcon },
      { label: "Media", href: "/admin/media-gallery", icon: Images },
      { label: "Testimonials", href: "/admin/testimonials", icon: Quote },
    ],
  },
  {
    key: "about",
    label: "About",
    icon: User,
    items: [
      { label: "Biography", href: "/admin/about", icon: User },
      { label: "Education", href: "/admin/education", icon: GraduationCap },
      { label: "Work", href: "/admin/work-experience", icon: Briefcase },
      { label: "Certification", href: "/admin/certifications", icon: Award },
      { label: "Skills", href: "/admin/skills", icon: Sparkles },
      { label: "Music", href: "/admin/music", icon: Music },
      { label: "Film", href: "/admin/films", icon: Film },
    ],
  },
  {
    key: "services",
    label: "Services",
    icon: Wrench,
    items: [
      { label: "Pricing", href: "/admin/services", icon: Tag },
      { label: "Features", href: "/admin/features", icon: LayoutGrid },
      { label: "Benefits", href: "/admin/benefits", icon: Gift },
    ],
  },
  {
    key: "weddings",
    label: "Weddings",
    icon: Heart,
    href: "/admin/wedding-invitations",
    hint: "Digital wedding invitations — create, theme, publish, and review RSVPs.",
  },
  {
    key: "ai-chat",
    label: "Dwi AI",
    icon: Bot,
    href: "/admin/dwiai-settings",
    hint: "Assistant settings for the public Dwi AI widget.",
  },
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    items: [
      { label: "Navbar", href: "/admin/navigation", icon: Menu },
      { label: "Footer", href: "/admin/footer", icon: Copyright },
      { label: "Message", href: "/admin/messages", icon: Mail },
      { label: "Contact", href: "/admin/contact", icon: AtSign },
      { label: "Social Links", href: "/admin/social-links", icon: Share2 },
      { label: "Profile", href: "/admin/profile", icon: CircleUser },
    ],
  },
];

/** Section yang memiliki pathname aktif — untuk highlight rail & panel awal. */
function sectionForPath(pathname: string): string {
  for (const s of NAV) {
    if (s.href === pathname) return s.key;
    if (s.items?.some((i) => i.href === pathname)) return s.key;
  }
  // Prefix match for standalone sections with sub-routes (mis. editor undangan
  // /admin/wedding-invitations/[id]). "/admin" dilewati agar tidak menang atas
  // semua path.
  if (pathname === "/admin/ai-chat") return "ai-chat";
  for (const s of NAV) {
    if (s.href && s.href !== "/admin" && pathname.startsWith(s.href)) return s.key;
  }
  return "dashboard";
}

const RAIL_BTN =
  "relative flex h-11 w-11 items-center justify-center rounded-[12px] transition-colors";

function Rail({
  activeKey,
  openKey,
  onSelect,
  collapsed,
  onToggleCollapse,
}: {
  activeKey: string;
  openKey: string;
  onSelect: (key: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  return (
    <div className="admin-rail border-line flex w-16 shrink-0 flex-col items-center gap-1 border-r py-4">
      <div
        className="admin-rail-logo border-line mb-2 flex h-10 w-10 items-center justify-center rounded-[12px] border"
        aria-hidden
      >
        <PenTool className="text-ink h-5 w-5" strokeWidth={1.5} />
      </div>

      {NAV.map((s) => {
        const owns = s.key === activeKey;
        const shown = s.key === openKey;
        const Icon = s.icon;
        const style = sectionStyle(s.key);
        const cls = clsx(
          RAIL_BTN,
          "admin-rail-button",
          owns && "is-active",
          shown && !owns && "is-open",
        );
        const tick = owns ? (
          <span
            className="admin-rail-tick absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-full"
            aria-hidden
          />
        ) : null;

        return s.href ? (
          <Link
            key={s.key}
            href={s.href}
            title={s.label}
            aria-label={s.label}
            onClick={() => onSelect(s.key)}
            className={cls}
            style={style}
          >
            {tick}
            <Icon className="h-5 w-5" strokeWidth={1.5} />
          </Link>
        ) : (
          <button
            key={s.key}
            type="button"
            title={s.label}
            aria-label={s.label}
            aria-expanded={shown}
            onClick={() => onSelect(s.key)}
            className={cls}
            style={style}
          >
            {tick}
            <Icon className="h-5 w-5" strokeWidth={1.5} />
          </button>
        );
      })}

      <div className="mt-auto flex flex-col items-center gap-1">
        {onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand panel" : "Collapse panel"}
            aria-label={collapsed ? "Expand panel" : "Collapse panel"}
            className="admin-rail-button flex h-11 w-11 items-center justify-center rounded-[12px] transition-colors"
            style={sectionStyle("settings")}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5" strokeWidth={1.5} />
            ) : (
              <PanelLeftClose className="h-5 w-5" strokeWidth={1.5} />
            )}
          </button>
        ) : null}
        <form action={signOutAction}>
          <button
            type="submit"
            title="Sign out"
            aria-label="Sign out"
            className="admin-rail-button hover:text-danger flex h-11 w-11 items-center justify-center rounded-[12px] transition-colors"
            style={sectionStyle("weddings")}
          >
            <LogOut className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </form>
      </div>
    </div>
  );
}

function Panel({
  section,
  name,
  pathname,
  onClose,
}: {
  section: NavSection;
  name: string;
  pathname: string;
  onClose?: () => void;
}) {
  const SectionIcon = section.icon;
  const style = sectionStyle(section.key);

  return (
    <div className="admin-panel border-line flex h-full w-[232px] flex-col border-r" style={style}>
      <div className="border-line flex items-center justify-between gap-2 border-b px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="admin-panel-mark" aria-hidden>
            <SectionIcon className="h-4 w-4" strokeWidth={1.7} />
          </span>
          <div className="min-w-0">
            <p className="text-ink font-mono text-[12px] font-medium tracking-[0.14em] uppercase">
              Dwi CMS
            </p>
            <p className="text-ink-soft mt-0.5 truncate text-xs">{name}</p>
          </div>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="text-ink-soft hover:text-ink -mr-1 p-1 transition-colors"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-2 px-5 pt-5 pb-2">
        <span className="eyebrow">{section.label}</span>
        <span className="admin-panel-line h-px flex-1" aria-hidden />
      </div>

      {section.items ? (
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <ul className="flex flex-col gap-0.5">
            {section.items.map((it) => {
              const active = pathname === it.href;
              const Icon = it.icon;
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    aria-current={active ? "page" : undefined}
                    className={clsx(
                      "admin-panel-link flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm transition-colors",
                      active && "is-active",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                    <span className="truncate">{it.label}</span>
                    {active ? (
                      <span
                        className="admin-panel-dot ml-auto h-1.5 w-1.5 shrink-0 rounded-full"
                        aria-hidden
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : (
        <div className="flex-1 px-5 py-3">
          <p className="text-ink-soft text-sm leading-relaxed">{section.hint}</p>
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ name }: { name: string }) {
  const pathname = usePathname();
  const activeKey = sectionForPath(pathname);
  const [openKey, setOpenKey] = useState(activeKey);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Navigasi menutup drawer mobile & memindah panel ke section tujuan.
  useEffect(() => {
    setOpenKey(sectionForPath(pathname));
    setMobileOpen(false);
  }, [pathname]);

  // Esc menutup drawer mobile.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const openSection = NAV.find((s) => s.key === openKey) ?? NAV[0]!;
  const selectSection = (key: string) => {
    setOpenKey(key);
    setCollapsed(false);
  };

  return (
    <>
      {/* ── Desktop: rail + panel (sticky, sejajar konten) ─────────────────── */}
      <aside className="admin-sidebar bg-card sticky top-0 hidden h-screen shrink-0 lg:flex">
        <Rail
          activeKey={activeKey}
          openKey={openKey}
          onSelect={selectSection}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />
        <div
          className={clsx(
            "overflow-hidden transition-[width] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            collapsed ? "w-0" : "w-[232px]",
          )}
        >
          <Panel section={openSection} name={name} pathname={pathname} />
        </div>
      </aside>

      {/* ── Mobile: top bar + drawer ───────────────────────────────────────── */}
      <div className="admin-mobile-bar border-line bg-card/95 fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2.5">
          <span
            className="admin-rail-logo border-line flex h-8 w-8 items-center justify-center rounded-[10px] border"
            aria-hidden
          >
            <PenTool className="text-ink h-4 w-4" strokeWidth={1.5} />
          </span>
          <span className="font-mono text-[12px] font-medium tracking-[0.14em] uppercase">
            Dwi CMS
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          className="text-ink-soft hover:text-ink p-1 transition-colors"
        >
          <Menu className="h-6 w-6" strokeWidth={1.5} />
        </button>
      </div>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="bg-ink/30 fixed inset-0 z-40 lg:hidden"
        />
      ) : null}

      <aside
        // inert saat tertutup: drawer tetap di DOM (untuk transisi slide) tapi
        // link-nya keluar dari tab order & a11y tree selama off-screen.
        inert={!mobileOpen}
        aria-hidden={!mobileOpen}
        className={clsx(
          "admin-sidebar bg-card fixed inset-y-0 left-0 z-50 flex transition-transform duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Rail activeKey={activeKey} openKey={openKey} onSelect={selectSection} />
        <Panel
          section={openSection}
          name={name}
          pathname={pathname}
          onClose={() => setMobileOpen(false)}
        />
      </aside>
    </>
  );
}
