'use client'

import { useState, useEffect } from 'react'
import { useOffice } from '@/actions/hooks/useOffice'
import { useActivityLog } from '@/actions/hooks/useActivityLog'
import { getApiKeyStatus } from '@/actions/services/llmClient'
import OfficeScene from '@/components/office/OfficeScene'
import AgentConfigModal from '@/components/office/AgentConfigModal'
import ApiKeyPanel from '@/components/office/ApiKeyPanel'
import ActivityLog from '@/components/office/ActivityLog'
import TaskSubmitPanel from '@/components/office/TaskSubmitPanel'
import WorkflowStatusBar from '@/components/office/WorkflowStatusBar'
import type { Agent } from '@/actions/hooks/useOffice'

export default function OfficeView() {
  const log = useActivityLog()
  const {
    agents, addAgent, updateAgent, removeAgent,
    workflow, status, activeAgentId, walking,
    submitTask, resetWorkflow,
  } = useOffice(log)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<number>(0)
  const [showKeyPanel, setShowKeyPanel] = useState(false)
  const [apiKeyStatus, setApiKeyStatus] = useState({ anthropic: false, openrouter: false })

  // 마운트 시 API 키 등록 여부 확인
  useEffect(() => {
    getApiKeyStatus().then(setApiKeyStatus).catch(() => {})
  }, [])

  const hasAnyKey = apiKeyStatus.anthropic || apiKeyStatus.openrouter
  const isStreaming = log.entries.some(e => e.isStreaming)
  const hasPlannerAlready = agents.some(a => a.isPlanner)
  const existingPositions = agents.map(a => a.deskPosition)

  function openAddModal(position: number) {
    setEditingAgent(null)
    setSelectedPosition(position)
    setModalOpen(true)
  }

  function openEditModal(agentId: string) {
    const agent = agents.find(a => a.id === agentId)
    if (!agent) return
    setEditingAgent(agent)
    setModalOpen(true)
  }

  function handleDeskClick(agentId: string | null, position: number) {
    if (agentId) openEditModal(agentId)
    else openAddModal(position)
  }

  function handleSave(agentData: Omit<Agent, 'id'> & { id?: string }) {
    if (agentData.isPlanner) {
      agents.forEach(a => {
        if (a.isPlanner && a.id !== agentData.id) {
          updateAgent(a.id, { isPlanner: false, role: 'manager' })
        }
      })
    }
    if (agentData.id) updateAgent(agentData.id, agentData)
    else addAgent({ ...agentData, deskPosition: selectedPosition })
  }

  return (
    <div className="flex flex-col h-full">
      {/* API 키 미설정 배너 */}
      {!hasAnyKey && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 text-sm">⚠️</span>
            <p className="text-xs text-amber-700">
              API 키가 설정되지 않았습니다. 에이전트를 실행하려면 먼저 API 키를 등록해주세요.
            </p>
          </div>
          <button
            onClick={() => setShowKeyPanel(v => !v)}
            className="text-xs text-amber-700 font-medium underline hover:text-amber-900 ml-4 shrink-0"
          >
            {showKeyPanel ? '닫기' : 'API 키 설정 →'}
          </button>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div className="flex flex-1 overflow-hidden gap-4 p-4">
        {/* 왼쪽: 오피스 씬 */}
        <div className="flex-1 flex flex-col min-w-0 gap-3">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">AI 오피스</h2>
              <p className="text-xs text-gray-400">데스크를 클릭하여 에이전트를 추가하거나 편집하세요</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{agents.length}명 / 6명</span>
              {/* API 키 설정 버튼 */}
              <button
                onClick={() => setShowKeyPanel(v => !v)}
                className={`btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 ${showKeyPanel ? 'bg-brand-50 border-brand-300 text-brand-700' : ''}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                API 키
                {hasAnyKey && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </button>
              {agents.length < 6 && (
                <button onClick={() => openAddModal(agents.length)} className="btn-secondary text-xs px-2.5 py-1.5">
                  + 에이전트 추가
                </button>
              )}
            </div>
          </div>

          {/* API 키 설정 패널 (토글) */}
          {showKeyPanel && (
            <ApiKeyPanel status={apiKeyStatus} onStatusChange={setApiKeyStatus} />
          )}

          {/* 오피스 씬 */}
          <OfficeScene
            agents={agents}
            activeAgentId={activeAgentId}
            walking={walking}
            celebrating={status === 'done'}
            maxDesks={6}
            onDeskClick={handleDeskClick}
          />

          {/* 에이전트 빠른 정보 */}
          {agents.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {agents.map(agent => (
                <div
                  key={agent.id}
                  onClick={() => openEditModal(agent.id)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50 cursor-pointer transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-xs text-gray-700 truncate font-medium">{agent.name}</span>
                  {agent.isPlanner && <span className="text-[10px] text-amber-500 ml-auto">👑</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 오른쪽: 활동 로그 */}
        <div className="w-80 flex-shrink-0 card flex flex-col overflow-hidden">
          <WorkflowStatusBar steps={workflow?.steps ?? []} agents={agents} />
          <div className="flex-1 overflow-hidden">
            <ActivityLog entries={log.entries} isStreaming={isStreaming} />
          </div>
        </div>
      </div>

      {/* 하단: 태스크 제출 */}
      <TaskSubmitPanel
        status={status}
        onSubmit={submitTask}
        onReset={resetWorkflow}
      />

      {/* 에이전트 설정 모달 */}
      <AgentConfigModal
        open={modalOpen}
        agent={editingAgent}
        existingPositions={existingPositions}
        hasPlannerAlready={hasPlannerAlready}
        apiKeyStatus={apiKeyStatus}
        onSave={handleSave}
        onDelete={removeAgent}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
