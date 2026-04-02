'use client'

import { useState, useEffect } from 'react'
import AgentSprite from './AgentSprite'
import type { AgentRole } from '@/actions/utils/pixelSprites'

// 씬 내 각 데스크 슬롯의 중심 위치 (%, 씬 컨테이너 기준)
// 3열 × 2행 그리드 배치와 일치
export const DESK_POSITIONS_PCT = [
  { x: 19, y: 50 },  // 0: 1행 1열
  { x: 50, y: 50 },  // 1: 1행 2열
  { x: 81, y: 50 },  // 2: 1행 3열
  { x: 19, y: 80 },  // 3: 2행 1열
  { x: 50, y: 80 },  // 4: 2행 2열
  { x: 81, y: 80 },  // 5: 2행 3열
]

interface WalkingCharacterProps {
  role: AgentRole
  fromPosition: number
  toPosition: number
  direction: 'left' | 'right'
}

export default function WalkingCharacter({
  role,
  fromPosition,
  toPosition,
  direction,
}: WalkingCharacterProps) {
  const from = DESK_POSITIONS_PCT[fromPosition] ?? { x: 50, y: 50 }
  const to   = DESK_POSITIONS_PCT[toPosition]   ?? { x: 50, y: 50 }

  // 처음엔 출발지 위치, 마운트 직후 목적지로 이동 (transition 발동)
  const [pos, setPos] = useState(from)

  useEffect(() => {
    const t = setTimeout(() => setPos(to), 50)
    return () => clearTimeout(t)
  }, [to.x, to.y])  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="absolute pointer-events-none z-30"
      style={{
        left: `${pos.x}%`,
        top:  `${pos.y}%`,
        transform: `translate(-50%, -110%) scaleX(${direction === 'left' ? -1 : 1})`,
        transition: 'left 1.4s ease-in-out, top 1.4s ease-in-out',
      }}
    >
      <AgentSprite role={role} animationState="walking" scale={3} />
    </div>
  )
}
