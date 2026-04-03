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
  // API 키는 HttpOnly 쿠키에 서버사이드로 저장됩니다 (클라이언트 노출 없음)
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

export interface WalkingState {
  agentId: string
  role: AgentRole
  fromPosition: number
  toPosition: number
  direction: 'left' | 'right'
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

function delay(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms))
}

const WALK_DURATION = 1600  // ms — WalkingCharacter transition(1.4s)보다 약간 길게

export function useOffice(log: LogCallbacks) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [status, setStatus] = useState<WorkflowStatus>('idle')
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [walking, setWalking] = useState<WalkingState | null>(null)

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
    setAgents(prev => [...prev, { ...agent, id: genId() }])
  }, [])

  const updateAgent = useCallback((id: string, patch: Partial<Agent>) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a))
  }, [])

  const removeAgent = useCallback((id: string) => {
    setAgents(prev => prev.filter(a => a.id !== id))
  }, [])

  // --- Workflow ---

  const executeNextStep = useCallback(async (currentWorkflow: Workflow, currentAgents: Agent[]) => {
    const doneIds = new Set(currentWorkflow.steps.filter(s => s.status === 'done').map(s => s.id))
    const next = currentWorkflow.steps.find(
      s => s.status === 'pending' && s.dependsOn.every(dep => doneIds.has(dep))
    )

    if (!next) {
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
      setWorkflow(prev => prev && {
        ...prev,
        steps: prev.steps.map(s => s.id === next.id ? { ...s, status: 'error' as const, output: '에이전트를 찾을 수 없습니다.' } : s),
      })
      log.appendEntry({ kind: 'error', agentName: null, agentRole: null, text: `⚠️ 스텝 "${next.description}"에 배정된 에이전트를 찾을 수 없습니다.`, isStreaming: false })
      return
    }

    // 스텝 시작
    setWorkflow(prev => prev && {
      ...prev,
      steps: prev.steps.map(s => s.id === next.id ? { ...s, status: 'running' as const, startedAt: Date.now() } : s),
    })
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
      }
      log.markStreamDone(entryId)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      log.markStreamDone(entryId)
      setWorkflow(prev => prev && {
        ...prev,
        steps: prev.steps.map(s => s.id === next.id ? { ...s, status: 'error' as const, output: msg, finishedAt: Date.now() } : s),
      })
      log.appendEntry({ kind: 'error', agentName: agent.name, agentRole: agent.role, text: `❌ 오류: ${msg}`, isStreaming: false })
      setStatus('error')
      setActiveAgentId(null)
      return
    }

    // 스텝 완료 처리
    const updatedSteps = currentWorkflow.steps.map(s =>
      s.id === next.id ? { ...s, status: 'done' as const, output, finishedAt: Date.now() } : s
    )
    const updatedWorkflow: Workflow = { ...currentWorkflow, steps: updatedSteps }
    setWorkflow(updatedWorkflow)
    log.appendEntry({ kind: 'step_done', agentName: agent.name, agentRole: agent.role, text: `✓ "${next.description}" 완료`, isStreaming: false })

    // 다음 실행 가능 스텝 확인
    const nextDoneIds = new Set(updatedSteps.filter(s => s.status === 'done').map(s => s.id))
    const nextStep = updatedSteps.find(
      s => s.status === 'pending' && s.dependsOn.every(dep => nextDoneIds.has(dep))
    )

    if (nextStep) {
      const nextAgent = currentAgents.find(a => a.id === nextStep.agentId)
      // 다른 에이전트에게 업무 이동 시 걷기 애니메이션
      if (nextAgent && nextAgent.id !== agent.id) {
        const fromCol = agent.deskPosition % 3
        const toCol   = nextAgent.deskPosition % 3
        const dir: 'left' | 'right' = toCol >= fromCol ? 'right' : 'left'
        setActiveAgentId(null)
        setWalking({
          agentId:      agent.id,
          role:         agent.role,
          fromPosition: agent.deskPosition,
          toPosition:   nextAgent.deskPosition,
          direction:    dir,
        })
        await delay(WALK_DURATION)
        setWalking(null)
        await delay(150)
      }
    }

    // 다음 스텝 실행
    setTimeout(() => executeNextStep(updatedWorkflow, currentAgents), 50)
  }, [log])

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
        plannerProvider: planner.llmConfig.provider,
        plannerModel:    planner.llmConfig.model,
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
        status: 'pending' as const,
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
    setWalking(null)
    log.clearLog()
  }, [log])

  return {
    agents, addAgent, updateAgent, removeAgent,
    workflow, status, activeAgentId, walking,
    submitTask, resetWorkflow,
  }
}
