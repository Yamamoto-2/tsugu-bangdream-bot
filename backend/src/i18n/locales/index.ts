/**
 * 语言包汇总导出
 */
import type { I18nDictionary, Language } from '../types';
import { zh } from './zh';
import { en } from './en';
import { ja } from './ja';

export const locales: Record<Language, I18nDictionary> = {
  zh,
  en,
  ja,
};
