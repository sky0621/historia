import { NextResponse } from "next/server";
import { buildCsvDownloadDisposition } from "@/app/api/export/content-disposition";
import { buildPeriodCategoriesCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildPeriodCategoriesCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": buildCsvDownloadDisposition("時代区分カテゴリ.csv")
    }
  });
}

export const POST = GET;
