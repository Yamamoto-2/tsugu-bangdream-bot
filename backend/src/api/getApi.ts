import { getJsonAndSave } from '@/api/downloader';
import { getCacheDirectory, getFileNameFromUrl } from '@/api/utils';
import { logger } from '@/logger';

async function callAPIAndCacheResponse(url: string, cacheTime: number = 0, retryCount: number = 3): Promise<object> {
  if (url.includes('hhwx.org/api/tracker/data')) {
    url = url.replace('hhwx.org/api/tracker/data', 'hhwx.org/api/bandori/tracker/data');  // HHWX数据源修复
  }
  const cacheDir = getCacheDirectory(url);
  const fileName = getFileNameFromUrl(url);
  //console.log('callAPIAndCacheResponse:',url,' cacheTime:',cacheTime)
  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      const data = await getJsonAndSave(url, cacheDir, fileName, cacheTime);
      return data;
    } catch (e) {
      if (e && e.response && e.response.status === 404) {
        // 当URL返回404错误后，不再重试，直接抛出错误。
        logger(`API`,`URL "${url}" returned 404 Not Found. No more retries will be made.`);
        throw e
      }
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
