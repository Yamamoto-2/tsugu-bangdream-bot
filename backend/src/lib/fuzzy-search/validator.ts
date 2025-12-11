/**
 * Fuzzy search validator - type validation utilities
 */

import { FuzzySearchResult } from './matcher';

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

