# API (OpenRouter 연동 예정)

이 폴더는 OpenRouter API 연결을 위해 비워두었습니다.

## 연동 가이드

OpenRouter API 키를 `.env.local`에 설정한 후 아래 구조로 클라이언트를 구현하세요.

```ts
// api/openrouter.ts (예시)
import axios from 'axios'

const client = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL,
    'X-Title': 'Make GEO',
  },
})

export async function chat(model: string, messages: object[]) {
  const { data } = await client.post('/chat/completions', { model, messages })
  return data.choices[0].message.content
}
```

## 연동 후 교체할 지점

- `src/actions/hooks/useAnalysis.ts` — TODO 주석 위치에서 실제 API 호출로 교체
- `src/actions/services/geoScore.ts` — 로컬 계산을 AI 분석으로 대체 가능
