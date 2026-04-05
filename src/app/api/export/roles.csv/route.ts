import { NextResponse } from "next/server";
import { buildCsvDownloadDisposition } from "@/app/api/export/content-disposition";
import { buildRolesCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildRolesCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": buildCsvDownloadDisposition("役職.csv")
    }
  });
}

export const POST = GET;
