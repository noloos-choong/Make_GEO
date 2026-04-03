import type { Agent } from '@/actions/hooks/useOffice'

export interface PlanRequest {
  taskDescription: string
  agents: Array<{ id: string; name: string; role: string; personality: string }>
  plannerProvider: string
  plannerModel: string
  // API 키는 HttpOnly 쿠키로 자동 전송됩니다
}

export interface PlanStep {
  id: string
  description: string
  agentId: string
  dependsOn: string[]
}

export interface PlanResponse {
  steps: PlanStep[]
}

export interface ExecuteRequest {
  step: { id: string; description: string; agentId: string; dependsOn: string[] }
  agent: Omit<Agent, never>
  taskDescription: string
  previousOutputs: Record<string, string>
}

export async function planTask(req: PlanRequest): Promise<PlanResponse> {
  const res = await fetch('/api/office/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
    credentials: 'same-origin',  // 쿠키 자동 포함
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Planner API 오류: ${err}`)
  }
  return res.json()
}

export async function* streamExecute(req: ExecuteRequest): AsyncGenerator<string> {
  const res = await fetch('/api/office/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
    credentials: 'same-origin',  // 쿠키 자동 포함
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Execute API 오류: ${err}`)
  }
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()!
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const json = JSON.parse(line.slice(6))
        if (json.done) return
        if (json.delta) yield json.delta as string
      } catch { /* 무시 */ }
    }
  }
}

/** API 키 등록 */
export async function saveApiKey(provider: 'anthropic' | 'openrouter', apiKey: string): Promise<void> {
  const res = await fetch('/api/settings/apikeys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, apiKey }),
    credentials: 'same-origin',
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? '저장 실패')
  }
}

/** API 키 삭제 */
export async function deleteApiKey(provider: 'anthropic' | 'openrouter'): Promise<void> {
  await fetch('/api/settings/apikeys', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider }),
    credentials: 'same-origin',
  })
}

/** 등록된 API 키 여부 확인 (값 노출 없음) */
export async function getApiKeyStatus(): Promise<{ anthropic: boolean; openrouter: boolean }> {
  const res = await fetch('/api/settings/apikeys', { credentials: 'same-origin' })
  return res.json()
}
