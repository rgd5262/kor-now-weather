import { NextResponse } from "next/server";
import { searchLocations } from "@/lib/locations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const results = searchLocations(query);

  if (!results.length) {
    return NextResponse.json(
      { results: [], message: "해당 지역을 찾지 못했습니다. 더 큰 행정구역명으로 검색해 주세요." },
      { status: 404 },
    );
  }

  return NextResponse.json({ results });
}
