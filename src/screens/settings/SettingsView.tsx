'use client'

import { useState } from 'react'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import { useSettings } from '@/actions/hooks/useSettings'

export default function SettingsView() {
  const { settings, updateSettings, saving } = useSettings()
  const [showKey, setShowKey] = useState(false)

  return (
    <div className="space-y-6 max-w-2xl">
      {/* OpenRouter API */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-4">API 설정</h2>
        <div className="space-y-4">
          <div>
            <label className="label">OpenRouter API Key</label>
            <div className="flex gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                className="input"
                placeholder="sk-or-..."
                value={settings.openrouterKey}
                onChange={(e) => updateSettings({ openrouterKey: e.target.value })}
              />
              <Button
                variant="secondary"
                onClick={() => setShowKey((v) => !v)}
                className="shrink-0"
              >
                {showKey ? '숨기기' : '보기'}
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              OpenRouter에서 발급받은 API 키를 입력하세요.
            </p>
          </div>

          <div>
            <label className="label">기본 AI 모델</label>
            <select
              className="input"
              value={settings.defaultModel}
              onChange={(e) => updateSettings({ defaultModel: e.target.value })}
            >
              <option value="openai/gpt-4o">openai/gpt-4o</option>
              <option value="openai/gpt-4o-mini">openai/gpt-4o-mini</option>
              <option value="anthropic/claude-3.5-sonnet">anthropic/claude-3.5-sonnet</option>
              <option value="google/gemini-pro-1.5">google/gemini-pro-1.5</option>
              <option value="perplexity/llama-3.1-sonar-large-128k-online">perplexity/llama-3.1-sonar-large (online)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 분석 설정 */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-4">분석 설정</h2>
        <div className="space-y-4">
          <div>
            <label className="label">크롤링 주기</label>
            <select
              className="input"
              value={settings.crawlInterval}
              onChange={(e) => updateSettings({ crawlInterval: e.target.value })}
            >
              <option value="manual">수동</option>
              <option value="daily">매일</option>
              <option value="weekly">매주</option>
            </select>
          </div>

          <div>
            <label className="label">분석 대상 기본 엔진</label>
            <div className="flex gap-2 mt-1">
              {['ChatGPT', 'Perplexity', 'Google SGE'].map((engine) => {
                const active = settings.defaultEngines.includes(engine)
                return (
                  <button
                    key={engine}
                    type="button"
                    onClick={() => {
                      const next = active
                        ? settings.defaultEngines.filter((e) => e !== engine)
                        : [...settings.defaultEngines, engine]
                      updateSettings({ defaultEngines: next })
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      active
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-brand-400'
                    }`}
                  >
                    {engine}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* 저장 버튼 */}
      <Button loading={saving} onClick={() => updateSettings({})}>
        설정 저장
      </Button>
    </div>
  )
}
