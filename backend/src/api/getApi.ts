import { getJsonAndSave } from '@/api/downloader';
import { getCacheDirectory, getFileNameFromUrl } from '@/api/utils';
import { logger } from '@/logger';

async function callAPIAndCacheResponse(url: string, cacheTime: number = 0, retryCount: number = 3): Promise<object> {
  const cacheDir = getCacheDirectory(url);
  const fileName = getFileNameFromUrl(url);

  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      const data = await getJsonAndSave(url, cacheDir, fileName, cacheTime);
      return data;
    } catch (e) {
      logger(`API`, `Failed to get JSON from "${url}" on attempt ${attempt + 1}. Error: ${e.message}`);
      if (attempt === retryCount - 1) {
        throw e; // Rethrow the error if all retries fail
      }
      //等待3秒后重试
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  throw new Error(`Failed to get JSON from "${url}" after ${retryCount} attempts`);
}

export { callAPIAndCacheResponse };
