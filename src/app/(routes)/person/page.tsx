import type { Metadata } from "next";
import Link from "next/link";
import { getPersonListView, getPersonFormOptions } from "@/server/services/person";

export const metadata: Metadata = { title: "person" };

type PersonPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PersonPage({ searchParams }: PersonPageProps) {
  const params = searchParams ? await searchParams : {};
  const query = getSingleParam(params.q);
  const regionId = getNumericParam(params.regionId);
  const religionId = getNumericParam(params.religionId);
  const sectId = getNumericParam(params.sectId);
  const periodId = getNumericParam(params.periodId);
  const polityId = getNumericParam(params.polityId);
  const dynastyId = getNumericParam(params.dynastyId);
  const hasRoles = getSingleParam(params.hasRoles) === "1";
  const person = getPersonListView({ query, regionId, religionId, sectId, periodId, polityId, dynastyId, hasRoles });
  const options = getPersonFormOptions();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">人物</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            生没年、役職履歴、関連地域、宗教、時代区分を管理します。
          </p>
        </div>
        <Link href="/person/new" className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
          新規人物
        </Link>
      </div>

      <form className="grid gap-4 rounded-[32px] border border-[var(--border)] bg-white/80 p-6 shadow-sm md:grid-cols-2 xl:grid-cols-3">
        <label className="space-y-2 text-sm md:col-span-2 xl:col-span-3">
          <span className="font-medium text-[var(--muted)]">名称検索</span>
          <input name="q" defaultValue={query} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2" placeholder="氏名・別名・役職・地域" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">地域</span>
          <select name="regionId" defaultValue={regionId?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {options.regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">宗教</span>
          <select name="religionId" defaultValue={religionId?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {options.religions.map((religion) => (
              <option key={religion.id} value={religion.id}>
                {religion.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">宗派</span>
          <select name="sectId" defaultValue={sectId?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {options.sects.map((sect) => (
              <option key={sect.id} value={sect.id}>
                {sect.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">時代区分</span>
          <select name="periodId" defaultValue={periodId?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {options.periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">国家</span>
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
          <span className="font-medium text-[var(--muted)]">王朝</span>
          <select name="dynastyId" defaultValue={dynastyId?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {options.dynasties.map((dynasty) => (
              <option key={dynasty.id} value={dynasty.id}>
                {dynasty.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">役職</span>
          <select name="hasRoles" defaultValue={hasRoles ? "1" : ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            <option value="1">役職あり</option>
          </select>
        </label>
        <div className="flex items-end gap-3">
          <button type="submit" className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
            検索
          </button>
          <Link href="/person" className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium">
            リセット
          </Link>
        </div>
      </form>

      <div className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-white/80 shadow-sm">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-stone-100/70">
            <tr>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">氏名</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">読み方</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">生没年</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">役職</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">宗教・時代区分</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">地域</th>
            </tr>
          </thead>
          <tbody>
            {person.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-[var(--muted)]">
                  まだ人物はありません。
                </td>
              </tr>
            ) : (
              person.map((person) => (
                <tr key={person.id} className="border-t border-[var(--border)]">
                  <td className="px-5 py-4">
                    <Link href={`/person/${person.id}`} className="font-medium underline-offset-4 hover:underline">
                      {person.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-[var(--muted)]">{person.reading ?? "-"}</td>
                  <td className="px-5 py-4">{person.lifeLabel}</td>
                  <td className="px-5 py-4">
                    {person.roles.length === 0 ? (
                      "-"
                    ) : (
                      person.roles.map((role, index) => (
                        <span key={`${person.id}-role-${role.id}`}>
                          {index > 0 ? ", " : null}
                          {role.title}
                          {role.dynastyId && role.affiliationName ? (
                            <>
                              {" "}(
                              <Link href={`/dynasties/${role.dynastyId}`} className="underline-offset-4 hover:underline">
                                {role.affiliationName}
                              </Link>
                              )
                            </>
                          ) : role.polityId && role.affiliationName ? (
                            <>
                              {" "}(
                              <Link href={`/polities/${role.polityId}`} className="underline-offset-4 hover:underline">
                                {role.affiliationName}
                              </Link>
                              )
                            </>
                          ) : null}
                        </span>
                      ))
                    )}
                  </td>
                  <td className="px-5 py-4 text-[var(--muted)]">
                    {renderLinkedNames([
                      ...person.religionIds.map((id, index) => ({ id, name: person.religionNames[index], route: "religions" as const })),
                      ...person.sectIds.map((id, index) => ({ id, name: person.sectNames[index], route: "sects" as const })),
                      ...person.periodIds.map((id, index) => ({ id, name: person.periodNames[index], route: "periods" as const }))
                    ])}
                  </td>
                  <td className="px-5 py-4 text-[var(--muted)]">
                    {renderLinkedNames(
                      person.regionIds.map((id, index) => ({ id, name: person.regionNames[index], route: "regions" as const }))
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
    route: "religions" | "sects" | "periods" | "regions";
  }>
) {
  const filtered = items.filter((item): item is { id: number; name: string; route: "religions" | "sects" | "periods" | "regions" } => Boolean(item.name));

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
