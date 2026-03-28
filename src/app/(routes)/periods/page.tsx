import type { Metadata } from "next";
import Link from "next/link";
import { getHistoricalPeriodFormOptions, getHistoricalPeriodsListView } from "@/server/services/historical-periods";

export const metadata: Metadata = { title: "period" };

type PeriodsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PeriodsPage({ searchParams }: PeriodsPageProps) {
  const params = searchParams ? await searchParams : {};
  const query = getSingleParam(params.q);
  const categoryId = getNumericParam(params.categoryId);
  const polityId = getNumericParam(params.polityId);
  const regionId = getNumericParam(params.regionId);
  const periods = getHistoricalPeriodsListView({ query, categoryId, polityId, regionId });
  const options = getHistoricalPeriodFormOptions();

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

      <form className="grid gap-4 rounded-[32px] border border-[var(--border)] bg-white/80 p-6 shadow-sm md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm md:col-span-2 xl:col-span-4">
          <span className="font-medium text-[var(--muted)]">名称検索</span>
          <input name="q" defaultValue={query} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2" placeholder="時代名・カテゴリ・対象国家・地域" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">カテゴリ</span>
          <select name="categoryId" defaultValue={categoryId?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {options.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">対象国家</span>
          <select name="polityId" defaultValue={polityId?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {options.polities.map((polity) => (
              <option key={polity.id} value={polity.id}>
                {polity.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">関連地域</span>
          <select name="regionId" defaultValue={regionId?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {options.regions.map((region) => (
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
          <Link href="/periods" className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium">
            リセット
          </Link>
        </div>
      </form>

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
                  <td className="px-5 py-4">
                    <Link href={`/period-categories/${period.categoryId}`} className="underline-offset-4 hover:underline">
                      {period.categoryName}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    {period.polityId && period.polityName ? (
                      <Link href={`/polities/${period.polityId}`} className="underline-offset-4 hover:underline">
                        {period.polityName}
                      </Link>
                    ) : (
                      period.regionNames[0] ?? "-"
                    )}
                  </td>
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
