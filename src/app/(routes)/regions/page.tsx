import type { Metadata } from "next";
import Link from "next/link";
import { getRegionListView, getRegionOptions } from "@/server/services/regions";

export const metadata: Metadata = { title: "region" };

type RegionsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RegionsPage({ searchParams }: RegionsPageProps) {
  const params = searchParams ? await searchParams : {};
  const query = getSingleParam(params.q);
  const parentRegionId = getParentRegionParam(params.parentRegionId);
  const hasChildren = getSingleParam(params.hasChildren) === "1";
  const regions = getRegionListView({ query, parentRegionId, hasChildren });
  const parentRegions = getRegionOptions();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">地域</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            地理的・文化的なまとまりを階層付きで管理します。
          </p>
        </div>
        <Link
          href="/regions/new"
          className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white"
        >
          新規地域
        </Link>
      </div>

      <form className="grid gap-4 rounded-[32px] border border-[var(--border)] bg-white/80 p-6 shadow-sm md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm md:col-span-2 xl:col-span-4">
          <span className="font-medium text-[var(--muted)]">名称検索</span>
          <input name="q" defaultValue={query} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2" placeholder="地域名・別名・説明" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">親地域</span>
          <select
            name="parentRegionId"
            defaultValue={parentRegionId === undefined ? "" : String(parentRegionId)}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
          >
            <option value="">すべて</option>
            <option value="0">親地域なし</option>
            {parentRegions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">子地域</span>
          <select name="hasChildren" defaultValue={hasChildren ? "1" : ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            <option value="1">子地域あり</option>
          </select>
        </label>
        <div className="flex items-center gap-3">
          <button type="submit" className="inline-flex whitespace-nowrap rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
            検索
          </button>
          <Link href="/regions" className="inline-flex whitespace-nowrap rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium">
            リセット
          </Link>
          <p className="ml-auto whitespace-nowrap text-sm text-[var(--muted)]">検索結果：{regions.length}件</p>
        </div>
      </form>

      <div className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-white/80 shadow-sm">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-stone-100/70">
            <tr>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">名称</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">親地域</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">説明</th>
            </tr>
          </thead>
          <tbody>
            {regions.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-[var(--muted)]" colSpan={3}>
                  まだ地域はありません。
                </td>
              </tr>
            ) : (
              regions.map((region) => (
                <tr key={region.id} className="border-t border-[var(--border)]">
                  <td className="px-5 py-4">
                    <Link href={`/regions/${region.id}`} className="font-medium underline-offset-4 hover:underline">
                      {region.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4">{region.parentName ?? "-"}</td>
                  <td className="px-5 py-4 text-[var(--muted)]">{region.description ?? "-"}</td>
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

function getParentRegionParam(value: string | string[] | undefined) {
  const single = getSingleParam(value);
  if (!single) {
    return undefined;
  }

  if (single === "0") {
    return 0;
  }

  const parsed = Number(single);
  return Number.isFinite(parsed) ? parsed : undefined;
}
