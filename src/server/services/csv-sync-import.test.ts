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
  sqlite.prepare("DELETE FROM historical_period_category_links").run();
  sqlite.prepare("DELETE FROM historical_periods").run();
  sqlite.prepare("DELETE FROM period_categories").run();

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
});
