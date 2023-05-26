import * as fs from 'fs';
import { fuzzySearchPath } from '../config';
import { isInteger } from './utils'

interface Config {
  [type: string]: { [key: string]: string[] };
}

function loadConfig(): Config {
  const fileContent = fs.readFileSync(fuzzySearchPath, 'utf-8');
  return JSON.parse(fileContent);
}

var config: Config = loadConfig();
//用于模糊搜索
export function fuzzySearch(keywords: string[]): { [key: string]: string[] } {

  const matches: { [key: string]: string[] } = {};
  for (const keyword of keywords) {
    if (isInteger(keyword)) {
      if (!matches.number) {
        matches.number = [];
      }
      matches.number.push(keyword);
    }
    //匹配配置文件
    for (const type in config) {
      const typeConfig = config[type];
      for (const key in typeConfig) {
        const values = typeConfig[key];
        for (const value of values) {
          if (value == keyword) {
            if (!matches[type]) {
              matches[type] = [];
            }
            matches[type].push(key);
          }
        }
      }
    }
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
  var match = false
  for (var key in matches) {
    if (key == 'number') {
      continue
    }
    if (target[key] != undefined) {
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
  if (numberTypeKey.length > 0) {
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
  return match
}

