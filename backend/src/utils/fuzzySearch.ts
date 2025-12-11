/**
 * Fuzzy search utility
 * Migrated from backend_old/src/fuzzySearch.ts
 * 
 * TODO: fuzzySearchPath should come from config/runtime.ts
 * TODO: isInteger should be moved to a shared utils file
 */

import * as fs from 'fs';
import { logger } from './logger';

/**
 * Check if string is an integer
 */
function isInteger(char: string): boolean {
    const regex = /^(0|[1-9]\d*)$/;
    return regex.test(char);
}

interface FuzzySearchConfig {
  [type: string]: { [key: string]: (string | number)[] };
}

/**
 * Load fuzzy search config from file
 * TODO: fuzzySearchPath should come from config/runtime.ts
 */
function loadConfig(fuzzySearchPath: string): FuzzySearchConfig {
  const fileContent = fs.readFileSync(fuzzySearchPath, 'utf-8');
  logger('fuzzySearch', 'loaded fuzzy search config');
  return JSON.parse(fileContent);
}

function extractLvNumber(str: string): number | null {
  const regex = /^lv(\d+)$/i;
  const match = str.match(regex);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
}

export interface FuzzySearchResult {
  [key: string]: (string | number)[];
}

/**
 * Validate if value is FuzzySearchResult
 */
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

/**
 * Perform fuzzy search
 * TODO: config should be loaded from config/runtime.ts
 */
export function fuzzySearch(keyword: string, config: FuzzySearchConfig): FuzzySearchResult {
  const keywordList = (keyword.match(/["""『』「」]([^"""『』「」]+)["""『』「」]|\S+/g) || []).map(item =>
    item.replace(/^[\"""『』「」]|[\"""『』「」]$/g, '')
  );

  console.log(keywordList)
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

/**
 * Match fuzzy search result against target object
 */
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

    if (target[key] !== undefined) {
      if (Array.isArray(target[key])) {
        let matchArray = false;
        for (let i = 0; i < target[key].length; i++) {
          const element = target[key][i];

          if (
            typeof element === 'string' &&
            matches[key].some((m: any) => typeof m === 'string' && m.toLowerCase() === element.toLowerCase())
          ) {
            matchArray = true;
            break;
          }

          if (
            typeof element === 'number' &&
            matches[key].some((m: any) => typeof m === 'number' && m === element)
          ) {
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
      else {
        if (
          typeof target[key] === 'string' &&
          matches[key].some((m: any) => typeof m === 'string' && m.toLowerCase() === target[key].toLowerCase())
        ) {
          match = true;
          continue;
        }

        if (
          typeof target[key] === 'number' &&
          matches[key].some((m: any) => typeof m === 'number' && m === target[key])
        ) {
          match = true;
          continue;
        }

        match = false;
        break;
      }
    }

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

  if (!match && matches['_all'] && Object.keys(matches).length == 1) {
    for (let i = 0; i < matches['_all'].length; i++) {
      let matchValue = matches['_all'][i];
      if (typeof matches['_all'][i] === 'string') {
        matchValue = (matches['_all'][i] as string).toLowerCase()
      }
      for (const key in target) {
        if (typeof target[key] === 'string') {
          if (target[key].toLowerCase().includes(matchValue as string)) {
            match = true;
            break;
          }
        }
        if (Array.isArray(target[key])) {
          for (let j = 0; j < target[key].length; j++) {
            if (typeof target[key][j] === 'string') {
              if (target[key][j].toLowerCase().includes(matchValue as string)) {
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

/**
 * Check if number matches relation string list
 */
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

