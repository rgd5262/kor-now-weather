import type { LocationCandidate } from "./types";

export const DEFAULT_LOCATION: LocationCandidate = {
  name: "서울시청",
  address: "서울특별시 중구 세종대로9길 20",
  aliases: ["서울", "서울시청", "서울특별시", "중구", "세종대로"],
  lat: 37.5665,
  lon: 126.978,
  nx: 60,
  ny: 127,
};

export const LOCATIONS: LocationCandidate[] = [
  DEFAULT_LOCATION,
  { name: "강남구", aliases: ["강남", "강남구", "삼성", "역삼"], lat: 37.5172, lon: 127.0473, nx: 61, ny: 126 },
  { name: "종로구", aliases: ["종로", "종로구", "광화문"], lat: 37.5735, lon: 126.979, nx: 60, ny: 127 },
  { name: "마포구", aliases: ["마포", "마포구", "홍대", "상암"], lat: 37.5663, lon: 126.9019, nx: 59, ny: 127 },
  { name: "부산", aliases: ["부산", "부산광역시"], lat: 35.1796, lon: 129.0756, nx: 98, ny: 76 },
  { name: "해운대구", aliases: ["해운대", "해운대구", "센텀"], lat: 35.1631, lon: 129.1635, nx: 99, ny: 75 },
  { name: "인천", aliases: ["인천", "인천광역시"], lat: 37.4563, lon: 126.7052, nx: 55, ny: 124 },
  { name: "대구", aliases: ["대구", "대구광역시"], lat: 35.8714, lon: 128.6014, nx: 89, ny: 90 },
  { name: "대전", aliases: ["대전", "대전광역시"], lat: 36.3504, lon: 127.3845, nx: 67, ny: 100 },
  { name: "광주", aliases: ["광주", "광주광역시"], lat: 35.1595, lon: 126.8526, nx: 58, ny: 74 },
  { name: "울산", aliases: ["울산", "울산광역시"], lat: 35.5384, lon: 129.3114, nx: 102, ny: 84 },
  { name: "세종", aliases: ["세종", "세종시", "세종특별자치시"], lat: 36.48, lon: 127.289, nx: 66, ny: 103 },
  { name: "수원", aliases: ["수원", "수원시"], lat: 37.2636, lon: 127.0286, nx: 60, ny: 121 },
  { name: "성남", aliases: ["성남", "성남시", "분당"], lat: 37.4449, lon: 127.1388, nx: 62, ny: 123 },
  { name: "용인", aliases: ["용인", "용인시"], lat: 37.241, lon: 127.1775, nx: 62, ny: 120 },
  { name: "고양", aliases: ["고양", "고양시", "일산"], lat: 37.6584, lon: 126.832, nx: 57, ny: 128 },
  { name: "안산", aliases: ["안산", "안산시"], lat: 37.3219, lon: 126.8309, nx: 57, ny: 121 },
  { name: "제주", aliases: ["제주", "제주시", "제주도"], lat: 33.4996, lon: 126.5312, nx: 52, ny: 38 },
  { name: "서귀포", aliases: ["서귀포", "서귀포시"], lat: 33.2541, lon: 126.56, nx: 52, ny: 33 },
  { name: "창원", aliases: ["창원", "창원시"], lat: 35.228, lon: 128.6811, nx: 90, ny: 77 },
  { name: "청주", aliases: ["청주", "청주시"], lat: 36.6424, lon: 127.489, nx: 69, ny: 107 },
  { name: "전주", aliases: ["전주", "전주시", "한옥마을"], lat: 35.8242, lon: 127.148, nx: 63, ny: 89 },
  { name: "포항", aliases: ["포항", "포항시"], lat: 36.019, lon: 129.3435, nx: 102, ny: 94 },
  { name: "안동", aliases: ["안동", "안동시"], lat: 36.5684, lon: 128.7294, nx: 91, ny: 106 },
  { name: "춘천", aliases: ["춘천", "춘천시"], lat: 37.8813, lon: 127.7298, nx: 73, ny: 134 },
  { name: "강릉", aliases: ["강릉", "강릉시"], lat: 37.7519, lon: 128.8761, nx: 92, ny: 131 },
  { name: "원주", aliases: ["원주", "원주시"], lat: 37.3422, lon: 127.9201, nx: 76, ny: 122 },
  { name: "천안", aliases: ["천안", "천안시"], lat: 36.8151, lon: 127.1139, nx: 63, ny: 110 },
  { name: "아산", aliases: ["아산", "아산시"], lat: 36.7898, lon: 127.0044, nx: 62, ny: 110 },
  { name: "목포", aliases: ["목포", "목포시"], lat: 34.8118, lon: 126.3922, nx: 50, ny: 67 },
  { name: "여수", aliases: ["여수", "여수시"], lat: 34.7604, lon: 127.6622, nx: 73, ny: 66 },
  { name: "순천", aliases: ["순천", "순천시"], lat: 34.9506, lon: 127.4872, nx: 70, ny: 70 },
  { name: "익산", aliases: ["익산", "익산시"], lat: 35.9483, lon: 126.9577, nx: 60, ny: 91 },
  { name: "군산", aliases: ["군산", "군산시"], lat: 35.9676, lon: 126.7368, nx: 56, ny: 92 },
  { name: "경주", aliases: ["경주", "경주시"], lat: 35.8562, lon: 129.2247, nx: 100, ny: 91 },
  { name: "김해", aliases: ["김해", "김해시"], lat: 35.2342, lon: 128.8811, nx: 95, ny: 77 },
  { name: "진주", aliases: ["진주", "진주시"], lat: 35.18, lon: 128.1076, nx: 81, ny: 75 },
  { name: "거제", aliases: ["거제", "거제시"], lat: 34.88, lon: 128.6211, nx: 90, ny: 69 },
  { name: "속초", aliases: ["속초", "속초시"], lat: 38.207, lon: 128.5919, nx: 87, ny: 141 },
  { name: "동해", aliases: ["동해", "동해시"], lat: 37.5244, lon: 129.1142, nx: 97, ny: 127 },
  { name: "삼척", aliases: ["삼척", "삼척시"], lat: 37.45, lon: 129.165, nx: 98, ny: 125 },
  { name: "파주", aliases: ["파주", "파주시"], lat: 37.7601, lon: 126.78, nx: 56, ny: 131 },
  { name: "평택", aliases: ["평택", "평택시"], lat: 36.9921, lon: 127.1127, nx: 62, ny: 114 },
  { name: "시흥", aliases: ["시흥", "시흥시"], lat: 37.38, lon: 126.8034, nx: 57, ny: 123 },
  { name: "광명", aliases: ["광명", "광명시"], lat: 37.4784, lon: 126.8645, nx: 58, ny: 125 },
  { name: "구리", aliases: ["구리", "구리시"], lat: 37.594, lon: 127.1298, nx: 62, ny: 127 },
  { name: "남양주", aliases: ["남양주", "남양주시"], lat: 37.636, lon: 127.2165, nx: 64, ny: 128 },
  { name: "의정부", aliases: ["의정부", "의정부시"], lat: 37.7382, lon: 127.0338, nx: 61, ny: 130 },
  { name: "하남", aliases: ["하남", "하남시"], lat: 37.539, lon: 127.2149, nx: 64, ny: 126 },
  { name: "화성", aliases: ["화성", "화성시", "동탄"], lat: 37.1994, lon: 126.8317, nx: 57, ny: 119 },
];

function compact(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/\s+/g, "");
  const withoutLargeSuffix = normalized.replace(/(특별자치시|특별자치도|특별시|광역시)$/, "");

  if (withoutLargeSuffix !== normalized) {
    return withoutLargeSuffix;
  }

  return normalized.length > 2 ? normalized.replace(/(시|군|구)$/, "") : normalized;
}

export function findLocation(query: string) {
  const normalized = compact(query);
  if (!normalized) {
    return null;
  }

  return (
    LOCATIONS.find((location) =>
      [location.name, ...location.aliases].some((alias) => {
        const candidate = compact(alias);
        return candidate === normalized || candidate.includes(normalized) || normalized.includes(candidate);
      }),
    ) ?? null
  );
}

export function searchLocations(query: string, limit = 6) {
  const normalized = compact(query);
  if (!normalized) {
    return LOCATIONS.slice(0, limit);
  }

  return LOCATIONS.filter((location) =>
    [location.name, ...location.aliases].some((alias) => {
      const candidate = compact(alias);
      return candidate.includes(normalized) || normalized.includes(candidate);
    }),
  ).slice(0, limit);
}
