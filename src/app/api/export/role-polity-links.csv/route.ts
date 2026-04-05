import { NextResponse } from "next/server";
import { buildCsvDownloadDisposition } from "@/app/api/export/content-disposition";
import { buildRolePolityLinksCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildRolePolityLinksCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": buildCsvDownloadDisposition("役職国家紐付け.csv")
    }
  });
}

export const POST = GET;
