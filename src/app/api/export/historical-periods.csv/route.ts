import { NextResponse } from "next/server";
import { buildCsvDownloadDisposition } from "@/app/api/export/content-disposition";
import { buildHistoricalPeriodsCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildHistoricalPeriodsCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": buildCsvDownloadDisposition("時代区分.csv")
    }
  });
}

export const POST = GET;
