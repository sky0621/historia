#!/usr/bin/env python3

import bz2
import csv
import json
import math
import subprocess
import urllib.parse
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SOURCE_CSV = ROOT / "csv" / "Person" / "people-historical-figures-pantheon-600-ja.csv"
OUTPUT_CSV = ROOT / "csv" / "base" / "persons.csv"
PANTHEON_CACHE = Path("/tmp/person_2025_update.csv.bz2")
WIKIDATA_CACHE_DIR = Path("/tmp/pantheon_wikidata_ja")
PANTHEON_URL = "https://storage.googleapis.com/pantheon-public-data/person_2025_update.csv.bz2"
WIKIDATA_API = "https://www.wikidata.org/w/api.php"

OUTPUT_HEADERS = [
    "name",
    "reading",
    "aliases",
    "note",
    "birth_label",
    "birth_calendar_era",
    "birth_start_year",
    "birth_end_year",
    "birth_is_approximate",
    "death_label",
    "death_calendar_era",
    "death_start_year",
    "death_end_year",
    "death_is_approximate",
    "regions",
    "religions",
    "sects",
    "periods",
]


def ensure_pantheon_cache() -> None:
    if PANTHEON_CACHE.exists():
        return

    subprocess.run(
        ["curl", "-L", "--max-time", "60", PANTHEON_URL, "-o", str(PANTHEON_CACHE)],
        check=True,
    )


def load_existing_seed_rows() -> list[dict[str, str]]:
    with SOURCE_CSV.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        rows = []
        for row in reader:
            rows.append(
                {
                    "name": row["name"],
                    "reading": "",
                    "aliases": row["aliases"],
                    "note": row["note"],
                    "birth_label": row["birth_label"],
                    "birth_calendar_era": row["birth_calendar_era"],
                    "birth_start_year": row["birth_start_year"],
                    "birth_end_year": row["birth_end_year"],
                    "birth_is_approximate": row["birth_is_approximate"],
                    "death_label": row["death_label"],
                    "death_calendar_era": row["death_calendar_era"],
                    "death_start_year": row["death_start_year"],
                    "death_end_year": row["death_end_year"],
                    "death_is_approximate": row["death_is_approximate"],
                    "regions": row["regions"],
                    "religions": row["religions"],
                    "sects": row["sects"],
                    "periods": row["periods"],
                }
            )
        return rows


def load_top_pantheon_people(limit: int) -> list[dict[str, str]]:
    ensure_pantheon_cache()

    people: list[dict[str, str]] = []
    with bz2.open(PANTHEON_CACHE, "rt", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            if row["is_group"] == "TRUE" or row["alive"] == "TRUE":
                continue
            people.append(row)
            if len(people) >= limit:
                break
    return people


def fetch_japanese_names(wd_ids: list[str]) -> dict[str, str]:
    results: dict[str, str] = {}
    chunk_size = 50
    total_chunks = math.ceil(len(wd_ids) / chunk_size)
    WIKIDATA_CACHE_DIR.mkdir(parents=True, exist_ok=True)

    for chunk_index in range(total_chunks):
        chunk = wd_ids[chunk_index * chunk_size : (chunk_index + 1) * chunk_size]
        cache_path = WIKIDATA_CACHE_DIR / f"chunk_{chunk_index:02d}.json"
        if cache_path.exists():
            payload = json.loads(cache_path.read_text(encoding="utf-8"))
        else:
            query = urllib.parse.urlencode(
                {
                    "action": "wbgetentities",
                    "ids": "|".join(chunk),
                    "props": "sitelinks|labels",
                    "sitefilter": "jawiki",
                    "languages": "ja",
                    "format": "json",
                }
            )
            response = subprocess.run(
                ["curl", "-L", "--max-time", "30", f"{WIKIDATA_API}?{query}"],
                check=True,
                capture_output=True,
                text=True,
            )
            cache_path.write_text(response.stdout, encoding="utf-8")
            payload = json.loads(response.stdout)

        for wd_id, entity in payload.get("entities", {}).items():
            sitelinks = entity.get("sitelinks", {})
            labels = entity.get("labels", {})
            title = sitelinks.get("jawiki", {}).get("title")
            label = labels.get("ja", {}).get("value")
            if title:
                results[wd_id] = title
            elif label:
                results[wd_id] = label

    return results


def format_year(raw_year: str) -> tuple[str, str]:
    if not raw_year:
        return "", ""

    year = int(raw_year)
    if year < 0:
        return "BCE", str(abs(year))
    return "CE", str(year)


def build_note(row: dict[str, str]) -> str:
    parts = [f"Pantheon職業: {row['occupation'].title()}"]
    if row["bplace_country"]:
        parts.append(f"出生国: {row['bplace_country']}")
    if row["bplace_name"]:
        parts.append(f"出生地: {row['bplace_name']}")
    return " / ".join(parts)


def build_generated_row(row: dict[str, str], ja_names: dict[str, str]) -> dict[str, str]:
    birth_era, birth_year = format_year(row["birthyear"])
    death_era, death_year = format_year(row["deathyear"])
    ja_name = ja_names.get(row["wd_id"], row["name"])

    return {
        "name": ja_name,
        "reading": "",
        "aliases": row["name"],
        "note": build_note(row),
        "birth_label": "",
        "birth_calendar_era": birth_era,
        "birth_start_year": birth_year,
        "birth_end_year": "",
        "birth_is_approximate": "false",
        "death_label": "",
        "death_calendar_era": death_era,
        "death_start_year": death_year,
        "death_end_year": "",
        "death_is_approximate": "false",
        "regions": "",
        "religions": "",
        "sects": "",
        "periods": "",
    }


def row_key(row: dict[str, str]) -> tuple[str, ...]:
    return tuple(row[header] for header in OUTPUT_HEADERS)


def write_output(rows: list[dict[str, str]]) -> None:
    OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_CSV.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=OUTPUT_HEADERS)
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    target_count = 1000
    existing_rows = load_existing_seed_rows()
    if len(existing_rows) > target_count:
        existing_rows = existing_rows[:target_count]

    pantheon_people = load_top_pantheon_people(target_count + 200)
    remaining_people = pantheon_people[len(existing_rows) :]
    ja_names = fetch_japanese_names([row["wd_id"] for row in remaining_people])

    rows = list(existing_rows)
    seen = {row_key(row) for row in existing_rows}
    for person in remaining_people:
        generated = build_generated_row(person, ja_names)
        key = row_key(generated)
        if key in seen:
            continue
        rows.append(generated)
        seen.add(key)
        if len(rows) >= target_count:
            break

    write_output(rows)
    print(f"wrote {len(rows)} rows to {OUTPUT_CSV}")


if __name__ == "__main__":
    main()
