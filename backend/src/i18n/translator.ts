/**
 * 核心翻译器
 */
import type { Language, I18nParams, I18nDictionary } from './types';
import { DEFAULT_LANGUAGE } from './types';
import { locales } from './locales';

/**
 * 根据点分隔的 key 从字典中获取值
 * @param dict 翻译字典
 * @param key 点分隔的 key，如 'event.type.story'
 * @returns 翻译文本或 undefined
 */
function getNestedValue(dict: I18nDictionary, key: string): string | undefined {
  const keys = key.split('.');
  let value: unknown = dict;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as I18nDictionary)[k];
    } else {
      return undefined;
    }
  }

  return typeof value === 'string' ? value : undefined;
}

/**
 * 替换文本中的插值参数
 * @param text 包含 {param} 占位符的文本
 * @param params 参数对象
 * @returns 替换后的文本
 */
function interpolate(text: string, params: I18nParams): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return key in params ? String(params[key]) : match;
  });
}

/**
 * 翻译函数
 * @param key 翻译 key，如 'event.type.story' 或 'server.jp'
 * @param language 目标语言
 * @param params 可选的插值参数
 * @returns 翻译后的文本
 */
export function t(key: string, language: Language, params?: I18nParams): string {
  // 1. 尝试从目标语言获取
  let value = getNestedValue(locales[language], key);

  // 2. Fallback 到默认语言
  if (value === undefined && language !== DEFAULT_LANGUAGE) {
    value = getNestedValue(locales[DEFAULT_LANGUAGE], key);
  }

  // 3. 如果仍然找不到，返回 key 本身（便于调试）
  if (value === undefined) {
    console.warn(`[i18n] Missing translation: ${key} (${language})`);
    return key;
  }

  // 4. 处理插值参数
  if (params) {
    return interpolate(value, params);
  }

  return value;
}

/**
 * 创建绑定特定语言的翻译函数
 * @param language 目标语言
 * @returns 绑定语言的 t 函数
 */
export function createTranslator(language: Language) {
  return (key: string, params?: I18nParams) => t(key, language, params);
}

/**
 * 根据语言获取本地化的时间格式化选项
 */
export function getDateLocale(language: Language): string {
  const localeMap: Record<Language, string> = {
    zh: 'zh-CN',
    en: 'en-US',
    ja: 'ja-JP',
  };
  return localeMap[language];
}
