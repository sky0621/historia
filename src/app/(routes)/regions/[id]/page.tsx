import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteRegionAction } from "@/features/regions/actions";
import { getRegionView } from "@/server/services/regions";

export default async function RegionDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const view = getRegionView(Number(id));

  if (!view) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Region</p>
          <h1 className="mt-2 text-3xl font-semibold">{view.region.name}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            {view.region.description ?? "説明はまだありません。"}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {view.children.length > 0 ? (
              <Link href={`/regions?parentRegionId=${view.region.id}`} className="underline-offset-4 hover:underline">
                子地域 {view.children.length} 件
              </Link>
            ) : (
              "子地域 0 件"
            )}{" "}
            /{" "}
            {view.relatedPeople.length > 0 ? (
              <Link href={`/people?regionId=${view.region.id}`} className="underline-offset-4 hover:underline">
                関連人物 {view.relatedPeople.length} 件
              </Link>
            ) : (
              "関連人物 0 件"
            )}{" "}
            /{" "}
            {view.relatedEvents.length > 0 ? (
              <Link href={`/events?regionId=${view.region.id}`} className="underline-offset-4 hover:underline">
                関連イベント {view.relatedEvents.length} 件
              </Link>
            ) : (
              "関連イベント 0 件"
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/regions/${view.region.id}/edit`}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm"
          >
            編集
          </Link>
          <form action={deleteRegionAction}>
            <input type="hidden" name="id" value={view.region.id} />
            <button
              type="submit"
              className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-700"
            >
              削除
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
          <h2 className="text-lg font-semibold">基本情報</h2>
          <dl className="mt-6 grid gap-4 text-sm">
            <div>
              <dt className="font-medium text-[var(--muted)]">親地域</dt>
              <dd className="mt-1">
                {view.parent ? (
                  <Link href={`/regions/${view.parent.id}`} className="underline-offset-4 hover:underline">
                    {view.parent.name}
                  </Link>
                ) : (
                  "-"
                )}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted)]">別名</dt>
              <dd className="mt-1">{view.region.aliases ?? "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted)]">メモ</dt>
              <dd className="mt-1 whitespace-pre-wrap">{view.region.note ?? "-"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
          <h2 className="text-lg font-semibold">子地域</h2>
          <div className="mt-4 space-y-3">
            {view.children.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">子地域はありません。</p>
            ) : (
              view.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/regions/${child.id}`}
                  className="block rounded-2xl border border-[var(--border)] px-4 py-3 text-sm hover:bg-stone-50"
                >
                  {child.name}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
          <h2 className="text-lg font-semibold">関連主体</h2>
          <dl className="mt-6 grid gap-4 text-sm">
            <div>
              <dt className="font-medium text-[var(--muted)]">人物</dt>
              <dd className="mt-1">
                {view.relatedPeople.length === 0 ? "-" : view.relatedPeople.map((item, index) => (
                  <span key={item.id}>
                    {index > 0 ? ", " : null}
                    <Link href={`/people/${item.id}`} className="underline-offset-4 hover:underline">
                      {item.name}
                    </Link>
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted)]">国家</dt>
              <dd className="mt-1">
                {view.relatedPolities.length === 0 ? "-" : view.relatedPolities.map((item, index) => (
                  <span key={item.id}>
                    {index > 0 ? ", " : null}
                    <Link href={`/polities/${item.id}`} className="underline-offset-4 hover:underline">
                      {item.name}
                    </Link>
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted)]">王朝</dt>
              <dd className="mt-1">
                {view.relatedDynasties.length === 0 ? "-" : view.relatedDynasties.map((item, index) => (
                  <span key={item.id}>
                    {index > 0 ? ", " : null}
                    <Link href={`/dynasties/${item.id}`} className="underline-offset-4 hover:underline">
                      {item.name}
                    </Link>
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted)]">時代区分</dt>
              <dd className="mt-1">
                {view.relatedPeriods.length === 0 ? "-" : view.relatedPeriods.map((item, index) => (
                  <span key={item.id}>
                    {index > 0 ? ", " : null}
                    <Link href={`/periods/${item.id}`} className="underline-offset-4 hover:underline">
                      {item.name}
                    </Link>
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted)]">宗教</dt>
              <dd className="mt-1">
                {view.relatedReligions.length === 0 ? "-" : view.relatedReligions.map((item, index) => (
                  <span key={item.id}>
                    {index > 0 ? ", " : null}
                    <Link href={`/religions/${item.id}`} className="underline-offset-4 hover:underline">
                      {item.name}
                    </Link>
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted)]">宗派</dt>
              <dd className="mt-1">
                {view.relatedSects.length === 0 ? "-" : view.relatedSects.map((item, index) => (
                  <span key={item.id}>
                    {index > 0 ? ", " : null}
                    <Link href={`/sects/${item.id}`} className="underline-offset-4 hover:underline">
                      {item.name}
                    </Link>
                  </span>
                ))}
              </dd>
            </div>
          </dl>
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
      </div>

      <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">地域関係</h2>
          <Link href={`/region-relations/new?fromRegionId=${view.region.id}`} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">
            関係を追加
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {view.regionRelations.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">地域関係はまだありません。</p>
          ) : (
            view.regionRelations.map((relation) => (
              <div key={relation.id} className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">
                    <Link href={`/regions/${relation.fromRegionId}`} className="underline-offset-4 hover:underline">
                      {relation.fromName}
                    </Link>{" "}
                    →{" "}
                    <Link href={`/regions/${relation.toRegionId}`} className="underline-offset-4 hover:underline">
                      {relation.toName}
                    </Link>
                  </div>
                  <Link href={`/region-relations/${relation.id}/edit`} className="text-xs underline-offset-4 hover:underline">
                    編集
                  </Link>
                </div>
                <div className="mt-1 text-[var(--muted)]">{relation.relationType}</div>
                {relation.note ? <div className="mt-1 text-[var(--muted)]">{relation.note}</div> : null}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
