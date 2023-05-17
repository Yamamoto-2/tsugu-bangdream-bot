import * as path from 'path';
import { cacheRootPath } from '../config';
import { download } from './downloader';
import { Buffer } from 'buffer'


async function downloadFile(url: string): Promise<Buffer> {
  const cacheDir = path.join(cacheRootPath, path.dirname(url).replace(/^[^/]+:\/\/[^/]+\//, ''));
  const data = await download(url, cacheDir, path.basename(url), false);
  if(data instanceof Buffer) return data as Buffer;
  else throw new Error("downloadFile: data is not Buffer");
}

export { downloadFile }