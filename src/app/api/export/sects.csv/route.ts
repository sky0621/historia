import { NextResponse } from "next/server";
import { buildCsvDownloadDisposition } from "@/app/api/export/content-disposition";
import { buildSectsCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildSectsCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": buildCsvDownloadDisposition("宗派.csv")
    }
  });
}

export const POST = GET;
