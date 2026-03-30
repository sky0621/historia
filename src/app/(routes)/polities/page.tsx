import type { Metadata } from "next";
import Link from "next/link";
import { getPolityListView, getRegionOptions } from "@/server/services/polities";

export const metadata: Metadata = { title: "polity" };

type PolitiesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PolitiesPage({ searchParams }: PolitiesPageProps) {
  const params = searchParams ? await searchParams : {};
  const query = getSingleParam(params.q);
  const regionId = getNumericParam(params.regionId);
  const fromYear = getNumericParam(params.fromYear);
  const toYear = getNumericParam(params.toYear);
  const onlyCurrent = getBooleanParam(params.onlyCurrent);
  const polities = getPolityListView({ query, regionId, fromYear, toYear, onlyCurrent });
  const regions = getRegionOptions();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">国家・政体</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            国家・政体の開始終了年と関連地域を管理します。
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/api/export/polities.csv" className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium">
            CSV エクスポート
          </Link>
          <Link href="/polities/new" className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
            新規国家・政体
          </Link>
        </div>
      </div>

      <form className="grid gap-4 rounded-[32px] border border-[var(--border)] bg-white/80 p-6 shadow-sm md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm md:col-span-2 xl:col-span-4">
          <span className="font-medium text-[var(--muted)]">名称検索</span>
          <input name="q" defaultValue={query} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2" placeholder="国家・政体名・別名・地域" />
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
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">開始年</span>
          <input name="fromYear" type="number" defaultValue={fromYear?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2" placeholder="-500" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">終了年</span>
          <input name="toYear" type="number" defaultValue={toYear?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2" placeholder="1600" />
        </label>
        <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm">
          <input name="onlyCurrent" type="checkbox" value="1" defaultChecked={onlyCurrent} />
          <span className="font-medium text-[var(--muted)]">現在まで続くものだけ</span>
        </label>
        <div className="flex items-center gap-3">
          <button type="submit" className="inline-flex whitespace-nowrap rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
            検索
          </button>
          <Link href="/polities" className="inline-flex whitespace-nowrap rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium">
            リセット
          </Link>
          <p className="ml-auto whitespace-nowrap text-sm text-[var(--muted)]">検索結果：{polities.length}件</p>
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
                  まだ国家・政体はありません。
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
                  <td className="px-5 py-4 text-[var(--muted)]">
                    {renderLinkedRegions(polity.regionIds, polity.regionNames)}
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

function getBooleanParam(value: string | string[] | undefined) {
  const single = getSingleParam(value);
  return single === "1" || single === "true" || single === "on";
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
