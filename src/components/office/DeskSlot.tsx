import AgentSprite from './AgentSprite'
import { ROLE_COLORS, OFFICE_ROLES } from '@/config/constants'
import type { AgentRole, AnimationState } from '@/actions/utils/pixelSprites'
import clsx from 'clsx'

interface Agent {
  id: string
  name: string
  role: AgentRole
  isPlanner: boolean
}

interface DeskSlotProps {
  agent?: Agent
  animationState?: AnimationState
  isActive: boolean
  isEmpty?: boolean
  onClick: () => void
}

export default function DeskSlot({ agent, animationState = 'idle', isActive, isEmpty, onClick }: DeskSlotProps) {
  const roleLabel = agent ? (OFFICE_ROLES.find(r => r.id === agent.role)?.label ?? agent.role) : null
  const colors = agent ? ROLE_COLORS[agent.role] : null

  return (
    <div
      className={clsx(
        'relative flex flex-col items-center cursor-pointer select-none transition-transform duration-200',
        isActive && 'scale-105',
      )}
      onClick={onClick}
    >
      {/* 데스크 */}
      <div
        className={clsx(
          'relative w-28 rounded-lg border-2 transition-all duration-300',
          isActive
            ? 'border-brand-500 shadow-lg shadow-brand-500/30'
            : 'border-office-desk/50 shadow-md',
        )}
        style={{ backgroundColor: '#8b6914', borderBottomWidth: 6, borderBottomColor: '#6b4f10' }}
      >
        {/* 모니터 */}
        <div className="mx-auto mt-2 w-16 h-10 rounded-sm border border-gray-700 flex items-center justify-center"
          style={{ backgroundColor: '#1a1a2e' }}>
          {isEmpty ? (
            <span className="text-gray-600 text-xl font-bold">+</span>
          ) : (
            <div className="w-full h-full p-0.5">
              {isActive && (
                <div className="w-full h-full rounded-sm" style={{ backgroundColor: '#0d1117' }}>
                  <div className="h-1 w-3/4 mt-1 mx-auto rounded animate-pulse" style={{ backgroundColor: '#00ff41' }} />
                  <div className="h-1 w-1/2 mt-0.5 mx-auto rounded animate-pulse delay-75" style={{ backgroundColor: '#00ff41', opacity: 0.6 }} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* 키보드 */}
        {!isEmpty && (
          <div className="mx-auto mt-1 mb-2 w-14 h-2 rounded-sm border border-gray-600"
            style={{ backgroundColor: '#ccccdd' }} />
        )}

        {/* 스프라이트 (데스크 위) */}
        {agent && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2">
            <AgentSprite role={agent.role} animationState={animationState} scale={2} />
          </div>
        )}
      </div>

      {/* 이름/역할 라벨 */}
      <div className="mt-2 text-center min-h-[36px]">
        {isEmpty ? (
          <p className="text-xs text-gray-400 hover:text-brand-500 transition-colors">에이전트 추가</p>
        ) : agent ? (
          <>
            <p className="text-xs font-semibold text-gray-800 leading-tight">{agent.name}</p>
            <span className={clsx('text-[10px] px-1.5 py-0.5 rounded-full font-medium', colors?.bg, colors?.text)}>
              {roleLabel}{agent.isPlanner ? ' 👑' : ''}
            </span>
          </>
        ) : null}
      </div>

      {/* 활성 표시 링 */}
      {isActive && (
        <div className="absolute inset-0 rounded-lg border-2 border-brand-400 animate-ping opacity-30 pointer-events-none" />
      )}
    </div>
  )
}
