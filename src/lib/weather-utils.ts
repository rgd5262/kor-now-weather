import type { LocationCandidate, WeatherBundle, WeatherPoint, WeeklyForecast } from "./types";

type KmaItem = {
  baseDate?: string;
  baseTime?: string;
  category?: string;
  fcstDate?: string;
  fcstTime?: string;
  fcstValue?: string | number;
};

const SKY_TEXT: Record<string, string> = {
  "1": "맑음",
  "3": "구름많음",
  "4": "흐림",
};

const PTY_TEXT: Record<string, string> = {
  "0": "없음",
  "1": "비",
  "2": "비/눈",
  "3": "눈",
  "4": "소나기",
};

function toNumber(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }
  const match = String(value).match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function toText(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }
  const text = String(value).trim();
  if (!text || text === "강수없음" || text === "적설없음") {
    return null;
  }
  return text;
}

export function getKmaItems(payload: unknown): KmaItem[] {
  const root = payload as {
    response?: { body?: { items?: { item?: KmaItem[] } | KmaItem[] } };
    body?: { items?: { item?: KmaItem[] } | KmaItem[] };
    items?: { item?: KmaItem[] } | KmaItem[];
  };

  const candidates = [root.response?.body?.items, root.body?.items, root.items];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
    if (Array.isArray(candidate?.item)) {
      return candidate.item;
    }
  }

  return [];
}

export function toKstIso(date: string, time: string) {
  const year = date.slice(0, 4);
  const month = date.slice(4, 6);
  const day = date.slice(6, 8);
  const hour = time.slice(0, 2);
  const minute = time.slice(2, 4);
  return `${year}-${month}-${day}T${hour}:${minute}:00+09:00`;
}

function formatHourLabel(isoTime: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(isoTime));
}

function formatWeekday(date: string) {
  const iso = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T12:00:00+09:00`;
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    weekday: "short",
    month: "numeric",
    day: "numeric",
  }).format(new Date(iso));
}

function emptyPoint(date: string, time: string): WeatherPoint {
  const isoTime = toKstIso(date, time);
  return {
    date,
    time,
    isoTime,
    label: formatHourLabel(isoTime),
    temperature: null,
    skyCode: null,
    skyText: "정보 없음",
    precipitationCode: null,
    precipitationText: "없음",
    precipitationProbability: null,
    humidity: null,
    windSpeed: null,
    precipitationAmount: null,
    snowfall: null,
    minTemperature: null,
    maxTemperature: null,
  };
}

export function parseForecastItems(items: KmaItem[]) {
  const points = new Map<string, WeatherPoint>();
  let baseDate: string | null = null;
  let baseTime: string | null = null;

  for (const item of items) {
    if (!item.fcstDate || !item.fcstTime || !item.category) {
      continue;
    }
    const key = `${item.fcstDate}-${item.fcstTime}`;
    const point = points.get(key) ?? emptyPoint(item.fcstDate, item.fcstTime);
    const value = item.fcstValue;

    baseDate = baseDate ?? item.baseDate ?? null;
    baseTime = baseTime ?? item.baseTime ?? null;

    switch (item.category) {
      case "TMP":
        point.temperature = toNumber(value);
        break;
      case "SKY": {
        const code = String(value);
        point.skyCode = code;
        point.skyText = SKY_TEXT[code] ?? "정보 없음";
        break;
      }
      case "PTY": {
        const code = String(value);
        point.precipitationCode = code;
        point.precipitationText = PTY_TEXT[code] ?? "정보 없음";
        break;
      }
      case "POP":
        point.precipitationProbability = toNumber(value);
        break;
      case "REH":
        point.humidity = toNumber(value);
        break;
      case "WSD":
        point.windSpeed = toNumber(value);
        break;
      case "PCP":
        point.precipitationAmount = toText(value);
        break;
      case "SNO":
        point.snowfall = toText(value);
        break;
      case "TMN":
        point.minTemperature = toNumber(value);
        break;
      case "TMX":
        point.maxTemperature = toNumber(value);
        break;
    }

    points.set(key, point);
  }

  return {
    points: [...points.values()].sort((a, b) => new Date(a.isoTime).getTime() - new Date(b.isoTime).getTime()),
    baseDate,
    baseTime,
  };
}

function mode(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "정보 없음";
}

function average(values: number[]) {
  if (!values.length) {
    return null;
  }
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function buildWeekly(points: WeatherPoint[]) {
  const grouped = new Map<string, WeatherPoint[]>();
  for (const point of points) {
    grouped.set(point.date, [...(grouped.get(point.date) ?? []), point]);
  }

  return [...grouped.entries()].slice(0, 7).map(([date, dayPoints]): WeeklyForecast => {
    const temperatures = dayPoints.flatMap((point) => point.temperature === null ? [] : [point.temperature]);
    const mins = dayPoints.flatMap((point) => point.minTemperature === null ? [] : [point.minTemperature]);
    const maxes = dayPoints.flatMap((point) => point.maxTemperature === null ? [] : [point.maxTemperature]);
    const pops = dayPoints.flatMap((point) => point.precipitationProbability === null ? [] : [point.precipitationProbability]);
    const precipitation = dayPoints
      .map((point) => point.precipitationText)
      .filter((value) => value && value !== "없음" && value !== "정보 없음");

    return {
      date,
      weekday: formatWeekday(date),
      minTemperature: mins[0] ?? (temperatures.length ? Math.min(...temperatures) : null),
      maxTemperature: maxes[0] ?? (temperatures.length ? Math.max(...temperatures) : null),
      skyText: mode(dayPoints.map((point) => point.skyText).filter((value) => value !== "정보 없음")),
      precipitationText: precipitation[0] ?? "없음",
      precipitationProbability: average(pops),
    };
  });
}

export function buildWeatherBundle(items: KmaItem[], location: LocationCandidate, now = new Date()): WeatherBundle {
  const { points, baseDate, baseTime } = parseForecastItems(items);
  const nowMs = now.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  const current = points
    .slice()
    .sort((a, b) => {
      const diffA = Math.abs(new Date(a.isoTime).getTime() - nowMs);
      const diffB = Math.abs(new Date(b.isoTime).getTime() - nowMs);
      return diffA - diffB;
    })[0] ?? null;

  const hourly = points
    .filter((point) => {
      const pointMs = new Date(point.isoTime).getTime();
      return pointMs >= nowMs - 60 * 60 * 1000 && pointMs <= nowMs + dayMs;
    })
    .slice(0, 24);

  return {
    location,
    current,
    hourly: hourly.length ? hourly : points.slice(0, 24),
    weekly: buildWeekly(points),
    updatedAt: new Date().toISOString(),
    baseDate,
    baseTime,
    rawCount: items.length,
  };
}
