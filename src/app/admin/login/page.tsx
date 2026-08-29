import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { PenTool } from "lucide-react";
import { signIn } from "@/lib/auth";
import SubmitButton from "./SubmitButton";

const INPUT =
  "border-line focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-gold-ink/35 bg-card text-ink rounded-lg border px-4 py-3 text-[15px] outline-none transition-colors";

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
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* ── Sisi form ──────────────────────────────────────────────────────── */}
      <div className="fade-in flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2.5">
            <span
              className="border-line flex h-9 w-9 items-center justify-center rounded-[10px] border"
              aria-hidden
            >
              <PenTool className="text-ink h-4 w-4" strokeWidth={1.5} />
            </span>
            <span className="font-mono text-[12px] font-medium tracking-[0.14em] uppercase">
              Dwi CMS
            </span>
          </div>

          <p className="eyebrow mb-3">Admin access</p>
          <h1 className="font-display text-4xl leading-none font-medium tracking-[-0.01em]">
            Sign in
          </h1>
          <p className="text-ink-soft mt-3 mb-8 text-sm">
            Manage the studio&rsquo;s content and settings.
          </p>

          <form action={login} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-ink-soft font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
                Email
              </span>
              <input name="email" type="email" required autoComplete="username" className={INPUT} />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-ink-soft font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
                Password
              </span>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className={INPUT}
              />
            </label>

            {error ? (
              <p role="alert" className="text-danger text-[13px] leading-[1.5]">
                That email and password do not match an account.
              </p>
            ) : null}

            <SubmitButton />
          </form>
        </div>
      </div>

      {/* ── Sisi brand (desktop) — lembar kedua (cream-1), identitas situs ──── */}
      <aside className="bg-cream-deep relative hidden overflow-hidden lg:block">
        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <p className="eyebrow">Dwi Studio</p>

          <div>
            <h2 className="font-display text-ink text-[clamp(30px,3.2vw,46px)] leading-[1.1] font-medium tracking-[-0.01em]">
              The drafting table for
              <br />
              <em>everything</em> on the site.
            </h2>
            <p className="text-ink-soft mt-6 max-w-md text-sm leading-relaxed">
              Projects, services, media, and messages — edited in one place, published straight to
              the live site.
            </p>
          </div>

          <div className="dim-divider">
            <span>Admin · Restricted</span>
          </div>
        </div>
      </aside>
    </main>
  );
}
