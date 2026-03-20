import { NextResponse } from "next/server";
import { buildEventsCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildEventsCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="historia-events.csv"'
    }
  });
}
