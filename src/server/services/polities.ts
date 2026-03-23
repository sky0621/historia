import { fromTimeExpressionRecord, toTimeExpressionRecord } from "@/lib/time-expression/normalize";
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
import { getDynastySuccessionViewForDynasty, getDynastySuccessionViewForPolity, getPolityTransitionView } from "@/server/services/relations";
import { getCitationListForTarget } from "@/server/services/sources";

export function getPolityOptions() {
  return listPolities().map((polity) => ({ id: polity.id, name: polity.name }));
}

export function getRegionOptions() {
  return listRegions().map((region) => ({ id: region.id, name: region.name }));
}

type PolityListFilters = {
  query?: string;
  regionId?: number;
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
      timeLabel: formatStoredPolityTime(polity),
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

      return true;
    })
    .filter((polity) => matchesQuery([polity.name, polity.aliases, polity.note, polity.regionNames.join(", ")], normalizedQuery));
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
      polityName: polityNameById.get(dynasty.polityId) ?? "不明",
      timeLabel: formatStoredTime("time", dynasty),
      regionNames: links
        .filter((link) => link.dynastyId === dynasty.id)
        .map((link) => regionNameById.get(link.regionId))
        .filter((name): name is string => Boolean(name)),
      regionIds: links.filter((link) => link.dynastyId === dynasty.id).map((link) => link.regionId)
    }))
    .filter((dynasty) => {
      if (filters.polityId && dynasty.polityId !== filters.polityId) {
        return false;
      }

      if (filters.regionId && !dynasty.regionIds.includes(filters.regionId)) {
        return false;
      }

      return true;
    })
    .filter((dynasty) =>
      matchesQuery([dynasty.name, dynasty.aliases, dynasty.note, dynasty.polityName, dynasty.regionNames.join(", ")], normalizedQuery)
    );
}

export function getPolityDetailView(id: number) {
  const polity = getPolityById(id);
  if (!polity) {
    return null;
  }

  const dynasties = listDynasties().filter((dynasty) => dynasty.polityId === polity.id);
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

  const polity = getPolityById(dynasty.polityId);
  const regions = listRegions();
  const linkedRegionIds = getDynastyRegionIds([dynasty.id]).map((link) => link.regionId);
  const person = listPersonDetailed();
  const roles = getRoleAssignmentsByPersonIds(person.map((person) => person.id));

  return {
    dynasty,
    polity,
    regions: regions.filter((region) => linkedRegionIds.includes(region.id)),
    relatedPerson: buildRelatedPerson(
      person,
      roles.filter((role) => role.dynastyId === id),
      "dynasty"
    ),
    relatedEvents: getRelatedEvents({ dynastyId: id }),
    dynastySuccessions: getDynastySuccessionViewForDynasty(id),
    timeLabel: formatStoredTime("time", dynasty),
    defaultTimeExpression: extractTimeExpression("time", dynasty)
  };
}

export function createPolityFromInput(input: PolityInput) {
  const id = createPolity(
    {
      name: input.name,
      aliases: joinAliases(input.aliases),
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
      aliases: joinAliases(input.aliases),
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
      aliases: joinAliases(input.aliases),
      note: nullable(input.note),
      ...toStoredTime("time", input.timeExpression)
    },
    input.polityId,
    input.regionIds
  );
}

export function updateDynastyFromInput(id: number, input: DynastyInput) {
  updateDynasty(
    id,
    {
      name: input.name,
      aliases: joinAliases(input.aliases),
      note: nullable(input.note),
      ...toStoredTime("time", input.timeExpression)
    },
    input.polityId,
    input.regionIds
  );
}

export function removeDynasty(id: number) {
  deleteDynasty(id);
}

function joinAliases(aliases: string[]) {
  return aliases.length > 0 ? aliases.join(", ") : null;
}

function nullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

function toStoredTime(prefix: string, value: TimeExpressionInput | undefined) {
  const record = toTimeExpressionRecord(value);

  return {
    [`${prefix}CalendarEra`]: record?.calendarEra ?? null,
    [`${prefix}StartYear`]: record?.startYear ?? null,
    [`${prefix}EndYear`]: record?.endYear ?? null,
    [`${prefix}IsApproximate`]: record?.isApproximate ?? false,
    [`${prefix}Precision`]: record?.precision ?? null,
    [`${prefix}DisplayLabel`]: record?.displayLabel ?? null
  };
}

function toStoredPolityTime(prefix: "from" | "to", value: TimeExpressionInput | undefined) {
  const calendarEraKey = prefix === "from" ? "fromCalendarEra" : "toCalendarEra";
  const yearKey = prefix === "from" ? "fromYear" : "toYear";
  const approximateKey = prefix === "from" ? "fromIsApproximate" : "toIsApproximate";

  return {
    [calendarEraKey]: value ? value.calendarEra === "BCE" : null,
    [yearKey]: value?.startYear ?? null,
    [approximateKey]: value?.isApproximate ?? false
  };
}

function extractTimeExpression(prefix: string, value: Record<string, unknown>) {
  return fromTimeExpressionRecord({
    calendarEra: (value[`${prefix}CalendarEra`] as "BCE" | "CE" | null) ?? "CE",
    startYear: (value[`${prefix}StartYear`] as number | null) ?? null,
    endYear: (value[`${prefix}EndYear`] as number | null) ?? null,
    isApproximate: Boolean(value[`${prefix}IsApproximate`]),
    precision: (value[`${prefix}Precision`] as string | null) ?? "year",
    displayLabel: (value[`${prefix}DisplayLabel`] as string | null) ?? null
  });
}

function extractPolityTimeExpression(prefix: "from" | "to", value: Record<string, unknown>) {
  const calendarEraKey = prefix === "from" ? "fromCalendarEra" : "toCalendarEra";
  const yearKey = prefix === "from" ? "fromYear" : "toYear";
  const approximateKey = prefix === "from" ? "fromIsApproximate" : "toIsApproximate";
  const isBce = value[calendarEraKey] as boolean | null | undefined;
  const startYear = (value[yearKey] as number | null) ?? null;
  const isApproximate = Boolean(value[approximateKey]);
  const calendarEra = isBce ? "BCE" : "CE";

  if (startYear === null && !isApproximate && isBce == null) {
    return undefined;
  }

  return {
    calendarEra,
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
