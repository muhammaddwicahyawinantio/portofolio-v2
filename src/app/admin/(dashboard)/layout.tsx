import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/admin/Sidebar";

/**
 * Penjaga untuk seluruh CMS. /admin/login sengaja berada di luar route group
 * ini, supaya halaman login tidak ikut terkunci di balik penjaganya sendiri.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar name={session.user.name ?? session.user.email ?? "Admin"} />
      <main className="min-w-0 flex-1 px-8 py-10 lg:px-12">{children}</main>
    </div>
  );
}
