'use client'

import Card from '@/components/common/Card'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar,
} from 'recharts'

const SCORE_TREND = [
  { date: '03/07', ChatGPT: 62, Perplexity: 58, GoogleSGE: 65 },
  { date: '03/08', ChatGPT: 65, Perplexity: 60, GoogleSGE: 67 },
  { date: '03/09', ChatGPT: 68, Perplexity: 62, GoogleSGE: 66 },
  { date: '03/10', ChatGPT: 72, Perplexity: 63, GoogleSGE: 70 },
  { date: '03/11', ChatGPT: 75, Perplexity: 63, GoogleSGE: 71 },
  { date: '03/12', ChatGPT: 76, Perplexity: 64, GoogleSGE: 71 },
  { date: '03/13', ChatGPT: 78, Perplexity: 65, GoogleSGE: 71 },
]

const PAGE_SCORES = [
  { page: 'GEO 가이드', score: 84 },
  { page: 'SEO vs GEO', score: 76 },
  { page: '제품 소개', score: 61 },
  { page: '회사 소개', score: 45 },
  { page: '블로그 홈', score: 38 },
]

const SUMMARY = [
  { label: '평균 GEO 점수', value: '72점', sub: '지난주 대비 +8점' },
  { label: '총 AI 인용', value: '38회', sub: '이번 달 누적' },
  { label: '분석 페이지', value: '14개', sub: '총 누적' },
  { label: '최고 점수 페이지', value: '84점', sub: 'GEO 가이드' },
]

export default function ReportsView() {
  return (
    <div className="space-y-6">
      {/* 요약 */}
      <div className="grid grid-cols-4 gap-4">
        {SUMMARY.map((item) => (
          <Card key={item.label}>
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
            <p className="text-xs text-green-600 mt-1">{item.sub}</p>
          </Card>
        ))}
      </div>

      {/* GEO 점수 추이 */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-4">AI 검색엔진별 GEO 점수 추이 (최근 7일)</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={SCORE_TREND}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="ChatGPT" stroke="#4f6ef7" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Perplexity" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="GoogleSGE" stroke="#f59e0b" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* 페이지별 점수 */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-4">페이지별 GEO 점수</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={PAGE_SCORES} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
            <YAxis dataKey="page" type="category" tick={{ fontSize: 12 }} width={90} />
            <Tooltip />
            <Bar dataKey="score" fill="#4f6ef7" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
