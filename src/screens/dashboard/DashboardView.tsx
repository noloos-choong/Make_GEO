'use client'

import Card from '@/components/common/Card'
import ScoreBadge from '@/components/common/ScoreBadge'
import Link from 'next/link'

const STAT_CARDS = [
  { label: '종합 GEO 점수', value: 72, unit: '점', color: 'text-brand-600' },
  { label: '분석한 페이지', value: 14, unit: '개', color: 'text-gray-900' },
  { label: 'AI 인용 횟수', value: 38, unit: '회', color: 'text-green-600' },
  { label: '개선 제안', value: 6, unit: '건', color: 'text-yellow-600' },
]

const RECENT_ANALYSES = [
  { url: 'https://example.com/blog/geo-guide', score: 84, engine: 'ChatGPT', date: '2026-03-13' },
  { url: 'https://example.com/products/seo-tool', score: 61, engine: 'Perplexity', date: '2026-03-12' },
  { url: 'https://example.com/about', score: 45, engine: 'Google SGE', date: '2026-03-11' },
]

const ENGINE_STATUS = [
  { name: 'ChatGPT', score: 78, trend: '+5' },
  { name: 'Perplexity', score: 65, trend: '+2' },
  { name: 'Google SGE', score: 71, trend: '-1' },
]

export default function DashboardView() {
  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-4">
        {STAT_CARDS.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>
              {stat.value}
              <span className="text-base font-normal text-gray-400 ml-1">{stat.unit}</span>
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* AI 검색엔진별 현황 */}
        <Card className="col-span-1">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">AI 검색엔진별 점수</h2>
          <ul className="space-y-3">
            {ENGINE_STATUS.map((engine) => (
              <li key={engine.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{engine.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full"
                      style={{ width: `${engine.score}%` }}
                    />
                  </div>
                  <ScoreBadge score={engine.score} />
                  <span className={`text-xs font-medium ${engine.trend.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                    {engine.trend}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* 최근 분석 */}
        <Card className="col-span-2" padding={false}>
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">최근 분석</h2>
            <Link href="/analysis" className="text-xs text-brand-600 hover:underline">
              새 분석 시작
            </Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {RECENT_ANALYSES.map((item) => (
              <li key={item.url} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 truncate max-w-xs">{item.url}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.engine} · {item.date}</p>
                </div>
                <ScoreBadge score={item.score} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* 빠른 실행 */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">빠른 실행</h2>
        <div className="flex gap-3">
          <Link href="/analysis" className="btn-primary">
            분석 시작
          </Link>
          <Link href="/content" className="btn-secondary">
            콘텐츠 작성
          </Link>
          <Link href="/reports" className="btn-secondary">
            리포트 보기
          </Link>
        </div>
      </Card>
    </div>
  )
}
