import Link from "next/link";
import { getPeriodCategoryList } from "@/server/services/period-categories";

export default function PeriodCategoriesPage() {
  const categories = getPeriodCategoryList();

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

      <div className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-white/80 shadow-sm">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-stone-100/70">
            <tr>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">名称</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">説明</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-[var(--muted)]" colSpan={2}>
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
