import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

interface AgentInfo {
  id: string
  name: string
  role: string
  personality: string
}

interface PlanRequest {
  taskDescription: string
  agents: AgentInfo[]
  plannerLLMConfig: { provider: string; model: string; apiKey: string }
}

export async function POST(req: NextRequest) {
  let body: PlanRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식' }, { status: 400 })
  }

  const { taskDescription, agents, plannerLLMConfig } = body

  if (!taskDescription?.trim()) {
    return NextResponse.json({ error: '업무 설명이 필요합니다.' }, { status: 400 })
  }
  if (!plannerLLMConfig?.apiKey) {
    return NextResponse.json({ error: '플래너의 API 키가 설정되지 않았습니다.' }, { status: 400 })
  }

  // 플래너 제외한 실행 에이전트 목록
  const executableAgents = agents.filter(a => a.role !== 'planner')

  const agentRoster = executableAgents.map(a =>
    `- ID: "${a.id}", 이름: ${a.name}, 역할: ${a.role}, 퍼스널리티: ${a.personality}`
  ).join('\n')

  const systemPrompt = `당신은 프로젝트 플래너입니다. 주어진 업무를 분석하여 팀 에이전트들에게 작업을 배분하는 계획을 JSON 형식으로만 반환해야 합니다.

가용한 에이전트 목록:
${agentRoster || '(없음 - 단일 플래너 모드)'}

규칙:
1. 최대 6개 이하의 단계로 분할하세요.
2. 각 단계는 하나의 에이전트에게만 배정하세요.
3. 가용한 에이전트 ID만 사용하세요.
4. dependsOn에는 이전 단계의 id만 포함하세요 (직접 선행 단계만).
5. 설명은 한국어로 간결하게 작성하세요.
6. 반드시 JSON만 반환하고 다른 텍스트는 포함하지 마세요.

반환 형식:
{
  "steps": [
    { "id": "step_1", "description": "...", "agentId": "...", "dependsOn": [] },
    { "id": "step_2", "description": "...", "agentId": "...", "dependsOn": ["step_1"] }
  ]
}`

  const userMessage = `업무: ${taskDescription}`

  try {
    if (plannerLLMConfig.provider === 'anthropic') {
      const client = new Anthropic({ apiKey: plannerLLMConfig.apiKey })
      const response = await client.messages.create({
        model: plannerLLMConfig.model || 'claude-sonnet-4-6',
        max_tokens: 1024,
        temperature: 0.3,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return NextResponse.json({ error: `플래너 응답 파싱 실패: ${text}` }, { status: 500 })
      }
      const plan = JSON.parse(jsonMatch[0])

      // 에이전트 유효성 검사 및 폴백
      const agentIds = new Set(executableAgents.map(a => a.id))
      const validated = plan.steps?.map((s: { id: string; description: string; agentId: string; dependsOn: string[] }, i: number) => ({
        id: s.id || `step_${i + 1}`,
        description: s.description || `단계 ${i + 1}`,
        agentId: agentIds.has(s.agentId) ? s.agentId : (executableAgents[i % Math.max(executableAgents.length, 1)]?.id ?? agents[0]?.id),
        dependsOn: Array.isArray(s.dependsOn) ? s.dependsOn : [],
      })) ?? []

      return NextResponse.json({ steps: validated })

    } else {
      // OpenRouter
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${plannerLLMConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: plannerLLMConfig.model || 'openai/gpt-4o',
          temperature: 0.3,
          max_tokens: 1024,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        }),
      })
      const data = await response.json()
      const text = data.choices?.[0]?.message?.content ?? ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return NextResponse.json({ error: `플래너 응답 파싱 실패: ${text}` }, { status: 500 })
      }
      const plan = JSON.parse(jsonMatch[0])
      const agentIds = new Set(executableAgents.map(a => a.id))
      const validated = plan.steps?.map((s: { id: string; description: string; agentId: string; dependsOn: string[] }, i: number) => ({
        id: s.id || `step_${i + 1}`,
        description: s.description || `단계 ${i + 1}`,
        agentId: agentIds.has(s.agentId) ? s.agentId : (executableAgents[i % Math.max(executableAgents.length, 1)]?.id ?? agents[0]?.id),
        dependsOn: Array.isArray(s.dependsOn) ? s.dependsOn : [],
      })) ?? []
      return NextResponse.json({ steps: validated })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
