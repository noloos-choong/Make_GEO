import type { Agent } from '@/actions/hooks/useOffice'

export interface PlanRequest {
  taskDescription: string
  agents: Array<{ id: string; name: string; role: string; personality: string }>
  plannerLLMConfig: { provider: string; model: string; apiKey: string }
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
  agent: Agent
  taskDescription: string
  previousOutputs: Record<string, string>
}

export async function planTask(req: PlanRequest): Promise<PlanResponse> {
  const res = await fetch('/api/office/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
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
      } catch {
        // 파싱 실패 라인 무시
      }
    }
  }
}
