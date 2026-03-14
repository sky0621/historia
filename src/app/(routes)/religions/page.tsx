import Link from "next/link";
import { getRegionOptions, getReligionListView } from "@/server/services/religions";

type ReligionsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ReligionsPage({ searchParams }: ReligionsPageProps) {
  const params = searchParams ? await searchParams : {};
  const query = getSingleParam(params.q);
  const regionId = getNumericParam(params.regionId);
  const hasFounders = getSingleParam(params.hasFounders) === "1";
  const religions = getReligionListView({ query, regionId, hasFounders });
  const regions = getRegionOptions();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">宗教</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            宗教本体の期間、開祖、関連地域を管理します。
          </p>
        </div>
        <Link href="/religions/new" className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
          新規宗教
        </Link>
      </div>

      <form className="grid gap-4 rounded-[32px] border border-[var(--border)] bg-white/80 p-6 shadow-sm md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm md:col-span-2 xl:col-span-4">
          <span className="font-medium text-[var(--muted)]">名称検索</span>
          <input name="q" defaultValue={query} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2" placeholder="宗教名・開祖・地域" />
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
          <span className="font-medium text-[var(--muted)]">開祖</span>
          <select name="hasFounders" defaultValue={hasFounders ? "1" : ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            <option value="1">開祖あり</option>
          </select>
        </label>
        <div className="flex items-end gap-3">
          <button type="submit" className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
            検索
          </button>
          <Link href="/religions" className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium">
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
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">開祖</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">地域</th>
            </tr>
          </thead>
          <tbody>
            {religions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-[var(--muted)]">
                  まだ宗教はありません。
                </td>
              </tr>
            ) : (
              religions.map((religion) => (
                <tr key={religion.id} className="border-t border-[var(--border)]">
                  <td className="px-5 py-4">
                    <Link href={`/religions/${religion.id}`} className="font-medium underline-offset-4 hover:underline">
                      {religion.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4">{religion.timeLabel}</td>
                  <td className="px-5 py-4">{religion.founderNames.join(", ") || "-"}</td>
                  <td className="px-5 py-4 text-[var(--muted)]">{religion.regionNames.join(", ") || "-"}</td>
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
