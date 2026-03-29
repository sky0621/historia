import { NextResponse } from "next/server";
import { buildSectsCsv } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(buildSectsCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="historia-sects.csv"'
    }
  });
}
