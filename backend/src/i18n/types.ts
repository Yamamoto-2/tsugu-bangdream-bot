/**
 * 支持的语言列表
 */
export type Language = 'zh' | 'en' | 'ja';

/**
 * 默认语言（用于 fallback）
 */
export const DEFAULT_LANGUAGE: Language = 'zh';

/**
 * 支持的语言列表（用于验证）
 */
export const SUPPORTED_LANGUAGES: readonly Language[] = ['zh', 'en', 'ja'];

/**
 * 翻译字典的递归类型
 */
export interface I18nDictionary {
  [key: string]: string | I18nDictionary;
}

/**
 * 插值参数类型
 */
export type I18nParams = Record<string, string | number>;
