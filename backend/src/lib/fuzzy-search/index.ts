/**
 * Fuzzy search module - unified API
 * Migrated from backend/src/utils/fuzzySearch.ts
 */

import * as fs from 'fs';
import { logger } from '@/lib/logger';
import { fuzzySearchPath } from '@/lib/config/runtime-loader';
import { fuzzySearch, match, FuzzySearchConfig, FuzzySearchResult } from './matcher';
import { checkRelationList } from './relation';
import { isFuzzySearchResult } from './validator';

/**
 * Load fuzzy search config from file
 */
function loadConfig(configPath?: string): FuzzySearchConfig {
    const path = configPath || fuzzySearchPath;
    const fileContent = fs.readFileSync(path, 'utf-8');
    logger('fuzzySearch', 'loaded fuzzy search config');
    return JSON.parse(fileContent);
}

// Export types
export type { FuzzySearchConfig, FuzzySearchResult };

// Export functions
export { fuzzySearch, match, checkRelationList, isFuzzySearchResult, loadConfig };

