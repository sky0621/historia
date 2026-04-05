import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type RoleAssignmentsRepositoryModule = typeof import("./role-assignments");

const schemaSql = fs.readFileSync(path.resolve(process.cwd(), "src/db/schema.sql"), "utf8");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "historia-role-assignments-repository-"));
const databasePath = path.join(tempDir, "test.sqlite");

let sqlite: Database.Database;
let roleAssignmentsRepositoryModule: RoleAssignmentsRepositoryModule;

beforeAll(async () => {
  process.env.DATABASE_URL = databasePath;
  sqlite = new Database(databasePath);
  sqlite.exec(schemaSql);
  vi.resetModules();
  roleAssignmentsRepositoryModule = await import("./role-assignments");
});

afterAll(() => {
  sqlite.close();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

beforeEach(() => {
  sqlite.prepare("DELETE FROM person_role_links").run();
  sqlite.prepare("DELETE FROM role_polity_links").run();
  sqlite.prepare("DELETE FROM persons").run();
  sqlite.prepare("DELETE FROM roles").run();
  sqlite.prepare("DELETE FROM polities").run();
  sqlite.prepare("DELETE FROM sqlite_sequence").run();

  sqlite.prepare("INSERT INTO persons (id, name) VALUES (1, '人物A'), (2, '人物B')").run();
  sqlite.prepare("INSERT INTO roles (id, title) VALUES (1, '皇帝')").run();
  sqlite.prepare("INSERT INTO polities (id, name) VALUES (1, 'ローマ帝国')").run();
  sqlite.prepare("INSERT INTO role_polity_links (role_id, polity_id) VALUES (1, 1)").run();
  sqlite
    .prepare(
      "INSERT INTO person_role_links (person_id, role_id, description) VALUES (1, 1, '人物Aの役職'), (2, 1, '人物Bの役職')"
    )
    .run();
});

describe("role assignments repository", () => {
  it("returns a row for each person-role link even when the same role is shared", () => {
    const rows = roleAssignmentsRepositoryModule.getRoleAssignmentsByPersonIds([1, 2]);

    expect(rows).toHaveLength(2);
    expect(rows).toEqual([
      expect.objectContaining({ id: 1, personId: 1, title: "皇帝", description: "人物Aの役職", polityIds: [1] }),
      expect.objectContaining({ id: 1, personId: 2, title: "皇帝", description: "人物Bの役職", polityIds: [1] })
    ]);
  });
});
