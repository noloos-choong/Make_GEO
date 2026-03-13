'use client'

import { useState } from 'react'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import ScoreBadge from '@/components/common/ScoreBadge'
import { useAnalysis } from '@/actions/hooks/useAnalysis'

const ENGINES = ['ChatGPT', 'Perplexity', 'Google SGE']

export default function AnalysisView() {
  const [url, setUrl] = useState('')
  const [selectedEngines, setSelectedEngines] = useState<string[]>(['ChatGPT'])
  const { result, loading, analyze } = useAnalysis()

  const toggleEngine = (engine: string) => {
    setSelectedEngines((prev) =>
      prev.includes(engine) ? prev.filter((e) => e !== engine) : [...prev, engine]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    analyze(url, selectedEngines)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 입력 폼 */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-4">분석할 URL 또는 콘텐츠 입력</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">URL</label>
            <input
              type="url"
              className="input"
              placeholder="https://example.com/your-article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="label">분석 대상 AI 검색엔진</label>
            <div className="flex gap-2">
              {ENGINES.map((engine) => (
                <button
                  key={engine}
                  type="button"
                  onClick={() => toggleEngine(engine)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    selectedEngines.includes(engine)
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
                  }`}
                >
                  {engine}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" loading={loading} disabled={!url.trim()}>
            분석 시작
          </Button>
        </form>
      </Card>

      {/* 분석 결과 */}
      {result && (
        <div className="space-y-4">
          {/* 종합 점수 */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">종합 GEO 점수</p>
                <p className="text-4xl font-bold text-brand-600 mt-1">{result.totalScore}</p>
              </div>
              <ScoreBadge score={result.totalScore} size="lg" />
            </div>
          </Card>

          {/* 항목별 점수 */}
          <div className="grid grid-cols-2 gap-4">
            {result.breakdown.map((item) => (
              <Card key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <ScoreBadge score={item.score} />
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">{item.description}</p>
              </Card>
            ))}
          </div>

          {/* 개선 제안 */}
          {result.suggestions.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">개선 제안</h3>
              <ul className="space-y-2">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-yellow-500 mt-0.5">⚠</span>
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
