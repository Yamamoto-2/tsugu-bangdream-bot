import * as path from 'path';
import { cacheRootPath } from '../config';
import {download} from './downloader';


async function downloadFileAndCache(url: string): Promise<unknown> {
  const cacheDir = path.join(cacheRootPath, path.dirname(url).replace(/^[^/]+:\/\/[^/]+\//, ''));
  const data = download(url, cacheDir, path.basename(url), true);
  return data;
}

export { downloadFileAndCache }