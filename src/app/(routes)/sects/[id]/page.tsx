import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteSectAction } from "@/features/religions/actions";
import { getSectDetailView } from "@/server/services/religions";

export default async function SectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getSectDetailView(Number(id));

  if (!view) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Sect</p>
          <h1 className="mt-2 text-3xl font-semibold">{view.sect.name}</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">期間: {view.timeLabel}</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/sects/${view.sect.id}/edit`} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">
            編集
          </Link>
          <form action={deleteSectAction}>
            <input type="hidden" name="id" value={view.sect.id} />
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
            <dt className="font-medium text-[var(--muted)]">所属宗教</dt>
            <dd className="mt-1">
              {view.religion ? <Link href={`/religions/${view.religion.id}`} className="underline-offset-4 hover:underline">{view.religion.name}</Link> : "不明"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--muted)]">開祖</dt>
            <dd className="mt-1">
              {view.founders.length === 0 ? "-" : view.founders.map((founder, index) => (
                <span key={founder.id}>
                  {index > 0 ? ", " : null}
                  <Link href={`/people/${founder.id}`} className="underline-offset-4 hover:underline">
                    {founder.name}
                  </Link>
                </span>
              ))}
            </dd>
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
            <dt className="font-medium text-[var(--muted)]">説明</dt>
            <dd className="mt-1 whitespace-pre-wrap">{view.sect.description ?? "-"}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--muted)]">メモ</dt>
            <dd className="mt-1 whitespace-pre-wrap">{view.sect.note ?? "-"}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        <h2 className="text-lg font-semibold">関連人物</h2>
        <div className="mt-4 space-y-3">
          {view.relatedPeople.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">この宗派に関連付けられた人物はまだありません。</p>
          ) : (
            view.relatedPeople.map((person) => (
              <div key={person.id} className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
                <Link href={`/people/${person.id}`} className="font-medium underline-offset-4 hover:underline">
                  {person.name}
                </Link>
              </div>
            ))
          )}
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
                {event.relationSummary ? <div className="mt-1 text-[var(--muted)]">{event.relationSummary}</div> : null}
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
