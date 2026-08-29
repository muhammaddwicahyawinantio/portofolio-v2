import Link from "next/link";
import { toggleTestimonialStatus } from "@/lib/testimonials/actions";
import { prisma } from "@/lib/prisma";
import TestimonialAdminForm from "@/components/admin/TestimonialAdminForm";
import TestimonialDeleteForm from "@/components/admin/TestimonialDeleteForm";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function AdminTestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; saved?: string }>;
}) {
  const { id, saved } = await searchParams;
  const rows = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  const editing = id ? (rows.find((row) => row.id === id) ?? null) : null;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-baseline justify-between">
        <h1 className="font-display text-3xl leading-none font-medium tracking-[-0.01em]">
          Testimonials
        </h1>
        {saved ? <p className="text-success font-mono text-[13px]">Saved.</p> : null}
      </header>

      <section className="border-line bg-card rounded-card shadow-card border p-6">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
            {editing ? "Edit testimonial" : "Create testimonial"}
          </h2>
          {editing ? (
            <Link href="/admin/testimonials" className="text-ink-soft hover:text-ink text-xs">
              Cancel edit
            </Link>
          ) : null}
        </div>
        <TestimonialAdminForm record={editing} />
      </section>

      <section className="border-line bg-card rounded-card shadow-card overflow-x-auto border">
        {rows.length === 0 ? (
          <p className="text-ink-soft px-6 py-10 text-sm">
            Nothing here yet. Public submissions will appear as pending.
          </p>
        ) : (
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="text-ink-soft border-line border-b font-mono text-[11px] tracking-[0.1em] uppercase">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Position</th>
                <th className="px-6 py-3 font-medium">Rating</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Created</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-line hover:bg-cream-deep/50 border-t align-top transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {row.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element -- no next/image usage anywhere in this codebase
                        <img
                          src={row.avatar}
                          alt=""
                          className="border-line size-10 shrink-0 rounded-full border object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden
                          className="bg-cream-deep text-ink/35 font-display flex size-10 shrink-0 items-center justify-center rounded-full text-base leading-none font-medium"
                        >
                          {row.name.charAt(0)}
                        </span>
                      )}
                      <span>
                        <span className="font-display block text-sm font-medium">{row.name}</span>
                        <span className="text-ink-soft line-clamp-1 max-w-xs text-xs">
                          {row.content}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="text-ink-soft px-6 py-4">{row.position ?? "-"}</td>
                  <td className="text-ink-soft px-6 py-4">{row.rating}/5</td>
                  <td className="px-6 py-4">
                    <form action={toggleTestimonialStatus}>
                      <input type="hidden" name="__id" value={row.id} />
                      <input type="hidden" name="__isActive" value={String(row.isActive)} />
                      <button
                        type="submit"
                        className={`rounded-full px-3 py-1 font-mono text-[10px] font-medium tracking-[0.12em] uppercase transition-colors ${
                          row.isActive
                            ? "bg-success/15 text-success hover:bg-success/25"
                            : "bg-gold/20 text-gold-ink hover:bg-gold/30"
                        }`}
                      >
                        {row.isActive ? "Active" : "Pending"}
                      </button>
                    </form>
                  </td>
                  <td className="text-ink-soft px-6 py-4">{formatDate(row.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/testimonials?id=${row.id}`}
                        className="text-ink-soft hover:text-ink text-xs"
                      >
                        Edit
                      </Link>
                      <TestimonialDeleteForm id={row.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
