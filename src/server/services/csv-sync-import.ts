import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  dynasties,
  dynastyPolityLinks,
  dynastyRegionLinks,
  eventRegionLinks,
  eventTagLinks,
  historicalPeriodCategoryLinks,
  historicalPeriodPolityLinks,
  historicalPeriodRegionLinks,
  historicalPeriods,
  periodCategories,
  persons,
  personRegionLinks,
  personRoleLinks,
  personReligionLinks,
  personSectLinks,
  polities,
  polityRegionLinks,
  polityTagLinks,
  religions,
  regions,
  role,
  rolePolityLinks,
  sectFounderLinks,
  sects,
  tags
} from "@/db/schema";

export const csvSyncImportTargets = [
  "persons",
  "regions",
  "polities",
  "dynasties",
  "dynasty-polity-links",
  "role-polity-links",
  "person-role-links",
  "person-region-links",
  "person-religion-links",
  "person-sect-links",
  "polity-region-links",
  "polity-tag-links",
  "dynasty-region-links",
  "roles",
  "period-categories",
  "tags",
  "historical-periods",
  "historical-period-category-links",
  "religions",
  "sects"
] as const;

export type CsvSyncImportTarget = (typeof csvSyncImportTargets)[number];

export type CsvSyncImportResult = {
  targetType: CsvSyncImportTarget;
  totalRows: number;
  createdCount: number;
  updatedCount: number;
  deletedCount: number;
};

type ParsedCsvDocument = {
  headers: string[];
  rows: Array<{
    rowNumber: number;
    values: string[];
  }>;
};

type CsvCells = Record<string, string>;

export function importCsvSync(targetType: CsvSyncImportTarget, rawCsv: string): CsvSyncImportResult {
  switch (targetType) {
    case "persons":
      return importPersonsCsv(rawCsv);
    case "regions":
      return importRegionsCsv(rawCsv);
    case "period-categories":
      return importPeriodCategoriesCsv(rawCsv);
    case "tags":
      return importTagsCsv(rawCsv);
    case "historical-periods":
      return importHistoricalPeriodsCsv(rawCsv);
    case "historical-period-category-links":
      return importHistoricalPeriodCategoryLinksCsv(rawCsv);
    case "religions":
      return importReligionsCsv(rawCsv);
    case "sects":
      return importSectsCsv(rawCsv);
    case "polities":
      return importPolitiesCsv(rawCsv);
    case "dynasties":
      return importDynastiesCsv(rawCsv);
    case "dynasty-polity-links":
      return importDynastyPolityLinksCsv(rawCsv);
    case "role-polity-links":
      return importRolePolityLinksCsv(rawCsv);
    case "person-role-links":
      return importPersonRoleLinksCsv(rawCsv);
    case "person-region-links":
      return importPersonRegionLinksCsv(rawCsv);
    case "person-religion-links":
      return importPersonReligionLinksCsv(rawCsv);
    case "person-sect-links":
      return importPersonSectLinksCsv(rawCsv);
    case "polity-region-links":
      return importPolityRegionLinksCsv(rawCsv);
    case "polity-tag-links":
      return importPolityTagLinksCsv(rawCsv);
    case "dynasty-region-links":
      return importDynastyRegionLinksCsv(rawCsv);
    case "roles":
      return importRolesCsv(rawCsv);
  }
}

function importPersonsCsv(rawCsv: string): CsvSyncImportResult {
  const parsed = parseCsv(rawCsv);
  assertHeaders(parsed.headers, [
    "id",
    "name",
    "reading",
    "aliases",
    "description",
    "note",
    "from_calendar_era",
    "from_year",
    "from_is_approximate",
    "to_calendar_era",
    "to_year",
    "to_is_approximate"
  ]);

  return db.transaction((tx) => {
    const existingItems = tx.select().from(persons).all();
    const existingIds = new Set(existingItems.map((item) => item.id));
    const csvIds = new Set<number>();
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of parsed.rows) {
      const cells = toCells(parsed.headers, row.values);
      const id = parseOptionalId(cells.id, row.rowNumber);

      const values = {
        name: parseRequiredString(cells.name, "name", row.rowNumber),
        reading: nullable(cells.reading),
        aliases: nullable(cells.aliases),
        description: nullable(cells.description),
        note: nullable(cells.note),
        fromCalendarEra: parseOptionalEra(cells.from_calendar_era, row.rowNumber, "from_calendar_era"),
        fromYear: parseOptionalInteger(cells.from_year, row.rowNumber, "from_year"),
        fromIsApproximate: parseBooleanFlag(cells.from_is_approximate),
        toCalendarEra: parseOptionalEra(cells.to_calendar_era, row.rowNumber, "to_calendar_era"),
        toYear: parseOptionalInteger(cells.to_year, row.rowNumber, "to_year"),
        toIsApproximate: parseBooleanFlag(cells.to_is_approximate)
      };

      if (id == null) {
        tx.insert(persons).values(values).run();
        createdCount += 1;
        continue;
      }

      assertUniqueCsvId(csvIds, id, row.rowNumber);
      if (!existingIds.has(id)) {
        tx.insert(persons).values({ id, ...values }).run();
        createdCount += 1;
        continue;
      }

      tx.update(persons).set(values).where(eq(persons.id, id)).run();
      updatedCount += 1;
    }

    const deletedIds = existingItems.map((item) => item.id).filter((id) => !csvIds.has(id));
    for (const id of deletedIds) {
      tx.delete(personRoleLinks).where(eq(personRoleLinks.personId, id)).run();
      tx.delete(personRegionLinks).where(eq(personRegionLinks.personId, id)).run();
      tx.delete(personReligionLinks).where(eq(personReligionLinks.personId, id)).run();
      tx.delete(personSectLinks).where(eq(personSectLinks.personId, id)).run();
      tx.delete(persons).where(eq(persons.id, id)).run();
    }

    return {
      targetType: "persons" as const,
      totalRows: parsed.rows.length,
      createdCount,
      updatedCount,
      deletedCount: deletedIds.length
    };
  });
}

function importRegionsCsv(rawCsv: string): CsvSyncImportResult {
  const parsed = parseCsv(rawCsv);
  assertHeaders(parsed.headers, ["id", "name", "parent_region", "description", "note"]);

  return db.transaction((tx) => {
    const existingItems = tx.select().from(regions).all();
    const existingIds = new Set(existingItems.map((item) => item.id));
    const csvIds = new Set<number>();
    const regionIdByName = new Map<string, number>();
    const pendingParentByRegionId = new Map<number, { parentRegionName: string; rowNumber: number }>();
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of parsed.rows) {
      const cells = toCells(parsed.headers, row.values);
      const id = parseOptionalId(cells.id, row.rowNumber);
      const name = parseRequiredString(cells.name, "name", row.rowNumber);
      const values = {
        name,
        parentRegionId: null,
        description: nullable(cells.description),
        note: nullable(cells.note)
      };

      let regionId: number;
      if (id == null) {
        const result = tx.insert(regions).values(values).run();
        regionId = Number(result.lastInsertRowid);
        createdCount += 1;
      } else if (existingIds.has(id)) {
        assertUniqueCsvId(csvIds, id, row.rowNumber);
        tx.update(regions).set(values).where(eq(regions.id, id)).run();
        regionId = id;
        updatedCount += 1;
      } else {
        assertUniqueCsvId(csvIds, id, row.rowNumber);
        tx.insert(regions).values({ id, ...values }).run();
        regionId = id;
        createdCount += 1;
      }

      if (regionIdByName.has(name)) {
        throw new Error(`row ${row.rowNumber}: name "${name}" が CSV 内で重複しています`);
      }
      regionIdByName.set(name, regionId);

      const parentRegionName = nullable(cells.parent_region);
      if (parentRegionName) {
        pendingParentByRegionId.set(regionId, { parentRegionName, rowNumber: row.rowNumber });
      }
    }

    for (const [regionId, pendingParent] of pendingParentByRegionId.entries()) {
      const parentRegionId = regionIdByName.get(pendingParent.parentRegionName);
      if (!parentRegionId) {
        throw new Error(`row ${pendingParent.rowNumber}: parent_region "${pendingParent.parentRegionName}" が存在しません`);
      }
      if (parentRegionId === regionId) {
        throw new Error(`row ${pendingParent.rowNumber}: parent_region に自分自身は指定できません`);
      }

      tx.update(regions).set({ parentRegionId }).where(eq(regions.id, regionId)).run();
    }

    const deletedIds = existingItems.map((item) => item.id).filter((id) => !csvIds.has(id));
    for (const id of deletedIds) {
      tx.delete(personRegionLinks).where(eq(personRegionLinks.regionId, id)).run();
      tx.delete(historicalPeriodRegionLinks).where(eq(historicalPeriodRegionLinks.regionId, id)).run();
      tx.delete(polityRegionLinks).where(eq(polityRegionLinks.regionId, id)).run();
      tx.delete(dynastyRegionLinks).where(eq(dynastyRegionLinks.regionId, id)).run();
      tx.delete(eventRegionLinks).where(eq(eventRegionLinks.regionId, id)).run();
      tx.update(regions).set({ parentRegionId: null }).where(eq(regions.parentRegionId, id)).run();
      tx.delete(regions).where(eq(regions.id, id)).run();
    }

    return {
      targetType: "regions" as const,
      totalRows: parsed.rows.length,
      createdCount,
      updatedCount,
      deletedCount: deletedIds.length
    };
  });
}

function importPeriodCategoriesCsv(rawCsv: string): CsvSyncImportResult {
  const parsed = parseCsv(rawCsv);
  assertHeaders(parsed.headers, ["id", "name", "reading", "description"]);

  return db.transaction((tx) => {
    const existingItems = tx.select().from(periodCategories).all();
    const existingIds = new Set(existingItems.map((item) => item.id));
    const csvIds = new Set<number>();
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of parsed.rows) {
      const cells = toCells(parsed.headers, row.values);
      const id = parseOptionalId(cells.id, row.rowNumber);
      const name = parseRequiredString(cells.name, "name", row.rowNumber);
      const reading = nullable(cells.reading);
      const description = nullable(cells.description);

      if (id == null) {
        tx.insert(periodCategories).values({ name, reading, description }).run();
        createdCount += 1;
        continue;
      }

      assertUniqueCsvId(csvIds, id, row.rowNumber);
      if (!existingIds.has(id)) {
        throw new Error(`row ${row.rowNumber}: id=${id} の時代区分カテゴリは存在しません`);
      }

      tx.update(periodCategories).set({ name, reading, description }).where(eq(periodCategories.id, id)).run();
      updatedCount += 1;
    }

    const deletedIds = existingItems.map((item) => item.id).filter((id) => !csvIds.has(id));
    for (const id of deletedIds) {
      tx.delete(periodCategories).where(eq(periodCategories.id, id)).run();
    }

    return {
      targetType: "period-categories" as const,
      totalRows: parsed.rows.length,
      createdCount,
      updatedCount,
      deletedCount: deletedIds.length
    };
  });
}

function importTagsCsv(rawCsv: string): CsvSyncImportResult {
  const parsed = parseCsv(rawCsv);
  assertHeaders(parsed.headers, ["id", "name", "reading"]);

  return db.transaction((tx) => {
    const existingItems = tx.select().from(tags).all();
    const existingIds = new Set(existingItems.map((item) => item.id));
    const csvIds = new Set<number>();
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of parsed.rows) {
      const cells = toCells(parsed.headers, row.values);
      const id = parseOptionalId(cells.id, row.rowNumber);

      const values = {
        name: parseRequiredString(cells.name, "name", row.rowNumber),
        reading: nullable(cells.reading)
      };

      if (id == null) {
        tx.insert(tags).values(values).run();
        createdCount += 1;
        continue;
      }

      assertUniqueCsvId(csvIds, id, row.rowNumber);
      if (!existingIds.has(id)) {
        tx.insert(tags).values({ id, ...values }).run();
        createdCount += 1;
        continue;
      }

      tx.update(tags).set(values).where(eq(tags.id, id)).run();
      updatedCount += 1;
    }

    const deletedIds = existingItems.map((item) => item.id).filter((id) => !csvIds.has(id));
    for (const id of deletedIds) {
      tx.delete(eventTagLinks).where(eq(eventTagLinks.tagId, id)).run();
      tx.delete(polityTagLinks).where(eq(polityTagLinks.tagId, id)).run();
      tx.delete(tags).where(eq(tags.id, id)).run();
    }

    return {
      targetType: "tags" as const,
      totalRows: parsed.rows.length,
      createdCount,
      updatedCount,
      deletedCount: deletedIds.length
    };
  });
}

function importPolitiesCsv(rawCsv: string): CsvSyncImportResult {
  const parsed = parseCsv(rawCsv);
  assertHeaders(parsed.headers, [
    "id",
    "name",
    "reading",
    "description",
    "note",
    "from_calendar_era",
    "from_year",
    "from_is_approximate",
    "to_calendar_era",
    "to_year",
    "to_is_approximate"
  ]);

  return db.transaction((tx) => {
    const existingItems = tx.select().from(polities).all();
    const existingIds = new Set(existingItems.map((item) => item.id));
    const csvIds = new Set<number>();
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of parsed.rows) {
      const cells = toCells(parsed.headers, row.values);
      const id = parseOptionalId(cells.id, row.rowNumber);

      const values = {
        name: parseRequiredString(cells.name, "name", row.rowNumber),
        reading: nullable(cells.reading),
        description: nullable(cells.description),
        note: nullable(cells.note),
        fromCalendarEra: parseOptionalEra(cells.from_calendar_era, row.rowNumber, "from_calendar_era"),
        fromYear: parseOptionalInteger(cells.from_year, row.rowNumber, "from_year"),
        fromIsApproximate: parseBooleanFlag(cells.from_is_approximate),
        toCalendarEra: parseOptionalEra(cells.to_calendar_era, row.rowNumber, "to_calendar_era"),
        toYear: parseOptionalInteger(cells.to_year, row.rowNumber, "to_year"),
        toIsApproximate: parseBooleanFlag(cells.to_is_approximate)
      };

      if (id == null) {
        tx.insert(polities).values(values).run();
        createdCount += 1;
        continue;
      }

      assertUniqueCsvId(csvIds, id, row.rowNumber);
      if (!existingIds.has(id)) {
        throw new Error(`row ${row.rowNumber}: id=${id} の国家は存在しません`);
      }

      tx.update(polities).set(values).where(eq(polities.id, id)).run();
      updatedCount += 1;
    }

    const deletedIds = existingItems.map((item) => item.id).filter((id) => !csvIds.has(id));
    for (const id of deletedIds) {
      tx.delete(polityRegionLinks).where(eq(polityRegionLinks.polityId, id)).run();
      tx.delete(polityTagLinks).where(eq(polityTagLinks.polityId, id)).run();
      tx.delete(polities).where(eq(polities.id, id)).run();
    }

    return {
      targetType: "polities" as const,
      totalRows: parsed.rows.length,
      createdCount,
      updatedCount,
      deletedCount: deletedIds.length
    };
  });
}

function importDynastiesCsv(rawCsv: string): CsvSyncImportResult {
  const parsed = parseCsv(rawCsv);
  assertHeaders(parsed.headers, [
    "id",
    "name",
    "reading",
    "description",
    "note",
    "from_calendar_era",
    "from_year",
    "from_is_approximate",
    "to_calendar_era",
    "to_year",
    "to_is_approximate"
  ]);

  return db.transaction((tx) => {
    const existingItems = tx.select().from(dynasties).all();
    const existingIds = new Set(existingItems.map((item) => item.id));
    const csvIds = new Set<number>();
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of parsed.rows) {
      const cells = toCells(parsed.headers, row.values);
      const id = parseOptionalId(cells.id, row.rowNumber);

      const values = {
        name: parseRequiredString(cells.name, "name", row.rowNumber),
        reading: nullable(cells.reading),
        description: nullable(cells.description),
        note: nullable(cells.note),
        fromCalendarEra: parseOptionalEra(cells.from_calendar_era, row.rowNumber, "from_calendar_era"),
        fromYear: parseOptionalInteger(cells.from_year, row.rowNumber, "from_year"),
        fromIsApproximate: parseBooleanFlag(cells.from_is_approximate),
        toCalendarEra: parseOptionalEra(cells.to_calendar_era, row.rowNumber, "to_calendar_era"),
        toYear: parseOptionalInteger(cells.to_year, row.rowNumber, "to_year"),
        toIsApproximate: parseBooleanFlag(cells.to_is_approximate)
      };

      if (id == null) {
        tx.insert(dynasties).values(values).run();
        createdCount += 1;
        continue;
      }

      assertUniqueCsvId(csvIds, id, row.rowNumber);
      if (!existingIds.has(id)) {
        throw new Error(`row ${row.rowNumber}: id=${id} の王朝は存在しません`);
      }

      tx.update(dynasties).set(values).where(eq(dynasties.id, id)).run();
      updatedCount += 1;
    }

    const deletedIds = existingItems.map((item) => item.id).filter((id) => !csvIds.has(id));
    for (const id of deletedIds) {
      tx.delete(dynastyPolityLinks).where(eq(dynastyPolityLinks.dynastyId, id)).run();
      tx.delete(dynastyRegionLinks).where(eq(dynastyRegionLinks.dynastyId, id)).run();
      tx.delete(dynasties).where(eq(dynasties.id, id)).run();
    }

    return {
      targetType: "dynasties" as const,
      totalRows: parsed.rows.length,
      createdCount,
      updatedCount,
      deletedCount: deletedIds.length
    };
  });
}

function importRolesCsv(rawCsv: string): CsvSyncImportResult {
  const parsed = parseCsv(rawCsv);
  assertHeaders(parsed.headers, ["id", "title", "polities", "reading", "description", "note"]);

  return db.transaction((tx) => {
    const existingItems = tx.select().from(role).all();
    const existingIds = new Set(existingItems.map((item) => item.id));
    const polityOptions = tx.select().from(polities).all();
    const polityIdByName = new Map(polityOptions.map((item) => [item.name, item.id]));
    const csvIds = new Set<number>();
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of parsed.rows) {
      const cells = toCells(parsed.headers, row.values);
      const id = parseOptionalId(cells.id, row.rowNumber);
      const polityIds = parseReferenceNames(cells.polities).map((name) => {
        const polityId = polityIdByName.get(name);
        if (!polityId) {
          throw new Error(`row ${row.rowNumber}: polity "${name}" が存在しません`);
        }
        return polityId;
      });

      const values = {
        title: parseRequiredString(cells.title, "title", row.rowNumber),
        reading: nullable(cells.reading),
        description: nullable(cells.description),
        note: nullable(cells.note)
      };

      let roleId: number;
      if (id == null) {
        const result = tx.insert(role).values(values).run();
        roleId = Number(result.lastInsertRowid);
        createdCount += 1;
      } else if (existingIds.has(id)) {
        assertUniqueCsvId(csvIds, id, row.rowNumber);
        tx.update(role).set(values).where(eq(role.id, id)).run();
        roleId = id;
        updatedCount += 1;
      } else {
        assertUniqueCsvId(csvIds, id, row.rowNumber);
        tx.insert(role).values({ id, ...values }).run();
        roleId = id;
        createdCount += 1;
      }

      tx.delete(rolePolityLinks).where(eq(rolePolityLinks.roleId, roleId)).run();
      if (polityIds.length > 0) {
        tx.insert(rolePolityLinks).values(polityIds.map((polityId) => ({ roleId, polityId }))).run();
      }
    }

    const deletedIds = existingItems.map((item) => item.id).filter((id) => !csvIds.has(id));
    for (const id of deletedIds) {
      tx.delete(personRoleLinks).where(eq(personRoleLinks.roleId, id)).run();
      tx.delete(rolePolityLinks).where(eq(rolePolityLinks.roleId, id)).run();
      tx.delete(role).where(eq(role.id, id)).run();
    }

    return {
      targetType: "roles" as const,
      totalRows: parsed.rows.length,
      createdCount,
      updatedCount,
      deletedCount: deletedIds.length
    };
  });
}

function importHistoricalPeriodsCsv(rawCsv: string): CsvSyncImportResult {
  const parsed = parseCsv(rawCsv);
  assertHeaders(parsed.headers, [
    "id",
    "name",
    "category",
    "polity",
    "description",
    "note",
    "time_calendar_era",
    "time_start_year",
    "time_end_year",
    "time_is_approximate",
    "regions"
  ]);

  return db.transaction((tx) => {
    const existingItems = tx.select().from(historicalPeriods).all();
    const existingIds = new Set(existingItems.map((item) => item.id));
    const categoryOptions = tx.select().from(periodCategories).all();
    const polityOptions = tx.select().from(polities).all();
    const regionOptions = tx.select().from(regions).all();
    const categoryIdByName = new Map(categoryOptions.map((item) => [item.name, item.id]));
    const polityIdByName = new Map(polityOptions.map((item) => [item.name, item.id]));
    const regionIdByName = new Map(regionOptions.map((item) => [item.name, item.id]));
    const csvIds = new Set<number>();
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of parsed.rows) {
      const cells = toCells(parsed.headers, row.values);
      const id = parseOptionalId(cells.id, row.rowNumber);
      const categoryName = parseRequiredString(cells.category, "category", row.rowNumber);
      const categoryId = categoryIdByName.get(categoryName);
      if (!categoryId) {
        throw new Error(`row ${row.rowNumber}: category "${categoryName}" が存在しません`);
      }

      const polityName = nullable(cells.polity);
      const polityId = polityName ? polityIdByName.get(polityName) ?? failReference("polity", polityName, row.rowNumber) : null;
      const regionIds = parseReferenceNames(cells.regions).map((name) => {
        const regionId = regionIdByName.get(name);
        if (!regionId) {
          throw new Error(`row ${row.rowNumber}: region "${name}" が存在しません`);
        }
        return regionId;
      });

      const timeCalendarEra = parseOptionalEra(cells.time_calendar_era, row.rowNumber, "time_calendar_era");
      const timeStartYear = parseOptionalInteger(cells.time_start_year, row.rowNumber, "time_start_year");
      const timeEndYear = parseOptionalInteger(cells.time_end_year, row.rowNumber, "time_end_year");
      const timeIsApproximate = parseBooleanFlag(cells.time_is_approximate);

      const values = {
        name: parseRequiredString(cells.name, "name", row.rowNumber),
        description: nullable(cells.description),
        note: nullable(cells.note),
        fromCalendarEra: timeCalendarEra,
        fromYear: timeStartYear,
        fromIsApproximate: timeIsApproximate,
        toCalendarEra: timeEndYear == null ? null : timeCalendarEra,
        toYear: timeEndYear,
        toIsApproximate: timeEndYear == null ? false : timeIsApproximate
      };

      if (id == null) {
        const result = tx.insert(historicalPeriods).values(values).run();
        const periodId = Number(result.lastInsertRowid);
        replaceHistoricalPeriodLinks(tx, periodId, categoryId, polityId, regionIds);
        createdCount += 1;
        continue;
      }

      assertUniqueCsvId(csvIds, id, row.rowNumber);
      if (!existingIds.has(id)) {
        throw new Error(`row ${row.rowNumber}: id=${id} の時代区分は存在しません`);
      }

      tx.update(historicalPeriods).set(values).where(eq(historicalPeriods.id, id)).run();
      replaceHistoricalPeriodLinks(tx, id, categoryId, polityId, regionIds);
      updatedCount += 1;
    }

    const deletedIds = existingItems.map((item) => item.id).filter((id) => !csvIds.has(id));
    for (const id of deletedIds) {
      tx.delete(historicalPeriodCategoryLinks).where(eq(historicalPeriodCategoryLinks.periodId, id)).run();
      tx.delete(historicalPeriodPolityLinks).where(eq(historicalPeriodPolityLinks.periodId, id)).run();
      tx.delete(historicalPeriodRegionLinks).where(eq(historicalPeriodRegionLinks.periodId, id)).run();
      tx.delete(historicalPeriods).where(eq(historicalPeriods.id, id)).run();
    }

    return {
      targetType: "historical-periods" as const,
      totalRows: parsed.rows.length,
      createdCount,
      updatedCount,
      deletedCount: deletedIds.length
    };
  });
}

function importHistoricalPeriodCategoryLinksCsv(rawCsv: string): CsvSyncImportResult {
  const parsed = parseCsv(rawCsv);
  assertHeaders(parsed.headers, ["category_id", "category_name", "period_id", "period_name"]);

  return db.transaction((tx) => {
    const existingLinks = tx.select().from(historicalPeriodCategoryLinks).all();
    const categoryOptions = tx.select().from(periodCategories).all();
    const periodOptions = tx.select().from(historicalPeriods).all();
    const categoryNameById = new Map(categoryOptions.map((item) => [item.id, item.name]));
    const periodNameById = new Map(periodOptions.map((item) => [item.id, item.name]));
    const existingCategoryIdByPeriodId = new Map(existingLinks.map((item) => [item.periodId, item.categoryId]));
    const csvPeriodIds = new Set<number>();
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of parsed.rows) {
      const cells = toCells(parsed.headers, row.values);
      const categoryId = parseRequiredId(cells.category_id, row.rowNumber, "category_id");
      const categoryName = parseRequiredString(cells.category_name, "category_name", row.rowNumber);
      const periodId = parseRequiredId(cells.period_id, row.rowNumber, "period_id");
      const periodName = parseRequiredString(cells.period_name, "period_name", row.rowNumber);

      assertUniqueCsvId(csvPeriodIds, periodId, row.rowNumber);

      const actualCategoryName = categoryNameById.get(categoryId);
      if (!actualCategoryName) {
        throw new Error(`row ${row.rowNumber}: category_id=${categoryId} のカテゴリは存在しません`);
      }
      if (actualCategoryName !== categoryName) {
        throw new Error(`row ${row.rowNumber}: category_id=${categoryId} の名称が一致しません`);
      }

      const actualPeriodName = periodNameById.get(periodId);
      if (!actualPeriodName) {
        throw new Error(`row ${row.rowNumber}: period_id=${periodId} の時代区分は存在しません`);
      }
      if (actualPeriodName !== periodName) {
        throw new Error(`row ${row.rowNumber}: period_id=${periodId} の名称が一致しません`);
      }

      const existingCategoryId = existingCategoryIdByPeriodId.get(periodId);
      if (existingCategoryId == null) {
        tx.insert(historicalPeriodCategoryLinks).values({ periodId, categoryId }).run();
        createdCount += 1;
        continue;
      }

      tx
        .update(historicalPeriodCategoryLinks)
        .set({ categoryId })
        .where(eq(historicalPeriodCategoryLinks.periodId, periodId))
        .run();
      updatedCount += 1;
    }

    const deletedPeriodIds = Array.from(existingCategoryIdByPeriodId.keys()).filter((periodId) => !csvPeriodIds.has(periodId));
    for (const periodId of deletedPeriodIds) {
      tx.delete(historicalPeriodCategoryLinks).where(eq(historicalPeriodCategoryLinks.periodId, periodId)).run();
    }

    return {
      targetType: "historical-period-category-links" as const,
      totalRows: parsed.rows.length,
      createdCount,
      updatedCount,
      deletedCount: deletedPeriodIds.length
    };
  });
}

function importDynastyPolityLinksCsv(rawCsv: string): CsvSyncImportResult {
  const parsed = parseCsv(rawCsv);
  assertHeaders(parsed.headers, ["dynasty_id", "dynasty_name", "polity_id", "polity_name"]);

  return db.transaction((tx) => {
    const existingLinks = tx.select().from(dynastyPolityLinks).all();
    const dynastyOptions = tx.select().from(dynasties).all();
    const polityOptions = tx.select().from(polities).all();
    const dynastyNameById = new Map(dynastyOptions.map((item) => [item.id, item.name]));
    const polityNameById = new Map(polityOptions.map((item) => [item.id, item.name]));
    const existingKeys = new Set(existingLinks.map((item) => `${item.dynastyId}:${item.polityId}`));
    const csvKeys = new Set<string>();
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of parsed.rows) {
      const cells = toCells(parsed.headers, row.values);
      const dynastyId = parseRequiredId(cells.dynasty_id, row.rowNumber, "dynasty_id");
      const dynastyName = parseRequiredString(cells.dynasty_name, "dynasty_name", row.rowNumber);
      const polityId = parseRequiredId(cells.polity_id, row.rowNumber, "polity_id");
      const polityName = parseRequiredString(cells.polity_name, "polity_name", row.rowNumber);
      const key = `${dynastyId}:${polityId}`;

      if (csvKeys.has(key)) {
        throw new Error(`row ${row.rowNumber}: dynasty_id=${dynastyId}, polity_id=${polityId} が CSV 内で重複しています`);
      }
      csvKeys.add(key);

      const actualDynastyName = dynastyNameById.get(dynastyId);
      if (!actualDynastyName) {
        throw new Error(`row ${row.rowNumber}: dynasty_id=${dynastyId} の王朝は存在しません`);
      }
      if (actualDynastyName !== dynastyName) {
        throw new Error(`row ${row.rowNumber}: dynasty_id=${dynastyId} の名称が一致しません`);
      }

      const actualPolityName = polityNameById.get(polityId);
      if (!actualPolityName) {
        throw new Error(`row ${row.rowNumber}: polity_id=${polityId} の国家は存在しません`);
      }
      if (actualPolityName !== polityName) {
        throw new Error(`row ${row.rowNumber}: polity_id=${polityId} の名称が一致しません`);
      }

      if (!existingKeys.has(key)) {
        tx.insert(dynastyPolityLinks).values({ dynastyId, polityId }).run();
        createdCount += 1;
      } else {
        updatedCount += 1;
      }
    }

    for (const link of existingLinks) {
      const key = `${link.dynastyId}:${link.polityId}`;
      if (!csvKeys.has(key)) {
        tx
          .delete(dynastyPolityLinks)
          .where(and(eq(dynastyPolityLinks.dynastyId, link.dynastyId), eq(dynastyPolityLinks.polityId, link.polityId)))
          .run();
      }
    }

    const deletedCount = existingLinks.filter((link) => !csvKeys.has(`${link.dynastyId}:${link.polityId}`)).length;

    return {
      targetType: "dynasty-polity-links" as const,
      totalRows: parsed.rows.length,
      createdCount,
      updatedCount,
      deletedCount
    };
  });
}

function importRolePolityLinksCsv(rawCsv: string): CsvSyncImportResult {
  const parsed = parseCsv(rawCsv);
  assertHeaders(parsed.headers, ["role_id", "role_title", "polity_id", "polity_name"]);

  return db.transaction((tx) => {
    const existingLinks = tx.select().from(rolePolityLinks).all();
    const roleOptions = tx.select().from(role).all();
    const polityOptions = tx.select().from(polities).all();
    const roleTitleById = new Map(roleOptions.map((item) => [item.id, item.title]));
    const polityNameById = new Map(polityOptions.map((item) => [item.id, item.name]));
    const existingKeys = new Set(existingLinks.map((item) => `${item.roleId}:${item.polityId}`));
    const csvKeys = new Set<string>();
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of parsed.rows) {
      const cells = toCells(parsed.headers, row.values);
      const roleId = parseRequiredId(cells.role_id, row.rowNumber, "role_id");
      const roleTitle = parseRequiredString(cells.role_title, "role_title", row.rowNumber);
      const polityId = parseRequiredId(cells.polity_id, row.rowNumber, "polity_id");
      const polityName = parseRequiredString(cells.polity_name, "polity_name", row.rowNumber);
      const key = `${roleId}:${polityId}`;

      if (csvKeys.has(key)) {
        throw new Error(`row ${row.rowNumber}: role_id=${roleId}, polity_id=${polityId} が CSV 内で重複しています`);
      }
      csvKeys.add(key);

      const actualRoleTitle = roleTitleById.get(roleId);
      if (!actualRoleTitle) {
        throw new Error(`row ${row.rowNumber}: role_id=${roleId} の役職は存在しません`);
      }
      if (actualRoleTitle !== roleTitle) {
        throw new Error(`row ${row.rowNumber}: role_id=${roleId} の名称が一致しません`);
      }

      const actualPolityName = polityNameById.get(polityId);
      if (!actualPolityName) {
        throw new Error(`row ${row.rowNumber}: polity_id=${polityId} の国家は存在しません`);
      }
      if (actualPolityName !== polityName) {
        throw new Error(`row ${row.rowNumber}: polity_id=${polityId} の名称が一致しません`);
      }

      if (!existingKeys.has(key)) {
        tx.insert(rolePolityLinks).values({ roleId, polityId }).run();
        createdCount += 1;
      } else {
        updatedCount += 1;
      }
    }

    for (const link of existingLinks) {
      const key = `${link.roleId}:${link.polityId}`;
      if (!csvKeys.has(key)) {
        tx
          .delete(rolePolityLinks)
          .where(and(eq(rolePolityLinks.roleId, link.roleId), eq(rolePolityLinks.polityId, link.polityId)))
          .run();
      }
    }

    const deletedCount = existingLinks.filter((link) => !csvKeys.has(`${link.roleId}:${link.polityId}`)).length;

    return {
      targetType: "role-polity-links" as const,
      totalRows: parsed.rows.length,
      createdCount,
      updatedCount,
      deletedCount
    };
  });
}

function importPersonRoleLinksCsv(rawCsv: string): CsvSyncImportResult {
  const parsed = parseCsv(rawCsv);
  assertHeaders(parsed.headers, [
    "person_id",
    "person_name",
    "role_id",
    "role_title",
    "description",
    "note",
    "from_calendar_era",
    "from_year",
    "from_is_approximate",
    "to_calendar_era",
    "to_year",
    "to_is_approximate"
  ]);

  return db.transaction((tx) => {
    const existingLinks = tx.select().from(personRoleLinks).all();
    const personOptions = tx.select().from(persons).all();
    const roleOptions = tx.select().from(role).all();
    const personNameById = new Map(personOptions.map((item) => [item.id, item.name]));
    const roleTitleById = new Map(roleOptions.map((item) => [item.id, item.title]));
    const existingKeys = new Set(existingLinks.map((item) => `${item.personId}:${item.roleId}`));
    const csvKeys = new Set<string>();
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of parsed.rows) {
      const cells = toCells(parsed.headers, row.values);
      const personId = parseRequiredId(cells.person_id, row.rowNumber, "person_id");
      const personName = parseRequiredString(cells.person_name, "person_name", row.rowNumber);
      const roleId = parseRequiredId(cells.role_id, row.rowNumber, "role_id");
      const roleTitle = parseRequiredString(cells.role_title, "role_title", row.rowNumber);
      const key = `${personId}:${roleId}`;

      if (csvKeys.has(key)) {
        throw new Error(`row ${row.rowNumber}: person_id=${personId}, role_id=${roleId} が CSV 内で重複しています`);
      }
      csvKeys.add(key);

      const actualPersonName = personNameById.get(personId);
      if (!actualPersonName) {
        throw new Error(`row ${row.rowNumber}: person_id=${personId} の人物は存在しません`);
      }
      if (actualPersonName !== personName) {
        throw new Error(`row ${row.rowNumber}: person_id=${personId} の名称が一致しません`);
      }

      const actualRoleTitle = roleTitleById.get(roleId);
      if (!actualRoleTitle) {
        throw new Error(`row ${row.rowNumber}: role_id=${roleId} の役職は存在しません`);
      }
      if (actualRoleTitle !== roleTitle) {
        throw new Error(`row ${row.rowNumber}: role_id=${roleId} の名称が一致しません`);
      }

      const values = {
        description: nullable(cells.description),
        note: nullable(cells.note),
        fromCalendarEra: parseOptionalEra(cells.from_calendar_era, row.rowNumber, "from_calendar_era"),
        fromYear: parseOptionalInteger(cells.from_year, row.rowNumber, "from_year"),
        fromIsApproximate: parseBooleanFlag(cells.from_is_approximate),
        toCalendarEra: parseOptionalEra(cells.to_calendar_era, row.rowNumber, "to_calendar_era"),
        toYear: parseOptionalInteger(cells.to_year, row.rowNumber, "to_year"),
        toIsApproximate: parseBooleanFlag(cells.to_is_approximate)
      };

      if (!existingKeys.has(key)) {
        tx.insert(personRoleLinks).values({ personId, roleId, ...values }).run();
        createdCount += 1;
      } else {
        tx
          .update(personRoleLinks)
          .set(values)
          .where(and(eq(personRoleLinks.personId, personId), eq(personRoleLinks.roleId, roleId)))
          .run();
        updatedCount += 1;
      }
    }

    for (const link of existingLinks) {
      const key = `${link.personId}:${link.roleId}`;
      if (!csvKeys.has(key)) {
        tx
          .delete(personRoleLinks)
          .where(and(eq(personRoleLinks.personId, link.personId), eq(personRoleLinks.roleId, link.roleId)))
          .run();
      }
    }

    const deletedCount = existingLinks.filter((link) => !csvKeys.has(`${link.personId}:${link.roleId}`)).length;

    return {
      targetType: "person-role-links" as const,
      totalRows: parsed.rows.length,
      createdCount,
      updatedCount,
      deletedCount
    };
  });
}

function importPersonRegionLinksCsv(rawCsv: string): CsvSyncImportResult {
  const parsed = parseCsv(rawCsv);
  assertHeaders(parsed.headers, ["person_id", "person_name", "region_id", "region_name"]);

  return db.transaction((tx) => {
    const existingLinks = tx.select().from(personRegionLinks).all();
    const personOptions = tx.select().from(persons).all();
    const regionOptions = tx.select().from(regions).all();
    const personNameById = new Map(personOptions.map((item) => [item.id, item.name]));
    const regionNameById = new Map(regionOptions.map((item) => [item.id, item.name]));
    const existingKeys = new Set(existingLinks.map((item) => `${item.personId}:${item.regionId}`));
    const csvKeys = new Set<string>();
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of parsed.rows) {
      const cells = toCells(parsed.headers, row.values);
      const personId = parseRequiredId(cells.person_id, row.rowNumber, "person_id");
      const personName = parseRequiredString(cells.person_name, "person_name", row.rowNumber);
      const regionId = parseRequiredId(cells.region_id, row.rowNumber, "region_id");
      const regionName = parseRequiredString(cells.region_name, "region_name", row.rowNumber);
      const key = `${personId}:${regionId}`;

      if (csvKeys.has(key)) {
        throw new Error(`row ${row.rowNumber}: person_id=${personId}, region_id=${regionId} が CSV 内で重複しています`);
      }
      csvKeys.add(key);

      const actualPersonName = personNameById.get(personId);
      if (!actualPersonName) {
        throw new Error(`row ${row.rowNumber}: person_id=${personId} の人物は存在しません`);
      }
      if (actualPersonName !== personName) {
        throw new Error(`row ${row.rowNumber}: person_id=${personId} の名称が一致しません`);
      }

      const actualRegionName = regionNameById.get(regionId);
      if (!actualRegionName) {
        throw new Error(`row ${row.rowNumber}: region_id=${regionId} の地域は存在しません`);
      }
      if (actualRegionName !== regionName) {
        throw new Error(`row ${row.rowNumber}: region_id=${regionId} の名称が一致しません`);
      }

      if (!existingKeys.has(key)) {
        tx.insert(personRegionLinks).values({ personId, regionId }).run();
        createdCount += 1;
      } else {
        updatedCount += 1;
      }
    }

    for (const link of existingLinks) {
      const key = `${link.personId}:${link.regionId}`;
      if (!csvKeys.has(key)) {
        tx
          .delete(personRegionLinks)
          .where(and(eq(personRegionLinks.personId, link.personId), eq(personRegionLinks.regionId, link.regionId)))
          .run();
      }
    }

    const deletedCount = existingLinks.filter((link) => !csvKeys.has(`${link.personId}:${link.regionId}`)).length;

    return {
      targetType: "person-region-links" as const,
      totalRows: parsed.rows.length,
      createdCount,
      updatedCount,
      deletedCount
    };
  });
}

function importPersonReligionLinksCsv(rawCsv: string): CsvSyncImportResult {
  const parsed = parseCsv(rawCsv);
  assertHeaders(parsed.headers, ["person_id", "person_name", "religion_id", "religion_name"]);

  return db.transaction((tx) => {
    const existingLinks = tx.select().from(personReligionLinks).all();
    const personOptions = tx.select().from(persons).all();
    const religionOptions = tx.select().from(religions).all();
    const personNameById = new Map(personOptions.map((item) => [item.id, item.name]));
    const religionNameById = new Map(religionOptions.map((item) => [item.id, item.name]));
    const existingKeys = new Set(existingLinks.map((item) => `${item.personId}:${item.religionId}`));
    const csvKeys = new Set<string>();
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of parsed.rows) {
      const cells = toCells(parsed.headers, row.values);
      const personId = parseRequiredId(cells.person_id, row.rowNumber, "person_id");
      const personName = parseRequiredString(cells.person_name, "person_name", row.rowNumber);
      const religionId = parseRequiredId(cells.religion_id, row.rowNumber, "religion_id");
      const religionName = parseRequiredString(cells.religion_name, "religion_name", row.rowNumber);
      const key = `${personId}:${religionId}`;

      if (csvKeys.has(key)) {
        throw new Error(`row ${row.rowNumber}: person_id=${personId}, religion_id=${religionId} が CSV 内で重複しています`);
      }
      csvKeys.add(key);

      const actualPersonName = personNameById.get(personId);
      if (!actualPersonName) {
        throw new Error(`row ${row.rowNumber}: person_id=${personId} の人物は存在しません`);
      }
      if (actualPersonName !== personName) {
        throw new Error(`row ${row.rowNumber}: person_id=${personId} の名称が一致しません`);
      }

      const actualReligionName = religionNameById.get(religionId);
      if (!actualReligionName) {
        throw new Error(`row ${row.rowNumber}: religion_id=${religionId} の宗教は存在しません`);
      }
      if (actualReligionName !== religionName) {
        throw new Error(`row ${row.rowNumber}: religion_id=${religionId} の名称が一致しません`);
      }

      if (!existingKeys.has(key)) {
        tx.insert(personReligionLinks).values({ personId, religionId }).run();
        createdCount += 1;
      } else {
        updatedCount += 1;
      }
    }

    for (const link of existingLinks) {
      const key = `${link.personId}:${link.religionId}`;
      if (!csvKeys.has(key)) {
        tx
          .delete(personReligionLinks)
          .where(and(eq(personReligionLinks.personId, link.personId), eq(personReligionLinks.religionId, link.religionId)))
          .run();
      }
    }

    const deletedCount = existingLinks.filter((link) => !csvKeys.has(`${link.personId}:${link.religionId}`)).length;

    return {
      targetType: "person-religion-links" as const,
      totalRows: parsed.rows.length,
      createdCount,
      updatedCount,
      deletedCount
    };
  });
}

function importPersonSectLinksCsv(rawCsv: string): CsvSyncImportResult {
  const parsed = parseCsv(rawCsv);
  assertHeaders(parsed.headers, ["person_id", "person_name", "sect_id", "sect_name"]);

  return db.transaction((tx) => {
    const existingLinks = tx.select().from(personSectLinks).all();
    const personOptions = tx.select().from(persons).all();
    const sectOptions = tx.select().from(sects).all();
    const personNameById = new Map(personOptions.map((item) => [item.id, item.name]));
    const sectNameById = new Map(sectOptions.map((item) => [item.id, item.name]));
    const existingKeys = new Set(existingLinks.map((item) => `${item.personId}:${item.sectId}`));
    const csvKeys = new Set<string>();
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of parsed.rows) {
      const cells = toCells(parsed.headers, row.values);
      const personId = parseRequiredId(cells.person_id, row.rowNumber, "person_id");
      const personName = parseRequiredString(cells.person_name, "person_name", row.rowNumber);
      const sectId = parseRequiredId(cells.sect_id, row.rowNumber, "sect_id");
      const sectName = parseRequiredString(cells.sect_name, "sect_name", row.rowNumber);
      const key = `${personId}:${sectId}`;

      if (csvKeys.has(key)) {
        throw new Error(`row ${row.rowNumber}: person_id=${personId}, sect_id=${sectId} が CSV 内で重複しています`);
      }
      csvKeys.add(key);

      const actualPersonName = personNameById.get(personId);
      if (!actualPersonName) {
        throw new Error(`row ${row.rowNumber}: person_id=${personId} の人物は存在しません`);
      }
      if (actualPersonName !== personName) {
        throw new Error(`row ${row.rowNumber}: person_id=${personId} の名称が一致しません`);
      }

      const actualSectName = sectNameById.get(sectId);
      if (!actualSectName) {
        throw new Error(`row ${row.rowNumber}: sect_id=${sectId} の宗派は存在しません`);
      }
      if (actualSectName !== sectName) {
        throw new Error(`row ${row.rowNumber}: sect_id=${sectId} の名称が一致しません`);
      }

      if (!existingKeys.has(key)) {
        tx.insert(personSectLinks).values({ personId, sectId }).run();
        createdCount += 1;
      } else {
        updatedCount += 1;
      }
    }

    for (const link of existingLinks) {
      const key = `${link.personId}:${link.sectId}`;
      if (!csvKeys.has(key)) {
        tx
          .delete(personSectLinks)
          .where(and(eq(personSectLinks.personId, link.personId), eq(personSectLinks.sectId, link.sectId)))
          .run();
      }
    }

    const deletedCount = existingLinks.filter((link) => !csvKeys.has(`${link.personId}:${link.sectId}`)).length;

    return {
      targetType: "person-sect-links" as const,
      totalRows: parsed.rows.length,
      createdCount,
      updatedCount,
      deletedCount
    };
  });
}

function importPolityRegionLinksCsv(rawCsv: string): CsvSyncImportResult {
  const parsed = parseCsv(rawCsv);
  assertHeaders(parsed.headers, ["polity_id", "polity_name", "region_id", "region_name"]);

  return db.transaction((tx) => {
    const existingLinks = tx.select().from(polityRegionLinks).all();
    const polityOptions = tx.select().from(polities).all();
    const regionOptions = tx.select().from(regions).all();
    const polityNameById = new Map(polityOptions.map((item) => [item.id, item.name]));
    const regionNameById = new Map(regionOptions.map((item) => [item.id, item.name]));
    const existingKeys = new Set(existingLinks.map((item) => `${item.polityId}:${item.regionId}`));
    const csvKeys = new Set<string>();
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of parsed.rows) {
      const cells = toCells(parsed.headers, row.values);
      const polityId = parseRequiredId(cells.polity_id, row.rowNumber, "polity_id");
      const polityName = parseRequiredString(cells.polity_name, "polity_name", row.rowNumber);
      const regionId = parseRequiredId(cells.region_id, row.rowNumber, "region_id");
      const regionName = parseRequiredString(cells.region_name, "region_name", row.rowNumber);
      const key = `${polityId}:${regionId}`;

      if (csvKeys.has(key)) {
        throw new Error(`row ${row.rowNumber}: polity_id=${polityId}, region_id=${regionId} が CSV 内で重複しています`);
      }
      csvKeys.add(key);

      const actualPolityName = polityNameById.get(polityId);
      if (!actualPolityName) {
        throw new Error(`row ${row.rowNumber}: polity_id=${polityId} の国家は存在しません`);
      }
      if (actualPolityName !== polityName) {
        throw new Error(`row ${row.rowNumber}: polity_id=${polityId} の名称が一致しません`);
      }

      const actualRegionName = regionNameById.get(regionId);
      if (!actualRegionName) {
        throw new Error(`row ${row.rowNumber}: region_id=${regionId} の地域は存在しません`);
      }
      if (actualRegionName !== regionName) {
        throw new Error(`row ${row.rowNumber}: region_id=${regionId} の名称が一致しません`);
      }

      if (!existingKeys.has(key)) {
        tx.insert(polityRegionLinks).values({ polityId, regionId }).run();
        createdCount += 1;
      } else {
        updatedCount += 1;
      }
    }

    for (const link of existingLinks) {
      const key = `${link.polityId}:${link.regionId}`;
      if (!csvKeys.has(key)) {
        tx
          .delete(polityRegionLinks)
          .where(and(eq(polityRegionLinks.polityId, link.polityId), eq(polityRegionLinks.regionId, link.regionId)))
          .run();
      }
    }

    const deletedCount = existingLinks.filter((link) => !csvKeys.has(`${link.polityId}:${link.regionId}`)).length;

    return {
      targetType: "polity-region-links" as const,
      totalRows: parsed.rows.length,
      createdCount,
      updatedCount,
      deletedCount
    };
  });
}

function importPolityTagLinksCsv(rawCsv: string): CsvSyncImportResult {
  const parsed = parseCsv(rawCsv);
  assertHeaders(parsed.headers, ["polity_id", "polity_name", "tag_id", "tag_name"]);

  return db.transaction((tx) => {
    const existingLinks = tx.select().from(polityTagLinks).all();
    const polityOptions = tx.select().from(polities).all();
    const tagOptions = tx.select().from(tags).all();
    const polityNameById = new Map(polityOptions.map((item) => [item.id, item.name]));
    const tagNameById = new Map(tagOptions.map((item) => [item.id, item.name]));
    const existingKeys = new Set(existingLinks.map((item) => `${item.polityId}:${item.tagId}`));
    const csvKeys = new Set<string>();
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of parsed.rows) {
      const cells = toCells(parsed.headers, row.values);
      const polityId = parseRequiredId(cells.polity_id, row.rowNumber, "polity_id");
      const polityName = parseRequiredString(cells.polity_name, "polity_name", row.rowNumber);
      const tagId = parseRequiredId(cells.tag_id, row.rowNumber, "tag_id");
      const tagName = parseRequiredString(cells.tag_name, "tag_name", row.rowNumber);
      const key = `${polityId}:${tagId}`;

      if (csvKeys.has(key)) {
        throw new Error(`row ${row.rowNumber}: polity_id=${polityId}, tag_id=${tagId} が CSV 内で重複しています`);
      }
      csvKeys.add(key);

      const actualPolityName = polityNameById.get(polityId);
      if (!actualPolityName) {
        throw new Error(`row ${row.rowNumber}: polity_id=${polityId} の国家は存在しません`);
      }
      if (actualPolityName !== polityName) {
        throw new Error(`row ${row.rowNumber}: polity_id=${polityId} の名称が一致しません`);
      }

      const actualTagName = tagNameById.get(tagId);
      if (!actualTagName) {
        throw new Error(`row ${row.rowNumber}: tag_id=${tagId} のタグは存在しません`);
      }
      if (actualTagName !== tagName) {
        throw new Error(`row ${row.rowNumber}: tag_id=${tagId} の名称が一致しません`);
      }

      if (!existingKeys.has(key)) {
        tx.insert(polityTagLinks).values({ polityId, tagId }).run();
        createdCount += 1;
      } else {
        updatedCount += 1;
      }
    }

    for (const link of existingLinks) {
      const key = `${link.polityId}:${link.tagId}`;
      if (!csvKeys.has(key)) {
        tx
          .delete(polityTagLinks)
          .where(and(eq(polityTagLinks.polityId, link.polityId), eq(polityTagLinks.tagId, link.tagId)))
          .run();
      }
    }

    const deletedCount = existingLinks.filter((link) => !csvKeys.has(`${link.polityId}:${link.tagId}`)).length;

    return {
      targetType: "polity-tag-links" as const,
      totalRows: parsed.rows.length,
      createdCount,
      updatedCount,
      deletedCount
    };
  });
}

function importDynastyRegionLinksCsv(rawCsv: string): CsvSyncImportResult {
  const parsed = parseCsv(rawCsv);
  assertHeaders(parsed.headers, ["dynasty_id", "dynasty_name", "region_id", "region_name"]);

  return db.transaction((tx) => {
    const existingLinks = tx.select().from(dynastyRegionLinks).all();
    const dynastyOptions = tx.select().from(dynasties).all();
    const regionOptions = tx.select().from(regions).all();
    const dynastyNameById = new Map(dynastyOptions.map((item) => [item.id, item.name]));
    const regionNameById = new Map(regionOptions.map((item) => [item.id, item.name]));
    const existingKeys = new Set(existingLinks.map((item) => `${item.dynastyId}:${item.regionId}`));
    const csvKeys = new Set<string>();
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of parsed.rows) {
      const cells = toCells(parsed.headers, row.values);
      const dynastyId = parseRequiredId(cells.dynasty_id, row.rowNumber, "dynasty_id");
      const dynastyName = parseRequiredString(cells.dynasty_name, "dynasty_name", row.rowNumber);
      const regionId = parseRequiredId(cells.region_id, row.rowNumber, "region_id");
      const regionName = parseRequiredString(cells.region_name, "region_name", row.rowNumber);
      const key = `${dynastyId}:${regionId}`;

      if (csvKeys.has(key)) {
        throw new Error(`row ${row.rowNumber}: dynasty_id=${dynastyId}, region_id=${regionId} が CSV 内で重複しています`);
      }
      csvKeys.add(key);

      const actualDynastyName = dynastyNameById.get(dynastyId);
      if (!actualDynastyName) {
        throw new Error(`row ${row.rowNumber}: dynasty_id=${dynastyId} の王朝は存在しません`);
      }
      if (actualDynastyName !== dynastyName) {
        throw new Error(`row ${row.rowNumber}: dynasty_id=${dynastyId} の名称が一致しません`);
      }

      const actualRegionName = regionNameById.get(regionId);
      if (!actualRegionName) {
        throw new Error(`row ${row.rowNumber}: region_id=${regionId} の地域は存在しません`);
      }
      if (actualRegionName !== regionName) {
        throw new Error(`row ${row.rowNumber}: region_id=${regionId} の名称が一致しません`);
      }

      if (!existingKeys.has(key)) {
        tx.insert(dynastyRegionLinks).values({ dynastyId, regionId }).run();
        createdCount += 1;
      } else {
        updatedCount += 1;
      }
    }

    for (const link of existingLinks) {
      const key = `${link.dynastyId}:${link.regionId}`;
      if (!csvKeys.has(key)) {
        tx
          .delete(dynastyRegionLinks)
          .where(and(eq(dynastyRegionLinks.dynastyId, link.dynastyId), eq(dynastyRegionLinks.regionId, link.regionId)))
          .run();
      }
    }

    const deletedCount = existingLinks.filter((link) => !csvKeys.has(`${link.dynastyId}:${link.regionId}`)).length;

    return {
      targetType: "dynasty-region-links" as const,
      totalRows: parsed.rows.length,
      createdCount,
      updatedCount,
      deletedCount
    };
  });
}

function importReligionsCsv(rawCsv: string): CsvSyncImportResult {
  const parsed = parseCsv(rawCsv);
  assertHeaders(parsed.headers, [
    "id",
    "name",
    "reading",
    "description",
    "note",
    "from_calendar_era",
    "from_year",
    "from_is_approximate",
    "to_calendar_era",
    "to_year",
    "to_is_approximate"
  ]);

  return db.transaction((tx) => {
    const existingItems = tx.select().from(religions).all();
    const existingIds = new Set(existingItems.map((item) => item.id));
    const csvIds = new Set<number>();
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of parsed.rows) {
      const cells = toCells(parsed.headers, row.values);
      const id = parseOptionalId(cells.id, row.rowNumber);
      const fromCalendarEra = parseOptionalEra(cells.from_calendar_era, row.rowNumber, "from_calendar_era");
      const fromYear = parseOptionalInteger(cells.from_year, row.rowNumber, "from_year");
      const toCalendarEra = parseOptionalEra(cells.to_calendar_era, row.rowNumber, "to_calendar_era");
      const toYear = parseOptionalInteger(cells.to_year, row.rowNumber, "to_year");

      const values = {
        name: parseRequiredString(cells.name, "name", row.rowNumber),
        reading: nullable(cells.reading),
        description: nullable(cells.description),
        note: nullable(cells.note),
        fromCalendarEra,
        fromYear,
        fromIsApproximate: parseBooleanFlag(cells.from_is_approximate),
        toCalendarEra,
        toYear,
        toIsApproximate: parseBooleanFlag(cells.to_is_approximate)
      };

      if (id == null) {
        tx.insert(religions).values(values).run();
        createdCount += 1;
        continue;
      }

      assertUniqueCsvId(csvIds, id, row.rowNumber);
      if (!existingIds.has(id)) {
        throw new Error(`row ${row.rowNumber}: id=${id} の宗教は存在しません`);
      }

      tx.update(religions).set(values).where(eq(religions.id, id)).run();
      updatedCount += 1;
    }

    const deletedIds = existingItems.map((item) => item.id).filter((id) => !csvIds.has(id));
    for (const id of deletedIds) {
      tx.update(sects).set({ religionId: null }).where(eq(sects.religionId, id)).run();
      tx.delete(religions).where(eq(religions.id, id)).run();
    }

    return {
      targetType: "religions" as const,
      totalRows: parsed.rows.length,
      createdCount,
      updatedCount,
      deletedCount: deletedIds.length
    };
  });
}

function importSectsCsv(rawCsv: string): CsvSyncImportResult {
  const parsed = parseCsv(rawCsv);
  assertHeaders(parsed.headers, [
    "id",
    "name",
    "religion",
    "reading",
    "description",
    "note",
    "from_calendar_era",
    "from_year",
    "from_is_approximate",
    "to_calendar_era",
    "to_year",
    "to_is_approximate"
  ]);

  return db.transaction((tx) => {
    const existingItems = tx.select().from(sects).all();
    const existingIds = new Set(existingItems.map((item) => item.id));
    const religionOptions = tx.select().from(religions).all();
    const religionIdByName = new Map(religionOptions.map((item) => [item.name, item.id]));
    const csvIds = new Set<number>();
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of parsed.rows) {
      const cells = toCells(parsed.headers, row.values);
      const id = parseOptionalId(cells.id, row.rowNumber);
      const religionName = parseRequiredString(cells.religion, "religion", row.rowNumber);
      const religionId = religionIdByName.get(religionName);
      if (!religionId) {
        throw new Error(`row ${row.rowNumber}: religion "${religionName}" が存在しません`);
      }
      const fromCalendarEra = parseOptionalEra(cells.from_calendar_era, row.rowNumber, "from_calendar_era");
      const fromYear = parseOptionalInteger(cells.from_year, row.rowNumber, "from_year");
      const toCalendarEra = parseOptionalEra(cells.to_calendar_era, row.rowNumber, "to_calendar_era");
      const toYear = parseOptionalInteger(cells.to_year, row.rowNumber, "to_year");

      const values = {
        name: parseRequiredString(cells.name, "name", row.rowNumber),
        religionId,
        reading: nullable(cells.reading),
        description: nullable(cells.description),
        note: nullable(cells.note),
        fromCalendarEra,
        fromYear,
        fromIsApproximate: parseBooleanFlag(cells.from_is_approximate),
        toCalendarEra,
        toYear,
        toIsApproximate: parseBooleanFlag(cells.to_is_approximate)
      };

      if (id == null) {
        tx.insert(sects).values(values).run();
        createdCount += 1;
        continue;
      }

      assertUniqueCsvId(csvIds, id, row.rowNumber);
      if (!existingIds.has(id)) {
        throw new Error(`row ${row.rowNumber}: id=${id} の宗派は存在しません`);
      }

      tx.update(sects).set(values).where(eq(sects.id, id)).run();
      updatedCount += 1;
    }

    const deletedIds = existingItems.map((item) => item.id).filter((id) => !csvIds.has(id));
    for (const id of deletedIds) {
      tx.delete(sectFounderLinks).where(eq(sectFounderLinks.sectId, id)).run();
      tx.delete(sects).where(eq(sects.id, id)).run();
    }

    return {
      targetType: "sects" as const,
      totalRows: parsed.rows.length,
      createdCount,
      updatedCount,
      deletedCount: deletedIds.length
    };
  });
}

function replaceHistoricalPeriodLinks(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  periodId: number,
  categoryId: number,
  polityId: number | null,
  regionIds: number[]
) {
  tx.delete(historicalPeriodCategoryLinks).where(eq(historicalPeriodCategoryLinks.periodId, periodId)).run();
  tx.delete(historicalPeriodPolityLinks).where(eq(historicalPeriodPolityLinks.periodId, periodId)).run();
  tx.delete(historicalPeriodRegionLinks).where(eq(historicalPeriodRegionLinks.periodId, periodId)).run();
  tx.insert(historicalPeriodCategoryLinks).values({ periodId, categoryId }).run();
  if (polityId != null) {
    tx.insert(historicalPeriodPolityLinks).values({ periodId, polityId }).run();
  }
  if (regionIds.length > 0) {
    tx.insert(historicalPeriodRegionLinks).values(regionIds.map((regionId) => ({ periodId, regionId }))).run();
  }
}

function failReference(type: string, value: string, rowNumber: number): never {
  throw new Error(`row ${rowNumber}: ${type} "${value}" が存在しません`);
}

function assertHeaders(headers: string[], requiredHeaders: string[]) {
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    throw new Error(`CSV ヘッダーが不足しています: ${missingHeaders.join(", ")}`);
  }
}

function assertUniqueCsvId(seenIds: Set<number>, id: number, rowNumber: number) {
  if (seenIds.has(id)) {
    throw new Error(`row ${rowNumber}: id=${id} が CSV 内で重複しています`);
  }

  seenIds.add(id);
}

function toCells(headers: string[], values: string[]): CsvCells {
  return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
}

function parseRequiredString(value: string | undefined, field: string, rowNumber: number) {
  const normalized = value?.trim() ?? "";
  if (normalized.length === 0) {
    throw new Error(`row ${rowNumber}: ${field} は必須です`);
  }
  return normalized;
}

function parseOptionalId(value: string | undefined, rowNumber: number) {
  const normalized = value?.trim() ?? "";
  if (normalized.length === 0) {
    return null;
  }

  const id = Number(normalized);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`row ${rowNumber}: id は正の整数で指定してください`);
  }

  return id;
}

function parseRequiredId(value: string | undefined, rowNumber: number, field: string) {
  const id = parseOptionalId(value, rowNumber);
  if (id == null) {
    throw new Error(`row ${rowNumber}: ${field} は必須です`);
  }
  return id;
}

function parseOptionalInteger(value: string | undefined, rowNumber: number, field: string) {
  const normalized = value?.trim() ?? "";
  if (normalized.length === 0) {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isInteger(parsed)) {
    throw new Error(`row ${rowNumber}: ${field} は整数で指定してください`);
  }

  return parsed;
}

function parseOptionalEra(value: string | undefined, rowNumber: number, field: string) {
  const normalized = value?.trim() ?? "";
  if (normalized.length === 0) {
    return null;
  }

  if (normalized !== "BCE" && normalized !== "CE") {
    throw new Error(`row ${rowNumber}: ${field} は BCE または CE を指定してください`);
  }

  return normalized;
}

function parseBooleanFlag(value: string | undefined) {
  const normalized = value?.trim().toLowerCase() ?? "";
  return normalized === "1" || normalized === "true";
}

function parseReferenceNames(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function nullable(value: string | undefined) {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : null;
}

function parseCsv(rawCsv: string): ParsedCsvDocument {
  const normalized = rawCsv.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const matrix = parseCsvMatrix(normalized);
  const nonEmptyRows = matrix.filter((row) => row.some((cell) => cell.trim().length > 0));

  if (nonEmptyRows.length === 0) {
    throw new Error("CSV が空です");
  }

  const [headerRow, ...dataRows] = nonEmptyRows;
  const headers = headerRow.map((cell) => cell.trim());

  if (headers.length === 0 || headers.every((header) => header.length === 0)) {
    throw new Error("ヘッダー行が必要です");
  }

  return {
    headers,
    rows: dataRows.map((values, index) => ({
      rowNumber: index + 2,
      values
    }))
  };
}

function parseCsvMatrix(raw: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < raw.length; index += 1) {
    const character = raw[index];
    const nextCharacter = raw[index + 1];

    if (character === "\"") {
      if (inQuotes && nextCharacter === "\"") {
        cell += "\"";
        index += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (character === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if (character === "\n" && !inQuotes) {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += character;
  }

  if (inQuotes) {
    throw new Error("CSV のクォートが閉じていません");
  }

  row.push(cell);
  rows.push(row);
  return rows;
}
