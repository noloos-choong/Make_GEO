'use client'

import { useState, useEffect, useCallback } from 'react'
import { loadAgents, saveAgents } from '@/actions/services/officeStorage'
import { planTask, streamExecute } from '@/actions/services/llmClient'
import { DEFAULT_AGENTS } from '@/config/officeDefaults'
import type { AgentRole } from '@/actions/utils/pixelSprites'
import type { LogEntryKind } from './useActivityLog'

export type LLMProvider = 'anthropic' | 'openrouter'
export type WorkflowStatus = 'idle' | 'planning' | 'running' | 'done' | 'error'

export interface LLMConfig {
  provider: LLMProvider
  model: string
  apiKey: string
}

export interface Agent {
  id: string
  name: string
  role: AgentRole
  personality: string
  systemPromptTemplate: string
  llmConfig: LLMConfig
  deskPosition: number
  isPlanner: boolean
}

export interface WorkflowStep {
  id: string
  description: string
  agentId: string
  dependsOn: string[]
  status: 'pending' | 'running' | 'done' | 'error'
  output: string
  startedAt: number | null
  finishedAt: number | null
}

export interface Workflow {
  id: string
  taskDescription: string
  steps: WorkflowStep[]
  createdAt: number
}

interface LogCallbacks {
  appendEntry: (entry: { kind: LogEntryKind; agentName: string | null; agentRole: AgentRole | null; text: string; isStreaming: boolean }) => string
  appendDelta: (id: string, delta: string) => void
  markStreamDone: (id: string) => void
  clearLog: () => void
}

function genId() {
  return Math.random().toString(36).slice(2, 10)
}

export function useOffice(log: LogCallbacks) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [status, setStatus] = useState<WorkflowStatus>('idle')
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  // 초기 로드
  useEffect(() => {
    const saved = loadAgents()
    setAgents(saved ?? DEFAULT_AGENTS)
  }, [])

  // agents 변경 시 localStorage 동기화
  useEffect(() => {
    if (agents.length > 0) saveAgents(agents)
  }, [agents])

  // --- Agent CRUD ---

  const addAgent = useCallback((agent: Omit<Agent, 'id'>) => {
    const newAgent: Agent = { ...agent, id: genId() }
    setAgents(prev => [...prev, newAgent])
  }, [])

  const updateAgent = useCallback((id: string, patch: Partial<Agent>) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a))
  }, [])

  const removeAgent = useCallback((id: string) => {
    setAgents(prev => prev.filter(a => a.id !== id))
  }, [])

  // --- Workflow ---

  const updateStep = useCallback((stepId: string, patch: Partial<WorkflowStep>) => {
    setWorkflow(prev => prev && {
      ...prev,
      steps: prev.steps.map(s => s.id === stepId ? { ...s, ...patch } : s),
    })
  }, [])

  const executeNextStep = useCallback(async (currentWorkflow: Workflow, currentAgents: Agent[]) => {
    // 완료되지 않은 의존성이 있는 스텝 제외
    const doneIds = new Set(currentWorkflow.steps.filter(s => s.status === 'done').map(s => s.id))
    const next = currentWorkflow.steps.find(
      s => s.status === 'pending' && s.dependsOn.every(dep => doneIds.has(dep))
    )

    if (!next) {
      // 모든 스텝 완료 또는 실행 가능한 스텝 없음
      const allDone = currentWorkflow.steps.every(s => s.status === 'done' || s.status === 'error')
      if (allDone) {
        setStatus('done')
        setActiveAgentId(null)
        log.appendEntry({ kind: 'system', agentName: null, agentRole: null, text: '✅ 모든 업무가 완료되었습니다!', isStreaming: false })
      }
      return
    }

    const agent = currentAgents.find(a => a.id === next.agentId)
    if (!agent) {
      updateStep(next.id, { status: 'error', output: '에이전트를 찾을 수 없습니다.' })
      log.appendEntry({ kind: 'error', agentName: null, agentRole: null, text: `⚠️ 스텝 "${next.description}"에 배정된 에이전트를 찾을 수 없습니다.`, isStreaming: false })
      return
    }

    // 스텝 시작
    updateStep(next.id, { status: 'running', startedAt: Date.now() })
    setActiveAgentId(agent.id)

    const previousOutputs: Record<string, string> = {}
    for (const depId of next.dependsOn) {
      const depStep = currentWorkflow.steps.find(s => s.id === depId)
      if (depStep) previousOutputs[depId] = depStep.output
    }

    const entryId = log.appendEntry({
      kind: 'agent',
      agentName: agent.name,
      agentRole: agent.role,
      text: '',
      isStreaming: true,
    })

    let output = ''
    try {
      const gen = streamExecute({ step: next, agent, taskDescription: currentWorkflow.taskDescription, previousOutputs })
      for await (const delta of gen) {
        output += delta
        log.appendDelta(entryId, delta)
        updateStep(next.id, { output })
      }
      log.markStreamDone(entryId)
      updateStep(next.id, { status: 'done', output, finishedAt: Date.now() })
      log.appendEntry({ kind: 'step_done', agentName: agent.name, agentRole: agent.role, text: `✓ "${next.description}" 완료`, isStreaming: false })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      log.markStreamDone(entryId)
      updateStep(next.id, { status: 'error', output: msg, finishedAt: Date.now() })
      log.appendEntry({ kind: 'error', agentName: agent.name, agentRole: agent.role, text: `❌ 오류: ${msg}`, isStreaming: false })
      setStatus('error')
      setActiveAgentId(null)
      return
    }

    // 다음 스텝 실행
    setWorkflow(prev => {
      if (!prev) return prev
      const updated: Workflow = {
        ...prev,
        steps: prev.steps.map(s => s.id === next.id ? { ...s, status: 'done', output, finishedAt: Date.now() } : s),
      }
      // 비동기 실행은 setTimeout으로 defer (React state batch 이후)
      setTimeout(() => executeNextStep(updated, currentAgents), 100)
      return updated
    })
  }, [log, updateStep])

  const submitTask = useCallback(async (taskDescription: string) => {
    if (status !== 'idle') return
    const planner = agents.find(a => a.isPlanner)
    if (!planner) {
      log.appendEntry({ kind: 'error', agentName: null, agentRole: null, text: '❌ 플래너 에이전트가 없습니다. 에이전트를 설정해주세요.', isStreaming: false })
      return
    }

    log.clearLog()
    setStatus('planning')
    setWorkflow(null)
    setActiveAgentId(planner.id)

    log.appendEntry({ kind: 'system', agentName: null, agentRole: null, text: `📋 플래너(${planner.name})가 업무 계획을 수립 중입니다...`, isStreaming: false })

    let planResponse
    try {
      planResponse = await planTask({
        taskDescription,
        agents: agents.map(a => ({ id: a.id, name: a.name, role: a.role, personality: a.personality })),
        plannerLLMConfig: planner.llmConfig,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      log.appendEntry({ kind: 'error', agentName: null, agentRole: null, text: `❌ 플래너 오류: ${msg}`, isStreaming: false })
      setStatus('error')
      setActiveAgentId(null)
      return
    }

    const newWorkflow: Workflow = {
      id: genId(),
      taskDescription,
      createdAt: Date.now(),
      steps: planResponse.steps.map(s => ({
        ...s,
        status: 'pending',
        output: '',
        startedAt: null,
        finishedAt: null,
      })),
    }

    setWorkflow(newWorkflow)
    setStatus('running')
    setActiveAgentId(null)

    log.appendEntry({ kind: 'planner', agentName: planner.name, agentRole: 'planner', text: `계획 수립 완료! ${newWorkflow.steps.length}개의 업무 단계가 생성되었습니다.`, isStreaming: false })
    newWorkflow.steps.forEach((s, i) => {
      const assignedAgent = agents.find(a => a.id === s.agentId)
      log.appendEntry({ kind: 'system', agentName: null, agentRole: null, text: `  ${i + 1}. ${s.description} → ${assignedAgent?.name ?? '?'}`, isStreaming: false })
    })

    await executeNextStep(newWorkflow, agents)
  }, [agents, status, log, executeNextStep])

  const resetWorkflow = useCallback(() => {
    setWorkflow(null)
    setStatus('idle')
    setActiveAgentId(null)
    log.clearLog()
  }, [log])

  return {
    agents, addAgent, updateAgent, removeAgent,
    workflow, status, activeAgentId,
    submitTask, resetWorkflow,
  }
}
