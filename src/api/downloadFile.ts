import * as path from 'path';
import { cacheRootPath, assetsRootPath } from '../config';
import { download } from './downloader';
import { Buffer } from 'buffer'
import * as fs from 'fs'


async function downloadFile(url: string, IgnoreErr: boolean = true): Promise<Buffer> {
  if(!IgnoreErr){
    const cacheDir = path.join(cacheRootPath, path.dirname(url).replace(/^[^/]+:\/\/[^/]+\//, ''));
    const data = await download(url, cacheDir, path.basename(url), false);
    if (data instanceof Buffer) return data as Buffer;
    else throw new Error("downloadFile: data is not Buffer");
  }
  else{
    try {
      const cacheDir = path.join(cacheRootPath, path.dirname(url).replace(/^[^/]+:\/\/[^/]+\//, ''));
      const data = await download(url, cacheDir, path.basename(url), false);
      if (data instanceof Buffer) return data as Buffer;
      else throw new Error("downloadFile: data is not Buffer");
    }
    catch (e) {
      console.log(e)
      if (url.includes('.png')) {
        return (await fs.readFileSync(path.join(assetsRootPath, 'err.png')))
      }
    }
  }
}

export { downloadFile }