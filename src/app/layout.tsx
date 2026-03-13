import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import MainLayout from '@/components/layout/MainLayout'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  )
}
