import { NextResponse } from "next/server";
import { buildHistoricalPeriodCategoryLinksCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildHistoricalPeriodCategoryLinksCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="historia-historical-period-category-links.csv"'
    }
  });
}
