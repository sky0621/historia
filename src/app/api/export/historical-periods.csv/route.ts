import { NextResponse } from "next/server";
import { buildHistoricalPeriodsCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildHistoricalPeriodsCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="historia-historical-periods.csv"'
    }
  });
}
