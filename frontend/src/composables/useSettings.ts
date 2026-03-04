/**
 * 用户设置 Composable
 * 响应式状态 + localStorage 持久化
 */

import { reactive, watch } from 'vue'

export type Language = 'zh' | 'en' | 'ja'

export interface UserSettings {
  displayedServerList: number[]
  language: Language
  initialized: boolean
}

const STORAGE_KEY = 'tsugu-settings'

function detectLanguage(): Language {
  const lang = navigator.language.toLowerCase()
  if (lang.startsWith('zh')) return 'zh'
  if (lang.startsWith('ja')) return 'ja'
  return 'en'
}

function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        displayedServerList: parsed.displayedServerList ?? [3, 0],
        language: parsed.language ?? detectLanguage(),
        initialized: parsed.initialized ?? false,
      }
    }
  } catch {
    // ignore parse errors
  }
  return {
    displayedServerList: [3, 0],
    language: detectLanguage(),
    initialized: false,
  }
}

const settings = reactive<UserSettings>(loadSettings())

watch(
  () => ({ ...settings }),
  (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  },
  { deep: true }
)

export function useSettings() {
  return settings
}
