import { getLocale } from "next-intl/server";
import { getNavigationLinks } from "@/lib/navigation";
import HeaderClient from "@/components/layout/HeaderClient";

export default async function Header() {
  const locale = await getLocale();
  const nav = await getNavigationLinks(locale);
  return <HeaderClient nav={nav} />;
}
