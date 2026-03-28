import { NextResponse } from "next/server";
import { buildPeriodCategoriesCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildPeriodCategoriesCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="historia-period-categories.csv"'
    }
  });
}
