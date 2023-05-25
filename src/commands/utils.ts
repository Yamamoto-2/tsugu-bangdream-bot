import * as fs from 'fs';
import { fuzzySearchPath } from '../config';

interface Config {
  [key: string]: { [value: string]: string[] };
}

function loadConfig(): Config {
  const fileContent = fs.readFileSync(fuzzySearchPath, 'utf-8');
  return JSON.parse(fileContent);
}

loadConfig();

function parseRange(range: string): [number, number] {
  const parts = range.split('-');
  const start = Number(parts[0]);
  const end = Number(parts[1]);
  return [start, end];
}

function isInRange(value: number, range: string): boolean {
  if (range.includes('-')) {
    const [start, end] = parseRange(range);
    return value >= start && value <= end;
  } else if (range.startsWith('>')) {
    const rangeValue = Number(range.slice(1));
    return value > rangeValue;
  }
  return false;
}

export function findMatches(config: Config, keywords: string[]): { [key: string]: string[] } {
  const matches: { [key: string]: string[] } = {};

  for (const key in config) {
    const values = config[key];
    for (const valueKey in values) {
      const valueArr = values[valueKey];
      for (const keyword of keywords) {
        if (keyword in values) {
          if (!matches[key]) {
            matches[key] = [];
          }
          matches[key].push(...valueArr);
        } else if (keyword.includes('-') || keyword.startsWith('>')) {
          const keywordValue = Number(keyword);
          for (const value of valueArr) {
            if (isInRange(keywordValue, value)) {
              if (!matches[key]) {
                matches[key] = [];
              }
              matches[key].push(value);
            }
          }
        } else {
          for (const value of valueArr) {
            if (value.includes(keyword)) {
              if (!matches[key]) {
                matches[key] = [];
              }
              matches[key].push(value);
              break;
            }
          }
        }
      }
    }
  }

  return matches;
}
