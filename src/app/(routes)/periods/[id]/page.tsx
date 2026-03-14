import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteHistoricalPeriodAction } from "@/features/periods/actions";
import { getHistoricalPeriodDetailView } from "@/server/services/historical-periods";

export default async function HistoricalPeriodDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const view = getHistoricalPeriodDetailView(Number(id));

  if (!view) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Historical Period</p>
          <h1 className="mt-2 text-3xl font-semibold">{view.period.name}</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">期間: {view.timeLabel}</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/periods/${view.period.id}/edit`} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">
            編集
          </Link>
          <form action={deleteHistoricalPeriodAction}>
            <input type="hidden" name="id" value={view.period.id} />
            <button type="submit" className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-700">
              削除
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        <h2 className="text-lg font-semibold">基本情報</h2>
        <dl className="mt-6 grid gap-4 text-sm">
          <div>
            <dt className="font-medium text-[var(--muted)]">カテゴリ</dt>
            <dd className="mt-1">{view.categoryName}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--muted)]">対象国家</dt>
            <dd className="mt-1">{view.polityName ?? "-"}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--muted)]">対象地域名</dt>
            <dd className="mt-1">{view.period.regionLabel ?? "-"}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--muted)]">別名</dt>
            <dd className="mt-1">{view.period.aliases ?? "-"}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--muted)]">関連地域</dt>
            <dd className="mt-1">{view.regions.map((item) => item.name).join(", ") || "-"}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--muted)]">説明</dt>
            <dd className="mt-1 whitespace-pre-wrap">{view.period.description ?? "-"}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--muted)]">メモ</dt>
            <dd className="mt-1 whitespace-pre-wrap">{view.period.note ?? "-"}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
