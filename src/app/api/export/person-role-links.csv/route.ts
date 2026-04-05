import { NextResponse } from "next/server";
import { buildCsvDownloadDisposition } from "@/app/api/export/content-disposition";
import { buildPersonRoleLinksCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildPersonRoleLinksCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": buildCsvDownloadDisposition("人物役職紐付け.csv")
    }
  });
}

export const POST = GET;
