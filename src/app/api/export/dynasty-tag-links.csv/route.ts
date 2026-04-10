import { NextResponse } from "next/server";
import { buildCsvDownloadDisposition } from "@/app/api/export/content-disposition";
import { buildDynastyTagLinksCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildDynastyTagLinksCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": buildCsvDownloadDisposition("王朝タグ紐付け.csv")
    }
  });
}

export const POST = GET;
