import Link from "next/link";
import { getPolityListView, getRegionOptions } from "@/server/services/polities";

type PolitiesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PolitiesPage({ searchParams }: PolitiesPageProps) {
  const params = searchParams ? await searchParams : {};
  const query = getSingleParam(params.q);
  const regionId = getNumericParam(params.regionId);
  const polities = getPolityListView({ query, regionId });
  const regions = getRegionOptions();

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

      <form className="grid gap-4 rounded-[32px] border border-[var(--border)] bg-white/80 p-6 shadow-sm md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm md:col-span-2 xl:col-span-4">
          <span className="font-medium text-[var(--muted)]">名称検索</span>
          <input name="q" defaultValue={query} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2" placeholder="国家名・別名・地域" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">地域</span>
          <select name="regionId" defaultValue={regionId?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-3">
          <button type="submit" className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
            検索
          </button>
          <Link href="/polities" className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium">
            リセット
          </Link>
        </div>
      </form>

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

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getNumericParam(value: string | string[] | undefined) {
  const single = getSingleParam(value);
  if (!single) {
    return undefined;
  }

  const parsed = Number(single);
  return Number.isFinite(parsed) ? parsed : undefined;
}
