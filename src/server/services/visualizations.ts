import { listDynasties } from "@/server/repositories/dynasties";
import { listHistoricalPeriods } from "@/server/repositories/historical-periods";
import { listPersonDetailed } from "@/server/repositories/person-detail";
import { listPolities } from "@/server/repositories/polities";
import { listRegions } from "@/server/repositories/regions";
import { listReligions } from "@/server/repositories/religions";
import { listSects } from "@/server/repositories/sects";
import { getEventLinks, getEventRelationsByEventIds, listEvents } from "@/server/repositories/events";
import { getEventsListView } from "@/server/services/events";

type EventType = "general" | "war" | "rebellion" | "civil_war";
type RelationType = "before" | "after" | "cause" | "related";
type SubjectType = "person" | "polities" | "religions" | "regions";

export type GraphFilters = {
  query?: string;
  eventType?: EventType;
  relationType?: RelationType;
  personId?: number;
  polityId?: number;
  regionId?: number;
  periodId?: number;
  religionId?: number;
  sectId?: number;
  dynastyId?: number;
  tagId?: number;
  fromYear?: number;
  toYear?: number;
  showSubjects?: boolean;
  subjectTypes?: SubjectType[];
};

export type GraphNode = {
  id: string;
  kind: "event" | "person" | "polity" | "religion" | "region";
  label: string;
  href: string;
  subtitle: string;
  x: number;
  y: number;
};

export type GraphEdge = {
  id: string;
  from: string;
  to: string;
  label: string;
  kind: "relation" | "link";
};

export type EventGraphView = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  hasSubjects: boolean;
};

type TimelineFilters = {
  query?: string;
  eventType?: EventType;
  categoryId?: number;
  polityId?: number;
  regionId?: number;
  includeEvents?: boolean;
  includePeriods?: boolean;
  includePolities?: boolean;
  includeDynasties?: boolean;
  includeReligions?: boolean;
  fromYear?: number;
  toYear?: number;
};

export type TimelineItem = {
  id: string;
  kind: "event" | "period" | "polity" | "dynasty" | "religion" | "sect";
  label: string;
  href: string;
  start: number;
  end: number;
  displayRange: string;
  lane: string;
};

export type TimelineView = {
  items: TimelineItem[];
  minYear: number;
  maxYear: number;
};

export function getEventGraphView(filters: GraphFilters = {}): EventGraphView {
  const eventItems = getEventsListView(filters).slice(0, 30);
  const eventIds = eventItems.map((item) => item.id);
  const relations = getEventRelationsByEventIds(eventIds).filter(
    (relation) => eventIds.includes(relation.fromEventId) && eventIds.includes(relation.toEventId)
  );
  const columns = Math.max(1, Math.min(4, Math.ceil(Math.sqrt(Math.max(1, eventItems.length)))));
  const eventNodes: GraphNode[] = eventItems.map((event, index) => ({
    id: `event-${event.id}`,
    kind: "event",
    label: event.title,
    href: `/events/${event.id}`,
    subtitle: `${event.eventType} / ${event.timeLabel}`,
    x: 140 + (index % columns) * 260,
    y: 100 + Math.floor(index / columns) * 180
  }));

  const edges: GraphEdge[] = relations.map((relation) => ({
    id: `relation-${relation.id}`,
    from: `event-${relation.fromEventId}`,
    to: `event-${relation.toEventId}`,
    label: relation.relationType,
    kind: "relation"
  }));

  if (!filters.showSubjects) {
    return { nodes: eventNodes, edges, hasSubjects: false };
  }

  const links = getEventLinks(eventIds);
  const subjectTypes = filters.subjectTypes ?? ["person", "polities", "religions", "regions"];
  const subjectNodes = new Map<string, GraphNode>();
  const subjectEdges: GraphEdge[] = [];

  const personById = new Map(listPersonDetailed().map((item) => [item.id, item.name]));
  const politiesById = new Map(listPolities().map((item) => [item.id, item.name]));
  const religionsById = new Map(listReligions().map((item) => [item.id, item.name]));
  const regionsById = new Map(listRegions().map((item) => [item.id, item.name]));

  const registerSubject = (
    type: SubjectType,
    id: number,
    eventId: number,
    label: string | undefined
  ) => {
    if (!label) {
      return;
    }

    const kindByType = {
      person: "person",
      polities: "polity",
      religions: "religion",
      regions: "region"
    } as const;
    const routeByType = {
      person: "person",
      polities: "polities",
      religions: "religions",
      regions: "regions"
    } as const;
    const nodeId = `${type}-${id}`;

    if (!subjectNodes.has(nodeId)) {
      const subjectIndex = subjectNodes.size;
      subjectNodes.set(nodeId, {
        id: nodeId,
        kind: kindByType[type],
        label,
        href: `/${routeByType[type]}/${id}`,
        subtitle: routeByType[type],
        x: 160 + (subjectIndex % 4) * 240,
        y: 520 + Math.floor(subjectIndex / 4) * 120
      });
    }

    subjectEdges.push({
      id: `link-${nodeId}-event-${eventId}`,
      from: `event-${eventId}`,
      to: nodeId,
      label: "link",
      kind: "link"
    });
  };

  if (subjectTypes.includes("person")) {
    for (const link of links.personLinks) {
      registerSubject("person", link.personId, link.eventId, personById.get(link.personId));
    }
  }

  if (subjectTypes.includes("polities")) {
    for (const link of links.polityLinks) {
      registerSubject("polities", link.polityId, link.eventId, politiesById.get(link.polityId));
    }
  }

  if (subjectTypes.includes("religions")) {
    for (const link of links.religionLinks) {
      registerSubject("religions", link.religionId, link.eventId, religionsById.get(link.religionId));
    }
  }

  if (subjectTypes.includes("regions")) {
    for (const link of links.regionLinks) {
      registerSubject("regions", link.regionId, link.eventId, regionsById.get(link.regionId));
    }
  }

  return {
    nodes: [...eventNodes, ...subjectNodes.values()],
    edges: [...edges, ...subjectEdges],
    hasSubjects: subjectNodes.size > 0
  };
}

export function getTimelineView(filters: TimelineFilters = {}): TimelineView {
  const items: TimelineItem[] = [];
  const query = normalizeQuery(filters.query);

  if (filters.includeEvents ?? true) {
    for (const event of getEventsListView(filters).slice(0, 100)) {
      const source = listEvents().find((item) => item.id === event.id);
      if (!source) {
        continue;
      }

      const range = getEventRange(source);
      if (!range) {
        continue;
      }

      items.push({
        id: `event-${event.id}`,
        kind: "event",
        label: event.title,
        href: `/events/${event.id}`,
        start: range.start,
        end: range.end,
        displayRange: event.timeLabel,
        lane: "イベント"
      });
    }
  }

  if (filters.includePeriods ?? true) {
    for (const period of listHistoricalPeriods()) {
      if (filters.categoryId && period.categoryId !== filters.categoryId) {
        continue;
      }
      if (filters.polityId && period.polityId !== filters.polityId) {
        continue;
      }
      if (!matchesTimelineQuery([period.name, period.aliases, period.description, period.note], query)) {
        continue;
      }
      const range = getEmbeddedRangeFromRecord(period);
      if (!range || !matchesFilterWindow(range, filters.fromYear, filters.toYear)) {
        continue;
      }
      items.push({
        id: `period-${period.id}`,
        kind: "period",
        label: period.name,
        href: `/periods/${period.id}`,
        start: range.start,
        end: range.end,
        displayRange: formatEmbeddedRangeFromRecord(period),
        lane: "時代区分"
      });
    }
  }

  if (filters.includePolities ?? true) {
    for (const polity of listPolities()) {
      if (!matchesTimelineQuery([polity.name, polity.note], query)) {
        continue;
      }
      const range = getEmbeddedRangeFromRecord(polity);
      if (!range || !matchesFilterWindow(range, filters.fromYear, filters.toYear)) {
        continue;
      }
      items.push({
        id: `polity-${polity.id}`,
        kind: "polity",
        label: polity.name,
        href: `/polities/${polity.id}`,
        start: range.start,
        end: range.end,
        displayRange: formatEmbeddedRangeFromRecord(polity),
        lane: "国家"
      });
    }
  }

  if (filters.includeDynasties ?? true) {
    for (const dynasty of listDynasties()) {
      if (filters.polityId && dynasty.polityId !== filters.polityId) {
        continue;
      }
      if (!matchesTimelineQuery([dynasty.name, dynasty.note], query)) {
        continue;
      }
      const range = getEmbeddedRangeFromRecord(dynasty);
      if (!range || !matchesFilterWindow(range, filters.fromYear, filters.toYear)) {
        continue;
      }
      items.push({
        id: `dynasty-${dynasty.id}`,
        kind: "dynasty",
        label: dynasty.name,
        href: `/dynasties/${dynasty.id}`,
        start: range.start,
        end: range.end,
        displayRange: formatEmbeddedRangeFromRecord(dynasty),
        lane: "王朝"
      });
    }
  }

  if (filters.includeReligions ?? true) {
    for (const religion of listReligions()) {
      if (!matchesTimelineQuery([religion.name, religion.description, religion.note], query)) {
        continue;
      }
      const range = getEmbeddedRangeFromRecord(religion);
      if (!range || !matchesFilterWindow(range, filters.fromYear, filters.toYear)) {
        continue;
      }
      items.push({
        id: `religion-${religion.id}`,
        kind: "religion",
        label: religion.name,
        href: `/religions/${religion.id}`,
        start: range.start,
        end: range.end,
        displayRange: formatEmbeddedRangeFromRecord(religion),
        lane: "宗教"
      });
    }

    for (const sect of listSects()) {
      if (!matchesTimelineQuery([sect.name, sect.description, sect.note], query)) {
        continue;
      }
      const range = getEmbeddedRangeFromRecord(sect);
      if (!range || !matchesFilterWindow(range, filters.fromYear, filters.toYear)) {
        continue;
      }
      items.push({
        id: `sect-${sect.id}`,
        kind: "sect",
        label: sect.name,
        href: `/sects/${sect.id}`,
        start: range.start,
        end: range.end,
        displayRange: formatEmbeddedRangeFromRecord(sect),
        lane: "宗派"
      });
    }
  }

  const sortedItems = items.sort((a, b) => a.start - b.start || a.end - b.end || a.label.localeCompare(b.label, "ja"));
  const minYear = sortedItems.length > 0 ? Math.min(...sortedItems.map((item) => item.start)) : 0;
  const maxYear = sortedItems.length > 0 ? Math.max(...sortedItems.map((item) => item.end)) : 1;

  return {
    items: sortedItems,
    minYear,
    maxYear
  };
}

function getEventRange(event: Record<string, unknown>) {
  return getStandaloneRange(
    (event.fromCalendarEra as string | null) ?? null,
    (event.fromYear as number | null) ?? null,
    (event.toCalendarEra as string | null) ?? null,
    (event.toYear as number | null) ?? null
  );
}

function getStandaloneRange(startEra: string | null, startYear: number | null, endEra: string | null, endYear: number | null) {
  if (startYear == null) {
    return null;
  }

  const start = toComparableYear(startEra, startYear);
  const resolvedEndYear = endYear ?? startYear;
  const end = toComparableYear(endEra ?? startEra, resolvedEndYear);

  return { start: Math.min(start, end), end: Math.max(start, end) };
}

function getEmbeddedRange(era: string | null, startYear: number | null, endYear: number | null) {
  if (startYear == null) {
    return null;
  }

  const start = toComparableYear(era, startYear);
  const end = toComparableYear(era, endYear ?? startYear);

  return { start: Math.min(start, end), end: Math.max(start, end) };
}

function getEmbeddedRangeFromRecord(value: Record<string, unknown>) {
  return getEmbeddedRange(
    (value.fromCalendarEra as string | null) ?? null,
    (value.fromYear as number | null) ?? null,
    (value.toYear as number | null) ?? null
  );
}

function toComparableYear(era: string | null, year: number) {
  return era === "BCE" ? -year : year;
}

function formatEmbeddedRange(
  era: string | null,
  startYear: number | null,
  endYear: number | null,
  displayLabel: string | null
) {
  if (displayLabel) {
    return displayLabel;
  }
  if (startYear == null) {
    return "年未詳";
  }
  const prefix = era === "BCE" ? "BCE " : "";
  return endYear && endYear !== startYear ? `${prefix}${startYear}-${endYear}` : `${prefix}${startYear}`;
}

function formatEmbeddedRangeFromRecord(value: Record<string, unknown>) {
  return formatEmbeddedRange(
    (value.fromCalendarEra as string | null) ?? null,
    (value.fromYear as number | null) ?? null,
    (value.toYear as number | null) ?? null,
    null
  );
}

function normalizeQuery(value?: string) {
  return value?.trim().toLocaleLowerCase("ja-JP") ?? "";
}

function matchesTimelineQuery(values: Array<string | null | undefined>, query: string) {
  if (query.length === 0) {
    return true;
  }

  return values.some((value) => value?.toLocaleLowerCase("ja-JP").includes(query));
}

function matchesFilterWindow(range: { start: number; end: number }, fromYear?: number, toYear?: number) {
  const start = fromYear ?? Number.NEGATIVE_INFINITY;
  const end = toYear ?? Number.POSITIVE_INFINITY;
  return range.start <= end && range.end >= start;
}
