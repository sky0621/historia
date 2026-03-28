import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "data"
};

export default function ManageDataPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">データ運用</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          現在の運用機能です。対象別の CSV export と出典管理への導線をまとめています。
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
          <h2 className="text-lg font-semibold">Export</h2>
          <div className="mt-5 grid gap-3">
            <Link href="/api/export/polities.csv" className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
              Polity CSV をダウンロード
            </Link>
            <Link href="/api/export/period-categories.csv" className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
              Period Category CSV をダウンロード
            </Link>
            <Link href="/api/export/historical-periods.csv" className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
              Historical Period CSV をダウンロード
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
    </section>
  );
}
