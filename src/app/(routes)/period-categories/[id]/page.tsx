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
  const view = getPeriodCategoryView(Number(id));

  if (!view) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Period Category</p>
          <h1 className="mt-2 text-3xl font-semibold">{view.category.name}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            {view.relatedPeriods.length > 0 ? (
              <Link href={`/periods?categoryId=${view.category.id}`} className="underline-offset-4 hover:underline">
                時代区分 {view.relatedPeriods.length} 件
              </Link>
            ) : (
              "時代区分 0 件"
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/period-categories/${view.category.id}/edit`}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm"
          >
            編集
          </Link>
          <form action={deletePeriodCategoryAction}>
            <input type="hidden" name="id" value={view.category.id} />
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
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7">{view.category.description ?? "-"}</p>
      </div>

      <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        <h2 className="text-lg font-semibold">関連時代区分</h2>
        <div className="mt-4 space-y-3">
          {view.relatedPeriods.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">このカテゴリに属する時代区分はまだありません。</p>
          ) : (
            view.relatedPeriods.map((period) => (
              <div key={period.id} className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
                <Link href={`/periods/${period.id}`} className="font-medium underline-offset-4 hover:underline">
                  {period.name}
                </Link>
                <div className="mt-1 text-[var(--muted)]">
                  {(period.polityName ?? period.regionLabel ?? "-")} / {period.timeLabel}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        <h2 className="text-lg font-semibold">関連イベント</h2>
        <div className="mt-4 space-y-3">
          {view.relatedEvents.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">このカテゴリに関連するイベントはまだありません。</p>
          ) : (
            view.relatedEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
                <Link href={`/events/${event.id}`} className="font-medium underline-offset-4 hover:underline">
                  {event.title}
                </Link>
                <div className="mt-1 text-[var(--muted)]">
                  {event.eventType} / {event.timeLabel}
                </div>
                {event.relationSummary ? <div className="mt-1 text-[var(--muted)]">{event.relationSummary}</div> : null}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        <h2 className="text-lg font-semibold">関連人物</h2>
        <div className="mt-4 space-y-3">
          {view.relatedPerson.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">このカテゴリに関連する人物はまだありません。</p>
          ) : (
            view.relatedPerson.map((person) => (
              <div key={person.id} className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
                <Link href={`/person/${person.id}`} className="font-medium underline-offset-4 hover:underline">
                  {person.name}
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
