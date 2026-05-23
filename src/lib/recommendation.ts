import type { ActivityRecommendation, WeatherPoint } from "./types";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT = [
  "당신은 한국의 날씨에 맞는 야외활동을 추천하는 어시스턴트입니다.",
  "사용자가 제공하는 현재 날씨 정보를 보고 적합한 야외활동 3가지를 추천하세요.",
  "각 추천은 icon, title, reason, caution 필드를 포함해야 합니다.",
  "강수 확률이 60% 이상이거나 기온이 극단적일 때는 안전을 우선시하세요.",
  "응답은 한국어 JSON 배열로만 반환하세요.",
].join("\n");

function weatherPrompt(locationName: string, weather: WeatherPoint) {
  return [
    `지역명: ${locationName}`,
    `기온: ${weather.temperature ?? "정보 없음"}℃`,
    `하늘상태: ${weather.skyText}`,
    `강수형태: ${weather.precipitationText}`,
    `강수확률: ${weather.precipitationProbability ?? "정보 없음"}%`,
    `습도: ${weather.humidity ?? "정보 없음"}%`,
    `풍속: ${weather.windSpeed ?? "정보 없음"}m/s`,
  ].join("\n");
}

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const raw = fenced ?? text;
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("추천 응답 형식이 올바르지 않습니다.");
  }
  return JSON.parse(raw.slice(start, end + 1));
}

function normalizeRecommendations(value: unknown): ActivityRecommendation[] {
  const list = Array.isArray(value)
    ? value
    : Array.isArray((value as { recommendations?: unknown[] })?.recommendations)
      ? (value as { recommendations: unknown[] }).recommendations
      : null;

  if (!list) {
    throw new Error("추천 응답이 배열이 아닙니다.");
  }

  return list.slice(0, 3).map((item, index) => {
    const record = item as Partial<ActivityRecommendation>;
    return {
      icon: typeof record.icon === "string" && record.icon ? record.icon : ["🚶", "🌿", "☕"][index] ?? "🌿",
      title: typeof record.title === "string" && record.title ? record.title : "가벼운 산책",
      reason: typeof record.reason === "string" && record.reason ? record.reason : "현재 날씨를 고려한 활동입니다.",
      caution: typeof record.caution === "string" ? record.caution : "",
    };
  });
}

async function callChatCompletion(url: string, apiKey: string, model: string, messages: ChatMessage[]) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw Object.assign(new Error("추천 생성 요청이 실패했습니다."), { status: response.status });
  }

  const payload = await response.json() as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("추천 응답이 비어 있습니다.");
  }

  return normalizeRecommendations(extractJson(content));
}

export async function recommendActivities(locationName: string, weather: WeatherPoint) {
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: weatherPrompt(locationName, weather) },
  ];

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (openRouterKey) {
    try {
      return await callChatCompletion(
        "https://openrouter.ai/api/v1/chat/completions",
        openRouterKey,
        "deepseek/deepseek-v4-flash:free",
        messages,
      );
    } catch (error) {
      const status = (error as { status?: number }).status;
      console.warn("OpenRouter recommendation failed", { status: status ?? "network" });
      if (!openAiKey) {
        throw error;
      }
    }
  }

  if (openAiKey) {
    try {
      return await callChatCompletion("https://api.openai.com/v1/chat/completions", openAiKey, "gpt-4o-mini", messages);
    } catch (error) {
      const status = (error as { status?: number }).status;
      console.warn("OpenAI recommendation failed", { status: status ?? "network" });
      throw error;
    }
  }

  throw new Error("추천 서비스 환경변수가 설정되지 않았습니다.");
}
