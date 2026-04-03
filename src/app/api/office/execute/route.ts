import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

interface WorkflowStep {
  id: string
  description: string
  agentId: string
  dependsOn: string[]
}

interface AgentLLMConfig {
  provider: string
  model: string
}

interface Agent {
  id: string
  name: string
  role: string
  personality: string
  systemPromptTemplate: string
  llmConfig: AgentLLMConfig
}

interface ExecuteRequest {
  step: WorkflowStep
  agent: Agent
  taskDescription: string
  previousOutputs: Record<string, string>
}

function getApiKey(req: NextRequest, provider: string): string | null {
  const name = provider === 'anthropic' ? 'office_anthropic_key' : 'office_openrouter_key'
  return req.cookies.get(name)?.value ?? null
}

function buildSystemPrompt(agent: Agent, step: WorkflowStep, taskDescription: string, previousOutputs: Record<string, string>): string {
  const contextLines = Object.values(previousOutputs).filter(Boolean).join('\n\n---\n\n')
  return agent.systemPromptTemplate
    .replace(/\{\{name\}\}/g, agent.name)
    .replace(/\{\{role\}\}/g, agent.role)
    .replace(/\{\{personality\}\}/g, agent.personality)
    .replace(/\{\{task\}\}/g, taskDescription)
    .replace(/\{\{step\}\}/g, step.description)
    .replace(/\{\{context\}\}/g, contextLines || '(이전 작업 결과 없음)')
}

function encodeSSE(data: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)
}

export async function POST(req: NextRequest) {
  let body: ExecuteRequest
  try {
    body = await req.json()
  } catch {
    return new Response('잘못된 요청 형식', { status: 400 })
  }

  const { step, agent, taskDescription, previousOutputs } = body
  const provider = agent.llmConfig.provider

  const apiKey = getApiKey(req, provider)
  if (!apiKey) {
    return new Response(
      `${provider === 'anthropic' ? 'Anthropic' : 'OpenRouter'} API 키가 설정되지 않았습니다. 설정에서 API 키를 등록해주세요.`,
      { status: 401 }
    )
  }

  const systemPrompt = buildSystemPrompt(agent, step, taskDescription, previousOutputs)

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (provider === 'anthropic') {
          const client = new Anthropic({ apiKey })
          const anthropicStream = client.messages.stream({
            model: agent.llmConfig.model || 'claude-sonnet-4-6',
            max_tokens: 2048,
            system: systemPrompt,
            messages: [{ role: 'user', content: `업무를 수행해주세요: ${step.description}` }],
          })
          for await (const event of anthropicStream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encodeSSE({ delta: event.delta.text, done: false }))
            }
          }
        } else {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: agent.llmConfig.model || 'openai/gpt-4o',
              max_tokens: 2048,
              stream: true,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `업무를 수행해주세요: ${step.description}` },
              ],
            }),
          })
          const reader = response.body!.getReader()
          const decoder = new TextDecoder()
          let buffer = ''
          while (true) {
            const { value, done } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop()!
            for (const line of lines) {
              if (!line.startsWith('data: ') || line === 'data: [DONE]') continue
              try {
                const chunk = JSON.parse(line.slice(6))
                const delta = chunk.choices?.[0]?.delta?.content
                if (delta) controller.enqueue(encodeSSE({ delta, done: false }))
              } catch { /* 무시 */ }
            }
          }
        }
        controller.enqueue(encodeSSE({ delta: '', done: true }))
        controller.close()
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        controller.enqueue(encodeSSE({ delta: `\n\n[오류: ${msg}]`, done: false }))
        controller.enqueue(encodeSSE({ delta: '', done: true }))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
