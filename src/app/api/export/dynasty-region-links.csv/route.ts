import { NextResponse } from "next/server";
import { buildCsvDownloadDisposition } from "@/app/api/export/content-disposition";
import { buildDynastyRegionLinksCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildDynastyRegionLinksCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": buildCsvDownloadDisposition("王朝地域紐付け.csv")
    }
  });
}

export const POST = GET;
