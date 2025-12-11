/**
 * File cache utilities with ETag support
 * Handles reading/writing cache files and ETag files
 */

import * as path from 'path';
import * as fs from 'fs';

export interface CacheResult {
    data: Buffer;
    fromCache: boolean;
}

/**
 * Read cache file if it exists and is valid (within TTL)
 */
export function readCacheIfValid(
    cacheFilePath: string,
    ttlMs: number = 0
): Buffer | null {
    if (!fs.existsSync(cacheFilePath)) {
        return null;
    }

    // If ttlMs is 0, always use cache if exists
    if (ttlMs === 0) {
        return fs.readFileSync(cacheFilePath);
    }

    // Check if cache is still valid
    const stat = fs.statSync(cacheFilePath);
    const now = Date.now();
    if (now - stat.mtimeMs < ttlMs) {
        return fs.readFileSync(cacheFilePath);
    }

    return null;
}

/**
 * Read ETag from file if exists
 */
export function readETag(etagFilePath: string): string | undefined {
    if (!fs.existsSync(etagFilePath)) {
        return undefined;
    }
    return fs.readFileSync(etagFilePath, 'utf-8').trim();
}

/**
 * Write cache file and optionally ETag file
 */
export function writeCache(
    cacheFilePath: string,
    data: Buffer | string,
    etag?: string
): void {
    // Ensure directory exists
    const cacheDir = path.dirname(cacheFilePath);
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }

    // Write cache file
    if (typeof data === 'string') {
        fs.writeFileSync(cacheFilePath, data, 'utf-8');
    } else {
        fs.writeFileSync(cacheFilePath, data);
    }

    // Write ETag file if provided
    if (etag) {
        const etagFilePath = `${cacheFilePath}.etag`;
        fs.writeFileSync(etagFilePath, etag, 'utf-8');
    }
}

/**
 * Check if response is 304 Not Modified
 */
export function isNotModified(status: number): boolean {
    return status === 304;
}
