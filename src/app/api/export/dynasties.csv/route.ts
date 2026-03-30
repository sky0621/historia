import { NextResponse } from "next/server";
import { buildCsvDownloadDisposition } from "@/app/api/export/content-disposition";
import { buildDynastiesCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildDynastiesCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": buildCsvDownloadDisposition("王朝.csv")
    }
  });
}

export const POST = GET;
