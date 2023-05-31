import * as path from 'path';
import { getJsonAndSave } from './downloader';
import {getCacheDirectory,getFileNameFromUrl} from './utils';

async function callAPIAndCacheResponse(url: string, cacheTime: number = 0): Promise<object> {
  const cacheDir = getCacheDirectory(url);
  const fileName = getFileNameFromUrl(url);
  const data = getJsonAndSave(url, cacheDir, fileName, cacheTime);
  return data;
}



export { callAPIAndCacheResponse };