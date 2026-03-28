import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  historicalPeriodCategoryLinks,
  historicalPeriodPolityLinks,
  historicalPeriodRegionLinks,
  historicalPeriods,
  periodCategories,
  polities,
  polityRegionLinks,
  regions
} from "@/db/schema";

export const csvSyncImportTargets = ["polities", "period-categories", "historical-periods"] as const;

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
    case "period-categories":
      return importPeriodCategoriesCsv(rawCsv);
    case "historical-periods":
      return importHistoricalPeriodsCsv(rawCsv);
    case "polities":
      return importPolitiesCsv(rawCsv);
  }
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
