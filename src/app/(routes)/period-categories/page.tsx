import Link from "next/link";
import { getPeriodCategoryList } from "@/server/services/period-categories";

type PeriodCategoriesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PeriodCategoriesPage({ searchParams }: PeriodCategoriesPageProps) {
  const params = searchParams ? await searchParams : {};
  const query = getSingleParam(params.q);
  const hasPeriods = getSingleParam(params.hasPeriods) === "1";
  const hasEvents = getSingleParam(params.hasEvents) === "1";
  const hasPeople = getSingleParam(params.hasPeople) === "1";
  const categories = getPeriodCategoryList({ query, hasPeriods, hasEvents, hasPeople });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">時代区分カテゴリ</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            日本史区分や考古学区分など、時代区分の分類軸を管理します。
          </p>
        </div>
        <Link
          href="/period-categories/new"
          className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white"
        >
          新規カテゴリ
        </Link>
      </div>

      <form className="grid gap-4 rounded-[32px] border border-[var(--border)] bg-white/80 p-6 shadow-sm md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm md:col-span-2 xl:col-span-4">
          <span className="font-medium text-[var(--muted)]">名称検索</span>
          <input name="q" defaultValue={query} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2" placeholder="カテゴリ名・説明" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">時代区分</span>
          <select name="hasPeriods" defaultValue={hasPeriods ? "1" : ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            <option value="1">時代区分あり</option>
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">関連イベント</span>
          <select name="hasEvents" defaultValue={hasEvents ? "1" : ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            <option value="1">関連イベントあり</option>
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">関連人物</span>
          <select name="hasPeople" defaultValue={hasPeople ? "1" : ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            <option value="1">関連人物あり</option>
          </select>
        </label>
        <div className="flex items-end gap-3">
          <button type="submit" className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
            検索
          </button>
          <Link href="/period-categories" className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium">
            リセット
          </Link>
        </div>
      </form>

      <div className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-white/80 shadow-sm">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-stone-100/70">
            <tr>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">名称</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">時代区分数</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">説明</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-[var(--muted)]" colSpan={3}>
                  まだカテゴリはありません。
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="border-t border-[var(--border)]">
                  <td className="px-5 py-4">
                    <Link
                      href={`/period-categories/${category.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {category.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-[var(--muted)]">
                    {category.periodCount > 0 ? (
                      <Link href={`/periods?categoryId=${category.id}`} className="underline-offset-4 hover:underline">
                        {category.periodCount}
                      </Link>
                    ) : (
                      "0"
                    )}
                  </td>
                  <td className="px-5 py-4 text-[var(--muted)]">{category.description ?? "-"}</td>
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
