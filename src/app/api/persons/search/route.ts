import { NextResponse } from "next/server";
import { searchPersonNamesByLike } from "@/server/repositories/person";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim() ?? "";
  const excludeId = Number(searchParams.get("excludeId") ?? "");

  if (name.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const items = searchPersonNamesByLike(name, Number.isFinite(excludeId) ? excludeId : undefined);
  return NextResponse.json({ items });
}
