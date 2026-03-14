import Link from "next/link";
import { notFound } from "next/navigation";
import { deletePolityAction } from "@/features/polities/actions";
import { getPolityDetailView } from "@/server/services/polities";

export default async function PolityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getPolityDetailView(Number(id));

  if (!view) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Polity</p>
          <h1 className="mt-2 text-3xl font-semibold">{view.polity.name}</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">期間: {view.timeLabel}</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/polities/${view.polity.id}/edit`} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">
            編集
          </Link>
          <form action={deletePolityAction}>
            <input type="hidden" name="id" value={view.polity.id} />
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
              <dt className="font-medium text-[var(--muted)]">別名</dt>
              <dd className="mt-1">{view.polity.aliases ?? "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted)]">関連地域</dt>
              <dd className="mt-1">
                {view.regions.length === 0 ? "-" : view.regions.map((region, index) => (
                  <span key={region.id}>
                    {index > 0 ? ", " : null}
                    <Link href={`/regions/${region.id}`} className="underline-offset-4 hover:underline">
                      {region.name}
                    </Link>
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted)]">メモ</dt>
              <dd className="mt-1 whitespace-pre-wrap">{view.polity.note ?? "-"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
          <h2 className="text-lg font-semibold">配下王朝</h2>
          <div className="mt-4 space-y-3">
            {view.dynasties.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">王朝はまだありません。</p>
            ) : (
              view.dynasties.map((dynasty) => (
                <Link
                  key={dynasty.id}
                  href={`/dynasties/${dynasty.id}`}
                  className="block rounded-2xl border border-[var(--border)] px-4 py-3 text-sm hover:bg-stone-50"
                >
                  {dynasty.name}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        <h2 className="text-lg font-semibold">関連イベント</h2>
        <div className="mt-4 space-y-3">
          {view.relatedEvents.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">関連イベントはまだありません。</p>
          ) : (
            view.relatedEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="block rounded-2xl border border-[var(--border)] px-4 py-3 text-sm hover:bg-stone-50">
                <div className="font-medium">{event.title}</div>
                <div className="mt-1 text-[var(--muted)]">{event.timeLabel} / {event.eventType}</div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
