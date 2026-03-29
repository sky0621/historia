import { NextResponse } from "next/server";
import { buildRegionsCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildRegionsCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="historia-regions.csv"'
    }
  });
}
