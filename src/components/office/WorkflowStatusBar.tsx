import clsx from 'clsx'
import type { WorkflowStep } from '@/actions/hooks/useOffice'

interface WorkflowStatusBarProps {
  steps: WorkflowStep[]
  agents: Array<{ id: string; name: string }>
}

const STEP_COLORS = {
  pending: 'bg-gray-100 text-gray-500 border-gray-200',
  running: 'bg-brand-50 text-brand-700 border-brand-300 animate-pulse',
  done:    'bg-emerald-50 text-emerald-700 border-emerald-300',
  error:   'bg-red-50 text-red-700 border-red-300',
}

const STEP_ICONS = { pending: '○', running: '◉', done: '✓', error: '✗' }

export default function WorkflowStatusBar({ steps, agents }: WorkflowStatusBarProps) {
  if (steps.length === 0) return null

  return (
    <div className="px-3 py-2 border-b border-gray-100">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">업무 진행 현황</p>
      <div className="flex flex-wrap gap-1.5">
        {steps.map((step, i) => {
          const agent = agents.find(a => a.id === step.agentId)
          return (
            <div
              key={step.id}
              className={clsx(
                'flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-medium transition-all duration-300',
                STEP_COLORS[step.status],
              )}
              title={`${step.description}${agent ? ` → ${agent.name}` : ''}`}
            >
              <span>{STEP_ICONS[step.status]}</span>
              <span className="max-w-[120px] truncate">
                {i + 1}. {step.description.length > 20 ? step.description.slice(0, 20) + '…' : step.description}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
