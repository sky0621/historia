import { NextResponse } from "next/server";
import { buildExportPayload } from "@/server/services/import-export";

export function GET() {
  return new NextResponse(JSON.stringify(buildExportPayload(), null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": 'attachment; filename="historia-export.json"'
    }
  });
}
