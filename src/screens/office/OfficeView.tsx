'use client'

import { useState } from 'react'
import { useOffice } from '@/actions/hooks/useOffice'
import { useActivityLog } from '@/actions/hooks/useActivityLog'
import OfficeScene from '@/components/office/OfficeScene'
import AgentConfigModal from '@/components/office/AgentConfigModal'
import ActivityLog from '@/components/office/ActivityLog'
import TaskSubmitPanel from '@/components/office/TaskSubmitPanel'
import WorkflowStatusBar from '@/components/office/WorkflowStatusBar'
import type { Agent } from '@/actions/hooks/useOffice'

export default function OfficeView() {
  const log = useActivityLog()
  const {
    agents, addAgent, updateAgent, removeAgent,
    workflow, status, activeAgentId,
    submitTask, resetWorkflow,
  } = useOffice(log)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<number>(0)

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
    if (agentId) {
      openEditModal(agentId)
    } else {
      openAddModal(position)
    }
  }

  function handleSave(agentData: Omit<Agent, 'id'> & { id?: string }) {
    // 플래너 역할 배정 시 기존 플래너 제거
    if (agentData.isPlanner) {
      agents.forEach(a => {
        if (a.isPlanner && a.id !== agentData.id) {
          updateAgent(a.id, { isPlanner: false, role: 'manager' })
        }
      })
    }
    if (agentData.id) {
      updateAgent(agentData.id, agentData)
    } else {
      addAgent({ ...agentData, deskPosition: selectedPosition })
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 상단 안내 배너 */}
      {agents.length > 0 && !agents.some(a => a.llmConfig.apiKey) && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
          <span className="text-amber-600 text-xs">⚠️</span>
          <p className="text-xs text-amber-700">
            에이전트의 API 키가 설정되지 않았습니다. 데스크를 클릭하여 API 키를 설정해주세요.
          </p>
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
              <span className="text-xs text-gray-500">
                {agents.length}명 / 6명
              </span>
              {agents.length < 6 && (
                <button
                  onClick={() => openAddModal(agents.length)}
                  className="btn-secondary text-xs px-2.5 py-1.5"
                >
                  + 에이전트 추가
                </button>
              )}
            </div>
          </div>

          {/* 오피스 씬 */}
          <OfficeScene
            agents={agents}
            activeAgentId={activeAgentId}
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
                  {!agent.llmConfig.apiKey && <span className="text-[10px] text-red-400 ml-auto" title="API 키 없음">⚠</span>}
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
        onSave={handleSave}
        onDelete={removeAgent}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
