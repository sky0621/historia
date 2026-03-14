import Link from "next/link";
import { getPolityListView } from "@/server/services/polities";

export default function PolitiesPage() {
  const polities = getPolityListView();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">国家</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            国家・政体の開始終了年と関連地域を管理します。
          </p>
        </div>
        <Link href="/polities/new" className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
          新規国家
        </Link>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-white/80 shadow-sm">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-stone-100/70">
            <tr>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">名称</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">期間</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">地域</th>
            </tr>
          </thead>
          <tbody>
            {polities.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-[var(--muted)]">
                  まだ国家はありません。
                </td>
              </tr>
            ) : (
              polities.map((polity) => (
                <tr key={polity.id} className="border-t border-[var(--border)]">
                  <td className="px-5 py-4">
                    <Link href={`/polities/${polity.id}`} className="font-medium underline-offset-4 hover:underline">
                      {polity.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4">{polity.timeLabel}</td>
                  <td className="px-5 py-4 text-[var(--muted)]">{polity.regionNames.join(", ") || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
