import {
  createRegion,
  deleteRegion,
  getRegionById,
  listRegions,
  updateRegion
} from "@/server/repositories/regions";
import type { RegionInput } from "@/features/regions/schema";
import { listPersonDetailed, getPersonRegionLinks } from "@/server/repositories/person-detail";
import { listPolities, getPolityRegionIds } from "@/server/repositories/polities";
import { listDynasties, getDynastyRegionIds } from "@/server/repositories/dynasties";
import { listHistoricalPeriods, getHistoricalPeriodRegionIds } from "@/server/repositories/historical-periods";
import { getRelatedEvents } from "@/server/services/event-references";
import { getRegionRelationView } from "@/server/services/relations";

export function getRegionOptions(excludeId?: number) {
  return listRegions()
    .filter((region) => region.id !== excludeId)
    .map((region) => ({ id: region.id, name: region.name }));
}

type RegionListFilters = {
  query?: string;
  parentRegionId?: number;
  hasChildren?: boolean;
};

export function getRegionListView(filters: RegionListFilters = {}) {
  const normalizedQuery = normalizeQuery(filters.query);
  const regions = listRegions();
  const regionNameById = new Map(regions.map((region) => [region.id, region.name]));

  return regions
    .map((region) => {
      const childCount = regions.filter((candidate) => candidate.parentRegionId === region.id).length;

      return {
        ...region,
        parentName: region.parentRegionId ? regionNameById.get(region.parentRegionId) ?? null : null,
        childCount
      };
    })
    .filter((region) => {
      if (filters.parentRegionId !== undefined) {
        if (filters.parentRegionId === 0) {
          if (region.parentRegionId !== null) {
            return false;
          }
        } else if (region.parentRegionId !== filters.parentRegionId) {
          return false;
        }
      }

      if (filters.hasChildren && region.childCount === 0) {
        return false;
      }

      return true;
    })
    .filter((region) =>
      matchesQuery([region.name, region.description, region.note, region.parentName ?? ""], normalizedQuery)
    );
}

export function getRegionView(id: number) {
  const region = getRegionById(id);
  if (!region) {
    return null;
  }

  const parent = region.parentRegionId ? getRegionById(region.parentRegionId) : null;
  const children = listRegions().filter((candidate) => candidate.parentRegionId === region.id);
  const person = listPersonDetailed();
  const polities = listPolities();
  const dynasties = listDynasties();
  const periods = listHistoricalPeriods();

  const personLinks = getPersonRegionLinks(person.map((item) => item.id));
  const polityLinks = getPolityRegionIds(polities.map((item) => item.id));
  const dynastyLinks = getDynastyRegionIds(dynasties.map((item) => item.id));
  const periodLinks = getHistoricalPeriodRegionIds(periods.map((item) => item.id));

  return {
    region,
    parent,
    children,
    relatedEvents: getRelatedEvents({ regionId: id }),
    relatedPerson: person.filter((item) => personLinks.some((link) => link.personId === item.id && link.regionId === id)),
    relatedPolities: polities.filter((item) => polityLinks.some((link) => link.polityId === item.id && link.regionId === id)),
    relatedDynasties: dynasties.filter((item) => dynastyLinks.some((link) => link.dynastyId === item.id && link.regionId === id)),
    relatedPeriods: periods.filter((item) => periodLinks.some((link) => link.periodId === item.id && link.regionId === id)),
    regionRelations: getRegionRelationView(id)
  };
}

export function createRegionFromInput(input: RegionInput) {
  return createRegion(
    {
      name: input.name,
      description: nullable(input.description),
      note: nullable(input.note)
    },
    input.parentRegionId ?? null
  );
}

export function updateRegionFromInput(id: number, input: RegionInput) {
  updateRegion(
    id,
    {
      name: input.name,
      description: nullable(input.description),
      note: nullable(input.note)
    },
    input.parentRegionId ?? null
  );
}

export function deleteRegionById(id: number) {
  deleteRegion(id);
}

function nullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
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
