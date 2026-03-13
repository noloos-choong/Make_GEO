'use client'

import { useState, useEffect } from 'react'
import { calculateGeoScore, ScoreBreakdown } from '@/actions/services/geoScore'

/**
 * 실시간 GEO 점수 계산 훅 (콘텐츠 편집 화면용)
 * 제목/본문이 변경될 때 debounce 후 점수를 재계산합니다.
 */
export function useGeoScore(title: string, body: string) {
  const [score, setScore] = useState(0)
  const [breakdown, setBreakdown] = useState<ScoreBreakdown[]>([])
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    if (!title && !body) {
      setScore(0)
      setBreakdown([])
      return
    }

    setAnalyzing(true)
    const timer = setTimeout(() => {
      const result = calculateGeoScore(title, body)
      setScore(result.totalScore)
      setBreakdown(result.breakdown)
      setAnalyzing(false)
    }, 500)  // 500ms debounce

    return () => clearTimeout(timer)
  }, [title, body])

  return { score, breakdown, analyzing }
}
