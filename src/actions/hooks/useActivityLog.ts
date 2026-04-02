'use client'

import { useState, useCallback } from 'react'
import type { AgentRole } from '@/actions/utils/pixelSprites'

export type LogEntryKind = 'system' | 'planner' | 'agent' | 'error' | 'step_done'

export interface LogEntry {
  id: string
  kind: LogEntryKind
  agentName: string | null
  agentRole: AgentRole | null
  text: string
  timestamp: number
  isStreaming: boolean
}

function genId() {
  return Math.random().toString(36).slice(2, 10)
}

export function useActivityLog() {
  const [entries, setEntries] = useState<LogEntry[]>([])

  const appendEntry = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>): string => {
    const id = genId()
    setEntries(prev => [...prev, { ...entry, id, timestamp: Date.now() }])
    return id
  }, [])

  const appendDelta = useCallback((id: string, delta: string) => {
    setEntries(prev =>
      prev.map(e => e.id === id ? { ...e, text: e.text + delta } : e)
    )
  }, [])

  const markStreamDone = useCallback((id: string) => {
    setEntries(prev =>
      prev.map(e => e.id === id ? { ...e, isStreaming: false } : e)
    )
  }, [])

  const clearLog = useCallback(() => setEntries([]), [])

  return { entries, appendEntry, appendDelta, markStreamDone, clearLog }
}
