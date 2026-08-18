import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Link/usePathname yang locale-aware — pakai ini, bukan next/link, di sisi publik.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
