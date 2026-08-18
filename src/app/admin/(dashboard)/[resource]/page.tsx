import Link from "next/link";
import { notFound } from "next/navigation";
import { getResource } from "@/lib/admin/resources";
import { getDelegate } from "@/lib/admin/delegates";
import { deleteRecord, toggleMessageRead } from "@/lib/admin/actions";
import ResourceForm from "@/components/admin/ResourceForm";

/** Nilai apa pun dari Prisma dijadikan sesuatu yang aman untuk ditaruh di sel tabel. */
function renderCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? "" : "s"}`;
  if (value instanceof Date) {
    return value.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  const text = String(value);
  return text.length > 60 ? `${text.slice(0, 57)}…` : text;
}

export default async function ResourcePage({
  params,
  searchParams,
}: {
  params: Promise<{ resource: string }>;
  searchParams: Promise<{ id?: string; saved?: string }>;
}) {
  const { resource: key } = await params;
  const { id, saved } = await searchParams;

  const resource = getResource(key);
  const delegate = getDelegate(key);
  if (!resource || !delegate) notFound();

  const rows = resource.singleton
    ? []
    : await delegate.findMany({ orderBy: resource.orderBy, take: 200 });

  // Singleton mengedit satu-satunya baris; sisanya mengedit baris dari ?id=.
  const editing = resource.singleton
    ? await delegate.findFirst({})
    : id
      ? ((rows.find((r) => r.id === id) ?? null) as Record<string, unknown> | null)
      : null;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-baseline justify-between">
        <h1 className="font-display text-3xl leading-none font-extrabold tracking-[-0.03em]">
          {resource.label}
        </h1>
        {saved ? <p className="text-sm text-[#4ade80]">Saved.</p> : null}
      </header>

      {resource.readOnly ? null : (
        <section className="border-graphite/40 bg-ink-raised border p-6">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-[11px] font-semibold tracking-[0.2em] uppercase">
              {resource.singleton ? "Content" : editing ? "Edit entry" : "New entry"}
            </h2>
            {editing && !resource.singleton ? (
              <Link href={`/admin/${key}`} className="text-ash hover:text-paper text-xs">
                Cancel edit
              </Link>
            ) : null}
          </div>
          <ResourceForm resource={resource} record={editing} />
        </section>
      )}

      {resource.singleton ? null : (
        <section className="border-graphite/40 bg-ink-raised overflow-x-auto border">
          {rows.length === 0 ? (
            <p className="text-ash px-6 py-10 text-sm">
              Nothing here yet.{" "}
              {resource.readOnly ? "" : "Use the form above to add the first one."}
            </p>
          ) : (
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="text-graphite text-[10px] tracking-[0.2em] uppercase">
                <tr>
                  {resource.columns.map((column) => (
                    <th key={column} className="px-6 py-3 font-semibold">
                      {column.replace(/_/g, " ")}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={String(row.id)} className="border-graphite/30 border-t align-top">
                    {resource.columns.map((column) => (
                      <td key={column} className="text-ash px-6 py-4">
                        {column === resource.columns[0] && row.isRead === false ? (
                          <span
                            aria-label="Unread"
                            className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#4ade80]"
                          />
                        ) : null}
                        {renderCell(row[column])}
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-4">
                        {resource.readOnly ? (
                          <form action={toggleMessageRead}>
                            <input type="hidden" name="__id" value={String(row.id)} />
                            <input type="hidden" name="__isRead" value={String(row.isRead)} />
                            <button type="submit" className="text-ash hover:text-paper text-xs">
                              Mark {row.isRead ? "unread" : "read"}
                            </button>
                          </form>
                        ) : (
                          <Link
                            href={`/admin/${key}?id=${row.id}`}
                            className="text-ash hover:text-paper text-xs"
                          >
                            Edit
                          </Link>
                        )}

                        <form action={deleteRecord}>
                          <input type="hidden" name="__resource" value={key} />
                          <input type="hidden" name="__id" value={String(row.id)} />
                          <button type="submit" className="text-xs text-red-400 hover:text-red-300">
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
      )}
    </div>
  );
}
