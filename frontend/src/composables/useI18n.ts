/**
 * 前端 i18n — 轻量翻译工具
 * 用于 sidebar、设置页等纯前端 UI 文字
 */

import { computed } from 'vue'
import { useSettings, type Language } from './useSettings'

const messages: Record<string, Record<Language, string>> = {
  // 导航分组
  'nav.info': { zh: '信息', en: 'Info', ja: '情報' },
  'nav.room': { zh: '房间', en: 'Room', ja: 'ルーム' },

  // 导航项
  'nav.event': { zh: '活动', en: 'Events', ja: 'イベント' },
  'nav.song': { zh: '歌曲', en: 'Songs', ja: '楽曲' },
  'nav.card': { zh: '卡牌', en: 'Cards', ja: 'カード' },
  'nav.character': { zh: '角色', en: 'Characters', ja: 'キャラ' },
  'nav.band': { zh: '乐队', en: 'Bands', ja: 'バンド' },
  'nav.gacha': { zh: '抽卡', en: 'Gacha', ja: 'ガチャ' },
  'nav.player': { zh: '玩家', en: 'Players', ja: 'プレイヤー' },
  'nav.roomList': { zh: '房间列表', en: 'Room List', ja: 'ルーム一覧' },
  'nav.settings': { zh: '设置', en: 'Settings', ja: '設定' },

  // 设置页
  'settings.title': { zh: '设置', en: 'Settings', ja: '設定' },
  'settings.language': { zh: '语言 / Language', en: 'Language', ja: '言語 / Language' },
  'settings.servers': { zh: '默认服务器', en: 'Default Servers', ja: 'デフォルトサーバー' },
  'settings.serversHint': {
    zh: '选择要显示的服务器（至少一个），排在第一位的为主服务器',
    en: 'Select servers to display (at least one). The first one is the primary server.',
    ja: '表示するサーバーを選択（1つ以上）。最初のサーバーがメインです。',
  },
  'settings.serverOrder': { zh: '当前顺序', en: 'Current order', ja: '現在の順序' },

  // 首次访问弹窗
  'welcome.title': { zh: '欢迎使用 Tsugu', en: 'Welcome to Tsugu', ja: 'Tsugu へようこそ' },
  'welcome.description': {
    zh: '请选择你的偏好设置，之后可在侧边栏"设置"中修改',
    en: 'Please choose your preferences. You can change them later in Settings.',
    ja: '設定を選択してください。後からサイドバーの「設定」で変更できます。',
  },
  'welcome.confirm': { zh: '开始使用', en: 'Get Started', ja: '始める' },

  // SearchView
  'search.comingSoon': { zh: '此功能即将上线', en: 'Coming soon', ja: '近日公開' },
  'search.retry': { zh: '重试', en: 'Retry', ja: '再試行' },
  'search.noResults': { zh: '没有匹配的结果', en: 'No matching results', ja: '一致する結果がありません' },
}

export function t(key: string, language: Language): string {
  return messages[key]?.[language] ?? key
}

export function useI18n() {
  const settings = useSettings()
  const language = computed(() => settings.language)

  function $t(key: string): string {
    return t(key, language.value)
  }

  return { $t, language }
}
