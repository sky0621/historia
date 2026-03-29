import { NextResponse } from "next/server";
import { buildCsvDownloadDisposition } from "@/app/api/export/content-disposition";
import { buildRegionsCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildRegionsCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": buildCsvDownloadDisposition("地域.csv")
    }
  });
}

export const POST = GET;
