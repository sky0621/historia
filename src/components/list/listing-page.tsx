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
  const itemCount = rows.length;

  return (
    <section className="space-y-8">
      <div className="historia-panel rounded-[14px] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.4fr,0.8fr]">
          <div className="space-y-5">
            <div className="historia-label">Archive listing</div>
            <div>
              <h1 className="historia-title text-4xl font-semibold sm:text-5xl">{title}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted-strong)] sm:text-base">{description}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <SummaryPill label="Records" value={`${itemCount}`} />
              <SummaryPill label="Columns" value={`${columns.length}`} />
              <SummaryPill label="Mode" value="Curated" />
            </div>
          </div>

          <div className="historia-inset rounded-[14px] p-5">
            <div className="space-y-4">
              <Link
                href={primaryAction.href}
                className="inline-flex w-full items-center justify-center rounded-[14px] border border-[var(--accent-strong)] bg-[var(--accent)] px-5 py-3 text-sm font-medium text-[var(--button-foreground-contrast)] hover:bg-[var(--accent-strong)]"
              >
                {primaryAction.label}
              </Link>
              <div className="rounded-[14px] border border-dashed border-[var(--border-strong)] bg-black/10 px-4 py-4 text-sm leading-6 text-[var(--muted-strong)]">
                検索・フィルタ導線はここへ統合する想定です。上部で一覧の役割を明確にし、結果領域は密度を維持します。
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="historia-card overflow-hidden rounded-[14px]">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-4 sm:px-6">
          <div>
            <div className="historia-label">Results</div>
            <div className="mt-2 text-lg font-semibold text-[var(--foreground-strong)]">{title} 一覧</div>
          </div>
          <div className="rounded-[14px] border border-[var(--border)] bg-black/10 px-3 py-1.5 text-xs text-[var(--muted-strong)]">
            {itemCount} 件
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-[var(--surface-soft)]">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-5 py-4 font-medium tracking-[0.08em] text-[var(--muted)] uppercase">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={`${title}-${index}`}
                className="border-t border-[var(--border)] bg-transparent transition hover:bg-white/4"
              >
                {row.map((cell) => (
                  <td key={cell} className="px-5 py-4 text-[var(--foreground)]">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </section>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-[var(--border)] bg-black/10 px-4 py-2 text-sm text-[var(--muted-strong)]">
      <span className="mr-2 text-[0.68rem] uppercase tracking-[0.18em] text-[var(--muted)]">{label}</span>
      <span className="font-semibold text-[var(--foreground-strong)]">{value}</span>
    </div>
  );
}
