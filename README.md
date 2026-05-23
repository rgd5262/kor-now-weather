# WeatherWise KR

한국 기상청 단기예보 기반 현재 날씨, 24시간 예보, 단기 범위 주간 요약, 야외활동 추천을 제공하는 반응형 웹 앱입니다.

## Local Setup

```bash
npm install
npm run dev
```

환경변수는 `.env.local.example`을 기준으로 `.env.local`에 설정합니다.

```bash
OPENROUTER_API_KEY=sk-or-v1-your-key
OPENAI_API_KEY=sk-your-key
KSKILL_PROXY_BASE_URL=https://k-skill-proxy.nomadamas.org
```

## Scripts

- `npm run dev`: 개발 서버 실행
- `npm run lint`: 정적 검사
- `npm run test`: 날씨 파서 테스트
- `npm run build`: 프로덕션 빌드

## Notes

- API 키는 서버 라우트에서만 사용합니다.
- 단기예보 기반이므로 주간 요약은 실제 제공 가능한 날짜까지만 표시됩니다.
- 동일 좌표 요청은 서버 메모리에서 30분 동안 재사용합니다.
