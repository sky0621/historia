import Link from "next/link";
import { getDynastyListView } from "@/server/services/polities";

type DynastiesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DynastiesPage({ searchParams }: DynastiesPageProps) {
  const params = searchParams ? await searchParams : {};
  const query = getSingleParam(params.q);
  const dynasties = getDynastyListView(query);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">王朝</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            国家に属する王朝とその期間を管理します。
          </p>
        </div>
        <Link href="/dynasties/new" className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
          新規王朝
        </Link>
      </div>

      <form className="flex flex-col gap-3 rounded-[32px] border border-[var(--border)] bg-white/80 p-6 shadow-sm md:flex-row md:items-end">
        <label className="flex-1 space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">名称検索</span>
          <input name="q" defaultValue={query} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2" placeholder="王朝名・別名・所属国家・地域" />
        </label>
        <div className="flex gap-3">
          <button type="submit" className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
            検索
          </button>
          <Link href="/dynasties" className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium">
            リセット
          </Link>
        </div>
      </form>

      <div className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-white/80 shadow-sm">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-stone-100/70">
            <tr>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">名称</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">所属国家</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">期間</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">地域</th>
            </tr>
          </thead>
          <tbody>
            {dynasties.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-[var(--muted)]">
                  まだ王朝はありません。
                </td>
              </tr>
            ) : (
              dynasties.map((dynasty) => (
                <tr key={dynasty.id} className="border-t border-[var(--border)]">
                  <td className="px-5 py-4">
                    <Link href={`/dynasties/${dynasty.id}`} className="font-medium underline-offset-4 hover:underline">
                      {dynasty.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4">{dynasty.polityName}</td>
                  <td className="px-5 py-4">{dynasty.timeLabel}</td>
                  <td className="px-5 py-4 text-[var(--muted)]">{dynasty.regionNames.join(", ") || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
