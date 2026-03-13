import type { Metadata } from 'next'
import './globals.css'
import MainLayout from '@/components/layout/MainLayout'

export const metadata: Metadata = {
  title: 'Make GEO',
  description: 'Generative Engine Optimization 도구 — AI 검색엔진 최적화',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  )
}
