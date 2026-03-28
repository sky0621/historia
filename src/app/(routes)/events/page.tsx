import type { Metadata } from "next";
import Link from "next/link";
import { eventRelationTypeOptions, eventTypeOptions, getEventRelationTypeLabel, getEventTypeLabel } from "@/lib/master-labels";
import { getEventsListView, getEventFormOptions } from "@/server/services/events";

export const metadata: Metadata = { title: "event" };

type EventsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = searchParams ? await searchParams : {};
  const query = getSingleParam(params.q);
  const tagId = getNumericParam(params.tagId);
  const eventType = getSingleParam(params.eventType) as "general" | "war" | "rebellion" | "civil_war" | undefined;
  const relationType = getSingleParam(params.relationType) as "before" | "after" | "cause" | "related" | undefined;
  const sortBy = (getSingleParam(params.sortBy) as "timeAsc" | "timeDesc" | "titleAsc" | "updatedDesc" | undefined) ?? "timeAsc";
  const personId = getNumericParam(params.personId);
  const polityId = getNumericParam(params.polityId);
  const dynastyId = getNumericParam(params.dynastyId);
  const religionId = getNumericParam(params.religionId);
  const sectId = getNumericParam(params.sectId);
  const regionId = getNumericParam(params.regionId);
  const fromYear = getNumericParam(params.fromYear);
  const toYear = getNumericParam(params.toYear);
  const events = getEventsListView({
    query,
    tagId,
    eventType,
    relationType,
    sortBy,
    personId,
    polityId,
    dynastyId,
    religionId,
    sectId,
    regionId,
    fromYear,
    toYear
  });
  const options = getEventFormOptions();
  const currentParams = buildSearchParams({
    q: query,
    tagId,
    eventType,
    relationType,
    sortBy,
    personId,
    polityId,
    dynastyId,
    religionId,
    sectId,
    regionId,
    fromYear,
    toYear
  });
  const activeFilters = [
    query ? { label: "キーワード", value: query, href: buildFilterRemovalHref(currentParams, "q") } : null,
    tagId ? { label: "タグ", value: findOptionLabel(options.tags, tagId), href: buildFilterRemovalHref(currentParams, "tagId") } : null,
    eventType ? { label: "種別", value: getEventTypeLabel(eventType), href: buildFilterRemovalHref(currentParams, "eventType") } : null,
    relationType ? { label: "関係種別", value: getEventRelationTypeLabel(relationType), href: buildFilterRemovalHref(currentParams, "relationType") } : null,
    personId ? { label: "関連人物", value: findOptionLabel(options.person, personId), href: buildFilterRemovalHref(currentParams, "personId") } : null,
    polityId ? { label: "関連国家", value: findOptionLabel(options.polities, polityId), href: buildFilterRemovalHref(currentParams, "polityId") } : null,
    dynastyId ? { label: "関連王朝", value: findOptionLabel(options.dynasties, dynastyId), href: buildFilterRemovalHref(currentParams, "dynastyId") } : null,
    religionId ? { label: "関連宗教", value: findOptionLabel(options.religions, religionId), href: buildFilterRemovalHref(currentParams, "religionId") } : null,
    sectId ? { label: "関連宗派", value: findOptionLabel(options.sects, sectId), href: buildFilterRemovalHref(currentParams, "sectId") } : null,
    regionId ? { label: "関連地域", value: findOptionLabel(options.regions, regionId), href: buildFilterRemovalHref(currentParams, "regionId") } : null,
    fromYear !== undefined ? { label: "開始年", value: String(fromYear), href: buildFilterRemovalHref(currentParams, "fromYear") } : null,
    toYear !== undefined ? { label: "終了年", value: String(toYear), href: buildFilterRemovalHref(currentParams, "toYear") } : null
  ].filter((item): item is { label: string; value: string; href: string } => Boolean(item?.value));

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
            {eventTypeOptions
              .filter((option) => ["general", "war", "rebellion", "civil_war"].includes(option.value))
              .map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">関係種別</span>
          <select name="relationType" defaultValue={relationType ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {eventRelationTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">並び順</span>
          <select name="sortBy" defaultValue={sortBy} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="timeAsc">年代順</option>
            <option value="timeDesc">新しい年代順</option>
            <option value="titleAsc">名前順</option>
            <option value="updatedDesc">更新順</option>
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">関連人物</span>
          <select name="personId" defaultValue={personId?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {options.person.map((person) => (
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

      {activeFilters.length > 0 ? (
        <div className="flex flex-wrap gap-2 rounded-[32px] border border-[var(--border)] bg-white/80 p-4 shadow-sm">
          {activeFilters.map((filter) => (
            <Link
              key={`${filter.label}-${filter.value}`}
              href={filter.href}
              className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              {filter.label}: {filter.value} ×
            </Link>
          ))}
          <Link
            href="/events"
            className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            すべて解除
          </Link>
        </div>
      ) : null}

      <div className="rounded-[32px] border border-[var(--border)] bg-white/80 px-5 py-4 text-sm text-[var(--muted)] shadow-sm">
        {events.length} 件のイベント
        {activeFilters.length > 0 ? " が現在の条件に一致しています。" : " を表示しています。"}
      </div>

      <div className="flex flex-wrap gap-3 rounded-[32px] border border-[var(--border)] bg-white/80 p-4 text-sm shadow-sm">
        <Link
          href={currentParams.toString().length > 0 ? `/graph/events?${currentParams.toString()}` : "/graph/events"}
          className="rounded-full border border-[var(--border)] px-4 py-2 transition hover:border-[var(--accent)]"
        >
          現在条件でグラフ
        </Link>
        <Link
          href={currentParams.toString().length > 0 ? `/timeline?${currentParams.toString()}` : "/timeline"}
          className="rounded-full border border-[var(--border)] px-4 py-2 transition hover:border-[var(--accent)]"
        >
          現在条件でタイムライン
        </Link>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-white/80 shadow-sm">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-stone-100/70">
            <tr>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">タイトル</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">時代</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">種別</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">関係</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">関連主体</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-[var(--muted)]">
                  <div className="flex flex-col gap-3">
                    <span>{activeFilters.length > 0 ? "条件に一致するイベントはありません。" : "まだイベントはありません。"}</span>
                    {activeFilters.length > 0 ? (
                      <span>
                        <Link href="/events" className="underline-offset-4 hover:underline">
                          フィルタを解除して一覧に戻る
                        </Link>
                      </span>
                    ) : null}
                  </div>
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
                  <td className="px-5 py-4">{getEventTypeLabel(event.eventType)}</td>
                  <td className="px-5 py-4 text-[var(--muted)]">
                    {event.relationTypes.length === 0 ? (
                      "-"
                    ) : (
                      event.relationTypes.map((type, index) => (
                        <span key={`${event.id}-relation-${type}`}>
                          {index > 0 ? ", " : null}
                          <Link href={`/events?relationType=${encodeURIComponent(type)}`} className="underline-offset-4 hover:underline">
                            {getEventRelationTypeLabel(type)}
                          </Link>
                        </span>
                      ))
                    )}
                  </td>
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

function findOptionLabel(options: Array<{ id: number; name: string }>, id: number) {
  return options.find((option) => option.id === id)?.name ?? `#${id}`;
}

function buildSearchParams(input: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }

  return params;
}

function buildFilterRemovalHref(currentParams: URLSearchParams, key: string) {
  const nextParams = new URLSearchParams(currentParams);
  nextParams.delete(key);
  const search = nextParams.toString();
  return search.length > 0 ? `/events?${search}` : "/events";
}
