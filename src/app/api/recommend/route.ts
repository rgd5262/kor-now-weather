import { NextResponse } from "next/server";
import { recommendActivities } from "@/lib/recommendation";
import type { WeatherPoint } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { locationName?: string; weather?: WeatherPoint };
    if (!body.locationName || !body.weather) {
      return NextResponse.json({ message: "추천에 필요한 날씨 정보가 없습니다." }, { status: 400 });
    }

    const recommendations = await recommendActivities(body.locationName, body.weather);
    return NextResponse.json({ recommendations });
  } catch {
    return NextResponse.json(
      { message: "추천 서비스 일시 이용 불가. 잠시 후 다시 시도해 주세요." },
      { status: 503 },
    );
  }
}
