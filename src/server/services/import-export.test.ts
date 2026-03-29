import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type ImportExportModule = typeof import("./import-export");

const schemaSql = fs.readFileSync(path.resolve(process.cwd(), "src/db/schema.sql"), "utf8");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "historia-import-export-"));
const databasePath = path.join(tempDir, "test.sqlite");

let sqlite: Database.Database;
let importExportModule: ImportExportModule;

beforeAll(async () => {
  process.env.DATABASE_URL = databasePath;
  sqlite = new Database(databasePath);
  sqlite.exec(schemaSql);
  vi.resetModules();
  importExportModule = await import("./import-export");
});

afterAll(() => {
  sqlite.close();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

beforeEach(() => {
  sqlite.prepare("DELETE FROM sect_founder_links").run();
  sqlite.prepare("DELETE FROM sects").run();
  sqlite.prepare("DELETE FROM religions").run();
  sqlite.prepare("DELETE FROM persons").run();
  sqlite.prepare("DELETE FROM era").run();
  sqlite.prepare("DELETE FROM sqlite_sequence").run();

  sqlite.prepare("INSERT INTO era (code, label) VALUES ('BCE', '紀元前'), ('CE', '西暦')").run();
  sqlite.prepare("INSERT INTO religions (id, name) VALUES (1, '仏教'), (2, 'イスラム教')").run();
  sqlite.prepare("INSERT INTO persons (id, name) VALUES (1, '最澄'), (2, '空海')").run();
  sqlite
    .prepare(
      "INSERT INTO sects (id, name, religion_id, reading, description, note, from_calendar_era, from_year, from_is_approximate, to_calendar_era, to_year, to_is_approximate) VALUES (1, '天台宗', 1, 'てんだいしゅう', '比叡山を中心とする宗派', '注記', 'CE', 805, 0, NULL, NULL, 0), (2, '真言宗', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, 0)"
    )
    .run();
  sqlite.prepare("INSERT INTO sect_founder_links (sect_id, person_id) VALUES (1, 1), (1, 2)").run();
});

describe("import export service", () => {
  it("exports sects csv using sects.religion_id", () => {
    const csv = importExportModule.buildSectsCsv();

    expect(csv).toBe(
      [
        "id,name,religion,reading,description,note,from_calendar_era,from_year,from_is_approximate,to_calendar_era,to_year,to_is_approximate",
        "1,天台宗,仏教,てんだいしゅう,比叡山を中心とする宗派,注記,CE,805,0,,,0",
        "2,真言宗,,,,,,,0,,,0"
      ].join("\n")
    );
  });
});
