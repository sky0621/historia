import { NextResponse } from "next/server";
import { buildCsvDownloadDisposition } from "@/app/api/export/content-disposition";
import { buildPersonReligionLinksCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildPersonReligionLinksCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": buildCsvDownloadDisposition("人物宗教紐付け.csv")
    }
  });
}

export const POST = GET;
