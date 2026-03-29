import { NextResponse } from "next/server";
import { buildReligionsCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildReligionsCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="historia-religions.csv"'
    }
  });
}
