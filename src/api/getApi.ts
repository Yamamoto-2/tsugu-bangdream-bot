import * as path from 'path';
import { cacheRootPath } from '../config';
import {getJsonAndSave} from './downloader';


async function callAPIAndCacheResponse(url: string,cacheTime:number = 0): Promise<object> {
  const cacheDir = path.join(cacheRootPath, path.dirname(url).replace(/^[^/]+:\/\/[^/]+\//, ''));
  const data = getJsonAndSave(url, cacheDir, path.basename(url), cacheTime);
  return data;
}

export { callAPIAndCacheResponse }