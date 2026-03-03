/**
 * Fuzzy Search — 前端本地实现
 * 从后端 lib/fuzzy-search 移植，无 Node.js 依赖
 */

// ========== Types ==========

export interface FuzzySearchConfig {
  [type: string]: { [key: string]: (string | number)[] }
}

export interface FuzzySearchResult {
  [key: string]: (string | number)[]
}

interface ParsedKeyword {
  text: string
  quoted: boolean
}

// ========== Parser ==========

function isInteger(str: string): boolean {
  return /^(0|[1-9]\d*)$/.test(str)
}

function extractLvNumber(str: string): number | null {
  const match = str.match(/^lv(\d+)$/i)
  return match?.[1] ? parseInt(match[1], 10) : null
}

function normalizeKeyword(keyword: string): string {
  return keyword
    .toLowerCase()
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/＞/g, '>')
    .replace(/＜/g, '<')
}

function isValidRelationStr(str: string): boolean {
  return /^<\d+$/.test(str) || /^>\d+$/.test(str) || /^\d+-\d+$/.test(str)
}

function parseKeywords(keyword: string): ParsedKeyword[] {
  const quoteChars = '"""『』「」'
  const regex = new RegExp(`[${quoteChars}]([^${quoteChars}]+)[${quoteChars}]|\\S+`, 'g')
  const raw = keyword.match(regex) || []

  return raw.map(item => {
    const stripRegex = new RegExp(`^[${quoteChars}]|[${quoteChars}]$`, 'g')
    const stripped = item.replace(stripRegex, '')
    const quoted = stripped !== item
    return { text: stripped, quoted }
  })
}

// ========== Core ==========

/**
 * 执行模糊搜索，返回多类型匹配字典
 */
export function fuzzySearch(keyword: string, config: FuzzySearchConfig): FuzzySearchResult {
  const keywordList = parseKeywords(keyword)
  const matches: { [key: string]: (string | number)[] } = {}

  for (const { text: keyword_org, quoted } of keywordList) {
    let matched = false
    const keyword_normalized = normalizeKeyword(keyword_org)

    // 纯数字
    if (isInteger(keyword_normalized)) {
      if (quoted) {
        // 引号包裹 → _all (文本子串搜索)
        if (!matches['_all']) matches['_all'] = []
        matches['_all'].push(keyword_org)
      } else {
        // 裸数字 → _number
        const num = parseInt(keyword_normalized, 10)
        if (!matches['_number']) matches['_number'] = []
        matches['_number'].push(num)
      }
      continue
    }

    // lv25 → songLevels
    const lvNumber = extractLvNumber(keyword_normalized)
    if (lvNumber !== null) {
      if (!matches['songLevels']) matches['songLevels'] = []
      matches['songLevels'].push(lvNumber)
      continue
    }

    // <10, >5, 8-10 → _relationStr
    if (isValidRelationStr(keyword_normalized)) {
      if (!matches['_relationStr']) matches['_relationStr'] = []
      matches['_relationStr'].push(keyword_normalized)
      continue
    }

    // 匹配 config
    for (const type in config) {
      const typeConfig = config[type]
      for (const key in typeConfig) {
        const values = typeConfig[key]
        for (const value of values) {
          if (typeof value === 'string' && value === keyword_normalized) {
            if (!matches[type]) matches[type] = []
            const numKey = isInteger(key) ? parseInt(key, 10) : key
            matches[type].push(numKey)
            matched = true
          }

          if (Array.isArray(value) && value.includes(keyword_normalized)) {
            if (!matches[type]) matches[type] = []
            const numKey = isInteger(key) ? parseInt(key, 10) : key
            matches[type].push(numKey)
            matched = true
          }

          if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).includes(keyword_normalized)) {
            if (!matches[type]) matches[type] = []
            const numKey = isInteger(key) ? parseInt(key, 10) : key
            matches[type].push(numKey)
            matched = true
          }
        }
      }
    }

    // 未匹配 → _all
    if (!matched) {
      if (!matches['_all']) matches['_all'] = []
      matches['_all'].push(keyword_org)
    }
  }

  return matches
}
