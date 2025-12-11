/**
 * Fuzzy search relation utilities - comparison operators (<, >, range)
 */

import { logger } from '@/lib/logger';

/**
 * Check if string is a valid relation string (<10, >5, 8-10)
 */
export function isValidRelationStr(relationStr: string): boolean {
    const lessThanPattern = /^<\d+$/;
    const greaterThanPattern = /^>\d+$/;
    const rangePattern = /^\d+-\d+$/;

    return lessThanPattern.test(relationStr) ||
        greaterThanPattern.test(relationStr) ||
        rangePattern.test(relationStr);
}

/**
 * Check if number matches a single relation string
 */
function checkRelation(num: number, relationStr: string): boolean {
    const lessThanMatch = relationStr.match(/^<(\d+)$/);
    const greaterThanMatch = relationStr.match(/^>(\d+)$/);
    const rangeMatch = relationStr.match(/^(\d+)-(\d+)$/);

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

/**
 * Check if number matches any relation string in the list
 */
export function checkRelationList(num: number, relationStrList: string[]): boolean {
    for (let i = 0; i < relationStrList.length; i++) {
        try {
            if (checkRelation(num, relationStrList[i])) {
                return true;
            }
        } catch (e) {
            logger('fuzzySearch', "Invalid relation string format");
        }
    }
    return false;
}

