import Link from "next/link";
import { notFound } from "next/navigation";
import { deletePeriodCategoryAction } from "@/features/periods/actions";
import { getPeriodCategoryView } from "@/server/services/period-categories";

export default async function PeriodCategoryDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = getPeriodCategoryView(Number(id));

  if (!category) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Period Category</p>
          <h1 className="mt-2 text-3xl font-semibold">{category.name}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            {category.description ?? "説明はまだありません。"}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/period-categories/${category.id}/edit`}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm"
          >
            編集
          </Link>
          <form action={deletePeriodCategoryAction}>
            <input type="hidden" name="id" value={category.id} />
            <button
              type="submit"
              className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-700"
            >
              削除
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        <h2 className="text-lg font-semibold">説明</h2>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7">{category.description ?? "-"}</p>
      </div>
    </section>
  );
}
