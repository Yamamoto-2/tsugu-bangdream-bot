import * as fs from 'fs';
import { fuzzySearchPath } from '../config';
import { isInteger } from './utils'

interface Config {
  [type: string]: { [key: string]: string[] };
}

function loadConfig(): Config {
  const fileContent = fs.readFileSync(fuzzySearchPath, 'utf-8');
  console.log('loaded fuzzy search config');
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

export let config: Config = loadConfig();
//用于模糊搜索
export function fuzzySearch(keywordList: string[]): { [key: string]: string[] } {

  const matches: { [key: string]: string[] } = {};
  for (var keyword_org of keywordList) {
    //转换为小写
    let keyword = keyword_org.toLowerCase();
    //是否为数字
    if (isInteger(keyword)) {
      if (!matches.number) {
        matches.number = [];
      }
      matches.number.push(keyword);
      continue
    }
    //替换大于号小于号
    keyword = keyword.replace(/&gt;/g, '>');
    keyword = keyword.replace(/&lt;/g, '<');
    console.log(keyword)
    //是否为等级
    const lvNumber = extractLvNumber(keyword);
    if (lvNumber) {
      if (!matches.songLevels) {
        matches.songLevels = [];
      }
      matches.songLevels.push(lvNumber.toString());
      continue
    }
    //是否为_relationStr
    if (isValidRelationStr(keyword)) {
      if (!matches._relationStr) {
        matches._relationStr = [];
      }
      matches._relationStr.push(keyword);
      continue
    }
    //匹配配置文件
    for (const type in config) {
      const typeConfig = config[type];
      for (const key in typeConfig) {
        const values = typeConfig[key];
        for (const value of values) {
          //如果是字符串，直接匹配
          if (typeof value == 'string') {
            if (value == keyword) {
              if (!matches[type]) {
                matches[type] = [];
              }
              matches[type].push(key);
              continue;
            }
          }
          //如果是数组，匹配数组中的每一项
          if (Array.isArray(value)) {
            if (value.includes(keyword)) {
              if (!matches[type]) {
                matches[type] = [];
              }
              matches[type].push(key);
              continue;
            }
          }
          //如果是对象，匹配对象的每一个key
          if (typeof value == 'object') {
            if (Object.keys(value).includes(keyword)) {
              if (!matches[type]) {
                matches[type] = [];
              }
              matches[type].push(key);
              continue;
            }
          }
        }

      }
    }
    if (!matches.others) {
      matches.others = []
    }
    matches.others.push(keyword_org)
  }
  return matches;
}

export function match(matches: { [key: string]: string[] }, target: any, numberTypeKey: string[]): boolean {
  if (!target) {
    return false
  }
  if (Object.keys(matches).length == 0) {
    return true
  }
  let match = false
  for (var key in matches) {
    if (key == 'number') {
      continue
    }
    if (key == '_relationStr') {
      continue
    }
    if (key == 'others') {
      continue
    }
    if (target[key] != undefined) {
      //判断target[key]是否为array
      if (Array.isArray(target[key])) {
        let matchArray = false
        for (let i = 0; i < target[key].length; i++) {
          const element = target[key][i];
          if (matches[key].includes(element.toString())) {
            matchArray = true
            break
          }
        }
        if (matchArray) {
          match = true
          continue
        }
        else {
          match = false
          break
        }
      }
      else {
        if (matches[key].includes(target[key].toString())) {
          match = true
          continue
        }
        if (!matches[key].includes(target[key].toString())) {
          match = false
          break
        }
      }
    }
  }
  if (numberTypeKey.length > 0 && matches['number'] != undefined) {
    for (let i = 0; i < numberTypeKey.length; i++) {
      const key = numberTypeKey[i];
      if (target[key] != undefined) {
        if (!matches['number'].includes(target[key].toString())) {
          if (match)
            match = false
          break
        }
      }
    }
  }
  //如果在config中所有类型都不符合的情况下，检查others
  if (!match && matches.others) {
    for (let i = 0; i < matches.others.length; i++) {
      for (let key in target) {
        //如果是string
        if (typeof target[key] == 'string') {
          if (target[key].includes(matches.others[i])) {
            match = true
            break
          }
        }
        //如果是array
        if (Array.isArray(target[key])) {
          for (let j = 0; j < target[key].length; j++) {
            if (typeof target[key][j] == 'string') {
              if (target[key][j].includes(matches.others[i])) {
                match = true
                break
              }
            }
          }
        }
      }
    }
  }
  return match
}

//一下为数字与范围函数
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
    // 如果_relationStr的格式不符合上述任何一种，可以返回false或抛出错误
    throw new Error('Invalid relation string format');
  }

  // 如果_relationStrList的格式不符合上述任何一种，可以返回false或抛出错误
  for (let i = 0; i < _relationStrList.length; i++) {
    try {
      if (checkRelation(num, _relationStrList[i])) {
        return true
      }
    }
    catch (e) {
      console.log("Invalid relation string format")
    }
  }
  return false
}

function isValidRelationStr(_relationStr: string): boolean {
  const lessThanPattern = /^<\d+$/;
  const greaterThanPattern = /^>\d+$/;
  const rangePattern = /^\d+-\d+$/;

  return lessThanPattern.test(_relationStr) ||
    greaterThanPattern.test(_relationStr) ||
    rangePattern.test(_relationStr);
}
