import Link from "next/link";
import { getEventsListView, getEventFormOptions } from "@/server/services/events";

type EventsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = searchParams ? await searchParams : {};
  const query = getSingleParam(params.q);
  const tagId = getNumericParam(params.tagId);
  const eventType = getSingleParam(params.eventType) as "general" | "war" | "rebellion" | "civil_war" | undefined;
  const relationType = getSingleParam(params.relationType) as "before" | "after" | "cause" | "related" | undefined;
  const personId = getNumericParam(params.personId);
  const polityId = getNumericParam(params.polityId);
  const dynastyId = getNumericParam(params.dynastyId);
  const religionId = getNumericParam(params.religionId);
  const sectId = getNumericParam(params.sectId);
  const regionId = getNumericParam(params.regionId);
  const periodId = getNumericParam(params.periodId);
  const fromYear = getNumericParam(params.fromYear);
  const toYear = getNumericParam(params.toYear);
  const events = getEventsListView({
    query,
    tagId,
    eventType,
    relationType,
    personId,
    polityId,
    dynastyId,
    religionId,
    sectId,
    regionId,
    periodId,
    fromYear,
    toYear
  });
  const options = getEventFormOptions();

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

      <form className="grid gap-4 rounded-[32px] border border-[var(--border)] bg-white/80 p-6 shadow-sm md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">キーワード</span>
          <input name="q" defaultValue={query} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2" placeholder="タイトル・説明・関連主体" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">タグ</span>
          <select name="tagId" defaultValue={tagId?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {options.tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">種別</span>
          <select name="eventType" defaultValue={eventType ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            <option value="general">general</option>
            <option value="war">war</option>
            <option value="rebellion">rebellion</option>
            <option value="civil_war">civil_war</option>
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">関係種別</span>
          <select name="relationType" defaultValue={relationType ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            <option value="before">before</option>
            <option value="after">after</option>
            <option value="cause">cause</option>
            <option value="related">related</option>
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">関連人物</span>
          <select name="personId" defaultValue={personId?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {options.people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">関連国家</span>
          <select name="polityId" defaultValue={polityId?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {options.polities.map((polity) => (
              <option key={polity.id} value={polity.id}>
                {polity.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">関連地域</span>
          <select name="regionId" defaultValue={regionId?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {options.regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">関連王朝</span>
          <select name="dynastyId" defaultValue={dynastyId?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {options.dynasties.map((dynasty) => (
              <option key={dynasty.id} value={dynasty.id}>
                {dynasty.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">関連宗教</span>
          <select name="religionId" defaultValue={religionId?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {options.religions.map((religion) => (
              <option key={religion.id} value={religion.id}>
                {religion.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">関連宗派</span>
          <select name="sectId" defaultValue={sectId?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {options.sects.map((sect) => (
              <option key={sect.id} value={sect.id}>
                {sect.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">関連時代区分</span>
          <select name="periodId" defaultValue={periodId?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {options.periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">開始年</span>
          <input name="fromYear" type="number" defaultValue={fromYear?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2" placeholder="-500" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">終了年</span>
          <input name="toYear" type="number" defaultValue={toYear?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2" placeholder="1600" />
        </label>
        <div className="flex items-end gap-3">
          <button type="submit" className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
            検索
          </button>
          <Link href="/events" className="inline-flex rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium">
            リセット
          </Link>
        </div>
      </form>

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
                  <td className="px-5 py-4 text-[var(--muted)]">
                    {event.relationSummaryItems.length === 0 ? (
                      "-"
                    ) : (
                      event.relationSummaryItems.map((item, index) => (
                        <span key={`${event.id}-${item.type}-${item.id}`}>
                          {index > 0 ? ", " : null}
                          <Link href={`/${item.type}/${item.id}`} className="underline-offset-4 hover:underline">
                            {item.name}
                          </Link>
                        </span>
                      ))
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getNumericParam(value: string | string[] | undefined) {
  const single = getSingleParam(value);
  if (!single) {
    return undefined;
  }

  const parsed = Number(single);
  return Number.isFinite(parsed) ? parsed : undefined;
}
