import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type CsvSyncImportModule = typeof import("./csv-sync-import");

const schemaSql = fs.readFileSync(path.resolve(process.cwd(), "src/db/schema.sql"), "utf8");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "historia-csv-sync-import-"));
const databasePath = path.join(tempDir, "test.sqlite");

let sqlite: Database.Database;
let csvSyncImportModule: CsvSyncImportModule;

beforeAll(async () => {
  process.env.DATABASE_URL = databasePath;
  sqlite = new Database(databasePath);
  sqlite.exec(schemaSql);
  vi.resetModules();
  csvSyncImportModule = await import("./csv-sync-import");
});

afterAll(() => {
  sqlite.close();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

beforeEach(() => {
  sqlite.prepare("DELETE FROM religion_founder_links").run();
  sqlite.prepare("DELETE FROM religions").run();
  sqlite.prepare("DELETE FROM historical_period_category_links").run();
  sqlite.prepare("DELETE FROM historical_periods").run();
  sqlite.prepare("DELETE FROM persons").run();
  sqlite.prepare("DELETE FROM period_categories").run();
  sqlite.prepare("DELETE FROM era").run();
  sqlite.prepare("DELETE FROM sqlite_sequence").run();

  sqlite.prepare("INSERT INTO era (code, label) VALUES ('BCE', '紀元前'), ('CE', '西暦')").run();
  sqlite
    .prepare("INSERT INTO persons (id, name) VALUES (1, 'ムハンマド'), (2, 'ゴータマ・シッダールタ'), (3, 'イエス')")
    .run();
  sqlite.prepare("INSERT INTO period_categories (id, name) VALUES (1, '日本史'), (2, '東洋史'), (3, '西洋史')").run();
  sqlite
    .prepare(
      "INSERT INTO historical_periods (id, name) VALUES (1, '旧石器時代'), (2, '縄文時代'), (3, '弥生時代'), (4, '古代')"
    )
    .run();
  sqlite
    .prepare(
      "INSERT INTO historical_period_category_links (period_id, category_id) VALUES (1, 1), (2, 2), (4, 3)"
    )
    .run();
  sqlite
    .prepare(
      "INSERT INTO religions (id, name, description, from_calendar_era, from_year, from_is_approximate) VALUES (1, '仏教', 'old', 'BCE', 500, 1), (2, 'イスラム教', 'old', 'CE', 610, 0)"
    )
    .run();
  sqlite
    .prepare("INSERT INTO religion_founder_links (religion_id, person_id) VALUES (1, 2), (2, 1)")
    .run();
});

describe("csv sync import service", () => {
  it("syncs historical period category links by period_id", () => {
    const result = csvSyncImportModule.importCsvSync(
      "historical-period-category-links",
      [
        "category_id,category_name,period_id,period_name",
        "1,日本史,1,旧石器時代",
        "1,日本史,2,縄文時代",
        "2,東洋史,3,弥生時代"
      ].join("\n")
    );

    const rows = sqlite
      .prepare("SELECT period_id, category_id FROM historical_period_category_links ORDER BY period_id")
      .all() as Array<{ period_id: number; category_id: number }>;

    expect(result).toEqual({
      targetType: "historical-period-category-links",
      totalRows: 3,
      createdCount: 1,
      updatedCount: 2,
      deletedCount: 1
    });
    expect(rows).toEqual([
      { period_id: 1, category_id: 1 },
      { period_id: 2, category_id: 1 },
      { period_id: 3, category_id: 2 }
    ]);
  });

  it("rejects mismatched names in csv references", () => {
    expect(() =>
      csvSyncImportModule.importCsvSync(
        "historical-period-category-links",
        ["category_id,category_name,period_id,period_name", "1,東洋史,1,旧石器時代"].join("\n")
      )
    ).toThrow("row 2: category_id=1 の名称が一致しません");
  });

  it("syncs religions and founder links", () => {
    const result = csvSyncImportModule.importCsvSync(
      "religions",
      [
        "id,name,description,note,time_label,time_calendar_era,time_start_year,time_end_year,time_is_approximate,founders",
        "1,仏教,updated,,ca. 前500,BCE,500,,1,ゴータマ・シッダールタ",
        "2,イスラム教,updated,,610,CE,610,,0,ムハンマド",
        ",キリスト教,new,,ca. 1,CE,1,,1,イエス"
      ].join("\n")
    );

    const religionRows = sqlite
      .prepare(
        "SELECT id, name, description, from_calendar_era, from_year, to_year, from_is_approximate FROM religions ORDER BY id"
      )
      .all() as Array<{
      id: number;
      name: string;
      description: string | null;
      from_calendar_era: string | null;
      from_year: number | null;
      to_year: number | null;
      from_is_approximate: number;
    }>;
    const founderRows = sqlite
      .prepare("SELECT religion_id, person_id FROM religion_founder_links ORDER BY religion_id, person_id")
      .all() as Array<{ religion_id: number; person_id: number }>;

    expect(result).toEqual({
      targetType: "religions",
      totalRows: 3,
      createdCount: 1,
      updatedCount: 2,
      deletedCount: 0
    });
    expect(religionRows).toEqual([
      {
        id: 1,
        name: "仏教",
        description: "updated",
        from_calendar_era: "BCE",
        from_year: 500,
        to_year: null,
        from_is_approximate: 1
      },
      {
        id: 2,
        name: "イスラム教",
        description: "updated",
        from_calendar_era: "CE",
        from_year: 610,
        to_year: null,
        from_is_approximate: 0
      },
      {
        id: 3,
        name: "キリスト教",
        description: "new",
        from_calendar_era: "CE",
        from_year: 1,
        to_year: null,
        from_is_approximate: 1
      }
    ]);
    expect(founderRows).toEqual([
      { religion_id: 1, person_id: 2 },
      { religion_id: 2, person_id: 1 }
    ]);
  });

  it("deletes religions missing from csv", () => {
    sqlite.prepare("DELETE FROM religion_founder_links WHERE religion_id = 2").run();

    const result = csvSyncImportModule.importCsvSync(
      "religions",
      [
        "id,name,description,note,time_label,time_calendar_era,time_start_year,time_end_year,time_is_approximate,founders",
        "1,仏教,updated,,ca. 前500,BCE,500,,1,ゴータマ・シッダールタ"
      ].join("\n")
    );

    const religionRows = sqlite.prepare("SELECT id FROM religions ORDER BY id").all() as Array<{ id: number }>;
    const founderRows = sqlite
      .prepare("SELECT religion_id, person_id FROM religion_founder_links ORDER BY religion_id, person_id")
      .all() as Array<{ religion_id: number; person_id: number }>;

    expect(result).toEqual({
      targetType: "religions",
      totalRows: 1,
      createdCount: 0,
      updatedCount: 1,
      deletedCount: 1
    });
    expect(religionRows).toEqual([{ id: 1 }]);
    expect(founderRows).toEqual([{ religion_id: 1, person_id: 2 }]);
  });
});
