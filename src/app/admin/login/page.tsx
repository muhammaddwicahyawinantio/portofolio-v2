import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function login(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/admin",
      });
    } catch (err) {
      // signIn melempar NEXT_REDIRECT saat berhasil — hanya AuthError yang
      // boleh ditangani, sisanya wajib diteruskan.
      if (err instanceof AuthError) redirect("/admin/login?error=1");
      throw err;
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="border-graphite/50 bg-ink-raised w-full max-w-sm border p-8">
        <p className="text-ash mb-2 text-[11px] font-semibold tracking-[0.3em] uppercase">
          Dwi CMS
        </p>
        <h1 className="font-display mb-8 text-3xl leading-none font-extrabold tracking-[-0.03em]">
          Sign in
        </h1>

        <form action={login} className="flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-ash text-[11px] font-semibold tracking-[0.2em] uppercase">
              Email
            </span>
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              className="border-graphite/60 focus:border-paper bg-ink text-paper border px-4 py-3 text-sm outline-none"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-ash text-[11px] font-semibold tracking-[0.2em] uppercase">
              Password
            </span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="border-graphite/60 focus:border-paper bg-ink text-paper border px-4 py-3 text-sm outline-none"
            />
          </label>

          {error ? (
            <p role="alert" className="text-sm text-red-400">
              That email and password do not match an account.
            </p>
          ) : null}

          <button
            type="submit"
            className="bg-paper text-ink hover:bg-silver mt-2 px-6 py-3 text-xs font-semibold tracking-[0.2em] uppercase transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
