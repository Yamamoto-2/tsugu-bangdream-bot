/**
 * File download with in-memory cache
 * Migrated from backend_old/src/api/downloadFileCache.ts
 */

import { downloadFile } from './downloadFile'

const cache: { [url: string]: Buffer } = {};

/**
 * Download file with in-memory caching
 */
async function downloadFileCache(url: string, IgnoreErr = true): Promise<Buffer> {
    if (cache[url]) {
        return cache[url];
    }
    const data = await downloadFile(url, IgnoreErr)
    cache[url] = data;
    return data;
}

export { downloadFileCache }

