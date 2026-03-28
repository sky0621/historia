import { NextResponse } from "next/server";
import { buildPolitiesCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildPolitiesCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="historia-polities.csv"'
    }
  });
}
