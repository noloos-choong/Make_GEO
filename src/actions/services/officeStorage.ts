import type { Agent } from '@/actions/hooks/useOffice'

const STORAGE_KEY = 'ai_office_agents'

export function loadAgents(): Agent[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Agent[]
  } catch {
    return null
  }
}

export function saveAgents(agents: Agent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agents))
  } catch {
    // localStorage 불가 환경 무시
  }
}
