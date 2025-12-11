/**
 * In-memory cache for downloaded files
 * Replaces backend/src/api/downloadFileCache.ts
 */

const cache: { [url: string]: Buffer } = {};

/**
 * Get cached buffer for URL
 */
export function getCached(url: string): Buffer | undefined {
    return cache[url];
}

/**
 * Set cached buffer for URL
 */
export function setCached(url: string, buffer: Buffer): void {
    cache[url] = buffer;
}

/**
 * Clear cache for specific URL
 */
export function clearCache(url?: string): void {
    if (url) {
        delete cache[url];
    } else {
        // Clear all
        Object.keys(cache).forEach(key => delete cache[key]);
    }
}

