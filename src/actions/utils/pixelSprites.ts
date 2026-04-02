export type AgentRole = 'planner' | 'developer' | 'designer' | 'writer' | 'analyst' | 'manager'
export type AnimationState = 'idle' | 'thinking' | 'typing'

// CSS box-shadow 픽셀 아트: [x, y, color] 튜플 배열
// 16×16 grid, scale=2 → 32×32px
type Pixel = [number, number, string]

function buildShadow(pixels: Pixel[], scale = 2): string {
  return pixels
    .map(([x, y, color]) => `${x * scale}px ${y * scale}px 0 0 ${color}`)
    .join(', ')
}

// 공통 몸체 (하얀 피부 + 역할별 옷)
function bodyPixels(shirtColor: string, hairColor: string, skinColor = '#fde8c8'): Pixel[] {
  return [
    // 머리카락
    [5,1,hairColor],[6,1,hairColor],[7,1,hairColor],[8,1,hairColor],[9,1,hairColor],[10,1,hairColor],
    [4,2,hairColor],[5,2,hairColor],[10,2,hairColor],[11,2,hairColor],
    [4,3,hairColor],[11,3,hairColor],
    // 얼굴
    [5,3,skinColor],[6,3,skinColor],[7,3,skinColor],[8,3,skinColor],[9,3,skinColor],[10,3,skinColor],
    [5,4,skinColor],[6,4,skinColor],[7,4,skinColor],[8,4,skinColor],[9,4,skinColor],[10,4,skinColor],
    // 눈
    [6,4,'#3a2d2d'],[9,4,'#3a2d2d'],
    // 입
    [7,5,skinColor],[8,5,skinColor],[7,5,'#e07070'],[8,5,'#e07070'],
    [5,5,skinColor],[6,5,skinColor],[9,5,skinColor],[10,5,skinColor],
    // 목
    [7,6,skinColor],[8,6,skinColor],
    // 몸통 (셔츠)
    [4,7,shirtColor],[5,7,shirtColor],[6,7,shirtColor],[7,7,shirtColor],[8,7,shirtColor],[9,7,shirtColor],[10,7,shirtColor],[11,7,shirtColor],
    [4,8,shirtColor],[5,8,shirtColor],[6,8,shirtColor],[7,8,shirtColor],[8,8,shirtColor],[9,8,shirtColor],[10,8,shirtColor],[11,8,shirtColor],
    [4,9,shirtColor],[5,9,shirtColor],[6,9,shirtColor],[7,9,shirtColor],[8,9,shirtColor],[9,9,shirtColor],[10,9,shirtColor],[11,9,shirtColor],
    // 팔
    [3,7,skinColor],[3,8,skinColor],[3,9,skinColor],[3,10,skinColor],
    [12,7,skinColor],[12,8,skinColor],[12,9,skinColor],[12,10,skinColor],
    // 손
    [2,10,skinColor],[3,11,skinColor],
    [13,10,skinColor],[12,11,skinColor],
    // 하체 (바지)
    [5,10,'#555577'],[6,10,'#555577'],[7,10,'#555577'],[8,10,'#555577'],[9,10,'#555577'],[10,10,'#555577'],
    [5,11,'#555577'],[6,11,'#555577'],[8,11,'#555577'],[9,11,'#555577'],
    // 다리
    [5,12,'#555577'],[6,12,'#555577'],[8,12,'#555577'],[9,12,'#555577'],
    [5,13,'#555577'],[6,13,'#555577'],[8,13,'#555577'],[9,13,'#555577'],
    // 발
    [5,14,'#333344'],[6,14,'#333344'],[8,14,'#333344'],[9,14,'#333344'],
  ]
}

// 노트북 (개발자, 분석가)
const laptopPixels: Pixel[] = [
  [4,11,'#aab'],[5,11,'#aab'],[6,11,'#aab'],[7,11,'#aab'],[8,11,'#ccddee'],[9,11,'#ccddee'],
  [4,12,'#889'],[5,12,'#889'],[6,12,'#889'],[7,12,'#889'],
]

// 연필 (작가)
const pencilPixels: Pixel[] = [
  [11,8,'#f5c518'],[11,9,'#f5c518'],[11,10,'#f5c518'],[11,11,'#ffeeaa'],
  [11,12,'#f5c518'],[11,13,'#e07030'],
]

// 역할별 스프라이트 데이터 생성
function makeSpriteData(role: AgentRole) {
  const configs: Record<AgentRole, { shirt: string; hair: string }> = {
    planner:   { shirt: '#1e40af', hair: '#3d2b1f' }, // navy + dark brown
    developer: { shirt: '#065f46', hair: '#1a1a2e' }, // dark green + black
    designer:  { shirt: '#7c3aed', hair: '#8b1a4a' }, // purple + dark pink
    writer:    { shirt: '#92400e', hair: '#704214' }, // brown + darker brown
    analyst:   { shirt: '#0369a1', hair: '#2d3a4a' }, // blue + dark slate
    manager:   { shirt: '#991b1b', hair: '#2c1810' }, // dark red + dark brown
  }
  const { shirt, hair } = configs[role]
  return bodyPixels(shirt, hair)
}

export interface SpriteRenderData {
  idle: string
  thinking: string
  typing: string
}

function buildRoleSprites(role: AgentRole): SpriteRenderData {
  const base = makeSpriteData(role)

  // thinking: 눈이 위를 봄 (눈 위치 변경)
  const thinkingBase = base.filter(([x, y]) => !(x === 6 && y === 4) && !(x === 9 && y === 4))
  const thinkingEyes: Pixel[] = [[6, 3, '#3a2d2d'], [9, 3, '#3a2d2d']]
  const thinking = [...thinkingBase, ...thinkingEyes]

  // typing: 팔이 앞으로 (y+1 이동)
  const typingBase = base.filter(([x]) => x !== 3 && x !== 12)
  const typingArms: Pixel[] = [
    [3, 8, '#fde8c8'], [3, 9, '#fde8c8'], [3, 10, '#fde8c8'],
    [12, 8, '#fde8c8'], [12, 9, '#fde8c8'], [12, 10, '#fde8c8'],
    [4, 11, '#aab'], [5, 11, '#aab'], [6, 11, '#aab'],
    [7, 11, '#aab'], [8, 11, '#aab'], [9, 11, '#aab'],
  ]
  const typing = [...typingBase, ...typingArms]

  return {
    idle:     buildShadow(base),
    thinking: buildShadow(thinking),
    typing:   buildShadow(typing),
  }
}

// 전체 6 역할 스프라이트 캐시
const SPRITE_CACHE: Partial<Record<AgentRole, SpriteRenderData>> = {}

export function getSprite(role: AgentRole, state: AnimationState): string {
  if (!SPRITE_CACHE[role]) {
    SPRITE_CACHE[role] = buildRoleSprites(role)
  }
  return SPRITE_CACHE[role]![state]
}

export const ROLES: AgentRole[] = ['planner', 'developer', 'designer', 'writer', 'analyst', 'manager']
