import * as path from 'path';
import { cacheRootPath } from '../config';
import { download } from './downloader';
import { Buffer } from 'buffer'


async function downloadFileAndCache(url: string): Promise<Buffer> {
  const cacheDir = path.join(cacheRootPath, path.dirname(url).replace(/^[^/]+:\/\/[^/]+\//, ''));
  const data = download(url, cacheDir, path.basename(url), false);
  /*
  if (isBuffer(data)) return data;
  else throw new Error("downloadFileAndCache: data is not a buffer")
  */
  return data;
}

function isBuffer(variable: any): boolean {
  return variable instanceof Buffer;
}

export { downloadFileAndCache }