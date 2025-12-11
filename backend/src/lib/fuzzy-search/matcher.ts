/**
 * Fuzzy search matcher - matching logic for fuzzy search results
 */

import { isInteger, extractLvNumber, normalizeKeyword, parseKeywords } from './parser';
import { isValidRelationStr } from './relation';

export interface FuzzySearchConfig {
    [type: string]: { [key: string]: (string | number)[] };
}

export interface FuzzySearchResult {
    [key: string]: (string | number)[];
}

/**
 * Perform fuzzy search on keyword string with config
 */
export function fuzzySearch(keyword: string, config: FuzzySearchConfig): FuzzySearchResult {
    const keywordList = parseKeywords(keyword);
    const matches: { [key: string]: (string | number)[] } = {};

    for (const keyword_org of keywordList) {
        let matched = false;
        let keyword_normalized = normalizeKeyword(keyword_org);

        // Check if it's a pure integer
        if (isInteger(keyword_normalized)) {
            const num = parseInt(keyword_normalized, 10);
            if (!matches['_number']) {
                matches['_number'] = [];
            }
            matches['_number'].push(num);
            continue;
        }

        // Check if it's a level number (lv25)
        const lvNumber = extractLvNumber(keyword_normalized);
        if (lvNumber !== null) {
            if (!matches['songLevels']) {
                matches['songLevels'] = [];
            }
            matches['songLevels'].push(lvNumber);
            continue;
        }

        // Check if it's a relation string (<10, >5, 8-10)
        if (isValidRelationStr(keyword_normalized)) {
            if (!matches['_relationStr']) {
                matches['_relationStr'] = [];
            }
            matches['_relationStr'].push(keyword_normalized);
            continue;
        }

        // Match against config
        for (const type in config) {
            const typeConfig = config[type];
            for (const key in typeConfig) {
                const values = typeConfig[key];
                for (const value of values) {
                    if (typeof value === 'string') {
                        if (value === keyword_normalized) {
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
                        if (value.includes(keyword_normalized)) {
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
                        if (Object.keys(value).includes(keyword_normalized)) {
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

        // If no match found, add to _all
        if (!matched) {
            if (!matches['_all']) {
                matches['_all'] = [];
            }
            matches['_all'].push(keyword_org);
        }
    }

    return matches;
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

    for (const key in matches) {
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

        // Handle _number matches for numberTypeKey fields
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

    // Handle _all matches (fuzzy text search)
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

