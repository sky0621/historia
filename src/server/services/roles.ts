import type { RoleInput } from "@/features/roles/schema";
import { createRole, deleteRole, getRoleById, listRoles, updateRole } from "@/server/repositories/roles";
import { getPolityOptions } from "@/server/services/polities";

type RoleListFilters = {
  query?: string;
};

export function getRoleListView(filters: RoleListFilters = {}) {
  const normalizedQuery = normalizeQuery(filters.query);
  const roles = listRoles();
  const polityById = new Map(getPolityOptions().map((polity) => [polity.id, polity.name]));

  return roles
    .map((item) => ({
      ...item,
      polityNames: item.polityIds.map((polityId) => polityById.get(polityId) ?? `#${polityId}`)
    }))
    .filter((item) => matchesQuery([item.title, item.reading, item.description, item.note, item.polityNames.join(", ")], normalizedQuery))
    .sort((left, right) => left.title.localeCompare(right.title, "ja-JP"));
}

export function getRoleDetailView(id: number) {
  const role = getRoleById(id);
  if (!role) {
    return null;
  }

  const polityOptions = getPolityOptions();

  return {
    role,
    polities: polityOptions.filter((item) => role.polityIds.includes(item.id)),
    formOptions: {
      polities: polityOptions
    }
  };
}

export function createRoleFromInput(input: RoleInput) {
  return createRole({
    title: input.title,
    reading: nullable(input.reading),
    description: nullable(input.description),
    note: nullable(input.note)
  }, input.polityIds);
}

export function updateRoleFromInput(id: number, input: RoleInput) {
  updateRole(id, {
    title: input.title,
    reading: nullable(input.reading),
    description: nullable(input.description),
    note: nullable(input.note)
  }, input.polityIds);
}

export function removeRole(id: number) {
  deleteRole(id);
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
