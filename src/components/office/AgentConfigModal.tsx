'use client'

import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { OFFICE_ROLES, LLM_PROVIDERS, DEFAULT_MODELS } from '@/config/constants'
import { DEFAULT_SYSTEM_PROMPT_TEMPLATE } from '@/config/officeDefaults'
import type { Agent, LLMConfig } from '@/actions/hooks/useOffice'
import type { AgentRole } from '@/actions/utils/pixelSprites'

interface AgentConfigModalProps {
  open: boolean
  agent: Agent | null
  existingPositions: number[]
  hasPlannerAlready: boolean
  apiKeyStatus: { anthropic: boolean; openrouter: boolean }
  onSave: (agent: Omit<Agent, 'id'> & { id?: string }) => void
  onDelete: (id: string) => void
  onClose: () => void
}

const EMPTY_LLM: LLMConfig = { provider: 'anthropic', model: DEFAULT_MODELS.anthropic }

export default function AgentConfigModal({
  open, agent, existingPositions, hasPlannerAlready, apiKeyStatus, onSave, onDelete, onClose,
}: AgentConfigModalProps) {
  const [name, setName] = useState('')
  const [role, setRole] = useState<AgentRole>('developer')
  const [personality, setPersonality] = useState('')
  const [llmConfig, setLlmConfig] = useState<LLMConfig>(EMPTY_LLM)
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT_TEMPLATE)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    if (agent) {
      setName(agent.name)
      setRole(agent.role)
      setPersonality(agent.personality)
      setLlmConfig(agent.llmConfig)
      setSystemPrompt(agent.systemPromptTemplate)
    } else {
      setName('')
      setRole('developer')
      setPersonality('')
      setLlmConfig(EMPTY_LLM)
      setSystemPrompt(DEFAULT_SYSTEM_PROMPT_TEMPLATE)
    }
    setShowPrompt(false)
  }, [agent, open])

  function handleProviderChange(provider: 'anthropic' | 'openrouter') {
    setLlmConfig(prev => ({ ...prev, provider, model: DEFAULT_MODELS[provider] }))
  }

  function handleSave() {
    if (!name.trim()) return
    const usedPositions = new Set(existingPositions)
    let deskPosition = agent?.deskPosition ?? -1
    if (deskPosition === -1) {
      for (let i = 0; i < 6; i++) {
        if (!usedPositions.has(i)) { deskPosition = i; break }
      }
    }
    if (deskPosition === -1) deskPosition = existingPositions.length
    onSave({
      ...(agent?.id ? { id: agent.id } : {}),
      name: name.trim(),
      role,
      personality: personality.trim(),
      systemPromptTemplate: systemPrompt,
      llmConfig,
      deskPosition,
      isPlanner: role === 'planner',
    })
    onClose()
  }

  const isNewPlanner = role === 'planner' && (!agent || !agent.isPlanner) && hasPlannerAlready
  const selectedProviderHasKey = apiKeyStatus[llmConfig.provider]

  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 bg-black/40 z-40 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />
      <div
        className={clsx(
          'fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            {agent ? '에이전트 편집' : '새 에이전트 추가'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 폼 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div>
            <label className="label">에이전트 이름</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="예: 개발자 철수" />
          </div>

          <div>
            <label className="label">역할</label>
            <select className="input" value={role} onChange={e => setRole(e.target.value as AgentRole)}>
              {OFFICE_ROLES.map(r => (
                <option key={r.id} value={r.id}>{r.emoji} {r.label}</option>
              ))}
            </select>
            {isNewPlanner && (
              <p className="mt-1 text-xs text-amber-600">⚠️ 이미 플래너가 있습니다. 기존 플래너는 일반 역할로 전환됩니다.</p>
            )}
          </div>

          <div>
            <label className="label">퍼스널리티 설명</label>
            <textarea
              className="input resize-none"
              rows={3}
              value={personality}
              onChange={e => setPersonality(e.target.value)}
              placeholder="예: 꼼꼼하고 분석적이며, 항상 데이터에 근거해 판단합니다."
            />
          </div>

          <div>
            <label className="label">LLM 제공자</label>
            <select
              className="input"
              value={llmConfig.provider}
              onChange={e => handleProviderChange(e.target.value as 'anthropic' | 'openrouter')}
            >
              {LLM_PROVIDERS.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            {/* API 키 상태 표시 */}
            <div className={clsx(
              'mt-1.5 flex items-center gap-1.5 text-xs',
              selectedProviderHasKey ? 'text-emerald-600' : 'text-amber-600',
            )}>
              <span>{selectedProviderHasKey ? '✓' : '⚠'}</span>
              {selectedProviderHasKey
                ? 'API 키 등록됨'
                : 'API 키 미설정 — 설정 패널에서 등록해주세요'}
            </div>
          </div>

          <div>
            <label className="label">모델</label>
            <input
              className="input"
              value={llmConfig.model}
              onChange={e => setLlmConfig(prev => ({ ...prev, model: e.target.value }))}
              placeholder={DEFAULT_MODELS[llmConfig.provider]}
            />
          </div>

          {/* 시스템 프롬프트 */}
          <div>
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
              onClick={() => setShowPrompt(v => !v)}
            >
              {showPrompt ? '▼' : '▶'} 시스템 프롬프트 커스터마이즈
            </button>
            {showPrompt && (
              <textarea
                className="input resize-none mt-2 font-mono text-xs"
                rows={8}
                value={systemPrompt}
                onChange={e => setSystemPrompt(e.target.value)}
              />
            )}
            <p className="mt-1 text-xs text-gray-400">
              변수: {'{{name}}'}, {'{{role}}'}, {'{{personality}}'}, {'{{task}}'}, {'{{step}}'}, {'{{context}}'}
            </p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-2">
          {agent && (
            <button onClick={() => { onDelete(agent.id); onClose() }} className="btn-secondary text-red-600 hover:bg-red-50">
              삭제
            </button>
          )}
          <button onClick={onClose} className="btn-secondary flex-1">취소</button>
          <button onClick={handleSave} disabled={!name.trim()} className="btn-primary flex-1">저장</button>
        </div>
      </div>
    </>
  )
}
