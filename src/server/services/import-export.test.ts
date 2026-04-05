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
  sqlite.prepare("DELETE FROM person_role_links").run();
  sqlite.prepare("DELETE FROM dynasty_region_links").run();
  sqlite.prepare("DELETE FROM dynasty_polity_links").run();
  sqlite.prepare("DELETE FROM dynasties").run();
  sqlite.prepare("DELETE FROM role_polity_links").run();
  sqlite.prepare("DELETE FROM roles").run();
  sqlite.prepare("DELETE FROM person_sect_links").run();
  sqlite.prepare("DELETE FROM person_religion_links").run();
  sqlite.prepare("DELETE FROM person_region_links").run();
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
  it("exports persons csv with table columns only", () => {
    sqlite
      .prepare(
        "UPDATE persons SET reading = 'くうかい', aliases = '弘法大師', description = '人物の説明', note = '注記', from_calendar_era = 'CE', from_year = 774, from_is_approximate = 0, to_calendar_era = 'CE', to_year = 835, to_is_approximate = 1 WHERE id = 2"
      )
      .run();
    sqlite
      .prepare(
        "UPDATE persons SET reading = NULL, aliases = NULL, description = NULL, note = NULL, from_calendar_era = 'CE', from_year = 767, from_is_approximate = 1, to_calendar_era = NULL, to_year = NULL, to_is_approximate = 0 WHERE id = 1"
      )
      .run();

    const csv = importExportModule.buildPersonsCsv();

    expect(csv).toBe(
      [
        "id,name,reading,aliases,description,note,from_calendar_era,from_year,from_is_approximate,to_calendar_era,to_year,to_is_approximate",
        "1,最澄,,,,,CE,767,1,,,0",
        "2,空海,くうかい,弘法大師,人物の説明,注記,CE,774,0,CE,835,1"
      ].join("\n")
    );
  });

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

  it("exports roles csv with linked polity names", () => {
    sqlite.prepare("INSERT INTO polities (id, name) VALUES (1, '日本'), (2, 'ローマ帝国')").run();
    sqlite
      .prepare(
        "INSERT INTO roles (id, title, reading, description, note) VALUES (1, '皇帝', 'こうてい', '最高位の君主', '注記'), (2, '執政官', NULL, NULL, NULL)"
      )
      .run();
    sqlite.prepare("INSERT INTO role_polity_links (role_id, polity_id) VALUES (1, 1), (1, 2), (2, 2)").run();

    const csv = importExportModule.buildRolesCsv();

    expect(csv).toBe(
      [
        "id,title,polities,reading,description,note",
        "2,執政官,ローマ帝国,,,",
        "1,皇帝,\"ローマ帝国, 日本\",こうてい,最高位の君主,注記"
      ].join("\n")
    );
  });

  it("exports dynasty polity links csv", () => {
    sqlite.prepare("INSERT INTO polities (id, name) VALUES (1, '漢帝国'), (2, '唐帝国')").run();
    sqlite.prepare("INSERT INTO dynasties (id, name) VALUES (1, '漢'), (2, '唐')").run();
    sqlite.prepare("INSERT INTO dynasty_polity_links (dynasty_id, polity_id) VALUES (1, 1), (2, 2)").run();

    const csv = importExportModule.buildDynastyPolityLinksCsv();

    expect(csv).toBe(
      [
        "dynasty_id,dynasty_name,polity_id,polity_name",
        "1,漢,1,漢帝国",
        "2,唐,2,唐帝国"
      ].join("\n")
    );
  });

  it("exports role polity links csv", () => {
    sqlite.prepare("INSERT INTO polities (id, name) VALUES (1, '日本'), (2, 'ローマ帝国')").run();
    sqlite.prepare("INSERT INTO roles (id, title) VALUES (1, '皇帝'), (2, '執政官')").run();
    sqlite.prepare("INSERT INTO role_polity_links (role_id, polity_id) VALUES (1, 1), (1, 2), (2, 2)").run();

    const csv = importExportModule.buildRolePolityLinksCsv();

    expect(csv).toBe(
      [
        "role_id,role_title,polity_id,polity_name",
        "1,皇帝,1,日本",
        "1,皇帝,2,ローマ帝国",
        "2,執政官,2,ローマ帝国"
      ].join("\n")
    );
  });

  it("exports polity region links csv", () => {
    sqlite.prepare("INSERT INTO polities (id, name) VALUES (1, '漢帝国'), (2, '唐帝国')").run();
    sqlite.prepare("INSERT INTO regions (id, name) VALUES (1, '中国'), (2, '東アジア')").run();
    sqlite.prepare("INSERT INTO polity_region_links (polity_id, region_id) VALUES (1, 1), (2, 2)").run();

    const csv = importExportModule.buildPolityRegionLinksCsv();

    expect(csv).toBe(
      [
        "polity_id,polity_name,region_id,region_name",
        "1,漢帝国,1,中国",
        "2,唐帝国,2,東アジア"
      ].join("\n")
    );
  });

  it("exports dynasty region links csv", () => {
    sqlite.prepare("INSERT INTO dynasties (id, name) VALUES (1, '漢'), (2, '唐')").run();
    sqlite.prepare("INSERT INTO regions (id, name) VALUES (3, '中国')").run();
    sqlite.prepare("INSERT INTO dynasty_region_links (dynasty_id, region_id) VALUES (1, 1), (2, 2)").run();

    const csv = importExportModule.buildDynastyRegionLinksCsv();

    expect(csv).toBe(
      [
        "dynasty_id,dynasty_name,region_id,region_name",
        "1,漢,1,中国",
        "2,唐,2,東アジア"
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
