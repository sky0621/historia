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
  sqlite.prepare("DELETE FROM event_region_links").run();
  sqlite.prepare("DELETE FROM dynasty_region_links").run();
  sqlite.prepare("DELETE FROM dynasty_polity_links").run();
  sqlite.prepare("DELETE FROM dynasties").run();
  sqlite.prepare("DELETE FROM person_role_links").run();
  sqlite.prepare("DELETE FROM role_polity_links").run();
  sqlite.prepare("DELETE FROM roles").run();
  sqlite.prepare("DELETE FROM polity_region_links").run();
  sqlite.prepare("DELETE FROM polities").run();
  sqlite.prepare("DELETE FROM historical_period_region_links").run();
  sqlite.prepare("DELETE FROM person_region_links").run();
  sqlite.prepare("DELETE FROM regions").run();
  sqlite.prepare("DELETE FROM sect_founder_links").run();
  sqlite.prepare("DELETE FROM person_sect_links").run();
  sqlite.prepare("DELETE FROM sects").run();
  sqlite.prepare("DELETE FROM religion_founder_links").run();
  sqlite.prepare("DELETE FROM person_religion_links").run();
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
  sqlite
    .prepare(
      "INSERT INTO sects (id, name, religion_id, description, from_calendar_era, from_year, from_is_approximate) VALUES (1, '上座部仏教', 1, 'old', 'BCE', 300, 1), (2, 'スンナ派', 2, 'old', 'CE', 700, 0)"
    )
    .run();
  sqlite.prepare("INSERT INTO sect_founder_links (sect_id, person_id) VALUES (1, 2), (2, 1)").run();
  sqlite
    .prepare(
      "INSERT INTO regions (id, name, parent_region_id, description, note) VALUES (1, '日本', NULL, 'old root', NULL), (2, '近畿', 1, 'old child', 'old note'), (3, '削除対象', 1, 'obsolete', NULL)"
    )
    .run();
  sqlite
    .prepare(
      "INSERT INTO polities (id, name, reading, description, note, from_calendar_era, from_year, from_is_approximate) VALUES (1, '日本', 'にほん', 'old polity', 'old note', 'CE', 1, 0), (2, 'ローマ帝国', NULL, 'old rome', NULL, 'BCE', 27, 0)"
    )
    .run();
  sqlite.prepare("INSERT INTO polity_region_links (polity_id, region_id) VALUES (1, 1), (2, 2)").run();
  sqlite
    .prepare(
      "INSERT INTO dynasties (id, name, reading, description, note, from_calendar_era, from_year, from_is_approximate) VALUES (1, '漢', 'かん', 'old dynasty', 'old note', 'BCE', 202, 0), (2, '唐', NULL, 'old tang', NULL, 'CE', 618, 0)"
    )
    .run();
  sqlite.prepare("INSERT INTO dynasty_region_links (dynasty_id, region_id) VALUES (1, 1), (2, 2)").run();
  sqlite.prepare("INSERT INTO dynasty_polity_links (dynasty_id, polity_id) VALUES (1, 1), (2, 2)").run();
  sqlite
    .prepare(
      "INSERT INTO roles (id, title, reading, description, note) VALUES (1, '皇帝', 'こうてい', 'old role', 'old note'), (2, '執政官', NULL, 'old consul', NULL)"
    )
    .run();
  sqlite.prepare("INSERT INTO role_polity_links (role_id, polity_id) VALUES (1, 1), (2, 2)").run();
  sqlite.prepare("INSERT INTO person_role_links (person_id, role_id) VALUES (1, 1)").run();
});

describe("csv sync import service", () => {
  it("syncs persons using 人物.csv format and deletes related links for removed rows", () => {
    sqlite.prepare("INSERT INTO regions (id, name) VALUES (10, '東アジア')").run();
    sqlite.prepare("INSERT INTO religions (id, name) VALUES (10, '道教')").run();
    sqlite.prepare("INSERT INTO sects (id, name) VALUES (10, '全真教')").run();
    sqlite.prepare("INSERT INTO roles (id, title) VALUES (10, '太政大臣')").run();
    sqlite.prepare("INSERT INTO person_region_links (person_id, region_id) VALUES (3, 10)").run();
    sqlite.prepare("INSERT INTO person_religion_links (person_id, religion_id) VALUES (3, 10)").run();
    sqlite.prepare("INSERT INTO person_sect_links (person_id, sect_id) VALUES (3, 10)").run();
    sqlite.prepare("INSERT INTO person_role_links (person_id, role_id) VALUES (3, 10)").run();
    const result = csvSyncImportModule.importCsvSync(
      "persons",
      [
        "id,name,reading,aliases,description,note,from_calendar_era,from_year,from_is_approximate,to_calendar_era,to_year,to_is_approximate",
        "1,ムハンマド,むはんまど,預言者,updated person,,CE,570,0,CE,632,0",
        "2,ゴータマ・シッダールタ,,釈迦,updated buddha,,BCE,563,1,BCE,483,0",
        ",空海,くうかい,弘法大師,new person,,CE,774,0,CE,835,1"
      ].join("\n")
    );

    const personRows = sqlite
      .prepare(
        "SELECT id, name, reading, aliases, description, note, from_calendar_era, from_year, from_is_approximate, to_calendar_era, to_year, to_is_approximate FROM persons ORDER BY id"
      )
      .all() as Array<Record<string, unknown>>;
    const deletedRoleLinks = sqlite
      .prepare("SELECT person_id, role_id FROM person_role_links WHERE person_id = 3")
      .all();
    const deletedRegionLinks = sqlite
      .prepare("SELECT person_id, region_id FROM person_region_links WHERE person_id = 3")
      .all();
    const deletedReligionLinks = sqlite
      .prepare("SELECT person_id, religion_id FROM person_religion_links WHERE person_id = 3")
      .all();
    const deletedSectLinks = sqlite
      .prepare("SELECT person_id, sect_id FROM person_sect_links WHERE person_id = 3")
      .all();

    expect(result).toEqual({
      targetType: "persons",
      totalRows: 3,
      createdCount: 1,
      updatedCount: 2,
      deletedCount: 1
    });
    expect(personRows).toEqual([
      {
        id: 1,
        name: "ムハンマド",
        reading: "むはんまど",
        aliases: "預言者",
        description: "updated person",
        note: null,
        from_calendar_era: "CE",
        from_year: 570,
        from_is_approximate: 0,
        to_calendar_era: "CE",
        to_year: 632,
        to_is_approximate: 0
      },
      {
        id: 2,
        name: "ゴータマ・シッダールタ",
        reading: null,
        aliases: "釈迦",
        description: "updated buddha",
        note: null,
        from_calendar_era: "BCE",
        from_year: 563,
        from_is_approximate: 1,
        to_calendar_era: "BCE",
        to_year: 483,
        to_is_approximate: 0
      },
      {
        id: 4,
        name: "空海",
        reading: "くうかい",
        aliases: "弘法大師",
        description: "new person",
        note: null,
        from_calendar_era: "CE",
        from_year: 774,
        from_is_approximate: 0,
        to_calendar_era: "CE",
        to_year: 835,
        to_is_approximate: 1
      }
    ]);
    expect(deletedRoleLinks).toEqual([]);
    expect(deletedRegionLinks).toEqual([]);
    expect(deletedReligionLinks).toEqual([]);
    expect(deletedSectLinks).toEqual([]);
  });

  it("syncs regions and resolves parent_region by name", () => {
    const result = csvSyncImportModule.importCsvSync(
      "regions",
      [
        "id,name,parent_region,description,note",
        "1,日本,,updated root,",
        "2,近畿,日本,updated child,updated note",
        ",京都,近畿,new child,"
      ].join("\n")
    );

    const rows = sqlite
      .prepare("SELECT id, name, parent_region_id, description, note FROM regions ORDER BY id")
      .all() as Array<{
      id: number;
      name: string;
      parent_region_id: number | null;
      description: string | null;
      note: string | null;
    }>;

    expect(result).toEqual({
      targetType: "regions",
      totalRows: 3,
      createdCount: 1,
      updatedCount: 2,
      deletedCount: 1
    });
    expect(rows).toEqual([
      { id: 1, name: "日本", parent_region_id: null, description: "updated root", note: null },
      { id: 2, name: "近畿", parent_region_id: 1, description: "updated child", note: "updated note" },
      { id: 4, name: "京都", parent_region_id: 2, description: "new child", note: null }
    ]);
  });

  it("rejects unknown parent_region names in regions csv", () => {
    expect(() =>
      csvSyncImportModule.importCsvSync(
        "regions",
        ["id,name,parent_region,description,note", "1,日本,存在しない親,updated,"].join("\n")
      )
    ).toThrow('row 2: parent_region "存在しない親" が存在しません');
  });

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

  it("syncs polities using 国家.csv format without changing region links", () => {
    const result = csvSyncImportModule.importCsvSync(
      "polities",
      [
        "id,name,reading,description,note,from_calendar_era,from_year,from_is_approximate,to_calendar_era,to_year,to_is_approximate",
        "1,日本,にっぽん,updated polity,,CE,,0,CE,,0",
        "2,ローマ帝国,,updated rome,,BCE,27,0,CE,476,0",
        ",アケメネス朝ペルシア帝国,,new polity,,BCE,550,0,BCE,330,0"
      ].join("\n")
    );

    const polityRows = sqlite
      .prepare(
        "SELECT id, name, reading, description, note, from_calendar_era, from_year, from_is_approximate, to_calendar_era, to_year, to_is_approximate FROM polities ORDER BY id"
      )
      .all() as Array<{
      id: number;
      name: string;
      reading: string | null;
      description: string | null;
      note: string | null;
      from_calendar_era: string | null;
      from_year: number | null;
      from_is_approximate: number;
      to_calendar_era: string | null;
      to_year: number | null;
      to_is_approximate: number;
    }>;
    const regionLinkRows = sqlite
      .prepare("SELECT polity_id, region_id FROM polity_region_links ORDER BY polity_id, region_id")
      .all() as Array<{ polity_id: number; region_id: number }>;

    expect(result).toEqual({
      targetType: "polities",
      totalRows: 3,
      createdCount: 1,
      updatedCount: 2,
      deletedCount: 0
    });
    expect(polityRows).toEqual([
      {
        id: 1,
        name: "日本",
        reading: "にっぽん",
        description: "updated polity",
        note: null,
        from_calendar_era: "CE",
        from_year: null,
        from_is_approximate: 0,
        to_calendar_era: "CE",
        to_year: null,
        to_is_approximate: 0
      },
      {
        id: 2,
        name: "ローマ帝国",
        reading: null,
        description: "updated rome",
        note: null,
        from_calendar_era: "BCE",
        from_year: 27,
        from_is_approximate: 0,
        to_calendar_era: "CE",
        to_year: 476,
        to_is_approximate: 0
      },
      {
        id: 3,
        name: "アケメネス朝ペルシア帝国",
        reading: null,
        description: "new polity",
        note: null,
        from_calendar_era: "BCE",
        from_year: 550,
        from_is_approximate: 0,
        to_calendar_era: "BCE",
        to_year: 330,
        to_is_approximate: 0
      }
    ]);
    expect(regionLinkRows).toEqual([
      { polity_id: 1, region_id: 1 },
      { polity_id: 2, region_id: 2 }
    ]);
  });

  it("syncs dynasties using 王朝.csv format without changing region links", () => {
    const result = csvSyncImportModule.importCsvSync(
      "dynasties",
      [
        "id,name,reading,description,note,from_calendar_era,from_year,from_is_approximate,to_calendar_era,to_year,to_is_approximate",
        "1,漢,かん,updated dynasty,,BCE,202,0,CE,220,0",
        "2,唐,,updated tang,,CE,618,0,CE,907,1",
        ",宋,,new dynasty,,CE,960,0,CE,1279,0"
      ].join("\n")
    );

    const dynastyRows = sqlite
      .prepare(
        "SELECT id, name, reading, description, note, from_calendar_era, from_year, from_is_approximate, to_calendar_era, to_year, to_is_approximate FROM dynasties ORDER BY id"
      )
      .all() as Array<{
      id: number;
      name: string;
      reading: string | null;
      description: string | null;
      note: string | null;
      from_calendar_era: string | null;
      from_year: number | null;
      from_is_approximate: number;
      to_calendar_era: string | null;
      to_year: number | null;
      to_is_approximate: number;
    }>;
    const regionLinkRows = sqlite
      .prepare("SELECT dynasty_id, region_id FROM dynasty_region_links ORDER BY dynasty_id, region_id")
      .all() as Array<{ dynasty_id: number; region_id: number }>;

    expect(result).toEqual({
      targetType: "dynasties",
      totalRows: 3,
      createdCount: 1,
      updatedCount: 2,
      deletedCount: 0
    });
    expect(dynastyRows).toEqual([
      {
        id: 1,
        name: "漢",
        reading: "かん",
        description: "updated dynasty",
        note: null,
        from_calendar_era: "BCE",
        from_year: 202,
        from_is_approximate: 0,
        to_calendar_era: "CE",
        to_year: 220,
        to_is_approximate: 0
      },
      {
        id: 2,
        name: "唐",
        reading: null,
        description: "updated tang",
        note: null,
        from_calendar_era: "CE",
        from_year: 618,
        from_is_approximate: 0,
        to_calendar_era: "CE",
        to_year: 907,
        to_is_approximate: 1
      },
      {
        id: 3,
        name: "宋",
        reading: null,
        description: "new dynasty",
        note: null,
        from_calendar_era: "CE",
        from_year: 960,
        from_is_approximate: 0,
        to_calendar_era: "CE",
        to_year: 1279,
        to_is_approximate: 0
      }
    ]);
    expect(regionLinkRows).toEqual([
      { dynasty_id: 1, region_id: 1 },
      { dynasty_id: 2, region_id: 2 }
    ]);
  });

  it("syncs roles and linked polities by role id", () => {
    const result = csvSyncImportModule.importCsvSync(
      "roles",
      [
        "id,title,polities,reading,description,note",
        "1,皇帝,\"日本, ローマ帝国\",こうてい,updated role,",
        ",将軍,日本,しょうぐん,new role,new note"
      ].join("\n")
    );

    const roleRows = sqlite
      .prepare("SELECT id, title, reading, description, note FROM roles ORDER BY id")
      .all() as Array<{
      id: number;
      title: string;
      reading: string | null;
      description: string | null;
      note: string | null;
    }>;
    const rolePolityRows = sqlite
      .prepare("SELECT role_id, polity_id FROM role_polity_links ORDER BY role_id, polity_id")
      .all() as Array<{ role_id: number; polity_id: number }>;
    const personRoleRows = sqlite
      .prepare("SELECT person_id, role_id FROM person_role_links ORDER BY person_id, role_id")
      .all() as Array<{ person_id: number; role_id: number }>;

    expect(result).toEqual({
      targetType: "roles",
      totalRows: 2,
      createdCount: 1,
      updatedCount: 1,
      deletedCount: 1
    });
    expect(roleRows).toEqual([
      { id: 1, title: "皇帝", reading: "こうてい", description: "updated role", note: null },
      { id: 3, title: "将軍", reading: "しょうぐん", description: "new role", note: "new note" }
    ]);
    expect(rolePolityRows).toEqual([
      { role_id: 1, polity_id: 1 },
      { role_id: 1, polity_id: 2 },
      { role_id: 3, polity_id: 1 }
    ]);
    expect(personRoleRows).toEqual([{ person_id: 1, role_id: 1 }]);
  });

  it("syncs dynasty polity links by dynasty_id and polity_id", () => {
    const result = csvSyncImportModule.importCsvSync(
      "dynasty-polity-links",
      [
        "dynasty_id,dynasty_name,polity_id,polity_name",
        "1,漢,1,日本",
        "2,唐,1,日本"
      ].join("\n")
    );

    const rows = sqlite
      .prepare("SELECT dynasty_id, polity_id FROM dynasty_polity_links ORDER BY dynasty_id, polity_id")
      .all() as Array<{ dynasty_id: number; polity_id: number }>;

    expect(result).toEqual({
      targetType: "dynasty-polity-links",
      totalRows: 2,
      createdCount: 1,
      updatedCount: 1,
      deletedCount: 1
    });
    expect(rows).toEqual([
      { dynasty_id: 1, polity_id: 1 },
      { dynasty_id: 2, polity_id: 1 }
    ]);
  });

  it("syncs role polity links by role_id and polity_id", () => {
    const result = csvSyncImportModule.importCsvSync(
      "role-polity-links",
      [
        "role_id,role_title,polity_id,polity_name",
        "1,皇帝,1,日本",
        "1,皇帝,2,ローマ帝国"
      ].join("\n")
    );

    const rows = sqlite
      .prepare("SELECT role_id, polity_id FROM role_polity_links ORDER BY role_id, polity_id")
      .all() as Array<{ role_id: number; polity_id: number }>;

    expect(result).toEqual({
      targetType: "role-polity-links",
      totalRows: 2,
      createdCount: 1,
      updatedCount: 1,
      deletedCount: 1
    });
    expect(rows).toEqual([
      { role_id: 1, polity_id: 1 },
      { role_id: 1, polity_id: 2 }
    ]);
  });

  it("syncs person role links by person_id and role_id", () => {
    sqlite.prepare("INSERT INTO roles (id, title) VALUES (10, '太政大臣')").run();
    sqlite.prepare("INSERT INTO person_role_links (person_id, role_id, description) VALUES (2, 10, 'old link')").run();

    const result = csvSyncImportModule.importCsvSync(
      "person-role-links",
      [
        "person_id,person_name,role_id,role_title,description,note,from_calendar_era,from_year,from_is_approximate,to_calendar_era,to_year,to_is_approximate",
        "1,ムハンマド,1,皇帝,updated role link,,CE,610,0,CE,632,0",
        "2,ゴータマ・シッダールタ,1,皇帝,new shared role,shared note,BCE,500,1,,,0"
      ].join("\n")
    );

    const rows = sqlite
      .prepare(
        "SELECT person_id, role_id, description, note, from_calendar_era, from_year, from_is_approximate, to_calendar_era, to_year, to_is_approximate FROM person_role_links ORDER BY person_id, role_id"
      )
      .all() as Array<Record<string, unknown>>;

    expect(result).toEqual({
      targetType: "person-role-links",
      totalRows: 2,
      createdCount: 1,
      updatedCount: 1,
      deletedCount: 1
    });
    expect(rows).toEqual([
      {
        person_id: 1,
        role_id: 1,
        description: "updated role link",
        note: null,
        from_calendar_era: "CE",
        from_year: 610,
        from_is_approximate: 0,
        to_calendar_era: "CE",
        to_year: 632,
        to_is_approximate: 0
      },
      {
        person_id: 2,
        role_id: 1,
        description: "new shared role",
        note: "shared note",
        from_calendar_era: "BCE",
        from_year: 500,
        from_is_approximate: 1,
        to_calendar_era: null,
        to_year: null,
        to_is_approximate: 0
      }
    ]);
  });

  it("syncs person region links by person_id and region_id", () => {
    sqlite.prepare("INSERT INTO regions (id, name) VALUES (10, '東アジア')").run();
    sqlite.prepare("INSERT INTO person_region_links (person_id, region_id) VALUES (2, 10)").run();

    const result = csvSyncImportModule.importCsvSync(
      "person-region-links",
      [
        "person_id,person_name,region_id,region_name",
        "1,ムハンマド,1,日本",
        "2,ゴータマ・シッダールタ,1,日本"
      ].join("\n")
    );

    const rows = sqlite
      .prepare("SELECT person_id, region_id FROM person_region_links ORDER BY person_id, region_id")
      .all() as Array<{ person_id: number; region_id: number }>;

    expect(result).toEqual({
      targetType: "person-region-links",
      totalRows: 2,
      createdCount: 2,
      updatedCount: 0,
      deletedCount: 1
    });
    expect(rows).toEqual([
      { person_id: 1, region_id: 1 },
      { person_id: 2, region_id: 1 }
    ]);
  });

  it("syncs person religion links by person_id and religion_id", () => {
    sqlite.prepare("INSERT INTO person_religion_links (person_id, religion_id) VALUES (2, 2)").run();

    const result = csvSyncImportModule.importCsvSync(
      "person-religion-links",
      [
        "person_id,person_name,religion_id,religion_name",
        "1,ムハンマド,1,仏教",
        "2,ゴータマ・シッダールタ,1,仏教"
      ].join("\n")
    );

    const rows = sqlite
      .prepare("SELECT person_id, religion_id FROM person_religion_links ORDER BY person_id, religion_id")
      .all() as Array<{ person_id: number; religion_id: number }>;

    expect(result).toEqual({
      targetType: "person-religion-links",
      totalRows: 2,
      createdCount: 2,
      updatedCount: 0,
      deletedCount: 1
    });
    expect(rows).toEqual([
      { person_id: 1, religion_id: 1 },
      { person_id: 2, religion_id: 1 }
    ]);
  });

  it("syncs person sect links by person_id and sect_id", () => {
    sqlite.prepare("INSERT INTO person_sect_links (person_id, sect_id) VALUES (2, 2)").run();

    const result = csvSyncImportModule.importCsvSync(
      "person-sect-links",
      [
        "person_id,person_name,sect_id,sect_name",
        "1,ムハンマド,1,上座部仏教",
        "2,ゴータマ・シッダールタ,1,上座部仏教"
      ].join("\n")
    );

    const rows = sqlite
      .prepare("SELECT person_id, sect_id FROM person_sect_links ORDER BY person_id, sect_id")
      .all() as Array<{ person_id: number; sect_id: number }>;

    expect(result).toEqual({
      targetType: "person-sect-links",
      totalRows: 2,
      createdCount: 2,
      updatedCount: 0,
      deletedCount: 1
    });
    expect(rows).toEqual([
      { person_id: 1, sect_id: 1 },
      { person_id: 2, sect_id: 1 }
    ]);
  });

  it("syncs polity region links by polity_id and region_id", () => {
    const result = csvSyncImportModule.importCsvSync(
      "polity-region-links",
      [
        "polity_id,polity_name,region_id,region_name",
        "1,日本,1,日本",
        "2,ローマ帝国,1,日本"
      ].join("\n")
    );

    const rows = sqlite
      .prepare("SELECT polity_id, region_id FROM polity_region_links ORDER BY polity_id, region_id")
      .all() as Array<{ polity_id: number; region_id: number }>;

    expect(result).toEqual({
      targetType: "polity-region-links",
      totalRows: 2,
      createdCount: 1,
      updatedCount: 1,
      deletedCount: 1
    });
    expect(rows).toEqual([
      { polity_id: 1, region_id: 1 },
      { polity_id: 2, region_id: 1 }
    ]);
  });

  it("syncs dynasty region links by dynasty_id and region_id", () => {
    const result = csvSyncImportModule.importCsvSync(
      "dynasty-region-links",
      [
        "dynasty_id,dynasty_name,region_id,region_name",
        "1,漢,1,日本",
        "2,唐,1,日本"
      ].join("\n")
    );

    const rows = sqlite
      .prepare("SELECT dynasty_id, region_id FROM dynasty_region_links ORDER BY dynasty_id, region_id")
      .all() as Array<{ dynasty_id: number; region_id: number }>;

    expect(result).toEqual({
      targetType: "dynasty-region-links",
      totalRows: 2,
      createdCount: 1,
      updatedCount: 1,
      deletedCount: 1
    });
    expect(rows).toEqual([
      { dynasty_id: 1, region_id: 1 },
      { dynasty_id: 2, region_id: 1 }
    ]);
  });

  it("syncs religions and founder links", () => {
    const result = csvSyncImportModule.importCsvSync(
      "religions",
      [
        "id,name,reading,description,note,from_calendar_era,from_year,from_is_approximate,to_calendar_era,to_year,to_is_approximate",
        "1,仏教,ぶっきょう,updated,,BCE,500,1,,,0",
        "2,イスラム教,,updated,,CE,610,0,CE,632,0",
        ",キリスト教,,new,,CE,1,1,,,0"
      ].join("\n")
    );

    const religionRows = sqlite
      .prepare(
        "SELECT id, name, reading, description, from_calendar_era, from_year, to_calendar_era, to_year, from_is_approximate, to_is_approximate FROM religions ORDER BY id"
      )
      .all() as Array<{
      id: number;
      name: string;
      reading: string | null;
      description: string | null;
      from_calendar_era: string | null;
      from_year: number | null;
      to_calendar_era: string | null;
      to_year: number | null;
      from_is_approximate: number;
      to_is_approximate: number;
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
        reading: "ぶっきょう",
        description: "updated",
        from_calendar_era: "BCE",
        from_year: 500,
        to_calendar_era: null,
        to_year: null,
        from_is_approximate: 1,
        to_is_approximate: 0
      },
      {
        id: 2,
        name: "イスラム教",
        reading: null,
        description: "updated",
        from_calendar_era: "CE",
        from_year: 610,
        to_calendar_era: "CE",
        to_year: 632,
        from_is_approximate: 0,
        to_is_approximate: 0
      },
      {
        id: 3,
        name: "キリスト教",
        reading: null,
        description: "new",
        from_calendar_era: "CE",
        from_year: 1,
        to_calendar_era: null,
        to_year: null,
        from_is_approximate: 1,
        to_is_approximate: 0
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
        "id,name,reading,description,note,from_calendar_era,from_year,from_is_approximate,to_calendar_era,to_year,to_is_approximate",
        "1,仏教,ぶっきょう,updated,,BCE,500,1,,,0"
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

  it("syncs sects and related links", () => {
    sqlite
      .prepare("INSERT INTO religions (id, name, description, from_calendar_era, from_year, from_is_approximate) VALUES (3, 'キリスト教', 'old', 'CE', 1, 1)")
      .run();

    const result = csvSyncImportModule.importCsvSync(
      "sects",
      [
        "id,name,religion,reading,description,note,from_calendar_era,from_year,from_is_approximate,to_calendar_era,to_year,to_is_approximate",
        "1,上座部仏教,仏教,じょうざぶぶっきょう,updated,,BCE,300,1,,,0",
        "2,スンナ派,イスラム教,,updated,,CE,700,0,CE,900,0",
        ",カトリック,キリスト教,,new,,,,0,,,0",
        ",浄土真宗,仏教,,new child,,CE,1224,0,,,0"
      ].join("\n")
    );

    const sectRows = sqlite
      .prepare("SELECT id, name, religion_id, reading, description, from_calendar_era, from_year, from_is_approximate, to_calendar_era, to_year, to_is_approximate FROM sects ORDER BY id")
      .all() as Array<{
      id: number;
      name: string;
      religion_id: number | null;
      reading: string | null;
      description: string | null;
      from_calendar_era: string | null;
      from_year: number | null;
      from_is_approximate: number;
      to_calendar_era: string | null;
      to_year: number | null;
      to_is_approximate: number;
    }>;
    const founderRows = sqlite
      .prepare("SELECT sect_id, person_id FROM sect_founder_links ORDER BY sect_id, person_id")
      .all() as Array<{ sect_id: number; person_id: number }>;

    expect(result).toEqual({
      targetType: "sects",
      totalRows: 4,
      createdCount: 2,
      updatedCount: 2,
      deletedCount: 0
    });
    expect(sectRows).toEqual([
      { id: 1, name: "上座部仏教", religion_id: 1, reading: "じょうざぶぶっきょう", description: "updated", from_calendar_era: "BCE", from_year: 300, from_is_approximate: 1, to_calendar_era: null, to_year: null, to_is_approximate: 0 },
      { id: 2, name: "スンナ派", religion_id: 2, reading: null, description: "updated", from_calendar_era: "CE", from_year: 700, from_is_approximate: 0, to_calendar_era: "CE", to_year: 900, to_is_approximate: 0 },
      { id: 3, name: "カトリック", religion_id: 3, reading: null, description: "new", from_calendar_era: null, from_year: null, from_is_approximate: 0, to_calendar_era: null, to_year: null, to_is_approximate: 0 },
      { id: 4, name: "浄土真宗", religion_id: 1, reading: null, description: "new child", from_calendar_era: "CE", from_year: 1224, from_is_approximate: 0, to_calendar_era: null, to_year: null, to_is_approximate: 0 }
    ]);
    expect(founderRows).toEqual([
      { sect_id: 1, person_id: 2 },
      { sect_id: 2, person_id: 1 }
    ]);
  });

  it("deletes sects missing from csv", () => {
    sqlite
      .prepare("INSERT INTO religions (id, name, description, from_calendar_era, from_year, from_is_approximate) VALUES (3, 'キリスト教', 'old', 'CE', 1, 1)")
      .run();

    const result = csvSyncImportModule.importCsvSync(
      "sects",
      [
        "id,name,religion,reading,description,note,from_calendar_era,from_year,from_is_approximate,to_calendar_era,to_year,to_is_approximate",
        "1,上座部仏教,仏教,,updated,,BCE,300,1,,,0"
      ].join("\n")
    );

    const sectRows = sqlite.prepare("SELECT id FROM sects ORDER BY id").all() as Array<{ id: number }>;
    const sectReligionRows = sqlite.prepare("SELECT id, religion_id FROM sects ORDER BY id").all() as Array<{ id: number; religion_id: number | null }>;

    expect(result).toEqual({
      targetType: "sects",
      totalRows: 1,
      createdCount: 0,
      updatedCount: 1,
      deletedCount: 1
    });
    expect(sectRows).toEqual([{ id: 1 }]);
    expect(sectReligionRows).toEqual([{ id: 1, religion_id: 1 }]);
  });
});
