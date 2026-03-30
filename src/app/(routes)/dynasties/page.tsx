import type { Metadata } from "next";
import Link from "next/link";
import { getDynastyListView, getPolityOptions, getRegionOptions } from "@/server/services/polities";

export const metadata: Metadata = { title: "dynasty" };

type DynastiesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DynastiesPage({ searchParams }: DynastiesPageProps) {
  const params = searchParams ? await searchParams : {};
  const query = getSingleParam(params.q);
  const polityId = getNumericParam(params.polityId);
  const regionId = getNumericParam(params.regionId);
  const dynasties = getDynastyListView({ query, polityId, regionId });
  const polities = getPolityOptions();
  const regions = getRegionOptions();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">王朝</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            王朝と、その国家横断的な関係を管理します。
          </p>
        </div>
        <Link href="/dynasties/new" className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
          新規王朝
        </Link>
      </div>

      <form className="grid gap-4 rounded-[32px] border border-[var(--border)] bg-white/80 p-6 shadow-sm md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm md:col-span-2 xl:col-span-4">
          <span className="font-medium text-[var(--muted)]">名称検索</span>
          <input name="q" defaultValue={query} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2" placeholder="王朝名・別名・所属国家・地域" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">関連国家</span>
          <select name="polityId" defaultValue={polityId?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {polities.map((polity) => (
              <option key={polity.id} value={polity.id}>
                {polity.name}
              </option>
            ))}
          </select>
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
        <div className="flex items-center gap-3">
          <button type="submit" className="inline-flex whitespace-nowrap rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
            検索
          </button>
          <Link href="/dynasties" className="inline-flex whitespace-nowrap rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium">
            リセット
          </Link>
          <p className="ml-auto whitespace-nowrap text-sm text-[var(--muted)]">検索結果：{dynasties.length}件</p>
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
                  <td className="px-5 py-4">
                    {dynasty.polityIds.length === 0
                      ? "-"
                      : dynasty.polityIds.map((polityId, index) => (
                          <span key={polityId}>
                            {index > 0 ? ", " : null}
                            <Link href={`/polities/${polityId}`} className="underline-offset-4 hover:underline">
                              {dynasty.polityNames[index] ?? `#${polityId}`}
                            </Link>
                          </span>
                        ))}
                  </td>
                  <td className="px-5 py-4">{dynasty.timeLabel}</td>
                  <td className="px-5 py-4 text-[var(--muted)]">
                    {renderLinkedRegions(dynasty.regionIds, dynasty.regionNames)}
                  </td>
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

function renderLinkedRegions(regionIds: number[], regionNames: string[]) {
  if (regionIds.length === 0) {
    return "-";
  }

  return regionIds.map((regionId, index) => (
    <span key={regionId}>
      {index > 0 ? ", " : null}
      <Link href={`/regions/${regionId}`} className="underline-offset-4 hover:underline">
        {regionNames[index] ?? `#${regionId}`}
      </Link>
    </span>
  ));
}
