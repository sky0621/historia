import Link from "next/link";
import { getSectListView } from "@/server/services/religions";

export default function SectsPage() {
  const sects = getSectListView();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">宗派</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            宗教配下の宗派を管理します。
          </p>
        </div>
        <Link href="/sects/new" className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
          新規宗派
        </Link>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-white/80 shadow-sm">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-stone-100/70">
            <tr>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">名称</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">宗教</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">期間</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">開祖</th>
            </tr>
          </thead>
          <tbody>
            {sects.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-[var(--muted)]">
                  まだ宗派はありません。
                </td>
              </tr>
            ) : (
              sects.map((sect) => (
                <tr key={sect.id} className="border-t border-[var(--border)]">
                  <td className="px-5 py-4">
                    <Link href={`/sects/${sect.id}`} className="font-medium underline-offset-4 hover:underline">
                      {sect.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4">{sect.religionName}</td>
                  <td className="px-5 py-4">{sect.timeLabel}</td>
                  <td className="px-5 py-4">{sect.founderNames.join(", ") || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
