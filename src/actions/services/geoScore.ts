/**
 * GEO 점수 계산 서비스
 *
 * 콘텐츠를 입력받아 항목별 GEO 점수를 계산합니다.
 * 실제 AI 분석은 OpenRouter API 연동 후 api/ 폴더에서 처리합니다.
 */

export interface ScoreBreakdown {
  label: string
  score: number
  description: string
}

export interface GeoScoreResult {
  totalScore: number
  breakdown: ScoreBreakdown[]
  suggestions: string[]
}

/**
 * 텍스트 기반 GEO 점수 계산 (로컬 휴리스틱)
 * OpenRouter 연동 후 AI 분석으로 대체 가능
 */
export function calculateGeoScore(title: string, body: string): GeoScoreResult {
  const breakdown: ScoreBreakdown[] = [
    scoreCitability(body),
    scoreStructure(title, body),
    scoreQueryMatching(title, body),
    scoreAuthority(body),
    scoreFreshness(body),
  ]

  const totalScore = Math.round(
    breakdown.reduce((sum, item) => sum + item.score, 0) / breakdown.length
  )

  const suggestions = generateSuggestions(breakdown, body)

  return { totalScore, breakdown, suggestions }
}

function scoreCitability(body: string): ScoreBreakdown {
  let score = 30
  if (body.length > 200) score += 20
  if (body.length > 500) score += 10
  if (/\d+%|\d+개|\d+명|\d+배/.test(body)) score += 20  // 수치 포함
  if (/정의|란\?|이란|뜻/.test(body)) score += 20       // 정의 문장
  return {
    label: '인용 가능성',
    score: Math.min(score, 100),
    description: 'AI가 답변에 직접 인용할 수 있는 명확한 문장 구조',
  }
}

function scoreStructure(title: string, body: string): ScoreBreakdown {
  let score = 20
  if (title.length > 0) score += 15
  if (/^#+\s/m.test(body) || body.includes('##')) score += 20   // 마크다운 헤딩
  if (/\?/.test(body)) score += 20                               // 질문형 소제목
  if (/FAQ|자주 묻는|Q\.|Q:/i.test(body)) score += 25           // FAQ 섹션
  return {
    label: '구조화',
    score: Math.min(score, 100),
    description: 'AI가 파싱하기 쉬운 헤딩, FAQ 등 구조적 요소',
  }
}

function scoreQueryMatching(title: string, body: string): ScoreBreakdown {
  const text = title + body
  let score = 40
  if (/방법|하는 법|어떻게|가이드|튜토리얼/i.test(text)) score += 20
  if (/예시|사례|예를 들어|예제/i.test(text)) score += 20
  if (/비교|차이|vs\.|versus/i.test(text)) score += 20
  return {
    label: '질의 매칭',
    score: Math.min(score, 100),
    description: '사용자 자연어 질의와 콘텐츠 주제의 일치도',
  }
}

function scoreAuthority(body: string): ScoreBreakdown {
  let score = 30
  if (/출처|참고|연구|보고서|조사/i.test(body)) score += 25
  if (/전문가|박사|교수|연구원/i.test(body)) score += 20
  if (body.length > 800) score += 25
  return {
    label: '권위성',
    score: Math.min(score, 100),
    description: '출처 명시, 전문 용어 활용, 충분한 콘텐츠 깊이',
  }
}

function scoreFreshness(body: string): ScoreBreakdown {
  const currentYear = new Date().getFullYear().toString()
  let score = 50
  if (body.includes(currentYear)) score += 30
  if (/최신|업데이트|새로운|2025|2026/i.test(body)) score += 20
  return {
    label: '신선도',
    score: Math.min(score, 100),
    description: '최신 정보 반영 여부, 연도·날짜 표기',
  }
}

function generateSuggestions(breakdown: ScoreBreakdown[], body: string): string[] {
  const suggestions: string[] = []
  const low = breakdown.filter((b) => b.score < 60)

  low.forEach((item) => {
    switch (item.label) {
      case '인용 가능성':
        suggestions.push('수치나 통계를 포함하면 AI 인용 가능성이 높아집니다.')
        break
      case '구조화':
        suggestions.push('질문형 소제목(H2, H3)과 FAQ 섹션을 추가하세요.')
        break
      case '질의 매칭':
        suggestions.push('"~하는 방법", "~란 무엇인가" 형식의 제목을 활용하세요.')
        break
      case '권위성':
        suggestions.push('출처·연구 결과를 명시하고 콘텐츠 분량을 늘리세요.')
        break
      case '신선도':
        suggestions.push(`콘텐츠에 최신 연도(${new Date().getFullYear()})를 명시하세요.`)
        break
    }
  })

  return suggestions
}
