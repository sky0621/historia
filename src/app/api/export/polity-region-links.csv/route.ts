import { NextResponse } from "next/server";
import { buildCsvDownloadDisposition } from "@/app/api/export/content-disposition";
import { buildPolityRegionLinksCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildPolityRegionLinksCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": buildCsvDownloadDisposition("国家地域紐付け.csv")
    }
  });
}

export const POST = GET;
