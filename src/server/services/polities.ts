import { fromTimeExpressionRecord } from "@/lib/time-expression/normalize";
import { formatTimeExpression } from "@/lib/time-expression/format";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";
import type { DynastyInput, PolityInput } from "@/features/polities/schema";
import { listHistoricalPeriods } from "@/server/repositories/historical-periods";
import { listPersonDetailed } from "@/server/repositories/person-detail";
import { getRoleAssignmentsByPersonIds } from "@/server/repositories/role-assignments";
import { listRegions } from "@/server/repositories/regions";
import {
  createPolity,
  deletePolity,
  getPolityById,
  getPolityRegionIds,
  listPolities,
  updatePolity
} from "@/server/repositories/polities";
import {
  createDynasty,
  deleteDynasty,
  getDynastyById,
  getDynastyRegionIds,
  listDynasties,
  updateDynasty
} from "@/server/repositories/dynasties";
import { getRelatedEvents } from "@/server/services/event-references";
import { getHistoryView, recordChangeHistory } from "@/server/services/history";
import { formatStoredBoundaryRangeForOption, normalizeStoredBoundaryYear, toStoredBoundaryYear } from "@/server/services/time-sentinel";
import { getDynastySuccessionViewForDynasty, getDynastySuccessionViewForPolity, getPolityTransitionView } from "@/server/services/relations";
import { getCitationListForTarget } from "@/server/services/sources";

export function getPolityOptions() {
  return sortPolitiesByStartYear(listPolities()).map((polity) => ({
    id: polity.id,
    name: polity.name,
    timeLabel: formatPolityOptionTime(polity),
    fromCalendarEra: polity.fromCalendarEra,
    fromYear: polity.fromYear,
    toCalendarEra: polity.toCalendarEra,
    toYear: polity.toYear
  }));
}

export function sortPolitiesByStartYear<T extends { name: string; fromCalendarEra?: string | null; fromYear?: number | null }>(items: T[]) {
  return [...items].sort((left, right) => {
    const yearDiff = toComparableStartYear(left) - toComparableStartYear(right);
    if (yearDiff !== 0) {
      return yearDiff;
    }

    return left.name.localeCompare(right.name, "ja-JP");
  });
}

export function getRegionOptions() {
  return listRegions().map((region) => ({ id: region.id, name: region.name, parentRegionId: region.parentRegionId }));
}

type PolityListFilters = {
  query?: string;
  regionId?: number;
  fromYear?: number;
  toYear?: number;
  onlyCurrent?: boolean;
};

type DynastyListFilters = {
  query?: string;
  polityId?: number;
  regionId?: number;
};

export function getPolityListView(filters: PolityListFilters = {}) {
  const normalizedQuery = normalizeQuery(filters.query);
  const polities = listPolities();
  const regions = listRegions();
  const links = getPolityRegionIds(polities.map((polity) => polity.id));
  const regionNameById = new Map(regions.map((region) => [region.id, region.name]));

  return polities
    .map((polity) => ({
      ...polity,
      timeLabel: formatPolityOptionTime(polity),
      regionNames: links
        .filter((link) => link.polityId === polity.id)
        .map((link) => regionNameById.get(link.regionId))
        .filter((name): name is string => Boolean(name)),
      regionIds: links.filter((link) => link.polityId === polity.id).map((link) => link.regionId)
    }))
    .filter((polity) => {
      if (filters.regionId && !polity.regionIds.includes(filters.regionId)) {
        return false;
      }

      if (!matchesPolityYearRange(polity, filters.fromYear, filters.toYear)) {
        return false;
      }

      if (filters.onlyCurrent && !isCurrentPolity(polity)) {
        return false;
      }

      return true;
    })
    .filter((polity) => matchesQuery([polity.name, polity.note, polity.regionNames.join(", ")], normalizedQuery));
}

export function getDynastyListView(filters: DynastyListFilters = {}) {
  const normalizedQuery = normalizeQuery(filters.query);
  const dynasties = listDynasties();
  const polities = listPolities();
  const polityNameById = new Map(polities.map((polity) => [polity.id, polity.name]));
  const regions = listRegions();
  const regionNameById = new Map(regions.map((region) => [region.id, region.name]));
  const links = getDynastyRegionIds(dynasties.map((dynasty) => dynasty.id));

  return dynasties
    .map((dynasty) => ({
      ...dynasty,
      polityNames: dynasty.polityIds.map((polityId) => polityNameById.get(polityId) ?? `#${polityId}`),
      timeLabel: formatPolityOptionTime(dynasty),
      regionNames: links
        .filter((link) => link.dynastyId === dynasty.id)
        .map((link) => regionNameById.get(link.regionId))
        .filter((name): name is string => Boolean(name)),
      regionIds: links.filter((link) => link.dynastyId === dynasty.id).map((link) => link.regionId)
    }))
    .filter((dynasty) => {
      if (filters.polityId && !dynasty.polityIds.includes(filters.polityId)) {
        return false;
      }

      if (filters.regionId && !dynasty.regionIds.includes(filters.regionId)) {
        return false;
      }

      return true;
    })
    .filter((dynasty) =>
      matchesQuery([dynasty.name, dynasty.note, dynasty.polityNames.join(", "), dynasty.regionNames.join(", ")], normalizedQuery)
    );
}

export function getPolityDetailView(id: number) {
  const polity = getPolityById(id);
  if (!polity) {
    return null;
  }

  const dynasties = listDynasties().filter((dynasty) => dynasty.polityIds.includes(polity.id));
  const relatedPeriods = listHistoricalPeriods()
    .filter((period) => period.polityId === polity.id)
    .map((period) => ({
      ...period,
      timeLabel: formatStoredTime("time", period)
    }));
  const regions = listRegions();
  const linkedRegionIds = getPolityRegionIds([polity.id]).map((link) => link.regionId);
  const person = listPersonDetailed();
  const roles = getRoleAssignmentsByPersonIds(person.map((person) => person.id));

  return {
    polity,
    dynasties,
    relatedPeriods,
    regions: regions.filter((region) => linkedRegionIds.includes(region.id)),
    relatedPerson: buildRelatedPerson(
      person,
      roles.filter((role) => role.polityId === id),
      "polity"
    ),
    relatedEvents: getRelatedEvents({ polityId: id }),
    polityTransitions: getPolityTransitionView(id),
    dynastySuccessions: getDynastySuccessionViewForPolity(id),
    timeLabel: formatStoredPolityTime(polity),
    defaultFromTimeExpression: extractPolityTimeExpression("from", polity),
    defaultToTimeExpression: extractPolityTimeExpression("to", polity),
    citations: getCitationListForTarget("polity", id),
    changeHistory: getHistoryView("polity", id)
  };
}

export function getDynastyDetailView(id: number) {
  const dynasty = getDynastyById(id);
  if (!dynasty) {
    return null;
  }

  const polities = listPolities().filter((polity) => dynasty.polityIds.includes(polity.id));
  const regions = listRegions();
  const linkedRegionIds = getDynastyRegionIds([dynasty.id]).map((link) => link.regionId);
  const person = listPersonDetailed();
  const roles = getRoleAssignmentsByPersonIds(person.map((person) => person.id));

  return {
    dynasty,
    polities,
    regions: regions.filter((region) => linkedRegionIds.includes(region.id)),
    relatedPerson: buildRelatedPerson(
      person,
      roles.filter((role) => role.dynastyId === id),
      "dynasty"
    ),
    relatedEvents: getRelatedEvents({ dynastyId: id }),
    dynastySuccessions: getDynastySuccessionViewForDynasty(id),
    timeLabel: formatStoredTime("time", dynasty),
    defaultFromTimeExpression: extractBoundaryTime("from", dynasty),
    defaultToTimeExpression: extractBoundaryTime("to", dynasty)
  };
}

export function createPolityFromInput(input: PolityInput) {
  const id = createPolity(
    {
      name: input.name,
      description: nullable(input.description),
      note: nullable(input.note),
      ...toStoredPolityTime("from", input.fromTimeExpression),
      ...toStoredPolityTime("to", input.toTimeExpression)
    },
    input.regionIds
  );
  recordChangeHistory({
    targetType: "polity",
    targetId: id,
    action: "create",
    snapshot: buildPolityHistorySnapshot(id)
  });
  return id;
}

export function updatePolityFromInput(id: number, input: PolityInput) {
  const before = buildPolityHistorySnapshot(id);
  updatePolity(
    id,
    {
      name: input.name,
      description: nullable(input.description),
      note: nullable(input.note),
      ...toStoredPolityTime("from", input.fromTimeExpression),
      ...toStoredPolityTime("to", input.toTimeExpression)
    },
    input.regionIds
  );
  recordChangeHistory({
    targetType: "polity",
    targetId: id,
    action: "update",
    snapshot: before
  });
}

export function removePolity(id: number) {
  const snapshot = buildPolityHistorySnapshot(id);
  deletePolity(id);
  recordChangeHistory({
    targetType: "polity",
    targetId: id,
    action: "delete",
    snapshot
  });
}

export function createDynastyFromInput(input: DynastyInput) {
  return createDynasty(
    {
      name: input.name,
      description: nullable(input.description),
      note: nullable(input.note),
      ...toStoredBoundaryTime("from", input.fromTimeExpression),
      ...toStoredBoundaryTime("to", input.toTimeExpression)
    },
    input.polityIds,
    input.regionIds
  );
}

export function updateDynastyFromInput(id: number, input: DynastyInput) {
  updateDynasty(
    id,
    {
      name: input.name,
      description: nullable(input.description),
      note: nullable(input.note),
      ...toStoredBoundaryTime("from", input.fromTimeExpression),
      ...toStoredBoundaryTime("to", input.toTimeExpression)
    },
    input.polityIds,
    input.regionIds
  );
}

export function removeDynasty(id: number) {
  deleteDynasty(id);
}

function nullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

function toStoredBoundaryTime(prefix: "from" | "to", value: TimeExpressionInput | undefined) {
  const calendarEraKey = prefix === "from" ? "fromCalendarEra" : "toCalendarEra";
  const yearKey = prefix === "from" ? "fromYear" : "toYear";
  const approximateKey = prefix === "from" ? "fromIsApproximate" : "toIsApproximate";

  return {
    [calendarEraKey]: value?.calendarEra ?? null,
    [yearKey]: toStoredBoundaryYear(prefix, value?.startYear),
    [approximateKey]: value?.isApproximate ?? false
  };
}

function toStoredPolityTime(prefix: "from" | "to", value: TimeExpressionInput | undefined) {
  const calendarEraKey = prefix === "from" ? "fromCalendarEra" : "toCalendarEra";
  const yearKey = prefix === "from" ? "fromYear" : "toYear";
  const approximateKey = prefix === "from" ? "fromIsApproximate" : "toIsApproximate";

  return {
    [calendarEraKey]: value?.calendarEra ?? null,
    [yearKey]: toStoredBoundaryYear(prefix, value?.startYear),
    [approximateKey]: value?.isApproximate ?? false
  };
}

function extractTimeExpression(_prefix: string, value: Record<string, unknown>) {
  return fromTimeExpressionRecord({
    calendarEra: (value.fromCalendarEra as "BCE" | "CE" | null) ?? "CE",
    startYear: normalizeStoredBoundaryYear("from", value.fromYear as number | null | undefined),
    endYear: normalizeStoredBoundaryYear("to", value.toYear as number | null | undefined),
    isApproximate: Boolean(value.fromIsApproximate || value.toIsApproximate),
    precision: "year",
    displayLabel: null
  });
}

function extractBoundaryTime(prefix: "from" | "to", value: Record<string, unknown>) {
  const calendarEraKey = prefix === "from" ? "fromCalendarEra" : "toCalendarEra";
  const yearKey = prefix === "from" ? "fromYear" : "toYear";
  const approximateKey = prefix === "from" ? "fromIsApproximate" : "toIsApproximate";
  const calendarEra = (value[calendarEraKey] as "BCE" | "CE" | null | undefined) ?? null;
  const startYear = normalizeStoredBoundaryYear(prefix, value[yearKey] as number | null | undefined);
  const isApproximate = Boolean(value[approximateKey]);

  if (startYear === null && !isApproximate && calendarEra == null) {
    return undefined;
  }

  return {
    calendarEra: calendarEra ?? "CE",
    startYear: startYear ?? undefined,
    isApproximate,
    precision: "year",
    displayLabel: ""
  } satisfies TimeExpressionInput;
}

function extractPolityTimeExpression(prefix: "from" | "to", value: Record<string, unknown>) {
  const calendarEraKey = prefix === "from" ? "fromCalendarEra" : "toCalendarEra";
  const yearKey = prefix === "from" ? "fromYear" : "toYear";
  const approximateKey = prefix === "from" ? "fromIsApproximate" : "toIsApproximate";
  const calendarEra = (value[calendarEraKey] as "BCE" | "CE" | null | undefined) ?? null;
  const startYear = normalizeStoredBoundaryYear(prefix, value[yearKey] as number | null | undefined);
  const isApproximate = Boolean(value[approximateKey]);

  if (startYear === null && !isApproximate && calendarEra == null) {
    return undefined;
  }

  return {
    calendarEra: calendarEra ?? "CE",
    startYear: startYear ?? undefined,
    isApproximate,
    precision: "year",
    displayLabel: ""
  } satisfies TimeExpressionInput;
}

function formatStoredTime(prefix: string, value: Record<string, unknown>) {
  const extracted = extractTimeExpression(prefix, value);
  return extracted ? formatTimeExpression(extracted) : "年未詳";
}

function formatStoredPolityTime(value: Record<string, unknown>) {
  const from = extractPolityTimeExpression("from", value);
  const to = extractPolityTimeExpression("to", value);
  return [from ? formatTimeExpression(from) : "年未詳", to ? formatTimeExpression(to) : "年未詳"].join(" - ");
}

function formatPolityOptionTime(value: Record<string, unknown>) {
  return formatStoredBoundaryRangeForOption(
    (value.fromCalendarEra as "BCE" | "CE" | null) ?? null,
    value.fromYear as number | null | undefined,
    (value.toCalendarEra as "BCE" | "CE" | null) ?? null,
    value.toYear as number | null | undefined
  );
}

function toComparableStartYear(value: { fromCalendarEra?: string | null; fromYear?: number | null }) {
  const normalizedYear = normalizeStoredBoundaryYear("from", value.fromYear);
  if (normalizedYear == null) {
    return Number.NEGATIVE_INFINITY;
  }

  return value.fromCalendarEra === "BCE" ? -normalizedYear : normalizedYear;
}

function matchesPolityYearRange(
  polity: {
    fromCalendarEra: string | null;
    fromYear: number | null;
    toCalendarEra: string | null;
    toYear: number | null;
  },
  fromYear?: number,
  toYear?: number
) {
  if (fromYear === undefined && toYear === undefined) {
    return true;
  }

  const range = getComparablePolityRange(polity);
  const filterStart = fromYear ?? Number.NEGATIVE_INFINITY;
  const filterEnd = toYear ?? Number.POSITIVE_INFINITY;

  return range.start <= filterEnd && range.end >= filterStart;
}

function isCurrentPolity(polity: { toYear: number | null }) {
  return normalizeStoredBoundaryYear("to", polity.toYear) == null;
}

function getComparablePolityRange(polity: {
  fromCalendarEra: string | null;
  fromYear: number | null;
  toCalendarEra: string | null;
  toYear: number | null;
}) {
  const startYear = normalizeStoredBoundaryYear("from", polity.fromYear);
  const endYear = normalizeStoredBoundaryYear("to", polity.toYear);

  const start =
    startYear == null ? Number.NEGATIVE_INFINITY : toComparableYear(polity.fromCalendarEra, startYear);
  const end =
    endYear == null ? Number.POSITIVE_INFINITY : toComparableYear(polity.toCalendarEra ?? polity.fromCalendarEra, endYear);

  return {
    start: Math.min(start, end),
    end: Math.max(start, end)
  };
}

function toComparableYear(era: string | null | undefined, year: number) {
  return era === "BCE" ? -year : year;
}

function normalizeQuery(value?: string) {
  return value?.trim().toLocaleLowerCase("ja-JP") ?? "";
}

function matchesQuery(values: Array<string | null | undefined>, query: string) {
  if (query.length === 0) {
    return true;
  }

  return values.some((value) => value?.toLocaleLowerCase("ja-JP").includes(query));
}

function buildRelatedPerson(
  person: ReturnType<typeof listPersonDetailed>,
  roles: ReturnType<typeof getRoleAssignmentsByPersonIds>,
  scope: "polity" | "dynasty"
) {
  const personById = new Map(person.map((person) => [person.id, person]));
  const grouped = new Map<number, Array<typeof roles[number]>>();

  for (const role of roles) {
    const current = grouped.get(role.personId) ?? [];
    current.push(role);
    grouped.set(role.personId, current);
  }

  return [...grouped.entries()]
    .map(([personId, personRoles]) => {
      const person = personById.get(personId);
      if (!person) {
        return null;
      }

      return {
        id: person.id,
        name: person.name,
        roleLabels: personRoles.map((role) => `${role.title} (${formatStoredTime("time", role)})`),
        primaryScopeCount:
          scope === "polity"
            ? personRoles.filter((role) => role.polityId != null).length
            : personRoles.filter((role) => role.dynastyId != null).length
      };
    })
    .filter((person): person is NonNullable<typeof person> => Boolean(person))
    .sort((left, right) => right.primaryScopeCount - left.primaryScopeCount || left.name.localeCompare(right.name, "ja-JP"));
}

function buildPolityHistorySnapshot(id: number) {
  const polity = getPolityById(id);
  if (!polity) {
    return { id };
  }

  return {
    ...polity,
    regionIds: getPolityRegionIds([id]).map((link) => link.regionId)
  };
}
