import Link from "next/link";
import { getHistoricalPeriodsListView } from "@/server/services/historical-periods";

export default function PeriodsPage() {
  const periods = getHistoricalPeriodsListView();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">時代区分</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            カテゴリ付きの時代区分を管理します。
          </p>
        </div>
        <Link href="/periods/new" className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
          新規時代区分
        </Link>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-white/80 shadow-sm">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-stone-100/70">
            <tr>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">名称</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">カテゴリ</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">対象</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">期間</th>
            </tr>
          </thead>
          <tbody>
            {periods.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-[var(--muted)]">
                  まだ時代区分はありません。
                </td>
              </tr>
            ) : (
              periods.map((period) => (
                <tr key={period.id} className="border-t border-[var(--border)]">
                  <td className="px-5 py-4">
                    <Link href={`/periods/${period.id}`} className="font-medium underline-offset-4 hover:underline">
                      {period.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4">{period.categoryName}</td>
                  <td className="px-5 py-4">{period.polityName ?? period.regionLabel ?? "-"}</td>
                  <td className="px-5 py-4">{period.timeLabel}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
