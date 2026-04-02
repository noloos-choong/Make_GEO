import DeskSlot from './DeskSlot'
import type { AnimationState } from '@/actions/utils/pixelSprites'

interface Agent {
  id: string
  name: string
  role: 'planner' | 'developer' | 'designer' | 'writer' | 'analyst' | 'manager'
  isPlanner: boolean
  deskPosition: number
}

interface OfficeSceneProps {
  agents: Agent[]
  activeAgentId: string | null
  maxDesks?: number
  onDeskClick: (agentId: string | null, position: number) => void
}

export default function OfficeScene({ agents, activeAgentId, maxDesks = 6, onDeskClick }: OfficeSceneProps) {
  const slots = Array.from({ length: maxDesks }, (_, i) => {
    const agent = agents.find(a => a.deskPosition === i)
    return { position: i, agent }
  })

  function getAnimState(agent?: Agent): AnimationState {
    if (!agent) return 'idle'
    if (agent.id === activeAgentId) return 'thinking'
    return 'idle'
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-office-wall"
      style={{ backgroundColor: '#f0ebe0', minHeight: 320 }}>
      {/* 천장/벽 상단 */}
      <div className="w-full h-6 border-b-4" style={{ backgroundColor: '#d4c9b8', borderBottomColor: '#b8a89a' }} />

      {/* 바닥 패턴 */}
      <div className="absolute inset-0 top-6 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #8b7355 0px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #8b7355 0px, transparent 1px, transparent 40px)',
        }}
      />

      {/* 창문 */}
      <div className="absolute top-8 right-8 w-20 h-14 rounded-t-lg border-4 border-blue-200 overflow-hidden"
        style={{ backgroundColor: '#c8e8f8' }}>
        <div className="absolute inset-0 flex">
          <div className="flex-1 border-r border-blue-200" />
          <div className="flex-1" />
        </div>
        <div className="absolute top-1/2 w-full h-px bg-blue-200" />
      </div>

      {/* 화분 */}
      <div className="absolute top-8 left-6 flex flex-col items-center">
        <div className="w-4 h-6 rounded-sm" style={{ backgroundColor: '#2d7a3a' }}>
          <div className="w-3 h-3 rounded-full mx-auto -mt-2" style={{ backgroundColor: '#3a9a47' }} />
        </div>
        <div className="w-5 h-3 rounded-b" style={{ backgroundColor: '#8b5e3c' }} />
      </div>

      {/* 데스크 그리드 */}
      <div className="relative z-10 grid grid-cols-3 gap-x-4 gap-y-14 p-8 pt-14">
        {slots.map(({ position, agent }) => (
          <div key={position} className="flex justify-center">
            <DeskSlot
              agent={agent}
              animationState={getAnimState(agent)}
              isActive={!!agent && agent.id === activeAgentId}
              isEmpty={!agent}
              onClick={() => onDeskClick(agent?.id ?? null, position)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
