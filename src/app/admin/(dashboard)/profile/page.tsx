import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const INPUT =
  "border-line focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-gold-ink/35 bg-card text-ink w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors";

function Label({ children, name, ...rest }: React.ComponentProps<"input"> & { children: string }) {
  return (
    <label className="block">
      <span className="text-ink-soft mb-2 block font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
        {children}
      </span>
      <input name={name} className={INPUT} {...rest} />
    </label>
  );
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;

  const session = await auth();
  const user = session?.user?.email
    ? await prisma.adminUser.findUnique({ where: { email: session.user.email } })
    : null;
  if (!user) redirect("/admin/login");

  async function save(form: FormData) {
    "use server";

    // Dicek ulang di dalam aksi: server action adalah endpoint HTTP tersendiri.
    const current = await auth();
    if (!current?.user?.email) redirect("/admin/login");

    const account = await prisma.adminUser.findUnique({ where: { email: current.user.email } });
    if (!account) redirect("/admin/login");

    const name = String(form.get("name") ?? "").trim();
    const avatar = String(form.get("avatar") ?? "").trim();
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");

    if (!name) redirect("/admin/profile?error=name");

    const data: { name: string; avatar: string | null; passwordHash?: string } = {
      name,
      avatar: avatar || null,
    };

    if (newPassword) {
      // Ganti password wajib membuktikan kepemilikan sesi saat ini, supaya
      // sesi yang bocor tidak bisa langsung mengunci pemilik aslinya.
      if (newPassword.length < 10) redirect("/admin/profile?error=short");
      const ok = await bcrypt.compare(currentPassword, account.passwordHash);
      if (!ok) redirect("/admin/profile?error=password");
      data.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await prisma.adminUser.update({ where: { id: account.id }, data });
    revalidatePath("/admin/profile");
    redirect("/admin/profile?saved=1");
  }

  const ERRORS: Record<string, string> = {
    name: "Name cannot be empty.",
    password: "Your current password is not correct.",
    short: "The new password needs at least 10 characters.",
  };

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <header className="flex items-baseline justify-between">
        <h1 className="font-display text-3xl leading-none font-medium tracking-[-0.01em]">
          Profile
        </h1>
        {saved ? <p className="text-success font-mono text-[13px]">Saved.</p> : null}
      </header>

      <form
        action={save}
        className="border-line bg-card rounded-card shadow-card flex flex-col gap-5 border p-6"
      >
        <p className="text-ink-soft text-sm">
          Signed in as <span className="text-ink">{user.email}</span>
        </p>

        <Label name="name" defaultValue={user.name} required>
          Name
        </Label>
        <Label name="avatar" type="url" defaultValue={user.avatar ?? ""}>
          Avatar URL
        </Label>

        <div className="border-line mt-2 border-t pt-6">
          <p className="text-ink-soft mb-5 font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
            Change password
          </p>
          <div className="flex flex-col gap-5">
            <Label name="currentPassword" type="password" autoComplete="current-password">
              Current password
            </Label>
            <Label name="newPassword" type="password" autoComplete="new-password">
              New password
            </Label>
            <p className="text-ink-soft text-xs">Leave both blank to keep your current password.</p>
          </div>
        </div>

        {error ? (
          <p role="alert" className="text-danger text-[13px] leading-[1.5]">
            {ERRORS[error] ?? "Something went wrong."}
          </p>
        ) : null}

        <div>
          <button
            type="submit"
            className="bg-ink text-cream hover:bg-ink-soft rounded-full px-6 py-3 text-xs font-semibold tracking-[0.2em] uppercase transition-colors"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
