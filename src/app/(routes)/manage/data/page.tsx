import Link from "next/link";
import { CsvImportPanel } from "@/features/csv-import/components/csv-import-panel";
import { ImportWorkspacePanel } from "@/features/sources/components/import-workspace-panel";
import { getRecentImportRuns } from "@/server/services/import-runs";

export default function ManageDataPage() {
  const recentImportRuns = getRecentImportRuns();

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">データ運用</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          `Sprint 11` 時点の運用機能です。JSON export/import、CSV export/import、file upload、履歴確認への導線をまとめています。
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
            <h2 className="text-lg font-semibold">Export</h2>
            <div className="mt-5 grid gap-3">
              <Link href="/api/export/json" className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
                JSON export をダウンロード
              </Link>
              <Link href="/api/export/events.csv" className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
                Event CSV をダウンロード
              </Link>
              <Link href="/api/export/person.csv" className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
                Person CSV をダウンロード
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
          <ImportWorkspacePanel />

          <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
            <h2 className="text-lg font-semibold">Import 履歴</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              preview/import の直近結果を再確認できます。CSV と JSON をまとめて表示します。
            </p>

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
                      <p>at: {item.createdAt.toLocaleString("ja-JP")}</p>
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
