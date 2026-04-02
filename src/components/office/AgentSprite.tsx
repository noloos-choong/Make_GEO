import { getSprite } from '@/actions/utils/pixelSprites'
import type { AgentRole, AnimationState } from '@/actions/utils/pixelSprites'

interface AgentSpriteProps {
  role: AgentRole
  animationState?: AnimationState
  scale?: number
}

export default function AgentSprite({ role, animationState = 'idle', scale = 2 }: AgentSpriteProps) {
  const shadow = getSprite(role, animationState)

  const animClass =
    animationState === 'thinking' ? 'animate-pixel-think' :
    animationState === 'typing'   ? 'animate-pixel-type'  : ''

  return (
    <div className="relative flex flex-col items-center">
      {/* 생각 말풍선 */}
      {animationState === 'thinking' && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-0.5 items-end mb-1">
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
        className={animClass}
        style={{
          width: `${scale}px`,
          height: `${scale}px`,
          boxShadow: shadow,
          imageRendering: 'pixelated',
          flexShrink: 0,
        }}
      />
    </div>
  )
}
