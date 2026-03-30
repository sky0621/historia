import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { role, personRoleLinks } from "@/db/schema";

export type RoleRecord = typeof role.$inferSelect;
export type RoleInsert = typeof role.$inferInsert;

export function listRoles() {
  return db.select().from(role).orderBy(asc(role.title)).all();
}

export function getRoleById(id: number) {
  return db.select().from(role).where(eq(role.id, id)).get();
}

export function createRole(input: RoleInsert) {
  const result = db.insert(role).values(input).run();
  return Number(result.lastInsertRowid);
}

export function updateRole(id: number, input: Omit<RoleInsert, "id">) {
  db.update(role).set(input).where(eq(role.id, id)).run();
}

export function deleteRole(id: number) {
  db.transaction((tx) => {
    tx.delete(personRoleLinks).where(eq(personRoleLinks.roleId, id)).run();
    tx.delete(role).where(eq(role.id, id)).run();
  });
}

export function getRolePersonLinks(roleIds: number[]) {
  if (roleIds.length === 0) {
    return [];
  }

  return db.select().from(personRoleLinks).where(inArray(personRoleLinks.roleId, roleIds)).all();
}
