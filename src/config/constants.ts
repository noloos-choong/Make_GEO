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

/** AI Office 에이전트 역할 */
export const OFFICE_ROLES = [
  { id: 'planner',   label: '플래너',     emoji: '📋' },
  { id: 'developer', label: '개발자',     emoji: '💻' },
  { id: 'designer',  label: '디자이너',   emoji: '🎨' },
  { id: 'writer',    label: '작가',       emoji: '✍️' },
  { id: 'analyst',   label: '분석가',     emoji: '📊' },
  { id: 'manager',   label: '매니저',     emoji: '📁' },
] as const

/** AI Office LLM 제공자 */
export const LLM_PROVIDERS = [
  { id: 'anthropic',   label: 'Anthropic (Claude)' },
  { id: 'openrouter',  label: 'OpenRouter' },
] as const

/** 역할별 기본 모델 */
export const DEFAULT_MODELS = {
  anthropic:  'claude-sonnet-4-6',
  openrouter: 'openai/gpt-4o',
} as const

/** 역할별 색상 (Tailwind 클래스용) */
export const ROLE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  planner:   { bg: 'bg-amber-100',  text: 'text-amber-800',  dot: 'bg-amber-400'  },
  developer: { bg: 'bg-emerald-100',text: 'text-emerald-800',dot: 'bg-emerald-400'},
  designer:  { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-400' },
  writer:    { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-400' },
  analyst:   { bg: 'bg-sky-100',    text: 'text-sky-800',    dot: 'bg-sky-400'    },
  manager:   { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-400'    },
}

/** GEO 점수 항목 가중치 */
export const SCORE_WEIGHTS = {
  citability: 0.30,
  structure: 0.25,
  queryMatching: 0.20,
  authority: 0.15,
  freshness: 0.10,
} as const
