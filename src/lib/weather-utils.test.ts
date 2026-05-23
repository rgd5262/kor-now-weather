import { describe, expect, it } from "vitest";
import { DEFAULT_LOCATION } from "./locations";
import { buildWeatherBundle, getKmaItems, parseForecastItems } from "./weather-utils";

const sampleItems = [
  { baseDate: "20260523", baseTime: "0500", fcstDate: "20260523", fcstTime: "1200", category: "TMP", fcstValue: "22" },
  { baseDate: "20260523", baseTime: "0500", fcstDate: "20260523", fcstTime: "1200", category: "SKY", fcstValue: "1" },
  { baseDate: "20260523", baseTime: "0500", fcstDate: "20260523", fcstTime: "1200", category: "PTY", fcstValue: "0" },
  { baseDate: "20260523", baseTime: "0500", fcstDate: "20260523", fcstTime: "1200", category: "POP", fcstValue: "10" },
  { baseDate: "20260523", baseTime: "0500", fcstDate: "20260523", fcstTime: "1200", category: "REH", fcstValue: "55" },
  { baseDate: "20260523", baseTime: "0500", fcstDate: "20260523", fcstTime: "1200", category: "WSD", fcstValue: "2.5" },
  { baseDate: "20260523", baseTime: "0500", fcstDate: "20260523", fcstTime: "1500", category: "TMP", fcstValue: "24" },
  { baseDate: "20260523", baseTime: "0500", fcstDate: "20260523", fcstTime: "1500", category: "SKY", fcstValue: "3" },
  { baseDate: "20260523", baseTime: "0500", fcstDate: "20260523", fcstTime: "1500", category: "POP", fcstValue: "30" },
  { baseDate: "20260523", baseTime: "0500", fcstDate: "20260524", fcstTime: "0600", category: "TMP", fcstValue: "18" },
  { baseDate: "20260523", baseTime: "0500", fcstDate: "20260524", fcstTime: "1500", category: "TMX", fcstValue: "25" },
];

describe("weather forecast utilities", () => {
  it("extracts standard KMA item arrays", () => {
    const payload = { response: { body: { items: { item: sampleItems } } } };
    expect(getKmaItems(payload)).toHaveLength(sampleItems.length);
  });

  it("maps KMA categories into display values", () => {
    const { points, baseDate, baseTime } = parseForecastItems(sampleItems);
    expect(baseDate).toBe("20260523");
    expect(baseTime).toBe("0500");
    expect(points[0]).toMatchObject({
      temperature: 22,
      skyText: "맑음",
      precipitationText: "없음",
      precipitationProbability: 10,
      humidity: 55,
      windSpeed: 2.5,
    });
  });

  it("builds current, hourly, and short-range weekly summaries", () => {
    const bundle = buildWeatherBundle(sampleItems, DEFAULT_LOCATION, new Date("2026-05-23T11:30:00+09:00"));
    expect(bundle.current?.time).toBe("1200");
    expect(bundle.hourly.length).toBeGreaterThan(1);
    expect(bundle.weekly).toHaveLength(2);
    expect(bundle.weekly[0].maxTemperature).toBe(24);
    expect(bundle.weekly[1].maxTemperature).toBe(25);
  });
});
