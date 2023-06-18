import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs';

const errUrl: string[] = [];

export async function download(url: string, directory?: string, fileName?: string, cacheTime = 0): Promise<Buffer> {
  try {
    if (errUrl.includes(url)) {
      throw new Error("downloadFile: errUrl.includes(url)");
    }

    const fileExists = directory && fileName && fs.existsSync(path.join(directory, fileName));
    if (fileExists && cacheTime > 0) {
      const cacheFilePath = path.join(directory, `${fileName}.cache`);
      const cacheStat = fs.statSync(cacheFilePath);
      const currentTime = new Date().getTime();
      const lastModifiedTime = new Date(cacheStat.mtime).getTime();
      const elapsedTime = currentTime - lastModifiedTime;
      if (elapsedTime < cacheTime * 1000) {
        const cachedData = fs.readFileSync(cacheFilePath);
        return cachedData;
      }
    }

    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const data = Buffer.from(response.data, 'binary');

    if (directory && fileName) {
      fs.writeFileSync(path.join(directory, fileName), data);
    }

    return data;
  } catch (e) {
    errUrl.push(url);
    if (url.includes('.png')) {
      throw e; // Rethrow the error for '.png' files, as specified in the original code
    } else {
      throw new Error(`Failed to download file from "${url}". Error: ${e.message}`);
    }
  }
}

export async function getJsonAndSave(url: string, directory?: string, fileName?: string, cacheTime = 0): Promise<object> {
  try {
    const fileBuffer = await download(url, directory, fileName, cacheTime);
    const fileContent = fileBuffer.toString('utf-8');
    const jsonObject = JSON.parse(fileContent);

    // Apply caching logic if cacheTime is provided and directory/fileName are specified
    if (cacheTime > 0 && directory && fileName) {
      const cacheFilePath = path.join(directory, `${fileName}.cache`);
      const cacheData = {
        timestamp: Date.now(),
        data: jsonObject
      };
      fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData));
    }

    return jsonObject;
  } catch (e) {
    throw new Error(`Failed to download and parse JSON file from "${url}". Error: ${e.message}`);
  }
}
