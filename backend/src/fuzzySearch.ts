import * as fs from 'fs';
import { fuzzySearchPath } from '@/config';
import { isInteger } from '@/routers/utils';
import { logger } from './logger';

interface FuzzySearchConfig {
  [type: string]: { [key: string]: (string | number)[] };
}

function loadConfig(): FuzzySearchConfig {
  const fileContent = fs.readFileSync(fuzzySearchPath, 'utf-8');
  logger('fuzzySearch', 'loaded fuzzy search config');
  return JSON.parse(fileContent);
}

function extractLvNumber(str: string): number | null {
  const regex = /^lv(\d+)$/;
  const match = str.match(regex);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
}

export let config: FuzzySearchConfig = loadConfig();

export interface FuzzySearchResult {
  [key: string]: (string | number)[];
}

// 自定义验证函数
export function isFuzzySearchResult(value: any): boolean {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  return Object.values(value).every(
    (arr) =>
      Array.isArray(arr) &&
      arr.every((item) => typeof item === 'string' || typeof item === 'number')
  );
}

export function fuzzySearch(keywordList: string[]): FuzzySearchResult {
  const matches: { [key: string]: (string | number)[] } = {};

  for (var keyword_org of keywordList) {
    let matched = false;
    let keyword = keyword_org.toLowerCase();

    if (isInteger(keyword)) {
      const num = parseInt(keyword, 10);
      if (!matches['_number']) {
        matches['_number'] = [];
      }
      matches['_number'].push(num);
      continue;
    }

    keyword = keyword.replace(/&gt;/g, '>');
    keyword = keyword.replace(/&lt;/g, '<');
    keyword = keyword.replace(/＞/g, '>');
    keyword = keyword.replace(/＜/g, '<');

    const lvNumber = extractLvNumber(keyword);
    if (lvNumber !== null) {
      if (!matches['songLevels']) {
        matches['songLevels'] = [];
      }
      matches['songLevels'].push(lvNumber);
      continue;
    }

    if (isValidRelationStr(keyword)) {
      if (!matches['_relationStr']) {
        matches['_relationStr'] = [];
      }
      matches['_relationStr'].push(keyword);
      continue;
    }

    for (const type in config) {
      const typeConfig = config[type];
      for (const key in typeConfig) {
        const values = typeConfig[key];
        for (const value of values) {
          if (typeof value === 'string') {
            if (value === keyword) {
              if (!matches[type]) {
                matches[type] = [];
              }
              const numKey = isInteger(key) ? parseInt(key, 10) : key;
              matches[type].push(numKey);
              matched = true;
              continue;
            }
          }

          if (Array.isArray(value)) {
            if (value.includes(keyword)) {
              if (!matches[type]) {
                matches[type] = [];
              }
              const numKey = isInteger(key) ? parseInt(key, 10) : key;
              matches[type].push(numKey);
              matched = true;
              continue;
            }
          }

          if (typeof value === 'object') {
            if (Object.keys(value).includes(keyword)) {
              if (!matches[type]) {
                matches[type] = [];
              }
              const numKey = isInteger(key) ? parseInt(key, 10) : key;
              matches[type].push(numKey);
              matched = true;
              continue;
            }
          }
        }
      }
    }

    if (!matched) {
      if (!matches['_all']) {
        matches['_all'] = [];
      }
      matches['_all'].push(keyword_org);
    }
  }
  return matches;
}

function isValidRelationStr(_relationStr: string): boolean {
  const lessThanPattern = /^<\d+$/;
  const greaterThanPattern = /^>\d+$/;
  const rangePattern = /^\d+-\d+$/;

  return lessThanPattern.test(_relationStr) ||
    greaterThanPattern.test(_relationStr) ||
    rangePattern.test(_relationStr);
}

export function match(matches: FuzzySearchResult, target: any, numberTypeKey: string[]): boolean {
  if (!target) {
    return false;
  }
  if (Object.keys(matches).length == 0) {
    return true;
  }
  let match = false;

  for (var key in matches) {
    if (key === '_number' || key === '_relationStr' || key === '_all') {
      continue;
    }
    // 匹配关键词
    if (target[key] !== undefined) {
      // 如果为Array类型
      if (Array.isArray(target[key])) {
        let matchArray = false;
        for (let i = 0; i < target[key].length; i++) {
          const element = target[key][i];
          if (matches[key].includes(element)) {
            matchArray = true;
            break;
          }
        }
        if (matchArray) {
          match = true;
          continue;
        } else {
          match = false;
          break;
        }
      }
      // 如果为Object (string, number) 类型
      else {
        if (matches[key].includes(target[key])) {
          match = true;
          continue;
        } else {
          match = false;
          break;
        }
      }
    }
    // 如果为指定的数字类型key，匹配数字
    if (numberTypeKey.length > 0 && matches['_number'] !== undefined) {
      if (numberTypeKey.includes(key)) {
        if (matches['_number'].includes(target[key])) {
          match = true;
          continue;
        } else {
          match = false;
          break;

        }
      }
    }

  }

  //如果在config中所有类型都不符合的情况下，检查 _all
  if (!match && matches['_all'] && Object.keys(matches).length == 1) {
    for (let i = 0; i < matches['_all'].length; i++) {
      for (let key in target) {
        if (typeof target[key] === 'string') {
          if (target[key].includes(matches['_all'][i] as string)) {
            match = true;
            break;
          }
        }
        if (Array.isArray(target[key])) {
          for (let j = 0; j < target[key].length; j++) {
            if (typeof target[key][j] === 'string') {
              if (target[key][j].includes(matches['_all'][i] as string)) {
                match = true;
                break;
              }
            }
          }
        }
      }
    }
  }

  return match;
}

// 以下为数字与范围函数
export function checkRelationList(num: number, _relationStrList: string[]): boolean {
  function checkRelation(num: number, _relationStr: string): boolean {
    const lessThanMatch = _relationStr.match(/^<(\d+)$/);
    const greaterThanMatch = _relationStr.match(/^>(\d+)$/);
    const rangeMatch = _relationStr.match(/^(\d+)-(\d+)$/);

    if (lessThanMatch) {
      const boundary = parseFloat(lessThanMatch[1]);
      return num < boundary;
    }

    if (greaterThanMatch) {
      const boundary = parseFloat(greaterThanMatch[1]);
      return num > boundary;
    }

    if (rangeMatch) {
      const lowerBoundary = parseFloat(rangeMatch[1]);
      const upperBoundary = parseFloat(rangeMatch[2]);
      return num >= lowerBoundary && num <= upperBoundary;
    }

    throw new Error('Invalid relation string format');
  }

  for (let i = 0; i < _relationStrList.length; i++) {
    try {
      if (checkRelation(num, _relationStrList[i])) {
        return true;
      }
    } catch (e) {
      logger('fuzzySearch', "Invalid relation string format");
    }
  }
  return false;
}

