/**
 * JSON-LD 구조화 데이터 생성 유틸리티
 *
 * GEO 최적화를 위한 스키마 마크업을 생성합니다.
 * AI 검색엔진은 구조화 데이터를 통해 콘텐츠를 더 잘 파악합니다.
 */

interface SchemaInput {
  title: string
  body: string
  url?: string
  author?: string
  datePublished?: string
}

interface FAQItem {
  question: string
  answer: string
}

/** 본문에서 FAQ 항목 추출 (간단한 패턴 매칭) */
function extractFAQ(body: string): FAQItem[] {
  const lines = body.split('\n')
  const faqs: FAQItem[] = []
  let currentQ = ''

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.endsWith('?') && trimmed.length < 120) {
      currentQ = trimmed
    } else if (currentQ && trimmed.length > 20) {
      faqs.push({ question: currentQ, answer: trimmed })
      currentQ = ''
    }
  }

  return faqs.slice(0, 10)
}

/** Article 스키마 생성 */
function buildArticleSchema(input: SchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.body.slice(0, 160),
    author: { '@type': 'Person', name: input.author ?? '작성자' },
    datePublished: input.datePublished ?? new Date().toISOString().split('T')[0],
    url: input.url,
  }
}

/** FAQPage 스키마 생성 */
function buildFAQSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/** 콘텐츠에 맞는 JSON-LD 스키마 생성 */
export function generateSchema(input: SchemaInput): object[] {
  const schemas: object[] = [buildArticleSchema(input)]

  const faqs = extractFAQ(input.body)
  if (faqs.length > 0) {
    schemas.push(buildFAQSchema(faqs))
  }

  return schemas
}
