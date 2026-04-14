import type { Metadata } from "next";
import Link from "next/link";
import { eventRelationTypeOptions, eventTypeOptions } from "@/lib/master-labels";
import { getEventFormOptions } from "@/server/services/events";
import { getEventGraphView } from "@/server/services/visualizations";

export const metadata: Metadata = { title: "graph" };

type GraphEventsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function GraphEventsPage({ searchParams }: GraphEventsPageProps) {
  const params = searchParams ? await searchParams : {};
  const query = getSingleParam(params.q);
  const eventType = getSingleParam(params.eventType) as "general" | "war" | "rebellion" | "civil_war" | undefined;
  const relationType = getSingleParam(params.relationType) as "before" | "after" | "cause" | "related" | "parent" | "child" | undefined;
  const personId = getNumericParam(params.personId);
  const polityId = getNumericParam(params.polityId);
  const regionId = getNumericParam(params.regionId);
  const religionId = getNumericParam(params.religionId);
  const sectId = getNumericParam(params.sectId);
  const dynastyId = getNumericParam(params.dynastyId);
  const tagId = getNumericParam(params.tagId);
  const fromYear = getNumericParam(params.fromYear);
  const toYear = getNumericParam(params.toYear);
  const showSubjects = getSingleParam(params.showSubjects) === "1";
  const options = getEventFormOptions();
  const graph = getEventGraphView({
    query,
    eventType,
    relationType,
    personId,
    polityId,
    regionId,
    religionId,
    sectId,
    dynastyId,
    tagId,
    fromYear,
    toYear,
    showSubjects
  });
  const svgHeight = Math.max(680, Math.max(...graph.nodes.map((node) => node.y), 0) + 180);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">イベント関係グラフ</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            イベント間の前後・因果関係を俯瞰し、必要に応じて人物・国家・宗教・地域も補助ノードとして表示します。
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/events" className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">
            イベント一覧
          </Link>
          <Link href="/timeline" className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">
            タイムライン
          </Link>
        </div>
      </div>

      <form className="grid gap-4 rounded-[32px] border border-[var(--border)] bg-white/80 p-6 shadow-sm md:grid-cols-2 xl:grid-cols-5">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-[var(--muted)]">キーワード</span>
          <input name="q" defaultValue={query} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2" />
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
          <span className="font-medium text-[var(--muted)]">関連人物</span>
          <select name="personId" defaultValue={personId?.toString() ?? ""} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
            <option value="">すべて</option>
            {options.person.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-3 rounded-[24px] border border-[var(--border)] bg-white px-4 py-3 text-sm">
          <input type="checkbox" name="showSubjects" value="1" defaultChecked={showSubjects} />
          補助主体ノードを表示
        </label>
        <div className="flex items-end gap-3 xl:col-span-5">
          <button type="submit" className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
            更新
          </button>
          <Link href="/graph/events" className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium">
            リセット
          </Link>
        </div>
      </form>

      <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
          <span>ノード {graph.nodes.length} 件</span>
          <span>エッジ {graph.edges.length} 件</span>
          <span>{showSubjects ? "主体ノード込み" : "イベントのみ"}</span>
        </div>

        {graph.nodes.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">条件に一致するイベントがないため、グラフを描画できません。</p>
        ) : (
          <div className="overflow-x-auto rounded-[24px] border border-[var(--border)] bg-stone-50 p-4">
            <svg width="1200" height={svgHeight} viewBox={`0 0 1200 ${svgHeight}`} className="h-auto min-w-[960px]">
              {graph.edges.map((edge) => {
                const from = graph.nodes.find((node) => node.id === edge.from);
                const to = graph.nodes.find((node) => node.id === edge.to);
                if (!from || !to) {
                  return null;
                }
                const stroke = edge.kind === "relation" ? "var(--accent)" : "var(--border)";
                return (
                  <g key={edge.id}>
                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={stroke} strokeWidth="2" opacity="0.85" />
                    <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 6} textAnchor="middle" fontSize="12" fill="var(--muted)">
                      {edge.label}
                    </text>
                  </g>
                );
              })}
              {graph.nodes.map((node) => (
                <g key={node.id}>
                  <rect
                    x={node.x - 92}
                    y={node.y - 34}
                    width="184"
                    height="68"
                    rx="18"
                    fill={node.kind === "event" ? "var(--surface)" : "white"}
                    stroke={node.kind === "event" ? "var(--accent)" : "var(--border)"}
                    strokeWidth="2"
                  />
                  <text x={node.x} y={node.y - 6} textAnchor="middle" fontSize="14" fontWeight="600" fill="currentColor">
                    {node.label.length > 18 ? `${node.label.slice(0, 18)}…` : node.label}
                  </text>
                  <text x={node.x} y={node.y + 14} textAnchor="middle" fontSize="11" fill="var(--muted)">
                    {node.subtitle.length > 26 ? `${node.subtitle.slice(0, 26)}…` : node.subtitle}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        )}
      </div>

      {graph.nodes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {graph.nodes.map((node) => (
            <Link key={node.id} href={node.href} className="rounded-[24px] border border-[var(--border)] bg-white/80 p-5 shadow-sm transition hover:border-[var(--accent)]">
              <div className="text-sm text-[var(--muted)]">{node.kind}</div>
              <div className="mt-2 font-medium">{node.label}</div>
              <div className="mt-2 text-sm text-[var(--muted)]">{node.subtitle}</div>
            </Link>
          ))}
        </div>
      ) : null}
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
