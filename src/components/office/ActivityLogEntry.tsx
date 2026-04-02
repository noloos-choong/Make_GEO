import clsx from 'clsx'
import { ROLE_COLORS } from '@/config/constants'
import type { LogEntry } from '@/actions/hooks/useActivityLog'

interface ActivityLogEntryProps {
  entry: LogEntry
}

export default function ActivityLogEntry({ entry }: ActivityLogEntryProps) {
  const isSystem = entry.kind === 'system'
  const isError = entry.kind === 'error'
  const isStepDone = entry.kind === 'step_done'
  const colors = entry.agentRole ? ROLE_COLORS[entry.agentRole] : null

  if (isSystem) {
    return (
      <div className="px-3 py-1">
        <p className="text-xs text-gray-400 italic">{entry.text}</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="px-3 py-1.5 bg-red-50 rounded-lg mx-2 my-1">
        <p className="text-xs text-red-600">{entry.text}</p>
      </div>
    )
  }

  if (isStepDone) {
    return (
      <div className="px-3 py-1">
        <p className="text-xs text-emerald-600 font-medium">{entry.text}</p>
      </div>
    )
  }

  return (
    <div className="flex gap-2.5 px-3 py-2">
      {/* 아바타 도트 */}
      <div className="flex-shrink-0 mt-0.5">
        <div className={clsx('w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white', colors?.dot ?? 'bg-gray-400')}>
          {entry.agentName?.slice(0, 1) ?? '?'}
        </div>
      </div>
      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-700 mb-0.5">{entry.agentName}</p>
        <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed break-words">
          {entry.text}
          {entry.isStreaming && (
            <span className="inline-block w-1.5 h-3.5 bg-brand-500 ml-0.5 animate-pulse align-text-bottom rounded-sm" />
          )}
        </p>
      </div>
    </div>
  )
}
