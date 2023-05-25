import * as fs from 'fs';
import { fuzzySearchPath } from '../config';

interface Config {
  [type: string]: { [key: string]: string[] };
}

function loadConfig(): Config {
  const fileContent = fs.readFileSync(fuzzySearchPath, 'utf-8');
  return JSON.parse(fileContent);
}

var config: Config = loadConfig();
//用于模糊搜索
export function fuzzySearch( keywords: string[]): { [key: string]: string[] } {

  const matches: { [key: string]: string[] } = {};
  for (const keyword of keywords) {
    //匹配配置文件
    for (const type in config) {
      const typeConfig = config[type];
      for (const key in typeConfig) {
        const values = typeConfig[key];
        for (const value of values) {
          if (value ==keyword) {
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
