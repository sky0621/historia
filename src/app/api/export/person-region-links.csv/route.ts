import { NextResponse } from "next/server";
import { buildCsvDownloadDisposition } from "@/app/api/export/content-disposition";
import { buildPersonRegionLinksCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildPersonRegionLinksCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": buildCsvDownloadDisposition("人物地域紐付け.csv")
    }
  });
}

export const POST = GET;
