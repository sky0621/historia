import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { role, personRoleLinks, rolePolityLinks } from "@/db/schema";

export type RoleRecord = typeof role.$inferSelect & { polityIds: number[] };
export type RoleInsert = typeof role.$inferInsert;

export function listRoles() {
  const items = db.select().from(role).orderBy(asc(role.title)).all();
  const links = getRolePolityLinks(items.map((item) => item.id));
  const polityIdsByRoleId = new Map<number, number[]>();

  for (const link of links) {
    const current = polityIdsByRoleId.get(link.roleId) ?? [];
    current.push(link.polityId);
    polityIdsByRoleId.set(link.roleId, current);
  }

  return items.map((item) => ({
    ...item,
    polityIds: polityIdsByRoleId.get(item.id) ?? []
  }));
}

export function getRoleById(id: number) {
  const item = db.select().from(role).where(eq(role.id, id)).get();
  if (!item) {
    return null;
  }

  return {
    ...item,
    polityIds: getRolePolityLinks([id]).map((link) => link.polityId)
  };
}

export function createRole(input: RoleInsert, polityIds: number[]) {
  return db.transaction((tx) => {
    const result = tx.insert(role).values(input).run();
    const roleId = Number(result.lastInsertRowid);

    if (polityIds.length > 0) {
      tx.insert(rolePolityLinks).values(polityIds.map((polityId) => ({ roleId, polityId }))).run();
    }

    return roleId;
  });
}

export function updateRole(id: number, input: Omit<RoleInsert, "id">, polityIds: number[]) {
  db.transaction((tx) => {
    tx.update(role).set(input).where(eq(role.id, id)).run();
    tx.delete(rolePolityLinks).where(eq(rolePolityLinks.roleId, id)).run();

    if (polityIds.length > 0) {
      tx.insert(rolePolityLinks).values(polityIds.map((polityId) => ({ roleId: id, polityId }))).run();
    }
  });
}

export function deleteRole(id: number) {
  db.transaction((tx) => {
    tx.delete(personRoleLinks).where(eq(personRoleLinks.roleId, id)).run();
    tx.delete(rolePolityLinks).where(eq(rolePolityLinks.roleId, id)).run();
    tx.delete(role).where(eq(role.id, id)).run();
  });
}

export function getRolePersonLinks(roleIds: number[]) {
  if (roleIds.length === 0) {
    return [];
  }

  return db.select().from(personRoleLinks).where(inArray(personRoleLinks.roleId, roleIds)).all();
}

export function getRolePolityLinks(roleIds: number[]) {
  if (roleIds.length === 0) {
    return [];
  }

  return db.select().from(rolePolityLinks).where(inArray(rolePolityLinks.roleId, roleIds)).all();
}
