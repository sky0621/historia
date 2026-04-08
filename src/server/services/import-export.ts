import { sqlite } from "@/db/client";
import { formatTimeExpression } from "@/lib/time-expression/format";
import { fromTimeExpressionRecord } from "@/lib/time-expression/normalize";

export function buildPeriodCategoriesCsv() {
  const rows = sqlite
    .prepare(
      `SELECT id, name, reading, description
       FROM period_categories
       ORDER BY name`
    )
    .all() as Array<Record<string, unknown>>;

  return toCsv(rows, ["id", "name", "reading", "description"]);
}

export function buildHistoricalPeriodsCsv() {
  const rows = sqlite
    .prepare(
      `SELECT
         hp.id,
         hp.name,
         (
           SELECT pc.name
           FROM historical_period_category_links hpcl
           JOIN period_categories pc ON pc.id = hpcl.category_id
           WHERE hpcl.period_id = hp.id
           LIMIT 1
         ) AS category,
         (
           SELECT p.name
           FROM historical_period_polity_links hppl
           JOIN polities p ON p.id = hppl.polity_id
           WHERE hppl.period_id = hp.id
           LIMIT 1
         ) AS polity,
         hp.description,
         hp.note,
         hp.from_calendar_era AS time_calendar_era,
         hp.from_year AS time_start_year,
         hp.to_year AS time_end_year,
         CASE
           WHEN coalesce(hp.from_is_approximate, 0) = 1 OR coalesce(hp.to_is_approximate, 0) = 1 THEN 1
           ELSE 0
         END AS time_is_approximate,
         (
           SELECT group_concat(r.name, ', ')
           FROM historical_period_region_links hprl
           JOIN regions r ON r.id = hprl.region_id
           WHERE hprl.period_id = hp.id
         ) AS regions
       FROM historical_periods hp
       ORDER BY hp.name`
    )
    .all() as Array<Record<string, unknown>>;

  const normalizedRows = rows.map((row) => ({
    ...row,
    time_label: formatHistoricalPeriodTime(row)
  }));

  return toCsv(normalizedRows, [
    "id",
    "name",
    "category",
    "polity",
    "description",
    "note",
    "time_label",
    "time_calendar_era",
    "time_start_year",
    "time_end_year",
    "time_is_approximate",
    "regions"
  ]);
}

export function buildHistoricalPeriodCategoryLinksCsv() {
  const rows = sqlite
    .prepare(
      `SELECT
         c.id AS category_id,
         c.name AS category_name,
         p.id AS period_id,
         p.name AS period_name
       FROM historical_period_category_links hpcl
       INNER JOIN period_categories c ON hpcl.category_id = c.id
       INNER JOIN historical_periods p ON hpcl.period_id = p.id
       ORDER BY c.id, p.id`
    )
    .all() as Array<Record<string, unknown>>;

  return toCsv(rows, ["category_id", "category_name", "period_id", "period_name"]);
}

export function buildTagsCsv() {
  const rows = sqlite
    .prepare(
      `SELECT
         t.id,
         t.name,
         t.reading
       FROM tags t
       ORDER BY t.name`
    )
    .all() as Array<Record<string, unknown>>;

  return toCsv(rows, ["id", "name", "reading"]);
}

export function buildDynastyPolityLinksCsv() {
  const rows = sqlite
    .prepare(
      `SELECT
         d.id AS dynasty_id,
         d.name AS dynasty_name,
         p.id AS polity_id,
         p.name AS polity_name
       FROM dynasty_polity_links dpl
       INNER JOIN dynasties d ON dpl.dynasty_id = d.id
       INNER JOIN polities p ON dpl.polity_id = p.id
       ORDER BY d.id, p.id`
    )
    .all() as Array<Record<string, unknown>>;

  return toCsv(rows, ["dynasty_id", "dynasty_name", "polity_id", "polity_name"]);
}

export function buildRolePolityLinksCsv() {
  const rows = sqlite
    .prepare(
      `SELECT
         r.id AS role_id,
         r.title AS role_title,
         p.id AS polity_id,
         p.name AS polity_name
       FROM role_polity_links rpl
       INNER JOIN roles r ON rpl.role_id = r.id
       INNER JOIN polities p ON rpl.polity_id = p.id
       ORDER BY r.id, p.id`
    )
    .all() as Array<Record<string, unknown>>;

  return toCsv(rows, ["role_id", "role_title", "polity_id", "polity_name"]);
}

export function buildPersonRoleLinksCsv() {
  const rows = sqlite
    .prepare(
      `SELECT
         p.id AS person_id,
         p.name AS person_name,
         r.id AS role_id,
         r.title AS role_title,
         prl.description,
         prl.note,
         prl.from_calendar_era,
         prl.from_year,
         prl.from_is_approximate,
         prl.to_calendar_era,
         prl.to_year,
         prl.to_is_approximate
       FROM person_role_links prl
       INNER JOIN persons p ON prl.person_id = p.id
       INNER JOIN roles r ON prl.role_id = r.id
       ORDER BY p.id, r.id`
    )
    .all() as Array<Record<string, unknown>>;

  return toCsv(rows, [
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
}

export function buildPersonRegionLinksCsv() {
  const rows = sqlite
    .prepare(
      `SELECT
         p.id AS person_id,
         p.name AS person_name,
         r.id AS region_id,
         r.name AS region_name
       FROM person_region_links prl
       INNER JOIN persons p ON prl.person_id = p.id
       INNER JOIN regions r ON prl.region_id = r.id
       ORDER BY p.id, r.id`
    )
    .all() as Array<Record<string, unknown>>;

  return toCsv(rows, ["person_id", "person_name", "region_id", "region_name"]);
}

export function buildPersonReligionLinksCsv() {
  const rows = sqlite
    .prepare(
      `SELECT
         p.id AS person_id,
         p.name AS person_name,
         r.id AS religion_id,
         r.name AS religion_name
       FROM person_religion_links prl
       INNER JOIN persons p ON prl.person_id = p.id
       INNER JOIN religions r ON prl.religion_id = r.id
       ORDER BY p.id, r.id`
    )
    .all() as Array<Record<string, unknown>>;

  return toCsv(rows, ["person_id", "person_name", "religion_id", "religion_name"]);
}

export function buildPersonSectLinksCsv() {
  const rows = sqlite
    .prepare(
      `SELECT
         p.id AS person_id,
         p.name AS person_name,
         s.id AS sect_id,
         s.name AS sect_name
       FROM person_sect_links psl
       INNER JOIN persons p ON psl.person_id = p.id
       INNER JOIN sects s ON psl.sect_id = s.id
       ORDER BY p.id, s.id`
    )
    .all() as Array<Record<string, unknown>>;

  return toCsv(rows, ["person_id", "person_name", "sect_id", "sect_name"]);
}

export function buildPolityRegionLinksCsv() {
  const rows = sqlite
    .prepare(
      `SELECT
         p.id AS polity_id,
         p.name AS polity_name,
         r.id AS region_id,
         r.name AS region_name
       FROM polity_region_links prl
       INNER JOIN polities p ON prl.polity_id = p.id
       INNER JOIN regions r ON prl.region_id = r.id
       ORDER BY p.id, r.id`
    )
    .all() as Array<Record<string, unknown>>;

  return toCsv(rows, ["polity_id", "polity_name", "region_id", "region_name"]);
}

export function buildPolityTagLinksCsv() {
  const rows = sqlite
    .prepare(
      `SELECT
         p.id AS polity_id,
         p.name AS polity_name,
         t.id AS tag_id,
         t.name AS tag_name
       FROM polity_tag_links ptl
       INNER JOIN polities p ON ptl.polity_id = p.id
       INNER JOIN tags t ON ptl.tag_id = t.id
       ORDER BY p.id, t.id`
    )
    .all() as Array<Record<string, unknown>>;

  return toCsv(rows, ["polity_id", "polity_name", "tag_id", "tag_name"]);
}

export function buildDynastyRegionLinksCsv() {
  const rows = sqlite
    .prepare(
      `SELECT
         d.id AS dynasty_id,
         d.name AS dynasty_name,
         r.id AS region_id,
         r.name AS region_name
       FROM dynasty_region_links drl
       INNER JOIN dynasties d ON drl.dynasty_id = d.id
       INNER JOIN regions r ON drl.region_id = r.id
       ORDER BY d.id, r.id`
    )
    .all() as Array<Record<string, unknown>>;

  return toCsv(rows, ["dynasty_id", "dynasty_name", "region_id", "region_name"]);
}

export function buildPolitiesCsv() {
  const rows = sqlite
    .prepare(
      `SELECT
         p.id,
         p.name,
         p.reading,
         p.description,
         p.note,
         p.from_calendar_era,
         p.from_year,
         p.from_is_approximate,
         p.to_calendar_era,
         p.to_year,
         p.to_is_approximate
       FROM polities p
       ORDER BY p.name`
    )
    .all() as Array<Record<string, unknown>>;

  return toCsv(rows, [
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
}

export function buildDynastiesCsv() {
  const rows = sqlite
    .prepare(
      `SELECT
         d.id,
         d.name,
         d.reading,
         d.description,
         d.note,
         d.from_calendar_era,
         d.from_year,
         d.from_is_approximate,
         d.to_calendar_era,
         d.to_year,
         d.to_is_approximate
       FROM dynasties d
       ORDER BY d.name`
    )
    .all() as Array<Record<string, unknown>>;

  return toCsv(rows, [
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
}

export function buildRolesCsv() {
  const rows = sqlite
    .prepare(
      `SELECT
         r.id,
         r.title,
         (
           SELECT group_concat(name, ', ')
           FROM (
             SELECT p.name AS name
             FROM role_polity_links rpl
             INNER JOIN polities p ON p.id = rpl.polity_id
             WHERE rpl.role_id = r.id
             ORDER BY p.name
           )
         ) AS polities,
         r.reading,
         r.description,
         r.note
       FROM roles r
       ORDER BY r.title`
    )
    .all() as Array<Record<string, unknown>>;

  return toCsv(rows, ["id", "title", "polities", "reading", "description", "note"]);
}

export function buildPersonsCsv() {
  const rows = sqlite
    .prepare(
      `SELECT
         p.id,
         p.name,
         p.reading,
         p.aliases,
         p.description,
         p.note,
         p.from_calendar_era,
         p.from_year,
         p.from_is_approximate,
         p.to_calendar_era,
         p.to_year,
         p.to_is_approximate
       FROM persons p
       ORDER BY p.name`
    )
    .all() as Array<Record<string, unknown>>;

  return toCsv(rows, [
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
}

export function buildRegionsCsv() {
  const rows = sqlite
    .prepare(
      `SELECT
         r.id,
         r.name,
         parent.name AS parent_region,
         r.description,
         r.note
       FROM regions r
       LEFT JOIN regions parent ON parent.id = r.parent_region_id
       ORDER BY r.name`
    )
    .all() as Array<Record<string, unknown>>;

  return toCsv(rows, ["id", "name", "parent_region", "description", "note"]);
}

export function buildReligionsCsv() {
  const rows = sqlite
    .prepare(
      `SELECT
         r.id,
         r.name,
         r.reading,
         r.description,
         r.note,
         r.from_calendar_era,
         r.from_year,
         r.from_is_approximate,
         r.to_calendar_era,
         r.to_year,
         r.to_is_approximate
       FROM religions r
       ORDER BY r.name`
    )
    .all() as Array<Record<string, unknown>>;

  return toCsv(rows, [
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
}

export function buildSectsCsv() {
  const rows = sqlite
    .prepare(
      `SELECT
         s.id,
         s.name,
         r.name AS religion,
         s.reading,
         s.description,
         s.note,
         s.from_calendar_era,
         s.from_year,
         s.from_is_approximate,
         s.to_calendar_era,
         s.to_year,
         s.to_is_approximate
       FROM sects s
       LEFT JOIN religions r ON r.id = s.religion_id
       ORDER BY s.name`
    )
    .all() as Array<Record<string, unknown>>;

  return toCsv(rows, [
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
}

function formatHistoricalPeriodTime(row: Record<string, unknown>) {
  const expression = fromTimeExpressionRecord({
    calendarEra: (row.time_calendar_era as "BCE" | "CE" | null) ?? "CE",
    startYear: (row.time_start_year as number | null) ?? null,
    endYear: (row.time_end_year as number | null) ?? null,
    isApproximate: Boolean(row.time_is_approximate),
    precision: "year",
    displayLabel: null
  });

  return expression ? formatTimeExpression(expression) : "";
}

function toCsv(rows: Array<Record<string, unknown>>, columns: string[]) {
  const lines = [
    columns.join(","),
    ...rows.map((row) =>
      columns
        .map((column) => escapeCsvValue(row[column]))
        .join(",")
    )
  ];

  return lines.join("\n");
}

function escapeCsvValue(value: unknown) {
  const stringValue =
    value instanceof Date
      ? value.toISOString()
      : value === null || value === undefined
        ? ""
        : String(value);

  if (stringValue.includes(",") || stringValue.includes("\"") || stringValue.includes("\n")) {
    return `"${stringValue.replaceAll("\"", "\"\"")}"`;
  }

  return stringValue;
}
