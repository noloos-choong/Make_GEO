/** GEO 점수 등급 기준 */
export const GEO_GRADE = {
  EXCELLENT: 80,
  GOOD: 60,
  NEEDS_WORK: 40,
} as const

/** 지원하는 AI 검색엔진 */
export const AI_ENGINES = ['ChatGPT', 'Perplexity', 'Google SGE'] as const

/** OpenRouter 추천 모델 */
export const OPENROUTER_MODELS = [
  { id: 'openai/gpt-4o', label: 'GPT-4o' },
  { id: 'openai/gpt-4o-mini', label: 'GPT-4o mini' },
  { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
  { id: 'google/gemini-pro-1.5', label: 'Gemini Pro 1.5' },
  { id: 'perplexity/llama-3.1-sonar-large-128k-online', label: 'Perplexity Sonar (Online)' },
] as const

/** GEO 점수 항목 가중치 */
export const SCORE_WEIGHTS = {
  citability: 0.30,
  structure: 0.25,
  queryMatching: 0.20,
  authority: 0.15,
  freshness: 0.10,
} as const
