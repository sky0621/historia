import Link from "next/link";
import { getRegionOptions, getReligionOptions, getSectListView } from "@/server/services/religions";

type SectsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SectsPage({ searchParams }: SectsPageProps) {
  const params = searchParams ? await searchParams : {};
  const query = getSingleParam(params.q);
  const religionId = getNumericParam(params.religionId);
  const regionId = getNumericParam(params.regionId);
  const hasFounders = getSingleParam(params.hasFounders) === "1";
  const sects = getSectListView({ query, religionId, regionId, hasFounders });
  const religions = getReligionOptions();
  const regions = getRegionOptions();

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

      <form className="grid gap-4 rounded-[32px] border border-[var(--border)] bg-white/80 p-6 shadow-sm md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm md:col-span-2 xl:col-span-4">
          <span className="font-medium text-[var(--muted)]">名称検索</span>
          <input name="q" defaultValue={query} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2" placeholder="宗派名・別名・宗教・開祖・地域" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">宗教</span>
          <select name="religionId" defaultValue={religionId?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {religions.map((religion) => (
              <option key={religion.id} value={religion.id}>
                {religion.name}
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
          <Link href="/sects" className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium">
            リセット
          </Link>
        </div>
      </form>

      <div className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-white/80 shadow-sm">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-stone-100/70">
            <tr>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">名称</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">宗教</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">期間</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">開祖</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">地域</th>
            </tr>
          </thead>
          <tbody>
            {sects.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-[var(--muted)]">
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
                  <td className="px-5 py-4">
                    <Link href={`/religions/${sect.religionId}`} className="underline-offset-4 hover:underline">
                      {sect.religionName}
                    </Link>
                  </td>
                  <td className="px-5 py-4">{sect.timeLabel}</td>
                  <td className="px-5 py-4">
                    {renderLinkedNames(
                      sect.founderIds.map((id, index) => ({ id, name: sect.founderNames[index], route: "person" as const }))
                    )}
                  </td>
                  <td className="px-5 py-4 text-[var(--muted)]">
                    {renderLinkedNames(
                      sect.regionIds.map((id, index) => ({ id, name: sect.regionNames[index], route: "regions" as const }))
                    )}
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

function renderLinkedNames(
  items: Array<{
    id: number;
    name: string | undefined;
    route: "person" | "regions";
  }>
) {
  const filtered = items.filter((item): item is { id: number; name: string; route: "person" | "regions" } => Boolean(item.name));

  if (filtered.length === 0) {
    return "-";
  }

  return filtered.map((item, index) => (
    <span key={`${item.route}-${item.id}`}>
      {index > 0 ? ", " : null}
      <Link href={`/${item.route}/${item.id}`} className="underline-offset-4 hover:underline">
        {item.name}
      </Link>
    </span>
  ));
}
