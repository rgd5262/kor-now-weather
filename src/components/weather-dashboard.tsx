"use client";

import { useEffect, useEffectEvent, useState, useTransition } from "react";
import {
  CloudRain,
  Compass,
  LocateFixed,
  Moon,
  RefreshCw,
  Search,
  Sparkles,
  Sun,
  ThermometerSun,
  Umbrella,
  Waves,
  Wind,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DEFAULT_LOCATION } from "@/lib/locations";
import type { ActivityRecommendation, LocationCandidate, WeatherBundle, WeatherPoint } from "@/lib/types";

type LoadState = "idle" | "loading" | "success" | "error";

const RECENT_KEY = "weatherwise-recent-locations";

function getWeatherIcon(point?: WeatherPoint | null) {
  if (!point) return "☁️";
  if (point.precipitationText !== "없음") {
    if (point.precipitationText.includes("눈")) return "❄️";
    return "🌧️";
  }
  if (point.skyText === "맑음") return "☀️";
  if (point.skyText === "구름많음") return "⛅";
  return "☁️";
}

function weatherQuery(location: LocationCandidate) {
  const params = new URLSearchParams({ name: location.name });
  if (Number.isFinite(location.nx) && Number.isFinite(location.ny)) {
    params.set("nx", String(location.nx));
    params.set("ny", String(location.ny));
  } else {
    params.set("lat", String(location.lat));
    params.set("lon", String(location.lon));
  }
  return params.toString();
}

function formatUpdatedAt(value?: string) {
  if (!value) return "업데이트 정보 없음";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function readRecent() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]") as LocationCandidate[];
  } catch {
    return [];
  }
}

function readTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const storedTheme = window.localStorage.getItem("weatherwise-theme") as "light" | "dark" | null;
  return storedTheme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}

function writeRecent(location: LocationCandidate) {
  const next = [location, ...readRecent().filter((item) => item.name !== location.name)].slice(0, 5);
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[var(--line)] bg-white/35 p-4 dark:bg-white/5">
      <div className="mb-2 flex items-center gap-2 text-sm text-[var(--muted)]">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      {[0, 1, 2].map((item) => (
        <div key={item} className="glass-card min-h-64 animate-pulse rounded-[2rem] p-6">
          <div className="h-7 w-40 rounded-full bg-black/10 dark:bg-white/10" />
          <div className="mt-8 h-16 w-48 rounded-full bg-black/10 dark:bg-white/10" />
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="h-20 rounded-3xl bg-black/10 dark:bg-white/10" />
            <div className="h-20 rounded-3xl bg-black/10 dark:bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function WeatherDashboard() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [location, setLocation] = useState<LocationCandidate>(DEFAULT_LOCATION);
  const [bundle, setBundle] = useState<WeatherBundle | null>(null);
  const [status, setStatus] = useState<LoadState>("idle");
  const [message, setMessage] = useState("위치 권한을 확인하는 중입니다.");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationCandidate[]>([]);
  const [recent, setRecent] = useState<LocationCandidate[]>([]);
  const [recommendations, setRecommendations] = useState<ActivityRecommendation[]>([]);
  const [recommendStatus, setRecommendStatus] = useState<LoadState>("idle");
  const [isPending, startTransition] = useTransition();

  const initializeClientState = useEffectEvent((initialTheme: "light" | "dark") => {
    setTheme(initialTheme);
    setRecent(readRecent());
    requestLocation();
  });

  async function loadWeather(nextLocation: LocationCandidate, notice?: string) {
    setStatus("loading");
    setMessage(notice ?? `${nextLocation.name} 날씨를 불러오는 중입니다.`);
    setRecommendations([]);

    try {
      const response = await fetch(`/api/weather/current?${weatherQuery(nextLocation)}`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "날씨 데이터를 가져오지 못했습니다.");
      }
      setBundle(payload as WeatherBundle);
      setLocation(nextLocation);
      setRecent(writeRecent(nextLocation));
      setStatus("success");
      setMessage("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "날씨 데이터를 가져오지 못했습니다.");
    }
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      void loadWeather(DEFAULT_LOCATION, "브라우저 위치 기능을 사용할 수 없어 서울시청 기준으로 표시합니다.");
      return;
    }

    setMessage("현재 위치 권한을 요청하고 있습니다.");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const current: LocationCandidate = {
          name: "현재 위치",
          aliases: [],
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        void loadWeather(current);
      },
      () => {
        void loadWeather(DEFAULT_LOCATION, "위치 권한이 없어 서울시청 기준으로 표시합니다.");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 },
    );
  }

  async function searchLocation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;

    const response = await fetch(`/api/geocode?q=${encodeURIComponent(value)}`);
    const payload = await response.json();
    if (!response.ok || !payload.results?.length) {
      setResults([]);
      setMessage(payload.message ?? "검색 결과가 없습니다.");
      return;
    }

    const nextResults = payload.results as LocationCandidate[];
    setResults(nextResults);
    void loadWeather(nextResults[0], `${nextResults[0].name} 지역으로 이동합니다.`);
  }

  async function requestRecommendation() {
    if (!bundle?.current) return;
    setRecommendStatus("loading");
    setRecommendations([]);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locationName: bundle.location.name, weather: bundle.current }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "현재 추천을 가져올 수 없습니다.");
      }
      setRecommendations(payload.recommendations as ActivityRecommendation[]);
      setRecommendStatus("success");
    } catch (error) {
      setRecommendStatus("error");
      setMessage(error instanceof Error ? error.message : "현재 추천을 가져올 수 없습니다.");
    }
  }

  useEffect(() => {
    const initial = readTheme();
    document.documentElement.classList.toggle("dark", initial === "dark");
    const timer = window.setTimeout(() => initializeClientState(initial), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    window.localStorage.setItem("weatherwise-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  const current = bundle?.current;
  const chartData = (bundle?.hourly ?? []).map((point) => ({
    time: point.label,
    기온: point.temperature,
    강수확률: point.precipitationProbability,
  }));

  return (
    <main className="weather-shell min-h-screen overflow-hidden px-4 py-5 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="glass-card-strong float-in sticky top-4 z-20 rounded-[2rem] p-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 px-2">
              <div className="grid size-12 place-items-center rounded-2xl bg-[var(--foreground)] text-2xl text-[var(--background)]">
                {getWeatherIcon(current)}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">WeatherWise KR</p>
                <h1 className="font-display text-3xl tracking-tight sm:text-4xl">오늘의 하늘 결정판</h1>
              </div>
            </div>

            <form onSubmit={searchLocation} className="flex flex-1 flex-col gap-2 sm:flex-row lg:max-w-2xl">
              <label className="relative flex-1">
                <span className="sr-only">지역 검색</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="강남구, 해운대, 전주..."
                  className="h-14 w-full rounded-2xl border border-[var(--line)] bg-white/70 pl-12 pr-4 text-base shadow-inner dark:bg-black/20"
                />
              </label>
              <button
                type="submit"
                className="h-14 rounded-2xl bg-[var(--foreground)] px-6 font-bold text-[var(--background)] transition hover:scale-[1.02]"
              >
                검색
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="grid h-14 place-items-center rounded-2xl border border-[var(--line)] bg-white/50 px-4 dark:bg-white/5"
                aria-label="다크 모드 전환"
              >
                {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
              </button>
            </form>
          </div>
        </header>

        {message ? (
          <section className="glass-card float-in flex flex-col gap-3 rounded-[1.5rem] p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Compass className="size-4 text-[var(--accent-cool)]" />
              <p>{message}</p>
            </div>
            <button
              type="button"
              onClick={requestLocation}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent-cool)] px-4 py-2 font-bold text-white"
            >
              <LocateFixed className="size-4" />
              위치 다시 요청
            </button>
          </section>
        ) : null}

        {results.length || recent.length ? (
          <section className="float-in flex flex-wrap gap-2" aria-label="빠른 지역 선택">
            {[...results, ...recent].slice(0, 8).map((item) => (
              <button
                key={`${item.name}-${item.lat}-${item.lon}`}
                type="button"
                onClick={() => startTransition(() => void loadWeather(item))}
                className="rounded-full border border-[var(--line)] bg-white/45 px-4 py-2 text-sm font-bold transition hover:bg-white/80 dark:bg-white/5 dark:hover:bg-white/10"
              >
                {item.name}
              </button>
            ))}
          </section>
        ) : null}

        {status === "loading" && !bundle ? <Skeleton /> : null}

        {status === "error" && !bundle ? (
          <section className="glass-card-strong float-in rounded-[2rem] p-8 text-center">
            <p className="text-2xl font-bold">날씨를 불러오지 못했습니다</p>
            <p className="mt-3 text-[var(--muted)]">{message}</p>
            <button
              type="button"
              onClick={() => void loadWeather(location)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] px-5 py-3 font-bold text-[var(--background)]"
            >
              <RefreshCw className="size-4" />
              재시도
            </button>
          </section>
        ) : null}

        {bundle ? (
          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="glass-card-strong float-in rounded-[2.2rem] p-6 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm text-[var(--muted)]">{bundle.location.address ?? "선택한 좌표 기준"}</p>
                  <h2 className="mt-2 font-display text-5xl tracking-tight sm:text-6xl">{bundle.location.name}</h2>
                  <p className="mt-3 text-sm text-[var(--muted)]">
                    마지막 업데이트 {formatUpdatedAt(bundle.updatedAt)} KST
                  </p>
                </div>
                <button
                  type="button"
                  onClick={requestLocation}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white/45 px-5 py-3 font-bold dark:bg-white/5"
                >
                  <LocateFixed className="size-4" />
                  현재 위치 사용
                </button>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1fr]">
                <div className="rounded-[2rem] bg-[var(--foreground)] p-6 text-[var(--background)]">
                  <div className="text-7xl" role="img" aria-label={current?.skyText ?? "날씨 아이콘"}>
                    {getWeatherIcon(current)}
                  </div>
                  <div className="mt-8 flex items-end gap-2">
                    <span className="font-display text-8xl leading-none">
                      {current?.temperature ?? "--"}
                    </span>
                    <span className="pb-3 text-3xl">℃</span>
                  </div>
                  <p className="mt-4 text-xl font-bold">
                    {current?.skyText ?? "정보 없음"} · {current?.precipitationText ?? "정보 없음"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Metric icon={<Umbrella className="size-4" />} label="강수확률" value={`${current?.precipitationProbability ?? "--"}%`} />
                  <Metric icon={<Waves className="size-4" />} label="습도" value={`${current?.humidity ?? "--"}%`} />
                  <Metric icon={<Wind className="size-4" />} label="풍속" value={`${current?.windSpeed ?? "--"} m/s`} />
                  <Metric icon={<CloudRain className="size-4" />} label="강수량" value={current?.precipitationAmount ?? "없음"} />
                </div>
              </div>
            </section>

            <aside className="glass-card float-in rounded-[2.2rem] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-[var(--muted)]">AI 야외활동 추천</p>
                  <h2 className="mt-1 text-2xl font-black">오늘 뭐하지?</h2>
                </div>
                <Sparkles className="size-7 text-[var(--accent)]" />
              </div>
              <button
                type="button"
                disabled={!current || recommendStatus === "loading"}
                onClick={requestRecommendation}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-4 font-black text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {recommendStatus === "loading" ? "추천 생성 중..." : "활동 추천받기"}
              </button>

              <div className="mt-5 space-y-3">
                {recommendStatus === "loading" ? (
                  [0, 1, 2].map((item) => (
                    <div key={item} className="h-28 animate-pulse rounded-3xl bg-black/10 dark:bg-white/10" />
                  ))
                ) : null}
                {recommendStatus === "error" ? (
                  <div className="rounded-3xl border border-[var(--line)] p-4 text-sm text-[var(--danger)]">
                    현재 추천을 가져올 수 없습니다. 잠시 후 재시도해 주세요.
                  </div>
                ) : null}
                {recommendations.map((item) => (
                  <article key={item.title} className="rounded-3xl border border-[var(--line)] bg-white/40 p-4 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl" aria-hidden>{item.icon}</span>
                      <h3 className="text-lg font-black">{item.title}</h3>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.reason}</p>
                    {item.caution ? <p className="mt-2 text-sm font-bold text-[var(--danger)]">{item.caution}</p> : null}
                  </article>
                ))}
              </div>
            </aside>

            <section className="glass-card float-in rounded-[2.2rem] p-6 xl:col-span-2">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm text-[var(--muted)]">향후 24시간</p>
                  <h2 className="text-2xl font-black">기온 흐름과 시간별 예보</h2>
                </div>
                {isPending ? <span className="text-sm text-[var(--muted)]">지역 전환 중...</span> : null}
              </div>
              <div className="h-72 min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={320} minHeight={260}>
                  <AreaChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tempFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--line)" strokeDasharray="4 4" />
                    <XAxis dataKey="time" tick={{ fill: "var(--muted)", fontSize: 12 }} minTickGap={24} />
                    <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} unit="℃" />
                    <Tooltip contentStyle={{ borderRadius: 18, border: "1px solid var(--line)" }} />
                    <Area type="monotone" dataKey="기온" stroke="var(--accent)" strokeWidth={3} fill="url(#tempFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="scrollbar-none mt-5 flex gap-3 overflow-x-auto pb-2">
                {bundle.hourly.map((point) => (
                  <article key={point.isoTime} className="min-w-28 rounded-3xl border border-[var(--line)] bg-white/35 p-4 text-center dark:bg-white/5">
                    <p className="text-sm text-[var(--muted)]">{point.label}</p>
                    <div className="my-3 text-3xl" role="img" aria-label={`${point.skyText} ${point.precipitationText}`}>
                      {getWeatherIcon(point)}
                    </div>
                    <p className="text-xl font-black">{point.temperature ?? "--"}℃</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{point.precipitationProbability ?? "--"}%</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="glass-card float-in rounded-[2.2rem] p-6 xl:col-span-2">
              <div className="mb-5">
                <p className="text-sm text-[var(--muted)]">단기예보 기반</p>
                <h2 className="text-2xl font-black">주간 예보</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {bundle.weekly.map((day) => (
                  <article key={day.date} className="rounded-3xl border border-[var(--line)] bg-white/35 p-5 dark:bg-white/5">
                    <div className="flex items-center justify-between">
                      <p className="font-black">{day.weekday}</p>
                      <ThermometerSun className="size-5 text-[var(--accent)]" />
                    </div>
                    <p className="mt-4 text-3xl font-black">
                      {day.maxTemperature ?? "--"}° / {day.minTemperature ?? "--"}°
                    </p>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {day.skyText} · 강수 {day.precipitationProbability ?? "--"}%
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : null}

        <footer className="py-8 text-center text-sm text-[var(--muted)]">
          데이터 출처: 기상청 단기예보 · 단기예보 범위 내에서 주간 요약을 제공합니다.
        </footer>
      </div>
    </main>
  );
}
