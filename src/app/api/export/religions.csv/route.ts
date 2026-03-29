import { NextResponse } from "next/server";
import { buildCsvDownloadDisposition } from "@/app/api/export/content-disposition";
import { buildReligionsCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildReligionsCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": buildCsvDownloadDisposition("宗教.csv")
    }
  });
}

export const POST = GET;
