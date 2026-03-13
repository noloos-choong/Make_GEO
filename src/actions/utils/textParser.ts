/**
 * 텍스트 파싱 유틸리티
 *
 * 콘텐츠 분석에 필요한 텍스트 처리 함수 모음입니다.
 */

/** HTML 태그 제거 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

/** 단어 수 계산 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

/** 문장 분리 */
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5)
}

/** 헤딩 추출 */
export function extractHeadings(markdown: string): string[] {
  return markdown
    .split('\n')
    .filter((line) => /^#+\s/.test(line))
    .map((line) => line.replace(/^#+\s/, '').trim())
}

/** 질문형 문장 추출 */
export function extractQuestions(text: string): string[] {
  return splitSentences(text).filter((s) => s.endsWith('?'))
}

/** 핵심 키워드 추출 (단순 빈도 기반) */
export function extractKeywords(text: string, topN = 10): string[] {
  const stopwords = new Set([
    '이', '그', '저', '것', '수', '은', '는', '이', '가', '을', '를',
    '의', '에', '와', '과', '도', '로', '으로', '에서', '하다', '있다',
    'the', 'a', 'an', 'is', 'are', 'of', 'in', 'to', 'and', 'for',
  ])

  const freq: Record<string, number> = {}
  text.toLowerCase().split(/[\s,.\-!?:;()\[\]"']+/).forEach((word) => {
    if (word.length > 1 && !stopwords.has(word)) {
      freq[word] = (freq[word] ?? 0) + 1
    }
  })

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word)
}

/** 읽기 시간 추정 (분) */
export function estimateReadingTime(text: string): number {
  const wordsPerMinute = 250
  return Math.ceil(countWords(text) / wordsPerMinute)
}
