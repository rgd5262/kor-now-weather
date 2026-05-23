export type LocationCandidate = {
  name: string;
  address?: string;
  aliases: string[];
  lat: number;
  lon: number;
  nx?: number;
  ny?: number;
};

export type WeatherPoint = {
  date: string;
  time: string;
  isoTime: string;
  label: string;
  temperature: number | null;
  skyCode: string | null;
  skyText: string;
  precipitationCode: string | null;
  precipitationText: string;
  precipitationProbability: number | null;
  humidity: number | null;
  windSpeed: number | null;
  precipitationAmount: string | null;
  snowfall: string | null;
  minTemperature: number | null;
  maxTemperature: number | null;
};

export type WeeklyForecast = {
  date: string;
  weekday: string;
  minTemperature: number | null;
  maxTemperature: number | null;
  skyText: string;
  precipitationText: string;
  precipitationProbability: number | null;
};

export type WeatherBundle = {
  location: LocationCandidate;
  current: WeatherPoint | null;
  hourly: WeatherPoint[];
  weekly: WeeklyForecast[];
  updatedAt: string;
  baseDate: string | null;
  baseTime: string | null;
  rawCount: number;
};

export type ActivityRecommendation = {
  icon: string;
  title: string;
  reason: string;
  caution: string;
};
