import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteDynastyAction } from "@/features/polities/actions";
import { getDynastyDetailView } from "@/server/services/polities";

export const metadata: Metadata = { title: "dynasty" };

export default async function DynastyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getDynastyDetailView(Number(id));

  if (!view) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Dynasty</p>
          <h1 className="mt-2 text-3xl font-semibold">{view.dynasty.name}</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">期間: {view.timeLabel}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {view.relatedPerson.length > 0 ? (
              <Link href={`/person?dynastyId=${view.dynasty.id}`} className="underline-offset-4 hover:underline">
                関連人物 {view.relatedPerson.length} 件
              </Link>
            ) : (
              "関連人物 0 件"
            )}{" "}
            /{" "}
            {view.relatedEvents.length > 0 ? (
              <Link href={`/events?dynastyId=${view.dynasty.id}`} className="underline-offset-4 hover:underline">
                関連イベント {view.relatedEvents.length} 件
              </Link>
            ) : (
              "関連イベント 0 件"
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/dynasties/${view.dynasty.id}/edit`} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">
            編集
          </Link>
          <form action={deleteDynastyAction}>
            <input type="hidden" name="id" value={view.dynasty.id} />
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
              <dt className="font-medium text-[var(--muted)]">関連国家</dt>
              <dd className="mt-1">
                {view.polities.length > 0 ? (
                  view.polities.map((polity, index) => (
                    <span key={polity.id}>
                      {index > 0 ? ", " : null}
                      <Link href={`/polities/${polity.id}`} className="underline-offset-4 hover:underline">
                        {polity.name}
                      </Link>
                    </span>
                  ))
                ) : (
                  "-"
                )}
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
              <dt className="font-medium text-[var(--muted)]">メモ</dt>
              <dd className="mt-1 whitespace-pre-wrap">{view.dynasty.note ?? "-"}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        <h2 className="text-lg font-semibold">関連人物</h2>
        <div className="mt-4 space-y-3">
          {view.relatedPerson.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">この王朝に紐づく役職履歴はまだありません。</p>
          ) : (
            view.relatedPerson.map((person) => (
              <div key={person.id} className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
                <Link href={`/person/${person.id}`} className="font-medium underline-offset-4 hover:underline">
                  {person.name}
                </Link>
                <div className="mt-1 text-[var(--muted)]">{person.roleLabels.join(", ")}</div>
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

      <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">王朝継承</h2>
          {view.polities.length === 1 ? (
            <Link href={`/dynasty-successions/new?polityId=${view.polities[0]!.id}&predecessorDynastyId=${view.dynasty.id}`} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">
              継承を追加
            </Link>
          ) : null}
        </div>
        {view.polities.length > 1 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">王朝継承は国家単位で登録するため、追加は国家詳細側または対象国家を決めて行ってください。</p>
        ) : null}
        <div className="mt-4 space-y-3">
          {view.dynastySuccessions.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">この王朝に関連する継承はまだありません。</p>
          ) : (
            view.dynastySuccessions.map((succession) => (
              <div key={succession.id} className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">
                    <Link href={`/dynasties/${succession.predecessorDynastyId}`} className="underline-offset-4 hover:underline">
                      {succession.predecessorName}
                    </Link>{" "}
                    →{" "}
                    <Link href={`/dynasties/${succession.successorDynastyId}`} className="underline-offset-4 hover:underline">
                      {succession.successorName}
                    </Link>
                  </div>
                  <Link href={`/dynasty-successions/${succession.id}/edit`} className="text-xs underline-offset-4 hover:underline">
                    編集
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
