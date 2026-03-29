import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  dynastyRegionLinks,
  eventRegionLinks,
  historicalPeriodCategoryLinks,
  historicalPeriodPolityLinks,
  historicalPeriodRegionLinks,
  historicalPeriods,
  periodCategories,
  persons,
  personRegionLinks,
  polities,
  polityRegionLinks,
  religionSectLinks,
  religions,
  regions,
  sectFounderLinks,
  sectParentLinks,
  sects
} from "@/db/schema";

export const csvSyncImportTargets = [
  "regions",
  "polities",
  "period-categories",
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
    case "regions":
      return importRegionsCsv(rawCsv);
    case "period-categories":
      return importPeriodCategoriesCsv(rawCsv);
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
  }
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

function importPolitiesCsv(rawCsv: string): CsvSyncImportResult {
  const parsed = parseCsv(rawCsv);
  assertHeaders(parsed.headers, [
    "id",
    "name",
    "note",
    "from_calendar_era",
    "from_year",
    "from_is_approximate",
    "to_calendar_era",
    "to_year",
    "to_is_approximate",
    "regions"
  ]);

  return db.transaction((tx) => {
    const existingItems = tx.select().from(polities).all();
    const existingIds = new Set(existingItems.map((item) => item.id));
    const regionOptions = tx.select().from(regions).all();
    const regionIdByName = new Map(regionOptions.map((item) => [item.name, item.id]));
    const csvIds = new Set<number>();
    let createdCount = 0;
    let updatedCount = 0;

    for (const row of parsed.rows) {
      const cells = toCells(parsed.headers, row.values);
      const id = parseOptionalId(cells.id, row.rowNumber);
      const regionIds = parseReferenceNames(cells.regions)
        .map((name) => {
          const regionId = regionIdByName.get(name);
          if (!regionId) {
            throw new Error(`row ${row.rowNumber}: region "${name}" が存在しません`);
          }
          return regionId;
        });

      const values = {
        name: parseRequiredString(cells.name, "name", row.rowNumber),
        note: nullable(cells.note),
        fromCalendarEra: parseOptionalEra(cells.from_calendar_era, row.rowNumber, "from_calendar_era"),
        fromYear: parseOptionalInteger(cells.from_year, row.rowNumber, "from_year"),
        fromIsApproximate: parseBooleanFlag(cells.from_is_approximate),
        toCalendarEra: parseOptionalEra(cells.to_calendar_era, row.rowNumber, "to_calendar_era"),
        toYear: parseOptionalInteger(cells.to_year, row.rowNumber, "to_year"),
        toIsApproximate: parseBooleanFlag(cells.to_is_approximate)
      };

      if (id == null) {
        const result = tx.insert(polities).values(values).run();
        const polityId = Number(result.lastInsertRowid);
        replacePolityRegionLinks(tx, polityId, regionIds);
        createdCount += 1;
        continue;
      }

      assertUniqueCsvId(csvIds, id, row.rowNumber);
      if (!existingIds.has(id)) {
        throw new Error(`row ${row.rowNumber}: id=${id} の国家は存在しません`);
      }

      tx.update(polities).set(values).where(eq(polities.id, id)).run();
      replacePolityRegionLinks(tx, id, regionIds);
      updatedCount += 1;
    }

    const deletedIds = existingItems.map((item) => item.id).filter((id) => !csvIds.has(id));
    for (const id of deletedIds) {
      tx.delete(polityRegionLinks).where(eq(polityRegionLinks.polityId, id)).run();
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

function importReligionsCsv(rawCsv: string): CsvSyncImportResult {
  const parsed = parseCsv(rawCsv);
  assertHeaders(parsed.headers, [
    "id",
    "name",
    "description",
    "note",
    "time_calendar_era",
    "time_start_year",
    "time_end_year",
    "time_is_approximate",
    "founders"
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
    "parent_sect",
    "description",
    "note",
    "time_calendar_era",
    "time_start_year",
    "time_end_year",
    "time_is_approximate",
    "founders"
  ]);

  return db.transaction((tx) => {
    const existingItems = tx.select().from(sects).all();
    const existingIds = new Set(existingItems.map((item) => item.id));
    const religionOptions = tx.select().from(religions).all();
    const personOptions = tx.select().from(persons).all();
    const religionIdByName = new Map(religionOptions.map((item) => [item.name, item.id]));
    const personIdByName = new Map(personOptions.map((item) => [item.name, item.id]));
    const csvIds = new Set<number>();
    const csvSectIdByName = new Map(existingItems.map((item) => [item.name, item.id]));
    const pendingParentBySectId = new Map<number, { parentSectName: string; rowNumber: number }>();
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
      const founderIds = parseReferenceNames(cells.founders).map((name) => {
        const personId = personIdByName.get(name);
        if (!personId) {
          throw new Error(`row ${row.rowNumber}: founder "${name}" が存在しません`);
        }
        return personId;
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
        const result = tx.insert(sects).values(values).run();
        const sectId = Number(result.lastInsertRowid);
        replaceSectLinks(tx, sectId, religionId, null, founderIds);
        csvSectIdByName.set(values.name, sectId);
        const parentSectName = nullable(cells.parent_sect);
        if (parentSectName) {
          pendingParentBySectId.set(sectId, { parentSectName, rowNumber: row.rowNumber });
        }
        createdCount += 1;
        continue;
      }

      assertUniqueCsvId(csvIds, id, row.rowNumber);
      if (!existingIds.has(id)) {
        throw new Error(`row ${row.rowNumber}: id=${id} の宗派は存在しません`);
      }

      tx.update(sects).set(values).where(eq(sects.id, id)).run();
      replaceSectLinks(tx, id, religionId, null, founderIds);
      csvSectIdByName.set(values.name, id);
      const parentSectName = nullable(cells.parent_sect);
      if (parentSectName) {
        pendingParentBySectId.set(id, { parentSectName, rowNumber: row.rowNumber });
      }
      updatedCount += 1;
    }

    for (const [sectId, pendingParent] of pendingParentBySectId.entries()) {
      const parentSectId = csvSectIdByName.get(pendingParent.parentSectName);
      if (!parentSectId) {
        throw new Error(`row ${pendingParent.rowNumber}: parent_sect "${pendingParent.parentSectName}" が存在しません`);
      }
      if (parentSectId === sectId) {
        throw new Error(`row ${pendingParent.rowNumber}: parent_sect に自分自身は指定できません`);
      }

      tx.delete(sectParentLinks).where(eq(sectParentLinks.sectId, sectId)).run();
      tx.insert(sectParentLinks).values({ sectId, parentSectId }).run();
    }

    const deletedIds = existingItems.map((item) => item.id).filter((id) => !csvIds.has(id));
    for (const id of deletedIds) {
      tx.delete(sectParentLinks).where(eq(sectParentLinks.sectId, id)).run();
      tx.delete(sectParentLinks).where(eq(sectParentLinks.parentSectId, id)).run();
      tx.delete(religionSectLinks).where(eq(religionSectLinks.sectId, id)).run();
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

function replacePolityRegionLinks(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  polityId: number,
  regionIds: number[]
) {
  tx.delete(polityRegionLinks).where(eq(polityRegionLinks.polityId, polityId)).run();
  if (regionIds.length > 0) {
    tx.insert(polityRegionLinks).values(regionIds.map((regionId) => ({ polityId, regionId }))).run();
  }
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

function replaceSectLinks(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  sectId: number,
  religionId: number,
  parentSectId: number | null,
  founderIds: number[]
) {
  tx.delete(religionSectLinks).where(eq(religionSectLinks.sectId, sectId)).run();
  tx.delete(sectParentLinks).where(eq(sectParentLinks.sectId, sectId)).run();
  tx.delete(sectFounderLinks).where(eq(sectFounderLinks.sectId, sectId)).run();
  tx.insert(religionSectLinks).values({ sectId, religionId }).run();
  if (parentSectId != null) {
    tx.insert(sectParentLinks).values({ sectId, parentSectId }).run();
  }
  if (founderIds.length > 0) {
    tx.insert(sectFounderLinks).values(founderIds.map((personId) => ({ sectId, personId }))).run();
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
