import Link from "next/link";

export default function ChildList<T extends { id: string }>({
  rows,
  columns,
  tab,
  invitationId,
  deleteAction,
}: {
  rows: T[];
  columns: { label: string; get: (row: T) => string }[];
  tab: string;
  invitationId: string;
  deleteAction: (form: FormData) => void | Promise<void>;
}) {
  if (rows.length === 0) return <p className="text-ink-soft mt-6 text-sm">No entries yet.</p>;
  return (
    <div className="border-line mt-8 overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="text-ink-soft border-line border-b font-mono text-[11px] tracking-[0.1em] uppercase">
          <tr>
            {columns.map((c) => (
              <th key={c.label} className="px-4 py-2.5 font-medium">
                {c.label}
              </th>
            ))}
            <th className="px-4 py-2.5 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-line border-t">
              {columns.map((c) => (
                <td key={c.label} className="text-ink-soft px-4 py-3">
                  {c.get(row)}
                </td>
              ))}
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-4">
                  <Link
                    href={`/admin/wedding-invitations/${invitationId}?tab=${tab}&child=${row.id}`}
                    className="text-ink-soft hover:text-ink text-xs"
                  >
                    Edit
                  </Link>
                  <form action={deleteAction}>
                    <input type="hidden" name="__id" value={row.id} />
                    <input type="hidden" name="__invitationId" value={invitationId} />
                    <button type="submit" className="text-danger/75 hover:text-danger text-xs">
                      Delete
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
