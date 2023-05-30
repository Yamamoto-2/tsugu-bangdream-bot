import * as path from 'path';
import { cacheRootPath, assetsRootPath } from '../config';
import { download } from './downloader';
import { Buffer } from 'buffer'
import * as fs from 'fs'

const errUrl: string[] = [];

async function downloadFile(url: string, IgnoreErr: boolean = true): Promise<Buffer> {
  try {
    if (errUrl.includes(url)) {
      throw new Error("downloadFile: errUrl.includes(url)");
    }
    const cacheDir = path.join(cacheRootPath, path.dirname(url).replace(/^[^/]+:\/\/[^/]+\//, ''));
    const data = await download(url, cacheDir, path.basename(url), false);
    return data as Buffer;
  } catch (e) {
    errUrl.push(url);
    if (url.includes('.png') && IgnoreErr) {
      return fs.readFileSync(path.join(assetsRootPath, 'err.png'));
    }
    throw e; // Rethrow the error if it is not related to handling the error case
  }
}

export { downloadFile }