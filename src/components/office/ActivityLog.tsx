'use client'

import { useEffect, useRef } from 'react'
import ActivityLogEntry from './ActivityLogEntry'
import type { LogEntry } from '@/actions/hooks/useActivityLog'

interface ActivityLogProps {
  entries: LogEntry[]
  isStreaming: boolean
}

export default function ActivityLog({ entries, isStreaming }: ActivityLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries.length, isStreaming])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">활동 로그</h3>
        {isStreaming && (
          <span className="flex items-center gap-1 text-[10px] text-brand-600">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            처리 중
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <p className="text-2xl mb-2">💬</p>
            <p className="text-xs text-gray-400">업무를 지시하면 에이전트들의</p>
            <p className="text-xs text-gray-400">대화가 여기에 표시됩니다.</p>
          </div>
        ) : (
          entries.map(entry => (
            <ActivityLogEntry key={entry.id} entry={entry} />
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
