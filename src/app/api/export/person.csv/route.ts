import { NextResponse } from "next/server";
import { buildPersonCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildPersonCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="historia-person.csv"'
    }
  });
}
