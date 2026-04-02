import { getSprite, getWalkFrames } from '@/actions/utils/pixelSprites'
import type { AgentRole, AnimationState } from '@/actions/utils/pixelSprites'
import clsx from 'clsx'

interface AgentSpriteProps {
  role: AgentRole
  animationState?: AnimationState
  scale?: number
  breatheDelay?: number   // idle 숨쉬기 딜레이 (ms)
  celebrate?: boolean     // 업무 완료 점프
}

export default function AgentSprite({
  role,
  animationState = 'idle',
  scale = 2,
  breatheDelay = 0,
  celebrate = false,
}: AgentSpriteProps) {

  // walking 이면 두 프레임을 겹쳐서 교대 표시
  if (animationState === 'walking') {
    const { walk1, walk2 } = getWalkFrames(role)
    return (
      <div className="relative flex flex-col items-center">
        <div style={{ position: 'relative', width: `${scale}px`, height: `${scale * 16}px` }}>
          {/* 프레임 A */}
          <div
            className="animate-walk-a absolute inset-0"
            style={{ width: `${scale}px`, height: `${scale}px`, boxShadow: walk1, imageRendering: 'pixelated' }}
          />
          {/* 프레임 B */}
          <div
            className="animate-walk-b absolute inset-0"
            style={{ width: `${scale}px`, height: `${scale}px`, boxShadow: walk2, imageRendering: 'pixelated' }}
          />
        </div>
      </div>
    )
  }

  const shadow = getSprite(role, animationState)

  const wrapClass = clsx(
    animationState === 'thinking' && 'animate-pixel-think',
    animationState === 'typing'   && 'animate-pixel-type',
    animationState === 'idle' && !celebrate && 'animate-idle-breathe',
    celebrate && 'animate-celebrate',
  )

  return (
    <div className="relative flex flex-col items-center">
      {/* 생각 말풍선 */}
      {animationState === 'thinking' && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-0.5 items-end">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="block w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      )}
      {/* 픽셀 아트 스프라이트 */}
      <div
        className={wrapClass}
        style={{
          width: `${scale}px`,
          height: `${scale}px`,
          boxShadow: shadow,
          imageRendering: 'pixelated',
          flexShrink: 0,
          animationDelay: animationState === 'idle' ? `${breatheDelay}ms` : undefined,
        }}
      />
    </div>
  )
}
