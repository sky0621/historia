import { NextResponse } from "next/server";
import { buildCsvDownloadDisposition } from "@/app/api/export/content-disposition";
import { buildPersonTagLinksCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildPersonTagLinksCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": buildCsvDownloadDisposition("人物タグ紐付け.csv")
    }
  });
}

export const POST = GET;
