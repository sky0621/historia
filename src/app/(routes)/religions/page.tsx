import type { Metadata } from "next";
import Link from "next/link";
import { getReligionListView } from "@/server/services/religions";

export const metadata: Metadata = { title: "religion" };

type ReligionsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ReligionsPage({ searchParams }: ReligionsPageProps) {
  const params = searchParams ? await searchParams : {};
  const query = getSingleParam(params.q);
  const hasFounders = getSingleParam(params.hasFounders) === "1";
  const religions = getReligionListView({ query, hasFounders });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">宗教</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            宗教本体の期間と開祖を管理します。
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/api/export/religions.csv" className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium">
            CSV エクスポート
          </Link>
          <Link href="/religions/new" className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
            新規宗教
          </Link>
        </div>
      </div>

      <form className="grid gap-4 rounded-[32px] border border-[var(--border)] bg-white/80 p-6 shadow-sm md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm md:col-span-2 xl:col-span-4">
          <span className="font-medium text-[var(--muted)]">名称検索</span>
          <input name="q" defaultValue={query} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2" placeholder="宗教名・開祖" />
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
            </tr>
          </thead>
          <tbody>
            {religions.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-[var(--muted)]">
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
                  <td className="px-5 py-4">
                    {renderLinkedNames(
                      religion.founderIds.map((id, index) => ({ id, name: religion.founderNames[index], route: "person" as const }))
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

function renderLinkedNames(
  items: Array<{
    id: number;
    name: string | undefined;
    route: "person";
  }>
) {
  const filtered = items.filter((item): item is { id: number; name: string; route: "person" } => Boolean(item.name));

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
