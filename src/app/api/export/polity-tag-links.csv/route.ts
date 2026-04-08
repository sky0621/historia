import { NextResponse } from "next/server";
import { buildCsvDownloadDisposition } from "@/app/api/export/content-disposition";
import { buildPolityTagLinksCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildPolityTagLinksCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": buildCsvDownloadDisposition("国家タグ紐付け.csv")
    }
  });
}

export const POST = GET;
