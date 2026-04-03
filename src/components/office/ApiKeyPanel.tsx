'use client'

import { useState } from 'react'
import clsx from 'clsx'
import { saveApiKey, deleteApiKey } from '@/actions/services/llmClient'

interface ApiKeyStatus {
  anthropic: boolean
  openrouter: boolean
}

interface ApiKeyPanelProps {
  status: ApiKeyStatus
  onStatusChange: (status: ApiKeyStatus) => void
}

const PROVIDERS = [
  {
    id: 'anthropic' as const,
    label: 'Anthropic (Claude)',
    placeholder: 'sk-ant-api03-...',
    docsHint: 'console.anthropic.com',
  },
  {
    id: 'openrouter' as const,
    label: 'OpenRouter',
    placeholder: 'sk-or-v1-...',
    docsHint: 'openrouter.ai/keys',
  },
]

export default function ApiKeyPanel({ status, onStatusChange }: ApiKeyPanelProps) {
  const [editing, setEditing] = useState<'anthropic' | 'openrouter' | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(provider: 'anthropic' | 'openrouter') {
    if (!inputValue.trim()) return
    setSaving(true)
    setError('')
    try {
      await saveApiKey(provider, inputValue.trim())
      onStatusChange({ ...status, [provider]: true })
      setEditing(null)
      setInputValue('')
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 실패')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(provider: 'anthropic' | 'openrouter') {
    await deleteApiKey(provider)
    onStatusChange({ ...status, [provider]: false })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        <h3 className="text-sm font-semibold text-gray-800">API 키 설정</h3>
        <span className="text-xs text-gray-400 ml-auto">서버에 안전하게 저장됩니다</span>
      </div>

      {PROVIDERS.map(p => (
        <div key={p.id} className="border border-gray-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-700">{p.label}</span>
            <div className="flex items-center gap-2">
              {status[p.id] ? (
                <>
                  <span className="flex items-center gap-1 text-xs text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    등록됨
                  </span>
                  <button
                    onClick={() => setEditing(p.id)}
                    className="text-xs text-brand-600 hover:underline"
                  >
                    변경
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    삭제
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setEditing(p.id); setInputValue(''); setError('') }}
                  className="text-xs text-brand-600 hover:underline"
                >
                  + 등록
                </button>
              )}
            </div>
          </div>

          {editing === p.id && (
            <div className="mt-2 space-y-2">
              <input
                type="password"
                className="input text-xs font-mono"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder={p.placeholder}
                onKeyDown={e => e.key === 'Enter' && handleSave(p.id)}
                autoFocus
              />
              <p className="text-[10px] text-gray-400">{p.docsHint} 에서 발급받을 수 있습니다.</p>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditing(null); setError('') }}
                  className="btn-secondary text-xs px-2.5 py-1"
                >
                  취소
                </button>
                <button
                  onClick={() => handleSave(p.id)}
                  disabled={saving || !inputValue.trim()}
                  className="btn-primary text-xs px-2.5 py-1 flex-1"
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <p className="text-[10px] text-gray-400 leading-relaxed">
        🔒 API 키는 HttpOnly 쿠키로 저장되어 JavaScript에서 접근할 수 없습니다.
        네트워크 요청에도 키 값이 노출되지 않습니다.
      </p>
    </div>
  )
}
