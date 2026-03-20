import { formatTimeExpression } from "@/lib/time-expression/format";
import { fromTimeExpressionRecord, toTimeExpressionRecord } from "@/lib/time-expression/normalize";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";
import type {
  DynastySuccessionInput,
  HistoricalPeriodRelationInput,
  PolityTransitionInput,
  RegionRelationInput
} from "@/features/relations/schema";
import {
  createDynastySuccession,
  deleteDynastySuccession,
  getDynastySuccessionById,
  getDynastySuccessionsByDynastyIds,
  getDynastySuccessionsByPolityIds,
  updateDynastySuccession
} from "@/server/repositories/dynasty-successions";
import {
  createHistoricalPeriodRelation,
  deleteHistoricalPeriodRelation,
  getHistoricalPeriodRelationById,
  getHistoricalPeriodRelationsByPeriodIds,
  updateHistoricalPeriodRelation
} from "@/server/repositories/historical-period-relations";
import { listDynasties } from "@/server/repositories/dynasties";
import { listHistoricalPeriods } from "@/server/repositories/historical-periods";
import { listPolities } from "@/server/repositories/polities";
import {
  createPolityTransition,
  deletePolityTransition,
  getPolityTransitionById,
  getPolityTransitionsByPolityIds,
  updatePolityTransition
} from "@/server/repositories/polity-transitions";
import { listRegions } from "@/server/repositories/regions";
import {
  createRegionRelation,
  deleteRegionRelation,
  getRegionRelationById,
  getRegionRelationsByRegionIds,
  updateRegionRelation
} from "@/server/repositories/region-relations";
import { listSects } from "@/server/repositories/sects";

export function getRelationFormOptions() {
  return {
    polities: listPolities().map((item) => ({ id: item.id, name: item.name })),
    dynasties: listDynasties().map((item) => ({ id: item.id, name: item.name })),
    periods: listHistoricalPeriods().map((item) => ({ id: item.id, name: item.name })),
    regions: listRegions().map((item) => ({ id: item.id, name: item.name }))
  };
}

export function getPolityTransitionFormView(id?: number, defaults?: Partial<PolityTransitionInput>) {
  const transition = id ? getPolityTransitionById(id) : null;
  const options = getRelationFormOptions();

  return {
    options,
    transition,
    defaultValues: transition
      ? {
          id: transition.id,
          predecessorPolityId: transition.predecessorPolityId,
          successorPolityId: transition.successorPolityId,
          transitionType: transition.transitionType as PolityTransitionInput["transitionType"],
          note: transition.note ?? "",
          timeExpression: extractTimeExpression("time", transition)
        }
      : {
          predecessorPolityId: defaults?.predecessorPolityId ?? 0,
          successorPolityId: defaults?.successorPolityId ?? 0,
          transitionType: defaults?.transitionType ?? "succession",
          note: defaults?.note ?? "",
          timeExpression: defaults?.timeExpression
        }
  };
}

export function getDynastySuccessionFormView(id?: number, defaults?: Partial<DynastySuccessionInput>) {
  const succession = id ? getDynastySuccessionById(id) : null;
  const options = getRelationFormOptions();

  return {
    options,
    succession,
    defaultValues: succession
      ? {
          id: succession.id,
          polityId: succession.polityId,
          predecessorDynastyId: succession.predecessorDynastyId,
          successorDynastyId: succession.successorDynastyId,
          note: succession.note ?? "",
          timeExpression: extractTimeExpression("time", succession)
        }
      : {
          polityId: defaults?.polityId ?? 0,
          predecessorDynastyId: defaults?.predecessorDynastyId ?? 0,
          successorDynastyId: defaults?.successorDynastyId ?? 0,
          note: defaults?.note ?? "",
          timeExpression: defaults?.timeExpression
        }
  };
}

export function getRegionRelationFormView(id?: number, defaults?: Partial<RegionRelationInput>) {
  const relation = id ? getRegionRelationById(id) : null;
  const options = getRelationFormOptions();

  return {
    options,
    relation,
    defaultValues: relation
      ? {
          id: relation.id,
          fromRegionId: relation.fromRegionId,
          toRegionId: relation.toRegionId,
          relationType: relation.relationType as RegionRelationInput["relationType"],
          note: relation.note ?? ""
        }
      : {
          fromRegionId: defaults?.fromRegionId ?? 0,
          toRegionId: defaults?.toRegionId ?? 0,
          relationType: defaults?.relationType ?? "contains",
          note: defaults?.note ?? ""
        }
  };
}

export function getHistoricalPeriodRelationFormView(id?: number, defaults?: Partial<HistoricalPeriodRelationInput>) {
  const relation = id ? getHistoricalPeriodRelationById(id) : null;
  const options = getRelationFormOptions();

  return {
    options,
    relation,
    defaultValues: relation
      ? {
          id: relation.id,
          fromPeriodId: relation.fromPeriodId,
          toPeriodId: relation.toPeriodId,
          relationType: relation.relationType as HistoricalPeriodRelationInput["relationType"],
          note: relation.note ?? ""
        }
      : {
          fromPeriodId: defaults?.fromPeriodId ?? 0,
          toPeriodId: defaults?.toPeriodId ?? 0,
          relationType: defaults?.relationType ?? "succeeds",
          note: defaults?.note ?? ""
        }
  };
}

export function createPolityTransitionFromInput(input: PolityTransitionInput) {
  return createPolityTransition({
    predecessorPolityId: input.predecessorPolityId,
    successorPolityId: input.successorPolityId,
    transitionType: input.transitionType,
    note: nullable(input.note),
    ...toStoredTime("time", input.timeExpression)
  });
}

export function updatePolityTransitionFromInput(id: number, input: PolityTransitionInput) {
  updatePolityTransition(id, {
    predecessorPolityId: input.predecessorPolityId,
    successorPolityId: input.successorPolityId,
    transitionType: input.transitionType,
    note: nullable(input.note),
    ...toStoredTime("time", input.timeExpression)
  });
}

export function deletePolityTransitionById(id: number) {
  deletePolityTransition(id);
}

export function createDynastySuccessionFromInput(input: DynastySuccessionInput) {
  return createDynastySuccession({
    polityId: input.polityId,
    predecessorDynastyId: input.predecessorDynastyId,
    successorDynastyId: input.successorDynastyId,
    note: nullable(input.note),
    ...toStoredTime("time", input.timeExpression)
  });
}

export function updateDynastySuccessionFromInput(id: number, input: DynastySuccessionInput) {
  updateDynastySuccession(id, {
    polityId: input.polityId,
    predecessorDynastyId: input.predecessorDynastyId,
    successorDynastyId: input.successorDynastyId,
    note: nullable(input.note),
    ...toStoredTime("time", input.timeExpression)
  });
}

export function deleteDynastySuccessionById(id: number) {
  deleteDynastySuccession(id);
}

export function createRegionRelationFromInput(input: RegionRelationInput) {
  return createRegionRelation({
    fromRegionId: input.fromRegionId,
    toRegionId: input.toRegionId,
    relationType: input.relationType,
    note: nullable(input.note)
  });
}

export function updateRegionRelationFromInput(id: number, input: RegionRelationInput) {
  updateRegionRelation(id, {
    fromRegionId: input.fromRegionId,
    toRegionId: input.toRegionId,
    relationType: input.relationType,
    note: nullable(input.note)
  });
}

export function deleteRegionRelationById(id: number) {
  deleteRegionRelation(id);
}

export function createHistoricalPeriodRelationFromInput(input: HistoricalPeriodRelationInput) {
  return createHistoricalPeriodRelation({
    fromPeriodId: input.fromPeriodId,
    toPeriodId: input.toPeriodId,
    relationType: input.relationType,
    note: nullable(input.note)
  });
}

export function updateHistoricalPeriodRelationFromInput(id: number, input: HistoricalPeriodRelationInput) {
  updateHistoricalPeriodRelation(id, {
    fromPeriodId: input.fromPeriodId,
    toPeriodId: input.toPeriodId,
    relationType: input.relationType,
    note: nullable(input.note)
  });
}

export function deleteHistoricalPeriodRelationById(id: number) {
  deleteHistoricalPeriodRelation(id);
}

export function getPolityTransitionView(polityId: number) {
  const polities = new Map(listPolities().map((item) => [item.id, item.name]));

  return getPolityTransitionsByPolityIds([polityId]).map((item) => ({
    ...item,
    predecessorName: polities.get(item.predecessorPolityId) ?? `#${item.predecessorPolityId}`,
    successorName: polities.get(item.successorPolityId) ?? `#${item.successorPolityId}`,
    timeLabel: formatStoredTime("time", item)
  }));
}

export function getDynastySuccessionViewForPolity(polityId: number) {
  const dynasties = new Map(listDynasties().map((item) => [item.id, item.name]));

  return getDynastySuccessionsByPolityIds([polityId]).map((item) => ({
    ...item,
    predecessorName: dynasties.get(item.predecessorDynastyId) ?? `#${item.predecessorDynastyId}`,
    successorName: dynasties.get(item.successorDynastyId) ?? `#${item.successorDynastyId}`,
    timeLabel: formatStoredTime("time", item)
  }));
}

export function getDynastySuccessionViewForDynasty(dynastyId: number) {
  const dynasties = new Map(listDynasties().map((item) => [item.id, item.name]));

  return getDynastySuccessionsByDynastyIds([dynastyId]).map((item) => ({
    ...item,
    predecessorName: dynasties.get(item.predecessorDynastyId) ?? `#${item.predecessorDynastyId}`,
    successorName: dynasties.get(item.successorDynastyId) ?? `#${item.successorDynastyId}`,
    timeLabel: formatStoredTime("time", item)
  }));
}

export function getRegionRelationView(regionId: number) {
  const regions = new Map(listRegions().map((item) => [item.id, item.name]));

  return getRegionRelationsByRegionIds([regionId]).map((item) => ({
    ...item,
    fromName: regions.get(item.fromRegionId) ?? `#${item.fromRegionId}`,
    toName: regions.get(item.toRegionId) ?? `#${item.toRegionId}`
  }));
}

export function getHistoricalPeriodRelationView(periodId: number) {
  const periods = new Map(listHistoricalPeriods().map((item) => [item.id, item.name]));

  return getHistoricalPeriodRelationsByPeriodIds([periodId]).map((item) => ({
    ...item,
    fromName: periods.get(item.fromPeriodId) ?? `#${item.fromPeriodId}`,
    toName: periods.get(item.toPeriodId) ?? `#${item.toPeriodId}`
  }));
}

export function getSectHierarchyView(sectId: number) {
  const sects = listSects();
  const current = sects.find((item) => item.id === sectId) ?? null;
  if (!current) {
    return { parent: null, children: [] };
  }

  return {
    parent: current.parentSectId ? sects.find((item) => item.id === current.parentSectId) ?? null : null,
    children: sects.filter((item) => item.parentSectId === sectId)
  };
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

function formatStoredTime(prefix: string, value: Record<string, unknown>) {
  const extracted = extractTimeExpression(prefix, value);
  return extracted ? formatTimeExpression(extracted) : "年未詳";
}
