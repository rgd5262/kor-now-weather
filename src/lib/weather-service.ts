import { DEFAULT_LOCATION, LOCATIONS } from "./locations";
import type { LocationCandidate, WeatherBundle } from "./types";
import { buildWeatherBundle, getKmaItems } from "./weather-utils";

const CACHE_TTL_MS = 30 * 60 * 1000;
const DEFAULT_PROXY = "https://k-skill-proxy.nomadamas.org";

type CacheRecord = {
  expiresAt: number;
  value: WeatherBundle;
};

type WeatherRequest = {
  lat?: number;
  lon?: number;
  nx?: number;
  ny?: number;
  name?: string;
};

const cache = new Map<string, CacheRecord>();
const inflight = new Map<string, Promise<WeatherBundle>>();

export class WeatherServiceError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

function roundCoord(value: number) {
  return Math.round(value * 10000) / 10000;
}

function makeLocation(request: WeatherRequest): LocationCandidate {
  if (request.name) {
    const byName = LOCATIONS.find((location) => location.name === request.name || location.aliases.includes(request.name ?? ""));
    if (byName) {
      return byName;
    }
  }

  if (Number.isFinite(request.lat) && Number.isFinite(request.lon)) {
    return {
      name: request.name || "현재 위치",
      aliases: [],
      lat: Number(request.lat),
      lon: Number(request.lon),
    };
  }

  if (Number.isFinite(request.nx) && Number.isFinite(request.ny)) {
    return {
      name: request.name || "격자 위치",
      aliases: [],
      lat: DEFAULT_LOCATION.lat,
      lon: DEFAULT_LOCATION.lon,
      nx: Number(request.nx),
      ny: Number(request.ny),
    };
  }

  return DEFAULT_LOCATION;
}

function cacheKey(location: LocationCandidate) {
  if (Number.isFinite(location.nx) && Number.isFinite(location.ny)) {
    return `grid:${location.nx}:${location.ny}`;
  }
  return `geo:${roundCoord(location.lat)}:${roundCoord(location.lon)}`;
}

async function fetchWeather(location: LocationCandidate) {
  const base = (process.env.KSKILL_PROXY_BASE_URL || DEFAULT_PROXY).replace(/\/$/, "");
  const url = new URL(`${base}/v1/korea-weather/forecast`);

  if (Number.isFinite(location.nx) && Number.isFinite(location.ny)) {
    url.searchParams.set("nx", String(location.nx));
    url.searchParams.set("ny", String(location.ny));
  } else {
    url.searchParams.set("lat", String(location.lat));
    url.searchParams.set("lon", String(location.lon));
  }
  url.searchParams.set("numOfRows", "1000");

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    const message = response.status === 429
      ? "날씨 데이터 요청이 많아 잠시 후 다시 시도해 주세요."
      : "날씨 데이터를 가져오지 못했습니다.";
    throw new WeatherServiceError(message, response.status === 429 ? 429 : 502);
  }

  const payload = await response.json();
  const items = getKmaItems(payload);
  if (!items.length) {
    throw new WeatherServiceError("표시할 예보 데이터가 없습니다.", 502);
  }

  return buildWeatherBundle(items, location);
}

export async function getWeatherBundle(request: WeatherRequest): Promise<WeatherBundle> {
  const location = makeLocation(request);
  const key = cacheKey(location);
  const cached = cache.get(key);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const pending = inflight.get(key);
  if (pending) {
    return pending;
  }

  const requestPromise = fetchWeather(location)
    .then((value) => {
      cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
      return value;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, requestPromise);
  return requestPromise;
}

export function parseWeatherRequest(searchParams: URLSearchParams): WeatherRequest {
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  const nx = Number(searchParams.get("nx"));
  const ny = Number(searchParams.get("ny"));

  return {
    lat: Number.isFinite(lat) ? lat : undefined,
    lon: Number.isFinite(lon) ? lon : undefined,
    nx: Number.isFinite(nx) ? nx : undefined,
    ny: Number.isFinite(ny) ? ny : undefined,
    name: searchParams.get("name") ?? undefined,
  };
}
