import Link from "next/link";
import { ImportWorkspacePanel } from "@/features/sources/components/import-workspace-panel";

export default function ManageDataPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">データ運用</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          `Sprint 6` の運用機能です。JSON export/import、CSV export、出典管理への導線をまとめています。
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
              <Link href="/api/export/people.csv" className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
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

        <ImportWorkspacePanel />
      </div>
    </section>
  );
}
