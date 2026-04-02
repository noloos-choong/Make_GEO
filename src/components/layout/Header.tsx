'use client'

import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': '대시보드',
  '/analysis': '콘텐츠 분석',
  '/content': '콘텐츠 편집',
  '/reports': '리포트',
  '/settings': '설정',
  '/office': 'AI 오피스',
}

export default function Header() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? 'Make GEO'

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-between">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-xs px-2 py-1 bg-brand-50 text-brand-700 rounded-full font-medium">
          GEO
        </span>
      </div>
    </header>
  )
}
