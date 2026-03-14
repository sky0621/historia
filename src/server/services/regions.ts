import {
  createRegion,
  deleteRegion,
  getRegionById,
  listRegions,
  updateRegion
} from "@/server/repositories/regions";
import type { RegionInput } from "@/features/regions/schema";

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

  return {
    region,
    parent,
    children
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
