import { NextResponse } from "next/server";
import { buildPeopleCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildPeopleCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="historia-people.csv"'
    }
  });
}
