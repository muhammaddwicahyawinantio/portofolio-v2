import Link from "next/link";
import { listInvitations } from "@/lib/wedding/queries";
import { togglePublish, deleteInvitation } from "@/lib/wedding/actions";

export default async function WeddingInvitationsPage() {
  const rows = await listInvitations();
  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-baseline justify-between">
        <h1 className="font-display text-3xl leading-none font-medium tracking-[-0.01em]">
          Wedding Invitations
        </h1>
        <Link
          href="/admin/wedding-invitations/new"
          className="bg-ink text-cream hover:bg-ink-soft rounded-full px-5 py-2.5 text-xs font-semibold tracking-[0.2em] uppercase transition-colors"
        >
          New invitation
        </Link>
      </header>

      <section className="border-line bg-card rounded-card shadow-card overflow-x-auto border">
        {rows.length === 0 ? (
          <p className="text-ink-soft px-6 py-10 text-sm">
            Nothing here yet. Create the first invitation.
          </p>
        ) : (
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="text-ink-soft border-line border-b font-mono text-[11px] tracking-[0.1em] uppercase">
              <tr>
                <th className="px-6 py-3 font-medium">Couple</th>
                <th className="px-6 py-3 font-medium">Slug</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Template</th>
                <th className="px-6 py-3 font-medium">Updated</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-line hover:bg-cream-deep/50 border-t align-top transition-colors"
                >
                  <td className="text-ink px-6 py-4">
                    {r.brideName} &amp; {r.groomName}
                  </td>
                  <td className="text-ink-soft px-6 py-4">{r.slug}</td>
                  <td className="text-ink-soft px-6 py-4">{r.status}</td>
                  <td className="text-ink-soft px-6 py-4">{r.templateSlug}</td>
                  <td className="text-ink-soft px-6 py-4">
                    {r.updatedAt.toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/wedding-invitations/${r.id}`}
                        className="text-ink-soft hover:text-ink text-xs"
                      >
                        Edit
                      </Link>
                      <a
                        href={`/undangan/${r.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-ink-soft hover:text-ink text-xs"
                      >
                        Preview
                      </a>
                      <form action={togglePublish}>
                        <input type="hidden" name="__id" value={r.id} />
                        <button type="submit" className="text-ink-soft hover:text-ink text-xs">
                          {r.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                      </form>
                      <form action={deleteInvitation}>
                        <input type="hidden" name="__id" value={r.id} />
                        <button
                          type="submit"
                          className="text-danger/75 hover:text-danger text-xs transition-colors"
                        >
                          Delete
                        </button>
                      </form>
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
