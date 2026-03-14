import Link from "next/link";

type ListingPageProps = {
  title: string;
  description: string;
  columns: string[];
  rows: string[][];
  primaryAction: {
    href: string;
    label: string;
  };
};

export function ListingPage({
  title,
  description,
  columns,
  rows,
  primaryAction
}: ListingPageProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
          </div>
          <Link
            href={primaryAction.href}
            className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white"
          >
            {primaryAction.label}
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
          <div className="rounded-[24px] border border-[var(--border)] bg-white/80 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Search Skeleton
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)]">
                年代フィルタ
              </div>
              <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)]">
                関連主体フィルタ
              </div>
            </div>
          </div>
          <div className="rounded-[24px] border border-[var(--border)] bg-white/80 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Status
            </h2>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              一覧、詳細、編集の共通骨格を Sprint 1 で揃え、実データ連携は Sprint 2 以降で追加します。
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-white/80 shadow-sm">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-stone-100/70">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-5 py-4 font-semibold text-[var(--muted)]">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${title}-${index}`} className="border-t border-[var(--border)]">
                {row.map((cell) => (
                  <td key={cell} className="px-5 py-4">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
