import Link from "next/link";
import Container from "@/components/ui/Container";
import LocaleSwitch from "@/components/layout/LocaleSwitch";
import { messages } from "@/i18n/t";

// Nav statis di Fase 1; sumbernya pindah ke model NavigationItem di Fase 7.
const NAV = [
  { key: "about", href: "/about" },
  { key: "projects", href: "/projects" },
  { key: "contact", href: "/contact" },
] as const;

export default function Header() {
  return (
    <header className="border-graphite/60 fixed inset-x-0 top-0 z-30 border-b bg-transparent md:pl-[var(--spacing-rail)]">
      <Container className="flex h-16 items-center justify-between md:h-20">
        <Link
          href="/"
          className="font-display text-sm font-extrabold tracking-[-0.02em] uppercase md:text-base"
        >
          Dwi Studio
        </Link>

        <nav className="flex items-center gap-6 md:gap-10">
          <ul className="hidden items-center gap-6 md:flex md:gap-10">
            {NAV.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="text-silver hover:text-paper text-[11px] font-semibold tracking-[0.2em] uppercase transition-colors duration-300"
                >
                  {messages.nav[item.key]}
                </Link>
              </li>
            ))}
          </ul>
          <LocaleSwitch />
        </nav>
      </Container>
    </header>
  );
}
