/**
 * File download wrapper with retry logic
 * Migrated from backend_old/src/api/downloadFile.ts
 * 
 * TODO: assetsRootPath and assetErrorImageBuffer should come from config/runtime.ts
 */

import * as path from 'path';
import { getCacheDirectory, getFileNameFromUrl } from './utils';
import { download } from './downloader';
import { Buffer } from 'buffer';
import * as fs from 'fs';

// 错误 URL 列表和错误缓存过期时间
const errUrl: { [key: string]: number } = {};
const ERROR_CACHE_EXPIRY = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Default error image buffer (1x1 transparent PNG)
 * TODO: Should be loaded from assets or config
 */
const DEFAULT_ERROR_BUFFER = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

/**
 * Download file with retry logic
 * TODO: assetErrorImageBuffer should come from config/runtime.ts
 */
async function downloadFile(
  url: string, 
  IgnoreErr: boolean = true, 
  overwrite = false, 
  retryCount = 3,
  assetErrorImageBuffer?: Buffer
): Promise<Buffer> {
  try {
    const currentTime = Date.now();
    if(url.includes('undefined')) {
      throw new Error("downloadFile: url.includes('undefined')");
    }

    if (errUrl[url] && currentTime - errUrl[url] < ERROR_CACHE_EXPIRY) {
      throw new Error("downloadFile: errUrl includes url and not expired");
    }

    const cacheTime = overwrite ? 0 : 1 / 0;
    const cacheDir = getCacheDirectory(url);
    const fileName = getFileNameFromUrl(url);

    for (let attempt = 0; attempt < retryCount; attempt++) {
      let assetNotExists = false;
      if (attempt > 0) {
        console.log(`Retrying download for "${url}" (attempt ${attempt + 1}/${retryCount})`);
      }
      try {
        const data = await download(url, cacheDir, fileName, cacheTime);
        if (data.toString().startsWith("<!DOCTYPE html>")) {
          fs.unlinkSync(path.join(cacheDir, fileName));
          assetNotExists = true;
          throw new Error("downloadFile: data.toString().startsWith(\"<!DOCTYPE html>\")");
        }
        return data;
      } catch (e: any) {
        if (attempt === retryCount - 1) {
          throw e;
        }
        if(assetNotExists){
          throw e;
        }
        //等待3秒后重试
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    throw new Error('Should not reach here');
  } catch (e: any) {
    console.error(`Failed to download file from "${url}". Error: ${e.message}`);

    if (e.message.includes('404')) {
      errUrl[url] = Date.now();
    }

    if ((url.includes('.png') || url.includes('.svg')) && IgnoreErr) {
      return assetErrorImageBuffer || DEFAULT_ERROR_BUFFER;
    }

    throw e;
  }
}

export { downloadFile };

