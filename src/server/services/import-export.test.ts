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
  sqlite.prepare("DELETE FROM dynasty_region_links").run();
  sqlite.prepare("DELETE FROM dynasty_polity_links").run();
  sqlite.prepare("DELETE FROM dynasties").run();
  sqlite.prepare("DELETE FROM polity_region_links").run();
  sqlite.prepare("DELETE FROM polities").run();
  sqlite.prepare("DELETE FROM religion_founder_links").run();
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
  it("exports polities csv with table columns only", () => {
    sqlite
      .prepare(
        "INSERT INTO polities (id, name, reading, description, note, from_calendar_era, from_year, from_is_approximate, to_calendar_era, to_year, to_is_approximate) VALUES (1, '日本', 'にほん', '国家の説明', '注記', 'BCE', 660, 1, 'CE', 1947, 0), (2, 'ローマ帝国', NULL, NULL, NULL, 'BCE', 27, 0, 'CE', 476, 0)"
      )
      .run();

    const csv = importExportModule.buildPolitiesCsv();

    expect(csv).toBe(
      [
        "id,name,reading,description,note,from_calendar_era,from_year,from_is_approximate,to_calendar_era,to_year,to_is_approximate",
        "2,ローマ帝国,,,,BCE,27,0,CE,476,0",
        "1,日本,にほん,国家の説明,注記,BCE,660,1,CE,1947,0"
      ].join("\n")
    );
  });

  it("exports dynasties csv with table columns only", () => {
    sqlite
      .prepare(
        "INSERT INTO dynasties (id, name, reading, description, note, from_calendar_era, from_year, from_is_approximate, to_calendar_era, to_year, to_is_approximate) VALUES (1, '漢', 'かん', '王朝の説明', '注記', 'BCE', 202, 0, 'CE', 220, 0), (2, '唐', NULL, NULL, NULL, 'CE', 618, 0, 'CE', 907, 1)"
      )
      .run();

    const csv = importExportModule.buildDynastiesCsv();

    expect(csv).toBe(
      [
        "id,name,reading,description,note,from_calendar_era,from_year,from_is_approximate,to_calendar_era,to_year,to_is_approximate",
        "2,唐,,,,CE,618,0,CE,907,1",
        "1,漢,かん,王朝の説明,注記,BCE,202,0,CE,220,0"
      ].join("\n")
    );
  });

  it("exports religions csv with table columns only", () => {
    sqlite.prepare("DELETE FROM sect_founder_links").run();
    sqlite.prepare("DELETE FROM sects").run();
    sqlite.prepare("DELETE FROM religions").run();
    sqlite
      .prepare(
        "INSERT INTO religions (id, name, reading, description, note, from_calendar_era, from_year, from_is_approximate, to_calendar_era, to_year, to_is_approximate) VALUES (1, '仏教', 'ぶっきょう', '宗教の説明', '注記', 'BCE', 500, 1, NULL, NULL, 0), (2, 'イスラム教', NULL, NULL, NULL, 'CE', 610, 0, 'CE', 632, 0)"
      )
      .run();

    const csv = importExportModule.buildReligionsCsv();

    expect(csv).toBe(
      [
        "id,name,reading,description,note,from_calendar_era,from_year,from_is_approximate,to_calendar_era,to_year,to_is_approximate",
        "2,イスラム教,,,,CE,610,0,CE,632,0",
        "1,仏教,ぶっきょう,宗教の説明,注記,BCE,500,1,,,0"
      ].join("\n")
    );
  });

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
