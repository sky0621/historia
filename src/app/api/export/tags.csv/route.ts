import { NextResponse } from "next/server";
import { buildCsvDownloadDisposition } from "@/app/api/export/content-disposition";
import { buildTagsCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildTagsCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": buildCsvDownloadDisposition("タグ.csv")
    }
  });
}

export const POST = GET;
