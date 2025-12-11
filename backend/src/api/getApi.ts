/**
 * Bestdori API caller with caching
 * Migrated from backend_old/src/api/getApi.ts
 */

import { getJsonAndSave } from './downloader';
import { getCacheDirectory, getFileNameFromUrl } from './utils';

/**
 * Logger function placeholder
 * TODO: Should use logger from utils/logger.ts
 */
function logger(type: string, message: any) {
    const requestTime = Date.now();
    const timeString = new Date(requestTime).toString().split(' ')[4];
    console.log(`[${timeString}] [${type}] ${message}`);
}

/**
 * Call Bestdori API and cache response
 * @param url API URL
 * @param cacheTime Cache time in seconds (0 = always fetch fresh, Infinity = use cache if exists)
 * @param retryCount Number of retry attempts
 * @param cacheRootPath Optional cache root path (will use default if not provided)
 */
async function callAPIAndCacheResponse(
    url: string, 
    cacheTime: number = 0, 
    retryCount: number = 3,
    cacheRootPath?: string
): Promise<object> {
  const cacheDir = getCacheDirectory(url, cacheRootPath);
  const fileName = getFileNameFromUrl(url);

  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      const data = await getJsonAndSave(url, cacheDir, fileName, cacheTime);
      return data;
    } catch (e: any) {
      logger(`API`, `Failed to get JSON from "${url}" on attempt ${attempt + 1}. Error: ${e.message}`);
      if (attempt === retryCount - 1) {
        throw e;
      }
      //等待3秒后重试
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  throw new Error(`Failed to get JSON from "${url}" after ${retryCount} attempts`);
}

export { callAPIAndCacheResponse };

