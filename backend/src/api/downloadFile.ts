import * as path from 'path';
import { assetsRootPath } from '../config';
import { getCacheDirectory, getFileNameFromUrl } from './utils';
import { download } from './downloader';
import { Buffer } from 'buffer';
import * as fs from 'fs';

const errUrl: string[] = [];

async function downloadFile(url: string, IgnoreErr: boolean = true, overwrite= false): Promise<Buffer> {
  try {
    if (errUrl.includes(url)) {
      throw new Error("downloadFile: errUrl.includes(url)");
    }
    const cacheTime = overwrite ? 0 : 1/0;
    const cacheDir = getCacheDirectory(url);
    const fileName = getFileNameFromUrl(url);
    const data = await download(url, cacheDir, fileName, cacheTime);
    if(data.toString().startsWith("<!DOCTYPE html>")){
      throw new Error("downloadFile: data.toString().startsWith(\"<!DOCTYPE html>\")");
    }
    return data
  } catch (e) {
    console.log(url)
    console.log(e)
    errUrl.push(url);
    if (url.includes('.png') && IgnoreErr) {
      return fs.readFileSync(path.join(assetsRootPath, 'err.png'));
    }
    throw e; // Rethrow the error if it is not related to handling the error case
  }
}

export { downloadFile };
