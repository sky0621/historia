import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type PolitiesRepositoryModule = typeof import("./polities");

const schemaSql = fs.readFileSync(path.resolve(process.cwd(), "src/db/schema.sql"), "utf8");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "historia-polities-repository-"));
const databasePath = path.join(tempDir, "test.sqlite");

let sqlite: Database.Database;
let politiesRepositoryModule: PolitiesRepositoryModule;

beforeAll(async () => {
  process.env.DATABASE_URL = databasePath;
  sqlite = new Database(databasePath);
  sqlite.exec(schemaSql);
  vi.resetModules();
  politiesRepositoryModule = await import("./polities");
});

afterAll(() => {
  sqlite.close();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

beforeEach(() => {
  sqlite.prepare("DELETE FROM event_polity_links").run();
  sqlite.prepare("DELETE FROM historical_period_polity_links").run();
  sqlite.prepare("DELETE FROM polity_transitions").run();
  sqlite.prepare("DELETE FROM dynasty_successions").run();
  sqlite.prepare("DELETE FROM dynasty_polity_links").run();
  sqlite.prepare("DELETE FROM polity_region_links").run();
  sqlite.prepare("DELETE FROM historical_period_category_links").run();
  sqlite.prepare("DELETE FROM historical_periods").run();
  sqlite.prepare("DELETE FROM dynasties").run();
  sqlite.prepare("DELETE FROM roles").run();
  sqlite.prepare("DELETE FROM polities").run();
  sqlite.prepare("DELETE FROM period_categories").run();
  sqlite.prepare("DELETE FROM polity_transition_types").run();
  sqlite.prepare("DELETE FROM era").run();
  sqlite.prepare("DELETE FROM sqlite_sequence").run();

  sqlite.prepare("INSERT INTO era (code, label) VALUES ('BCE', '紀元前'), ('CE', '西暦')").run();
  sqlite.prepare("INSERT INTO period_categories (id, name) VALUES (1, '日本史')").run();
  sqlite.prepare("INSERT INTO polity_transition_types (code, label) VALUES ('rename', '改称')").run();
  sqlite
    .prepare(
      "INSERT INTO polities (id, name) VALUES (1, '旧国家'), (2, '後継国家')"
    )
    .run();
  sqlite
    .prepare(
      "INSERT INTO dynasties (id, name) VALUES (1, '王朝A'), (2, '王朝B')"
    )
    .run();
  sqlite
    .prepare(
      "INSERT INTO roles (id, title) VALUES (1, '皇帝')"
    )
    .run();
  sqlite
    .prepare(
      "INSERT INTO historical_periods (id, name) VALUES (1, '古代')"
    )
    .run();
  sqlite
    .prepare(
      "INSERT INTO historical_period_category_links (period_id, category_id) VALUES (1, 1)"
    )
    .run();
  sqlite.prepare("INSERT INTO polity_region_links (polity_id, region_id) SELECT 1, 1 WHERE 0").run();
  sqlite.prepare("INSERT INTO dynasty_polity_links (dynasty_id, polity_id) VALUES (1, 1)").run();
  sqlite
    .prepare(
      "INSERT INTO dynasty_successions (polity_id, predecessor_dynasty_id, successor_dynasty_id) VALUES (1, 1, 2)"
    )
    .run();
  sqlite.prepare("INSERT INTO historical_period_polity_links (period_id, polity_id) VALUES (1, 1)").run();
  sqlite.prepare("INSERT INTO event_polity_links (event_id, polity_id) SELECT 1, 1 WHERE 0").run();
  sqlite
    .prepare(
      "INSERT INTO polity_transitions (predecessor_polity_id, successor_polity_id, transition_type) VALUES (1, 2, 'rename')"
    )
    .run();
});

describe("polities repository", () => {
  it("deletes a polity and all referencing links", () => {
    politiesRepositoryModule.deletePolity(1);

    const polityRows = sqlite.prepare("SELECT id FROM polities ORDER BY id").all() as Array<{ id: number }>;
    const dynastyPolityRows = sqlite.prepare("SELECT dynasty_id, polity_id FROM dynasty_polity_links").all();
    const dynastySuccessionRows = sqlite.prepare("SELECT id FROM dynasty_successions").all();
    const roleRows = sqlite.prepare("SELECT id FROM roles ORDER BY id").all();
    const periodPolityRows = sqlite.prepare("SELECT period_id, polity_id FROM historical_period_polity_links").all();
    const polityTransitionRows = sqlite.prepare("SELECT id FROM polity_transitions").all();

    expect(polityRows).toEqual([{ id: 2 }]);
    expect(dynastyPolityRows).toEqual([]);
    expect(dynastySuccessionRows).toEqual([]);
    expect(roleRows).toEqual([{ id: 1 }]);
    expect(periodPolityRows).toEqual([]);
    expect(polityTransitionRows).toEqual([]);
  });
});
