import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteTagAction } from "@/features/tags/actions";
import { getTagView } from "@/server/services/tags";

export const metadata: Metadata = { title: "tag" };

export default async function TagDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getTagView(Number(id));

  if (!view) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Tag</p>
          <h1 className="mt-2 text-3xl font-semibold">{view.tag.name}</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {view.relatedEvents.length > 0 ? (
              <Link href={`/events?tagId=${view.tag.id}`} className="underline-offset-4 hover:underline">
                関連イベント {view.relatedEvents.length} 件
              </Link>
            ) : (
              "関連イベント 0 件"
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/tags/${view.tag.id}/edit`} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">
            編集
          </Link>
          <form action={deleteTagAction}>
            <input type="hidden" name="id" value={view.tag.id} />
            <button type="submit" className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-700">
              削除
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        <h2 className="text-lg font-semibold">関連イベント</h2>
        <div className="mt-4 space-y-3">
          {view.relatedEvents.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">このタグに紐づくイベントはまだありません。</p>
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
    </section>
  );
}
