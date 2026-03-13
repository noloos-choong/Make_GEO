'use client'

import { useState, useCallback } from 'react'
import { calculateGeoScore, GeoScoreResult } from '@/actions/services/geoScore'

interface AnalysisState {
  result: GeoScoreResult | null
  loading: boolean
  error: string | null
}

/**
 * URL/콘텐츠 분석 훅
 *
 * 현재: 로컬 GEO 점수 계산
 * 추후: OpenRouter API 연동으로 AI 기반 분석으로 전환
 */
export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    result: null,
    loading: false,
    error: null,
  })

  const analyze = useCallback(async (url: string, engines: string[]) => {
    setState({ result: null, loading: true, error: null })

    try {
      // TODO: OpenRouter API로 URL 크롤링 및 AI 분석 요청
      // const crawled = await apiClient.crawl(url)
      // const aiResult = await apiClient.analyzeGeo(crawled.content, engines)

      // 임시: 로컬 계산 (URL을 제목으로 사용)
      await new Promise((r) => setTimeout(r, 800))  // 로딩 시뮬레이션
      const result = calculateGeoScore(url, `분석 URL: ${url}\n대상 엔진: ${engines.join(', ')}`)

      setState({ result, loading: false, error: null })
    } catch (err) {
      setState({
        result: null,
        loading: false,
        error: err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.',
      })
    }
  }, [])

  return { ...state, analyze }
}
