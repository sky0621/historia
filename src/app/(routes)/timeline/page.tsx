import type { Metadata } from "next";
import Link from "next/link";
import { getHistoricalPeriodFormOptions } from "@/server/services/historical-periods";
import { getPolityOptions, getRegionOptions } from "@/server/services/polities";
import { getTimelineView } from "@/server/services/visualizations";

export const metadata: Metadata = { title: "timeline" };

type TimelinePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TimelinePage({ searchParams }: TimelinePageProps) {
  const params = searchParams ? await searchParams : {};
  const query = getSingleParam(params.q);
  const categoryId = getNumericParam(params.categoryId);
  const polityId = getNumericParam(params.polityId);
  const regionId = getNumericParam(params.regionId);
  const fromYear = getNumericParam(params.fromYear);
  const toYear = getNumericParam(params.toYear);
  const includeEvents = getCheckboxParam(params.includeEvents, true);
  const includePeriods = getCheckboxParam(params.includePeriods, true);
  const includePolities = getCheckboxParam(params.includePolities, true);
  const includeDynasties = getCheckboxParam(params.includeDynasties, true);
  const includeReligions = getCheckboxParam(params.includeReligions, true);
  const timeline = getTimelineView({
    query,
    categoryId,
    polityId,
    regionId,
    fromYear,
    toYear,
    includeEvents,
    includePeriods,
    includePolities,
    includeDynasties,
    includeReligions
  });
  const options = getHistoricalPeriodFormOptions();
  const regionOptions = getRegionOptions();
  const polityOptions = getPolityOptions();
  const span = Math.max(1, timeline.maxYear - timeline.minYear);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">タイムライン</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            イベントと期間主体を同じ時間軸に載せて、年単位で比較します。
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/events" className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">
            イベント一覧
          </Link>
          <Link href="/graph/events" className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">
            グラフ
          </Link>
        </div>
      </div>

      <form className="grid gap-4 rounded-[32px] border border-[var(--border)] bg-white/80 p-6 shadow-sm md:grid-cols-2 xl:grid-cols-5">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">キーワード</span>
          <input name="q" defaultValue={query} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2" />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">カテゴリ</span>
          <select name="categoryId" defaultValue={categoryId?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {options.categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">国家</span>
          <select name="polityId" defaultValue={polityId?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {polityOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">地域</span>
          <select name="regionId" defaultValue={regionId?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {regionOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-3 sm:grid-cols-2 xl:col-span-1">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-[var(--muted)]">開始年</span>
            <input name="fromYear" type="number" defaultValue={fromYear?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-[var(--muted)]">終了年</span>
            <input name="toYear" type="number" defaultValue={toYear?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2" />
          </label>
        </div>
        <div className="flex flex-wrap gap-3 rounded-[24px] border border-[var(--border)] bg-white p-4 text-sm xl:col-span-5">
          {[
            ["includeEvents", includeEvents, "イベント"],
            ["includePeriods", includePeriods, "時代区分"],
            ["includePolities", includePolities, "国家"],
            ["includeDynasties", includeDynasties, "王朝"],
            ["includeReligions", includeReligions, "宗教・宗派"]
          ].map(([name, checked, label]) => (
            <label key={String(name)} className="flex items-center gap-2">
              <input type="checkbox" name={String(name)} value="1" defaultChecked={Boolean(checked)} />
              {label}
            </label>
          ))}
        </div>
        <div className="flex items-end gap-3 xl:col-span-5">
          <button type="submit" className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
            更新
          </button>
          <Link href="/timeline" className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium">
            リセット
          </Link>
        </div>
      </form>

      <div className="rounded-[32px] border border-[var(--border)] bg-white/80 px-5 py-4 text-sm text-[var(--muted)] shadow-sm">
        {timeline.items.length} 件 / 範囲 {timeline.minYear} から {timeline.maxYear}
      </div>

      <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-6 shadow-sm">
        {timeline.items.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">条件に一致する項目がありません。</p>
        ) : (
          <div className="space-y-4">
            {timeline.items.map((item) => {
              const left = ((item.start - timeline.minYear) / span) * 100;
              const width = Math.max(2, ((item.end - item.start + 1) / span) * 100);
              return (
                <div key={item.id} className="grid gap-3 md:grid-cols-[220px,1fr] md:items-center">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{item.lane}</div>
                    <Link href={item.href} className="mt-1 block font-medium underline-offset-4 hover:underline">
                      {item.label}
                    </Link>
                    <div className="mt-1 text-sm text-[var(--muted)]">{item.displayRange}</div>
                  </div>
                  <div className="rounded-[20px] border border-[var(--border)] bg-stone-50 px-3 py-4">
                    <div className="relative h-7 rounded-full bg-white">
                      <div
                        className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-[var(--accent)]"
                        style={{
                          left: `${left}%`,
                          width: `${Math.min(width, 100 - left)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getNumericParam(value: string | string[] | undefined) {
  const raw = getSingleParam(value);
  if (!raw) {
    return undefined;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getCheckboxParam(value: string | string[] | undefined, fallback: boolean) {
  const raw = getSingleParam(value);
  if (raw === undefined) {
    return fallback;
  }
  return raw === "1" || raw === "on" || raw === "true";
}
