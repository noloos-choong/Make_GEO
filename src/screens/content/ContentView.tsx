'use client'

import { useState, useCallback } from 'react'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import ScoreBadge from '@/components/common/ScoreBadge'
import { useGeoScore } from '@/actions/hooks/useGeoScore'
import { generateSchema } from '@/actions/utils/schemaGenerator'

export default function ContentView() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const { score, breakdown, analyzing } = useGeoScore(title, body)

  const handleCopySchema = useCallback(() => {
    const schema = generateSchema({ title, body })
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2))
  }, [title, body])

  return (
    <div className="grid grid-cols-3 gap-6 h-full">
      {/* 에디터 영역 */}
      <div className="col-span-2 space-y-4">
        <Card>
          <label className="label">제목</label>
          <input
            type="text"
            className="input"
            placeholder="GEO 최적화할 콘텐츠 제목 입력..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Card>

        <Card className="flex-1">
          <label className="label">본문</label>
          <textarea
            className="input resize-none"
            rows={20}
            placeholder={`본문을 작성하세요.\n\nGEO 팁:\n• 질문 형식의 소제목을 활용하세요 (예: "GEO란 무엇인가?")\n• 정의, 사실, 수치를 명확하게 기술하세요\n• FAQ 섹션을 추가하면 인용 가능성이 높아집니다`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleCopySchema} variant="secondary" disabled={!title && !body}>
            JSON-LD 스키마 복사
          </Button>
        </div>
      </div>

      {/* GEO 점수 사이드패널 */}
      <div className="space-y-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">실시간 GEO 점수</h3>
            {analyzing && (
              <span className="text-xs text-gray-400 animate-pulse">분석 중...</span>
            )}
          </div>
          <div className="text-center py-4">
            <p className="text-5xl font-bold text-brand-600">{score}</p>
            <p className="text-sm text-gray-400 mt-1">/ 100</p>
          </div>
          <ScoreBadge score={score} size="lg" label="종합" />
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">항목별 점수</h3>
          <ul className="space-y-3">
            {breakdown.map((item) => (
              <li key={item.label}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{item.label}</span>
                  <span className="font-medium">{item.score}점</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-300"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">GEO 체크리스트</h3>
          <ul className="space-y-1.5 text-xs">
            {[
              { label: '질문형 소제목 포함', done: body.includes('?') },
              { label: '100자 이상 본문', done: body.length >= 100 },
              { label: '제목 입력', done: title.length > 0 },
              { label: 'FAQ 섹션 포함', done: body.toLowerCase().includes('faq') || body.includes('자주') },
            ].map((check) => (
              <li key={check.label} className="flex items-center gap-2">
                <span className={check.done ? 'text-green-500' : 'text-gray-300'}>
                  {check.done ? '✓' : '○'}
                </span>
                <span className={check.done ? 'text-gray-700' : 'text-gray-400'}>
                  {check.label}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
