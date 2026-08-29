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
    <div className="admin-shell flex min-h-screen">
      <Sidebar name={session.user.name ?? session.user.email ?? "Admin"} />
      {/* pt-20 di mobile memberi ruang di bawah top bar tetap (h-14) Sidebar. */}
      <main className="relative z-10 min-w-0 flex-1 px-5 pt-20 pb-12 sm:px-6 lg:px-12 lg:py-10">
        {children}
      </main>
    </div>
  );
}
