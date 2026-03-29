import type {
  DynastySuccessionInput,
  HistoricalPeriodRelationInput,
  PolityTransitionInput
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

export function getRelationFormOptions() {
  return {
    polities: listPolities().map((item) => ({ id: item.id, name: item.name })),
    dynasties: listDynasties().map((item) => ({ id: item.id, name: item.name })),
    periods: listHistoricalPeriods().map((item) => ({ id: item.id, name: item.name }))
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
          transitionType: transition.transitionType as PolityTransitionInput["transitionType"]
        }
      : {
          predecessorPolityId: defaults?.predecessorPolityId ?? 0,
          successorPolityId: defaults?.successorPolityId ?? 0,
          transitionType: defaults?.transitionType ?? "succeeded"
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
          successorDynastyId: succession.successorDynastyId
        }
      : {
          polityId: defaults?.polityId ?? 0,
          predecessorDynastyId: defaults?.predecessorDynastyId ?? 0,
          successorDynastyId: defaults?.successorDynastyId ?? 0
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
    transitionType: input.transitionType
  });
}

export function updatePolityTransitionFromInput(id: number, input: PolityTransitionInput) {
  updatePolityTransition(id, {
    predecessorPolityId: input.predecessorPolityId,
    successorPolityId: input.successorPolityId,
    transitionType: input.transitionType
  });
}

export function deletePolityTransitionById(id: number) {
  deletePolityTransition(id);
}

export function createDynastySuccessionFromInput(input: DynastySuccessionInput) {
  return createDynastySuccession({
    polityId: input.polityId,
    predecessorDynastyId: input.predecessorDynastyId,
    successorDynastyId: input.successorDynastyId
  });
}

export function updateDynastySuccessionFromInput(id: number, input: DynastySuccessionInput) {
  updateDynastySuccession(id, {
    polityId: input.polityId,
    predecessorDynastyId: input.predecessorDynastyId,
    successorDynastyId: input.successorDynastyId
  });
}

export function deleteDynastySuccessionById(id: number) {
  deleteDynastySuccession(id);
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
    successorName: polities.get(item.successorPolityId) ?? `#${item.successorPolityId}`
  }));
}

export function getDynastySuccessionViewForPolity(polityId: number) {
  const dynasties = new Map(listDynasties().map((item) => [item.id, item.name]));

  return getDynastySuccessionsByPolityIds([polityId]).map((item) => ({
    ...item,
    predecessorName: dynasties.get(item.predecessorDynastyId) ?? `#${item.predecessorDynastyId}`,
    successorName: dynasties.get(item.successorDynastyId) ?? `#${item.successorDynastyId}`
  }));
}

export function getDynastySuccessionViewForDynasty(dynastyId: number) {
  const dynasties = new Map(listDynasties().map((item) => [item.id, item.name]));

  return getDynastySuccessionsByDynastyIds([dynastyId]).map((item) => ({
    ...item,
    predecessorName: dynasties.get(item.predecessorDynastyId) ?? `#${item.predecessorDynastyId}`,
    successorName: dynasties.get(item.successorDynastyId) ?? `#${item.successorDynastyId}`
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

function nullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}
