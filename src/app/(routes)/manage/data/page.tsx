import type { Metadata } from "next";
import Link from "next/link";
import { CsvImportPanel } from "@/features/data-import/components/csv-import-panel";
import { getRecentImportRuns } from "@/server/services/import-runs";

export const metadata: Metadata = {
  title: "data"
};

export default function ManageDataPage() {
  const recentImportRuns = getRecentImportRuns();

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">データ運用</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          現在の運用機能です。対象別の CSV export / import と出典管理への導線をまとめています。
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,1.1fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
            <h2 className="text-lg font-semibold">Export</h2>
            <div className="mt-5 grid gap-3">
              <Link href="/api/export/religions.csv" className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
                Religion CSV をダウンロード
              </Link>
              <Link href="/api/export/polities.csv" className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
                Polity CSV をダウンロード
              </Link>
              <Link href="/api/export/period-categories.csv" className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
                Period Category CSV をダウンロード
              </Link>
              <Link href="/api/export/historical-periods.csv" className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
                Historical Period CSV をダウンロード
              </Link>
              <Link href="/api/export/historical-period-category-links.csv" className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
                Historical Period Category Link CSV をダウンロード
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
            <h2 className="text-lg font-semibold">出典管理</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Source と Citation は別ドメインとして管理します。
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/sources" className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">
                出典一覧へ
              </Link>
              <Link href="/sources/new" className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white">
                出典を追加
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <CsvImportPanel />

          <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
            <h2 className="text-lg font-semibold">Import 履歴</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">CSV import の直近結果を確認できます。</p>

            {recentImportRuns.length === 0 ? (
              <p className="mt-5 text-sm text-[var(--muted)]">まだ履歴はありません。</p>
            ) : (
              <div className="mt-5 space-y-3">
                {recentImportRuns.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-[var(--border)] px-4 py-4">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="font-medium">{item.sourceFormat.toUpperCase()}</span>
                      <span>{item.targetType}</span>
                      <span>{item.action}</span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          item.status === "ok" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-[var(--muted)]">
                      {item.fileName ? <p>file: {item.fileName}</p> : null}
                      <p>run id: {item.id}</p>
                    </div>
                    <pre className="mt-3 overflow-x-auto rounded-2xl bg-[var(--surface)] px-3 py-3 text-xs text-[var(--muted)]">
                      {JSON.stringify(item.summary, null, 2)}
                    </pre>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
