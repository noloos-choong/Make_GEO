'use client'

import { useState } from 'react'
import clsx from 'clsx'
import type { WorkflowStatus } from '@/actions/hooks/useOffice'

interface TaskSubmitPanelProps {
  status: WorkflowStatus
  onSubmit: (task: string) => void
  onReset: () => void
}

const STATUS_LABELS: Record<WorkflowStatus, string> = {
  idle: '',
  planning: '플래너가 계획 수립 중...',
  running: '에이전트 실행 중...',
  done: '완료!',
  error: '오류 발생',
}

export default function TaskSubmitPanel({ status, onSubmit, onReset }: TaskSubmitPanelProps) {
  const [task, setTask] = useState('')
  const isbusy = status === 'planning' || status === 'running'
  const isDone = status === 'done' || status === 'error'

  function handleSubmit() {
    if (!task.trim() || isbusy) return
    onSubmit(task.trim())
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
  }

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <textarea
            className={clsx('input resize-none', isbusy && 'opacity-60')}
            rows={2}
            value={task}
            onChange={e => setTask(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="업무를 지시하세요... (예: 간단한 투두 앱 기획 및 설계를 해줘)"
            disabled={isbusy}
          />
          <p className="text-[10px] text-gray-400 mt-0.5">Ctrl+Enter로 실행</p>
        </div>

        <div className="flex flex-col gap-2 pb-4">
          {isDone ? (
            <button onClick={onReset} className="btn-secondary whitespace-nowrap text-sm px-3 py-2">
              초기화
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!task.trim() || isbusy}
              className="btn-primary whitespace-nowrap text-sm px-4 py-2"
            >
              {isbusy ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  실행 중
                </span>
              ) : '실행 →'}
            </button>
          )}
        </div>
      </div>

      {status !== 'idle' && (
        <div className={clsx(
          'flex items-center gap-1.5 text-xs mt-1',
          status === 'done' ? 'text-emerald-600' :
          status === 'error' ? 'text-red-600' : 'text-brand-600',
        )}>
          {isbusy && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping" />}
          {STATUS_LABELS[status]}
        </div>
      )}
    </div>
  )
}
