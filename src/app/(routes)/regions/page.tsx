import Link from "next/link";
import { listRegions } from "@/server/repositories/regions";
import { getRegionById } from "@/server/repositories/regions";

type RegionsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RegionsPage({ searchParams }: RegionsPageProps) {
  const params = searchParams ? await searchParams : {};
  const query = getSingleParam(params.q)?.trim().toLocaleLowerCase("ja-JP") ?? "";
  const regions = listRegions().filter((region) =>
    query.length === 0
      ? true
      : [region.name, region.aliases, region.description, region.note].some((value) => value?.toLocaleLowerCase("ja-JP").includes(query))
  );

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

      <form className="flex flex-col gap-3 rounded-[32px] border border-[var(--border)] bg-white/80 p-6 shadow-sm md:flex-row md:items-end">
        <label className="flex-1 space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">名称検索</span>
          <input name="q" defaultValue={query} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2" placeholder="地域名・別名・説明" />
        </label>
        <div className="flex gap-3">
          <button type="submit" className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
            検索
          </button>
          <Link href="/regions" className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium">
            リセット
          </Link>
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
              regions.map((region) => {
                const parent = region.parentRegionId ? getRegionById(region.parentRegionId) : null;
                return (
                  <tr key={region.id} className="border-t border-[var(--border)]">
                    <td className="px-5 py-4">
                      <Link href={`/regions/${region.id}`} className="font-medium underline-offset-4 hover:underline">
                        {region.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4">{parent?.name ?? "-"}</td>
                    <td className="px-5 py-4 text-[var(--muted)]">{region.description ?? "-"}</td>
                  </tr>
                );
              })
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
