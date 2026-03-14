import Link from "next/link";
import { getEventsListView } from "@/server/services/events";

export default function EventsPage() {
  const events = getEventsListView();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">イベント</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            年表の中心となるイベントを管理します。
          </p>
        </div>
        <Link href="/events/new" className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
          新規イベント
        </Link>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-white/80 shadow-sm">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-stone-100/70">
            <tr>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">タイトル</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">時代</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">種別</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">関連主体</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-[var(--muted)]">
                  まだイベントはありません。
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="border-t border-[var(--border)]">
                  <td className="px-5 py-4">
                    <Link href={`/events/${event.id}`} className="font-medium underline-offset-4 hover:underline">
                      {event.title}
                    </Link>
                  </td>
                  <td className="px-5 py-4">{event.timeLabel}</td>
                  <td className="px-5 py-4">{event.eventType}</td>
                  <td className="px-5 py-4 text-[var(--muted)]">{event.relationSummary || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
