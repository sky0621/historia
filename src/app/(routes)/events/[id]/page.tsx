import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteEventAction } from "@/features/events/actions";
import { getEventDetailView } from "@/server/services/events";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getEventDetailView(Number(id));

  if (!view) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Event</p>
          <h1 className="mt-2 text-3xl font-semibold">{view.event.title}</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            種別: {view.event.eventType} / 時点: {view.defaultTimeExpression ? formatDisplay(view.defaultTimeExpression) : "年未詳"}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/events/${view.event.id}/edit`} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">
            編集
          </Link>
          <form action={deleteEventAction}>
            <input type="hidden" name="id" value={view.event.id} />
            <button type="submit" className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-700">
              削除
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
          <h2 className="text-lg font-semibold">基本情報</h2>
          <dl className="mt-6 grid gap-4 text-sm">
            <div>
              <dt className="font-medium text-[var(--muted)]">説明</dt>
              <dd className="mt-1 whitespace-pre-wrap">{view.event.description ?? "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted)]">人物</dt>
              <dd className="mt-1">{view.linkedPeople.map((item) => item.name).join(", ") || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted)]">国家</dt>
              <dd className="mt-1">{view.linkedPolities.map((item) => item.name).join(", ") || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted)]">王朝</dt>
              <dd className="mt-1">{view.linkedDynasties.map((item) => item.name).join(", ") || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted)]">時代区分</dt>
              <dd className="mt-1">{view.linkedPeriods.map((item) => item.name).join(", ") || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted)]">宗教 / 宗派</dt>
              <dd className="mt-1">
                {[...view.linkedReligions.map((item) => item.name), ...view.linkedSects.map((item) => item.name)].join(", ") || "-"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted)]">地域</dt>
              <dd className="mt-1">{view.linkedRegions.map((item) => item.name).join(", ") || "-"}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
            <h2 className="text-lg font-semibold">関連イベント</h2>
            <div className="mt-4 space-y-3">
              {view.outgoingRelations.length === 0 && view.incomingRelations.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">関連イベントはまだありません。</p>
              ) : (
                <>
                  {view.outgoingRelations.map((relation) => (
                    <div key={`out-${relation.id}`} className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
                      <div className="font-medium">{relation.relationType}</div>
                      <div className="mt-1 text-[var(--muted)]">{relation.eventName}</div>
                    </div>
                  ))}
                  {view.incomingRelations.map((relation) => (
                    <div key={`in-${relation.id}`} className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
                      <div className="font-medium">incoming: {relation.relationType}</div>
                      <div className="mt-1 text-[var(--muted)]">{relation.eventName}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function formatDisplay(value: { displayLabel?: string; calendarEra: string; startYear?: number }) {
  if (value.displayLabel) {
    return value.displayLabel;
  }
  if (value.startYear) {
    return `${value.calendarEra === "BCE" ? "BCE " : ""}${value.startYear}`;
  }
  return "年未詳";
}
