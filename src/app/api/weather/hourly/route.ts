import { NextResponse } from "next/server";
import { getWeatherBundle, parseWeatherRequest, WeatherServiceError } from "@/lib/weather-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bundle = await getWeatherBundle(parseWeatherRequest(searchParams));
    return NextResponse.json({
      location: bundle.location,
      hourly: bundle.hourly,
      updatedAt: bundle.updatedAt,
    });
  } catch (error) {
    const status = error instanceof WeatherServiceError ? error.status : 500;
    const message = error instanceof Error ? error.message : "시간별 예보를 가져오지 못했습니다.";
    return NextResponse.json({ message }, { status });
  }
}
