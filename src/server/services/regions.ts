import {
  createRegion,
  deleteRegion,
  getRegionById,
  listRegions,
  updateRegion
} from "@/server/repositories/regions";
import type { RegionInput } from "@/features/regions/schema";
import { listPeopleDetailed, getPersonRegionLinks } from "@/server/repositories/people-detail";
import { listPolities, getPolityRegionIds } from "@/server/repositories/polities";
import { listDynasties, getDynastyRegionIds } from "@/server/repositories/dynasties";
import { listHistoricalPeriods, getHistoricalPeriodRegionIds } from "@/server/repositories/historical-periods";
import { listReligions, getReligionRegionIds } from "@/server/repositories/religions";
import { listSects, getSectRegionIds } from "@/server/repositories/sects";
import { getRelatedEvents } from "@/server/services/event-references";

export function getRegionOptions(excludeId?: number) {
  return listRegions()
    .filter((region) => region.id !== excludeId)
    .map((region) => ({ id: region.id, name: region.name }));
}

export function getRegionView(id: number) {
  const region = getRegionById(id);
  if (!region) {
    return null;
  }

  const parent = region.parentRegionId ? getRegionById(region.parentRegionId) : null;
  const children = listRegions().filter((candidate) => candidate.parentRegionId === region.id);
  const people = listPeopleDetailed();
  const polities = listPolities();
  const dynasties = listDynasties();
  const periods = listHistoricalPeriods();
  const religions = listReligions();
  const sects = listSects();

  const peopleLinks = getPersonRegionLinks(people.map((item) => item.id));
  const polityLinks = getPolityRegionIds(polities.map((item) => item.id));
  const dynastyLinks = getDynastyRegionIds(dynasties.map((item) => item.id));
  const periodLinks = getHistoricalPeriodRegionIds(periods.map((item) => item.id));
  const religionLinks = getReligionRegionIds(religions.map((item) => item.id));
  const sectLinks = getSectRegionIds(sects.map((item) => item.id));

  return {
    region,
    parent,
    children,
    relatedEvents: getRelatedEvents({ regionId: id }),
    relatedPeople: people.filter((item) => peopleLinks.some((link) => link.personId === item.id && link.regionId === id)),
    relatedPolities: polities.filter((item) => polityLinks.some((link) => link.polityId === item.id && link.regionId === id)),
    relatedDynasties: dynasties.filter((item) => dynastyLinks.some((link) => link.dynastyId === item.id && link.regionId === id)),
    relatedPeriods: periods.filter((item) => periodLinks.some((link) => link.periodId === item.id && link.regionId === id)),
    relatedReligions: religions.filter((item) => religionLinks.some((link) => link.religionId === item.id && link.regionId === id)),
    relatedSects: sects.filter((item) => sectLinks.some((link) => link.sectId === item.id && link.regionId === id))
  };
}

export function createRegionFromInput(input: RegionInput) {
  return createRegion({
    name: input.name,
    parentRegionId: input.parentRegionId ?? null,
    aliases: joinAliases(input.aliases),
    description: nullable(input.description),
    note: nullable(input.note)
  });
}

export function updateRegionFromInput(id: number, input: RegionInput) {
  updateRegion(id, {
    name: input.name,
    parentRegionId: input.parentRegionId ?? null,
    aliases: joinAliases(input.aliases),
    description: nullable(input.description),
    note: nullable(input.note)
  });
}

export function deleteRegionById(id: number) {
  deleteRegion(id);
}

function joinAliases(value: string[]) {
  return value.length > 0 ? value.join(", ") : null;
}

function nullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}
