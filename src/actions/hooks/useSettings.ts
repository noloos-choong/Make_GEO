'use client'

import { useState, useCallback, useEffect } from 'react'

interface Settings {
  openrouterKey: string
  defaultModel: string
  crawlInterval: string
  defaultEngines: string[]
}

const DEFAULT_SETTINGS: Settings = {
  openrouterKey: '',
  defaultModel: 'openai/gpt-4o',
  crawlInterval: 'manual',
  defaultEngines: ['ChatGPT'],
}

const STORAGE_KEY = 'make-geo-settings'

/**
 * 설정 관리 훅
 * localStorage에 설정을 저장/불러옵니다.
 */
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)

  // 초기 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) })
      }
    } catch {
      // localStorage 사용 불가 시 기본값 유지
    }
  }, [])

  const updateSettings = useCallback(async (partial: Partial<Settings>) => {
    const next = { ...settings, ...partial }
    setSettings(next)

    setSaving(true)
    await new Promise((r) => setTimeout(r, 300))
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
    setSaving(false)
  }, [settings])

  return { settings, updateSettings, saving }
}
